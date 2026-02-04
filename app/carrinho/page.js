'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CarrinhoPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
    loadCart();
  }, []);

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
        setCart(data.cart || []);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        loadCart();
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm('Deseja remover este item do carrinho?')) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Item removido do carrinho!');
        loadCart();
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando carrinho...</p>
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
            <button onClick={() => router.push('/')} className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continuar Comprando
            </button>
            <h1 className="text-2xl font-bold">K.J STORE</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>

        {cart.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
              <p className="text-gray-600 mb-6">Adicione produtos ao carrinho para continuar</p>
              <Button onClick={() => router.push('/')}>
                Ir às Compras
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items do Carrinho */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <img
                        src={item.product?.images?.[0]}
                        alt={item.product?.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{item.product?.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.product?.description}</p>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm">
                            <strong>Tamanho:</strong> {item.size}
                          </span>
                          <span className="text-sm">
                            <strong>Cor:</strong> {item.color}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold">
                              R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              R$ {(item.product?.price || 0).toFixed(2)} cada
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(item._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frete</span>
                      <span className="font-semibold text-green-600">Grátis</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-2xl">R$ {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => router.push('/checkout')}
                  >
                    Finalizar Compra
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Pagamento seguro via PIX
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
