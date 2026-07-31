"use client";

interface FooterProps {
  siteConfig?: any;
}

export function Footer({ siteConfig }: FooterProps) {
  return (
    <footer className="bg-[#1A1C1C] text-gray-200 py-14 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gray-800/80 pb-10 mb-10">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
              {siteConfig?.footerTitle || "Flowers For You LLC"}
            </h3>
            <p className="text-xs text-[#FF97A4] font-medium mt-1">
              {siteConfig?.footerSlogan || "Boutique Floral Digital • Houston, Texas"}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs font-extrabold tracking-widest text-gray-300 uppercase">
            <span>6705 Fairway Dr.</span>
            <span>Houston, Texas 77087</span>
            <span>Boutique Digital</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            {siteConfig?.footerCopyright || `© ${new Date().getFullYear()} Flowers For You LLC. Todos los derechos reservados.`}
          </p>

          {/* Logotipos Full Color de Métodos de Pago Aceptados */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mr-1">
              Métodos Aceptados:
            </span>
            
            <div className="flex items-center gap-2.5">
              {/* Zelle */}
              <div className="h-10 px-3.5 bg-white rounded-xl border border-gray-700/60 shadow-md flex items-center justify-center hover:scale-105 transition-all" title="Zelle">
                <img src="/images/pay_methods/zelle.png" alt="Zelle" className="h-5 w-auto object-contain" />
              </div>

              {/* Square */}
              <div className="h-10 px-3.5 bg-white rounded-xl border border-gray-700/60 shadow-md flex items-center justify-center hover:scale-105 transition-all" title="Square">
                <img src="/images/pay_methods/square.png" alt="Square" className="h-5 w-auto object-contain" />
              </div>

              {/* Visa / Master / Tarjetas */}
              <div className="h-10 px-3.5 bg-white rounded-xl border border-gray-700/60 shadow-md flex items-center justify-center hover:scale-105 transition-all" title="Visa / MasterCard / Tarjetas">
                <img src="/images/pay_methods/visa.png" alt="Visa / MasterCard" className="h-6 w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
