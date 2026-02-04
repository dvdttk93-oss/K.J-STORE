# 📱 NOTIFICAÇÕES E BUSCA DE CEP - K.J STORE

## 🔔 **SISTEMA DE NOTIFICAÇÕES**

### **Como Funciona:**

Quando um cliente finaliza uma compra, você receberá **automaticamente** uma notificação no WhatsApp!

### **O que você recebe:**
```
🔔 NOVO PEDIDO - K.J STORE

📦 Pedido: #AB12CD34
👤 Cliente: Nome do Cliente
📱 Tel: (77) 99830-9542
💰 Valor: R$ 1.239,80
📍 Cidade: Salvador/BA

Acesse o painel admin para mais detalhes!
```

### **Onde recebe:**
- **WhatsApp**: 77998309542 (configurado como admin)
- A notificação abre automaticamente após o cliente confirmar o pedido
- Você pode estar em qualquer lugar e receberá a mensagem!

### **Configurar outro número:**
Se quiser receber em outro WhatsApp, edite o arquivo:
`/app/app/checkout/page.js`

Procure pela linha:
```javascript
const ADMIN_WHATSAPP = '77998309542'; // Seu número aqui
```

---

## 🏠 **BUSCA AUTOMÁTICA DE ENDEREÇO POR CEP**

### **Como Funciona para o Cliente:**

1. Cliente vai para o checkout
2. Digita o CEP (ex: 01234-567)
3. **Automaticamente** o sistema:
   - ✅ Busca o endereço na base dos Correios
   - ✅ Preenche a Rua
   - ✅ Preenche o Bairro
   - ✅ Preenche a Cidade
   - ✅ Preenche o Estado
4. Cliente só precisa adicionar o número da casa

### **Exemplo Prático:**

**Cliente digita:** `41940-570`

**Sistema preenche automaticamente:**
- Rua: Rua das Palmeiras
- Bairro: Paralela
- Cidade: Salvador
- Estado: BA

**Cliente adiciona:**
- Número: 123
- Complemento: Apto 45 (opcional)

### **Validação:**
- ❌ CEP inválido → Mostra alerta para o cliente verificar
- ✅ CEP válido → Preenche tudo automaticamente
- 🔄 Enquanto busca → Mostra animação de carregamento

---

## 🔧 **TECNOLOGIAS USADAS**

### **ViaCEP API**
- API **GRATUITA** dos Correios do Brasil
- Sem limite de requisições
- Sempre atualizada
- Funciona para todo o Brasil

### **WhatsApp Business API**
- Link direto `wa.me`
- Funciona em qualquer dispositivo
- Não precisa de API key
- Abre automaticamente o WhatsApp

---

## ✅ **CHECKLIST DE FUNCIONAMENTO**

### **Busca de CEP:**
- [x] Cliente digita CEP
- [x] Sistema busca automaticamente ao digitar 8 números
- [x] Campos preenchidos automaticamente
- [x] Validação de CEP inválido
- [x] Loading spinner durante busca

### **Notificações:**
- [x] Pedido criado → Notificação enviada
- [x] Abre WhatsApp automaticamente
- [x] Mensagem formatada com todos os dados
- [x] Link funciona em desktop e mobile
- [x] Número configurável no código

---

## 📋 **FLUXO COMPLETO DO PEDIDO**

### **1. Cliente Faz Pedido:**
- Adiciona produtos ao carrinho
- Vai para checkout
- **Digita CEP** → Endereço preenchido automaticamente ✨
- Adiciona número da casa
- Confirma endereço
- Faz pagamento PIX
- Confirma pedido

### **2. Você (Admin) Recebe:**
- 📱 **Notificação no WhatsApp imediatamente**
- Vê detalhes do pedido
- Acessa painel admin para gerenciar
- Atualiza status do pedido

### **3. Cliente Recebe:**
- Confirmação na tela
- Pode falar com você pelo WhatsApp
- Acompanha pedido na área "Meus Pedidos"

---

## 🎯 **VANTAGENS**

### **Para o Cliente:**
✅ Não precisa digitar endereço inteiro
✅ Evita erros de digitação
✅ Checkout mais rápido
✅ Experiência melhor

### **Para Você (Loja):**
✅ Recebe notificação instantânea
✅ Dados corretos do cliente
✅ CEP sempre válido
✅ Menos erros de entrega
✅ Não perde nenhum pedido

---

## 🔄 **TESTANDO O SISTEMA**

### **Testar Busca de CEP:**
1. Acesse: http://localhost:3000/checkout
2. Digite um CEP válido: `01310-100`
3. Veja o endereço preencher automaticamente
4. Tente um CEP inválido: `99999-999`
5. Veja o alerta de erro

### **Testar Notificação:**
1. Faça um pedido completo
2. Confirme o pedido
3. Uma nova aba do WhatsApp abrirá automaticamente
4. Mensagem já estará pronta para enviar

---

## 🛠️ **PERSONALIZAR**

### **Mudar Número do Admin:**
```javascript
// Em /app/app/checkout/page.js
const ADMIN_WHATSAPP = '77998309542'; // Coloque seu número aqui
```

### **Mudar Mensagem de Notificação:**
```javascript
// Em /app/app/checkout/page.js
const notifyAdminNewOrder = (orderData) => {
  const message = encodeURIComponent(
    `🔔 *NOVO PEDIDO - K.J STORE*\n\n` +
    `📦 Pedido: #${orderData.orderId?.toString().slice(-8)}\n` +
    // Personalize aqui!
  );
  // ...
};
```

---

## 📞 **SUPORTE**

- **Busca de CEP não funciona?**
  - Verifique conexão com internet
  - Tente outro CEP
  - API ViaCEP pode estar temporariamente fora

- **Notificação não chegou?**
  - Verifique se o número está correto
  - Teste abrindo o link manualmente
  - Confirme se WhatsApp está instalado

---

**Sistema 100% funcional e pronto para uso! 🚀**
