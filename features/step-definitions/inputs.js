import { When, Then } from "@cucumber/cucumber";
import { expect } from "@wdio/globals";
import inputsPage from "../pageobjects/inputs.page.js";

When(/^I enter "(\d+)"$/, async function (num) {
  this.num = num;
  await inputsPage.set(num);
});

Then(/^The input value should be the number I entered$/, async function () {
  expect(await inputsPage.elements.input()).toHaveValue(this.num);
});
