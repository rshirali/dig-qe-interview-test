import { Given, When, Then } from "@wdio/cucumber-framework";
import { expect } from "@wdio/globals";
import dropdownPage from "../pageobjects/dropdown.page.js";

Given(/^I am on the dropdown page$/, async () => {
  await dropdownPage.open();
});

When(/^I select "(.+)"$/, async function (option) {
  await dropdownPage.select(option);
});

Then(/^The dropdown value should be "(.+)"$/, async function (expectedOption) {
  const actual = await dropdownPage.selectedOptionText();
  expect(actual).toBe(expectedOption);
});

Then(/^The default dropdown value should be "(.+)"$/, async function (expectedPlaceholder) {
  const actual = await dropdownPage.selectedOptionText();
  expect(actual).toBe(expectedPlaceholder);
});