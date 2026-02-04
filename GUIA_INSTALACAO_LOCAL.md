# 🚀 GUIA DE INSTALAÇÃO LOCAL - E-commerce Sport Store

## 📥 **OPÇÕES DE DOWNLOAD**

### **Opção A: Download via Code Server (MAIS FÁCIL)**

1. Acesse: https://nike-inspired-46.preview.emergentagent.com/proxy/code/
2. Baixe o arquivo: `/tmp/ecommerce-sport-store.tar.gz`
3. Extraia no seu computador:
   ```bash
   tar -xzf ecommerce-sport-store.tar.gz
   cd app
   ```

### **Opção B: Criar Manualmente (PASSO A PASSO)**

Se você preferir criar manualmente, siga os passos abaixo:

---

## 🛠️ **INSTALAÇÃO PASSO A PASSO**

### **1. Pré-requisitos**

Certifique-se de ter instalado:
- ✅ Node.js 18+ (https://nodejs.org/)
- ✅ MongoDB (https://www.mongodb.com/try/download/community)
- ✅ VS Code (https://code.visualstudio.com/)
- ✅ Yarn (npm install -g yarn)

---

### **2. Criar Estrutura do Projeto**

```bash
# Criar pasta do projeto
mkdir ecommerce-sport-store
cd ecommerce-sport-store

# Criar estrutura de pastas
mkdir -p app/api/"[[...path]]"
mkdir -p app/admin
mkdir -p components/ui
mkdir -p lib
```

---

### **3. Criar Arquivos Essenciais**

#### **📄 package.json**

Copie do projeto ou use este conteúdo básico:

```json
{
  "name": "ecommerce-sport-store",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-label": "^2.1.7",
    "bcryptjs": "^3.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "jsonwebtoken": "^9.0.3",
    "lucide-react": "^0.516.0",
    "mongodb": "^6.6.0",
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.7",
    "autoprefixer": "^10.4.19",
    "postcss": "^8",
    "tailwindcss": "^3.4.1"
  }
}
```

#### **📄 .env**

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=ecommerce_sport_store
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=seu-secret-super-seguro-mude-em-producao
```

#### **📄 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### **📄 postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### **📄 app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

### **4. Instalar Componentes shadcn/ui**

```bash
# Instalar dependências
yarn install

# Adicionar componentes shadcn (ou copiar da pasta components/ui)
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add badge
```

---

### **5. Copiar Arquivos Principais**

Você precisa copiar 3 arquivos principais do Code Server:

1. **app/api/[[...path]]/route.js** - Backend completo
2. **app/page.js** - Página principal (frontend)
3. **app/admin/page.js** - Painel administrativo
4. **app/layout.js** - Layout global

**Como copiar:**
- Acesse cada arquivo no Code Server
- Copie todo o conteúdo (Ctrl+A, Ctrl+C)
- Cole no arquivo correspondente no seu VS Code local

---

### **6. Iniciar MongoDB**

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongodb

# Ou via Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

---

### **7. Rodar o Projeto**

```bash
# Instalar dependências (se ainda não fez)
yarn install

# Rodar em modo desenvolvimento
yarn dev
```

---

### **8. Acessar o Sistema**

- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

**Credenciais Admin:**
- Email: admin@ecommerce.com
- Senha: admin123

---

## 📦 **ARQUIVOS COMPLETOS DISPONÍVEIS**

Todos os arquivos estão disponíveis em:
```
https://nike-inspired-46.preview.emergentagent.com/proxy/code/
```

Navegue até a pasta `/app` e baixe os seguintes arquivos:

### **Arquivos Essenciais:**
- ✅ `/app/app/api/[[...path]]/route.js` (4300+ linhas)
- ✅ `/app/app/page.js` (500+ linhas)
- ✅ `/app/app/admin/page.js` (800+ linhas)
- ✅ `/app/app/layout.js`
- ✅ `/app/app/globals.css`
- ✅ `/app/package.json`
- ✅ `/app/.env`
- ✅ `/app/tailwind.config.js`
- ✅ `/app/postcss.config.js`
- ✅ `/app/README.md`

### **Componentes shadcn:**
- `/app/components/ui/button.tsx`
- `/app/components/ui/card.tsx`
- `/app/components/ui/input.tsx`
- `/app/components/ui/badge.tsx`
- `/app/lib/utils.ts`

---

## 🐛 **PROBLEMAS COMUNS**

### **Erro: MongoDB não conecta**
```bash
# Verificar se está rodando
sudo systemctl status mongodb

# Ou
mongosh --eval "db.version()"
```

### **Erro: Módulo não encontrado**
```bash
# Reinstalar dependências
rm -rf node_modules
rm yarn.lock
yarn install
```

### **Erro: Porta 3000 em uso**
```bash
# Mudar porta
yarn dev -p 3001
```

---

## ✅ **CHECKLIST DE INSTALAÇÃO**

- [ ] Node.js instalado (node -v)
- [ ] MongoDB instalado e rodando
- [ ] Yarn instalado (yarn -v)
- [ ] Pasta do projeto criada
- [ ] Dependências instaladas (yarn install)
- [ ] Arquivo .env configurado
- [ ] MongoDB rodando
- [ ] Servidor Next.js rodando (yarn dev)
- [ ] Site acessível em localhost:3000
- [ ] Admin acessível em localhost:3000/admin
- [ ] Login admin funcionando

---

## 📞 **PRECISA DE AJUDA?**

Se tiver algum problema, me avise! Estou aqui para ajudar! 🚀

---

**Desenvolvido com ❤️ e Next.js**
