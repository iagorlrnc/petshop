import { useState } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { AuthModal } from "./components/AuthModal"
import { ScrollToTop } from "./components/ScrollToTop"
import { Home } from "./pages/Home"
import { Catalog } from "./pages/Catalog"
import { Services } from "./pages/Services"
import { Location } from "./pages/Location"
import { Booking } from "./pages/Booking"
import { MyAppointments } from "./pages/MyAppointments"
import { AdminDashboard } from "./pages/AdminDashboard"

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { loading } = useAuth()
  const location = useLocation()

  // Mapear path para página para determinar se deve ocultar header no top
  const getPageFromPath = (
    path: string,
  ):
    | "home"
    | "catalog"
    | "services"
    | "location"
    | "booking"
    | "appointments"
    | "admin" => {
    switch (path) {
      case "/catalogo":
        return "catalog"
      case "/servicos":
        return "services"
      case "/localizacao":
        return "location"
      case "/agendamento":
        return "booking"
      case "/meus-agendamentos":
        return "appointments"
      case "/painel-admin":
        return "admin"
      default:
        return "home"
    }
  }

  const currentPage = getPageFromPath(location.pathname)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pet-orange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ScrollToTop />
      <Header
        onLoginClick={() => setIsAuthModalOpen(true)}
        hideOnTop={currentPage === "home"}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/localizacao" element={<Location />} />
          <Route
            path="/agendamento"
            element={<Booking onLoginClick={() => setIsAuthModalOpen(true)} />}
          />
          <Route
            path="/meus-agendamentos"
            element={
              <MyAppointments onLoginClick={() => setIsAuthModalOpen(true)} />
            }
          />
          <Route path="/painel-admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
