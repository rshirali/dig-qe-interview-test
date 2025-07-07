import allureReporter from "@wdio/allure-reporter"
import {Status} from "allure-js-commons"
import scroll from "../../helpers/ui/scrolling.js";
import ObjectValidation from "./AsyncObjValidation.js";
import chalk from "chalk";
import {Ui} from "../barrel.js";
const validators = ObjectValidation;

class Commands {
    /**
     * Clicks on a WebdriverIO element and logs the action in the Allure report.
     *
     * @param {WebdriverIO.Element} element - The element to be clicked.
     * @returns {Promise<void>} - A promise that resolves once the element is clicked.
     *
     * @example
     * await click(buttonElement);
     */
    async click(element: WebdriverIO.Element): Promise<void> {
        try {
            // Wait for the element to be displayed and clickable
            await element.waitForDisplayed({ timeout: 5000 });
            await element.waitForClickable({ timeout: 5000 });

            let elementText = (await element.getText()).trim();
            if (!elementText) {
                const tagName = await element.getTagName();
                const classAttr = await element.getAttribute('class');
                elementText = `${tagName}_${classAttr.replace(/\s+/g, '_')}`;
            }
            const stepDescription = elementText.toString();
            const sanitizedFilename = this.getSanitizedFileName(stepDescription + '.png');

            allureReporter.startStep(`Click on ${stepDescription}`);
            const beforeClickPath = `./reports/ui/allure-results/${sanitizedFilename}`;
            allureReporter.addAttachment('Before click', await browser.saveScreenshot(beforeClickPath), 'image/png');

            await element.click();
            await browser.pause(1000); // Delay for screenshots for After click

            const afterClickPath = `./reports/ui/allure-results/${sanitizedFilename}`;
            allureReporter.addAttachment('After click', await browser.saveScreenshot(afterClickPath), 'image/png');
            allureReporter.endStep(Status.PASSED);

        } catch (error) {
            console.error(chalk.red(`Failed to click on element: ${error.message}`));
            allureReporter.startStep(`Failed to click on element: ${error.message}`);
            const sanitizedFilename = this.getSanitizedFileName("Failed2ClickOnElement" + '.png');
            const errorScreenshotPath = `./reports/ui/allure-results/${sanitizedFilename}`;
            await browser.saveScreenshot(errorScreenshotPath);  // Take error screenshot
            allureReporter.addAttachment('Error screenshot', await browser.saveScreenshot(errorScreenshotPath), 'image/png');
            allureReporter.endStep(Status.FAILED);
            throw error; // Re-throw the error to propagate it further, if necessary
        }
    }


