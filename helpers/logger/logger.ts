import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const appendFile = util.promisify(fs.appendFile);
const stat = util.promisify(fs.stat);
const rmdir = util.promisify(fs.rmdir);

class LogConsolidator {
    async consolidateLogsAndCleanUp() {
        const logDir = './logs/';

        // Create a timestamp for the output directory
        const now = new Date();
        const timestamp =
            `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`
        const outputDirLogs = `${logDir}/session-logs/${timestamp}`;

        // Create the output directory
        await fs.promises.mkdir(outputDirLogs, { recursive: true })

        // Get a list of log files in the log directory
        const logFiles = (await readdir(logDir)).filter((logFile) => logFile.endsWith('.log'))

        // Consolidate log files
        for (const logFile of logFiles) {
            const logFilePath = path.join(logDir, logFile)
            const content = await readFile(logFilePath, 'utf-8')
            const consolidatedLogPath = path.join(outputDirLogs, 'consolidated.log')
            await appendFile(consolidatedLogPath, content);
        }

        // Delete folders older than 24 hours
        const twentyFourHoursAgo = new Date((now as unknown as number) - 4 * 60 * 60 * 1000);

        const subdirectories = await readdir(logDir)
        for (const subdirectory of subdirectories) {
            const subdirectoryPath = path.join(logDir, subdirectory)
            const subdirectoryStat = await stat(subdirectoryPath);
            if (subdirectoryStat.isDirectory() && subdirectoryStat.mtime < twentyFourHoursAgo) {
                await rmdir(subdirectoryPath, { recursive: true })
                console.log(`Deleted folder: ${subdirectoryPath}`)
            }
        }
        console.log('Log consolidation and cleanup completed.')
    }
}
export default new LogConsolidator()