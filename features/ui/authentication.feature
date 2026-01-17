Feature: User Authentication
  As a user
  I want to be able to login to the Demoblaze application
  So that I can access the inventory page

  Background:
    Given I am on the Demoblaze login page

  @regression @functional @P0 @demo
  Scenario: L-01 Login with valid username and password
    When I login as "standardUser"
    Then I should be redirected to the inventory page

  @regression @functional @P0
  Scenario: L-02 Logout after successful login
    When I login as "standardUser"
    And I click the logout button
    Then I should see the login button visible

  @regression @negative @P0
  Scenario: L-03 Login with incorrect password
    When I login as "wrongPasswordUser"
    Then I should see the error message "wrongPassword"
    And I should remain on the login page

  @regression @negative @P0
  Scenario: L-04 Login with non-existing username
    When I login as "invalidUser"
    Then I should see the error message "invalidCredentials"
    And I should remain on the login page

  @regression @negative @P1
  Scenario: L-05 Login with empty username
    When I login as "emptyUsername"
    Then I should see the error message "emptyUsername"
    And I should remain on the login page

  @regression @negative @P1
  Scenario: L-06 Login with empty password
    When I login as "emptyPassword"
    Then I should see the error message "emptyPassword"
    And I should remain on the login page

  @regression @edge @P1
  Scenario: L-07 Refresh page after successful login
    When I login as "standardUser"
    And I refresh the page
    Then I should remain logged in

  @regression @edge @P2
  Scenario: L-08 Click Login multiple times rapidly
    When I click the login link repeatedly
    Then I should see a single login modal open

  @regression @edge @P2 @demo
  Scenario: L-09 Login with special characters
    When I login as "specialCharUser"
    Then I should see the error message "invalidCredentials"
    And I should remain on the login page

