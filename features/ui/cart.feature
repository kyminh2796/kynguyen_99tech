Feature: Shopping Cart
  As a user
  I want to manage products in my cart
  So that I can verify cart behavior

  Background:
    Given I am on the Demoblaze login page

  @regression @functional @P0 @demo
  Scenario: C-01 Add single product to cart
    When I sign up with random account and login
    When I add the following products to cart:
      | Sony vaio i5       |
    Then I open the shopping cart
    Then I should see product "Sony vaio i5" with correct title in cart

  @regression @functional @P0 @demo
  Scenario: C-02 Add multiple products to cart
    When I sign up with random account and login
    When I add the following products to cart:
      | Sony vaio i5    |
      | Dell i7 8GB     |
      | MacBook air     |
      | MacBook Pro     |
    When I open the shopping cart
    Then I should see product "Sony vaio i5" with correct title in cart
    And I should see product "Dell i7 8GB" with correct title in cart
    And I should see product "MacBook air" with correct title in cart
    And I should see product "MacBook Pro" with correct title in cart
    And the total price should match sum of all products in cart

  @regression @functional @P0
  Scenario: C-03 Remove product from cart
    When I sign up with random account and login
    When I add the following products to cart:
      | Dell i7 8GB        |
    When I open the shopping cart
    When I remove product "Dell i7 8GB" from cart
    Then the cart badge should show 0 items

  @regression @edge @P1 @demo
  Scenario: C-04 Add same product multiple times
    When I sign up with random account and login
    When I add the same product "Sony vaio i5" to cart 5 times
    When I open the shopping cart
    And the number of "Sony vaio i5" product in cart should be 5

  @regression @edge @P1
  Scenario: C-05 Refresh page in cart
    When I sign up with random account and login
    When I add the following products to cart:
      | Sony vaio i5       |
    When I open the shopping cart
    When I refresh the page
    Then I should see product "Sony vaio i5" with correct title in cart

  @regression @edge @P1
  Scenario: C-06 Logout with items in cart
    When I sign up with random account and login
    When I add the following products to cart:
      | Dell i7 8GB        |
    When I open the shopping cart
    Then I should see product "Dell i7 8GB" with correct title in cart
    When I click the logout button
    When I open the shopping cart
    Then the cart badge should show 0 items

  @regression @negative @P1
  Scenario: C-07 Add product without login
    When I add the following products to cart:
      | Dell i7 8GB        |
    When I open the shopping cart
    Then the cart badge should show 0 items

