import { Given, When, Then } from "@wdio/cucumber-framework";
import Page from "../pageobjects/page.js";
import AllureReport from "../helpers/allure/allureReport.js";
const index = new Page();

Given(/^I am on the (.+) page$/, async (page) => {
  await index.open(page);
  await AllureReport.appendToReport(`Navigated to ${page} page`, '✔', '✔');
});

Given("I am at the index page", async function () {
  await index.open();
});

When(/^I click the (.+) link$/, async function (page) {
  this.page = page;
  await index.click(page);
});

Then("I should be directed to the selected page", async function () {
  const expectedPage = this.page?.trim();
  const headers = await $$("h3");

  for (const h of headers) {
    const actualText = (await h.getText()).trim();
    if (actualText.includes(expectedPage)) {
      console.log(`✅ Match found for "${expectedPage}"`);
      return;
    }
  }

  throw new Error(`No matching <h3> found for "${expectedPage}"`);
});




