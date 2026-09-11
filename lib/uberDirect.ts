import dbConnect from "@/lib/db";
import { SiteConfig } from "@/lib/models/SiteConfig";

// Tipos para Uber Direct
export interface UberDirectCredentials {
  clientId: string;
  clientSecret: string;
  customerId: string;
  env: "sandbox" | "production";
}

export interface UberDeliveryQuoteParams {
  dropoffAddress: string;
  dropoffPhone?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  orderTotal?: number;
}

export interface UberCreateDeliveryParams {
  orderId: string;
  customerName: string;
  customerPhone: string;
  dropoffAddress: string;
  dropoffLat?: number;
  dropoffLng?: number;
  cardMessage?: string;
  items?: Array<{ name: string; price: number; quantity: number }>;
  specialInstructions?: string;
  quoteId?: string;
}

// Caché de Token en memoria
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtiene las credenciales activas de Uber Direct desde variables de entorno o SiteConfig (MongoDB)
 */
export async function getUberDirectCredentials(): Promise<UberDirectCredentials | null> {
  const envClientId = process.env.UBER_DIRECT_CLIENT_ID;
  const envClientSecret = process.env.UBER_DIRECT_CLIENT_SECRET;
  const envCustomerId = process.env.UBER_DIRECT_CUSTOMER_ID;
  const envMode = (process.env.UBER_DIRECT_ENV || "sandbox") as "sandbox" | "production";

  if (envClientId && envClientSecret && envCustomerId) {
    return {
      clientId: envClientId.trim(),
      clientSecret: envClientSecret.trim(),
      customerId: envCustomerId.trim(),
      env: envMode
    };
  }

  try {
    await dbConnect();
    const config: any = await SiteConfig.findOne({ key: "global" }).lean();
    if (config?.uberDirectClientId && config?.uberDirectClientSecret && config?.uberDirectCustomerId) {
      return {
        clientId: config.uberDirectClientId.trim(),
        clientSecret: config.uberDirectClientSecret.trim(),
        customerId: config.uberDirectCustomerId.trim(),
        env: config.uberDirectEnv || "sandbox"
      };
    }
  } catch (error) {
    console.error("Error al obtener credenciales de Uber Direct de BD:", error);
  }

  return null;
}

/**
 * Obtiene un token de acceso OAuth 2.0 válido de Uber
 */
export async function getUberAuthToken(): Promise<string | null> {
  const credentials = await getUberDirectCredentials();
  if (!credentials) return null;

  // Si tenemos un token válido en caché (con al menos 2 minutos de margen), usarlo
  if (cachedToken && Date.now() < cachedToken.expiresAt - 120000) {
    return cachedToken.token;
  }

  try {
    const params = new URLSearchParams();
    params.append("client_id", credentials.clientId);
    params.append("client_secret", credentials.clientSecret);
    params.append("grant_type", "client_credentials");
    params.append("scope", "eats.deliveries");

    const res = await fetch("https://login.uber.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Error al autenticar con Uber OAuth:", res.status, errBody);
      return null;
    }

    const data = await res.json();
    if (data.access_token) {
      cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000
      };
      return data.access_token;
    }
  } catch (error) {
    console.error("Fallo de red al solicitar token de Uber:", error);
  }

  return null;
}

/**
 * Obtiene la dirección y datos de la boutique física (Pickup)
 */
export async function getBoutiquePickupInfo() {
  let address = "6705 Fairway Dr, Houston, TX 77087";
  let phone = "+18005553569";
  let name = "Flowers For You LLC";

  try {
    await dbConnect();
    const config: any = await SiteConfig.findOne({ key: "global" }).lean();
    if (config?.businessAddress && config?.businessCity) {
      address = `${config.businessAddress}, ${config.businessCity}`;
    }
    if (config?.businessPhone) {
      phone = config.businessPhone.replace(/[^\d+]/g, "");
    }
    if (config?.businessName) {
      name = config.businessName;
    }
  } catch (e) {}

  return { address, phone, name };
}

/**
 * Cotiza un envío en tiempo real con Uber Direct
 */
