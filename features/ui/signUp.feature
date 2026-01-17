Feature: User Sign Up
  As a new user
  I want to be able to sign up to the Demoblaze application
  So that I can create a new account and access the inventory page

  Background:
    Given I am on the Demoblaze sign up page

  @regression @ui
  Scenario: Sign up with random valid credentials
    When I generate a random username
    And I enter the username in the sign up form
    And I enter a valid password "DemoPass123!"
    And I click the sign up button
    Then I should see the success message "Sign up successful"
    And the new account should be created and ready to use

  @regression @ui
  Scenario: Sign up with empty username
    When I leave the username field empty
    And I enter a valid password "DemoPass123!"
    And I click the sign up button
    Then I should see the error message "Please enter a username"
    And I should remain on the sign up page

  @regression @ui
  Scenario: Sign up with empty password
    When I enter a username "newUser"
    And I leave the password field empty
    And I click the sign up button
    Then I should see the error message "Please enter a password"
    And I should remain on the sign up page

  @regression @ui
  Scenario: Sign up with both username and password empty
    When I leave the username field empty
    And I leave the password field empty
    And I click the sign up button
    Then I should see the error message "Please enter a username"
    And I should remain on the sign up page

  @regression @ui
  Scenario: Sign up with existing username
    When I enter an existing username "standardUser"
    And I enter a valid password "DemoPass123!"
    And I click the sign up button
    Then I should see the error message "This user already exists"
    And I should remain on the sign up page

  @regression @demo @ui
  Scenario: Successful sign up and immediate login with new account
    When I generate a random username
    And I enter the username in the sign up form
    And I enter a valid password "DemoPass123!"
    And I click the sign up button
    Then I should see the success message "Sign up successful"
    When I navigate to the login page
    And I login with the newly created account
    Then I should be redirected to the inventory page

