import { useState } from "react"
import { X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  if (!isOpen) return null

  const calculatePasswordStrength = (
    pwd: string,
  ): { strength: number; color: string; label: string } => {
    let strength = 0

    if (pwd.length >= 6) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    if (strength <= 1)
      return { strength: 1, color: "bg-red-500", label: "Fraca" }
    if (strength <= 3)
      return { strength: 2, color: "bg-yellow-500", label: "Média" }
    return { strength: 3, color: "bg-green-500", label: "Forte" }
  }

  const passwordStrength =
    !isLogin && password ? calculatePasswordStrength(password) : null

  const isPasswordValid = (pwd: string): boolean => {
    return (
      pwd.length >= 6 &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    )
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11)
    setPhone(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isLogin) {
      if (phone.length !== 11) {
        setError("Telefone deve ter 11 dígitos")
        return
      }

      if (!isPasswordValid(password)) {
        setError(
          "A senha deve conter no mínimo 6 caracteres, incluindo letra maiúscula, número e caractere especial",
        )
        return
      }

      if (password !== confirmPassword) {
        setError("As senhas não coincidem")
        return
      }
    }

    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, fullName, phone)
      }
      onClose()
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setFullName("")
      setPhone("")
    } catch (err) {
      console.error("Auth error:", err)

      // Mensagens de erro mais específicas
      if (err instanceof Error) {
        const message = err.message.toLowerCase()

        if (message.includes("user already registered")) {
          setError("Este e-mail já está cadastrado. Tente fazer login.")
        } else if (message.includes("invalid login credentials")) {
          setError("E-mail ou senha incorretos.")
        } else if (message.includes("email not confirmed")) {
          setError("Por favor, confirme seu e-mail antes de fazer login.")
        } else if (message.includes("weak password")) {
          setError(
            "Senha muito fraca. Use pelo menos 6 caracteres com letras, números e símbolos.",
          )
        } else {
          setError(err.message)
        }
      } else {
        setError(
          "Erro ao processar. Verifique se o banco de dados está configurado corretamente.",
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative border border-pet-orange/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-pet-orange/60 hover:text-pet-orange"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-pet-orange mb-6">
          {isLogin ? "Entrar" : "Criar Conta"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-800 dark:text-white mb-1"
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-800 dark:text-white mb-1"
                >
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="11999999999"
                  className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {phone.length}/11 dígitos
                </p>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800 dark:text-white mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-800 dark:text-white mb-1"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
              required
              minLength={6}
            />
            {!isLogin && password && (
              <div className="mt-2">
                <div className="flex gap-1 h-1 mb-1">
                  <div
                    className={`flex-1 rounded ${passwordStrength && passwordStrength.strength >= 1 ? passwordStrength.color : "bg-gray-300"}`}
                  ></div>
                  <div
                    className={`flex-1 rounded ${passwordStrength && passwordStrength.strength >= 2 ? passwordStrength.color : "bg-gray-300"}`}
                  ></div>
                  <div
                    className={`flex-1 rounded ${passwordStrength && passwordStrength.strength >= 3 ? passwordStrength.color : "bg-gray-300"}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Força da senha:{" "}
                  <span
                    className={
                      passwordStrength?.strength === 1
                        ? "text-red-600"
                        : passwordStrength?.strength === 2
                          ? "text-yellow-600"
                          : "text-green-600"
                    }
                  >
                    {passwordStrength?.label}
                  </span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Mínimo: 6 caracteres, 1 maiúscula, 1 número, 1 caractere
                  especial
                </p>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-800 dark:text-white mb-1"
              >
                Confirmar Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                required
                minLength={6}
              />
            </div>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pet-orange text-white py-3 rounded-lg hover:bg-pet-orange/90 transition-colors disabled:opacity-50 font-semibold"
          >
            {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-700 dark:text-gray-300 hover:text-pet-orange text-sm transition-colors"
          >
            {isLogin ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  )
}
