# 🔧 Guia de Resolução de Problemas

## ❌ Erro: "Erro ao autenticar" no cadastro

### 🔍 Causa

Este erro ocorria porque o código tentava criar o perfil do usuário **duas vezes**:

1. **Trigger do banco** (`handle_new_user`) criava automaticamente
2. **Código da aplicação** tentava inserir manualmente

Resultado: conflito de chave duplicada → erro de autenticação

### ✅ Solução Aplicada

**1. Atualizado [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx):**

- Removida inserção manual duplicada do perfil
- Adicionados metadados no `signUp()` para o trigger usar
- Implementado retry logic para aguardar o trigger criar o perfil
- Atualização dos dados após criação automática

**2. Atualizado [src/components/AuthModal.tsx](src/components/AuthModal.tsx):**

- Mensagens de erro mais específicas e úteis
- Melhor tratamento de diferentes tipos de erro
- Reset de formulário após sucesso

**3. Atualizado [supabase/migrations/20260214000000_complete_petshop_schema.sql](supabase/migrations/20260214000000_complete_petshop_schema.sql):**

- Trigger agora captura `phone` dos metadados também
- Perfil criado automaticamente com nome completo e telefone

### 🚀 Como aplicar a correção

Se você já aplicou a migração antes da correção:

**Opção 1: Recriar trigger (recomendado)**

```sql
-- No Supabase SQL Editor, execute:
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

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

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Opção 2: Reset completo**

```bash
npx supabase db reset
```

### 📋 Testar o cadastro

1. Abra a aplicação
2. Clique em "Entrar" → "Criar Conta"
3. Preencha:
   - Nome completo
   - Telefone (11 dígitos)
   - Email
   - Senha (mín. 6 caracteres, 1 maiúscula, 1 número, 1 especial)
   - Confirmar senha
4. Clique em "Criar Conta"
5. ✅ Deve funcionar sem erros!

### 🔐 Confirmar que funcionou

Após criar conta, verifique no Supabase:

1. **Table Editor → profiles**
   - Deve aparecer novo registro
   - Com nome completo e telefone preenchidos

2. **Authentication → Users**
   - Usuário criado com email
   - Metadata contém full_name e phone

---

## ❌ Outros erros comuns

### "Missing Supabase environment variables"

**Causa:** Arquivo `.env` não configurado

**Solução:**

```bash
cp .env.example .env
# Edite .env e adicione suas credenciais
```

### "relation 'profiles' already exists"

**Causa:** Tentando executar migrations em banco não-vazio

**Solução:**

```bash
npx supabase db reset
```

### Produtos não aparecem no catálogo

**Causa:** Migração não foi aplicada ou RLS bloqueando

**Solução:**

1. Verifique se aplicou a migração
2. No Supabase, confirme que tabela `products` tem dados
3. Verifique políticas RLS:

```sql
-- Deve retornar produtos
SELECT * FROM products LIMIT 5;
```

### Login não funciona

**Causa:** Email não confirmado (se confirmação estiver ativada)

**Solução:**

1. No Supabase Dashboard → Authentication → Providers → Email
2. Desative "Confirm email" para desenvolvimento
3. Ou confirme o email manualmente na aba Users

---

## 📞 Precisa de mais ajuda?

- Verifique logs do navegador (F12 → Console)
- Verifique logs do Supabase (Dashboard → Logs)
- Confira [QUICKSTART.md](QUICKSTART.md) para setup inicial
