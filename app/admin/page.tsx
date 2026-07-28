import { LoginButton } from "@/components/LoginButton";

export default function AdminPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Bienvenido al Panel</h2>
      <p className="mb-6 text-gray-600">Aquí gestionarás tus productos y contenido.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <a href="/admin/productos" className="bg-blue-600 text-white p-5 rounded-2xl font-bold hover:bg-blue-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">📦</span>
          <span>Gestionar Productos</span>
        </a>
        <a href="/admin/sliders" className="bg-[#FF97A4] text-white p-5 rounded-2xl font-bold hover:bg-[#b0004a] text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🖼️</span>
          <span>Gestionar Banners</span>
        </a>
        <a href="/admin/adicionales" className="bg-purple-600 text-white p-5 rounded-2xl font-bold hover:bg-purple-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">✨</span>
          <span>Gestionar Adicionales</span>
        </a>
        <a href="/admin/entregas" className="bg-emerald-600 text-white p-5 rounded-2xl font-bold hover:bg-emerald-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🚚</span>
          <span>Opciones de Entrega</span>
        </a>
        <a href="/admin/cupones" className="bg-amber-500 text-white p-5 rounded-2xl font-bold hover:bg-amber-600 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🎟️</span>
          <span>Cupones de Descuento</span>
        </a>
        <a href="/admin/pagos" className="bg-cyan-600 text-white p-5 rounded-2xl font-bold hover:bg-cyan-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">💳</span>
          <span>Cuentas de Pago & QR</span>
        </a>
      </div>
      
      <div className="border-t pt-6">
        <LoginButton />
      </div>
    </div>
  );
}
