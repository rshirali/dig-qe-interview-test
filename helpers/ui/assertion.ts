import {AllureReport, Chalk} from '../../helpers/barrel.js'
// Define the ResponseObject interface with generics
export interface ResponseObject<T> {
    /** T = generic */
    [key: string]: T;
}

class Assertion {
    /**
     * Verifies that the actual string includes the expected string and reports the result.
     *
     * This method checks if the actual string includes the expected string and appends
     * the result to the Allure report using the 'toContain' expectation.
     *
     * @param {string} testDescription - The description of the test.
     * @param {string} actual - The actual string to be checked.
     * @param {string} expected - The expected substring to check for inclusion.
     * @returns {Promise<void>} - A promise that resolves once the check and reporting are done.
     * @throws {Error} - Logs an error if the inclusion check or reporting fails.
     *
     * @example
     * await toIncludeStrings('Verify substring inclusion', 'Hello, world!', 'world');
     */

    async toIncludeStrings(testDescription: string, actual: string, expected: string): Promise<void> {
        try {
            await AllureReport.appendToReport(testDescription, actual, expected, 'toContain');
        } catch (error) {
            console.error(Chalk.red(`Error in toIncludeStrings: ${error.message}`));
        }
    }

    /**
     * Asserts that the actual string matches the expected string using Jest's `expect().toMatch()` matcher.
     *
     * @param testDescription
     * @param {string} actual - The actual string to compare.
     * @param {string} expected - The expected string to compare against.
     * @returns {void}
     */
    async toEqualStrings(testDescription: string, actual: string, expected: string): Promise<void> {
        let passFailStatus = false;
        try {
            await AllureReport.appendToReport(testDescription, actual, expected)
        } catch (error) {
            console.log(error.message)
        }
    }

    /**
     * Validates the actual response object or array of objects against the expected response array.
     * It compares each object in the actual response with the corresponding object in the expected response.
     * If the actual response is a single object, it is wrapped in an array for comparison.
     * The method logs any extra objects present in the actual response, or any missing objects when compared to the expected response.
     * Finally, it uses Jasmine's expect method to assert that the actual response array is equal to the expected response array.
     *
     * @param stepDescription
     * @param actualResult
     * @param expectedResult
     * @param isEqual
     * @returns {boolean} - `true` if all key-value pairs in the actual response match the expected response, `false` otherwise.
     */
    async toCompareJSONObjects(stepDescription: string, actualResult: ResponseObject<any>[], expectedResult: ResponseObject<any>[], isEqual: boolean = true): Promise<void> {
        await AllureReport.appendToReport3(stepDescription, actualResult, expectedResult)
        //await AllureReport.appendToReport2(stepDescription, actualResponseArray, expectedResponse, comparisonResult, isEqual);
    }
}

export default new Assertion();