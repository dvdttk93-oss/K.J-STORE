# 🎯 GUIA COMPLETO DO ADMINISTRADOR - K.J STORE

## 🔑 **ACESSO AO PAINEL ADMIN**

**URL**: http://localhost:3000/admin

**Credenciais:**
- Email: `admin@ecommerce.com`
- Senha: `admin123`

---

## 📊 **FUNCIONALIDADES DO PAINEL ADMIN**

### **1. DASHBOARD**
Visualize as estatísticas em tempo real:
- Total de Produtos
- Total de Pedidos  
- Total de Usuários
- Receita Total (R$)
- Últimos 10 pedidos

### **2. GERENCIAR PRODUTOS** ✅

**Adicionar Novo Produto:**
1. Clique em "Produtos" no menu lateral
2. Clique no botão "Novo Produto"
3. Preencha os dados:
   - Nome do Produto
   - Descrição completa
   - Preço Atual (R$)
   - Preço Original (R$) - para mostrar desconto
   - Categoria (ex: tenis-masculino, camisetas)
   - Estoque (quantidade disponível)
   - URLs das Imagens (separadas por vírgula)
   - Tamanhos disponíveis (separados por vírgula)
   - Cores disponíveis (separadas por vírgula)
   - ☑️ Marque "Produto em Destaque" se quiser destacar na home
4. Clique em "Criar Produto"

**Editar Produto:**
1. Encontre o produto na lista
2. Clique em "Editar"
3. Modifique os campos desejados
4. Clique em "Atualizar Produto"

**Excluir Produto:**
1. Encontre o produto
2. Clique em "Excluir"
3. Confirme a exclusão

**IMPORTANTE - URLs de Imagens:**
- Use URLs públicas de imagens (ex: Unsplash, Imgur, seu servidor)
- Formato: `https://images.unsplash.com/photo-xxx?w=800`
- Para múltiplas imagens: `url1, url2, url3`
- Recomendado: imagens de 800x800px ou maiores

---

### **3. GERENCIAR CATEGORIAS** ✅

**Criar Nova Categoria:**
1. Clique em "Categorias" no menu
2. Clique em "Nova Categoria"
3. Preencha:
   - **Nome**: Ex: "Equipamentos"
   - **Slug**: Ex: "equipamentos" (sem espaços, minúsculas)
4. Clique em "Criar Categoria"

**Categorias Atuais:**
- tenis-masculino
- tenis-feminino
- camisetas
- calcas
- shorts
- acessorios

---

### **4. GERENCIAR PEDIDOS** ✅

**Visualizar Todos os Pedidos:**
1. Clique em "Pedidos" no menu
2. Veja lista completa com:
   - Número do pedido
   - Email do cliente
   - Data e hora
   - Valor total
   - Status atual
   - Itens do pedido
   - Endereço de entrega

**Atualizar Status do Pedido:**
Os botões aparecem de acordo com o status atual:

1. **Pendente** → Clique em "Processar"
2. **Processando** → Clique em "Enviar"
3. **Enviado** → Clique em "Entregar"
4. **Cancelar** (disponível até ser entregue)

**Fluxo de Status:**
```
Pendente → Processando → Enviado → Entregue
         ↘ Cancelado (a qualquer momento)
```

---

### **5. GERENCIAR USUÁRIOS** ✅

**Visualizar Todos os Usuários:**
1. Clique em "Usuários" no menu
2. Veja tabela com:
   - Nome
   - Email
   - Telefone (se cadastrado)
   - Função (Admin ou Cliente)
   - Data de Cadastro

---

## 🖼️ **COMO ADICIONAR IMAGENS AOS PRODUTOS**

### **Opção 1: Usar Unsplash (GRÁTIS)**
1. Acesse: https://unsplash.com
2. Busque pela imagem desejada
3. Clique na imagem
4. Clique com botão direito → "Copiar endereço da imagem"
5. Cole no campo "URLs das Imagens"

### **Opção 2: Usar Imgur (GRÁTIS)**
1. Acesse: https://imgur.com
2. Faça upload da sua imagem
3. Copie o link direto
4. Cole no campo de imagens

