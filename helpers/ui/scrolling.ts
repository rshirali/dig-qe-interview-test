import allureReporter from "@wdio/allure-reporter"

class Scrolling {

    getSanitizedFileName(stepDescription: string): string {
        const sanitizeStepDescription = stepDescription.replace(/[|, ]+/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '');
        return `${sanitizeStepDescription}_${timestamp}.png`;
    }

    /**
     * Scrolls to the given element on the page.
     *
     * This method first checks if the element is already in the viewport. If it's not,
     * it scrolls the element into view using the specified scrolling options. Optionally,
     * it can perform a smooth scroll. After scrolling, it pauses briefly to allow the
     * scroll action to settle, ensuring that subsequent actions on the element are
     * reliable.
     *
     * @param {WebdriverIO.Element} element - The WebdriverIO element to scroll to.
     * @param {boolean} smoothScroll - If true, the scroll to the element will be smooth. Defaults to true.
     * @throws Will throw an error if the element does not exist or if there's an error during the scrolling operation.
     */
    async scrollToElement(element: WebdriverIO.Element, smoothScroll: boolean = true): Promise<void> {
        try {
            // Check if the element exists
            if (!await element.isExisting()) {
                console.error('Element does not exist');
                return;
            }

            // Check if the element is already in the viewport
            if (!await this.isElementInViewport(element)) {
                // Define scroll behavior options
                const scrollOptions = smoothScroll
                    ? {behavior: 'smooth', block: 'center', inline: 'center'}
                    : {block: 'center', inline: 'center'};

                // Execute scroll into view
                await browser.execute("arguments[0].scrollIntoView(arguments[1]);", element, scrollOptions);

                // Optional: Pause to allow the scroll action to settle
                await browser.pause(2000);

                let elementText = await element.getText();
                if (!elementText) {
                    const tagName = await element.getTagName();
                    const classAttr = await element.getAttribute('class');
                    elementText = `${tagName}_${classAttr.replace(/\s+/g, '_')}`;
                }
                const stepDescription = elementText.toString();

                await allureReporter.step(`Scrolled to ${stepDescription}`, async (s1) => {
                    await s1.step('After scroll', async () => {
                        const screenshotFileName = this.getSanitizedFileName(stepDescription); // Use 'this' to call the method
                        const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`;
                        s1.attach(await browser.saveScreenshot(screenshotPath), 'image/png');
                    });
                });
            }


        } catch (error) {
            console.error("An error occurred while scrolling to the element:", error);
            // Additional error handling, including rethrowing or logging
        }
    }

    /**
     * Scrolls to a specific column header in an AG-Grid and ensures the first row cell of this column is visible.
     *
     * @param {string} columnHeader - The text content of the column header to scroll to.
     * @returns {Promise<string>} - A promise that resolves with the text content of the first row cell in the column,
     * or an empty string if an error occurs.
     * @throws {Error} - Throws an error if the column header is not found within the specified time.
     */
    async scrollToColumn(columnHeader: string): Promise<string> {
        try {
            let columnIndex = -1;

            // Define the end time for the loop
            const endTime = Date.now() + 5000; // 5 seconds from now

            while (Date.now() < endTime) {
                // Find all column headers
                const headers = await browser.$$('.ag-header-cell-text');

                // Iterate through headers to find the matching column
                for (let i = 0; i < headers.length; i++) {
                    const text = await headers[i].getText();
                    if (text.trim().toLowerCase() === columnHeader.toLowerCase()) {
                        columnIndex = i + 1; // +1 because nth-child is 1-indexed
                        break;
                    }

                    // Scroll each header into view
                    await headers[i].scrollIntoView({block: 'center', inline: 'center'});
                    await browser.pause(200); // Wait for scroll to settle

                    // Scroll corresponding cell of the current header
                    const firstRow = await browser.$('.ag-center-cols-container .ag-row-first');
                    const cell = await firstRow.$(`.ag-cell:nth-child(${i + 1})`);
                    await cell.scrollIntoView({block: 'center', inline: 'center'});
                    await browser.pause(200); // Wait for cell scroll to settle
                }

                if (columnIndex !== -1) {
                    // Header found, exit loop
                    break;
                }

                // Wait a bit before next iteration
                await browser.pause(200);
            }

            if (columnIndex === -1) {
                throw new Error(`Column header "${columnHeader}" not found`);
            }

            // Now that the header is found, ensure the first row cell is scrolled into view
            // const firstRow = await browser.$('.ag-center-cols-container .ag-row-first');
            // const cell = await firstRow.$(`.ag-cell:nth-child(${columnIndex})`);
            // await cell.scrollIntoView({block: 'center', inline: 'center'});
            // await browser.pause(900); // Wait for the final scroll action to complete

            // Return the text content of the cell
            //return await cell.getText();
        } catch (error) {
            console.error(`Error in scrollToColumn(): ${error}`);
            return '';
        }
    }

    /**
     * Check if an element is in the viewport.
     * @param {Element} element - The WebdriverIO element to check.
     * @returns {boolean} True if the element is in the viewport, false otherwise.
     */
    async isElementInViewport(element: WebdriverIO.Element): Promise<boolean> {
        try {
            // Check if the element exists
            if (!await element.isExisting()) {
                console.error('Element does not exist');
                return false;
            }

            const rect = await element.getLocation();
            const size = await element.getSize();

            // Get the viewport size once
            const windowRect = await browser.getWindowRect();
            const viewportWidth = windowRect.width;
            const viewportHeight = windowRect.height;

            // Check if the element's coordinates are within the viewport
            const isInViewPort =
                rect.x >= 0 &&
                rect.y >= 0 &&
                rect.x + size.width <= viewportWidth &&
                rect.y + size.height <= viewportHeight;

            let elementText = await element.getText();
            // await allureReporter.step(
            //     `Is element ${elementText === "" ? JSON.stringify(element.selector) : elementText} in viewport? ${isInViewPort ? 'Yes' : 'No'}`, async () => {
            //         // Add any additional reporting or steps here if needed
            //     }
            // );
            if (!elementText) {
                const tagName = await element.getTagName();
                const classAttr = await element.getAttribute('class');
                elementText = `${tagName}_${classAttr.replace(/\s+/g, '_')}`;
            }
            const stepDescription = elementText.toString();

            await allureReporter.step(`Is element ${elementText === "" ? JSON.stringify(element.selector) : elementText} in viewport? ${isInViewPort ? 'Yes' : 'No'}`, async (s1) => {
                if (isInViewPort) {
                    await s1.step('Scrolling not required', async () => {
                        const screenshotFileName = this.getSanitizedFileName(stepDescription); // Use 'this' to call the method
                        const screenshotPath = `./reports/ui/allure-results/${screenshotFileName}`;
                        s1.attach(await browser.saveScreenshot(screenshotPath), 'image/png');
                    });
                }
            });

            return isInViewPort

        } catch (error) {
            console.error(`Error occurred in isElementInViewport: ${error}`);
            // Additional error handling logic here
            return false; // Returning false or throwing the error based on how you want to handle the failure
        }

    }
}

export default new Scrolling();
