'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone, Mail, RefreshCw, Copy, MessageCircle, ShoppingBag, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function MinhaContaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const refreshOrders = () => {
    setRefreshing(true);
    const token = localStorage.getItem('token');
    loadOrders(token);
    toast.success('Pedidos atualizados!');
  };

  const copyOrderNumber = (orderId) => {
    navigator.clipboard.writeText(orderId);
    toast.success('Número do pedido copiado!');
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Aguardando Pagamento',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
        bgColor: 'from-amber-500/20 to-orange-500/20',
        icon: Clock,
        step: 1,
        description: 'Seu pedido foi registrado e está aguardando confirmação do pagamento PIX.'
      },
      processing: {
        label: 'Preparando Envio',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        bgColor: 'from-blue-500/20 to-cyan-500/20',
        icon: Package,
        step: 2,
        description: 'Pagamento confirmado! Estamos separando e embalando seus produtos.'
      },
      shipped: {
        label: 'Em Trânsito',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
        bgColor: 'from-purple-500/20 to-pink-500/20',
        icon: Truck,
        step: 3,
        description: 'Seu pedido está a caminho! Acompanhe pelo código de rastreio.'
      },
      delivered: {
        label: 'Entregue',
        color: 'bg-green-500/20 text-green-400 border-green-500/50',
        bgColor: 'from-green-500/20 to-emerald-500/20',
        icon: CheckCircle,
        step: 4,
        description: 'Pedido entregue com sucesso! Aproveite suas compras!'
      },
      cancelled: {
        label: 'Cancelado',
        color: 'bg-red-500/20 text-red-400 border-red-500/50',
        bgColor: 'from-red-500/20 to-rose-500/20',
        icon: XCircle,
        step: 0,
        description: 'Este pedido foi cancelado.'
      }
    };

    return statusMap[status] || statusMap.pending;
  };

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-zinc-800 border-t-green-400 mx-auto"></div>
            <ShoppingBag className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-400" />
          </div>
          <p className="mt-6 text-gray-400 font-medium">Carregando seus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/')} className="flex items-center text-gray-400 hover:text-green-400 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Voltar para Loja</span>
            </button>
            <div className="flex items-center space-x-3">
              <img src="/logo.jpeg" alt="K.J STORE" className="h-10 w-10 object-contain rounded-lg" />
              <h1 className="text-xl font-black text-white">K.J STORE</h1>
            </div>
            <Button
              onClick={refreshOrders}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-green-400"
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* User Profile Card */}
        <div className="mb-8 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center text-black text-2xl font-black">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{user?.name || 'Usuário'}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-1">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {user?.email}
                  </div>
                  {user?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
              <div className="bg-zinc-800/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                <div className="text-2xl font-black text-white">{orders.length}</div>
                <div className="text-xs text-gray-400 font-medium">Pedidos</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                <div className="text-2xl font-black text-green-400">{deliveredOrders}</div>
                <div className="text-xs text-gray-400 font-medium">Entregues</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                <div className="text-2xl font-black text-cyan-400">R$ {totalSpent.toFixed(0)}</div>
                <div className="text-xs text-gray-400 font-medium">Total Gasto</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders Alert */}
        {pendingOrders > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-3">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-white">Você tem {pendingOrders} pedido(s) em andamento</p>
                <p className="text-sm text-gray-400">Acompanhe o status abaixo</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">Histórico de Pedidos</h2>
            <Badge className="bg-zinc-800 text-gray-400 font-medium">
              {orders.length} pedido(s)
            </Badge>
          </div>

          {orders.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhum pedido ainda</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Quando você fizer uma compra, ela aparecerá aqui com todos os detalhes e status de entrega
                </p>
                <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold px-8">
                  Começar a Comprar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const orderDate = new Date(order.createdAt);

                return (
                  <Card 
                    key={order._id} 
                    className={`bg-gradient-to-r ${statusInfo.bgColor} border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer overflow-hidden`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-0">
                      {/* Status Bar */}
                      <div className="bg-zinc-900/80 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${statusInfo.color} border font-bold px-3 py-1`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {orderDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 font-mono">#{order._id.toString().slice(-8).toUpperCase()}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); copyOrderNumber(order._id.toString().slice(-8).toUpperCase()); }}
                            className="p-1 hover:bg-zinc-800 rounded text-gray-500 hover:text-green-400"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Order Content */}
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Products Preview */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {order.items?.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                                  <Package className="w-6 h-6 text-gray-500" />
                                </div>
                              ))}
                              {order.items?.length > 3 && (
                                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-400 font-bold">+{order.items.length - 3}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              {order.items?.map((item, idx) => (
                                <span key={idx}>
                                  {item.name} <span className="text-gray-600">x{item.quantity}</span>
                                  {idx < order.items.length - 1 && ', '}
                                </span>
                              )).slice(0, 2)}
                              {order.items?.length > 2 && <span className="text-gray-500"> e mais {order.items.length - 2}...</span>}
                            </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-2xl font-black text-white">R$ {order.total.toFixed(2)}</div>
                              {order.shipping && (
                                <div className="text-xs text-gray-500">
                                  <Truck className="w-3 h-3 inline mr-1" />
                                  {order.shipping.service} • {order.shipping.deliveryTime} dias
                                </div>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-zinc-700 text-gray-400 hover:border-green-400 hover:text-green-400"
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>

                        {/* Progress Steps */}
                        {order.status !== 'cancelled' && (
                          <div className="mt-6 pt-4 border-t border-zinc-800/50">
                            <div className="flex items-center justify-between relative">
                              <div className="absolute top-4 left-0 right-0 h-1 bg-zinc-800 -z-10"></div>
                              <div 
                                className="absolute top-4 left-0 h-1 bg-gradient-to-r from-green-400 to-cyan-400 -z-10 transition-all duration-500"
                                style={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
                              ></div>
                              
                              {[
                                { status: 'pending', icon: Clock, label: 'Pagamento' },
                                { status: 'processing', icon: Package, label: 'Preparação' },
                                { status: 'shipped', icon: Truck, label: 'Enviado' },
                                { status: 'delivered', icon: CheckCircle, label: 'Entregue' }
                              ].map((step, idx) => {
                                const isActive = statusInfo.step >= idx + 1;
                                const isCurrent = statusInfo.step === idx + 1;
                                const StepIcon = step.icon;
                                
                                return (
                                  <div key={step.status} className="flex flex-col items-center z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                      isActive 
                                        ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black' 
                                        : 'bg-zinc-800 text-gray-600'
                                    } ${isCurrent ? 'ring-4 ring-green-400/30' : ''}`}>
                                      <StepIcon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-2xl max-w-4xl w-full my-8 border border-zinc-800 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-400/10 to-cyan-400/10 p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-black text-white">Pedido</h2>
                    <Badge className="bg-zinc-800 text-white font-mono">
                      #{selectedOrder._id.toString().slice(-8).toUpperCase()}
                    </Badge>
                    <button 
                      onClick={() => copyOrderNumber(selectedOrder._id.toString().slice(-8).toUpperCase())}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Realizado em {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  <span className="text-xl text-white">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Status Timeline */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-green-400" />
                    Status do Pedido
                  </h3>
                  
                  <div className="space-y-1">
                    {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                      const info = getStatusInfo(status);
                      const currentInfo = getStatusInfo(selectedOrder.status);
                      const StatusIcon = info.icon;
                      const isActive = currentInfo.step >= index + 1;
                      const isCurrent = selectedOrder.status === status;

                      return (
                        <div key={status} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                              isActive 
                                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black' 
                                : 'bg-zinc-800 text-gray-600'
                            } ${isCurrent ? 'ring-4 ring-green-400/30 scale-110' : ''}`}>
                              <StatusIcon className="w-6 h-6" />
                            </div>
                            {index < 3 && (
                              <div className={`w-0.5 h-12 my-1 ${isActive ? 'bg-green-400' : 'bg-zinc-800'}`}></div>
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <p className={`font-bold text-lg ${isCurrent ? 'text-green-400' : isActive ? 'text-white' : 'text-gray-600'}`}>
                              {info.label}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-gray-400 mt-1">{info.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-6">
                  {/* Items */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-2 text-green-400" />
                      Itens do Pedido
                    </h3>
                    <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-zinc-700/50 last:border-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.size && `Tam: ${item.size}`} {item.color && `• Cor: ${item.color}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">R$ {(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-xl p-4 border border-green-400/20">
                    <div className="flex justify-between text-gray-400 mb-2">
                      <span>Subtotal</span>
                      <span>R$ {selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    {selectedOrder.shippingCost > 0 && (
                      <div className="flex justify-between text-gray-400 mb-2">
                        <span>Frete ({selectedOrder.shipping?.service})</span>
                        <span>R$ {selectedOrder.shippingCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-zinc-700 pt-2 mt-2 flex justify-between">
                      <span className="text-lg font-bold text-white">Total</span>
                      <span className="text-2xl font-black text-green-400">R$ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-400" />
                      Endereço de Entrega
                    </h3>
                    <div className="bg-zinc-800/50 rounded-xl p-4">
                      <p className="font-semibold text-white mb-1">{selectedOrder.shippingAddress?.name}</p>
                      <p className="text-gray-400 text-sm">
                        {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.number}
                        {selectedOrder.shippingAddress?.complement && ` - ${selectedOrder.shippingAddress.complement}`}
                      </p>
                      <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress?.neighborhood}</p>
                      <p className="text-gray-400 text-sm">
                        {selectedOrder.shippingAddress?.city}/{selectedOrder.shippingAddress?.state} - CEP: {selectedOrder.shippingAddress?.zipCode}
                      </p>
                      {selectedOrder.shippingAddress?.phone && (
                        <p className="text-gray-400 text-sm mt-2 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {selectedOrder.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-4">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-green-400 mr-3" />
                      <div>
                        <p className="font-medium text-white">Pagamento via PIX</p>
                        <p className="text-xs text-gray-500">Aprovado</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Pago</Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-gray-400 hover:bg-zinc-800"
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => window.open(`https://wa.me/5577998309542?text=Olá! Preciso de ajuda com o pedido ${selectedOrder._id.toString().slice(-8).toUpperCase()}`, '_blank')}
                  className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar com Suporte
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
