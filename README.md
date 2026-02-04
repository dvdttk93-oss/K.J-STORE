# 🛒 K.J STORE - E-commerce Completo

E-commerce moderno e profissional com pagamento via PIX. Sistema completo de vendas online com painel administrativo.

![K.J STORE Logo](public/logo.jpeg)

## ✨ Funcionalidades

### 🌐 **Área do Cliente**
- ✅ Página inicial com banners e produtos em destaque
- ✅ Catálogo de produtos com filtros avançados
  - Filtro por categoria
  - Filtro por faixa de preço
  - Busca por nome
  - Filtro por tamanho e cor
- ✅ Página de detalhes do produto
  - Galeria de imagens
  - Seleção de tamanho e cor
  - Informações completas
  - Avaliações
- ✅ Carrinho de compras funcional
- ✅ Sistema de favoritos (wishlist)
- ✅ Autenticação (Registro e Login)
- ✅ Histórico de pedidos
- ✅ Checkout completo

### 👨‍💼 **Painel Administrativo**
- ✅ Login exclusivo para administradores
- ✅ Dashboard com estatísticas
  - Total de produtos
  - Total de pedidos
  - Total de usuários
  - Receita total
  - Pedidos recentes
- ✅ CRUD completo de produtos
  - Criar, editar e excluir produtos
  - Upload de múltiplas imagens
  - Gerenciar preços e estoque
  - Definir produtos em destaque
- ✅ Gerenciamento de categorias
- ✅ Visualização e gerenciamento de pedidos
  - Atualizar status (Pendente → Processando → Enviado → Entregue)
  - Ver detalhes completos
  - Endereço de entrega
- ✅ Controle de usuários
  - Visualizar todos os usuários
  - Ver funções (Admin/Cliente)

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14 + React 18
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: MongoDB
- **Autenticação**: JWT (JSON Web Tokens)
- **Hash de Senhas**: bcryptjs
- **Ícones**: Lucide React

## 📦 Estrutura do Projeto

```
/app
├── app/
│   ├── api/[[...path]]/route.js   # API Backend
│   ├── admin/page.js               # Painel Admin
│   ├── page.js                     # Página Principal
│   ├── layout.js                   # Layout Global
│   └── globals.css                 # Estilos Globais
├── components/ui/                  # Componentes shadcn
├── .env                            # Variáveis de Ambiente
├── package.json                    # Dependências
└── README.md                       # Este arquivo
```

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- MongoDB instalado e rodando
- Yarn (gerenciador de pacotes)

### Instalação

1. **Clone o repositório ou extraia os arquivos**

2. **Instale as dependências:**
```bash
cd /app
yarn install
```

3. **Configure as variáveis de ambiente:**
Edite o arquivo `.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=ecommerce_nike
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=seu-secret-super-seguro-mude-em-producao
```

