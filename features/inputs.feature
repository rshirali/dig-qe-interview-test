@INPUTS
Feature: The Internet Guinea Pig Website

  Scenario Outline: Typing a number into the input field
    Given I am on the inputs page
    When I type "<num>"
    Then The input value should be "<num>"

    Examples:
      | num |
      |   0 |
      |   1 |
      |   2 |
      |   3 |
      |   4 |

  Scenario: Increment the input by 3 steps
    Given I am on the inputs page
    When I increment the input value 3 times
    Then The input value should be "3"

  Scenario: Decrement the input from 5 by 2 steps
    Given I am on the inputs page
    And I set the input to "5"
    When I decrement the input value 2 times
    Then The input value should be "3"
