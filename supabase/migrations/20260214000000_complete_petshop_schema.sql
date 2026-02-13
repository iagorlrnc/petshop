/*
  # Complete PetShop Database Schema
  
  ⚠️  ATENÇÃO: Este arquivo assume que o banco de dados está COMPLETAMENTE VAZIO!
  
  Este script NÃO remove dados existentes. Se você tiver tabelas, usuários ou dados
  pré-existentes, este script pode falhar ou gerar erros de chaves duplicadas.
  
  Para um banco limpo, este arquivo cria toda a estrutura do zero.
  
  ## Tabelas que serão criadas
  - profiles: Perfis de usuários
  - categories: Categorias de produtos
  - products: Produtos do petshop
  - services: Serviços oferecidos (banho, tosa, veterinaria, etc)
  - appointments: Agendamentos de serviços
  
  ## Dados que serão inseridos
  - 6 categorias de produtos
  - 6 serviços ativos
  - 30+ produtos com imagens
  - Funções e triggers automáticos
  - Políticas de segurança RLS
  
  ## Como usar
  1. Certifique-se que seu banco está vazio OU
  2. Execute um reset completo antes (npx supabase db reset)
  3. Execute este script inteiro de uma vez
*/

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Remover funções existentes (se houver)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Função para atualizar updated_at automaticamente
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente ao registrar novo usuário
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TABELA: profiles
-- =====================================================

DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver perfis"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- TABELA: categories
-- =====================================================

DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver categorias"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Apenas admins podem inserir categorias"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Apenas admins podem atualizar categorias"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Apenas admins podem deletar categorias"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- TABELA: products
-- =====================================================

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price decimal(10, 2) NOT NULL DEFAULT 0,
  image_url text NOT NULL,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver produtos"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Apenas admins podem inserir produtos"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Apenas admins podem atualizar produtos"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Apenas admins podem deletar produtos"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- TABELA: services
-- =====================================================

DROP TABLE IF EXISTS services CASCADE;

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_small decimal(10, 2) NOT NULL DEFAULT 0,
  price_medium decimal(10, 2) NOT NULL DEFAULT 0,
  price_large decimal(10, 2) NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  icon text DEFAULT 'heart',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_services_name ON services(name);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver serviços ativos"
  ON services FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins podem ver todos os serviços"
  ON services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Apenas admins podem inserir serviços"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Apenas admins podem atualizar serviços"
  ON services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Apenas admins podem deletar serviços"
  ON services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- TABELA: appointments
-- =====================================================

DROP TABLE IF EXISTS appointments CASCADE;

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  pet_name text,
  pet_type text,
  service_type text,
  pet_size text,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  estimated_price decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios agendamentos"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios agendamentos"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios agendamentos"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os agendamentos"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins podem atualizar todos os agendamentos"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins podem deletar agendamentos"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- DADOS INICIAIS: Categorias
-- =====================================================

INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Alimentos & Rações', 'alimentos-racoes', 'Rações premium e alimentos naturais para cães, gatos e outros pets', 1),
  ('Brinquedos', 'brinquedos', 'Brinquedos seguros, divertidos e educativos para seu pet', 2),
  ('Acessórios', 'acessorios', 'Coleiras, guias, peitoral, camas e muito mais', 3),
  ('Higiene & Banho', 'higiene-banho', 'Produtos de limpeza, shampoos e condicionadores especiais', 4),
  ('Saúde & Medicamentos', 'saude-medicamentos', 'Suplementos, vitaminas e produtos para saúde do seu pet', 5),
  ('Camas & Móveis', 'camas-moveis', 'Camas confortáveis, casinhas e móveis para pets', 6);

-- =====================================================
-- DADOS INICIAIS: Serviços
-- =====================================================

