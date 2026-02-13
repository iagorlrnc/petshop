import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Star, Edit2, X, Check, Upload } from "lucide-react"
import { supabase } from "../lib/supabase"

interface Category {
  id: string
  name: string
  slug: string
}

interface Tattoo {
  id: string
  title: string
  description: string | null
  category_id: string | null
  price: number
  image_url: string
  is_featured: boolean
  categories?: {
    name: string
  }
}

export function PortfolioManager() {
  const [tattoos, setTattoos] = useState<Tattoo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
    image_url: "",
    is_featured: false,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [{ data: productsData }, { data: categoriesData }] =
        await Promise.all([
          supabase
            .from("products")
            .select(
              `
            *,
            categories (
              name
            )
          `,
            )
            .order("created_at", { ascending: false }),
          supabase.from("categories").select("*").order("display_order"),
        ])

      setTattoos(productsData || [])
      setCategories(categoriesData || [])
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category_id: "",
      price: "",
      image_url: "",
      is_featured: false,
    })
    setImageFile(null)
    setImagePreview("")
    setEditingId(null)
    setShowForm(false)
    setError("")
    setSuccess("")
  }

  const handleEdit = (tattoo: Tattoo) => {
    setFormData({
      title: tattoo.title,
      description: tattoo.description || "",
      category_id: tattoo.category_id || "",
      price: tattoo.price.toString(),
      image_url: tattoo.image_url,
      is_featured: tattoo.is_featured,
    })
    setImagePreview(tattoo.image_url)
    setEditingId(tattoo.id)
    setShowForm(true)
    setError("")
    setSuccess("")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setError("Apenas arquivos de imagem são permitidos")
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB")
      return
    }

    setImageFile(file)

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setError("")
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null

    setUploading(true)
    try {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `tattoos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio").getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error("Error uploading image:", err)
      throw new Error("Erro ao fazer upload da imagem")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.title || !formData.price) {
      setError("Preencha todos os campos obrigatórios")
      return
    }

    if (!imageFile && !formData.image_url) {
      setError("Selecione uma imagem")
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      setError("Preço inválido")
      return
    }

    try {
      setUploading(true)

      // Upload da imagem se houver um novo arquivo
      const imageUrl = await uploadImage()

      if (!imageUrl) {
        setError("Erro ao processar imagem")
        return
      }

      const tattooData = {
        title: formData.title,
        description: formData.description || null,
        category_id: formData.category_id || null,
        price: price,
        image_url: imageUrl,
        is_featured: formData.is_featured,
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from("products")
          .update(tattooData)
          .eq("id", editingId)

        if (updateError) throw updateError
        setSuccess("Produto atualizado com sucesso!")
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert(tattooData)

        if (insertError) throw insertError
        setSuccess("Produto adicionado com sucesso!")
      }

      await loadData()
      setTimeout(() => {
        resetForm()
      }, 1500)
    } catch (err) {
      console.error("Error saving tattoo:", err)
      setError("Erro ao salvar tatuagem")
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm("Tem certeza que deseja remover esta tatuagem do portfólio?")
    ) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

      if (deleteError) throw deleteError

      setSuccess("Produto removido com sucesso!")
      await loadData()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Erro ao remover produto")
      setTimeout(() => setError(""), 3000)
    }
  }

  const toggleFeatured = async (tattoo: Tattoo) => {
    try {
      const { error: updateError } = await supabase
        .from("products")
        .update({ is_featured: !tattoo.is_featured })
        .eq("id", tattoo.id)

      if (updateError) throw updateError
      await loadData()
    } catch (err) {
      console.error("Error toggling featured:", err)
      setError("Erro ao atualizar destaque")
      setTimeout(() => setError(""), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pet-orange"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciar Portfólio
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Adicione, edite ou remova produtos do catálogo
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pet-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-pet-orange/90 transition-colors flex items-center gap-2"
        >
          {showForm ? (
            <>
              <X className="w-5 h-5" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Adicionar Tatuagem
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingId ? "Editar Produto" : "Novo Produto"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                placeholder="Ex: Ração Premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                placeholder="89.90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Categoria
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pet-orange focus:border-transparent"
              >
                <option value="">Sem categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pet-orange focus:border-transparent"
                placeholder="Descreva os detalhes do produto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Imagem do Produto *
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative w-64 mx-auto">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-pet-orange/20">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview("")
                        setFormData({ ...formData, image_url: "" })
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-pet-orange/20 rounded-lg p-8 text-center hover:border-pet-orange/50 transition-colors">
                    <Upload className="w-12 h-12 text-pet-orange/60 mx-auto mb-3" />
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Clique para selecionar uma imagem
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      PNG, JPG ou WEBP (máx. 5MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-pet-orange/20 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pet-orange file:text-white file:font-semibold hover:file:bg-pet-orange/90 file:cursor-pointer cursor-pointer"
                  required={!editingId && !imagePreview}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="w-4 h-4 text-pet-orange bg-gray-50 border-pet-orange/20 rounded focus:ring-pet-orange"
              />
              <label htmlFor="is_featured" className="text-sm text-gray-900">
                Destacar na página inicial
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-pet-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-pet-orange/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Fazendo upload...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {editingId ? "Salvar Alterações" : "Adicionar"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="border border-pet-orange/20 text-gray-900 dark:text-white dark:border-gray-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-pet-orange/20 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-pet-orange/20 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Produtos no Catálogo ({tattoos.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Imagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pet-orange/10">
              {tattoos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-600"
                  >
                    Nenhum produto cadastrado. Clique em "Adicionar" para
                    começar.
                  </td>
                </tr>
              ) : (
                tattoos.map((tattoo) => (
                  <tr key={tattoo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={tattoo.image_url}
                        alt={tattoo.title}
                        className="w-16 h-16 object-cover rounded-lg border border-pet-orange/20"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/64?text=Sem+Imagem"
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {tattoo.title}
                      </div>
                      {tattoo.description && (
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {tattoo.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {tattoo.categories?.name || "Sem categoria"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-pet-orange">
                        R$ {tattoo.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(tattoo)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          tattoo.is_featured
                            ? "bg-pet-orange/20 text-pet-orange hover:bg-pet-orange/30"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <Star
                          className={`w-3 h-3 ${
                            tattoo.is_featured ? "fill-pet-orange" : ""
                          }`}
                        />
                        {tattoo.is_featured ? "Destaque" : "Normal"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tattoo)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tattoo.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-5 h-5" />
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
