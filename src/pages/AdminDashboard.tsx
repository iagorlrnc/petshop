import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"
import { AdminCalendar } from "../components/AdminCalendar"
import { AppointmentsList } from "../components/AppointmentsList"
import { PortfolioManager } from "../components/PortfolioManager"
import { ServiceManager } from "../components/ServiceManager"

export function AdminDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "calendar" | "appointments" | "portfolio" | "services"
  >("dashboard")
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.is_admin) {
      loadStats()
    }
  }, [profile])

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      const [
        { count: totalCount },
        { count: pendingCount },
        { count: confirmedCount },
        { count: completedCount },
        { count: todayCount },
        revenueData,
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "confirmed"),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed"),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("appointment_date", today),
        supabase
          .from("appointments")
          .select("estimated_price")
          .in("status", ["confirmed", "completed"]),
      ])

      const totalRevenue =
        revenueData.data?.reduce(
          (sum, appointment) =>
            sum + (Number(appointment.estimated_price) || 0),
          0,
        ) || 0

      setStats({
        totalAppointments: totalCount || 0,
        pendingAppointments: pendingCount || 0,
        confirmedAppointments: confirmedCount || 0,
        completedAppointments: completedCount || 0,
        todayAppointments: todayCount || 0,
        totalRevenue,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Você não tem permissão para acessar o painel administrativo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-6 sm:py-8 border-b border-pet-orange/20 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pet-orange">
            Painel Administrativo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gerencie agendamentos e visualize estatísticas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 mb-6 overflow-x-auto">
          <div className="border-b border-pet-orange/20 dark:border-gray-700">
            <nav className="flex space-x-2 sm:space-x-4 lg:space-x-8 px-4 sm:px-6 min-w-max">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "border-pet-orange text-pet-orange"
                    : "border-transparent text-gray-600 hover:text-pet-orange hover:border-pet-orange/50"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "calendar"
                    ? "border-pet-orange text-pet-orange"
                    : "border-transparent text-gray-600 hover:text-pet-orange hover:border-pet-orange/50"
                }`}
              >
                Calendário
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "appointments"
                    ? "border-pet-orange text-pet-orange"
                    : "border-transparent text-gray-600 hover:text-pet-orange hover:border-pet-orange/50"
                }`}
              >
                Agendamentos
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "portfolio"
                    ? "border-pet-orange text-pet-orange"
                    : "border-transparent text-gray-600 hover:text-pet-orange hover:border-pet-orange/50"
                }`}
              >
                Portfólio
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "services"
                    ? "border-pet-orange text-pet-orange"
                    : "border-transparent text-gray-600 hover:text-pet-orange hover:border-pet-orange/50"
                }`}
              >
                Serviços
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pet-orange"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-6 hover:border-pet-orange/50 transition-colors hover:shadow-lg hover:shadow-pet-orange/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Total de Agendamentos
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.totalAppointments}
                        </p>
                      </div>
                      <Calendar className="w-12 h-12 text-pet-orange" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-6 hover:border-pet-orange/50 transition-colors hover:shadow-lg hover:shadow-pet-orange/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Agendamentos Hoje
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.todayAppointments}
                        </p>
                      </div>
                      <Clock className="w-12 h-12 text-pet-orange" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-6 hover:border-pet-orange/50 transition-colors hover:shadow-lg hover:shadow-pet-orange/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Pendentes
                        </p>
                        <p className="text-3xl font-bold text-yellow-400 mt-2">
                          {stats.pendingAppointments}
                        </p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-yellow-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-6 hover:border-pet-orange/50 transition-colors hover:shadow-lg hover:shadow-pet-orange/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Confirmados
                        </p>
                        <p className="text-3xl font-bold text-green-400 mt-2">
                          {stats.confirmedAppointments}
                        </p>
                      </div>
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-6 hover:border-pet-orange/50 transition-colors hover:shadow-lg hover:shadow-pet-orange/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Concluídos
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.completedAppointments}
                        </p>
                      </div>
                      <Users className="w-12 h-12 text-pet-orange" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-6 hover:border-pet-orange/50 transition-colors hover:shadow-lg hover:shadow-pet-orange/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Valor Total</p>
                        <p className="text-3xl font-bold text-pet-orange mt-2">
                          R${" "}
                          {stats.totalRevenue.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <DollarSign className="w-12 h-12 text-pet-orange" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "calendar" && <AdminCalendar />}
        {activeTab === "appointments" && <AppointmentsList />}
        {activeTab === "portfolio" && <PortfolioManager />}
        {activeTab === "services" && <ServiceManager />}
      </div>
    </div>
  )
}
