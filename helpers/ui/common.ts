// Importing from helpers
import {Assertion, ResponseObject, Chalk, Ui, Scroll} from '../../helpers/barrel.js'

class Common {
    /**
     * Verifies the layout of a page by comparing extracted page title, buttons, and column names with expected results.
     *
     * @param {string} testDescription - A brief description of the test being performed.
     * @param {ResponseObject<any>} expectedResult - The expected result object to compare against.
     */
    async verifyPageLayout(testDescription: string, expectedResult: ResponseObject<any>[]): Promise<void> {
        try {
            const learnContent = await $('learn-content'); // Start from the <learn-content> tag

            // Extract the page title within <learn-content>
            const pageTitle = await learnContent.$('#page-title').getText();

            // Find all learn-button elements within <learn-content> and extract their text
            const buttons = await this.extractButtonTexts(learnContent);

            // Extract column names from the ag-header-row within <learn-content>
            const columns = await this.extractColumnNames(learnContent);

            // Construct the result object and compare it with the expected result
            const resultObject = {'Page Title': pageTitle, 'Buttons': buttons, 'Columns': columns};
            console.log(resultObject);
            // Uncomment the following line to perform actual result comparison
            await Assertion.toCompareJSONObjects(testDescription, [resultObject], expectedResult);
        } catch (error) {
            console.error('Error extracting page info:', error);
        }
    }

    private async extractButtonTexts(learnContent: WebdriverIO.Element): Promise<string[]> {
        const learnGridButtonElements = await learnContent.$$('learn-button');
        const buttons: string[] = [];
        for (const buttonElement of learnGridButtonElements) {
            const iconText = await buttonElement.$('mat-icon').then(icon => icon ? icon.getText().then(text => text.trim()) : '');
            const buttonText = await buttonElement.$('.mat-button-wrapper').then(button => button ? button.getText().then(text => text.replace(iconText, '').trim()) : '');
            buttons.push(`${iconText} ${buttonText}`);
        }
        return buttons;
    }

    private async extractColumnNames(learnContent: WebdriverIO.Element): Promise<string[]> {
        const columnHeaders = await learnContent.$$('.ag-header-cell-text');
        const columns: string[] = [];
        for (const header of columnHeaders) {
            await Scroll.scrollToElement(header)
            const columnName = await header.getText();
            columns.push(columnName.trim());
        }
        return columns;
    }

    /**
     * Extracts data from the first row of an AG-Grid and compares it with expected results.
     *
     * This method scrolls through each column header, ensures the corresponding first row cell is visible,
     * and then captures the cell's text. The result is an object where each key is a column header
     * and each value is the corresponding cell data from the first row.
     *
     * @param {string} testDescription - A brief description of the test being performed.
     * @param {ResponseObject<any>[]} expectedResult - An array of expected result objects to compare against.
     * @returns {Promise<void>} - A promise that resolves when the method has completed.
     */
    async verifyRecordFromFirstRow(testDescription: string, expectedResult: ResponseObject<any>[]): Promise<void> {
        let resultObject = {};
        try {
            const record = {};

            // Find all column headers
            const headers = await browser.$$('.ag-header-cell[role="columnheader"]');

            for (const header of headers) {
                // Check if the header is in the viewport
                // const isHeaderInView = await header.isDisplayedInViewport();
                //if (!isHeaderInView) {
                // Scroll the header into view if it's not in the viewport
                await header.scrollIntoView({block: 'center', inline: 'center'});
                await browser.pause(500); // Wait for scroll to settle
                //}

                const columnName = await header.$('.ag-header-cell-text').getText();
                const trimmedColumnName = columnName.trim();
                const colIndex = await header.getAttribute('aria-colindex');

                // Find the corresponding cell in the first row
                const firstRow = await browser.$('.ag-center-cols-container .ag-row-first');
                const cell = await firstRow.$(`.ag-cell[aria-colindex="${colIndex}"]`);

                // Check if the cell is in the viewport
                const isCellInView = await cell.isDisplayedInViewport();
                if (!isCellInView) {
                    // Scroll the cell into view if it's not in the viewport
                    await cell.scrollIntoView({block: 'center', inline: 'center'});
                    await browser.pause(200); // Wait for cell scroll to settle
                }

                let cellValue = await cell.getText();
                cellValue = cellValue.trim();

                // If cellValue is empty, assign "Blank"
                if (cellValue === '') {
                    cellValue = "Blank";
                }

                // Store the column name and cell value as a key-value pair
                record[trimmedColumnName] = cellValue;
            }

            console.log(record); // Debug only
            resultObject = record;
            //await Assertion.toCompareJSONObjects(testDescription, resultObject, expectedResult);
        } catch (error) {
            console.error(`Error in getRecordFromFirstRow(): ${error}`);
        }
    }