INSERT INTO services (name, description, price_small, price_medium, price_large, duration_minutes, icon, is_active) VALUES
  ('Banho', 'Banho completo com shampoo e condicionador premium, secagem e escovação', 45.00, 65.00, 90.00, 60, 'bath', true),
  ('Tosa', 'Tosa higiênica ou completa com corte personalizado para cada raça', 55.00, 75.00, 105.00, 90, 'scissors', true),
  ('Banho e Tosa', 'Combo completo: banho premium + tosa profissional', 85.00, 120.00, 170.00, 120, 'sparkles', true),
  ('Consulta Veterinária', 'Consulta completa com veterinário experiente, exame clínico e orientações', 120.00, 120.00, 140.00, 30, 'stethoscope', true),
  ('Vacinação', 'Aplicação de vacinas com certificado, incluindo orientação pós-vacinal', 80.00, 80.00, 80.00, 20, 'heart', true),
  ('Hidratação', 'Tratamento intensivo para pelos ressecados com produtos especializados', 70.00, 95.00, 130.00, 75, 'sparkles', true);

-- =====================================================
-- DADOS INICIAIS: Produtos em Destaque
-- =====================================================

-- Pegando IDs das categorias para referência
DO $$
DECLARE
  cat_alimentos uuid;
  cat_brinquedos uuid;
  cat_acessorios uuid;
  cat_higiene uuid;
  cat_saude uuid;
  cat_camas uuid;
