import allureReporter from '@wdio/allure-reporter'
import {Status} from 'allure-js-commons'
import {ResponseObject} from "../ui/assertion.js"
import stringify from 'json-stable-stringify'
import {Chalk} from "../barrel.js";

class AllureReport {

    passFailStatusForAfterTestHook: boolean
    /**
     * Appends a step to the report with the actual and expected results.
     *
     * @param {string} stepDescription - The description of the step.
     * @param {string} actual - The actual result.
     * @param {string} expected - The expected result.
     * @param {string} [expectType='toEqual'] - The type of expectation ('toEqual' or 'toContain').
     * @returns {Promise<void>} - A promise that resolves once the step is appended to the report.
     * @throws {Error} - Logs an error if appending to the report fails.
     *
     * @example
     * await this.appendToReport('Check role addition', 'Role added successfully', 'Role added successfully');
     * await this.appendToReport('Check role addition', 'Role added successfully', 'Role added successfully', 'toContain');
     */
    async appendToReport(stepDescription: string, actual: string, expected: string, expectType: string = 'toEqual'): Promise<void> {
        try {
            allureReporter.startStep(stepDescription);
            const allureDescription =
                `Assert to match:\nActual result: ${actual === "" ? "blank" : actual}\nExpected result: ${expected === "" ? "blank" : expected}`;
            allureReporter.addAttachment('Assertion Details', allureDescription, 'text/plain');
            // Add attachment with ternary condition on the actual result
            allureReporter.addAttachment('Actual Result', actual === "" ? "blank" : actual, 'text/plain');
            allureReporter.addAttachment('Expected Result', expected === "" ? "blank" : expected, 'text/plain');

            const sanitizeStepDescription = stepDescription.replace(/[^a-zA-Z0-9_]/g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '');
            const screenshotFileName = `${sanitizeStepDescription}_${timestamp}.png`;
            const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`;
            allureReporter.addAttachment(screenshotFileName, await browser.saveScreenshot(screenshotPath), 'image/png');

            let isSuccess: boolean;

            try {
                if (expectType === 'toContain') {
                    expect(actual).toContain(expected);
                } else {
                    expect(actual).toEqual(expected);
                }
                isSuccess = true;
            } catch (error) {
                isSuccess = false;
                // Optionally, you can log the error details here for debugging purposes
                console.error(`Assertion error: ${error.message}`);
            }

            if (!isSuccess) {
                allureReporter.endStep(Status.FAILED);
            } else {
                allureReporter.endStep(Status.PASSED);
            }
        } catch (error) {
            console.error(`Error in ${stepDescription}: ${error.message}`);
            throw error; // Rethrow to ensure Jasmine knows an error occurred during test setup/teardown
        }
    }

    /**
     * Asynchronously appends test details to the report with attachments for actual and expected responses.
     * It captures and attaches a screenshot of the current state. The function also performs an assertion
     * to compare the actual and expected responses, and it updates the pass/fail status accordingly.
     *
     * @async
     * @function appendToReport3
     * @param {string} stepDescription - Description of the test step.
     * @param {ResponseObject[]} actualResult - The actual response obtained in the test.
     * @param {ResponseObject[]} expectedResult - The expected response for comparison.
     * @returns {Promise<void>} A promise that resolves when the report is updated.
     * @throws {Error} Throws an error if an issue occurs in the reporting process.
     */
    async appendToReport3(stepDescription: string, actualResult: ResponseObject<any>[], expectedResult: ResponseObject<any>[]): Promise<void> {
        //const allureDescription = `Assert to match:\nActual result:\n${stringify(actualResult)}\nExpected result:\n${stringify(expectedResult)}`;
        try {
            allureReporter.startStep(stepDescription);
            const allureDescription = `Assert to match:\nActual result:\n${stringify(actualResult)}\nExpected result:\n${stringify(expectedResult)}`;

            // Add JSON string attachments for actual and expected responses
            allureReporter.addAttachment('Assertion Details', allureDescription, 'text/plain');
            allureReporter.addAttachment('Actual Result', stringify(actualResult), 'application/json');
            allureReporter.addAttachment('Expected Result', stringify(expectedResult), 'application/json');

            // Generate a timestamp and screenshot filename
            const sanitizeStepDescription = stepDescription.replace(/[^a-zA-Z0-9_]/g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '');
            const screenshotFileName = `${sanitizeStepDescription}_${timestamp}.png`;
            const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`;

            // Capture and attach a screenshot
            allureReporter.addAttachment(screenshotFileName, await browser.saveScreenshot(screenshotPath), 'image/png');

            // Perform the assertion and determine the pass/fail status
            let isSuccess: boolean;
            try {
                expect(actualResult).toEqual(expectedResult);
                isSuccess = true;
            } catch (error) {
                isSuccess = false;
                // Optionally, you can log the error details here for debugging purposes
                console.error(Chalk.red((`Assertion error: ${error.message}`)));
            }

            if (!isSuccess) {
                allureReporter.endStep(Status.FAILED);
            } else {
                allureReporter.endStep(Status.PASSED);
            }
        } catch (error) {
            console.error(Chalk.red((`Error in appendToReport3: ${error.message}`)));
            // Additional error handling if needed
        }
    }

    // Reusable function to capture screenshots in catch blocks
    async captureErrorScreenshot(errorMessage: string): Promise<void> {
        try {
            let screenshotFileName: string;

            // Check if the error message is related to an element not being found
            if (errorMessage.includes("element wasn't found")) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '');
                screenshotFileName = `elementNotFound_${timestamp}.png`;
            } else {
                // Use the original error message for other types of errors
                screenshotFileName = this.getSanitizedFileName(errorMessage);
            }

            const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`;
            //await browser.saveScreenshot(screenshotPath);
            // If you use a test reporter, attach the screenshot here
            allureReporter.addAttachment('View screenshot of error', await browser.saveScreenshot(screenshotPath), 'image/png');
        } catch (screenshotError) {
            console.error(`Error capturing captureErrorScreenshot: ${screenshotError.message}`);
        }
    }

    private getSanitizedFileName(stepDescription: string): string {
        const sanitizeStepDescription = stepDescription.replace(/[|, ]+/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '');
        return `${sanitizeStepDescription}_${timestamp}.png`;
    }

    /**
     * Get the pass/fail status for the afterTest hook.
     *
     * @returns {boolean}
     */
    // getPassFailStatusForHook(): boolean {
    //     return this.passFailStatusForAfterTestHook
    // }

}

export default new AllureReport();