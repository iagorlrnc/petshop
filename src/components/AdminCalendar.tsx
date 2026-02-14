import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "../lib/supabase"

interface Appointment {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  appointment_date: string
  appointment_time: string
  tattoo_description: string
  tattoo_size: string | null
  body_placement: string | null
  reference_images: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointmentsByDay, setAppointmentsByDay] = useState<
    Map<string, number>
  >(new Map())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const loadMonthAppointments = useCallback(async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1).toISOString().split("T")[0]
      const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date")
        .gte("appointment_date", firstDay)
        .lte("appointment_date", lastDay)

      if (error) throw error

      const countMap = new Map<string, number>()
      data?.forEach((appointment) => {
        const date = appointment.appointment_date
        countMap.set(date, (countMap.get(date) || 0) + 1)
      })

      setAppointmentsByDay(countMap)
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    loadMonthAppointments()
  }, [loadMonthAppointments])

  const loadDayAppointments = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("appointment_date", date)
        .order("appointment_time")

      if (error) throw error
      setDayAppointments(data || [])
      setSelectedDate(date)
    } catch (error) {
      console.error("Error loading day appointments:", error)
    }
  }

  const getDayColor = (count: number) => {
    if (count === 0) return "bg-gray-50"
    if (count <= 5) return "bg-green-100 border-green-500"
    if (count <= 10) return "bg-yellow-100 border-yellow-500"
    return "bg-red-100 border-red-500"
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const formatDate = (day: number) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const dayStr = String(day).padStart(2, "0")
    return `${year}-${month}-${dayStr}`
  }

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    )
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    )
    setSelectedDate(null)
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-900 dark:text-white text-xs sm:text-sm py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const dateStr = formatDate(day)
              const count = appointmentsByDay.get(dateStr) || 0
              const colorClass = getDayColor(count)
              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={day}
                  onClick={() => loadDayAppointments(dateStr)}
                  className={`aspect-square rounded-lg border-2 transition-all ${colorClass} ${
                    isSelected
                      ? "border-pet-orange ring-2 ring-pet-orange/50"
                      : "border-pet-orange/20 hover:border-pet-orange/50"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="font-semibold text-gray-900 dark:text-black text-xs sm:text-base">
                      {day}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-black">
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-4 sm:mt-6 flex items-center justify-center space-x-3 sm:space-x-6 text-xs sm:text-sm flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-50 dark:bg-gray-700 border-2 border-pet-orange/30 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Livre</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Até 5</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">5-10</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Acima de 10
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-pet-orange/20 dark:border-gray-700 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <h3 className="text-base sm:text-lg font-bold text-pet-orange mb-4">
            {selectedDate
              ? `Agendamentos - ${new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}`
              : "Selecione uma data"}
          </h3>

          {selectedDate ? (
            dayAppointments.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                Nenhum agendamento neste dia
              </p>
            ) : (
              <div className="space-y-3">
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-pet-orange/20 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-pet-orange">
                        {appointment.appointment_time.substring(0, 5)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "confirmed"
                            ? "bg-green-900/40 text-green-300 border border-green-500"
                            : appointment.status === "pending"
                              ? "bg-yellow-900/40 text-yellow-300 border border-yellow-500"
                              : appointment.status === "completed"
                                ? "bg-blue-900/40 text-blue-300 border border-blue-500"
                                : "bg-red-900/40 text-red-300 border border-red-500"
                        }`}
                      >
                        {appointment.status === "confirmed"
                          ? "Confirmado"
                          : appointment.status === "pending"
                            ? "Pendente"
                            : appointment.status === "completed"
                              ? "Concluído"
                              : "Cancelado"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-white">
                      {appointment.full_name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {appointment.tattoo_description}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              Clique em uma data no calendário para ver os agendamentos
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
