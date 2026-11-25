/**
 * FLOWERS FOR YOU - STAR MICRONICS TSP143III / MATRIZ DE PUNTO DAEMON (Node.js)
 * Impresión Automática en Red Local (Ethernet / LAN) para Tickets de 80mm
 */

const net = require("net");

const PRINTER_IP = process.env.PRINTER_IP || process.env.STAR_PRINTER_IP || "10.0.0.118";
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "3000", 10);
const API_BASE = process.env.STAR_API_URL || "http://localhost:3000/api/pos/printer";
const DEFAULT_PORT = 9100;

function sendToLanPrinter(printerIp, dataBuffer, port = DEFAULT_PORT, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    socket.connect(port, printerIp, () => {
      socket.write(dataBuffer, (err) => {
        if (err) {
          if (!settled) {
            settled = true;
            socket.destroy();
            reject(err);
          }
          return;
        }
        socket.end();
      });
    });

    socket.on("close", () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    });

    socket.on("timeout", () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        reject(new Error(`Timeout (${timeoutMs}ms) conectando a impresora en ${printerIp}:${port}`));
      }
    });

    socket.on("error", (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        reject(err);
      }
    });
  });
}

console.log("=======================================================");
console.log("   🌸 FLOWERS FOR YOU - STAR POS DAEMON 🌸");
console.log(`[*] Impresora LAN:    ${PRINTER_IP}:${DEFAULT_PORT}`);
console.log(`[*] API Remota:       ${API_BASE}`);
console.log(`[*] Intervalo sondeo: ${POLL_INTERVAL_MS / 1000}s`);
console.log("=======================================================");

let isPolling = false;

async function pollAndPrint() {
  if (isPolling) return;
  isPolling = true;

  try {
    const res = await fetch(`${API_BASE}?limit=5`, {
      headers: { "User-Agent": "FlowersForYouNodeDaemon/1.0" },
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    if (data.success && data.orders && data.orders.length > 0) {
      console.log(`[+] Detectadas ${data.orders.length} orden(es) pendientes.`);

      for (const order of data.orders) {
        console.log(`[>] Descargando payload Star Raster para orden #${order.orderId}...`);
        const rawRes = await fetch(`${API_BASE}?orderId=${encodeURIComponent(order.orderId)}&format=star_raster`);
        if (!rawRes.ok) throw new Error("Fallo al descargar binario para orden " + order.orderId);
        const arrayBuf = await rawRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        console.log(`[>] Enviando ${buffer.length} bytes por socket TCP a ${PRINTER_IP}:${DEFAULT_PORT}...`);
        await sendToLanPrinter(PRINTER_IP, buffer);
        console.log(`[✓] Impresión despachada a hardware Star TSP100 para orden #${order.orderId}`);

        await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ack", orderId: order.orderId }),
        });
        console.log(`[✓] ACK confirmado en servidor.`);
      }
    }
  } catch (err) {
    // Silencioso o log suave
  } finally {
    isPolling = false;
  }
}

setInterval(pollAndPrint, POLL_INTERVAL_MS);
pollAndPrint();