    /**
     * Clears all filters on an AG-Grid table and verifies that all filter inputs are indeed cleared.
     * This method dynamically handles any number of filter inputs, simulating natural user input for date fields.
     */
    async verifyClearFilters(): Promise<void> {
        try {
            // Find all enabled input fields within the AG-Grid header
            const filterInputs: WebdriverIO.ElementArray =
                await browser.$$('.ag-header-cell .ag-floating-filter-input .ag-input-field-input:not([disabled])');

            // Set each filter input with a test value based on its type
            for (const input of filterInputs) {
                // Scroll the header into view if it's not in the viewport
                await input.scrollIntoView({block: 'center', inline: 'center'});
                const type: string = await input.getAttribute('type');
                //Debug only
                //const label: string = await input.getAttribute('aria-label');
                switch (type) {
                    case 'text':
                        await Ui.setText(input, 'VerifyFilterTest')
                        await browser.keys('Enter')
                        //Debug only
                        //console.log(`Text set for ${label}`);
                        break;
                    case 'date':
                        //I shall visit date some other time. Not so easy
                        //console.log("Clear filter for Date fields is work in progress")
                        /*    const dateValue = '01012021'; // January 1, 2021
                            await input.setValue(dateValue);
                            console.log(`Date set for ${label}: ${dateValue} (formatted automatically)`);*/
                        break;
                    default:
                        console.log(`Unsupported input type: ${type}`);
                }
            }

            // Click on the Clear Filters button
            const clearFiltersButton: WebdriverIO.Element = await browser.$('#clearFiltersButton button');
            await Ui.click(clearFiltersButton)

            // Verify that all filter inputs are clear
            let allCleared = true;
            for (const input of filterInputs) {
                // Scroll the header into view if it's not in the viewport. For screenshot from reporter methods
                await input.scrollIntoView({block: 'center', inline: 'center'});
                //Limiting to string filters for now. Date filter code to come soon
                if (await input.getAttribute('type') == 'text') {
                    const value: string = await input.getValue()
                    let testDescription: string = `Verify clear filter for the column ${await input.getAttribute('aria-label')}`
                    let actualResult: string = value
                    let expectedResult: string = ''
                    await Assertion.toEqualStrings(testDescription, actualResult, expectedResult)
                    if (value !== '') {
                        console.error('Found a filter input that is not cleared:', await input.getAttribute('aria-label'), value);
                        allCleared = false;
                    }
                }
            }

            if (allCleared) {
                console.log('All filters are successfully cleared.');
            } else {
                throw new Error('Some filters were not cleared.');
            }

        } catch (error) {
            console.error(`Error in verifyClearFilters: ${error}`);
            throw error;  // Re-throw the error to handle it further up if necessary
        }
    }

    /**
     * Searches for a record by column name and text, and clicks the first matching row.
     * Scrolls through the rows dynamically and clicks the row where the specified text is found.
     *
     * @param {string} columnName - The name of the column to search in.
     * @param {string} string2Search - The text to search for in the specified column.
     * @param {string} [tableName] - The name of the table to search in.
     * @returns {Promise<void>} - A promise that resolves when the operation completes.
     */
    async searchRecordClick2(columnName: string, string2Search: string, tableName?: string): Promise<void> {
        try {
            // Fetch dynamic column mappings and the specific table
            const { columnMapping, table } = await this.getColumnMapping2(tableName);

            const columnId = columnMapping[columnName];
            if (!columnId) {
                console.error('Invalid column name');
                return;
            }

            let attempts = 0; // To prevent infinite looping
            while (attempts < 50) { // Limit number of attempts for safety
                let found = false;
                const rows = table
                    ? await table.$$('.ag-center-cols-container .ag-row')
                    : await $$('.ag-center-cols-container .ag-row');
                console.log(`Detected ${rows.length} rows in total.`);

                for (let row of rows) {
                    const cell = await row.$(`.ag-cell[col-id="${columnId}"]`);
                    const cellText = await cell.getText();
                    console.log(`Checking row: ${cellText}`);
                    if (cellText.trim().includes(string2Search)) {
                        await cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                        await browser.pause(500); // Allow for any lazy loading
                        await Ui.click(cell);
                        console.log('Record found and highlighted by clicking.');
                        found = true;
                        break;
                    }
                }

                if (found) break;

                // Scroll more if not found
                console.log('Record not found, attempting to scroll...');
                await browser.execute(() => {
                    const container = document.querySelector('.ag-body-viewport');
                    if (container) {
                        container.scrollTop += 200;
                    }
                });
                await browser.pause(500); // Wait for lazy loading

                attempts++;
            }

            if (attempts >= 50) {
                console.log('No matching record found after maximum attempts.');
            }
        } catch (error) {
            console.error(`Error in searchRecordClick2: ${error}`);
            // Optionally rethrow or handle error differently here
        }
    }

