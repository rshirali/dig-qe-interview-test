import { Given, When, Then } from "@wdio/cucumber-framework";
import { expect } from "@wdio/globals";

import LoginPage from "../pageobjects/login.page.js";
import SecurePage from "../pageobjects/secure.page.js";

When(/^I login with (\w+) and (.+)$/, async (username, password) => {
  await LoginPage.login(username, password);
});

Then(/^I should see a flash message saying (.*)$/, async (message) => {
  await expect(SecurePage.flashAlert).toBeExisting();
  await expect(SecurePage.flashAlert).toHaveTextContaining(message);
});
