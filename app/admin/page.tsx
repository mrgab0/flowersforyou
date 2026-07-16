import { LoginButton } from "@/components/LoginButton";

export default function AdminPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Bienvenido al Panel</h2>
      <p className="mb-6 text-gray-600">Aquí gestionarás tus productos y contenido.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <a href="/admin/productos" className="bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 text-center">Gestionar Productos</a>
        <a href="/admin/sliders" className="bg-[#FF97A4] text-white p-4 rounded-xl font-bold hover:bg-[#b0004a] text-center">Gestionar Promociones</a>
        <a href="/admin/adicionales" className="bg-gray-800 text-white p-4 rounded-xl font-bold hover:bg-black text-center">Gestionar Adicionales</a>
      </div>
      
      <div className="border-t pt-6">
        <LoginButton />
      </div>
    </div>
  );
}
