#!/usr/bin/env python3
"""
K.J STORE Backend API Tests
Testing specific endpoints as requested:
1. Authentication with admin@ecommerce.com/admin123
2. Category deletion tests
3. Multiple images in products
4. Wishlist functionality
5. Shipping calculation
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://kjstore-shop.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class KJStoreAPITester:
    def __init__(self):
        self.admin_token = None
        self.user_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_admin_authentication(self):
        """Test 1: Admin Authentication"""
        print("\n=== Test 1: Admin Authentication ===")
        
        try:
            # Test admin login
            login_data = {
                "email": "admin@ecommerce.com",
                "password": "admin123"
            }
            
            response = requests.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.admin_token = data['token']
                    user_role = data['user'].get('role', '')
                    
                    if user_role == 'admin':
                        self.log_result(
                            "Admin Login", 
                            True, 
                            "Admin authentication successful",
                            f"Token received, role: {user_role}"
                        )
                        return True
                    else:
                        self.log_result(
                            "Admin Login", 
                            False, 
                            "User authenticated but not admin role",
                            f"Role: {user_role}"
                        )
                else:
                    self.log_result(
                        "Admin Login", 
                        False, 
                        "Missing token or user data in response",
                        str(data)
                    )
            else:
                self.log_result(
                    "Admin Login", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("Admin Login", False, "Exception occurred", str(e))
            
        return False
    
    def test_category_deletion(self):
        """Test 2: Category Deletion"""
        print("\n=== Test 2: Category Deletion ===")
        
        if not self.admin_token:
            self.log_result("Category Deletion", False, "No admin token available", "Admin authentication required")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # First, get existing categories
            response = requests.get(f"{API_BASE}/categories")
            if response.status_code != 200:
                self.log_result("Get Categories", False, "Failed to fetch categories", response.text)
                return False
                
            categories = response.json().get('categories', [])
            if not categories:
                self.log_result("Get Categories", False, "No categories found", "Cannot test deletion")
                return False
                
            self.log_result("Get Categories", True, f"Found {len(categories)} categories", None)
            
            # Try to delete the first category
            category_to_delete = categories[0]
            category_id = category_to_delete.get('_id')
            category_name = category_to_delete.get('name', 'Unknown')
            
            print(f"   Attempting to delete category: {category_name} (ID: {category_id})")
            
            # Delete category
            delete_response = requests.delete(f"{API_BASE}/admin/categories/{category_id}", headers=headers)
            
            if delete_response.status_code == 200:
                self.log_result(
                    "Delete Category", 
                    True, 
                    f"Category '{category_name}' deleted successfully",
                    f"ID: {category_id}"
                )
                
                # Verify deletion by fetching categories again
                verify_response = requests.get(f"{API_BASE}/categories")
                if verify_response.status_code == 200:
                    updated_categories = verify_response.json().get('categories', [])
                    
                    # Check if category was actually removed
                    deleted_category_exists = any(cat.get('_id') == category_id for cat in updated_categories)
                    
                    if not deleted_category_exists:
                        self.log_result(
                            "Verify Deletion", 
                            True, 
                            "Category successfully removed from database",
                            f"Categories count: {len(categories)} -> {len(updated_categories)}"
                        )
                        return True
                    else:
                        self.log_result(
                            "Verify Deletion", 
                            False, 
                            "Category still exists after deletion",
                            f"Category {category_id} found in updated list"
                        )
                else:
                    self.log_result("Verify Deletion", False, "Failed to verify deletion", verify_response.text)
            else:
                self.log_result(
                    "Delete Category", 
                    False, 
                    f"Failed to delete category with status {delete_response.status_code}",
                    delete_response.text
                )
                
        except Exception as e:
            self.log_result("Category Deletion", False, "Exception occurred", str(e))
            
        return False
    
    def test_multiple_images_product(self):
        """Test 3: Multiple Images in Products"""
        print("\n=== Test 3: Multiple Images in Products ===")
        
        if not self.admin_token:
            self.log_result("Multiple Images Product", False, "No admin token available", "Admin authentication required")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Create product with multiple images
            product_data = {
                "name": "Produto Teste Multi Imagens",
                "description": "Descrição teste com pelo menos 10 caracteres para validação",
                "price": 100,
                "originalPrice": 150,
                "category": "tenis-masculino",
                "images": [
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
                    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
                    "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800"
                ],
                "sizes": ["P", "M", "G"],
                "colors": ["Preto", "Branco"],
                "stock": 10,
                "rating": 4.5,
                "reviews": 50,
                "featured": False
            }
            
            # Create product
            create_response = requests.post(f"{API_BASE}/admin/products", json=product_data, headers=headers)
            
            if create_response.status_code == 200:
                create_data = create_response.json()
                product_id = create_data.get('productId')
                
                self.log_result(
                    "Create Product with Multiple Images", 
                    True, 
                    "Product created successfully",
                    f"Product ID: {product_id}"
                )
                
                # Verify by fetching all products and checking our product
                products_response = requests.get(f"{API_BASE}/products")
                if products_response.status_code == 200:
                    products = products_response.json().get('products', [])
                    
                    # Find our created product
                    created_product = None
                    for product in products:
                        if str(product.get('_id')) == str(product_id):
                            created_product = product
                            break
                    
                    if created_product:
                        images = created_product.get('images', [])
                        if len(images) == 3:
                            self.log_result(
                                "Verify Multiple Images", 
                                True, 
                                f"Product has {len(images)} images as expected",
                                f"Images: {images}"
                            )
                            return True
                        else:
                            self.log_result(
                                "Verify Multiple Images", 
                                False, 
                                f"Expected 3 images, found {len(images)}",
                                f"Images: {images}"
                            )
                    else:
                        self.log_result("Verify Multiple Images", False, "Created product not found", f"Product ID: {product_id}")
                else:
                    self.log_result("Verify Multiple Images", False, "Failed to fetch products", products_response.text)
            else:
                self.log_result(
                    "Create Product with Multiple Images", 
                    False, 
                    f"Failed to create product with status {create_response.status_code}",
                    create_response.text
                )
                
        except Exception as e:
            self.log_result("Multiple Images Product", False, "Exception occurred", str(e))
            
        return False
    
    def test_wishlist_functionality(self):
        """Test 4: Wishlist/Favorites Functionality"""
        print("\n=== Test 4: Wishlist Functionality ===")
        
        # First create a regular user for wishlist testing
        try:
            # Register a test user
            user_data = {
                "name": "Test User Wishlist",
                "email": "testwishlist@example.com",
                "password": "testpass123"
            }
            
            register_response = requests.post(f"{API_BASE}/auth/register", json=user_data)
            
            if register_response.status_code == 200:
                user_token = register_response.json().get('token')
                self.log_result("User Registration", True, "Test user created for wishlist testing", None)
            else:
                # Try to login if user already exists
                login_response = requests.post(f"{API_BASE}/auth/login", json={
                    "email": "testwishlist@example.com",
                    "password": "testpass123"
                })
                if login_response.status_code == 200:
                    user_token = login_response.json().get('token')
                    self.log_result("User Login", True, "Existing test user logged in", None)
                else:
                    self.log_result("User Authentication", False, "Failed to create or login test user", None)
                    return False
            
            headers = {"Authorization": f"Bearer {user_token}"}
            
            # Get a product to add to wishlist
            products_response = requests.get(f"{API_BASE}/products")
            if products_response.status_code != 200:
                self.log_result("Get Products", False, "Failed to fetch products", products_response.text)
                return False
                
            products = products_response.json().get('products', [])
            if not products:
                self.log_result("Get Products", False, "No products available", "Cannot test wishlist")
                return False
                
            test_product = products[0]
            product_id = str(test_product.get('_id'))
            product_name = test_product.get('name', 'Unknown')
            
            # Test 1: Add to wishlist
            add_data = {"productId": product_id}
            add_response = requests.post(f"{API_BASE}/wishlist", json=add_data, headers=headers)
            
            if add_response.status_code == 200:
                self.log_result(
                    "Add to Wishlist", 
                    True, 
                    f"Product '{product_name}' added to wishlist",
                    f"Product ID: {product_id}"
                )
            else:
                self.log_result(
                    "Add to Wishlist", 
                    False, 
                    f"Failed to add to wishlist with status {add_response.status_code}",
                    add_response.text
                )
                return False
            
            # Test 2: Get wishlist
            get_response = requests.get(f"{API_BASE}/wishlist", headers=headers)
            
            if get_response.status_code == 200:
                wishlist = get_response.json().get('wishlist', [])
                if len(wishlist) > 0:
                    wishlist_item = wishlist[0]
                    wishlist_item_id = str(wishlist_item.get('_id'))
                    
                    self.log_result(
                        "Get Wishlist", 
                        True, 
                        f"Wishlist retrieved with {len(wishlist)} items",
                        f"First item ID: {wishlist_item_id}"
                    )
                    
                    # Test 3: Remove from wishlist
                    delete_response = requests.delete(f"{API_BASE}/wishlist/{wishlist_item_id}", headers=headers)
                    
                    if delete_response.status_code == 200:
                        self.log_result(
                            "Remove from Wishlist", 
                            True, 
                            "Item removed from wishlist successfully",
                            f"Removed item ID: {wishlist_item_id}"
                        )
                        
                        # Verify removal
                        verify_response = requests.get(f"{API_BASE}/wishlist", headers=headers)
                        if verify_response.status_code == 200:
                            updated_wishlist = verify_response.json().get('wishlist', [])
                            if len(updated_wishlist) == 0:
                                self.log_result(
                                    "Verify Wishlist Removal", 
                                    True, 
                                    "Wishlist is empty after removal",
                                    "Removal verified successfully"
                                )
                                return True
                            else:
                                self.log_result(
                                    "Verify Wishlist Removal", 
                                    False, 
                                    f"Wishlist still has {len(updated_wishlist)} items",
                                    "Item may not have been removed"
                                )
                        else:
                            self.log_result("Verify Wishlist Removal", False, "Failed to verify removal", verify_response.text)
                    else:
                        self.log_result(
                            "Remove from Wishlist", 
                            False, 
                            f"Failed to remove from wishlist with status {delete_response.status_code}",
                            delete_response.text
                        )
                else:
                    self.log_result("Get Wishlist", False, "Wishlist is empty", "Item was not added")
            else:
                self.log_result(
                    "Get Wishlist", 
                    False, 
                    f"Failed to get wishlist with status {get_response.status_code}",
                    get_response.text
                )
                
        except Exception as e:
            self.log_result("Wishlist Functionality", False, "Exception occurred", str(e))
            
        return False
    
    def test_shipping_calculation(self):
        """Test 5: Shipping Calculation"""
        print("\n=== Test 5: Shipping Calculation ===")
        
        try:
            # Test shipping calculation for São Paulo
            sp_data = {"cep": "01310100"}  # São Paulo CEP
            sp_response = requests.post(f"{API_BASE}/shipping/calculate", json=sp_data)
            
            # Test shipping calculation for Salvador
            salvador_data = {"cep": "40000100"}  # Salvador CEP
            salvador_response = requests.post(f"{API_BASE}/shipping/calculate", json=salvador_data)
            
            if sp_response.status_code == 404 and salvador_response.status_code == 404:
                self.log_result(
                    "Shipping Calculation", 
                    False, 
                    "Shipping calculation endpoint not implemented",
                    "Both requests returned 404 - endpoint does not exist"
                )
            elif sp_response.status_code == 200 and salvador_response.status_code == 200:
                sp_data = sp_response.json()
                salvador_data = salvador_response.json()
                
                # Check if shipping costs are different
                sp_cost = sp_data.get('cost', 0)
                salvador_cost = salvador_data.get('cost', 0)
                
                if sp_cost != salvador_cost:
                    self.log_result(
                        "Shipping Calculation", 
                        True, 
                        "Shipping calculation working with different costs",
                        f"São Paulo: {sp_cost}, Salvador: {salvador_cost}"
                    )
                    return True
                else:
                    self.log_result(
                        "Shipping Calculation", 
                        False, 
                        "Shipping costs are the same for different CEPs",
                        f"Both locations: {sp_cost}"
                    )
            else:
                self.log_result(
                    "Shipping Calculation", 
                    False, 
                    "Shipping calculation partially working or has errors",
                    f"SP Status: {sp_response.status_code}, Salvador Status: {salvador_response.status_code}"
                )
                
        except Exception as e:
            self.log_result("Shipping Calculation", False, "Exception occurred", str(e))
            
        return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting K.J STORE Backend API Tests")
        print(f"Base URL: {BASE_URL}")
        print("=" * 60)
        
        # Run tests in sequence
        tests = [
            self.test_admin_authentication,
            self.test_category_deletion,
            self.test_multiple_images_product,
            self.test_wishlist_functionality,
            self.test_shipping_calculation
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ Test failed with exception: {e}")
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed")
            return False

def main():
    """Main function"""
    tester = KJStoreAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()