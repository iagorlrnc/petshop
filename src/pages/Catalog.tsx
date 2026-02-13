import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  created_at: string
}

interface Product {
  id: string
  title: string
  description: string | null
  category_id: string | null
  price: number
  image_url: string
  is_featured: boolean
  created_at: string
  updated_at: string
  categories?: {
    name: string
    slug: string
  }
}

export function Catalog() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAllProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            name,
            slug
          )
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }, [])

  const loadProductsByCategory = useCallback(async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            name,
            slug
          )
        `,
        )
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }, [])

  const loadData = useCallback(async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("display_order")

      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])

      await loadAllProducts()
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [loadAllProducts])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCategoryClick = async (categoryId: string | null) => {
    setSelectedCategory(categoryId)

    if (categoryId === null) {
      await loadAllProducts()
    } else {
      await loadProductsByCategory(categoryId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="container-safe py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="heading-responsive font-bold text-gray-800 dark:text-white mb-4">
            🛍️ Nossos Produtos
          </h1>
          <p className="text-responsive text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Encontre tudo que seu pet precisa: alimentos, brinquedos, acessórios
            e muito mais!
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-6 sm:mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 sm:gap-3 min-w-max">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap text-xs sm:text-sm lg:text-base ${
                selectedCategory === null
                  ? "bg-pet-orange text-white"
                  : "bg-white dark:bg-gray-800 border border-pet-orange/20 dark:border-gray-700 text-gray-700 dark:text-white hover:border-pet-orange"
              }`}
            >
              Todos os Produtos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap text-xs sm:text-sm lg:text-base ${
                  selectedCategory === category.id
                    ? "bg-pet-orange text-white"
                    : "bg-white dark:bg-gray-800 border border-pet-orange/20 dark:border-gray-700 text-gray-700 dark:text-white hover:border-pet-orange"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12 lg:py-16">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-pet-orange"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 lg:py-16">
            <p className="text-responsive text-gray-600 dark:text-gray-300">
              Nenhum produto encontrado
            </p>
          </div>
        ) : (
          <div className="grid-responsive-products gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-pet-orange/50 hover:scale-105"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 sm:p-4 lg:p-5">
                  <p className="text-xs sm:text-xs lg:text-sm text-pet-orange font-semibold uppercase tracking-widest">
                    {product.categories?.name || "Sem categoria"}
                  </p>
                  <h3 className="mt-2 font-semibold text-sm sm:text-base lg:text-lg text-gray-800 dark:text-white line-clamp-2">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-3 sm:mt-4">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-pet-orange">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
