#!/usr/bin/env python3
"""
Additional E-commerce Backend API Tests
Tests the remaining endpoints that were marked as "NA"
"""

import requests
import json
import sys

BASE_URL = "https://nike-inspired-46.preview.emergentagent.com/api"

class AdditionalAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.user_token = None
        self.admin_token = None
        self.cart_item_id = None
        self.wishlist_item_id = None
        self.order_id = None
        
    def setup_auth(self):
        """Setup authentication tokens"""
        # Login as regular user
        user_data = {
            "email": "testuser@example.com",
            "password": "testpass123"
        }
        
        response = self.session.post(f"{self.base_url}/auth/login", json=user_data)
        if response.status_code == 200:
            self.user_token = response.json()["token"]
            print("✅ User authentication setup successful")
        else:
            print("❌ User authentication failed")
            return False
            
        # Login as admin
        admin_data = {
            "email": "admin@ecommerce.com",
            "password": "admin123"
        }
        
        response = self.session.post(f"{self.base_url}/auth/login", json=admin_data)
        if response.status_code == 200:
            self.admin_token = response.json()["token"]
            print("✅ Admin authentication setup successful")
        else:
            print("❌ Admin authentication failed")
            return False
            
        return True
    
    def get_product_id(self):
        """Get a product ID for testing"""
        response = self.session.get(f"{self.base_url}/products")
        if response.status_code == 200:
            products = response.json().get("products", [])
            if products:
                return str(products[0]["_id"])
        return None
    
    def test_cart_update_quantity(self):
        """Test updating cart item quantity"""
        print("\n=== Testing Cart Update Quantity ===")
        
        if not self.user_token:
            print("❌ No user token available")
            return False
            
        # First add an item to cart
        product_id = self.get_product_id()
        if not product_id:
            print("❌ No product available for cart test")
            return False
            
        add_data = {
            "productId": product_id,
            "quantity": 1,
            "size": "42",
            "color": "Preto"
        }
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response = self.session.post(f"{self.base_url}/cart", json=add_data, headers=headers)
        
        if response.status_code != 200:
            print("❌ Failed to add item to cart for update test")
            return False
            
        # Get cart items to find the item ID
        response = self.session.get(f"{self.base_url}/cart", headers=headers)
        if response.status_code != 200:
            print("❌ Failed to get cart items")
            return False
            
        cart_items = response.json().get("cart", [])
        if not cart_items:
            print("❌ No cart items found")
            return False
            
        cart_item_id = str(cart_items[0]["_id"])
        
        # Update quantity
        update_data = {"quantity": 3}
        response = self.session.put(f"{self.base_url}/cart/{cart_item_id}", json=update_data, headers=headers)
        
        if response.status_code == 200:
            print("✅ Cart item quantity updated successfully")
            return True
        else:
            print(f"❌ Failed to update cart quantity: {response.status_code}")
            return False
    
    def test_cart_remove_item(self):
        """Test removing item from cart"""
        print("\n=== Testing Cart Remove Item ===")
        
        if not self.user_token:
            print("❌ No user token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Get cart items to find an item to remove
        response = self.session.get(f"{self.base_url}/cart", headers=headers)
        if response.status_code != 200:
            print("❌ Failed to get cart items")
            return False
            
        cart_items = response.json().get("cart", [])
        if not cart_items:
            print("❌ No cart items found to remove")
            return False
            
        cart_item_id = str(cart_items[0]["_id"])
        
        # Remove item
        response = self.session.delete(f"{self.base_url}/cart/{cart_item_id}", headers=headers)
        
        if response.status_code == 200:
            print("✅ Cart item removed successfully")
            return True
        else:
            print(f"❌ Failed to remove cart item: {response.status_code}")
            return False
    
    def test_wishlist_remove_item(self):
        """Test removing item from wishlist"""
        print("\n=== Testing Wishlist Remove Item ===")
        
        if not self.user_token:
            print("❌ No user token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # First add an item to wishlist
        product_id = self.get_product_id()
        if not product_id:
            print("❌ No product available for wishlist test")
            return False
            
        add_data = {"productId": product_id}
        response = self.session.post(f"{self.base_url}/wishlist", json=add_data, headers=headers)
        
        # Get wishlist items to find an item to remove
        response = self.session.get(f"{self.base_url}/wishlist", headers=headers)
        if response.status_code != 200:
            print("❌ Failed to get wishlist items")
            return False
            
        wishlist_items = response.json().get("wishlist", [])
        if not wishlist_items:
            print("❌ No wishlist items found to remove")
            return False
            
        wishlist_item_id = str(wishlist_items[0]["_id"])
        
        # Remove item
        response = self.session.delete(f"{self.base_url}/wishlist/{wishlist_item_id}", headers=headers)
        
        if response.status_code == 200:
            print("✅ Wishlist item removed successfully")
            return True
        else:
            print(f"❌ Failed to remove wishlist item: {response.status_code}")
            return False
    
    def test_admin_update_order_status(self):
        """Test admin updating order status"""
        print("\n=== Testing Admin Update Order Status ===")
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Get all orders to find one to update
        response = self.session.get(f"{self.base_url}/admin/orders", headers=headers)
        if response.status_code != 200:
            print("❌ Failed to get orders")
            return False
            
        orders = response.json().get("orders", [])
        if not orders:
            print("❌ No orders found to update")
            return False
            
        order_id = str(orders[0]["_id"])
        
        # Update order status
        update_data = {"status": "shipped"}
        response = self.session.put(f"{self.base_url}/admin/orders/{order_id}", json=update_data, headers=headers)
        
        if response.status_code == 200:
            print("✅ Order status updated successfully")
            return True
        else:
            print(f"❌ Failed to update order status: {response.status_code}")
            return False
    
    def run_additional_tests(self):
        """Run all additional tests"""
        print("🚀 Starting Additional E-commerce Backend API Tests")
        print("=" * 60)
        
        if not self.setup_auth():
            print("❌ Authentication setup failed, cannot continue")
            return
            
        results = []
        
        # Test cart operations
        results.append(("Cart Update Quantity", self.test_cart_update_quantity()))
        results.append(("Cart Remove Item", self.test_cart_remove_item()))
        
        # Test wishlist operations
        results.append(("Wishlist Remove Item", self.test_wishlist_remove_item()))
        
        # Test admin operations
        results.append(("Admin Update Order Status", self.test_admin_update_order_status()))
        
        # Summary
        print("\n" + "=" * 60)
        print("🏁 ADDITIONAL TESTS SUMMARY")
        print("=" * 60)
        
        total_tests = len(results)
        passed_tests = sum(1 for _, success in results if success)
        failed_tests = total_tests - passed_tests
        
        print(f"Total Additional Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for test_name, success in results:
                if not success:
                    print(f"  ❌ {test_name}")
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    tester = AdditionalAPITester()
    tester.run_additional_tests()