4. **Inicie o MongoDB:**
```bash
# No Linux/Mac
sudo systemctl start mongodb

# Ou use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

5. **Execute o projeto:**
```bash
yarn dev
```

6. **Acesse no navegador:**
- **Site**: http://localhost:3000
- **Painel Admin**: http://localhost:3000/admin

## 👤 Credenciais de Acesso

### Administrador Padrão
- **Email**: admin@ecommerce.com
- **Senha**: admin123

### Criar Novo Cliente
Faça o registro direto no site através do botão "Entrar" → "Cadastrar"

## 📊 Dados Iniciais

O sistema cria automaticamente:
- ✅ 15 produtos de exemplo em diversas categorias
- ✅ 6 categorias principais
- ✅ 1 usuário administrador
- ✅ Imagens de alta qualidade do Unsplash

### Categorias Disponíveis:
1. Tênis Masculino
2. Tênis Feminino
3. Camisetas
4. Calças
5. Shorts
6. Acessórios

## 🔐 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT com expiração de 7 dias
- ✅ Rotas de admin protegidas
- ✅ Validação de dados no backend
- ✅ Proteção contra injeção de dados

## 🎨 Design

O design foi inspirado no estilo Nike:
- Layout minimalista e limpo
- Muito espaço em branco
- Foco nas imagens dos produtos
- Tipografia moderna e bold
- Animações suaves
- Totalmente responsivo (mobile-first)

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1919px)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

## 🔄 Fluxo de Pedido

1. Cliente navega pelos produtos
2. Adiciona produtos ao carrinho (com tamanho e cor)
3. Vai para o checkout
4. Preenche endereço de entrega
5. Confirma o pedido
6. Admin vê o pedido no painel
7. Admin atualiza o status:
   - Pendente → Processando → Enviado → Entregue
8. Cliente vê o histórico na área de "Minha Conta"

## 🔧 Funcionalidades Técnicas

### Backend (API)
- `GET /api/products` - Lista produtos (com filtros)
- `GET /api/products/:id` - Detalhes de um produto
- `GET /api/categories` - Lista categorias
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Dados do usuário logado
- `GET /api/cart` - Lista itens do carrinho
- `POST /api/cart` - Adiciona item ao carrinho
- `PUT /api/cart/:id` - Atualiza quantidade
- `DELETE /api/cart/:id` - Remove item do carrinho
- `GET /api/wishlist` - Lista favoritos
- `POST /api/wishlist` - Adiciona aos favoritos
- `DELETE /api/wishlist/:id` - Remove dos favoritos
- `GET /api/orders` - Lista pedidos do usuário
- `POST /api/orders` - Cria novo pedido
- `GET /api/admin/dashboard` - Estatísticas do admin
- `GET /api/admin/products` - Lista produtos (admin)
- `POST /api/admin/products` - Cria produto
- `PUT /api/admin/products/:id` - Atualiza produto
- `DELETE /api/admin/products/:id` - Deleta produto
- `GET /api/admin/orders` - Lista todos os pedidos
- `PUT /api/admin/orders/:id` - Atualiza status do pedido
- `GET /api/admin/users` - Lista todos os usuários
- `POST /api/admin/categories` - Cria categoria

## 💳 Integração de Pagamento PIX

✅ **INTEGRADO E FUNCIONANDO!**

O sistema está totalmente configurado com pagamento via PIX!

### Chave PIX Configurada:
- **Tipo**: Telefone
- **Chave**: 07995461518

### Funcionalidades PIX:
- ✅ QR Code gerado automaticamente
- ✅ Copiar chave PIX com um clique
- ✅ Instruções passo a passo
- ✅ Valor exibido claramente
- ✅ Fluxo completo de pagamento

### Como Funciona:
1. Cliente adiciona produtos ao carrinho
2. Vai para o checkout
3. Preenche endereço de entrega
4. Na tela de pagamento:
   - **Opção 1**: Escaneia o QR Code PIX
   - **Opção 2**: Copia a chave PIX manualmente
5. Faz o pagamento no app do banco
6. Confirma o pedido
7. Admin vê o pedido no painel e atualiza o status

### Para Trocar a Chave PIX:
Edite o arquivo `/app/app/checkout/page.js` na linha:
```javascript
const PIX_KEY = '07995461518'; // Sua chave PIX aqui
```

## 🚢 Deploy

### Opções de Deploy:
1. **Vercel** (recomendado para Next.js)
2. **Netlify**
3. **AWS**
4. **Digital Ocean**
5. **Heroku**

### Passos para Deploy:
1. Configure as variáveis de ambiente na plataforma
2. Conecte seu repositório Git
3. Configure o MongoDB Atlas (cloud)
4. Faça o deploy automático

## 📝 Próximas Melhorias Sugeridas

- [ ] Integração com gateway de pagamento real
- [ ] Sistema de cupons de desconto
- [ ] Avaliações e comentários de produtos
- [ ] Sistema de recomendação
- [ ] Newsletter por email
- [ ] Chat de suporte ao vivo
- [ ] Rastreamento de pedido
- [ ] Múltiplas imagens por produto
- [ ] Zoom nas imagens
- [ ] Comparador de produtos
- [ ] Produtos relacionados
- [ ] Notificações push
- [ ] Exportação de relatórios (PDF/Excel)

## 🐛 Resolução de Problemas

### MongoDB não conecta:
```bash
# Verifique se o MongoDB está rodando
sudo systemctl status mongodb

# Reinicie o MongoDB
sudo systemctl restart mongodb
```

### Erro de permissão no banco:
- Verifique o MONGO_URL no arquivo .env
- Certifique-se que o MongoDB está acessível

### Página em branco:
```bash
# Limpe o cache do Next.js
rm -rf .next
yarn dev
```

## 📄 Licença

Este projeto é de código aberto e está disponível para uso educacional e comercial.

## 👨‍💻 Autor

Desenvolvido como um projeto completo de e-commerce moderno.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

---

**Feito com ❤️ e Next.js**
