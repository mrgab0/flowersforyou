"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Trash2,
  RotateCcw,
  Search,
  RefreshCw,
  Package,
  Sparkles,
  Mail,
  AlertTriangle,
  CheckCircle2,
  X,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import {
  getTrashItemsAction,
  getTrashStatsAction,
  restoreTrashItemAction,
  bulkRestoreTrashAction,
  permanentDeleteTrashItemAction,
  bulkPermanentDeleteTrashAction,
  emptyTrashAction,
  ITrashItem,
  TrashStats,
  TrashItemType,
} from "@/lib/actions/trash";

export default function PapeleraAdminPage() {
  const [items, setItems] = useState<ITrashItem[]>([]);
  const [stats, setStats] = useState<TrashStats>({
    total: 0,
    products: 0,
    addons: 0,
    emails: 0,
  });
  const [activeTab, setActiveTab] = useState<"all" | "products" | "addons" | "emails">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    setSelectedIds([]);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        getTrashItemsAction({ type: activeTab, search: searchTerm }),
        getTrashStatsAction(),
      ]);

      if (itemsRes.success) {
        setItems(itemsRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Error al cargar datos de papelera:", err);
      showFeedback("error", "No se pudieron cargar los elementos de la papelera.");
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(type: "success" | "error", text: string) {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  }

  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term)) ||
      (item.details && item.details.toLowerCase().includes(term)) ||
      (item.badge && item.badge.toLowerCase().includes(term))
    );
  });

  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleRestoreSingle(item: ITrashItem) {
    startTransition(async () => {
      const res = await restoreTrashItemAction({ id: item.id, type: item.type });
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setSelectedIds((prev) => prev.filter((id) => id !== item.id));
        showFeedback(
          "success",
          `"${item.title}" ha sido restaurado exitosamente.`
        );
        const statsRes = await getTrashStatsAction();
        if (statsRes.success) setStats(statsRes.data);
      } else {
        showFeedback("error", res.error || "No se pudo restaurar el elemento.");
      }
    });
  }

  async function handlePermanentDeleteSingle(item: ITrashItem) {
    const confirmDelete = window.confirm(
      `¿Deseas purgar PERMANENTEMENTE "${item.title}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    startTransition(async () => {
      const res = await permanentDeleteTrashItemAction({
        id: item.id,
        type: item.type,
      });
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setSelectedIds((prev) => prev.filter((id) => id !== item.id));
        showFeedback("success", `Elemento purgado definitivamente.`);
        const statsRes = await getTrashStatsAction();
        if (statsRes.success) setStats(statsRes.data);
      } else {
        showFeedback("error", res.error || "No se pudo eliminar el elemento.");
      }
    });
  }

  async function handleBulkRestore() {
    if (selectedIds.length === 0) return;
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));

    startTransition(async () => {
      const res = await bulkRestoreTrashAction(
        selectedItems.map((i) => ({ id: i.id, type: i.type }))
      );
      if (res.success) {
        setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
        setSelectedIds([]);
        showFeedback(
          "success",
          `${res.count} elemento(s) restaurado(s) exitosamente.`
        );
        const statsRes = await getTrashStatsAction();
        if (statsRes.success) setStats(statsRes.data);
      } else {
        showFeedback("error", res.error || "Error al restaurar lote.");
      }
    });
  }

  async function handleBulkPermanentDelete() {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(
      `¿Deseas purgar PERMANENTEMENTE ${selectedIds.length} elemento(s)?\n\nEsta operación borrará los registros para siempre.`
    );
    if (!confirmDelete) return;

    const selectedItems = items.filter((i) => selectedIds.includes(i.id));

    startTransition(async () => {
      const res = await bulkPermanentDeleteTrashAction(
        selectedItems.map((i) => ({ id: i.id, type: i.type }))
      );
      if (res.success) {
        setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
        setSelectedIds([]);
        showFeedback("success", `${res.count} elemento(s) purgado(s) definitivamente.`);
        const statsRes = await getTrashStatsAction();
        if (statsRes.success) setStats(statsRes.data);
      } else {
        showFeedback("error", res.error || "Error al purgar lote.");
      }
    });
  }

  async function handleEmptyTrash() {
    startTransition(async () => {
      const res = await emptyTrashAction(activeTab);
      setIsConfirmEmptyOpen(false);
      if (res.success) {
        showFeedback(
          "success",
          `Papelera vaciada: ${res.count} elemento(s) eliminados definitivamente.`
        );
        loadData();
      } else {
        showFeedback("error", res.error || "Error al vaciar papelera.");
      }
    });
  }

  function renderTypeBadge(type: TrashItemType) {
    switch (type) {
      case "product":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-[#D81B60] border border-pink-200">
            <Package size={11} />
            Producto
          </span>
        );
      case "addon":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Sparkles size={11} />
            Adicional
          </span>
        );
      case "email":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Mail size={11} />
            Correo
          </span>
        );
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-pink-50 rounded-xl text-[#D81B60] border border-pink-200">
              <Trash2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                Papelera de Reciclaje
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                Recupera productos, adicionales y correos eliminados o purgalos de forma definitiva.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading || isPending}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-xs active:scale-95 disabled:opacity-50"
            title="Recargar papelera"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={() => setIsConfirmEmptyOpen(true)}
            disabled={stats.total === 0 || loading || isPending}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            <span>Vaciar Papelera</span>
          </button>
        </div>
      </div>

      {/* 2. FEEDBACK BANNER */}
      {feedbackMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border shadow-xs animate-in fade-in duration-200 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3. TABS Y FILTROS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>Todos</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === "all" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-700"
              }`}
            >
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center gap-2 ${
              activeTab === "products"
                ? "bg-[#D81B60] text-white border-[#D81B60] shadow-xs"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>📦 Productos</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === "products" ? "bg-white/20 text-white" : "bg-pink-50 text-[#D81B60]"
              }`}
            >
              {stats.products}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("addons")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center gap-2 ${
              activeTab === "addons"
                ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>✨ Adicionales</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === "addons" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-800"
              }`}
            >
              {stats.addons}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("emails")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center gap-2 ${
              activeTab === "emails"
                ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>✉️ Correos</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === "emails" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-800"
              }`}
            >
              {stats.emails}
            </span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, asunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D81B60] shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4. ACCIONES POR LOTE */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-pink-50 border border-pink-200 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-black text-[#D81B60]">
              {selectedIds.length} elemento(s) seleccionado(s)
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-stone-600 hover:underline"
            >
              Deseleccionar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRestore}
              disabled={isPending}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <RotateCcw size={13} />
              <span>Restaurar Seleccionados</span>
            </button>
            <button
              onClick={handleBulkPermanentDelete}
              disabled={isPending}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={13} />
              <span>Purgar Seleccionados</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. LISTA DE ELEMENTOS */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50/80 text-xs font-bold text-stone-500">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              disabled={filteredItems.length === 0}
              className="w-4 h-4 rounded text-[#D81B60] focus:ring-[#D81B60] border-stone-300"
              title="Seleccionar todos"
            />
            <span>Elemento & Detalle</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Fecha de Eliminación</span>
            <span className="text-right">Acciones</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={32} className="animate-spin text-[#D81B60] mx-auto" />
            <p className="text-sm font-bold text-stone-500">
              Cargando papelera de reciclaje...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 px-4 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                La papelera está vacía
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {searchTerm
                  ? `No se encontraron coincidencias para "${searchTerm}".`
                  : activeTab === "all"
                  ? "No hay productos, adicionales ni correos en la papelera."
                  : `No hay elementos eliminados en esta categoría.`}
              </p>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const formattedDate = new Date(item.deletedAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isSelected ? "bg-pink-50/50" : "hover:bg-stone-50/80"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="mt-1.5 w-4 h-4 rounded text-[#D81B60] focus:ring-[#D81B60] border-stone-300"
                    />

                    <div className="w-12 h-12 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : item.type === "product" ? (
                        <Package size={22} className="text-[#D81B60]" />
                      ) : item.type === "addon" ? (
                        <Sparkles size={22} className="text-amber-500" />
                      ) : (
                        <Mail size={22} className="text-blue-500" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderTypeBadge(item.type)}
                        <h4 className="font-extrabold text-sm sm:text-base text-stone-900 leading-tight">
                          {item.title}
                        </h4>
                        {typeof item.price === "number" && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-black bg-emerald-100 text-emerald-800">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-xs text-stone-600 line-clamp-1 font-medium">
                          {item.subtitle}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400 font-medium">
                        {item.details && (
                          <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-semibold">
                            {item.details}
                          </span>
                        )}
                        <span className="flex items-center gap-1 sm:hidden">
                          <Calendar size={11} />
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-medium whitespace-nowrap">
                      <Calendar size={13} />
                      {formattedDate}
                    </span>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleRestoreSingle(item)}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                        title="Restaurar a estado activo"
                      >
                        <RotateCcw size={13} />
                        <span>Restaurar</span>
                      </button>

                      <button
                        onClick={() => handlePermanentDeleteSingle(item)}
                        disabled={isPending}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition active:scale-95 disabled:opacity-50"
                        title="Purgar permanentemente"
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

      {/* 6. MODAL VACIAR PAPELERA */}
      {isConfirmEmptyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
              <ShieldAlert size={30} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-stone-900">
                ¿Vaciar la papelera de reciclaje?
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Esta acción eliminará de forma <strong>definitiva e irreversible</strong> todos los elementos{" "}
                {activeTab === "all" ? "de la papelera" : `de la sección de ${activeTab}`}.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                Los registros eliminados no se podrán recuperar. Asegúrate de haber restaurado los elementos necesarios antes de proceder.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmEmptyOpen(false)}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 font-bold text-xs sm:text-sm transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEmptyTrash}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isPending ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                <span>Sí, Vaciar Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
