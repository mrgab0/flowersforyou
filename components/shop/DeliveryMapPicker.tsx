"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle, Compass } from "lucide-react";

interface DeliveryMapPickerProps {
  initialAddress: string;
  storeLat?: number;
  storeLng?: number;
  onLocationChange: (data: {
    address: string;
    lat: number;
    lng: number;
    distanceMiles: number;
    googleMapsUrl: string;
  }) => void;
}

// Coordenadas del punto de partida de la boutique matriz (6705 Fairway Dr, Houston, TX 77087)
const DEFAULT_STORE_LAT = 29.7027;
const DEFAULT_STORE_LNG = -95.2936;

// Cálculo de Distancia Haversine corregida por factor terrestre de carretera (x 1.25)
function calculateHaversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radio terrestre en millas
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightMiles = R * c;

  // Factor de curvatura de carretera (vías urbanas/autopistas ~1.25 de recorrido real)
  return Math.round(straightMiles * 1.25 * 10) / 10;
}

export function DeliveryMapPicker({
  initialAddress,
  storeLat = DEFAULT_STORE_LAT,
  storeLng = DEFAULT_STORE_LNG,
  onLocationChange,
}: DeliveryMapPickerProps) {
  const [addressInput, setAddressInput] = useState(initialAddress || "");
  const [lat, setLat] = useState<number>(DEFAULT_STORE_LAT + 0.05); // Inicialmente a pocas millas
  const [lng, setLng] = useState<number>(DEFAULT_STORE_LNG + 0.05);
  
  const [searching, setSearching] = useState(false);
  const [geocodedSuccess, setGeocodedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [distanceMiles, setDistanceMiles] = useState<number>(0);

  useEffect(() => {
    if (initialAddress && initialAddress !== addressInput) {
      setAddressInput(initialAddress);
      geocodeAddress(initialAddress);
    }
  }, [initialAddress]);

  const updateParent = (newAddress: string, newLat: number, newLng: number) => {
    const miles = calculateHaversineMiles(storeLat, storeLng, newLat, newLng);
    setDistanceMiles(miles);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${newLat},${newLng}`;

    onLocationChange({
      address: newAddress,
      lat: newLat,
      lng: newLng,
      distanceMiles: miles,
      googleMapsUrl,
    });
  };

  // Buscar coordenadas a partir del texto ingresado (Geocoding optimizado con delimitación en Houston TX)
  const geocodeAddress = async (queryText?: string) => {
    const rawText = queryText || addressInput;
    if (!rawText.trim()) return;

    // Sanitizar texto para Nominatim (reemplazar "EE. UU" o "EEUU" por "USA")
    let cleanText = rawText
      .replace(/EE\.?\s*UU\.?/gi, "USA")
      .replace(/EEUU/gi, "USA")
      .trim();

    // Si el texto no especifica Houston, asegurar delimitación en Houston TX
    if (!cleanText.toLowerCase().includes("houston")) {
      cleanText += ", Houston, TX";
    }

    setSearching(true);
    setErrorMsg("");
    setGeocodedSuccess(false);

    try {
      // Delimitación espacial viewbox alrededor de la tienda en Houston TX (29.7027, -95.2936)
      const viewboxStr = `${storeLng - 0.8},${storeLat + 0.8},${storeLng + 0.8},${storeLat - 0.8}`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          cleanText
        )}&limit=1&viewbox=${viewboxStr}`,
        {
          headers: {
            "Accept-Language": "es,en",
          },
        }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        let foundLat = parseFloat(data[0].lat);
        let foundLng = parseFloat(data[0].lon);

        let miles = calculateHaversineMiles(storeLat, storeLng, foundLat, foundLng);

        // Si la distancia supera 100 millas (por error de Nominatim ubicando otra ciudad/estado), forzar búsqueda estricta en Houston TX
        if (miles > 100) {
          const strictRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              cleanText + ", Houston, TX, USA"
            )}&limit=1&viewbox=${viewboxStr}&bounded=1`,
            {
              headers: {
                "Accept-Language": "es,en",
              },
            }
          );
          const strictData = await strictRes.json();
          if (strictData && strictData.length > 0) {
            foundLat = parseFloat(strictData[0].lat);
            foundLng = parseFloat(strictData[0].lon);
            miles = calculateHaversineMiles(storeLat, storeLng, foundLat, foundLng);
          }
        }

        setLat(foundLat);
        setLng(foundLng);
        setGeocodedSuccess(true);
        updateParent(rawText, foundLat, foundLng);
      } else {
        // Fallback a coordenadas de la tienda si no hay coincidencia
        updateParent(rawText, storeLat, storeLng);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      updateParent(rawText, storeLat, storeLng);
    } finally {
      setSearching(false);
    }
  };

  // Detectar ubicación GPS actual del dispositivo del cliente
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no soporta geolocalización GPS.");
      return;
    }

    setSearching(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);

        // Reverse Geocoding para obtener la dirección en texto
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}`
          );
          const data = await res.json();
          const gpsAddr = data.display_name || `Ubicación GPS (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`;
          setAddressInput(gpsAddr);
          setGeocodedSuccess(true);
          updateParent(gpsAddr, userLat, userLng);
        } catch {
          const fallback = `Ubicación GPS (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`;
          setAddressInput(fallback);
          updateParent(fallback, userLat, userLng);
        } finally {
          setSearching(false);
        }
      },
      (err) => {
        setSearching(false);
        setErrorMsg("No se pudo obtener el GPS. Por favor escribe tu dirección.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // URL del mapa iframe embebido (OpenStreetMap con marcador interactivo)
  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.03}%2C${lat - 0.03}%2C${lng + 0.03}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="space-y-4 bg-gray-50/70 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 border-gray-200 dark:border-gray-800">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <MapPin size={16} className="text-[#FF97A4]" /> Dirección y Ubicación en Mapa para Entrega
        </label>
        
        <button
          type="button"
          onClick={handleUseCurrentGPS}
          disabled={searching}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
        >
          <Navigation size={13} />
          {searching ? "Detectando GPS..." : "Usar Mi Ubicación Actual (GPS)"}
        </button>
      </div>

      {/* Campo de texto de Dirección */}
      <div className="space-y-1.5">
        <div className="relative">
          <input
            type="text"
            name="address"
            value={addressInput}
            onChange={(e) => {
              setAddressInput(e.target.value);
              updateParent(e.target.value, lat, lng);
            }}
            onBlur={() => geocodeAddress()}
            placeholder="Ej: 6705 Fairway Dr, Houston, TX 77087"
            className="w-full p-3.5 pr-24 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] dark:bg-gray-900 dark:text-white"
            required
          />
          <button
            type="button"
            onClick={() => geocodeAddress()}
            disabled={searching}
            className="absolute right-2 top-2 bottom-2 px-3 bg-[#1A1C1C] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-1"
          >
            <Search size={14} />
            {searching ? "Buscando..." : "Ubicar"}
          </button>
        </div>

        {geocodedSuccess && (
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-0.5">
            <CheckCircle2 size={13} /> ¡Dirección localizada en el mapa! Distancia estimada: <strong>{distanceMiles} millas</strong>
          </p>
        )}

        {errorMsg && (
          <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 pt-0.5">
            <AlertCircle size={13} /> {errorMsg}
          </p>
        )}
      </div>

      {/* Visor de Mapa Interactivo con Marcador de Entrega */}
      <div className="space-y-2">
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm h-48 bg-gray-100">
          <iframe
            title="Mapa de Entrega"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={mapIframeUrl}
            className="w-full h-full"
          ></iframe>

          {/* Badge flotante de millas sobre el mapa */}
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-md flex items-center gap-1.5 text-xs font-black">
            <Compass size={14} className="text-[#FF97A4]" />
            <span>{distanceMiles > 0 ? `📍 ${distanceMiles} Millas desde Boutique` : "📍 Ubica tu dirección para calcular millas"}</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
          💡 El pin del mapa se envía a nuestros repartidores en su factura para navegación GPS en tiempo real.
        </p>
      </div>
    </div>
  );
}
