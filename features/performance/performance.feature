Feature: Performance Testing
  As a performance analyst
  I want to measure page load times and resource metrics
  So that I can ensure the application meets performance standards

  Background:
    Given I set performance thresholds with default values

  @regression @performance @P0
  Scenario: Measure page load time
    When I measure the page load time for Demoblaze
    Then the page load time should be within 3000ms threshold
    And I should see performance metrics logged

  @regression @performance @P1
  Scenario: Measure navigation time
    When I navigate to Demoblaze homepage
    Then the navigation time should be within 2000ms threshold

  @regression @performance @P1
  Scenario: Measure DOM content loaded time
    When I load Demoblaze homepage
    Then the DOM content loaded time should be within 1500ms threshold

  @regression @performance @P2
  Scenario: Measure first paint and contentful paint
    When I load Demoblaze homepage
    Then I should see first paint metrics
    And I should see first contentful paint metrics

  @regression @performance @P2
  Scenario: Measure resource loading performance
    When I load Demoblaze homepage
    Then I should see all resources loaded
    And slow resources should be identified if any
    And the total resource count should be logged

  @regression @performance @P2
  Scenario: Measure memory usage
    When I load Demoblaze homepage
    Then I should see memory usage metrics

  @regression @performance @P1
  Scenario: Measure click response time
    When I load Demoblaze homepage
    And I click on a product
    Then the click response time should be within 1000ms threshold

  @regression @performance @P1
  Scenario: Measure login form submission time
    Given I am on the Demoblaze login page
    When I measure login form submission time with valid credentials
    Then the form submission time should be within 2000ms threshold

  @regression @performance @P1
  Scenario: Measure product search response time
    Given I am on the Demoblaze homepage
    When I search for a product
    Then the search response time should be within 2000ms threshold

  @regression @performance @P0
  Scenario: Comprehensive performance test
    When I run a comprehensive performance test for Demoblaze
    Then all performance metrics should be collected
    And performance report should be generated
    And metrics should be compared with thresholds

  @regression @performance @P1
  Scenario: Measure add to cart performance
    When I login to Demoblaze with valid credentials
    And I measure add to cart performance
    Then the cart operation should complete within 1500ms threshold

  @regression @performance @P2
  Scenario: Measure API response time
    When I measure REST API response time for products endpoint
    Then the API response should be within 2000ms threshold