export async function getUberDeliveryQuote(params: UberDeliveryQuoteParams) {
  const credentials = await getUberDirectCredentials();
  if (!credentials) {
    return { success: false, error: "Uber Direct no está configurado." };
  }

  const token = await getUberAuthToken();
  if (!token) {
    return { success: false, error: "No se pudo obtener autenticación con Uber Direct." };
  }

  const boutique = await getBoutiquePickupInfo();

  try {
    const quotePayload: any = {
      pickup_address: JSON.stringify({
        street_address: [boutique.address.split(",")[0] || "6705 Fairway Dr"],
        city: "Houston",
        state: "TX",
        zip_code: "77087",
        country: "US"
      }),
      dropoff_address: params.dropoffAddress
    };

    if (params.dropoffPhone) {
      quotePayload.dropoff_phone_number = params.dropoffPhone;
    }

    const res = await fetch(`https://api.uber.com/v1/customers/${credentials.customerId}/delivery_quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(quotePayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Uber Direct Quote Error:", res.status, errText);
      return { success: false, error: `Error de cotización Uber (${res.status}): ${errText}` };
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        quoteId: data.id,
        fee: data.fee ? data.fee / 100 : 0, // Uber retorna en centavos
        currency: data.currency || "USD",
        durationMinutes: data.duration ? Math.round(data.duration / 60) : 45,
        dropoffEta: data.dropoff_eta ? new Date(data.dropoff_eta) : new Date(Date.now() + 45 * 60000),
        raw: data
      }
    };
  } catch (error: any) {
    console.error("Error al cotizar con Uber Direct:", error);
    return { success: false, error: error.message || "Error de conexión con Uber" };
  }
}

/**
 * Despacha un repartidor de Uber Direct para una orden
 */
export async function createUberDelivery(params: UberCreateDeliveryParams) {
  const credentials = await getUberDirectCredentials();
  if (!credentials) {
    return { success: false, error: "Uber Direct no está configurado." };
  }

  const token = await getUberAuthToken();
  if (!token) {
    return { success: false, error: "Error de autenticación con Uber Direct." };
  }

  const boutique = await getBoutiquePickupInfo();

  try {
    const manifestItems = (params.items && params.items.length > 0)
      ? params.items.map(item => ({
          name: `${item.name} (${item.quantity}x)`,
          quantity: item.quantity,
          price: Math.round(item.price * 100),
          dimensions: { length: 30, height: 40, depth: 30 },
          must_be_upright: true
        }))
      : [{
          name: `Arreglo Floral de Lujo - Pedido #${params.orderId}`,
          quantity: 1,
          price: 5000,
          must_be_upright: true
        }];

    const deliveryPayload: any = {
      pickup_name: boutique.name,
      pickup_address: JSON.stringify({
        street_address: [boutique.address.split(",")[0] || "6705 Fairway Dr"],
        city: "Houston",
        state: "TX",
        zip_code: "77087",
        country: "US"
      }),
      pickup_phone_number: boutique.phone.startsWith("+") ? boutique.phone : `+1${boutique.phone}`,
      pickup_instructions: "Recoger arreglo floral en mostrador de boutique Flowers For You LLC. Manejar con mucho cuidado.",

      dropoff_name: params.customerName,
      dropoff_address: params.dropoffAddress,
      dropoff_phone_number: params.customerPhone.startsWith("+") ? params.customerPhone : `+1${params.customerPhone.replace(/\D/g, '')}`,
      dropoff_instructions: params.specialInstructions || (params.cardMessage ? `Mensaje de entrega: ${params.cardMessage}` : "Entregar arreglo floral en mano o en puerta."),

      manifest_reference: params.orderId,
      manifest_items: manifestItems,
      test_specifications: credentials.env === "sandbox" ? {
        robo_courier_specification: {
          mode: "auto"
        }
      } : undefined
    };

    if (params.quoteId) {
      deliveryPayload.quote_id = params.quoteId;
    }

    const res = await fetch(`https://api.uber.com/v1/customers/${credentials.customerId}/deliveries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(deliveryPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Error al crear delivery en Uber Direct:", res.status, errText);
      return { success: false, error: `Error Uber (${res.status}): ${errText}` };
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        deliveryId: data.id,
        trackingUrl: data.tracking_url || "",
        status: data.status || "pending",
        fee: data.fee ? data.fee / 100 : 0,
        courier: data.courier ? {
          name: data.courier.name || "",
          phone: data.courier.phone_number || "",
          vehicle: `${data.courier.vehicle_type || ''} ${data.courier.make || ''} ${data.courier.model || ''}`.trim(),
          img: data.courier.img_href || "",
          location: data.courier.location ? {
            lat: data.courier.location.lat,
            lng: data.courier.location.lng
          } : undefined
        } : undefined,
        dropoffEta: data.dropoff_eta ? new Date(data.dropoff_eta) : undefined,
        raw: data
      }
    };
  } catch (error: any) {
    console.error("Excepción al despachar con Uber Direct:", error);
    return { success: false, error: error.message || "Error desconocido al despachar con Uber" };
  }
}

/**
 * Consulta el estado en vivo de un despacho de Uber Direct
 */
export async function getUberDeliveryStatus(deliveryId: string) {
  const credentials = await getUberDirectCredentials();
  if (!credentials) return { success: false, error: "Credenciales de Uber no configuradas." };

  const token = await getUberAuthToken();
  if (!token) return { success: false, error: "No se pudo autenticar con Uber." };

  try {
    const res = await fetch(`https://api.uber.com/v1/customers/${credentials.customerId}/deliveries/${deliveryId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Error (${res.status}): ${errText}` };
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        deliveryId: data.id,
        status: data.status,
        trackingUrl: data.tracking_url,
        fee: data.fee ? data.fee / 100 : 0,
        courier: data.courier ? {
          name: data.courier.name,
          phone: data.courier.phone_number,
          vehicle: `${data.courier.vehicle_type || ''} ${data.courier.make || ''} ${data.courier.model || ''}`.trim(),
          img: data.courier.img_href,
          location: data.courier.location ? {
            lat: data.courier.location.lat,
            lng: data.courier.location.lng
          } : undefined
        } : undefined,
        dropoffEta: data.dropoff_eta ? new Date(data.dropoff_eta) : undefined
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancela una entrega activa de Uber Direct
 */
export async function cancelUberDelivery(deliveryId: string, reason?: string) {
  const credentials = await getUberDirectCredentials();
  if (!credentials) return { success: false, error: "Credenciales de Uber no configuradas." };

  const token = await getUberAuthToken();
  if (!token) return { success: false, error: "Error de autenticación con Uber." };

  try {
    const res = await fetch(`https://api.uber.com/v1/customers/${credentials.customerId}/deliveries/${deliveryId}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reason: reason || "Canceled by store admin"
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `No se pudo cancelar (${res.status}): ${errText}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Prueba la conexión con Uber Direct y valida las credenciales
 */
export async function testUberDirectConnection(overrideCreds?: UberDirectCredentials) {
  const credentials = overrideCreds || await getUberDirectCredentials();
  if (!credentials || !credentials.clientId || !credentials.clientSecret || !credentials.customerId) {
    return { success: false, message: "Por favor ingresa Client ID, Client Secret y Customer ID." };
  }

  try {
    const params = new URLSearchParams();
    params.append("client_id", credentials.clientId);
    params.append("client_secret", credentials.clientSecret);
    params.append("grant_type", "client_credentials");
    params.append("scope", "eats.deliveries");

    const authRes = await fetch("https://login.uber.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      return { success: false, message: `Error al autenticar OAuth (${authRes.status}): ${errText}` };
    }

    const authData = await authRes.json();
    if (!authData.access_token) {
      return { success: false, message: "Uber no retornó un access_token válido." };
    }

    return {
      success: true,
      message: `¡Conexión exitosa con Uber Direct (${credentials.env.toUpperCase()})! Token generado correctamente.`
    };
  } catch (error: any) {
    return { success: false, message: `Error de conexión: ${error.message}` };
  }
}
