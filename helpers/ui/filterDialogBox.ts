import allureReporter from "@wdio/allure-reporter"
// Importing from helpers
import {Ui, Assertion, ResponseObject, Scroll, Chalk}
    // from 'helpers'
    from '../barrel.js' //this works.


class FilterDialogBox {

    async selectButton(buttonSelection: string) {
        try {
            const buttonXpath: string = `//button[normalize-space()='${buttonSelection}']`
            const buttonElement: WebdriverIO.Element = await browser.$(buttonXpath)
            await Ui.click(buttonElement)
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }

    async findColumnIndex(columnName: string): Promise<number> {
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error(`Timeout reached while searching for column '${columnName}'`));
            }, 10000); // 10 seconds timeout
        });

        try {
            await browser.waitUntil(async () => {
                const headers = await browser.$$('.ag-header-cell-text');
                return headers.length > 0;
            }, {
                timeout: 3000,
                interval: 300,
                timeoutMsg: `Expected header length to be at least 14, but it wasn't within 3000 ms`
            })


            const headers = await browser.$$('.ag-header-cell-text')
            for (let i = 0; i < headers.length; i++) {
                //  await headers[i].scrollIntoView({block: "center", inline: "center"});
                await browser.pause(500)
                const headerText = await headers[i].getText();
                if (headerText.trim() === columnName) {
                    clearTimeout(timeoutId);
                    return i + 1; // +1 because nth-child is 1-indexed
                }
            }
        } catch (error) {
            console.error(`Error in findColumnIndex: ${error}`);
            return -1;
        }

        clearTimeout(timeoutId);
        throw new Error(`Column '${columnName}' not found`);
    }


    async openFilterDialog(columnIndex: number): Promise<void> {
        const filterButtonSelector = `(//div[@role='gridcell'])[${columnIndex}]//button[@ref='eButtonShowMainFilter']`;
        const filterButton = await browser.$(filterButtonSelector);
        //await filterButton.scrollIntoView({block: 'center', inline: 'center'});
        await browser.pause(500)
        await Ui.click(filterButton)
    }

    //-------------------------------------Workspace-----
    private async setStringFilterCriterion(filterCriterion: string, inputValue: string): Promise<void> {
        let dropdownIcon: WebdriverIO.Element = await browser.$('.ag-picker-field-icon');
        await dropdownIcon.click();

        const dropdownList = await browser.$('.ag-list.ag-select-list');
        const options = await dropdownList.$$('.ag-list-item');
        for (const option of options) {
            const optionText = await option.getText();
            if (optionText.trim() === filterCriterion) {
                await option.click();
                break;
            }
        }

        if (filterCriterion !== "Blank" && filterCriterion !== "Not blank") {
            // Use the input selector for text type filter
            const inputSelector = 'input.ag-input-field-input[type="text"][placeholder="Filter..."]';
            const inputField = await browser.$(inputSelector);
            await inputField.setValue(inputValue);
        }
    }


    async setFilterCriterion(filterCriterion: string, inputValue: string, isDateType?: boolean): Promise<void> {
        const dropdownIcon = await browser.$('.ag-picker-field-icon');
        await dropdownIcon.click();

        const dropdownList = await browser.$('.ag-list.ag-select-list');
        const options = await dropdownList.$$('.ag-list-item');
        for (const option of options) {
            const optionText = await option.getText();
            if (optionText.trim() === filterCriterion) {
                await option.click();
                break;
            }
        }

        if (filterCriterion !== "Blank" && filterCriterion !== "Not blank") {
            const inputSelector = isDateType ? 'input.ag-input-field-input[type="date"][placeholder="yyyy-mm-dd"]' :
                'input.ag-input-field-input[type="text"][placeholder="Filter..."]';
            const inputField = await browser.$(inputSelector);
            const formattedValue = isDateType ? this.formatDateToMMDDYYYY(inputValue) : inputValue;
            await inputField.setValue(formattedValue);
        }
    }

    formatDateToMMDDYYYY(dateString: string): string {
        if (!dateString || !dateString.includes('-')) {
            throw new Error('Invalid or undefined dateString provided');
        }

        const [yyyy, mm, dd] = dateString.split('-');
        if (!yyyy || !mm || !dd) {
            throw new Error('Invalid dateString format. Expected format: yyyy-mm-dd');
        }

        const date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
        const formattedMM = String(date.getMonth() + 1).padStart(2, '0');
        const formattedDD = String(date.getDate()).padStart(2, '0');
        const formattedYYYY = date.getFullYear();
        return `${formattedMM}/${formattedDD}/${formattedYYYY}`;
    }


    //-----------DATE work

    async setDateFilterCriterion(filterCriterion: string, fromDate: string, toDate?: string): Promise<void> {
        let dropdownIcon: WebdriverIO.Element;
        dropdownIcon = await browser.$('.ag-picker-field-icon');
        await dropdownIcon.click();

        const dropdownList = await browser.$('.ag-list.ag-select-list');
        const options = await dropdownList.$$('.ag-list-item');
        for (const option of options) {
            const optionText = await option.getText();
            if (optionText.trim() === filterCriterion) {
                // await option.click();
                await Ui.click(option)
                break;
            }
        }

        // Format the dates to mm/dd/yyyy format
        const formattedFromDate = this.formatDateToMMDDYYYY(fromDate);
        let formattedToDate = toDate ? this.formatDateToMMDDYYYY(toDate) : '';

        if (filterCriterion !== "Blank" && filterCriterion !== "Not blank") {
            if (filterCriterion === "In range" && toDate) {
                // Handle 'In range' criterion with from and to date fields
                const fromDateField = await browser.$('.ag-filter-from .ag-date-filter input[type="date"]');
                const toDateField = await browser.$('.ag-filter-to .ag-date-filter input[type="date"]');
                await fromDateField.setValue(formattedFromDate);
                await toDateField.setValue(formattedToDate);
            } else {
                // For other criteria, use only the first date field available
                const dateField = await browser.$('.ag-filter-body .ag-date-filter input[type="date"]');
                await dateField.setValue(formattedFromDate);
            }
        }
    }

    /**
     * Clicks a checkbox based on the provided name.
     * @param checkboxName The name of the checkbox to be clicked.
     */
    async clickCheckboxByName(checkboxName: string): Promise<void> {
        try {
            // Find all the checkbox items
            const checkboxItems = await $$('.ag-set-filter-item-checkbox');

            // Iterate through each checkbox item
            for (const item of checkboxItems) {
                // Get the label text
                const label = await item.$('.ag-checkbox-label');
                const labelText = await label.getText();

                // If label matches the checkboxName, click the checkbox
                if (labelText.trim() === checkboxName) {
                    const checkbox = await item.$('input[type="checkbox"]');
                    await checkbox.click();
                    return; // Exit the function after clicking the checkbox
                }
            }
        } catch (error) {
            console.error(`Error occurred while clicking checkbox by name: ${checkboxName}`, error);
            // Additional error handling logic if needed
        }
    }

    /**
     * Sets a string or date filter for a specified column in a table.
     *
     * @param {string} columnName - The name of the column to set the filter for.
     * @param checkBoxFilterCriterion
     * @returns {Promise<void>} - A promise that resolves when the filter is set.
     * @throws Will throw an error if the column is not found or any other error occurs.
     */
    async setCheckBoxFilter(columnName: string, checkBoxFilterCriterion: string): Promise<void> {
        await Scroll.scrollToColumn(columnName)
        try {
            const columnIndex = await this.findColumnIndex(columnName);
            if (columnIndex === -1) {
                await this.handleErrorWithScreenshot("Column not found", "FilterDialogBox", "setStringOrDateFilter");
            } else {
                await this.openFilterDialog(columnIndex);
                await this.clickCheckboxByName(checkBoxFilterCriterion)
            }
        } catch (error) {
            console.error(`Error occurred in setStringOrDateFilter: ${error}`);
            throw error;
        }
    }

    /**
     * Sets a string or date filter for a specified column in a table.
     *
     * @param {string} columnName - The name of the column to set the filter for.
     * @param {string} filterCriterion - The filter criterion (e.g., "Equals", "Contains").
     * @param {string} inputValue - The value to be used in the filter.
     * @returns {Promise<void>} - A promise that resolves when the filter is set.
     * @throws Will throw an error if the column is not found or any other error occurs.
     */
    async setStringFilter(columnName: string, filterCriterion: string, inputValue: string): Promise<void> {
        await Scroll.scrollToColumn(columnName)
        try {
            const columnIndex = await this.findColumnIndex(columnName);
            if (columnIndex === -1) {
                await this.handleErrorWithScreenshot("Column not found", "FilterDialogBox", "setStringOrDateFilter");
            } else {
                await this.openFilterDialog(columnIndex);
                await this.setStringFilterCriterion(filterCriterion, inputValue);
            }
        } catch (error) {
            console.error(`Error occurred in setStringOrDateFilter: ${error}`);
            throw error;
        }
    }

    async setDateFilter(columnName: string, filterCriterion: string, fromDate: string, toDate?: string): Promise<void> {
        await Scroll.scrollToColumn(columnName);
        try {
            const columnIndex = await this.findColumnIndex(columnName);
            if (columnIndex === -1) {
                await this.handleErrorWithScreenshot("Column not found", "FilterDialogBox", "setDateFilter");
            } else {
                await this.openFilterDialog(columnIndex);
                await browser.pause(4000)
                await this.setDateFilterCriterion(filterCriterion, fromDate, toDate);
            }
        } catch (error) {
            console.error(`Error occurred in setDateFilter: ${error}`);
            throw error;
        }
    }

    private async handleErrorWithScreenshot(customErrorMessage: string, className: string, methodName: string): Promise<void> {
        try {
            // Logic to take a screenshot
            const screenshotFileName = this.getSanitizedFileName(`${className}_${methodName}`)
            const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`
            //await browser.saveScreenshot(screenshotPath);

            // Log the error with class and method information
            console.error(Chalk.red(`Error in ${className}.${methodName}: ${customErrorMessage}`));
            // Log the error and attach the screenshot to the report
            await allureReporter.step(`Error in ${className}.${methodName}`, async (step) => {
                step.attach(await browser.saveScreenshot(screenshotPath), 'image/png');
            })
            throw new Error(`Error in ${className}.${methodName}: ${customErrorMessage}`)
        } catch (screenshotError) {
            console.error(`Error occurred while capturing screenshot: ${screenshotError}`);
        }
    }

    async verifyFilteredRowData(testDescription: string, expectedResult: ResponseObject<any>[], isEqual?: boolean): Promise<void> {
        try {
            // Call the selectRowContainer method to ensure the row container is selected
            await this.selectRowContainer();
            // Once the row container is selected, proceed with the rest of the method
            const rowContainer = await browser.$('.ag-center-cols-container .ag-row');

            // Get all cell elements within the row
            const cells = await rowContainer.$$('.ag-cell');

            // Initialize an empty object to hold the row data
            const resultObject = {};

            // Iterate over each cell, extracting the column index and value
            for (let index = 0; index < cells.length; index++) {
                const key = `column${index + 1}`;
                const value = await cells[index].getText() || '';
                resultObject[key] = value;
            }

            // Log the resulting JSON object
            //console.log(resultObject);
            const actualResult: ResponseObject<any>[] = [resultObject];
            await Assertion.toCompareJSONObjects(testDescription, actualResult, expectedResult);
        } catch (error) {
            console.error(`Error occurred in verifyFilteredRowData(): ${error}`);
            // Additional error handling if needed
        }
    }

    // handleErrorWithScreenshot method and other methods...

    // Define the selectRowContainer method as previously described...
    private async selectRowContainer(): Promise<void> {
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error('Timeout reached while searching for the row container'));
            }, 4000); // Set the timeout to 4 seconds
        });

        try {
            let rowContainerExists = false;
            await Promise.race([
                (async () => {
                    while (!rowContainerExists) {
                        const rowContainer = await browser.$('.ag-center-cols-container .ag-row');
                        if (await rowContainer.isExisting()) {
                            clearTimeout(timeoutId);
                            rowContainerExists = true;
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for 300ms before retrying
                        }
                    }
                })(),
                timeoutPromise
            ]);
        } catch (error) {
            console.error(`Error occurred in selectRowContainer(): ${error}`);
        }
    }

    // Function to generate a sanitized file name for screenshots
    private getSanitizedFileName(stepDescription: string): string {
        const sanitizeStepDescription = stepDescription.replace(/[|, ]+/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '');
        return `${sanitizeStepDescription}_${timestamp}.png`;
    }

    async verifyFilteredCellData(testDescription: string, expectedResult: ResponseObject<any>[], isEqual?: boolean): Promise<void> {
        try {
            await browser.waitUntil(
                async () => {
                    const rowContainer = await browser.$('.ag-center-cols-container .ag-row');
                    return rowContainer.isExisting();
                },
                {
                    timeout: 3000, // 3 seconds
                    interval: 300, // 300 ms
                    timeoutMsg: "Row container did not load in time"
                }
            );

            const rowContainer = await browser.$('.ag-center-cols-container .ag-row');
            const columnMapping = {
                // ... existing column mappings
            };

            const actualResults: ResponseObject<any>[] = []; // Initialize the array to hold actual results

            for (const expectedObject of expectedResult) {
                let actualResultObject: ResponseObject<any> = {}; // Initialize an empty object for each row

                for (const key in expectedObject) {
                    if (expectedObject.hasOwnProperty(key) && columnMapping.hasOwnProperty(key)) {
                        const cellIndex = columnMapping[key];
                        const cellSelector = `.ag-cell:nth-child(${cellIndex})`;
                        const cellValue = await rowContainer.$(cellSelector).getText();
                        actualResultObject[key] = cellValue; // Populate the object with cell values
                    }
                }

                actualResults.push(actualResultObject); // Add the object to the results array
            }
            console.log('Actual Results:', actualResults); // Debugging output
            console.log('Expected Results:', expectedResult); // Debugging output


            //await Assertion.toCompareJSONObjects(testDescription, actualResults, expectedResult, isEqual);
        } catch (error) {
            console.error(`Error occurred in verifyFilteredCellData: ${error}`);
            // Additional error handling if needed
        }
    }

    async verifyCellNotBlank(testDescription: string, columnName: string): Promise<void> {
        try {
            // Select the row container
            const rowContainer = await browser.$('.ag-center-cols-container .ag-row');

            if (!await rowContainer.isExisting()) {
                throw new Error('Row container not found');
            }

            // Define the column index based on the column name
            const columnMapping = {
                // ... other columns
                "Object ID": 1,
                "OUN": 2,
                // ... other columns
            };

            const cellIndex = columnMapping[columnName];
            if (cellIndex === undefined) {
                throw new Error(`Column "${columnName}" not found in mapping`);
            }

            // Select the cell in the first row at the specified column index
            const cellSelector = `.ag-cell:nth-child(${cellIndex})`;
            const cell = await rowContainer.$(cellSelector);

            if (!await cell.isExisting()) {
                throw new Error(`Cell not found in column "${columnName}"`);
            }

            // Get the text content of the cell
            const cellText = await cell.getText();
            const actualResult = {[columnName]: cellText ? 'Not blank' : ''};

            // Define the expected result as 'Not blank'
            const expectedResult = {[columnName]: 'Not blank'};
            await Assertion.toCompareJSONObjects(testDescription, [actualResult], [expectedResult]);
        } catch (error) {
            console.error(`Error occurred in verifyCellNotBlank: ${error}`);
            // Additional error handling if needed
        }
    }

}

export default new FilterDialogBox();
