import { When, Then } from '@wdio/cucumber-framework';
import inputsPage from "../pageobjects/inputs.page.js"; // Keep `.js` if built version has .js
import Assertion  from '../helpers/ui/assertion.js';

When(/^I type "(\d+)"$/, async (num: string) => {
  await inputsPage.set(num);
});

When(/^I set the input to "(\d+)"$/, async (num: string) => {
  await inputsPage.set(num);
});

When(/^I increment the input value (\d+) times$/, async (count: string) => {
  await inputsPage.increment(Number(count));
});

When(/^I decrement the input value (\d+) times$/, async (count: string) => {
  await inputsPage.decrement(Number(count));
});

Then(/^The input value should be "(\d+)"$/, async (expected: string) => {
  const actual = await inputsPage.elements.input().getValue();

  // Replace built-in expect with custom assertion
  ////Send it to assert and append the result to the Allure report
  //         await Assertion.toEqualStrings(stepDescription, actualResult, expectedResult)
  await Assertion.toEqualStrings(
      `Verifying input value equals "${expected}"`,
      actual.toString(),
      expected.toString()
  );
});

