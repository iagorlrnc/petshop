import { useState, useEffect, useCallback } from "react"
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"

interface Appointment {
  id: string
  full_name: string
  email: string
  phone: string
  appointment_date: string
  appointment_time: string
  pet_name: string | null
  pet_type: string | null
  service_type: string | null
  pet_size: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

interface MyAppointmentsProps {
  onLoginClick: () => void
}

export function MyAppointments({ onLoginClick }: MyAppointmentsProps) {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  const loadAppointments = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadAppointments()
    } else {
      setLoading(false)
    }
  }, [user, loadAppointments])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      pending: {
        bg: "bg-yellow-900/30",
        text: "text-yellow-400",
        label: "Pendente",
      },
      confirmed: {
        bg: "bg-green-900/30",
        text: "text-green-400",
        label: "Confirmado",
      },
      completed: {
        bg: "bg-blue-900/30",
        text: "text-blue-400",
        label: "Concluído",
      },
      cancelled: {
        bg: "bg-red-900/30",
        text: "text-red-400",
        label: "Cancelado",
      },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true
    return apt.status === filter
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <AlertCircle className="w-16 h-16 text-pet-orange/60 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-pet-orange mb-4">
            Faça login para acompanhar
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Você precisa estar autenticado para ver seus agendamentos
          </p>
          <button
            onClick={onLoginClick}
            className="bg-pet-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-pet-orange/90 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pet-orange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-6 sm:py-8 border-b border-pet-orange/20 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pet-orange">
            Meus Agendamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Acompanhe o status dos seus agendamentos
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex flex-nowrap gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === "all"
                  ? "bg-pet-orange text-white"
                  : "bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              Todos ({appointments.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              Pendentes (
              {appointments.filter((a) => a.status === "pending").length})
            </button>
            <button
              onClick={() => setFilter("confirmed")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === "confirmed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              Confirmados (
              {appointments.filter((a) => a.status === "confirmed").length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              Concluídos (
              {appointments.filter((a) => a.status === "completed").length})
            </button>
            <button
              onClick={() => setFilter("cancelled")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              Cancelados (
              {appointments.filter((a) => a.status === "cancelled").length})
            </button>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg border border-pet-orange/20 p-12 text-center">
            <Calendar className="w-16 h-16 text-pet-orange/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === "all"
                ? "Nenhum agendamento encontrado"
                : `Nenhum agendamento ${filter === "pending" ? "pendente" : filter === "confirmed" ? "confirmado" : filter === "completed" ? "concluído" : "cancelado"}`}
            </h3>
            <p className="text-gray-600">
              Faça seu primeiro agendamento e ele aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg border border-pet-orange/20 p-4 sm:p-6 hover:border-pet-orange/50 transition-colors"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-6 h-6 text-pet-orange mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(appointment.appointment_date)}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(appointment.appointment_time)}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Nome do Pet
                    </h4>
                    <p className="text-gray-900">
                      {appointment.pet_name || "Não informado"}
                    </p>
                  </div>

                  {appointment.pet_type && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Tipo do Pet
                      </h4>
                      <p className="text-gray-900">{appointment.pet_type}</p>
                    </div>
                  )}

                  {appointment.tattoo_size && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Tamanho
                      </h4>
                      <p className="text-white">{appointment.tattoo_size}</p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Observações
                      </h4>
                      <p className="text-white">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.reference_images && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Imagens de Referência
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {appointment.reference_images
                          .split(",")
                          .map((url: string, index: number) => (
                            <a
                              key={index}
                              href={url.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block aspect-square rounded-lg overflow-hidden border-2 border-pet-orange/20 hover:border-pet-orange transition-colors"
                            >
                              <img
                                src={url.trim()}
                                alt={`Referência ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-pet-orange/10">
                  <p className="text-xs text-gray-500">
                    Criado em:{" "}
                    {new Date(appointment.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
