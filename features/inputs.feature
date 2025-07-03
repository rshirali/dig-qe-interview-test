@INPUTS
Feature: The Internet Guinea Pig Website

  Scenario Outline: As a user, I can change the value of an input
    Given I am on the inputs page
    When I enter "<num>"
    Then The input value should be the number I entered

    Examples:
      | num |
      |   0 |
      |   1 |
      |   2 |
      |   3 |
      |   4 |
    