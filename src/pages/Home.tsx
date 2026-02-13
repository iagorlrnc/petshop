import { useState, useEffect } from "react"
import { ArrowRight, Heart, Package } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

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
}

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(6)

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error("Error loading featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/hero-petshop.jpg"
            alt="PetShop"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <p className="mb-4 text-sm uppercase tracking-widest text-pet-orange animate-fade-in">
            🐾 Bem-vindo ao PetShop
          </p>
          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-white animate-fade-in">
            Tudo o que seu pet
            <br />
            <span className="text-pet-orange">merece</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base sm:text-lg lg:text-xl text-gray-100 animate-fade-in px-4">
            Encontre os melhores produtos, serviços e cuidados para seu
            companheiro de quatro patas. Tudo com amor e qualidade!
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in px-4">
            <button
              onClick={() => navigate("/catalogo")}
              className="bg-pet-orange text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-pet-brown transition-colors inline-flex items-center gap-2 shadow-lg shadow-pet-orange/50 w-full sm:w-auto justify-center"
            >
              Ver Produtos
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/servicos")}
              className="bg-pet-orange text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-pet-brown transition-colors inline-flex items-center gap-2 shadow-lg shadow-pet-orange/50 w-full sm:w-auto justify-center"
            >
              Ver Serviços
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/agendamento")}
              className="bg-transparent border-2 border-pet-orange text-pet-orange px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-pet-orange/10 transition-colors w-full sm:w-auto"
            >
              Agendar Serviço
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-24 3xl:py-32 bg-white dark:bg-gray-800">
        <div className="container-safe">
          <div className="grid-responsive-3 gap-responsive">
            {[
              {
                icon: Heart,
                title: "Produto de Qualidade",
                desc: "Tudo que seu pet ama com marcas reconhecidas e seguras",
              },
              {
                icon: Package,
                title: "Grande Variedade",
                desc: "Alimentos, brinquedos, acessórios e muito mais",
              },
              {
                icon: Heart,
                title: "Tratados com Amor",
                desc: "Cada pet recebe carinho e dedicação especial em cada serviço e interação",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="rounded-lg border border-pet-orange/20 bg-pet-cream dark:bg-gray-700 card-responsive text-center transition-all hover:border-pet-orange/50 hover:shadow-lg hover:shadow-pet-orange/30"
              >
                <feat.icon className="mx-auto mb-4 h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-pet-orange" />
                <h3 className="mb-2 text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery/Featured Products Section */}
      <section className="py-12 sm:py-16 lg:py-24 3xl:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container-safe">
          <div className="mb-8 sm:mb-12 text-center">
            <p className="mb-2 text-xs sm:text-sm uppercase tracking-widest text-pet-orange">
              ⭐ Produtos em Destaque
            </p>
            <h2 className="heading-responsive font-bold text-gray-800 dark:text-white">
              Produtos Favoritos dos Pets
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-pet-orange"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-responsive text-gray-600 dark:text-gray-300">
                Nenhum produto em destaque no momento
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 3xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-lg aspect-square border border-pet-orange/20 hover:border-pet-orange/50 transition-all hover:shadow-lg hover:shadow-pet-orange/30 bg-white dark:bg-gray-800"
                >
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <h3 className="text-pet-orange text-sm sm:text-base lg:text-lg font-bold text-center px-4">
                      {product.title}
                    </h3>
                    <p className="text-white font-semibold mt-2 text-xs sm:text-sm lg:text-base">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 sm:mt-12 text-center">
            <button
              onClick={() => navigate("/catalogo")}
              className="btn-responsive inline-flex items-center gap-2 border-2 border-pet-orange text-pet-orange rounded-lg font-semibold hover:bg-pet-orange/10 transition-colors"
            >
              Ver Todos os Produtos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24 3xl:py-32 bg-pet-orange text-white border-t border-pet-orange/20">
        <div className="container-safe text-center">
          <h2 className="mb-4 heading-responsive-small font-bold">
            Seu pet merece o melhor! 🐾
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-responsive text-white/90">
            Descubra nossos serviços profissionais e cuidados
            especiais para manter seu amigo sempre bonito e saudável.
          </p>
          <button
            onClick={() => navigate("/agendamento")}
            className="btn-responsive inline-flex items-center gap-2 bg-white text-pet-orange rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Agendar Serviço
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  )
}
