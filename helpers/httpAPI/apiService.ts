import allureReporter from "@wdio/allure-reporter";
import axios from "axios";
import LoginPage from "../../page-objects/login/login.page";

// Define the ResponseObject interface
export interface ResponseObject {
    [key: string]: string | number | boolean; // Adjust the types based on your actual data types
}

class ApiService {
    private static instance: ApiService;
    private authTokenPromise: Promise<string> | null = null;

    private constructor() {
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    private async fetchAuthTokenPromise(): Promise<string> {
        let localStorageValue: string
        try {
            // Log in or perform actions to set the token in Local Storage
            await LoginPage.loginLearn();
            const keyToRetrieve = 'https://learn-dev.llnl.gov:443.learn.access_token';
            // Wait for a maximum of 3000 milliseconds (adjust as needed)
            await browser.waitUntil(async () => {
                // Retrieve the value from Local Storage
                localStorageValue = await browser.execute(function (key) {
                    // Use the browser's Local Storage API to get the value by key
                    return localStorage.getItem(key);
                }, keyToRetrieve);

                // Check if the value is not null
                return localStorageValue !== null;
            }, {
                timeout: 4000,
                timeoutMsg: 'Timeout waiting for authentication token in Local Storage',
                interval: 500, // Poll every 500 milliseconds (adjust as needed)
            });
            // Set the retrieved token
            this.authTokenPromise = Promise.resolve(localStorageValue);
            // Return the token as a string
            return this.authTokenPromise;
        } catch (error) {
            console.error('Error fetching authentication token:', error.message);
            // Handle the error or rethrow if needed
            throw error;
        }
    }
    //Returns the token as a string. fetchAuthTokenPromise() is called
    //only once in the execution of the program
    public async fetchAuthToken(): Promise<string> {
        if (!this.authTokenPromise) {
            this.authTokenPromise = this.fetchAuthTokenPromise();
        }
        return this.authTokenPromise;
    }

    private validateObject(actualResponse: ResponseObject, expectedResponse: ResponseObject[]): void {
        expect(actualResponse).toEqual(expectedResponse);
    }

    public async getRequest(baseEndpoint: string, endpointPath: string, responseStatusCode: number, expectedResponse: ResponseObject[]): Promise<void> {
        try {
            let authToken = await this.fetchAuthToken()
            // Ensure a single slash between BaseEndpoint and EndpointPath
            const pathSeparator = baseEndpoint.endsWith('/') || endpointPath.startsWith('/') ? '' : '/';

            // Make the GET request with the authentication token
            const response = await axios.get(`${baseEndpoint}${pathSeparator}${endpointPath}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    // Add other headers if needed
                },
            })
            //For debugging only. Comment out when not needed
            console.log('Response Data:', response.data)
            // Assert the response status code or perform other checks
            expect(response.status).toBe(responseStatusCode)
            await allureReporter.step("response.status " + JSON.stringify(response.status), async () => {
            })
            //Call validateObject to compare the response with the expected response
            this.validateObject(response.data, expectedResponse)
            // Access the response data
            const responseData = response.data
            //Append response to reporter
            await allureReporter.step("response.data " + JSON.stringify(responseData), async () => {
            });
            // Add the response data as an attachment to the Allure report
            //  await allureReporter.addAttachment('Response Data', JSON.stringify(responseData), 'application/json');
        } catch (error) {
            // Handle the error
            if (error.response && error.response.status === 500) {
                // Most likely a case of a bad token. Force a Jasmine error
                fail('Expired or bad token?: ' + error.message);
            } else {
                // Handle other types of errors
                console.error('Unexpected error:', error.message);
                // Mark the test as failed
                throw error;
            }
        }
    }
}

export default ApiService