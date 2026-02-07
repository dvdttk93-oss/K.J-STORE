'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Trash2, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FavoritosPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

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
        loadWishlist(token);
      } else {
        localStorage.removeItem('token');
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/');
    }
  };

  const loadWishlist = async (token) => {
    try {
      const response = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    if (!confirm('Deseja remover este item dos favoritos?')) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✓ Item removido dos favoritos!');
        loadWishlist(token);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao remover dos favoritos');
      }
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      alert('Erro ao processar solicitação');
    }
  };

  const addToCart = async (product) => {
    if (!selectedSize) {
      alert('Selecione um tamanho');
      return;
    }

    if (!selectedColor) {
      alert('Selecione uma cor');
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
          productId: product._id,
          quantity: 1,
          size: selectedSize,
          color: selectedColor
        })
      });

      if (response.ok) {
        alert('✓ Produto adicionado ao carrinho!');
        setSelectedProduct(null);
        setSelectedSize('');
        setSelectedColor('');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao adicionar ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      alert('Erro ao processar solicitação');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando favoritos...</p>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2 flex items-center">
            <Heart className="w-10 h-10 mr-3 text-red-500 fill-red-500" />
            Meus Favoritos
          </h1>
          <p className="text-gray-400">Produtos que você salvou para comprar depois</p>
        </div>

        {wishlist.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Nenhum produto favorito</h2>
              <p className="text-gray-400 mb-6">Comece a favoritar produtos clicando no ❤️</p>
              <Button 
                onClick={() => router.push('/')} 
                className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold"
              >
                Explorar Produtos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <Card key={item._id} className="bg-zinc-900 border-zinc-800 hover:border-green-400 transition-all card-hover group">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden aspect-square bg-black">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.originalPrice > product.price && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                      )}
                      
                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="absolute top-4 left-4 p-3 bg-red-500 hover:bg-red-600 backdrop-blur-sm rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
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
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-green-400 text-green-400' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
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
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                        className="w-full bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold hover:shadow-lg"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Adicionar ao Carrinho
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-lg p-8 max-w-4xl w-full my-8 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Selecione Tamanho e Cor</h2>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedSize('');
                  setSelectedColor('');
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full rounded-lg"
                />
              </div>

              <div>
                <h3 className="text-3xl font-black text-white mb-4">{selectedProduct.name}</h3>
                <p className="text-gray-400 mb-4">{selectedProduct.description}</p>

                <div className="flex items-center mb-4">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold text-white">{selectedProduct.rating}</span>
                  <span className="text-gray-400 ml-1">({selectedProduct.reviews} avaliações)</span>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-black text-white mb-2">R$ {selectedProduct.price.toFixed(2)}</div>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <div className="text-lg text-gray-500 line-through">
                      R$ {selectedProduct.originalPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tamanho *</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg hover:border-green-400 transition-colors ${
                          selectedSize === size 
                            ? 'border-green-400 bg-green-400 text-black font-bold' 
                            : 'border-zinc-700 text-gray-400 bg-zinc-800'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cor *</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg hover:border-green-400 transition-colors ${
                          selectedColor === color 
                            ? 'border-green-400 bg-green-400 text-black font-bold' 
                            : 'border-zinc-700 text-gray-400 bg-zinc-800'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold hover:shadow-lg"
                  size="lg"
                  onClick={() => addToCart(selectedProduct)}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
