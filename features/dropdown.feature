@DROPDOWN
Feature: The Internet Guinea Pig Website

  Scenario Outline: As a user, I can select options from a dropdown menu
    Given I am on the Dropdown page
    When I select "<option>"
    Then The dropdown value should be "<option>"

    Examples:
      | option   |
      | Option 1 |
      | Option 2 |

  Scenario Outline: The dropdown should have a placeholder
    Given I am on the Dropdown page
    Then The dropdown value should be "Please select an option"
