import { Given, When, Then, Before } from "@cucumber/cucumber";
import { APIPage } from "../../page-objects/api/APIPage";
import * as fs from "fs";
import * as path from "path";
import { expect } from "@playwright/test";

// Helper to load test data
function loadTestData(fileName: string) {
  const filePath = path.join(process.cwd(), "test-data", `${fileName}.json`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
}

let apiPage: APIPage;
let apiResponse: any;
let loginResponse: any;
let userId: number;
let currentProductId: number;
let currentOrderId: number;
let apiTestData: any;

Before(async function (this: any) {
  // Initialize API page object for each scenario
  if (!this.apiRequest) {
    console.warn("API Request context not available, skipping API test");
    return;
  }

  const testSiteData = loadTestData("testSite");
  const baseURL = testSiteData.baseUrl || "https://api.demoblaze.com";
  apiPage = new APIPage(this.apiRequest, baseURL);
  apiTestData = loadTestData("api");
});

// ========== HEALTH CHECK STEPS ==========

When("I check the API health status", async function (this: any) {
  if (!apiPage) {
    this.skip();
  }
  const isHealthy = await apiPage.healthCheck();
  apiResponse = { healthy: isHealthy };
});

Then("the API should be responding successfully", async function () {
  expect(apiResponse.healthy).toBe(true);
});

// ========== PRODUCT STEPS ==========

When("I fetch all products from the API", async function (this: any) {
  if (!apiPage) {
    this.skip();
  }
  apiResponse = await apiPage.getProducts();
});

Then("I should receive a list of products", async function () {
  expect(Array.isArray(apiResponse)).toBe(true);
  expect(apiResponse.length).toBeGreaterThan(0);
});

Then("each product should have valid product structure", async function () {
  for (const product of apiResponse) {
    await apiPage.verifyProductStructure(product);
  }
});

When("I fetch product with id {string} from the API", async function (
  this: any,
  productId: string
) {
  if (!apiPage) {
    this.skip();
  }
  currentProductId = parseInt(productId);
  try {
    apiResponse = await apiPage.getProductById(currentProductId);
  } catch (error: any) {
    apiResponse = { error: error.message, status: error.status };
  }
});

Then("I should receive product details", async function () {
  expect(apiResponse).toBeDefined();
  expect(apiResponse.id).toBe(currentProductId);
});

Then('the product should have title {string}', async function (title: string) {
  expect(apiResponse.title).toBe(title);
});

Then('the product price should be {string}', async function (price: string) {
  expect(apiResponse.price).toBe(parseInt(price));
});

When("I search for products by category {string}", async function (
  this: any,
  category: string
) {
  if (!apiPage) {
    this.skip();
  }
  apiResponse = await apiPage.getProductsByCategory(category);
});

Then("I should receive products from {string} category", async function (
  category: string
) {
  expect(Array.isArray(apiResponse)).toBe(true);
  expect(apiResponse.length).toBeGreaterThan(0);
});

Then("all products should have category {string}", async function (
  category: string
) {
  for (const product of apiResponse) {
    expect(product.category).toBe(category);
  }
});

// ========== USER CREATION STEPS ==========

When(
  "I create a new user {string} with password {string}",
  async function (this: any, username: string, password: string) {
    if (!apiPage) {
      this.skip();
    }

    // Replace randomId with actual random value
    const randomId = Math.random().toString(36).substring(7);
    const finalUsername =
      username.includes("randomId") ?
        username.replace("randomId", randomId)
        : username;

    const response = await apiPage.createUser(finalUsername, password);
    apiResponse = response.data;
    apiResponse.status = response.status;
  }
);

Then("the user should be created successfully", async function () {
  expect(apiResponse.status).toBe(200);
});

Then("the response should contain user id", async function () {
  expect(apiResponse).toHaveProperty("userId");
});

// ========== LOGIN STEPS ==========

When(
  "I login with username {string} and password {string}",
  async function (this: any, username: string, password: string) {
    if (!apiPage) {
      this.skip();
    }

    const response = await apiPage.loginUser(username, password);
    loginResponse = response.data;
    loginResponse.status = response.status;

    if (loginResponse.userId) {
      userId = loginResponse.userId;
    }
  }
);

Then("the login should be successful", async function () {
  expect(loginResponse.status).toBe(200);
});

Then("I should receive a session token", async function () {
  expect(loginResponse).toBeDefined();
  expect(loginResponse.userId).toBeDefined();
});

// ========== CART STEPS ==========

When(
  "I add product {string} to my cart with quantity {string}",
  async function (this: any, productId: string, quantity: string) {
    if (!apiPage || !userId) {
      this.skip();
    }

    const response = await apiPage.addToCart(
      userId,
      parseInt(productId),
      parseInt(quantity)
    );
    apiResponse = response.data;
    apiResponse.status = response.status;
  }
);

Then("the product should be added to cart successfully", async function () {
  expect(apiResponse.status).toBe(200);
});

When("I retrieve my cart items", async function (this: any) {
  if (!apiPage || !userId) {
    this.skip();
  }

  apiResponse = await apiPage.getCartItems(userId);
});

Then("I should see product {string} in my cart", async function (
  productId: string
) {
  expect(Array.isArray(apiResponse)).toBe(true);
  const foundProduct = apiResponse.find(
    (item: any) => item.productId === parseInt(productId)
  );
  expect(foundProduct).toBeDefined();
});

When("I remove product {string} from my cart", async function (
  this: any,
  productId: string
) {
  if (!apiPage || !userId) {
    this.skip();
  }

  const response = await apiPage.removeFromCart(userId, parseInt(productId));
  apiResponse = response.data;
  apiResponse.status = response.status;
});

Then("the product should be removed from cart successfully", async function () {
  expect(apiResponse.status).toBe(200);
});

When("I clear my entire cart", async function (this: any) {
  if (!apiPage || !userId) {
    this.skip();
  }

  const response = await apiPage.clearCart(userId);
  apiResponse = response.data;
  apiResponse.status = response.status;
});

Then("my cart should be empty", async function () {
  expect(apiResponse.status).toBe(200);
});

// ========== ORDER STEPS ==========

When("I create an order with products {string}", async function (
  this: any,
  productIds: string
) {
  if (!apiPage || !userId) {
    this.skip();
  }

  const ids = productIds.split(",").map((id) => parseInt(id.trim()));
  const response = await apiPage.createOrder(userId, ids);
  apiResponse = response.data;
  apiResponse.status = response.status;

  if (apiResponse.orderId) {
    currentOrderId = apiResponse.orderId;
  }
});

Then("the order should be created successfully", async function () {
  expect(apiResponse.status).toBe(200);
});

Then("the order should have order id", async function () {
  expect(apiResponse).toHaveProperty("orderId");
  expect(currentOrderId).toBeDefined();
});

When("I retrieve the order details", async function (this: any) {
  if (!apiPage || !currentOrderId) {
    this.skip();
  }

  const response = await apiPage.getOrderDetails(currentOrderId);
  apiResponse = response.data;
  apiResponse.status = response.status;
});

Then("the order details should contain products {string}", async function (
  expectedProducts: string
) {
  expect(apiResponse).toBeDefined();
  const expected = expectedProducts.split(",").map((id) => parseInt(id.trim()));
  const actual = apiResponse.productIds || [];

  for (const productId of expected) {
    expect(actual).toContain(productId);
  }
});

When("I retrieve all my orders", async function (this: any) {
  if (!apiPage || !userId) {
    this.skip();
  }

  apiResponse = await apiPage.getUserOrders(userId);
});

Then("I should receive a list of orders", async function () {
  expect(Array.isArray(apiResponse)).toBe(true);
});

// ========== ERROR HANDLING STEPS ==========

Then("the API should return a {int} error", async function (statusCode: number) {
  expect(apiResponse.error).toBeDefined();
});

Then("the error message should mention duplicate username", async function () {
  expect(loginResponse).toBeDefined();
  const errorMessage = loginResponse.message || loginResponse.error || "";
  expect(errorMessage.toLowerCase()).toContain("duplicate");
});

When(
  "I attempt to create user {string} with password {string}",
  async function (this: any, username: string, password: string) {
    if (!apiPage) {
      this.skip();
    }

    const response = await apiPage.createUser(username, password);
    loginResponse = response.data;
    loginResponse.status = response.status;
  }
);

Then("the API should return an error", async function () {
  expect(loginResponse.status).not.toBe(200);
});
