"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Download, Copy, Printer, Check, Sparkles, Image as ImageIcon } from "lucide-react";

export type QrStylePreset = "floral" | "luxury" | "modern" | "classic";

export interface QrDesignConfig {
  stylePreset: QrStylePreset;
  fgColor: string;
  bgColor: string;
  eyeColor: string;
  includeLogo: boolean;
  logoUrl: string;
  logoSize: number;
  margin: number;
}

interface QrCanvasPreviewProps {
  value: string;
  config: QrDesignConfig;
  title?: string;
  onConfigChange?: (newConfig: Partial<QrDesignConfig>) => void;
}

export function QrCanvasPreview({
  value,
  config,
  title = "Código QR",
  onConfigChange,
}: QrCanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloadRes, setDownloadRes] = useState<number>(1024);
  const [isRendering, setIsRendering] = useState(false);

  const isFinderPattern = (r: number, c: number, size: number) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= size - 7) return true;
    if (r >= size - 7 && c < 7) return true;
    return false;
  };

  const isLogoArea = (r: number, c: number, size: number, logoModules: number) => {
    if (!config.includeLogo) return false;
    const center = size / 2;
    const half = logoModules / 2;
    return (
      r >= center - half &&
      r <= center + half &&
      c >= center - half &&
      c <= center + half
    );
  };

  const renderQrToCanvas = useCallback(
    async (targetCanvas: HTMLCanvasElement, exportWidth: number) => {
      if (!value) return;

      const ctx = targetCanvas.getContext("2d");
      if (!ctx) return;

      let qrData;
      try {
        qrData = QRCode.create(value, {
          errorCorrectionLevel: "H",
        });
      } catch (err) {
        console.error("QR Generation error:", err);
        return;
      }

      const modules = qrData.modules;
      const size = modules.size;
      const marginModules = config.margin || 3;
      const totalGridSize = size + marginModules * 2;

      targetCanvas.width = exportWidth;
      targetCanvas.height = exportWidth;

      const cellSize = exportWidth / totalGridSize;
      const offset = marginModules * cellSize;

      ctx.fillStyle = config.bgColor || "#FFFFFF";
      ctx.fillRect(0, 0, exportWidth, exportWidth);

      const logoModules = config.includeLogo
        ? Math.max(5, Math.floor(size * (config.logoSize / 100)))
        : 0;

      ctx.fillStyle = config.fgColor || "#1A1C1C";

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (isFinderPattern(r, c, size)) continue;
          if (isLogoArea(r, c, size, logoModules)) continue;

          if (modules.get(r, c)) {
            const x = offset + c * cellSize;
            const y = offset + r * cellSize;

            if (config.stylePreset === "floral") {
              ctx.beginPath();
              ctx.arc(
                x + cellSize / 2,
                y + cellSize / 2,
                cellSize * 0.44,
                0,
                Math.PI * 2
              );
              ctx.fill();
            } else if (config.stylePreset === "modern") {
              const radius = cellSize * 0.28;
              ctx.beginPath();
              ctx.roundRect(
                x + cellSize * 0.08,
                y + cellSize * 0.08,
                cellSize * 0.84,
                cellSize * 0.84,
                radius
              );
              ctx.fill();
            } else {
              ctx.fillRect(x, y, cellSize + 0.3, cellSize + 0.3);
            }
          }
        }
      }

      // 4. Dibujar Finder Patterns (Ojos)
      const drawEye = (startRow: number, startCol: number) => {
        const eyeX = offset + startCol * cellSize;
        const eyeY = offset + startRow * cellSize;
        const eyeOuterSize = 7 * cellSize;

        ctx.fillStyle = config.bgColor || "#FFFFFF";
        ctx.fillRect(eyeX, eyeY, eyeOuterSize, eyeOuterSize);

        ctx.fillStyle = config.eyeColor || config.fgColor || "#D81B60";

        if (config.stylePreset === "floral") {
          ctx.beginPath();
          ctx.roundRect(eyeX, eyeY, eyeOuterSize, eyeOuterSize, eyeOuterSize * 0.35);
          ctx.fill();

          ctx.fillStyle = config.bgColor || "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(
            eyeX + cellSize,
            eyeY + cellSize,
            5 * cellSize,
            5 * cellSize,
            5 * cellSize * 0.28
          );
          ctx.fill();

          ctx.fillStyle = config.eyeColor || config.fgColor || "#D81B60";
          ctx.beginPath();
          ctx.arc(
            eyeX + 3.5 * cellSize,
            eyeY + 3.5 * cellSize,
            1.5 * cellSize,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else {
          ctx.fillRect(eyeX, eyeY, eyeOuterSize, eyeOuterSize);
          ctx.fillStyle = config.bgColor || "#FFFFFF";
          ctx.fillRect(eyeX + cellSize, eyeY + cellSize, 5 * cellSize, 5 * cellSize);
          ctx.fillStyle = config.eyeColor || config.fgColor || "#D81B60";
          ctx.fillRect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
        }
      };

      drawEye(0, 0);
      drawEye(0, size - 7);
      drawEye(size - 7, 0);

      // 5. Logo central si aplica
      if (config.includeLogo && config.logoUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = config.logoUrl;
          });

          if (img.width > 0 && img.height > 0) {
            const logoPixelSize = logoModules * cellSize;
            const logoX = (exportWidth - logoPixelSize) / 2;
            const logoY = (exportWidth - logoPixelSize) / 2;

            ctx.fillStyle = config.bgColor || "#FFFFFF";
            ctx.beginPath();
            ctx.arc(
              exportWidth / 2,
              exportWidth / 2,
              logoPixelSize * 0.58,
              0,
              Math.PI * 2
            );
            ctx.fill();

            ctx.save();
            ctx.beginPath();
            ctx.arc(
              exportWidth / 2,
              exportWidth / 2,
              logoPixelSize * 0.5,
              0,
              Math.PI * 2
            );
            ctx.clip();
            ctx.drawImage(img, logoX, logoY, logoPixelSize, logoPixelSize);
            ctx.restore();
          }
        } catch (_) {}
      }
    },
    [value, config]
  );

  useEffect(() => {
    if (canvasRef.current) {
      setIsRendering(true);
      renderQrToCanvas(canvasRef.current, 360).finally(() => {
        setIsRendering(false);
      });
    }
  }, [renderQrToCanvas]);

  const handleDownload = async (format: "png" | "jpeg" | "svg") => {
    const offscreenCanvas = document.createElement("canvas");
    await renderQrToCanvas(offscreenCanvas, downloadRes);

    const safeTitle = (title || "qr-flowers-for-you")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    const link = document.createElement("a");
    link.download = `${safeTitle}-${downloadRes}px.${format}`;
    link.href = offscreenCanvas.toDataURL(`image/${format === "svg" ? "png" : format}`, 0.95);
    link.click();
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
      <div className="relative p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center">
        <canvas ref={canvasRef} className="max-w-[280px] w-full h-auto aspect-square rounded-xl shadow-xs" />
        {isRendering && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center rounded-2xl">
            <Sparkles className="animate-spin text-[#D81B60]" size={24} />
          </div>
        )}
      </div>

      <div className="w-full space-y-2 text-center">
        <p className="text-xs font-black text-stone-900 truncate max-w-xs mx-auto">{title}</p>
        <p className="text-[11px] font-mono text-stone-500 truncate max-w-xs mx-auto bg-stone-100 py-1 px-3 rounded-lg">
          {value}
        </p>
      </div>

      {/* Selector de Resolución */}
      <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
        <span>Resolución:</span>
        <select
          value={downloadRes}
          onChange={(e) => setDownloadRes(parseInt(e.target.value))}
          className="p-1.5 border rounded-lg bg-white text-xs font-bold focus:border-[#D81B60] focus:outline-none"
        >
          <option value={512}>512px (Web)</option>
          <option value={1024}>1024px (Tarjeta)</option>
          <option value={2048}>2048px (Ultra HD)</option>
        </select>
      </div>

      {/* Botones de Descarga y Copia */}
      <div className="grid grid-cols-2 gap-2 w-full">
        <button
          type="button"
          onClick={() => handleDownload("png")}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#D81B60] hover:bg-[#b0004a] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Download size={14} />
          <span>Descargar PNG</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          <span>{copied ? "Copiado!" : "Copiar Enlace"}</span>
        </button>
      </div>
    </div>
  );
}
