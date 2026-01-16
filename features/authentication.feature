Feature: User Authentication
  As a user
  I want to be able to login to the Demoblaze application
  So that I can access the inventory page

  Background:
    Given I am on the Demoblaze login page
  @demo
  Scenario: Login with valid credentials
    When I login as "standardUser"
    Then I should be redirected to the inventory page

  Scenario: Login with invalid credentials
    When I login as "invalidUser"
    Then I should see the error message for login "invalidCredentials"
    And I should remain on the login page

  @demo
  Scenario: Login with locked out user - Expected to FAIL for screenshot test
    When I login as "lockedOutUser"
    Then I should be redirected to the inventory page