    /**
     * Gets the column mapping for the specified table name.
     *
     * @param {string} [tableName] - The name of the table to get the column mapping for.
     * @returns {Promise<{ columnMapping: { [key: string]: string }, table?: WebdriverIO.Element }>} - A promise that resolves to an object containing the column mapping and optionally the table element.
     */
    async getColumnMapping2(tableName?: string): Promise<{ columnMapping: { [key: string]: string }, table?: WebdriverIO.Element }> {
        let columnMapping: { [key: string]: string } = {};
        let table;

        try {
            if (tableName) {
                // Find the h6 element with the matching text
                const h6Elements = await browser.$$('h6');
                console.log(`Found ${h6Elements.length} h6 elements.`);
                for (const h6 of h6Elements) {
                    const h6Text = await h6.getText();
                    console.log(`Checking h6 text: "${h6Text}"`);
                    if (h6Text.trim() === tableName.trim()) {
                        // Scroll the h6 element into view
                        await h6.scrollIntoView({ block: 'center', inline: 'center' });
                        console.log('Scrolled h6 element into view.');

                        // Pause briefly to ensure DOM update
                        await browser.pause(1000);

                        // Find the parent element
                        const parentElement = await h6.parentElement();
                        if (await parentElement.isExisting()) {
                            console.log('Found parent element.');

                            // Iterate through the siblings of the parent element
                            let sibling = await parentElement.nextElement();
                            while (sibling) {
                                const siblingTagName = await sibling.getTagName();
                                console.log(`Checking sibling tag: "${siblingTagName}"`);
                                if (siblingTagName.toLowerCase() === 'div') {
                                    const agGrid = await sibling.$('ag-grid-angular');
                                    if (await agGrid.isExisting()) {
                                        table = agGrid;
                                        console.log('Found ag-grid-angular table.');
                                        break;
                                    }
                                }
                                sibling = await sibling.nextElement();
                            }
                        } else {
                            console.log('Parent element not found.');
                        }
                        break; // Ensure breaking the loop after finding the relevant table
                    }
                }
                if (!table) {
                    throw new Error(`Table with name "${tableName}" not found.`);
                }
            } else {
                // Default to the first table below the page-title div
                const pageTitle = await browser.$('div#page-title');
                if (!await pageTitle.isExisting()) {
                    throw new Error('Page title element not found.');
                }
                console.log('Found page title element.');

                // The parent might be incorrect. We should aim to go from pageTitle directly to its following siblings
                const learnContent = await browser.$('learn-content');
                if (!await learnContent.isExisting()) {
                    throw new Error('Learn-content element not found.');
                }
                console.log('Found learn-content element.');

                // Find the first ag-grid-angular table within learn-content
                table = await learnContent.$('ag-grid-angular');
                if (!await table.isExisting()) {
                    throw new Error('Table element within learn-content not found.');
                }
                console.log('Found table element within learn-content.');
            }

            // Scroll the table into view
            await table.scrollIntoView({ block: 'center', inline: 'center' });

            const headers = await table.$$('.ag-header-cell');
            console.log(`Found ${headers.length} header cells.`);
            for (const header of headers) {
                const headerId = await header.getAttribute('col-id');
                console.log(`Found header with col-id: ${headerId}`); // Print the col-id

                if (headerId) {
                    const textElement = await header.$('.ag-header-cell-text');
                    const isDisplayed = await textElement.isDisplayed();
                    const text = await textElement.getText();
                    console.log(`Text element displayed: ${isDisplayed}, Text: "${text}"`); // Print display status and text

                    if (isDisplayed && text !== '') {
                        columnMapping[text] = headerId;
                        console.log(`Mapped column name "${text}" to col-id "${headerId}"`); // Print mapping
                    }
                }
            }
            return { columnMapping, table };
        } catch (error) {
            console.error(`Error in getColumnMapping2: ${error}`);
            throw error;
        }
    }

