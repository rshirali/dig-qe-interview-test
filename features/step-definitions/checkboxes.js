import { When, Then } from "@wdio/cucumber-framework";
import { expect } from "@wdio/globals";
import checkboxesPage from "../pageobjects/checkboxes.page.js";

When(/^I select checkbox (\d)$/, async function (num) {
  this.checkbox = await checkboxesPage.elements.checkbox(num);
  await checkboxesPage.select(num);
});

Then(/^The checkbox should be checked$/, async function () {
  await expect(this.checkbox).toHaveAttribute("checked");
});
