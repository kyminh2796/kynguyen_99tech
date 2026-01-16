Feature: Shopping Cart
  As a user
  I want to add products to my shopping cart
  So that I can verify cart quantities

  Background:
    Given I am on the Demoblaze login page
    When I login as "standardUser"
    Then I should be redirected to the inventory page

  @demo
  Scenario: Add multiple products to cart and verify cart page items
    When I add the following products to cart:
      | Sony vaio i5       |
      | Dell i7 8GB        |
    Then the cart badge should show 2 items
    When I open the shopping cart
    Then I should see product "Sony vaio i5" with correct quantity and description in cart
    And I should see product "Dell i7 8GB" with correct quantity and description in cart
    And the Remove button should be visible and enabled for all products in cart
    And the Checkout button should be visible and enabled with correct text
    And the Continue Shopping button should be visible and enabled with correct text
    And the cart badge should match the number of products added before removing
    When I remove product "Sony vaio i5" from cart
    Then the cart badge should decrease by 1 after removing product

