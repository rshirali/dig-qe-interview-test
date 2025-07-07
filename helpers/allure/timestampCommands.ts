import AllureReporter from '@wdio/allure-reporter'

/**
 * Generates a timestamp and returns it as a string.
 * @returns {string} The current timestamp as a string.
 */
function generateTimestamp(): string {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now
        .getHours()
        .toString()
        .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;
    return timestamp;
}

/**
 * Custom command to add a timestamp to the test name.
 * @param {string} testName - The original test name.
 * @returns {string} The test name with a timestamp.
 */
function addTimestampToTestName(testName: string): string {
    const timestamp = generateTimestamp();
    return `${testName}: ${timestamp}`;
}

/**
 * Custom command to add a timestamp to the step name.
 * @param {string} stepName - The original step name.
 * @returns {string} The step name with a timestamp.
 */
function addTimestampToStepName(stepName: string): string {
    const timestamp = generateTimestamp();
    return `${stepName}: ${timestamp}`;
}

export { addTimestampToTestName, addTimestampToStepName }
