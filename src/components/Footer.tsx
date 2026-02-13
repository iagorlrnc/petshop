import { Instagram, MessageSquare } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-pet-orange/20 mt-auto">
      <div className="container-safe py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-pet-orange text-lg sm:text-xl font-bold mb-4">
              🐾 PetShop
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
              Seu petshop de confiança com produtos de qualidade, serviços de
              grooming profissional e muito amor pelos seus pets. Venha nos
              visitar!
            </p>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-pet-orange text-lg sm:text-xl font-bold mb-4">
              Contato
            </h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>(63) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span className="break-all">contato@petshop.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>Palmas, TO</span>
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="text-pet-orange text-lg sm:text-xl font-bold mb-4">
              Redes Sociais
            </h3>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-pink-400 to-purple-500 p-2.5 sm:p-3 rounded-lg hover:shadow-lg hover:shadow-pink-400/50 transition-all group"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 p-2.5 sm:p-3 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all group"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-pet-orange/20 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          <p>
            &copy; {currentYear} PetShop. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
