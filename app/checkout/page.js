'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, CheckCircle, Clock, QrCode as QrCodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Endereço, 2: Pagamento, 3: Confirmação
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [pixKeyCopied, setPixKeyCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef(null);

  const PIX_KEY = '07995461518';

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    checkAuth();
    loadCart();
  }, []);

  useEffect(() => {
    if (step === 2) {
      generateQRCode();
    }
  }, [step]);

  const generateQRCode = async () => {
    try {
      // Gerar QR Code com a chave PIX
      const url = await QRCode.toDataURL(PIX_KEY, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setShippingAddress(prev => ({ ...prev, name: data.user.name }));
      } else {
        localStorage.removeItem('token');
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/');
    }
  };

  const loadCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.cart || data.cart.length === 0) {
          router.push('/carrinho');
          return;
        }
        setCart(data.cart || []);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setPixKeyCopied(true);
    setTimeout(() => setPixKeyCopied(false), 2000);
  };

  const createOrder = async () => {
    const token = localStorage.getItem('token');

    const orderData = {
      items: cart.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      })),
      shippingAddress,
      paymentMethod: 'pix',
      total: calculateTotal(),
      pixKey: PIX_KEY
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.orderId);
        setOrderCreated(true);
        setStep(3);
      } else {
        alert('Erro ao criar pedido. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => step === 1 ? router.push('/carrinho') : setStep(step - 1)} className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold">K.J STORE</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
            </div>
            <div className={`w-24 h-1 ${step >= 3 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Endereço */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                        <Input
                          required
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Telefone *</label>
                        <Input
                          required
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">CEP *</label>
                        <Input
                          required
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                          placeholder="00000-000"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Rua *</label>
                        <Input
                          required
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          placeholder="Nome da rua"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Número *</label>
                        <Input
                          required
                          value={shippingAddress.number}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                          placeholder="123"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Complemento</label>
                        <Input
                          value={shippingAddress.complement}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, complement: e.target.value })}
                          placeholder="Apto, bloco, etc"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Bairro *</label>
                        <Input
                          required
                          value={shippingAddress.neighborhood}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, neighborhood: e.target.value })}
                          placeholder="Nome do bairro"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Cidade *</label>
                        <Input
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          placeholder="Sua cidade"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Estado *</label>
                        <Input
                          required
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Continuar para Pagamento
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Pagamento */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pagamento via PIX</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                      <div className="text-center mb-6">
                        <Badge className="bg-blue-600 text-lg px-4 py-2 mb-4">PIX</Badge>
                        <p className="text-gray-700 font-semibold text-lg">
                          Escaneie o QR Code ou copie a chave PIX
                        </p>
                      </div>

                      {/* QR Code */}
                      {qrCodeUrl && (
                        <div className="bg-white rounded-lg p-6 mb-6 flex flex-col items-center">
                          <QrCodeIcon className="w-8 h-8 text-blue-600 mb-3" />
                          <img 
                            src={qrCodeUrl} 
                            alt="QR Code PIX" 
                            className="w-64 h-64 border-4 border-gray-200 rounded-lg shadow-lg mb-4"
                          />
                          <p className="text-sm text-gray-600 text-center">
                            Abra o app do seu banco e escaneie o QR Code
                          </p>
                        </div>
                      )}

                      {/* Chave PIX */}
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-2 text-center font-semibold">Ou copie a chave PIX:</p>
                        <div className="flex items-center justify-center gap-2">
                          <code className="text-xl font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded">{PIX_KEY}</code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyPixKey}
                          >
                            {pixKeyCopied ? (
                              <><CheckCircle className="w-4 h-4 mr-1 text-green-600" /> Copiado!</>
                            ) : (
                              <><Copy className="w-4 h-4 mr-1" /> Copiar</>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Valor */}
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-center mb-2 text-sm text-green-800 font-semibold">Valor a Pagar:</p>
                        <p className="text-center text-3xl font-bold text-green-700">
                          R$ {calculateTotal().toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Importante:</p>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Escaneie o QR Code ou copie a chave PIX</li>
                          <li>• Pague exatamente: <strong>R$ {calculateTotal().toFixed(2)}</strong></li>
                          <li>• Após o pagamento, clique em "Confirmar Pedido"</li>
                          <li>• Processamento em até 2 horas úteis</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Como pagar com PIX:</h4>
                      <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                        <li>Abra o aplicativo do seu banco</li>
                        <li>Escolha a opção PIX</li>
                        <li><strong>Opção 1:</strong> Escaneie o QR Code acima</li>
                        <li><strong>Opção 2:</strong> Copie e cole a chave PIX: <code className="bg-gray-100 px-2 py-1 rounded">{PIX_KEY}</code></li>
                        <li>Confira o valor: <strong>R$ {calculateTotal().toFixed(2)}</strong></li>
                        <li>Confirme o pagamento</li>
                        <li>Volte aqui e clique em "Confirmar Pedido"</li>
                      </ol>
                    </div>

                    <Button
                      onClick={createOrder}
                      className="w-full"
                      size="lg"
                    >
                      Confirmar Pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmação */}
            {step === 3 && orderCreated && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Pedido Realizado com Sucesso!</h2>
                    <p className="text-gray-600">Número do pedido: <strong>#{orderId?.toString().slice(-8)}</strong></p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Aguardando Pagamento</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Seu pedido será processado assim que confirmarmos o pagamento via PIX.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold mb-3">Próximos Passos:</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>✓ Pedido registrado no sistema</li>
                      <li>⏳ Aguardando confirmação do pagamento PIX</li>
                      <li>📦 Após confirmação, seu pedido será preparado</li>
                      <li>🚚 Em seguida, será enviado para o endereço informado</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={() => router.push('/')} className="w-full" size="lg">
                      Voltar para a Loja
                    </Button>
                    <Button onClick={() => router.push('/minha-conta')} variant="outline" className="w-full" size="lg">
                      Ver Meus Pedidos
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 mt-6">
                    Você receberá atualizações do seu pedido por email
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img
                        src={item.product?.images?.[0]}
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{item.product?.name}</h4>
                        <p className="text-xs text-gray-600">
                          {item.size} • {item.color} • Qtd: {item.quantity}
                        </p>
                        <p className="text-sm font-bold">
                          R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frete</span>
                      <span className="font-semibold text-green-600">Grátis</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-xl">R$ {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {step === 2 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                      <p className="text-xs text-green-800 text-center">
                        🔒 Pagamento 100% seguro via PIX
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
