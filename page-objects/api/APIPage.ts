import { APIRequestContext, expect } from "@playwright/test";

/**
 * APIPage - API Testing Page Object
 * Handles all API interactions for Demoblaze application
 */
export class APIPage {
  private apiRequest: APIRequestContext;
  private baseURL: string;

  constructor(apiRequest: APIRequestContext, baseURL: string) {
    this.apiRequest = apiRequest;
    this.baseURL = baseURL;
  }

  /**
   * Get all products from the API
   * GET /products
   */
  async getProducts() {
    const response = await this.apiRequest.get(`${this.baseURL}/products`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    return data;
  }

  /**
   * Get specific product by ID
   * GET /products/{id}
   */
  async getProductById(productId: number) {
    const response = await this.apiRequest.get(
      `${this.baseURL}/products/${productId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    return data;
  }

  /**
   * Create a new user (Sign Up)
   * POST /users
   */
  async createUser(username: string, password: string) {
    const response = await this.apiRequest.post(`${this.baseURL}/users`, {
      data: {
        username: username,
        password: password,
      },
    });
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  /**
   * Login user and get session token
   * POST /login
   */
  async loginUser(username: string, password: string) {
    const response = await this.apiRequest.post(`${this.baseURL}/login`, {
      data: {
        username: username,
        password: password,
      },
    });
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  /**
   * Add item to cart
   * POST /carts
   */
  async addToCart(userId: number, productId: number, quantity: number = 1) {
    const response = await this.apiRequest.post(`${this.baseURL}/carts`, {
      data: {
        userId: userId,
        productId: productId,
        quantity: quantity,
      },
    });
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  /**
   * Get cart items for user
   * GET /carts/{userId}
   */
  async getCartItems(userId: number) {
    const response = await this.apiRequest.get(
      `${this.baseURL}/carts/${userId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    return data;
  }

  /**
   * Remove item from cart
   * DELETE /carts/{userId}/{productId}
   */
  async removeFromCart(userId: number, productId: number) {
    const response = await this.apiRequest.delete(
      `${this.baseURL}/carts/${userId}/${productId}`
    );
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  /**
   * Clear all cart items
   * DELETE /carts/{userId}
   */
  async clearCart(userId: number) {
    const response = await this.apiRequest.delete(
      `${this.baseURL}/carts/${userId}`
    );
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  /**
   * Create an order
   * POST /orders
   */
  async createOrder(userId: number, productIds: number[]) {
    const response = await this.apiRequest.post(`${this.baseURL}/orders`, {
      data: {
        userId: userId,
        productIds: productIds,
      },
    });
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  /**
   * Get order details
   * GET /orders/{orderId}
   */
  async getOrderDetails(orderId: number) {
    const response = await this.apiRequest.get(
      `${this.baseURL}/orders/${orderId}`
    );
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  /**
   * Get all orders for user
   * GET /users/{userId}/orders
   */
  async getUserOrders(userId: number) {
    const response = await this.apiRequest.get(
      `${this.baseURL}/users/${userId}/orders`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    return data;
  }

  /**
   * Health check - verify API is running
   * GET /health
   */
  async healthCheck() {
    const response = await this.apiRequest.get(`${this.baseURL}/health`);
    return response.status() === 200;
  }

  /**
   * Get API status and version
   * GET /status
   */
  async getStatus() {
    const response = await this.apiRequest.get(`${this.baseURL}/status`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    return data;
  }

  /**
   * Verify successful response
   */
  async expectSuccessResponse(status: number) {
    expect(status).toBe(200);
  }

  /**
   * Verify error response
   */
  async expectErrorResponse(status: number, expectedStatus: number) {
    expect(status).toBe(expectedStatus);
  }

  /**
   * Verify product data structure
   */
  async verifyProductStructure(product: any) {
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("title");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("description");
  }

  /**
   * Verify user data structure
   */
  async verifyUserStructure(user: any) {
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("username");
  }

  /**
   * Get products with filter
   * GET /products?category={category}
   */
  async getProductsByCategory(category: string) {
    const response = await this.apiRequest.get(
      `${this.baseURL}/products?category=${category}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    return data;
  }

  /**
   * Search products
   * GET /products/search?q={query}
   */
  async searchProducts(query: string) {
    const response = await this.apiRequest.get(
      `${this.baseURL}/products/search?q=${query}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    return data;
  }
}
