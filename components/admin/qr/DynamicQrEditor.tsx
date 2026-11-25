"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Link2,
  Plus,
  Search,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  BarChart2,
  CheckCircle2,
  RefreshCw,
  Palette,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  DynamicQRItem,
  getDynamicQrsAction,
  createDynamicQrAction,
  updateDynamicQrAction,
  deleteDynamicQrAction,
} from "@/lib/actions/qrActions";
import {
  QrCanvasPreview,
  QrDesignConfig,
  QrStylePreset,
} from "./QrCanvasPreview";

export function DynamicQrEditor() {
  const [items, setItems] = useState<DynamicQRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("https://flowersforyou.com");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedForPreview, setSelectedForPreview] = useState<DynamicQRItem | null>(null);

  const [designConfig, setDesignConfig] = useState<QrDesignConfig>({
    stylePreset: "luxury",
    fgColor: "#1A1C1C",
    bgColor: "#FFFFFF",
    eyeColor: "#D81B60",
    includeLogo: true,
    logoUrl: "/logo.jpg",
    logoSize: 22,
    margin: 3,
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getDynamicQrsAction();
      setItems(data);
      if (data.length > 0 && !selectedForPreview) {
        setSelectedForPreview(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const currentDomain = typeof window !== "undefined" ? window.location.origin : "https://flowersforyou.com";
  
  const livePreviewUrl = useMemo(() => {
    if (selectedForPreview) {
      return `${currentDomain}/q/${selectedForPreview.code}`;
    }
    const code = customCode.trim().toLowerCase() || "promo";
    return `${currentDomain}/q/${code}`;
  }, [selectedForPreview, customCode, currentDomain]);

  const handleStartCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setTitle("");
    setCustomCode("");
    setDestinationUrl("https://flowersforyou.com");
    setDescription("");
    setErrorMsg(null);
    setSelectedForPreview(null);
  };

  const handleStartEdit = (item: DynamicQRItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setTitle(item.title);
    setCustomCode(item.code);
    setDestinationUrl(item.destinationUrl);
    setDescription(item.description || "");
    setErrorMsg(null);
    setSelectedForPreview(item);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destinationUrl.trim()) {
      setErrorMsg("El título y la URL de destino son obligatorios.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (editingId) {
        const res = await updateDynamicQrAction(editingId, {
          title,
          destinationUrl,
          description,
          designConfig,
        });
        if (res.success) {
          setIsEditing(false);
          await fetchItems();
        } else {
          setErrorMsg(res.error || "Error al actualizar.");
        }
      } else {
        const res = await createDynamicQrAction({
          title,
          code: customCode,
          destinationUrl,
          description,
          designConfig,
        });
        if (res.success && res.qr) {
          setIsEditing(false);
          await fetchItems();
          setSelectedForPreview(res.qr);
        } else {
          setErrorMsg(res.error || "Error al crear.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este código QR dinámico? Dejará de redirigir.")) return;
    const res = await deleteDynamicQrAction(id);
    if (res.success) {
      if (selectedForPreview?.id === id) setSelectedForPreview(null);
      await fetchItems();
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.destinationUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna Izquierda: Formulario y Lista */}
      <div className="lg:col-span-7 space-y-6">
        {isEditing ? (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-black text-stone-900">
                {editingId ? "Editar Código QR Dinámico" : "Crear Nuevo Código QR Dinámico"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-stone-500 hover:text-stone-900 font-bold"
              >
                Cancelar
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nombre o Título del QR *</label>
                <input
                  type="text"
                  placeholder="Ej: Tarjeta Dedicatoria en Ramo VIP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
                  required
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Código en URL personalizada (Opcional, se autogenera si está vacío)
                  </label>
                  <div className="flex items-center">
                    <span className="p-2.5 bg-stone-100 text-stone-500 rounded-l-xl border border-r-0 border-stone-200 font-mono">
                      /q/
                    </span>
                    <input
                      type="text"
                      placeholder="san-valentin"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      className="w-full p-2.5 rounded-r-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL de Destino (Hacia dónde redirige) *</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Nota o Descripción Interna</label>
                <textarea
                  placeholder="Notas para el equipo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#D81B60] hover:bg-[#b0004a] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : editingId ? "Actualizar QR" : "Crear y Generar QR"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar QR por título, código o URL..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#D81B60] hover:bg-[#b0004a] text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                <Plus size={15} />
                <span>Nuevo QR</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-stone-500 bg-white rounded-2xl border border-stone-200">
                Cargando QRs dinámicos...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
                No hay códigos QR dinámicos creados aún. ¡Crea el primero!
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const isSelected = selectedForPreview?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedForPreview(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-pink-50/60 border-[#D81B60] shadow-xs"
                          : "bg-white border-stone-200 hover:border-pink-200"
                      }`}
                    >
                      <div className="truncate space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{item.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 font-mono text-[10px] text-stone-600">
                            /q/{item.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">{item.destinationUrl}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        <div className="text-right">
                          <p className="font-black text-stone-900">{item.scanCount}</p>
                          <p className="text-[10px] text-stone-400">escaneos</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(item);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Columna Derecha: Vista Previa y Descarga en Canvas */}
      <div className="lg:col-span-5 space-y-4">
        <QrCanvasPreview
          value={livePreviewUrl}
          config={designConfig}
          title={selectedForPreview?.title || title || "QR Flowers For You"}
          onConfigChange={(newCfg) => setDesignConfig((prev) => ({ ...prev, ...newCfg }))}
        />
      </div>
    </div>
  );
}