### **Opção 3: Servidor Próprio**
1. Faça upload das imagens para seu servidor
2. Use a URL completa: `https://seusite.com/imagens/produto.jpg`

**DICA:** Para múltiplas imagens de um produto:
```
https://images.unsplash.com/photo-1.jpg?w=800,
https://images.unsplash.com/photo-2.jpg?w=800,
https://images.unsplash.com/photo-3.jpg?w=800
```

---

## 📝 **EXEMPLOS PRÁTICOS**

### **Exemplo: Adicionar Tênis**
```
Nome: Air Max Pro 2024
Descrição: Tênis de corrida com tecnologia Air Max avançada...
Preço: 599.90
Preço Original: 799.90
Categoria: tenis-masculino
Estoque: 50
Imagens: https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800
Tamanhos: 38, 39, 40, 41, 42, 43, 44
Cores: Preto, Branco, Azul, Vermelho
☑️ Produto em Destaque
```

### **Exemplo: Adicionar Camiseta**
```
Nome: Camiseta Dri-FIT Premium
Descrição: Camiseta esportiva com secagem rápida...
Preço: 129.90
Preço Original: 179.90
Categoria: camisetas
Estoque: 100
Imagens: https://images.unsplash.com/photo-1521572163474?w=800
Tamanhos: P, M, G, GG, XGG
Cores: Preto, Branco, Azul, Verde
```

---

## 🎨 **COMO MUDAR O VISUAL DO SITE**

### **Mudar Cor dos Botões/Tema:**
Edite o arquivo: `/app/app/globals.css`

```css
:root {
  --primary: 222.2 47.4% 11.2%;  /* Cor principal */
  --secondary: 210 40% 96.1%;    /* Cor secundária */
}
```

### **Mudar Logo:**
1. Substitua o arquivo: `/app/public/logo.jpeg`
2. Mantenha o nome do arquivo ou atualize nos componentes

---

## 📊 **RELATÓRIOS E ESTATÍSTICAS**

### **Dashboard Mostra:**
- 📦 Total de produtos cadastrados
- 🛒 Total de pedidos recebidos
- 👥 Total de usuários registrados
- 💰 Receita total em R$
- 📋 Últimos 10 pedidos

### **Para Ver Detalhes:**
- Clique em cada seção para ver mais informações
- Use os filtros para buscar pedidos específicos

---

## 🔐 **SEGURANÇA**

### **Trocar Senha do Admin:**
1. Use o MongoDB para atualizar o hash da senha
2. Ou crie um novo usuário admin via registro

### **Adicionar Novo Admin:**
1. Crie um usuário normal
2. No MongoDB, mude o campo `role` de `customer` para `admin`

---

## ⚙️ **CONFIGURAÇÕES IMPORTANTES**

### **Chave PIX:**
Arquivo: `/app/app/checkout/page.js`
```javascript
const PIX_KEY = '07995461518'; // Sua chave aqui
```

### **WhatsApp da Loja:**
Arquivo: `/app/app/checkout/page.js`
```javascript
const WHATSAPP_NUMBER = '77998309542'; // Seu número
```

### **Nome da Loja:**
Para mudar o nome da loja, edite:
- `/app/app/page.js`
- `/app/app/layout.js`
- `/app/app/admin/page.js`
- `/app/README.md`

---

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Imagem não aparece:**
- Verifique se a URL está correta e pública
- Teste a URL diretamente no navegador
- Use URLs com HTTPS

### **Produto não aparece no site:**
- Verifique se o estoque é maior que 0
- Confirme se a categoria está correta
- Limpe o cache do navegador (Ctrl+F5)

### **Pedido não aparece:**
- Verifique se o cliente finalizou o checkout
- Confira o status no banco de dados

---

## 📞 **SUPORTE**

Para dúvidas sobre:
- **Técnicas**: Consulte o README.md principal
- **Produtos**: Use este guia
- **Integrações**: Veja a documentação da API

---

**Desenvolvido para K.J STORE** 🛒✨
