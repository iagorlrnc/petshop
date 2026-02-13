import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Filter,
  Eye,
  Check,
  X,
  Trash2,
  Image as ImageIcon,
} from "lucide-react"
import { supabase } from "../lib/supabase"

interface Appointment {
  id: string
  full_name: string
  email: string
  phone: string
  appointment_date: string
  appointment_time: string
  status: string
  tattoo_description: string
  tattoo_size?: string | null
  body_placement?: string | null
  notes?: string | null
  reference_images?: string | null
  updated_at?: string
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const filterAppointments = useCallback(() => {
    let filtered = [...appointments]

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.phone.includes(searchTerm) ||
          apt.tattoo_description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm, statusFilter])

  useEffect(() => {
    filterAppointments()
  }, [filterAppointments])

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error
      await loadAppointments()
      if (selectedAppointment?.id === id) {
        setSelectedAppointment({ ...selectedAppointment, status })
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)

      if (error) throw error
      await loadAppointments()
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(null)
      }
    } catch (error) {
      console.error("Error deleting appointment:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-900/40 text-yellow-300 border border-yellow-500",
      confirmed: "bg-green-900/40 text-green-300 border border-green-500",
      completed: "bg-blue-900/40 text-blue-300 border border-blue-500",
      cancelled: "bg-red-900/40 text-red-300 border border-red-500",
    }
    const labels = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
    }
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pet-orange"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-pet-orange/20 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pet-orange w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pet-orange/20 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-pet-orange focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pet-orange w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-pet-orange/20 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-pet-orange focus:border-transparent appearance-none text-sm sm:text-base w-full sm:w-auto"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="confirmed">Confirmados</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {filteredAppointments.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-300 py-8">
                Nenhum agendamento encontrado
              </p>
            ) : (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => setSelectedAppointment(appointment)}
                  className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                    selectedAppointment?.id === appointment.id
                      ? "border-pet-orange bg-gray-50 dark:bg-gray-700"
                      : "border-pet-orange/20 hover:border-pet-orange/50 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-pet-orange text-sm sm:text-base truncate">
                        {appointment.full_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {new Date(
                          appointment.appointment_date + "T00:00:00",
                        ).toLocaleDateString("pt-BR")}{" "}
                        às {appointment.appointment_time.substring(0, 5)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {appointment.tattoo_description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 sticky top-24 border border-pet-orange/20 dark:border-gray-700 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {selectedAppointment ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-pet-orange">
                  Detalhes
                </h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-pet-orange hover:text-pet-orange/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-pet-orange">
                    Cliente
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 dark:text-white break-words">
                    {selectedAppointment.full_name}
                  </p>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium text-pet-orange">
                    Email
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 dark:text-white break-all">
                    {selectedAppointment.email}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-pet-orange">
                    Telefone
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedAppointment.phone}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-pet-orange">
                    Data e Hora
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {new Date(
                      selectedAppointment.appointment_date + "T00:00:00",
                    ).toLocaleDateString("pt-BR")}{" "}
                    às {selectedAppointment.appointment_time.substring(0, 5)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-pet-orange">
                    Descrição
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedAppointment.tattoo_description}
                  </p>
                </div>

                {selectedAppointment.tattoo_size && (
                  <div>
                    <label className="text-sm font-medium text-pet-orange">
                      Tamanho
                    </label>
                    <p className="text-gray-800 dark:text-white">
                      {selectedAppointment.tattoo_size}
                    </p>
                  </div>
                )}

                {selectedAppointment.body_placement && (
                  <div>
                    <label className="text-sm font-medium text-pet-orange">
                      Localização
                    </label>
                    <p className="text-gray-800 dark:text-white">
                      {selectedAppointment.body_placement}
                    </p>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <label className="text-sm font-medium text-pet-orange">
                      Observações
                    </label>
                    <p className="text-gray-800 dark:text-white">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                {selectedAppointment.reference_images && (
                  <div>
                    <label className="text-sm font-medium text-pet-orange mb-2 block flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Imagens de Referência
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedAppointment.reference_images
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

                <div>
                  <label className="text-sm font-medium text-pet-orange mb-2 block">
                    Status
                  </label>
                  {getStatusBadge(selectedAppointment.status)}
                </div>

                <div className="pt-3 sm:pt-4 border-t border-pet-orange/20 dark:border-gray-700 space-y-2">
                  {selectedAppointment.status === "pending" && (
                    <button
                      onClick={() =>
                        updateStatus(selectedAppointment.id, "confirmed")
                      }
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmar</span>
                    </button>
                  )}

                  {selectedAppointment.status === "confirmed" && (
                    <button
                      onClick={() =>
                        updateStatus(selectedAppointment.id, "completed")
                      }
                      className="w-full flex items-center justify-center space-x-2 bg-pet-orange text-white py-2 rounded-lg hover:bg-pet-orange/90 transition-colors font-semibold"
                    >
                      <Check className="w-4 h-4" />
                      <span>Marcar como Concluído</span>
                    </button>
                  )}

                  {selectedAppointment.status !== "cancelled" &&
                    selectedAppointment.status !== "completed" && (
                      <button
                        onClick={() =>
                          updateStatus(selectedAppointment.id, "cancelled")
                        }
                        className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    )}

                  <button
                    onClick={() => deleteAppointment(selectedAppointment.id)}
                    className="w-full flex items-center justify-center space-x-2 border-2 border-red-600 text-red-400 py-2 rounded-lg hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-pet-orange/40 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Selecione um agendamento para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
