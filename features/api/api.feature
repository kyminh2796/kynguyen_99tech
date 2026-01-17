Feature: API Testing
  As an API consumer
  I want to test the Demoblaze REST API
  So that I can verify API functionality and data integrity

  @api @P0
  Scenario: Verify API is healthy
    When I check the API health status
    Then the API should be responding successfully

  @api @P0
  Scenario: Get all products via API
    When I fetch all products from the API
    Then I should receive a list of products
    And each product should have valid product structure

  @api @P1
  Scenario: Get specific product by ID
    When I fetch product with id "1" from the API
    Then I should receive product details
    And the product should have title "Samsung Galaxy S6"
    And the product price should be "360"

  @api @P1
  Scenario: Search products by category
    When I search for products by category "laptop"
    Then I should receive products from laptop category
    And all products should have category "laptop"

  @api @P0
  Scenario: Create new user via API
    When I create a new user "apiuser_randomId" with password "TestPass123!"
    Then the user should be created successfully
    And the response should contain user id

  @api @P1
  Scenario: Login user via API
    When I login with username "standardUser" and password "password123"
    Then the login should be successful
    And I should receive a session token

  @api @P1
  Scenario: Add product to cart via API
    When I login with username "standardUser" and password "password123"
    And I add product "1" to my cart with quantity "1"
    Then the product should be added to cart successfully

  @api @P1
  Scenario: Get cart items via API
    When I login with username "standardUser" and password "password123"
    And I add product "1" to my cart with quantity "1"
    And I retrieve my cart items
    Then I should see product "1" in my cart

  @api @P1
  Scenario: Remove product from cart via API
    When I login with username "standardUser" and password "password123"
    And I add product "1" to my cart with quantity "1"
    And I remove product "1" from my cart
    Then the product should be removed from cart successfully

  @api @P2
  Scenario: Clear entire cart via API
    When I login with username "standardUser" and password "password123"
    And I add product "1" to my cart with quantity "1"
    And I add product "3" to my cart with quantity "1"
    And I clear my entire cart
    Then my cart should be empty

  @api @P1
  Scenario: Create order via API
    When I login with username "standardUser" and password "password123"
    And I create an order with products "1,3,4"
    Then the order should be created successfully
    And the order should have order id

  @api @P2
  Scenario: Get order details via API
    When I login with username "standardUser" and password "password123"
    And I create an order with products "1,3"
    And I retrieve the order details
    Then the order details should contain products "1,3"

  @api @P2
  Scenario: Get user orders via API
    When I login with username "standardUser" and password "password123"
    And I retrieve all my orders
    Then I should receive a list of orders

  @api @negative @P1
  Scenario: Get invalid product ID
    When I fetch product with id "99999" from the API
    Then the API should return a 404 error

  @api @negative @P1
  Scenario: Create user with duplicate username
    When I attempt to create user "standardUser" with password "TestPass123!"
    Then the API should return an error
    And the error message should mention duplicate username
