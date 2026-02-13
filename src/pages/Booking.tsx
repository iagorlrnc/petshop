import { useState, FormEvent } from "react"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"

interface BookingProps {
  onLoginClick: () => void
}

export function Booking({ onLoginClick }: BookingProps) {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    petName: "",
    petType: "",
    serviceType: "",
    appointmentDate: "",
    appointmentTime: "",
    petSize: "",
    additionalNotes: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!user) {
      onLoginClick()
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error: insertError } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          pet_name: formData.petName,
          pet_type: formData.petType,
          service_type: formData.serviceType,
          pet_size: formData.petSize,
          notes: formData.additionalNotes,
          status: "pending",
        })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        fullName: profile?.full_name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        petName: "",
        petType: "",
        serviceType: "",
        appointmentDate: "",
        appointmentTime: "",
        petSize: "",
        additionalNotes: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar agendamento")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <span className="text-5xl sm:text-6xl lg:text-7xl block mb-4">
            🐕
          </span>
          <h2 className="heading-responsive-small font-bold text-gray-800 dark:text-white mb-4">
            Entre ou cadastre-se
          </h2>
          <p className="text-responsive text-gray-600 dark:text-gray-300 mb-6">
            Você precisa estar autenticado para agendar um serviço
          </p>
          <button
            onClick={onLoginClick}
            className="btn-responsive bg-pet-orange text-white rounded-lg font-semibold hover:bg-pet-brown transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 lg:py-16 pt-24 sm:pt-28 lg:pt-32">
      <div className="max-w-3xl 3xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 card-responsive">
          <h1 className="heading-responsive font-bold text-gray-800 dark:text-white mb-2">
            🐾 Agendar Serviço
          </h1>
          <p className="text-responsive text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
            Preencha o formulário abaixo com os dados do seu pet e preferências
            de serviço
          </p>

          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
              Agendamento realizado com sucesso! Entraremos em contato em breve
              para confirmar.
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-800 dark:text-white mb-2">
                  👤 Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-800 dark:text-white mb-2">
                  📧 Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-800 dark:text-white mb-2">
                  📱 Telefone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-800 dark:text-white mb-2">
                  🐾 Nome do Pet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Floquinho, Belinha..."
                  value={formData.petName}
                  onChange={(e) =>
                    setFormData({ ...formData, petName: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-800 dark:text-white mb-2">
                  🐕 Tipo de Animal
                </label>
                <select
                  required
                  value={formData.petType}
                  onChange={(e) =>
                    setFormData({ ...formData, petType: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="cachorro">Cachorro</option>
                  <option value="gato">Gato</option>
                  <option value="coelho">Coelho</option>
                  <option value="hamster">Hamster</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                  📏 Tamanho do Pet
                </label>
                <select
                  required
                  value={formData.petSize}
                  onChange={(e) =>
                    setFormData({ ...formData, petSize: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="pequeno">Pequeno (até 5kg)</option>
                  <option value="medio">Médio (5-15kg)</option>
                  <option value="grande">Grande (15-30kg)</option>
                  <option value="gigante">Gigante (acima de 30kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                  ✂️ Tipo de Serviço
                </label>
                <select
                  required
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="banho">Banho Simples</option>
                  <option value="tosagem">Tosagem Completa</option>
                  <option value="grooming">Grooming Profissional</option>
                  <option value="limpeza-ouvidos">Limpeza de Ouvidos</option>
                  <option value="corte-unhas">Corte de Unhas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                  📅 Data Preferida
                </label>
                <input
                  type="date"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentDate: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                  🕐 Horário Preferido
                </label>
                <input
                  type="time"
                  required
                  value={formData.appointmentTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
                📝 Observações Adicionais
              </label>
              <textarea
                rows={4}
                placeholder="Alguma informação importante sobre seu pet? Alergias, temperamento, preferências..."
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalNotes: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pet-orange text-white py-3 rounded-lg font-semibold hover:bg-pet-brown transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Confirmar Agendamento"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
