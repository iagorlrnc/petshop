import { Menu, X, LogOut, User, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"

interface HeaderProps {
  onLoginClick: () => void
  hideOnTop?: boolean
}

export function Header({ onLoginClick, hideOnTop = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showHeader, setShowHeader] = useState(!hideOnTop)
  const { user, profile, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Mapa de páginas para rotas
  const routes = {
    home: "/",
    catalog: "/catalogo",
    services: "/servicos",
    booking: "/agendamento",
    appointments: "/meus-agendamentos",
    admin: "/painel-admin",
  }

  useEffect(() => {
    if (!hideOnTop) {
      setShowHeader(true)
      return
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      if (scrollPosition > 100) {
        setShowHeader(true)
      } else {
        setShowHeader(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hideOnTop])

  const handleSignOut = async () => {
    await signOut()
    navigate(routes.home)
  }

  return (
    <header
      className={`bg-white dark:bg-gray-900 shadow-sm fixed top-0 left-0 right-0 z-40 border-b border-pet-orange/20 transition-transform duration-300 ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <button
            onClick={() => navigate(routes.home)}
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-pet-orange hover:text-pet-brown transition-colors flex items-center gap-2"
          >
            <span className="text-2xl">🐾</span>
            <span className="hidden sm:inline">PetShop</span>
            <span className="sm:hidden">PetShop</span>
          </button>

          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            <button
              onClick={() => navigate(routes.home)}
              className="text-gray-900 dark:text-white hover:text-pet-orange transition-colors"
            >
              Início
            </button>
            <button
              onClick={() => navigate(routes.catalog)}
              className="text-gray-900 dark:text-white hover:text-pet-orange transition-colors"
            >
              Catálogo
            </button>
            <button
              onClick={() => navigate(routes.services)}
              className="text-gray-900 dark:text-white hover:text-pet-orange transition-colors"
            >
              Serviços
            </button>
            <button
              onClick={() => navigate(routes.booking)}
              className="text-gray-900 dark:text-white hover:text-pet-orange transition-colors"
            >
              Agendar
            </button>
            {user && (
              <button
                onClick={() => navigate(routes.appointments)}
                className="text-gray-900 dark:text-white hover:text-pet-orange transition-colors"
              >
                Acompanhar
              </button>
            )}
            {profile?.is_admin && (
              <button
                onClick={() => navigate(routes.admin)}
                className="text-gray-900 dark:text-white hover:text-pet-orange transition-colors"
              >
                Painel Admin
              </button>
            )}
          </nav>

          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-pet-orange" />
                  <span className="text-xs xl:text-sm text-gray-900 dark:text-white truncate max-w-[150px] xl:max-w-[200px]">
                    {profile?.full_name || profile?.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-900 dark:text-white hover:text-pet-orange transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-pet-orange text-white px-6 py-2 rounded-lg hover:bg-pet-brown transition-colors font-semibold"
              >
                Entrar
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-900 dark:text-white"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-2">
            <button
              onClick={() => {
                navigate(routes.home)
                setIsMenuOpen(false)
              }}
              className="block w-full text-left text-gray-900 dark:text-white hover:text-pet-orange px-4 py-2"
            >
              Início
            </button>
            <button
              onClick={() => {
                navigate(routes.catalog)
                setIsMenuOpen(false)
              }}
              className="block w-full text-left text-gray-900 dark:text-white hover:text-pet-orange px-4 py-2"
            >
              Catálogo
            </button>
            <button
              onClick={() => {
                navigate(routes.services)
                setIsMenuOpen(false)
              }}
              className="block w-full text-left text-gray-900 dark:text-white hover:text-pet-orange px-4 py-2"
            >
              Serviços
            </button>
            <button
              onClick={() => {
                navigate(routes.booking)
                setIsMenuOpen(false)
              }}
              className="block w-full text-left text-gray-900 dark:text-white hover:text-pet-orange px-4 py-2"
            >
              Agendar
            </button>
            {user && (
              <button
                onClick={() => {
                  navigate(routes.appointments)
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left text-gray-900 dark:text-white hover:text-pet-orange px-4 py-2"
              >
                Acompanhar
              </button>
            )}
            {profile?.is_admin && (
              <button
                onClick={() => {
                  navigate(routes.admin)
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left text-gray-900 dark:text-white hover:text-pet-orange px-4 py-2"
              >
                Painel Admin
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="block w-full text-left text-gray-900 dark:text-white hover:text-pet-orange px-4 py-2 flex items-center gap-2"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>
            {user ? (
              <button
                onClick={handleSignOut}
                className="block w-full text-left text-gray-900 dark:text-white hover:text-pet-orange px-4 py-2"
              >
                Sair
              </button>
            ) : (
              <button
                onClick={() => {
                  onLoginClick()
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left bg-pet-orange text-white px-4 py-2 rounded-lg hover:bg-pet-brown font-semibold"
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
