"use client";

import { useState, useEffect } from "react";
import { FileText, Check, Loader2, Printer } from "lucide-react";
import { printInvoiceA4Direct, POSOrderData, getClientPreferredLanguage } from "@/lib/posPrinterClient";

interface PrintInvoiceClientButtonProps {
  order: POSOrderData | any;
  lang?: "es" | "en";
  className?: string;
  variant?: "solid" | "outline" | "pill";
}

export function PrintInvoiceClientButton({
  order,
  lang,
  className = "",
  variant = "outline",
}: PrintInvoiceClientButtonProps) {
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [detectedLang, setDetectedLang] = useState<"es" | "en">(lang || "es");

  useEffect(() => {
    if (!lang) {
      setDetectedLang(getClientPreferredLanguage());
    } else {
      setDetectedLang(lang);
    }
  }, [lang]);

  if (!order) return null;

  const isEn = detectedLang === "en";

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printInvoiceA4Direct(order, detectedLang);
      setPrinted(true);
      setTimeout(() => setPrinted(false), 3000);
    } catch (e) {
      console.warn("Error al emitir factura:", e);
    } finally {
      setPrinting(false);
    }
  };

  const label = printing
    ? isEn
      ? "Generating Invoice..."
      : "Generando Factura..."
    : printed
    ? isEn
      ? "Invoice Ready! ✓"
      : "¡Factura Lista! ✓"
    : isEn
    ? "Print Official Invoice (PDF)"
    : "Descargar / Imprimir Factura (PDF)";

  let baseStyle =
    "bg-white hover:bg-pink-50 text-stone-900 border border-stone-200 hover:border-[#D81B60] shadow-sm";

  if (variant === "solid") {
    baseStyle =
      "bg-[#D81B60] hover:bg-[#b0004a] text-white shadow-md hover:scale-102";
  } else if (variant === "pill") {
    baseStyle =
      "bg-pink-50 hover:bg-pink-100 text-[#D81B60] border border-pink-200 shadow-xs";
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={printing}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer ${baseStyle} ${className}`}
      title={isEn ? "View, print or download your official invoice as PDF" : "Ver, imprimir o descargar tu factura oficial en PDF"}
    >
      {printing ? (
        <Loader2 size={16} className="animate-spin text-[#D81B60]" />
      ) : printed ? (
        <Check size={16} className="text-emerald-500" />
      ) : (
        <FileText size={16} className="text-[#D81B60]" />
      )}
      <span>{label}</span>
    </button>
  );
}
