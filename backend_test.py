#!/usr/bin/env python3
"""
E-commerce Sport Store Backend API Test Suite
Tests all backend endpoints and functionality
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://nike-inspired-46.preview.emergentagent.com/api"

class EcommerceAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.user_token = None
        self.admin_token = None
        self.test_user_email = "testuser@example.com"
        self.test_user_password = "testpass123"
        self.admin_email = "admin@ecommerce.com"
        self.admin_password = "admin123"
        self.created_product_id = None
        self.created_category_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
    def make_request(self, method, endpoint, data=None, headers=None, token=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}/{endpoint}"
        
        if headers is None:
            headers = {"Content-Type": "application/json"}
            
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
            
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None
    
    def test_auth_register(self):
        """Test user registration"""
        print("\n=== Testing User Registration ===")
        
        data = {
            "name": "Test User",
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = self.make_request("POST", "auth/register", data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "token" in response_data:
                self.user_token = response_data["token"]
                self.log_result("User Registration", True, "User registered successfully", response_data)
                return True
            else:
                self.log_result("User Registration", False, "No token in response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("User Registration", False, f"Registration failed: {error_msg}")
            return False
    
    def test_auth_login(self):
        """Test user login"""
        print("\n=== Testing User Login ===")
        
        data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = self.make_request("POST", "auth/login", data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "token" in response_data:
                self.user_token = response_data["token"]
                self.log_result("User Login", True, "Login successful", response_data)
                return True
            else:
                self.log_result("User Login", False, "No token in response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("User Login", False, f"Login failed: {error_msg}")
            return False
    
    def test_auth_me(self):
        """Test get current user"""
        print("\n=== Testing Get Current User ===")
        
        if not self.user_token:
            self.log_result("Get Current User", False, "No user token available")
            return False
            
        response = self.make_request("GET", "auth/me", token=self.user_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "user" in response_data:
                self.log_result("Get Current User", True, "User data retrieved", response_data)
                return True
            else:
                self.log_result("Get Current User", False, "No user data in response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Get Current User", False, f"Failed to get user: {error_msg}")
            return False
    
    def test_admin_login(self):
        """Test admin login"""
        print("\n=== Testing Admin Login ===")
        
        data = {
            "email": self.admin_email,
            "password": self.admin_password
        }
        
        response = self.make_request("POST", "auth/login", data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "token" in response_data:
                self.admin_token = response_data["token"]
                self.log_result("Admin Login", True, "Admin login successful", response_data)
                return True
            else:
                self.log_result("Admin Login", False, "No token in response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Admin Login", False, f"Admin login failed: {error_msg}")
            return False
    
    def test_products_list(self):
        """Test listing products"""
        print("\n=== Testing Products List ===")
        
        response = self.make_request("GET", "products")
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "products" in response_data and isinstance(response_data["products"], list):
                products_count = len(response_data["products"])
                self.log_result("Products List", True, f"Retrieved {products_count} products", {"count": products_count})
                return True
            else:
                self.log_result("Products List", False, "Invalid products response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Products List", False, f"Failed to get products: {error_msg}")
            return False
    
    def test_products_filter_category(self):
        """Test filtering products by category"""
        print("\n=== Testing Products Filter by Category ===")
        
        response = self.make_request("GET", "products?category=tenis-masculino")
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "products" in response_data:
                filtered_count = len(response_data["products"])
                self.log_result("Products Filter Category", True, f"Retrieved {filtered_count} products in category", {"count": filtered_count})
                return True
            else:
                self.log_result("Products Filter Category", False, "Invalid filtered products response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Products Filter Category", False, f"Failed to filter products: {error_msg}")
            return False
    
    def test_products_filter_featured(self):
        """Test filtering featured products"""
        print("\n=== Testing Featured Products ===")
        
        response = self.make_request("GET", "products?featured=true")
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "products" in response_data:
                featured_count = len(response_data["products"])
                self.log_result("Featured Products", True, f"Retrieved {featured_count} featured products", {"count": featured_count})
                return True
            else:
                self.log_result("Featured Products", False, "Invalid featured products response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Featured Products", False, f"Failed to get featured products: {error_msg}")
            return False
    
    def test_products_filter_price(self):
        """Test filtering products by price range"""
        print("\n=== Testing Products Filter by Price ===")
        
        response = self.make_request("GET", "products?minPrice=100&maxPrice=500")
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "products" in response_data:
                price_filtered_count = len(response_data["products"])
                self.log_result("Products Filter Price", True, f"Retrieved {price_filtered_count} products in price range", {"count": price_filtered_count})
                return True
            else:
                self.log_result("Products Filter Price", False, "Invalid price filtered products response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Products Filter Price", False, f"Failed to filter by price: {error_msg}")
            return False
    
    def test_products_search(self):
        """Test searching products"""
        print("\n=== Testing Products Search ===")
        
        response = self.make_request("GET", "products?search=Air")
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "products" in response_data:
                search_count = len(response_data["products"])
                self.log_result("Products Search", True, f"Found {search_count} products matching 'Air'", {"count": search_count})
                return True
            else:
                self.log_result("Products Search", False, "Invalid search results", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Products Search", False, f"Search failed: {error_msg}")
            return False
    
    def test_categories_list(self):
        """Test listing categories"""
        print("\n=== Testing Categories List ===")
        
        response = self.make_request("GET", "categories")
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "categories" in response_data and isinstance(response_data["categories"], list):
                categories_count = len(response_data["categories"])
                self.log_result("Categories List", True, f"Retrieved {categories_count} categories", {"count": categories_count})
                return True
            else:
                self.log_result("Categories List", False, "Invalid categories response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Categories List", False, f"Failed to get categories: {error_msg}")
            return False
    
    def test_cart_add_item(self):
        """Test adding item to cart"""
        print("\n=== Testing Add Item to Cart ===")
        
        if not self.user_token:
            self.log_result("Add Item to Cart", False, "No user token available")
            return False
        
        # First get a product ID
        products_response = self.make_request("GET", "products")
        if not products_response or products_response.status_code != 200:
            self.log_result("Add Item to Cart", False, "Could not get products for cart test")
            return False
            
        products = products_response.json().get("products", [])
        if not products:
            self.log_result("Add Item to Cart", False, "No products available for cart test")
            return False
            
        product_id = str(products[0]["_id"])
        
        data = {
            "productId": product_id,
            "quantity": 2,
            "size": "42",
            "color": "Preto"
        }
        
        response = self.make_request("POST", "cart", data, token=self.user_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            self.log_result("Add Item to Cart", True, "Item added to cart successfully", response_data)
            return True
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Add Item to Cart", False, f"Failed to add to cart: {error_msg}")
            return False
    
    def test_cart_get_items(self):
        """Test getting cart items"""
        print("\n=== Testing Get Cart Items ===")
        
        if not self.user_token:
            self.log_result("Get Cart Items", False, "No user token available")
            return False
            
        response = self.make_request("GET", "cart", token=self.user_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "cart" in response_data:
                cart_count = len(response_data["cart"])
                self.log_result("Get Cart Items", True, f"Retrieved {cart_count} cart items", {"count": cart_count})
                return True
            else:
                self.log_result("Get Cart Items", False, "Invalid cart response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Get Cart Items", False, f"Failed to get cart: {error_msg}")
            return False
    
    def test_wishlist_add_item(self):
        """Test adding item to wishlist"""
        print("\n=== Testing Add Item to Wishlist ===")
        
        if not self.user_token:
            self.log_result("Add Item to Wishlist", False, "No user token available")
            return False
        
        # Get a product ID
        products_response = self.make_request("GET", "products")
        if not products_response or products_response.status_code != 200:
            self.log_result("Add Item to Wishlist", False, "Could not get products for wishlist test")
            return False
            
        products = products_response.json().get("products", [])
        if not products:
            self.log_result("Add Item to Wishlist", False, "No products available for wishlist test")
            return False
            
        product_id = str(products[1]["_id"])  # Use different product than cart
        
        data = {
            "productId": product_id
        }
        
        response = self.make_request("POST", "wishlist", data, token=self.user_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            self.log_result("Add Item to Wishlist", True, "Item added to wishlist successfully", response_data)
            return True
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Add Item to Wishlist", False, f"Failed to add to wishlist: {error_msg}")
            return False
    
    def test_wishlist_get_items(self):
        """Test getting wishlist items"""
        print("\n=== Testing Get Wishlist Items ===")
        
        if not self.user_token:
            self.log_result("Get Wishlist Items", False, "No user token available")
            return False
            
        response = self.make_request("GET", "wishlist", token=self.user_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "wishlist" in response_data:
                wishlist_count = len(response_data["wishlist"])
                self.log_result("Get Wishlist Items", True, f"Retrieved {wishlist_count} wishlist items", {"count": wishlist_count})
                return True
            else:
                self.log_result("Get Wishlist Items", False, "Invalid wishlist response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Get Wishlist Items", False, f"Failed to get wishlist: {error_msg}")
            return False
    
    def test_orders_create(self):
        """Test creating an order"""
        print("\n=== Testing Create Order ===")
        
        if not self.user_token:
            self.log_result("Create Order", False, "No user token available")
            return False
        
        data = {
            "items": [
                {
                    "productId": "test-product-id",
                    "name": "Test Product",
                    "price": 299.90,
                    "quantity": 1,
                    "size": "42",
                    "color": "Preto"
                }
            ],
            "shippingAddress": {
                "street": "Rua Teste, 123",
                "city": "São Paulo",
                "state": "SP",
                "zipCode": "01234-567"
            },
            "paymentMethod": "credit_card",
            "total": 299.90
        }
        
        response = self.make_request("POST", "orders", data, token=self.user_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "orderId" in response_data:
                self.log_result("Create Order", True, "Order created successfully", response_data)
                return True
            else:
                self.log_result("Create Order", False, "No order ID in response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Create Order", False, f"Failed to create order: {error_msg}")
            return False
    
    def test_orders_get_user_orders(self):
        """Test getting user orders"""
        print("\n=== Testing Get User Orders ===")
        
        if not self.user_token:
            self.log_result("Get User Orders", False, "No user token available")
            return False
            
        response = self.make_request("GET", "orders", token=self.user_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "orders" in response_data:
                orders_count = len(response_data["orders"])
                self.log_result("Get User Orders", True, f"Retrieved {orders_count} user orders", {"count": orders_count})
                return True
            else:
                self.log_result("Get User Orders", False, "Invalid orders response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Get User Orders", False, f"Failed to get orders: {error_msg}")
            return False
    
    def test_admin_dashboard(self):
        """Test admin dashboard"""
        print("\n=== Testing Admin Dashboard ===")
        
        if not self.admin_token:
            self.log_result("Admin Dashboard", False, "No admin token available")
            return False
            
        response = self.make_request("GET", "admin/dashboard", token=self.admin_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "stats" in response_data:
                self.log_result("Admin Dashboard", True, "Dashboard data retrieved", response_data)
                return True
            else:
                self.log_result("Admin Dashboard", False, "Invalid dashboard response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Admin Dashboard", False, f"Failed to get dashboard: {error_msg}")
            return False
    
    def test_admin_create_product(self):
        """Test admin creating a product"""
        print("\n=== Testing Admin Create Product ===")
        
        if not self.admin_token:
            self.log_result("Admin Create Product", False, "No admin token available")
            return False
        
        data = {
            "name": "Test Product API",
            "description": "Product created via API test",
            "price": 199.90,
            "originalPrice": 249.90,
            "category": "tenis-masculino",
            "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
            "sizes": ["40", "41", "42"],
            "colors": ["Preto", "Branco"],
            "stock": 25,
            "featured": false
        }
        
        response = self.make_request("POST", "admin/products", data, token=self.admin_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "productId" in response_data:
                self.created_product_id = response_data["productId"]
                self.log_result("Admin Create Product", True, "Product created successfully", response_data)
                return True
            else:
                self.log_result("Admin Create Product", False, "No product ID in response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Admin Create Product", False, f"Failed to create product: {error_msg}")
            return False
    
    def test_admin_update_product(self):
        """Test admin updating a product"""
        print("\n=== Testing Admin Update Product ===")
        
        if not self.admin_token:
            self.log_result("Admin Update Product", False, "No admin token available")
            return False
            
        if not self.created_product_id:
            self.log_result("Admin Update Product", False, "No product ID to update")
            return False
        
        data = {
            "name": "Test Product API Updated",
            "price": 179.90,
            "stock": 30
        }
        
        response = self.make_request("PUT", f"admin/products/{self.created_product_id}", data, token=self.admin_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            self.log_result("Admin Update Product", True, "Product updated successfully", response_data)
            return True
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Admin Update Product", False, f"Failed to update product: {error_msg}")
            return False
    
    def test_admin_get_all_orders(self):
        """Test admin getting all orders"""
        print("\n=== Testing Admin Get All Orders ===")
        
        if not self.admin_token:
            self.log_result("Admin Get All Orders", False, "No admin token available")
            return False
            
        response = self.make_request("GET", "admin/orders", token=self.admin_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "orders" in response_data:
                orders_count = len(response_data["orders"])
                self.log_result("Admin Get All Orders", True, f"Retrieved {orders_count} orders", {"count": orders_count})
                return True
            else:
                self.log_result("Admin Get All Orders", False, "Invalid orders response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Admin Get All Orders", False, f"Failed to get orders: {error_msg}")
            return False
    
    def test_admin_get_all_users(self):
        """Test admin getting all users"""
        print("\n=== Testing Admin Get All Users ===")
        
        if not self.admin_token:
            self.log_result("Admin Get All Users", False, "No admin token available")
            return False
            
        response = self.make_request("GET", "admin/users", token=self.admin_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "users" in response_data:
                users_count = len(response_data["users"])
                self.log_result("Admin Get All Users", True, f"Retrieved {users_count} users", {"count": users_count})
                return True
            else:
                self.log_result("Admin Get All Users", False, "Invalid users response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Admin Get All Users", False, f"Failed to get users: {error_msg}")
            return False
    
    def test_admin_create_category(self):
        """Test admin creating a category"""
        print("\n=== Testing Admin Create Category ===")
        
        if not self.admin_token:
            self.log_result("Admin Create Category", False, "No admin token available")
            return False
        
        data = {
            "name": "Test Category API",
            "slug": "test-category-api"
        }
        
        response = self.make_request("POST", "admin/categories", data, token=self.admin_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if "categoryId" in response_data:
                self.created_category_id = response_data["categoryId"]
                self.log_result("Admin Create Category", True, "Category created successfully", response_data)
                return True
            else:
                self.log_result("Admin Create Category", False, "No category ID in response", response_data)
                return False
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Admin Create Category", False, f"Failed to create category: {error_msg}")
            return False
    
    def test_admin_delete_product(self):
        """Test admin deleting a product"""
        print("\n=== Testing Admin Delete Product ===")
        
        if not self.admin_token:
            self.log_result("Admin Delete Product", False, "No admin token available")
            return False
            
        if not self.created_product_id:
            self.log_result("Admin Delete Product", False, "No product ID to delete")
            return False
        
        response = self.make_request("DELETE", f"admin/products/{self.created_product_id}", token=self.admin_token)
        
        if response and response.status_code == 200:
            response_data = response.json()
            self.log_result("Admin Delete Product", True, "Product deleted successfully", response_data)
            return True
        else:
            error_msg = response.json().get("error", "Unknown error") if response else "No response"
            self.log_result("Admin Delete Product", False, f"Failed to delete product: {error_msg}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting E-commerce Backend API Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        # Authentication Tests
        self.test_auth_register()
        self.test_auth_login()
        self.test_auth_me()
        self.test_admin_login()
        
        # Products Tests
        self.test_products_list()
        self.test_products_filter_category()
        self.test_products_filter_featured()
        self.test_products_filter_price()
        self.test_products_search()
        
        # Categories Tests
        self.test_categories_list()
        
        # Cart Tests (requires authentication)
        self.test_cart_add_item()
        self.test_cart_get_items()
        
        # Wishlist Tests (requires authentication)
        self.test_wishlist_add_item()
        self.test_wishlist_get_items()
        
        # Orders Tests (requires authentication)
        self.test_orders_create()
        self.test_orders_get_user_orders()
        
        # Admin Tests (requires admin authentication)
        self.test_admin_dashboard()
        self.test_admin_create_product()
        self.test_admin_update_product()
        self.test_admin_get_all_orders()
        self.test_admin_get_all_users()
        self.test_admin_create_category()
        self.test_admin_delete_product()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = EcommerceAPITester()
    tester.run_all_tests()