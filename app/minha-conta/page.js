'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MinhaContaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    checkAuth();
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
        loadOrders(token);
      } else {
        localStorage.removeItem('token');
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/');
    }
  };

  const loadOrders = async (token) => {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Aguardando Pagamento',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
        description: 'Seu pedido foi registrado e está aguardando confirmação do pagamento PIX.'
      },
      processing: {
        label: 'Processando',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Package,
        description: 'Pagamento confirmado! Estamos preparando seu pedido para envio.'
      },
      shipped: {
        label: 'Enviado',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: Truck,
        description: 'Seu pedido foi enviado e está a caminho!'
      },
      delivered: {
        label: 'Entregue',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        description: 'Pedido entregue com sucesso! Aproveite suas compras!'
      },
      cancelled: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
        description: 'Este pedido foi cancelado.'
      }
    };

    return statusMap[status] || statusMap.pending;
  };

  const getStatusProgress = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando seus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/')} className="flex items-center text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar para Loja
            </button>
            <div className="flex items-center space-x-2">
              <img src="/logo.jpeg" alt="K.J STORE" className="h-8 w-8 object-contain rounded" />
              <h1 className="text-xl font-black text-white">K.J STORE</h1>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* User Info */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Minha Conta</h1>
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {user?.email}
            </div>
            {user?.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {user.phone}
              </div>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6">Meus Pedidos ({orders.length})</h2>

          {orders.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum pedido ainda</h3>
                <p className="text-gray-400 mb-6">Quando você fizer uma compra, ela aparecerá aqui</p>
                <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold">
                  Começar a Comprar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={order._id} className="bg-zinc-900 border-zinc-800 hover:border-green-400 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-white">
                              Pedido #{order._id.toString().slice(-8).toUpperCase()}
                            </h3>
                            <Badge className={`${statusInfo.color} border font-bold`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-white">R$ {order.total.toFixed(2)}</div>
                          <p className="text-xs text-gray-400">{order.items?.length || 0} item(ns)</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {order.status !== 'cancelled' && (
                        <div className="mb-4">
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-500"
                              style={{ width: `${getStatusProgress(order.status)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Items Preview */}
                      <div className="flex items-center space-x-2 mb-4">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm text-gray-400">
                            • {item.name} (x{item.quantity})
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="text-sm text-gray-400">
                            + {order.items.length - 3} mais
                          </div>
                        )}
                      </div>

                      {/* Shipping Info */}
                      {order.shipping && (
                        <div className="flex items-center text-sm text-gray-400 mb-4">
                          <Truck className="w-4 h-4 mr-2" />
                          {order.shipping.service} - Entrega em até {order.shipping.deliveryTime} dias úteis
                        </div>
                      )}

                      {/* Status Description */}
                      <p className="text-sm text-gray-400 mb-4">{statusInfo.description}</p>

                      <Button 
                        variant="outline" 
                        className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        Ver Detalhes Completos
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-lg p-8 max-w-4xl w-full my-8 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Detalhes do Pedido</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Status Timeline */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Status do Pedido</h3>
                
                <div className="space-y-4">
                  {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                    const statusInfo = getStatusInfo(status);
                    const StatusIcon = statusInfo.icon;
                    const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status) >= index;
                    const isCurrent = selectedOrder.status === status;

                    return (
                      <div key={status} className="flex items-start">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-gradient-to-r from-green-400 to-cyan-400' : 'bg-zinc-800'
                        }`}>
                          <StatusIcon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-600'}`} />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className={`font-bold ${isCurrent ? 'text-green-400' : isActive ? 'text-white' : 'text-gray-600'}`}>
                            {statusInfo.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-gray-400 mt-1">{statusInfo.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Informações do Pedido</h3>
                
                {/* Order Number */}
                <div className="mb-4 p-4 bg-zinc-800 rounded-lg">
                  <p className="text-sm text-gray-400">Número do Pedido</p>
                  <p className="text-lg font-bold text-white">#{selectedOrder._id.toString().slice(-8).toUpperCase()}</p>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-2">Itens ({selectedOrder.items?.length || 0})</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-zinc-800 rounded">
                        <span className="text-gray-300">{item.name} (x{item.quantity})</span>
                        <span className="text-white font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="mb-4 p-4 bg-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>R$ {selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {selectedOrder.shippingCost > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Frete ({selectedOrder.shipping?.service})</span>
                      <span>R$ {selectedOrder.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-zinc-700 pt-2 flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Endereço de Entrega
                  </h4>
                  <div className="text-sm text-gray-400 p-4 bg-zinc-800 rounded-lg">
                    <p className="font-semibold text-white">{selectedOrder.shippingAddress?.name}</p>
                    <p>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.number}</p>
                    {selectedOrder.shippingAddress?.complement && (
                      <p>{selectedOrder.shippingAddress.complement}</p>
                    )}
                    <p>{selectedOrder.shippingAddress?.neighborhood}</p>
                    <p>{selectedOrder.shippingAddress?.city}/{selectedOrder.shippingAddress?.state}</p>
                    <p>CEP: {selectedOrder.shippingAddress?.zipCode}</p>
                    {selectedOrder.shippingAddress?.phone && (
                      <p className="mt-2">Tel: {selectedOrder.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <Button 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Fechar
              </Button>
              <Button 
                onClick={() => window.open(`https://wa.me/5577998309542?text=Olá! Tenho uma dúvida sobre o pedido ${selectedOrder._id.toString().slice(-8).toUpperCase()}`, '_blank')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Falar com a Loja
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
