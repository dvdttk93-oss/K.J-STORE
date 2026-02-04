'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, ShoppingCart, Users, DollarSign, 
  Plus, Edit, Trash2, Eye, Search, Filter,
  LogOut, Home, TrendingUp, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user, activeTab]);

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
        if (data.user.role === 'admin') {
          setUser(data.user);
        } else {
          alert('Acesso negado. Apenas administradores.');
          router.push('/');
        }
      } else {
        localStorage.removeItem('token');
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const token = localStorage.getItem('token');

    try {
      if (activeTab === 'dashboard') {
        const response = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setStats(data.stats);
        setOrders(data.recentOrders || []);
      } else if (activeTab === 'products') {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data.products || []);
      } else if (activeTab === 'orders') {
        const response = await fetch('/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (activeTab === 'users') {
        const response = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setUsers(data.users || []);
      } else if (activeTab === 'categories') {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Produto excluído com sucesso!');
        loadData();
      } else {
        alert('Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao processar solicitação');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      originalPrice: parseFloat(formData.get('originalPrice')),
      category: formData.get('category'),
      images: formData.get('images').split(',').map(img => img.trim()),
      sizes: formData.get('sizes').split(',').map(s => s.trim()),
      colors: formData.get('colors').split(',').map(c => c.trim()),
      stock: parseInt(formData.get('stock')),
      featured: formData.get('featured') === 'on'
    };

    const token = localStorage.getItem('token');

    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct._id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        alert(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
        setShowProductModal(false);
        setEditingProduct(null);
        loadData();
      } else {
        alert('Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao processar solicitação');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Status atualizado!');
        loadData();
      } else {
        alert('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao processar solicitação');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const categoryData = {
      name: formData.get('name'),
      slug: formData.get('slug')
    };

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        alert('Categoria criada com sucesso!');
        setShowCategoryModal(false);
        loadData();
      } else {
        alert('Erro ao criar categoria');
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao processar solicitação');
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

  if (!user) return null;

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'Pendente',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };

    return (
      <Badge className={variants[status] || variants.pending}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-zinc-900 text-white border-r border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center space-x-3 mb-2">
            <img src="/logo.jpeg" alt="K.J STORE" className="h-10 w-10 object-contain rounded" />
            <div>
              <h1 className="text-xl font-black tracking-tight">ADMIN PANEL</h1>
            </div>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">K.J STORE</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-6 py-3 hover:bg-zinc-800 transition-colors ${
              activeTab === 'dashboard' ? 'bg-zinc-800 border-l-4 border-green-400' : ''
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            <span className="font-bold uppercase text-sm tracking-wide">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center px-6 py-3 hover:bg-zinc-800 transition-colors ${
              activeTab === 'products' ? 'bg-zinc-800 border-l-4 border-green-400' : ''
            }`}
          >
            <Package className="w-5 h-5 mr-3" />
            <span className="font-bold uppercase text-sm tracking-wide">Produtos</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center px-6 py-3 hover:bg-zinc-800 transition-colors ${
              activeTab === 'categories' ? 'bg-zinc-800 border-l-4 border-green-400' : ''
            }`}
          >
            <Filter className="w-5 h-5 mr-3" />
            <span className="font-bold uppercase text-sm tracking-wide">Categorias</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center px-6 py-3 hover:bg-zinc-800 transition-colors ${
              activeTab === 'orders' ? 'bg-zinc-800 border-l-4 border-green-400' : ''
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-3" />
            <span className="font-bold uppercase text-sm tracking-wide">Pedidos</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center px-6 py-3 hover:bg-zinc-800 transition-colors ${
              activeTab === 'users' ? 'bg-zinc-800 border-l-4 border-green-400' : ''
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            <span className="font-bold uppercase text-sm tracking-wide">Usuários</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-zinc-800">
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Logado como</p>
            <p className="font-bold text-white">{user.name}</p>
          </div>
          <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 bg-black min-h-screen">
        {/* Dashboard */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <h2 className="text-4xl font-black text-white mb-8 uppercase tracking-tight">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-green-400 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total de Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-white">{stats.totalProducts}</div>
                    <Package className="w-10 h-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 hover:border-green-400 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-white">{stats.totalOrders}</div>
                    <ShoppingCart className="w-10 h-10 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 hover:border-green-400 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-white">{stats.totalUsers}</div>
                    <Users className="w-10 h-10 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 hover:border-green-400 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wide">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-white">R$ {stats.totalRevenue.toFixed(2)}</div>
                    <DollarSign className="w-10 h-10 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white font-black uppercase tracking-wide">Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">Pedido #{order._id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">{order.userEmail}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {order.total.toFixed(2)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Produtos</h2>
              <Button onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product._id}>
                  <CardContent className="p-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg">R$ {product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Estoque: {product.stock}</p>
                      </div>
                      {product.featured && <Badge>Destaque</Badge>}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => { setEditingProduct(product); setShowProductModal(true); }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Categorias</h2>
              <Button onClick={() => setShowCategoryModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map(category => (
                <Card key={category._id}>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm">Slug: {category.slug}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Pedidos</h2>

            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Pedido #{order._id.slice(-8)}</h3>
                        <p className="text-gray-600">{order.userEmail}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl mb-2">R$ {order.total.toFixed(2)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm py-1">
                          <span>{item.name} (x{item.quantity})</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <h4 className="font-semibold mb-2">Endereço de Entrega:</h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress?.street}, {order.shippingAddress?.number}<br />
                        {order.shippingAddress?.neighborhood} - {order.shippingAddress?.city}/{order.shippingAddress?.state}<br />
                        CEP: {order.shippingAddress?.zipCode}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, 'processing')}
                        disabled={order.status !== 'pending'}
                      >
                        Processar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                        disabled={order.status !== 'processing'}
                      >
                        Enviar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                        disabled={order.status !== 'shipped'}
                      >
                        Entregar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                        disabled={order.status === 'delivered' || order.status === 'cancelled'}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Usuários</h2>

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data de Cadastro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user._id}>
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                  <Input
                    name="name"
                    required
                    defaultValue={editingProduct?.name}
                    placeholder="Ex: Tênis Air Max"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    name="description"
                    required
                    defaultValue={editingProduct?.description}
                    className="w-full border rounded-lg p-2 min-h-[100px]"
                    placeholder="Descrição detalhada do produto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.price}
                    placeholder="299.90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preço Original (R$)</label>
                  <Input
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.originalPrice}
                    placeholder="399.90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <Input
                    name="category"
                    required
                    defaultValue={editingProduct?.category}
                    placeholder="tenis-masculino"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estoque</label>
                  <Input
                    name="stock"
                    type="number"
                    required
                    defaultValue={editingProduct?.stock}
                    placeholder="100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">URLs das Imagens (separadas por vírgula)</label>
                  <Input
                    name="images"
                    required
                    defaultValue={editingProduct?.images?.join(', ')}
                    placeholder="https://image1.jpg, https://image2.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tamanhos (separados por vírgula)</label>
                  <Input
                    name="sizes"
                    required
                    defaultValue={editingProduct?.sizes?.join(', ')}
                    placeholder="P, M, G, GG"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cores (separadas por vírgula)</label>
                  <Input
                    name="colors"
                    required
                    defaultValue={editingProduct?.colors?.join(', ')}
                    placeholder="Preto, Branco, Azul"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={editingProduct?.featured}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Produto em Destaque</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Atualizar Produto' : 'Criar Produto'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowProductModal(false); setEditingProduct(null); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Nova Categoria</h2>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Categoria</label>
                <Input
                  name="name"
                  required
                  placeholder="Ex: Equipamentos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL amigável)</label>
                <Input
                  name="slug"
                  required
                  placeholder="equipamentos"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Categoria
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
