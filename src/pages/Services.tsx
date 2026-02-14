import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import {
  Scissors,
  Bath,
  Stethoscope,
  Heart,
  Sparkles,
  DogIcon,
} from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
  price_small: number
  price_medium: number
  price_large: number
  duration_minutes: number
  icon: string
}

export function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      scissors: <Scissors className="w-12 h-12" />,
      bath: <Bath className="w-12 h-12" />,
      stethoscope: <Stethoscope className="w-12 h-12" />,
      heart: <Heart className="w-12 h-12" />,
      sparkles: <Sparkles className="w-12 h-12" />,
      dog: <DogIcon className="w-12 h-12" />,
    }
    return icons[iconName] || <Heart className="w-12 h-12" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pet-orange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="container-safe py-8 sm:py-12">
        {/* Grid de Serviços */}
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-responsive text-gray-600 dark:text-gray-300">
              Nenhum serviço disponível no momento. Tente novamente mais tarde!
            </p>
          </div>
        ) : (
          <div className="grid-responsive-3 gap-responsive">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pet-orange to-pet-brown p-6 sm:p-8 lg:p-10 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getIcon(service.icon)}
                </div>

                <div className="card-responsive">
                  <h3 className="heading-responsive-small font-bold text-gray-900 dark:text-white mb-3">
                    {service.name}
                  </h3>
                  <p className="text-responsive text-gray-600 dark:text-gray-300 mb-4">
                    {service.description}
                  </p>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Porte Pequeno:
                      </span>
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-pet-orange">
                        R$ {service.price_small.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Porte Médio:
                      </span>
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-pet-orange">
                        R$ {service.price_medium.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Porte Grande:
                      </span>
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-pet-orange">
                        R$ {service.price_large.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Duração:
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {service.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-pet-orange to-pet-brown text-white rounded-2xl card-responsive shadow-2xl">
            <h2 className="heading-responsive-small font-bold mb-4">
              Pronto para cuidar do seu pet?
            </h2>
            <p className="text-responsive mb-6 opacity-90">
              Agende agora mesmo e garanta o melhor atendimento para seu amigo
            </p>
            <Link
              to="/agendamento"
              className="inline-block btn-responsive bg-white text-pet-orange font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Agendar Serviço
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