    /**
     * Searches for a record by column name and text, and clicks the first matching row.
     * Scrolls through the rows dynamically and clicks the row where the specified text is found.
     *
     * @param {string} columnName - The name of the column to search in.
     * @param {string} string2Search - The text to search for in the specified column.
     * @param tableName
     * @returns {Promise<void>} - A promise that resolves when the operation completes.
     */
    async searchRecordClick(columnName: string, string2Search: string, tableName?: string): Promise<void> {
        try {
            // Scroll to the column if required
            await Scroll.scrollToColumn(columnName);

            // Fetch dynamic column mappings
            const columnMapping = await this.getColumnMapping(tableName)

            const columnId = columnMapping[columnName]
            if (!columnId) {
                console.error('Invalid column name')
                return;
            }

            let attempts = 0;  // To prevent infinite looping
            while (attempts < 50) {  // Limit number of attempts for safety
                let found = false;
                const rows = await browser.$$('.ag-center-cols-container .ag-row')
                console.log(`Detected ${rows.length} rows in total.`)

                for (let row of rows) {
                    const cell = await row.$(`.ag-cell[col-id="${columnId}"]`);
                    const cellText = await cell.getText();
                    console.log(`Checking row: ${cellText}`);
                    if (cellText.trim().includes(string2Search)) {
                        await cell.scrollIntoView({block: 'nearest', inline: 'nearest'});
                        await browser.pause(500); // Allow for any lazy loading
                        await Ui.click(cell);
                        console.log(Chalk.green('Record found and highlighted by clicking.'));
                        found = true;
                        break;
                    }
                }

                if (found) break;

                // Scroll more if not found
                console.log('Record not found, attempting to scroll...');
                await browser.execute(() => {
                    const container = document.querySelector('.ag-body-viewport');
                    if (container) {
                        container.scrollTop += 200;
                    }
                });
                await browser.pause(500); // Wait for lazy loading

                attempts++;
            }

            if (attempts >= 50) {
                console.log('No matching record found after maximum attempts.');
            }
            await browser.pause(3000)
        } catch (error) {
            console.error(`Error in searchRecordClick: ${error}`);
            // Optionally rethrow or handle error differently here
        }
    }

    async getColumnMapping(tableName?: string): Promise<{ [key: string]: string }> {
        let columnMapping: { [key: string]: string } = {};

        try {
            let table;

            if (tableName) {
                // Find the h6 element with the matching text
                const h6Elements = await browser.$$('h6');
                console.log(`Found ${h6Elements.length} h6 elements.`);
                for (const h6 of h6Elements) {
                    const h6Text = await h6.getText();
                    console.log(`Checking h6 text: "${h6Text}"`);
                    if (h6Text.trim() === tableName.trim()) {
                        // Scroll the h6 element into view
                        await h6.scrollIntoView({ block: 'center', inline: 'center' });
                        console.log('Scrolled h6 element into view.');

                        // Pause briefly to ensure DOM update
                        await browser.pause(1000);

                        // Find the parent element
                        const parentElement = await h6.parentElement();
                        if (await parentElement.isExisting()) {
                            console.log('Found parent element.');

                            // Iterate through the siblings of the parent element
                            let sibling = await parentElement.nextElement();
                            while (sibling) {
                                const siblingTagName = await sibling.getTagName();
                                console.log(`Checking sibling tag: "${siblingTagName}"`);
                                if (siblingTagName.toLowerCase() === 'div') {
                                    const agGrid = await sibling.$('ag-grid-angular');
                                    if (await agGrid.isExisting()) {
                                        table = agGrid;
                                        console.log('Found ag-grid-angular table.');
                                        break;
                                    }
                                }
                                sibling = await sibling.nextElement();
                            }
                        } else {
                            console.log('Parent element not found.');
                        }
                        break; // Ensure breaking the loop after finding the relevant table
                    }
                }
                if (!table) {
                    throw new Error(`Table with name "${tableName}" not found.`);
                }
            } else {
                // Default to the first table below the page-title div
                const pageTitle = 'div#page-title';
                await browser.waitUntil(async () => {
                    return await browser.$(pageTitle).isDisplayed();
                }, {
                    timeout: 5000, //5 seconds
                    interval: 300 //check every 300 ms
                });
                if (!await browser.$(pageTitle).isExisting()) {
                    throw new Error('Page title element not found.');
                }
                //console.log('Found page title element.');

                // The parent might be incorrect. We should aim to go from pageTitle directly to its following siblings
                const learnContent = await browser.$('learn-content');
                if (!await learnContent.isExisting()) {
                    throw new Error('Learn-content element not found.');
                }
                //console.log('Found learn-content element.');

                // Find the first ag-grid-angular table within learn-content
                table = await learnContent.$('ag-grid-angular');
                if (!await table.isExisting()) {
                    throw new Error('Table element within learn-content not found.');
                }
                //console.log('Found table element within learn-content.');
            }

            // Scroll the table into view
            //await table.scrollIntoView({ block: 'center', inline: 'center' });

            const headers = await table.$$('.ag-header-cell');
            console.log(`Found ${headers.length} header cells.`);
            for (const header of headers) {
                const headerId = await header.getAttribute('col-id');
                //console.log(`Found header with col-id: ${headerId}`); // Print the col-id

                if (headerId) {
                    const textElement = await header.$('.ag-header-cell-text');
                    const isDisplayed = await textElement.isDisplayed();
                    const text = await textElement.getText();
                    //console.log(`Text element displayed: ${isDisplayed}, Text: "${text}"`); // Print display status and text

                    if (isDisplayed && text !== '') {
                        columnMapping[text] = headerId;
                        //console.log(`Mapped column name "${text}" to col-id "${headerId}"`); // Print mapping
                    }
                }
            }
            return columnMapping;
        } catch (error) {
            console.error(`Error in getColumnMapping: ${error}`);
            throw error;
        }
    }

