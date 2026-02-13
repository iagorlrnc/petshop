import { useState, useEffect, useCallback } from "react"
import { Edit2, Trash2, Plus, Save, X } from "lucide-react"
import { supabase } from "../lib/supabase"

interface Service {
  id: string
  name: string
  description: string | null
  price_small: number
  price_medium: number
  price_large: number
  duration_minutes: number
  icon: string
  is_active: boolean
}

interface FormData {
  name: string
  description: string
  price_small: number
  price_medium: number
  price_large: number
  duration_minutes: number
  icon: string
}

const initialFormData: FormData = {
  name: "",
  description: "",
  price_small: 0,
  price_medium: 0,
  price_large: 0,
  duration_minutes: 60,
  icon: "heart",
}

const iconOptions = [
  "heart",
  "bath",
  "scissors",
  "stethoscope",
  "sparkles",
  "dog",
]

export function ServiceManager() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isAdding, setIsAdding] = useState(false)

  const loadServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name")

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Error loading services:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.currentTarget
    const numFields = [
      "price_small",
      "price_medium",
      "price_large",
      "duration_minutes",
    ]

    setFormData({
      ...formData,
      [name]: numFields.includes(name) ? parseFloat(value) || 0 : value,
    })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Nome do serviço é obrigatório")
      return
    }

    try {
      if (editingId) {
        // Update existing service
        const { error } = await supabase
          .from("services")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        // Create new service
        const { error } = await supabase.from("services").insert([
          {
            ...formData,
            is_active: true,
          },
        ])

        if (error) throw error
      }

      await loadServices()
      resetForm()
    } catch (error) {
      console.error("Error saving service:", error)
      alert("Erro ao salvar serviço")
    }
  }

  const handleEdit = (service: Service) => {
    setEditingId(service.id)
    setFormData({
      name: service.name,
      description: service.description || "",
      price_small: service.price_small,
      price_medium: service.price_medium,
      price_large: service.price_large,
      duration_minutes: service.duration_minutes,
      icon: service.icon,
    })
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este serviço?")) return

    try {
      const { error } = await supabase.from("services").delete().eq("id", id)

      if (error) throw error
      await loadServices()
    } catch (error) {
      console.error("Error deleting service:", error)
      alert("Erro ao deletar serviço")
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
    setIsAdding(false)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pet-orange"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-pet-orange">
            {editingId ? "Editar Serviço" : "Novo Serviço"}
          </h3>
          {(editingId || isAdding) && (
            <button
              onClick={resetForm}
              className="text-gray-600 dark:text-gray-400 hover:text-pet-orange"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {editingId || isAdding ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pet-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ícone
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pet-orange"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pet-orange"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço Pequeno
                </label>
                <input
                  type="number"
                  name="price_small"
                  value={formData.price_small}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pet-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço Médio
                </label>
                <input
                  type="number"
                  name="price_medium"
                  value={formData.price_medium}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pet-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço Grande
                </label>
                <input
                  type="number"
                  name="price_large"
                  value={formData.price_large}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pet-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duração (min)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  min="15"
                  step="15"
                  className="w-full px-3 py-2 border border-pet-orange/20 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pet-orange"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-pet-orange text-white py-2 rounded-lg font-semibold hover:bg-pet-brown transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
              <button
                onClick={resetForm}
                className="flex-1 border-2 border-gray-300 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold hover:border-pet-orange transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 bg-pet-orange text-white py-2 rounded-lg font-semibold hover:bg-pet-brown transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Novo Serviço
          </button>
        )}
      </div>

      {/* Services List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b border-pet-orange/20">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Preços
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Duração
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-600 dark:text-gray-400"
                  >
                    Nenhum serviço cadastrado
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-pet-orange/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                      {service.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {service.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <div className="space-y-1">
                        <div>P: R$ {service.price_small.toFixed(2)}</div>
                        <div>M: R$ {service.price_medium.toFixed(2)}</div>
                        <div>G: R$ {service.price_large.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {service.duration_minutes} min
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
