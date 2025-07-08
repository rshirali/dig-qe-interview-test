/**
 * Type definition for the location details of an error in the stack trace.
 */
type ErrorLocation = {
    methodName: string | null;
    fileName: string | null;
    lineNumber: string | null;
    columnNumber: string | null;
};

/**
 * A utility class to extract and process error location details from a stack trace.
 */
class consoleLog {
    /**
     * Extracts the error location from the provided error's stack trace.
     * It returns the method name, file name, line number, and column number where the error originated.
     *
     * @param {Error} error - The error object from which to extract the stack trace.
     * @returns {ErrorLocation} An object containing methodName, fileName, lineNumber, and columnNumber.
     *                          Returns null for these properties if unable to parse the stack trace.
     */
    public getErrorLocation(error: Error): ErrorLocation {
        const stackLine = error.stack?.split("\n")[1]; // Getting the second line of the stack trace
        const match = /at (.+) \((.+):(\d+):(\d+)\)/.exec(stackLine); // Regular expression to parse stack line

        if (match) {
            const [, methodName, fileName, lineNumber, columnNumber] = match;
            return { methodName, fileName, lineNumber, columnNumber };
        } else {
            return { methodName: null, fileName: null, lineNumber: null, columnNumber: null };
        }
    }
}

export default new consoleLog();