    async doFilter(columnName: string, string2Filter: string, tableName?: string) {
        try {
            //Adding slight wait
            await browser.pause(1000)
            // Fetch dynamic column mappings
            const columnMapping = await this.getColumnMapping(tableName);

            const columnId = columnMapping[columnName];
            if (!columnId) {
                throw new Error(`Invalid column name: ${columnName}`);
            }

            // Execute script to get the column index from the column id
            const colIndex = await browser.execute((colId) => {
                const header = Array.from(document.querySelectorAll('.ag-header-cell')).find(el => el.getAttribute('col-id') === colId);
                return header ? header.getAttribute('aria-colindex') : null;
            }, columnId);

            if (!colIndex) {
                throw new Error(`Column with col-id ${columnId} not found`);
            }

            // Select the filter input and apply the filter
            const filterInputSelector = `div.ag-header-cell[aria-colindex='${colIndex}'] input[type='text']`;
            const filterInput = await $(filterInputSelector);

            await filterInput.waitForDisplayed({timeout: 5000});
            await filterInput.clearValue();
            await filterInput.setValue(string2Filter);
            await browser.keys('Enter'); // Send Enter key to apply the filter
            await browser.pause(1000)

        } catch (error) {
            console.error(`Error in doFilter method: ${error.message}`);
            throw error; // Ensure errors are thrown to be handled by the caller
        }
    }

    /**
     * Closes a Snackbar after confirming the displayed message.
     * @param {string} displayMessage - The message expected to be displayed in the Snackbar.
     */
    async verifySnackbar(displayMessage: string) {
        try {
            // Wait until the snackbar is visible
            await browser.waitUntil(
                async () => {
                    const snackbar = await $(`.mat-snack-bar-container`);
                    return snackbar.isDisplayed();
                },
                {
                    timeout: 5000,
                    timeoutMsg: 'Snackbar was not visible after 5 seconds'
                }
            );

            // Get the snackbar element
            const snackbar = await $(`.mat-snack-bar-container`);
            const actualMessage = await snackbar.getText();
            // Check if the displayed message matches the expected message
            await Assertion.toIncludeStrings('Verify snackbar message', actualMessage, displayMessage);
            //if (!actualMessage.includes(displayMessage)) {
            //  throw new Error(`Expected message "${displayMessage}", but found "${actualMessage}".`);

            //}

            // Close the snackbar by clicking the close icon. Not required since it closes after few seconds.
            // const closeButton = await snackbar.$('mat-icon[data-mat-icon-type="font"]');
            // await Ui.click(closeButton)
            // // Optionally wait a bit after closing the snackbar
            // await browser.pause(500);

        } catch (error) {
            console.error(`Error in closeSnackbar method: ${error.message}`);
            throw error;
        }
    }
}

export default new Common()