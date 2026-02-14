import { useState } from "react"
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
} from "lucide-react"

export function Location() {
  const [activeTab, setActiveTab] = useState<"localizacao" | "contato">(
    "localizacao",
  )

  const storeAddress = "Plano Diretor Sul - Palmas, TO"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="container-safe py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="heading-responsive font-bold text-gray-900 dark:text-white mb-4">
            Localização
          </h1>
          <p className="text-responsive text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Encontre a nossa loja e fale com a equipe quando precisar.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div
              role="tablist"
              aria-label="Informacoes da loja"
              className="flex"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "localizacao"}
                onClick={() => setActiveTab("localizacao")}
                className={`px-6 py-4 text-sm sm:text-base font-semibold border-b-2 transition-colors ${
                  activeTab === "localizacao"
                    ? "text-pet-orange border-pet-orange"
                    : "text-gray-600 dark:text-gray-300 border-transparent"
                }`}
              >
                Localização da loja
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "contato"}
                onClick={() => setActiveTab("contato")}
                className={`px-6 py-4 text-sm sm:text-base font-semibold border-b-2 transition-colors ${
                  activeTab === "contato"
                    ? "text-pet-orange border-pet-orange"
                    : "text-gray-600 dark:text-gray-300 border-transparent"
                }`}
              >
                Contato
              </button>
            </div>
          </div>

          {activeTab === "localizacao" ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_2fr] p-6 sm:p-8">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Endereço
                </h3>
                <div className="flex items-start gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-pet-orange mt-0.5" />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {storeAddress}
                  </p>
                </div>
                <a
                  href="https://maps.app.goo.gl/hZVKg9jXLoBqcC3j8"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-pet-orange text-white font-semibold hover:bg-pet-brown transition-colors"
                >
                  Ver no Google Maps
                </a>
              </div>

              <div className="rounded-xl overflow-hidden shadow-lg h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125632.67570910108!2d-48.429808331454105!3d-10.259880344743742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x933b3439911f1257%3A0x93b8070d05c818f!2sPalmas%2C%20TO!5e0!3m2!1spt-BR!2sbr!4v1771078224724!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização"
                ></iframe>
              </div>
              {/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125632.67570910108!2d-48.429808331454105!3d-10.259880344743742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x933b3439911f1257%3A0x93b8070d05c818f!2sPalmas%2C%20TO!5e0!3m2!1spt-BR!2sbr!4v1771078224724!5m2!1spt-BR!2sbr" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <Phone className="w-5 h-5 text-pet-orange" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Telefone
                    </p>
                    <a
                      href="tel:+5511999999999"
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-pet-orange"
                    >
                      (11) 99999-9999
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <MessageCircle className="w-5 h-5 text-pet-orange" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      WhatsApp
                    </p>
                    <a
                      href="https://wa.me/5511999999999"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-pet-orange"
                    >
                      (11) 99999-9999
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <Mail className="w-5 h-5 text-pet-orange" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      E-mail
                    </p>
                    <a
                      href="mailto:contato@petshop.com"
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-pet-orange"
                    >
                      contato@petshop.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <Instagram className="w-5 h-5 text-pet-orange" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Instagram
                    </p>
                    <a
                      href="https://instagram.com/petshop"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-pet-orange"
                    >
                      @petshop
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
