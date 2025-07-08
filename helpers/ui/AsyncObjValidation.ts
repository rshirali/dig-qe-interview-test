import Constants from "./constants.js";
import { WaitUntilOptions, Element, Selector} from 'webdriverio';

const timeout = Constants.accountsTimeout;

class ObjectValidation {
  async waitForBlingElement(element: any, maxWait: Partial<WaitUntilOptions> = {timeout: 20000}) {
    try {
      await browser.waitUntil(() => {
        return element && element.isExisting();
      }, maxWait);
    } catch (e) {
      console.error("Can't find element");
    }

    return element;
  }

  async waitForElement(path: Selector, maxWait: Partial<WaitUntilOptions> = { timeout: 20000 }) {
    let element = null;

    try {
      await browser.waitUntil(() => {
        element = $(path);
        return element && element.isExisting();
      }, maxWait);
    } catch (e) {
      console.error("Can't find element");
    }

    return element;
  }

  async waitForArray(path, arrayIndex = null, maxWait: Partial<WaitUntilOptions> = { timeout: 20000 }) {
    if (arrayIndex == null) {
      let arr = null;

      try {
        await browser.waitUntil(async () => {
          arr = await $$(path);
          return arr.length > 0;
        }, maxWait);
      } catch (e) {
        ("Can't find array");
      }

      return arr;
    } else {
      let arr = null;
      await browser.waitUntil(async () => {
        arr = await $$(path);
        return (
          arr.length > arrayIndex &&
          arr[arrayIndex] &&
          arr[arrayIndex].isExisting()
        );
      }, maxWait);

      return arr[arrayIndex];
    }
  }

  async myFunction() {
    const condition = () => {
      // Condition logic
      return true;
    };
  
    const options: WaitUntilOptions = {
      timeout: 5000,
      timeoutMsg: `expected loading spinner to be gone after ${timeout} milliseconds`,
    };
  
    await browser.waitUntil(condition, options);
  }
  
  async waitForSpinner(maxTime: number = 10000, additionalPause = 700) {
    let spinner: any = await $(".MuiCircularProgress-svg");
    const options: WaitUntilOptions = {
      timeout: maxTime,
      timeoutMsg: `expected loading spinner to be gone after ${timeout} milliseconds`,
    };
    if (await spinner.isDisplayed()) {
      await browser.waitUntil(async () => !(await spinner.isDisplayed()), options)
    }
    await browser.pause(additionalPause);
  }
 
  async waitForObject(myObject: any) {
    if (myObject.waitForExist(timeout) === true) {
      await myObject.waitForDisplayed(timeout);
    }
    return $(myObject.selector);
  }

  async waitForObjectToExist(myObject: any) {
    await myObject.waitForExist(timeout);
    return $(myObject.selector);
  }

  async waitForDisplayed(myObject: any) {
    await myObject.waitForDisplayed(timeout);
    return $(myObject.selector);
  }

  // Selector should be a double dollar sign ($$) webdriver selector
  async waitForArrayLength(selector: any) {
    if (!selector) return;
    const selectorName =
      selector.length && selector[0].selector
        ? selector[0].selector
        : "selector";
        const options: WaitUntilOptions = {
          timeout: timeout,
          timeoutMsg: `expected loading spinner to be gone after ${timeout} milliseconds`,
        };
        await browser.waitUntil(
      () => selector.length, options)
  }

  async waitForEnabled(myObject: any) {
    await myObject.waitForEnabled(timeout);
    return $(myObject.selector);
  }

  async isObjectSelected(myObject: any) {
    const isSelected = await myObject.isSelected();
    return isSelected;
  }

  async isObjectEnabled(myObject: any) {
    const isEnabled = await myObject.isEnabled();
    return isEnabled;
  }

  // The selector must be of type $(<something>).
  async doesObjectExist(selector: any, maxTime = timeout, reverse = false) {
    let retValue = true;
    try {
      await selector.waitForExist(maxTime, reverse);
    } catch (error) {
      retValue = false;
    }
    return retValue;
  }

  async fmsFiltersNumber(myObject: any) {
    const buttonText = myObject;
    const openParen = await buttonText.indexOf("(");
    const closeParen = await buttonText.indexOf(")");
    let retValue = "";
    if (openParen !== -1 && closeParen !== -1 && closeParen > openParen + 1) {
      const strLength = closeParen - openParen - 1;
      retValue = await buttonText.substr(openParen + 1, strLength);
    }
    return parseInt(retValue, 10);
  }
}

export default new ObjectValidation();