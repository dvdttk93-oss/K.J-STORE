import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui-mude-em-producao';
let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  
  try {
    client = await MongoClient.connect(process.env.MONGO_URL);
    db = client.db('ecommerce_nike');
    
    // Criar índices
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ name: 1 });
    await db.collection('products').createIndex({ category: 1 });
    
    return db;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

// Middleware de autenticação
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Seed inicial de dados
async function seedDatabase(db) {
  const productsCount = await db.collection('products').countDocuments();
  
  if (productsCount === 0) {
    console.log('Criando dados iniciais...');
    
    // Categorias
    const categories = [
      { _id: 'tenis-masculino', name: 'Tênis Masculino', slug: 'tenis-masculino' },
      { _id: 'tenis-feminino', name: 'Tênis Feminino', slug: 'tenis-feminino' },
      { _id: 'camisetas', name: 'Camisetas', slug: 'camisetas' },
      { _id: 'calcas', name: 'Calças', slug: 'calcas' },
      { _id: 'shorts', name: 'Shorts', slug: 'shorts' },
      { _id: 'acessorios', name: 'Acessórios', slug: 'acessorios' },
    ];
    
    await db.collection('categories').insertMany(categories);
    
    // Produtos fake
    const products = [
      {
        name: 'Air Max Pro Elite',
        description: 'Tênis de corrida premium com tecnologia Air Max. Conforto excepcional e design moderno para seus treinos.',
        price: 799.90,
        originalPrice: 999.90,
        category: 'tenis-masculino',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'],
        sizes: ['39', '40', '41', '42', '43', '44'],
        colors: ['Preto', 'Branco', 'Azul'],
        stock: 50,
        featured: true,
        rating: 4.8,
        reviews: 234
      },
      {
        name: 'Revolution Run',
        description: 'Tênis versátil para corrida e caminhada. Amortecimento responsivo e cabedal respirável.',
        price: 449.90,
        originalPrice: 599.90,
        category: 'tenis-masculino',
        images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'],
        sizes: ['38', '39', '40', '41', '42', '43'],
        colors: ['Cinza', 'Preto', 'Verde'],
        stock: 80,
        featured: true,
        rating: 4.5,
        reviews: 156
      },
      {
        name: 'Zoom Fly Elite',
        description: 'Performance máxima para atletas. Tecnologia Zoom Air para propulsão explosiva.',
        price: 899.90,
        originalPrice: 1199.90,
        category: 'tenis-masculino',
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800'],
        sizes: ['40', '41', '42', '43', '44'],
        colors: ['Laranja', 'Preto'],
        stock: 30,
        featured: false,
        rating: 4.9,
        reviews: 89
      },
      {
        name: 'Air Sport Women',
        description: 'Tênis feminino com design elegante e conforto superior. Perfeito para o dia a dia.',
        price: 699.90,
        originalPrice: 899.90,
        category: 'tenis-feminino',
        images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800'],
        sizes: ['34', '35', '36', '37', '38', '39'],
        colors: ['Rosa', 'Branco', 'Lilás'],
        stock: 60,
        featured: true,
        rating: 4.7,
        reviews: 198
      },
      {
        name: 'Flex Control Feminino',
        description: 'Tênis de treino com flexibilidade e suporte. Ideal para academia e atividades físicas.',
        price: 549.90,
        originalPrice: 699.90,
        category: 'tenis-feminino',
        images: ['https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800'],
        sizes: ['34', '35', '36', '37', '38'],
        colors: ['Preto/Rosa', 'Cinza', 'Azul'],
        stock: 45,
        featured: false,
        rating: 4.6,
        reviews: 112
      },
      {
        name: 'Camiseta Dri-FIT Performance',
        description: 'Camiseta esportiva com tecnologia Dri-FIT que mantém você seco e confortável.',
        price: 129.90,
        originalPrice: 179.90,
        category: 'camisetas',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Preto', 'Branco', 'Cinza', 'Azul'],
        stock: 120,
        featured: true,
        rating: 4.4,
        reviews: 456
      },
      {
        name: 'Camiseta Essential',
        description: 'Camiseta básica de algodão premium. Essencial para o guarda-roupa.',
        price: 89.90,
        originalPrice: 129.90,
        category: 'camisetas',
        images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
        sizes: ['P', 'M', 'G', 'GG', 'XGG'],
        colors: ['Branco', 'Preto', 'Verde', 'Vermelho'],
        stock: 200,
        featured: false,
        rating: 4.3,
        reviews: 678
      },
      {
        name: 'Calça Jogger Premium',
        description: 'Calça jogger com ajuste moderno. Conforto e estilo para o dia a dia.',
        price: 299.90,
        originalPrice: 399.90,
        category: 'calcas',
        images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Preto', 'Cinza', 'Azul Marinho'],
        stock: 70,
        featured: true,
        rating: 4.6,
        reviews: 234
      },
      {
        name: 'Calça Moletom Tech',
        description: 'Calça de moletom tecnológico com bolsos laterais. Perfeita para treinos.',
        price: 349.90,
        originalPrice: 449.90,
        category: 'calcas',
        images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
        sizes: ['M', 'G', 'GG'],
        colors: ['Preto', 'Cinza'],
        stock: 55,
        featured: false,
        rating: 4.5,
        reviews: 167
      },
      {
        name: 'Short Dri-FIT Training',
        description: 'Short de treino com tecnologia de secagem rápida. Liberdade de movimento.',
        price: 159.90,
        originalPrice: 219.90,
        category: 'shorts',
        images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800'],
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Preto', 'Azul', 'Verde'],
        stock: 90,
        featured: false,
        rating: 4.4,
        reviews: 289
      },
      {
        name: 'Boné Sportswear Classic',
        description: 'Boné clássico com logo bordado. Proteção e estilo.',
        price: 119.90,
        originalPrice: 159.90,
        category: 'acessorios',
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800'],
        sizes: ['Único'],
        colors: ['Preto', 'Branco', 'Azul', 'Vermelho'],
        stock: 150,
        featured: false,
        rating: 4.5,
        reviews: 342
      },
      {
        name: 'Mochila Sport Pro',
        description: 'Mochila esportiva com compartimento para notebook. Resistente e funcional.',
        price: 279.90,
        originalPrice: 349.90,
        category: 'acessorios',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
        sizes: ['Único'],
        colors: ['Preto', 'Cinza'],
        stock: 40,
        featured: true,
        rating: 4.7,
        reviews: 178
      },
      {
        name: 'Meias Performance Kit 3 Pares',
        description: 'Kit com 3 pares de meias esportivas. Conforto e durabilidade.',
        price: 79.90,
        originalPrice: 99.90,
        category: 'acessorios',
        images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800'],
        sizes: ['35-38', '39-42', '43-46'],
        colors: ['Branco', 'Preto', 'Misto'],
        stock: 180,
        featured: false,
        rating: 4.3,
        reviews: 523
      },
      {
        name: 'Jaqueta Windrunner',
        description: 'Jaqueta corta-vento com capuz. Proteção contra os elementos.',
        price: 499.90,
        originalPrice: 649.90,
        category: 'calcas',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
        sizes: ['M', 'G', 'GG'],
        colors: ['Preto', 'Azul', 'Cinza'],
        stock: 35,
        featured: true,
        rating: 4.8,
        reviews: 145
      },
      {
        name: 'Garrafa Térmica 750ml',
        description: 'Garrafa térmica de aço inoxidável. Mantém bebidas geladas por 24h.',
        price: 139.90,
        originalPrice: 179.90,
        category: 'acessorios',
        images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'],
        sizes: ['750ml'],
        colors: ['Preto', 'Prata', 'Azul'],
        stock: 100,
        featured: false,
        rating: 4.6,
        reviews: 267
      }
    ];
    
    await db.collection('products').insertMany(products);
    
    // Criar usuário admin padrão
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.collection('users').insertOne({
      name: 'Administrador',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('Dados iniciais criados com sucesso!');
  }
}

export async function GET(request) {
  const db = await connectDB();
  await seedDatabase(db);
  
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');
  
  try {
    // Auth - Me
    if (path === 'auth/me') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
      
      const { password, ...userWithoutPassword } = user;
      return NextResponse.json({ user: userWithoutPassword });
    }
    
    // Products - List
    if (path === 'products' || path.startsWith('products?')) {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const size = searchParams.get('size');
      const color = searchParams.get('color');
      const search = searchParams.get('search');
      const featured = searchParams.get('featured');
      
      let query = {};
      
      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      if (size) query.sizes = size;
      if (color) query.colors = new RegExp(color, 'i');
      if (search) query.name = new RegExp(search, 'i');
      if (featured) query.featured = featured === 'true';
      
      const products = await db.collection('products').find(query).toArray();
      return NextResponse.json({ products });
    }
    
    // Product - Single
    if (path.startsWith('products/')) {
      const id = path.split('/')[1];
      const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
      
      if (!product) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
      }
      
      return NextResponse.json({ product });
    }
    
    // Categories
    if (path === 'categories') {
      const categories = await db.collection('categories').find({}).toArray();
      return NextResponse.json({ categories });
    }
    
    // Cart - Get
    if (path === 'cart') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const cart = await db.collection('cart').find({ userEmail: decoded.email }).toArray();
      
      // Buscar detalhes dos produtos
      const cartWithProducts = await Promise.all(
        cart.map(async (item) => {
          const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId) });
          return { ...item, product };
        })
      );
      
      return NextResponse.json({ cart: cartWithProducts });
    }
    
    // Wishlist - Get
    if (path === 'wishlist') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const wishlist = await db.collection('wishlist').find({ userEmail: decoded.email }).toArray();
      
      // Buscar detalhes dos produtos
      const wishlistWithProducts = await Promise.all(
        wishlist.map(async (item) => {
          const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId) });
          return { ...item, product };
        })
      );
      
      return NextResponse.json({ wishlist: wishlistWithProducts });
    }
    
    // Orders - Get user orders
    if (path === 'orders') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const orders = await db.collection('orders')
        .find({ userEmail: decoded.email })
        .sort({ createdAt: -1 })
        .toArray();
      
      return NextResponse.json({ orders });
    }
    
    // Admin - Dashboard Stats
    if (path === 'admin/dashboard') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const totalProducts = await db.collection('products').countDocuments();
      const totalOrders = await db.collection('orders').countDocuments();
      const totalUsers = await db.collection('users').countDocuments();
      
      const orders = await db.collection('orders').find({}).toArray();
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      
      const recentOrders = await db.collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
      
      return NextResponse.json({
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue
        },
        recentOrders
      });
    }
    
    // Admin - All Orders
    if (path === 'admin/orders') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const orders = await db.collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      return NextResponse.json({ orders });
    }
    
    // Admin - All Users
    if (path === 'admin/users') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const users = await db.collection('users')
        .find({}, { projection: { password: 0 } })
        .toArray();
      
      return NextResponse.json({ users });
    }
    
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404 });
    
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  const db = await connectDB();
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');
  
  try {
    const body = await request.json();
    
    // Auth - Register
    if (path === 'auth/register') {
      const { name, email, password } = body;
      
      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
      }
      
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await db.collection('users').insertOne({
        name,
        email,
        password: hashedPassword,
        role: 'customer',
        createdAt: new Date()
      });
      
      const token = jwt.sign({ email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
      
      return NextResponse.json({
        message: 'Usuário criado com sucesso',
        token,
        user: { name, email, role: 'customer' }
      });
    }
    
    // Auth - Login
    if (path === 'auth/login') {
      const { email, password } = body;
      
      if (!email || !password) {
        return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
      }
      
      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
      }
      
      const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json({
        message: 'Login realizado com sucesso',
        token,
        user: userWithoutPassword
      });
    }
    
    // Cart - Add item
    if (path === 'cart') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const { productId, quantity, size, color } = body;
      
      // Verificar se o produto existe
      const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      if (!product) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
      }
      
      // Verificar se já existe no carrinho
      const existingItem = await db.collection('cart').findOne({
        userEmail: decoded.email,
        productId,
        size,
        color
      });
      
      if (existingItem) {
        await db.collection('cart').updateOne(
          { _id: existingItem._id },
          { $set: { quantity: existingItem.quantity + quantity } }
        );
      } else {
        await db.collection('cart').insertOne({
          userEmail: decoded.email,
          productId,
          quantity,
          size,
          color,
          addedAt: new Date()
        });
      }
      
      return NextResponse.json({ message: 'Produto adicionado ao carrinho' });
    }
    
    // Wishlist - Add item
    if (path === 'wishlist') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const { productId } = body;
      
      const existingItem = await db.collection('wishlist').findOne({
        userEmail: decoded.email,
        productId
      });
      
      if (existingItem) {
        return NextResponse.json({ error: 'Produto já está nos favoritos' }, { status: 400 });
      }
      
      await db.collection('wishlist').insertOne({
        userEmail: decoded.email,
        productId,
        addedAt: new Date()
      });
      
      return NextResponse.json({ message: 'Produto adicionado aos favoritos' });
    }
    
    // Orders - Create
    if (path === 'orders') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const { items, shippingAddress, paymentMethod, total } = body;
      
      const order = {
        userEmail: decoded.email,
        items,
        shippingAddress,
        paymentMethod,
        pixKey: body.pixKey || null,
        total,
        status: 'pending',
        createdAt: new Date()
      };
      
      const result = await db.collection('orders').insertOne(order);
      
      // Limpar carrinho
      await db.collection('cart').deleteMany({ userEmail: decoded.email });
      
      return NextResponse.json({
        message: 'Pedido criado com sucesso',
        orderId: result.insertedId
      });
    }
    
    // Admin - Create Product
    if (path === 'admin/products') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const product = {
        ...body,
        createdAt: new Date(),
        rating: 0,
        reviews: 0
      };
      
      const result = await db.collection('products').insertOne(product);
      
      return NextResponse.json({
        message: 'Produto criado com sucesso',
        productId: result.insertedId
      });
    }
    
    // Admin - Create Category
    if (path === 'admin/categories') {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const { name, slug } = body;
      
      const result = await db.collection('categories').insertOne({
        name,
        slug,
        createdAt: new Date()
      });
      
      return NextResponse.json({
        message: 'Categoria criada com sucesso',
        categoryId: result.insertedId
      });
    }
    
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404 });
    
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request) {
  const db = await connectDB();
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');
  
  try {
    const body = await request.json();
    
    // Cart - Update quantity
    if (path.startsWith('cart/')) {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const id = path.split('/')[1];
      const { quantity } = body;
      
      await db.collection('cart').updateOne(
        { _id: new ObjectId(id), userEmail: decoded.email },
        { $set: { quantity } }
      );
      
      return NextResponse.json({ message: 'Carrinho atualizado' });
    }
    
    // Admin - Update Product
    if (path.startsWith('admin/products/')) {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const id = path.split('/')[2];
      
      await db.collection('products').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...body, updatedAt: new Date() } }
      );
      
      return NextResponse.json({ message: 'Produto atualizado com sucesso' });
    }
    
    // Admin - Update Order Status
    if (path.startsWith('admin/orders/')) {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const id = path.split('/')[2];
      const { status } = body;
      
      await db.collection('orders').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );
      
      return NextResponse.json({ message: 'Pedido atualizado com sucesso' });
    }
    
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404 });
    
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const db = await connectDB();
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');
  
  try {
    // Cart - Remove item
    if (path.startsWith('cart/')) {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const id = path.split('/')[1];
      
      await db.collection('cart').deleteOne({
        _id: new ObjectId(id),
        userEmail: decoded.email
      });
      
      return NextResponse.json({ message: 'Item removido do carrinho' });
    }
    
    // Wishlist - Remove item
    if (path.startsWith('wishlist/')) {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const id = path.split('/')[1];
      
      await db.collection('wishlist').deleteOne({
        _id: new ObjectId(id),
        userEmail: decoded.email
      });
      
      return NextResponse.json({ message: 'Item removido dos favoritos' });
    }
    
    // Admin - Delete Product
    if (path.startsWith('admin/products/')) {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const id = path.split('/')[2];
      
      await db.collection('products').deleteOne({ _id: new ObjectId(id) });
      
      return NextResponse.json({ message: 'Produto removido com sucesso' });
    }
    
    // Admin - Delete Category
    if (path.startsWith('admin/categories/')) {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      
      const user = await db.collection('users').findOne({ email: decoded.email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
      
      const id = path.split('/')[2];
      
      await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
      
      return NextResponse.json({ message: 'Categoria removida com sucesso' });
    }
    
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404 });
    
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}