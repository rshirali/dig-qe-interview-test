@CHECKBOXES
Feature: The Internet Guinea Pig Website

  Scenario Outline: As a user, I can log into the secure area
    Given I am on the Checkboxes page
    When I select checkbox <num>
    Then The checkbox should be checked
      Examples:
      | num |
      |   1 |
      |   2 |
