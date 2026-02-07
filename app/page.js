'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, User, Search, Menu, X, Star, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    loadProducts();
    loadCategories();
    checkAuth();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm, priceRange]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          loadCartCount();
          loadWishlistCount();
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    }
  };

  const loadProducts = async () => {
    try {
      let url = '/api/products?';
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      if (priceRange.min) url += `minPrice=${priceRange.min}&`;
      if (priceRange.max) url += `maxPrice=${priceRange.max}&`;
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadCartCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCartCount(data.cart?.length || 0);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  };

  const loadWishlistCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setWishlistCount(data.wishlist?.length || 0);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    };
    
    if (authMode === 'register') {
      data.name = formData.get('name');
    }
    
    try {
      const response = await fetch(`/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', result.token);
        setUser(result.user);
        setShowAuthModal(false);
        loadCartCount();
        loadWishlistCount();
        toast.success(authMode === 'login' ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao autenticar');
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      toast.error('Erro ao processar solicitação');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    toast.success('Logout realizado com sucesso!');
  };

  const addToCart = async (productId) => {
    if (!user) {
      toast.error('Faça login para adicionar ao carrinho');
      setShowAuthModal(true);
      return;
    }
    
    if (!selectedSize) {
      toast.error('Selecione um tamanho');
      return;
    }
    
    if (!selectedColor) {
      toast.error('Selecione uma cor');
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
          size: selectedSize,
          color: selectedColor
        })
      });
      
      if (response.ok) {
        toast.cart(selectedProduct?.name || 'Produto');
        loadCartCount();
        setSelectedProduct(null);
        setSelectedSize('');
        setSelectedColor('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao adicionar ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast.error('Erro ao processar solicitação');
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error('Faça login para adicionar aos favoritos');
      setShowAuthModal(true);
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      
      if (response.ok) {
        toast.wishlist('Produto adicionado');
        loadWishlistCount();
      } else {
        const data = await response.json();
        toast.info(data.error || 'Produto já está nos favoritos');
      }
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      toast.error('Erro ao processar solicitação');
    }
  };

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.jpeg" alt="K.J STORE" className="h-10 w-10 object-contain rounded" />
                <h1 className="text-2xl font-black text-white tracking-tighter">K.J STORE</h1>
              </div>
              
              {/* Desktop Navigation - Scrollable */}
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => {
                    const container = document.getElementById('categories-scroll');
                    if (container) container.scrollLeft -= 200;
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-full text-gray-400 hover:text-green-400"
                >
                  ←
                </button>
                
                <div 
                  id="categories-scroll"
                  className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ maxWidth: '600px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-sm font-bold uppercase tracking-wide hover:text-green-400 transition-colors whitespace-nowrap ${!selectedCategory ? 'text-green-400' : 'text-gray-400'}`}
                  >
                    Todos
                  </button>
                  {categories.map(category => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`text-sm font-bold uppercase tracking-wide hover:text-green-400 transition-colors whitespace-nowrap ${selectedCategory === category.slug ? 'text-green-400' : 'text-gray-400'}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const container = document.getElementById('categories-scroll');
                    if (container) container.scrollLeft += 200;
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-full text-gray-400 hover:text-green-400"
                >
                  →
                </button>
              </div>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              
              {/* Icons */}
              <button onClick={() => setShowFilters(!showFilters)} className="p-2 hover:bg-zinc-900 text-gray-400 hover:text-green-400 rounded-full transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              
              <button onClick={() => router.push('/favoritos')} className="p-2 hover:bg-zinc-900 text-gray-400 hover:text-green-400 rounded-full relative transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-green-400 to-cyan-400 text-black">
                    {wishlistCount}
                  </Badge>
                )}
              </button>
              
              <button onClick={() => router.push('/carrinho')} className="p-2 hover:bg-zinc-900 text-gray-400 hover:text-green-400 rounded-full relative transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-green-400 to-cyan-400 text-black">
                    {cartCount}
                  </Badge>
                )}
              </button>
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => router.push('/minha-conta')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-green-400 hover:bg-zinc-900 font-bold"
                  >
                    📦 Minhas Compras
                  </Button>
                  
                  <span className="text-sm hidden md:inline text-white font-semibold">{user.name}</span>
                  {user.role === 'admin' && (
                    <>
                      <Badge className="bg-gradient-to-r from-green-400 to-cyan-400 text-black">Admin</Badge>
                      <Button 
                        onClick={() => router.push('/admin')} 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                      >
                        Painel Admin
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white hover:bg-zinc-900">
                    Sair
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} size="sm" className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold hover:shadow-lg">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              )}
              
              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-zinc-900 text-gray-400 hover:text-green-400 rounded-full transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="container mx-auto px-4 space-y-2">
              <button
                onClick={() => { setSelectedCategory(null); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded"
              >
                Todos os Produtos
              </button>
              {categories.map(category => (
                <button
                  key={category._id}
                  onClick={() => { setSelectedCategory(category.slug); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded"
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>
        )}
        
        {/* Filters Bar */}
        {showFilters && (
          <div className="border-t border-gray-200 py-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Preço Mínimo</label>
                  <Input
                    type="number"
                    placeholder="R$ 0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Preço Máximo</label>
                  <Input
                    type="number"
                    placeholder="R$ 9999"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPriceRange({ min: '', max: '' })}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      {!selectedCategory && !searchTerm && (
        <section className="relative text-white overflow-hidden">
          {/* Banner Image */}
          <div className="relative h-[600px] md:h-[700px]">
            <img 
              src="/banner.jpeg" 
              alt="K.J STORE Banner" 
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          </div>
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl animate-slide-up">
                <div className="mb-6">
                  <Badge className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold text-sm px-6 py-2 animate-pulse-glow">
                    IMPORTAÇÃO DIRETA DA CHINA
                  </Badge>
                </div>
                
                <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight drop-shadow-2xl">
                  STREETWEAR<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                    ENCONTRA ESPORTE
                  </span>
                </h2>
                
                <p className="text-2xl mb-4 text-gray-200 font-light max-w-2xl leading-relaxed drop-shadow-lg">
                  Conectamos o streetwear e o esporte em um só estilo.
                </p>
                
                <p className="text-lg mb-8 text-gray-300 max-w-2xl leading-relaxed drop-shadow-lg">
                  Atuamos como <span className="text-green-400 font-semibold">importadora</span>, trazendo da China para o Brasil peças que refletem a <span className="text-cyan-400 font-semibold">cultura urbana</span>, o lifestyle esportivo e as tendências que movimentam o cenário global da moda.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold hover:shadow-2xl hover:scale-105 transition-all px-8 py-6 text-lg"
                    onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    EXPLORAR COLEÇÃO
                    <ChevronRight className="ml-2 w-6 h-6" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-black font-bold px-8 py-6 text-lg transition-all backdrop-blur-sm"
                  >
                    SOBRE NÓS
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!selectedCategory && !searchTerm && featuredProducts.length > 0 && (
        <section className="py-16 bg-black" id="produtos">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Badge className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold text-xs px-4 py-1 mb-4">
                TENDÊNCIAS GLOBAIS
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">DROPS EXCLUSIVOS</h2>
              <p className="text-gray-400 text-lg">Direto da China para o seu estilo urbano</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <Card key={product._id} className="group cursor-pointer bg-zinc-900 border-zinc-800 hover:border-green-400 transition-all duration-300 card-hover overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden aspect-square bg-black">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.originalPrice > product.price && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                      
                      <button
                        onClick={() => addToWishlist(product._id)}
                        className="absolute top-4 left-4 p-3 bg-black/80 backdrop-blur-sm rounded-full hover:bg-green-400 hover:text-black transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="p-4 bg-zinc-900">
                      <Badge variant="outline" className="mb-2 text-xs border-green-400 text-green-400">
                        STREETWEAR
                      </Badge>
                      <h3 className="font-bold text-white mb-1 uppercase tracking-wide">{product.name}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-green-400 text-green-400' : 'text-gray-600'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">({product.reviews})</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-black text-white">
                            R$ {product.price.toFixed(2)}
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              R$ {product.originalPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                          className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold hover:shadow-lg hover:shadow-green-400/50"
                        >
                          COMPRAR
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {selectedCategory 
                ? categories.find(c => c.slug === selectedCategory)?.name || 'Produtos'
                : searchTerm 
                  ? `Resultados para "${searchTerm}"`
                  : 'Todos os Produtos'
              }
            </h2>
            <p className="text-gray-600">{products.length} produtos encontrados</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Card key={product._id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.originalPrice > product.price && (
                      <Badge className="absolute top-4 right-4 bg-red-500">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                    <button
                      onClick={() => addToWishlist(product._id)}
                      className="absolute top-4 left-4 p-2 bg-white rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm ml-1">{product.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold">R$ {product.price.toFixed(2)}</div>
                        {product.originalPrice > product.price && (
                          <div className="text-sm text-gray-500 line-through">R$ {product.originalPrice.toFixed(2)}</div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Comprar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img src="/logo.jpeg" alt="K.J STORE" className="h-12 w-12 object-contain rounded" />
                <h3 className="text-2xl font-black tracking-tighter">K.J STORE</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Conectamos o streetwear e o esporte em um só estilo. Importação direta da China.
              </p>
              <div className="mt-6">
                <Badge className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold">
                  🇨🇳 → 🇧🇷
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-black text-lg mb-6 uppercase tracking-wide">Categorias</h4>
              <ul className="space-y-3 text-gray-400">
                {categories.slice(0, 6).map(category => (
                  <li key={category._id}>
                    <button onClick={() => setSelectedCategory(category.slug)} className="hover:text-green-400 transition-colors font-medium">
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-lg mb-6 uppercase tracking-wide">Ajuda</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">Perguntas Frequentes</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">Frete e Entregas</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">Trocas e Devoluções</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-lg mb-6 uppercase tracking-wide">Social</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">Instagram</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">Facebook</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">Twitter</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">TikTok</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">&copy; 2024 K.J STORE. Todos os direitos reservados.</p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-gray-500 text-sm">Importação direta</span>
                <Badge variant="outline" className="border-green-400 text-green-400">
                  AUTÊNTICO
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{authMode === 'login' ? 'Entrar' : 'Cadastrar'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <Input name="name" type="text" required placeholder="Seu nome completo" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
                    <Input name="phone" type="tel" required placeholder="(77) 99830-9542" />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input name="email" type="email" required placeholder="seu@email.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <Input name="password" type="password" required placeholder="••••••••" />
              </div>
              
              <Button type="submit" className="w-full">
                {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-sm text-blue-600 hover:underline"
              >
                {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-lg p-6 md:p-8 max-w-4xl w-full my-8 border-2 border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-black text-white">Detalhes do Produto</h2>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedSize('');
                  setSelectedColor('');
                }}
                className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-all flex-shrink-0"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div>
                {/* Imagem principal */}
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full rounded-lg mb-4"
                />
                {/* Galeria de imagens (se houver mais de uma) */}
                {selectedProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${selectedProduct.name} - ${index + 1}`}
                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 border-2 border-transparent hover:border-green-400 transition-all"
                        onClick={() => {
                          // Trocar imagem principal
                          const newImages = [...selectedProduct.images];
                          [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
                          setSelectedProduct({ ...selectedProduct, images: newImages });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">{selectedProduct.name}</h3>
                <p className="text-gray-400 mb-4">{selectedProduct.description}</p>
                
                <div className="flex items-center mb-4">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold text-white">{selectedProduct.rating}</span>
                  <span className="text-gray-400 ml-1">({selectedProduct.reviews} avaliações)</span>
                </div>
                
                <div className="mb-6">
                  <div className="text-3xl font-black text-white mb-2">R$ {selectedProduct.price.toFixed(2)}</div>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <div className="flex items-center space-x-2">
                      <div className="text-lg text-gray-500 line-through">R$ {selectedProduct.originalPrice.toFixed(2)}</div>
                      <Badge className="bg-red-500">
                        Economize R$ {(selectedProduct.originalPrice - selectedProduct.price).toFixed(2)}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Tamanho</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-3 border rounded-lg hover:border-green-400 transition-colors font-bold ${
                          selectedSize === size ? 'border-green-400 bg-green-400 text-black' : 'border-zinc-700 text-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Cor</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-3 border rounded-lg hover:border-green-400 transition-colors font-bold ${
                          selectedColor === color ? 'border-green-400 bg-green-400 text-black' : 'border-zinc-700 text-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold text-white">Estoque:</span> {selectedProduct.stock} unidades disponíveis
                  </p>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold hover:shadow-lg"
                    size="lg"
                    onClick={() => addToCart(selectedProduct._id)}
                  >
                    Adicionar ao Carrinho
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSelectedProduct(null);
                      setSelectedSize('');
                      setSelectedColor('');
                    }}
                    className="w-full border-zinc-700 text-gray-400 hover:bg-zinc-800"
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}