BEGIN
  SELECT id INTO cat_alimentos FROM categories WHERE slug = 'alimentos-racoes';
  SELECT id INTO cat_brinquedos FROM categories WHERE slug = 'brinquedos';
  SELECT id INTO cat_acessorios FROM categories WHERE slug = 'acessorios';
  SELECT id INTO cat_higiene FROM categories WHERE slug = 'higiene-banho';
  SELECT id INTO cat_saude FROM categories WHERE slug = 'saude-medicamentos';
  SELECT id INTO cat_camas FROM categories WHERE slug = 'camas-moveis';

  -- Produtos em destaque
  INSERT INTO products (title, description, category_id, price, image_url, is_featured) VALUES
    -- Alimentos & Rações
    ('Ração Premium Royal Canin', 'Ração super premium para cães adultos com ingredientes selecionados', cat_alimentos, 189.90, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&h=600', true),
    ('Ração Golden Gatos', 'Alimento completo para gatos adultos castrados', cat_alimentos, 129.90, 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&w=600&h=600', true),
    ('Sachê Whiskas Frango', 'Alimento úmido sabor frango para gatos', cat_alimentos, 3.50, 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=600&h=600', false),
    
    -- Brinquedos
    ('Bola de Borracha Natural', 'Brinquedo durável e seguro para cães de todos os tamanhos', cat_brinquedos, 24.90, 'https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&w=600&h=600', true),
    ('Varinha com Penas', 'Brinquedo interativo para gatos com penas coloridas', cat_brinquedos, 18.90, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=600&h=600', true),
    ('Mordedor de Corda', 'Corda de algodão para higiene bucal e diversão', cat_brinquedos, 15.90, 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?auto=format&fit=crop&w=600&h=600', false),
    ('Frisbee Resistente', 'Disco voador resistente para brincadeiras ao ar livre', cat_brinquedos, 29.90, 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=600&h=600', false),
    
    -- Acessórios
    ('Coleira Premium Ajustável', 'Coleira confortável de nylon com fivela de segurança', cat_acessorios, 45.90, 'https://images.unsplash.com/photo-1633722715463-d30628519d65?auto=format&fit=crop&w=600&h=600', true),
    ('Guia Retrátil 5m', 'Guia retrátil resistente para cães até 20kg', cat_acessorios, 89.90, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&h=600', false),
    ('Peitoral Ergonômico', 'Peitoral confortável que não machuca', cat_acessorios, 79.90, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&h=600', true),
    ('Bebedouro Portátil', 'Bebedouro prático para passeios', cat_acessorios, 35.90, 'https://images.unsplash.com/photo-1591856419944-2d1634ec064f?auto=format&fit=crop&w=600&h=600', false),
    
    -- Higiene & Banho
    ('Shampoo Neutro Pet', 'Shampoo hipoalergênico para pele sensível', cat_higiene, 35.90, 'https://images.unsplash.com/photo-1631598209938-cb0f02e8b46c?auto=format&fit=crop&w=600&h=600', true),
    ('Condicionador Hidratante', 'Condicionador que deixa o pelo macio e brilhante', cat_higiene, 42.90, 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&h=600', false),
    ('Escova de Banho', 'Escova especial para banho e massagem', cat_higiene, 28.90, 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&h=600', false),
    ('Tapete Higiênico 30un', 'Tapetes absorventes para treinamento', cat_higiene, 45.90, 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=600&h=600', true),
    
    -- Saúde & Medicamentos
    ('Suplemento Articular', 'Condroitina e glucosamina para articulações saudáveis', cat_saude, 89.90, 'https://images.unsplash.com/photo-1579621970314-87f19d5ac868?auto=format&fit=crop&w=600&h=600', true),
    ('Omega 3 Pet', 'Suplemento de ômega 3 para pelagem e pele saudável', cat_saude, 65.90, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&h=600', true),
    ('Antipulgas Bravecto', 'Proteção de longa duração contra pulgas e carrapatos', cat_saude, 159.90, 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&h=600', false),
    ('Vermífugo Total', 'Vermífugo de amplo espectro', cat_saude, 45.90, 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?auto=format&fit=crop&w=600&h=600', false),
    
    -- Camas & Móveis
    ('Cama Ortopédica P', 'Cama com espuma de memória para pets pequenos', cat_camas, 189.90, 'https://images.unsplash.com/photo-1548400126-eb1873a14e7b?auto=format&fit=crop&w=600&h=600', true),
    ('Cama Ortopédica M', 'Cama com espuma de memória para pets médios', cat_camas, 249.90, 'https://images.unsplash.com/photo-1516750930166-15a8954d4640?auto=format&fit=crop&w=600&h=600', true),
    ('Cama Ortopédica G', 'Cama com espuma de memória para pets grandes', cat_camas, 349.90, 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?auto=format&fit=crop&w=600&h=600', false),
    ('Casinha de Madeira', 'Casinha resistente para área externa', cat_camas, 459.90, 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=600&h=600', false),
    ('Arranhador Torre', 'Torre arranhador com plataformas para gatos', cat_camas, 299.90, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=600&h=600', true),
    ('Almofada Macia', 'Almofada extra macia para descanso', cat_camas, 79.90, 'https://images.unsplash.com/photo-1616697622032-0b9e92c47fba?auto=format&fit=crop&w=600&h=600', false);

  -- Produtos adicionais (não em destaque)
  INSERT INTO products (title, description, category_id, price, image_url, is_featured) VALUES
    ('Ração Pedigree 15kg', 'Ração completa para cães adultos', cat_alimentos, 119.90, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&h=600', false),
    ('Petisco Natural', 'Petisco natural para cães', cat_alimentos, 29.90, 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=600&h=600', false),
    ('Bola com Luz LED', 'Bola iluminada para brincadeiras noturnas', cat_brinquedos, 39.90, 'https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&w=600&h=600', false),
    ('Comedouro Duplo', 'Comedouro e bebedouro em inox', cat_acessorios, 55.90, 'https://images.unsplash.com/photo-1591856419944-2d1634ec064f?auto=format&fit=crop&w=600&h=600', false),
    ('Perfume Pet', 'Perfume suave para pets', cat_higiene, 32.90, 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&h=600', false),
    ('Vitamina Multipla', 'Complexo vitamínico completo', cat_saude, 54.90, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&h=600', false);
END $$;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON TABLE profiles IS 'Perfis de usuários do sistema';
COMMENT ON TABLE categories IS 'Categorias de produtos do petshop';
COMMENT ON TABLE products IS 'Produtos disponíveis no petshop';
COMMENT ON TABLE services IS 'Serviços oferecidos pelo petshop (banho, tosa, veterinaria, etc)';
COMMENT ON TABLE appointments IS 'Agendamentos de serviços (banho, tosa, consulta, etc)';

COMMENT ON COLUMN appointments.service_type IS 'Tipo de serviço: Banho, Tosa, Banho e Tosa, Consulta Veterinária, etc';
COMMENT ON COLUMN appointments.pet_type IS 'Tipo de pet: Cão, Gato, Coelho, Pássaro, etc';
COMMENT ON COLUMN appointments.pet_size IS 'Porte do pet: Pequeno, Médio, Grande';
COMMENT ON COLUMN appointments.status IS 'Status do agendamento: pending, confirmed, completed, cancelled';
