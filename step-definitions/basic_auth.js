import { When, Then } from "@wdio/cucumber-framework";
import { expect } from "@wdio/globals";

import BasicAuthPage from "../pageobjects/basic_auth.page.js";

When(
  /^I use basic auth to login with (\w+) and (.+)$/,
  async (username, password) => {
    await BasicAuthPage.login(username, password);
  }
);

Then(/^I should see a paragraph saying (.+)$/, async (expectedMessage) => {
    const isSuccess = expectedMessage.toLowerCase().includes("congratulations");

    if (isSuccess) {
        await BasicAuthPage.message.waitForExist({ timeout: 5000 });
        const actualText = await BasicAuthPage.message.getText();
        expect(actualText).toContain(expectedMessage);
    } else {
        const exists = await BasicAuthPage.message.isExisting();
        // Optionally skip assertion in Chrome if popup blocks page
        if (
            browser.capabilities.browserName === "chrome" &&
            exists === false
        ) {
            return;
        }
        expect(exists).toBe(false);
    }
});