    async isDisplayed(element: WebdriverIO.Element): Promise<boolean> {
        try {
            // Check if the element is existing and displayed
            if (await element.isExisting() && await element.isDisplayed()) {
                // Check if the element is within the viewport
                if (!(await scroll.isElementInViewport(element))) {
                    // If not, scroll to the element
                    await scroll.scrollToElement(element);
                    // Check again if the element is displayed
                    return await element.isDisplayed();
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error in isDisplayed method: ${error}`);
            throw error;
        }
    }

    getSanitizedFileName(stepDescription: string): string {
        // Sanitize the stepDescription to remove any illegal characters and replace them with underscores
        const sanitizedStepDescription = stepDescription
            .replace(/[:\/\\?*"<>\|\n\r]+/g, '-')  // Replaces illegal characters with '-'
            .replace(/\s+/g, '_')                // Replaces spaces with underscores
            .replace(/-{2,}/g, '-')              // Replace multiple dashes with a single dash
            .replace(/_+/g, '_');                // Replace multiple underscores with a single underscore

        // Create a timestamp for uniqueness without illegal filename characters
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '');

        // Construct the filename using sanitized description and timestamp
        return `${sanitizedStepDescription}_${timestamp}.png`.substring(0, 240).toLowerCase();  // Ensure the length does not exceed 240 characters
    }

    /**
     * Sets the value of an input element and logs the action in the Allure report.
     *
     * @param {WebdriverIO.Element} inPutElement - The input element to set the value.
     * @param {string} value - The value to be set into the input element.
     * @returns {Promise<void>} - A promise that resolves once the value is set.
     *
     * @example
     * await setText(inputElement, "Hello, World!");
     */
    async setText(inPutElement: WebdriverIO.Element, value: string): Promise<void> {
        try {
            await validators.waitForBlingElement(inPutElement)
            //await scroll.scrollToElement(inPutElement)
            let elementText = await inPutElement.getText();
            if (!elementText) {
                const tagName = await inPutElement.getTagName();
                const classAttr = await inPutElement.getAttribute('class');
                const safeClass = classAttr ? classAttr.replace(/\s+/g, '_') : 'no-class';
                elementText = `${tagName}_${safeClass}`;
            }
            const stepDescription = elementText.toString();

            await inPutElement.setValue(value)
            const inputText = await inPutElement.getValue(); // Call getValue as a function
            const ariaLabelValue = await inPutElement.getAttribute("aria-label")
            const inPutElementName = ariaLabelValue ? ariaLabelValue : inPutElement.selector

            await allureReporter.step(`Entered string '${inputText}' in '${inPutElementName}' input field`, async (s1) => {
                await s1.step('After entering string/text', async () => {
                    const screenshotFileName = this.getSanitizedFileName(stepDescription); // Use 'this' to call the method
                    const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`;
                    s1.attach(await browser.saveScreenshot(screenshotPath), 'image/png');
                });
            });
        } catch (error) {
            // Handle the error and add it to the step reporter
            await allureReporter.step(`Failed to set value in input field: ${error.message}`, async () => {
                // Your error handling logic here, if needed
            });
            throw error; // Re-throw the error to propagate it further, if necessary
        }
    }

    /**
     * Enters text into a given input element character by character with a specified delay.
     *
     * @param {WebdriverIO.Element} inPutElement - The input element to set the text into.
     * @param {string} string2Enter - The text to be entered into the input element.
     * @returns {Promise<void>} - A promise that resolves once the text is entered.
     * @throws {Error} - Throws an error if the maximum runtime is reached.
     *
     * @example
     * await setText2(inputElement, "Namaste");
     */
    async setText2(inPutElement: WebdriverIO.Element, string2Enter: string): Promise<void> {
        try {
            await browser.waitUntil(async () => await inPutElement.isClickable(), {
                timeout: 5000, // 5 seconds
                interval: 300, // Check every 300ms
                timeoutMsg: 'Input element not displayed within timeout'
            });

            await inPutElement.click();
            await inPutElement.clearValue();

            const startTime = Date.now();
            const maxRuntime = 5000; // 5 seconds
            const interval = 300; // 300ms

            // Iterate through each character in the name and send it individually
            for (const char of string2Enter) {
                await inPutElement.addValue(char);

                // Wait until the specified interval is reached
                await browser.waitUntil(async () => {
                    const elapsedTime = Date.now() - startTime;
                    return elapsedTime >= interval;
                });

                // Check if the maximum runtime has been reached
                if (Date.now() - startTime >= maxRuntime) {
                    console.warn("Maximum runtime reached. Stopping input.");
                    throw new Error("Maximum runtime reached. Stopping input.");
                }
            }

            const inputText = await inPutElement.getValue();
            const ariaLabelValue = await inPutElement.getAttribute("aria-label");
            // Use element.selector if elementText is empty
            const inPutElementName = ariaLabelValue ? ariaLabelValue : inPutElement.selector;

            /**
             * Add a step to the Allure report indicating the entered text and the input element.
             * @step
             * @param {string} inputText - The text entered into the input element.
             * @param {string} inPutElementName - The name or selector of the input element.
             */
            allureReporter.startStep(`Entered string '${inputText}' in '${inPutElementName}' input field`);
            const sanitizeStepDescription = inPutElementName.toString().replace(/[|, ]+/g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, ''); // Generate a timestamp without special characters
            const screenshotFileName = `${sanitizeStepDescription}_${timestamp}.png`;
            const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`;
            allureReporter.addAttachment(screenshotFileName, await browser.saveScreenshot(screenshotPath), 'image/png');
            allureReporter.endStep(Status.PASSED);
        } catch (error) {
            console.error(`Error in setText2 method: ${error}`);
            throw error;
        }
    }

    /**
     * Retrieves the text from an input element, scrolls to it, and logs the action in the Allure report.
     *
     * @param {WebdriverIO.Element} inPutElement - The input element from which to get the text.
     * @returns {Promise<string>} - A promise that resolves with the text of the input element.
     *
     * @example
     * let text = await getText(inputElement);
     */
    async getText(inPutElement: WebdriverIO.Element): Promise<string> {
        try {
            await this.waitForBlingElement(inPutElement);
            await scroll.scrollToElement(inPutElement);

            let elementText = await inPutElement.getText();
            if (!elementText) {
                const tagName = await inPutElement.getTagName();
                const classAttr = await inPutElement.getAttribute('class');
                elementText = `${tagName}_${classAttr.replace(/\s+/g, '_')}`;
            }
            const ariaLabelValue = await inPutElement.getAttribute("aria-label");
            const inPutElementName = ariaLabelValue ? ariaLabelValue : inPutElement.selector;

            await allureReporter.step(`Retrieved text from '${inPutElementName}'`, async (s1) => {
                await s1.step('Text retrieved from the element', async () => {
                    const screenshotFileName = this.getSanitizedFileName(elementText); // Use 'this' to call the method
                    const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`;
                    s1.attach(await browser.saveScreenshot(screenshotPath), 'image/png');
                });
            });

            return elementText;
        } catch (error) {
            // Handle the error and add it to the step reporter
            await allureReporter.step(`Failed to retrieve text from input field: ${error.message}`, async () => {
                // Your error handling logic here, if needed
            });
            throw error; // Re-throw the error to propagate it further, if necessary
        }
    }

    /**
     * Enters the specified name into the search input field and optionally includes terminated employees.
     * @param {string} name2Enter - The name to enter into the search input field.
     * @param {Object} [options] - Additional options.
     * @param {boolean} [options.includeTerminated=false] - Whether to include terminated employees in the search.
     * @returns {Promise<void>} - A Promise that resolves once the name is entered and terminated employees (if specified) are included.
     */
    async enterNameToSearch(name2Enter: string, options: { includeTerminated?: boolean } = {}): Promise<void> {
        if (options.includeTerminated) {
            // Use a CSS selector to target the label of the checkbox with the text "Include terminated"
            const terminatedCheckboxLabel = await $("label[for='include-terminated-checkbox-input']");
            // Click on the label, which should toggle the checkbox
            await Ui.click(terminatedCheckboxLabel);
        }
        const searchInput = await $("#personnel-lookup-search-input-field");
        await Ui.setText2(searchInput, name2Enter);
    }

    /**
     * Waits for an element to exist in the DOM.
     * This method is private and used internally by other public methods of the class.
     *
     * @param Element
     * @param {Partial<{ timeout: number }>} maxWait - Configuration for maximum wait time, defaults to 20 seconds.
     * @returns {Promise<Element>} - The element, if found.
     * @throws {Error} - Throws an error if the element does not exist within the specified time.
     */
    private async waitForBlingElement(Element: WebdriverIO.Element, maxWait: { timeout: number } = { timeout: 20000 }): Promise<void> {
        try {
            await browser.waitUntil(async () => Element.isExisting(), {
                timeout: maxWait.timeout,
                timeoutMsg: `Element was not found within ${maxWait.timeout} milliseconds.`
            });
        } catch (error) {
            console.error(chalk.red(`Error waiting for element: ${error}`));
            throw new Error(chalk.red(`Element not found or other error occurred: ${error}`));
        }

        //return Element;
    }
}
export default new Commands()
