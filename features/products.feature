Feature: Product Verification
  As a user
  I want to verify all products displayed in the inventory page
  So that I can ensure product information is correct

  Background:
    Given I am on the SauceDemo login page
    When I login as "standardUser"
    Then I should be redirected to the inventory page

  Scenario: Get all products with their ProductName and Price
    And I get all products with their name and price

