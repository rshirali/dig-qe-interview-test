import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'node:path';
import fs from 'fs';
import os from 'os';
import allure from 'allure-commandline';
import featurePaths from '../testRunners/featureRunner.js';
import type { Options } from '@wdio/types'; // Correct type import
import fsExtra from 'fs-extra';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Flags
const isHeadless = process.argv.includes('--headless');
const isFirefox = process.argv.includes('--firefox');
const isAll = process.argv.includes('--all');

// Allure paths
const allureResultsDir = './reports/ui/allure-results';
const allureReportDir = './reports/ui/allure-report/latest';

// Path for allure-results and logs folders.
// Delete all files before the start of the session.
const directoryPathResults = './reports/ui/allure-results' // Specify your target directory
const directoryLogPath = './logs'



// macOS version helper
function getMacOSVersion(darwinVersion: string): string {
  const major = parseInt(darwinVersion.split('.')[0], 10);
  if (major >= 25) return 'macOS Sequoia (15.0)';
  if (major === 24) return 'macOS Sequoia (15.0)';
  if (major === 23) return 'macOS Ventura (13.x)';
  if (major === 22) return 'macOS Monterey (12.x)';
  if (major === 21) return 'macOS Big Sur (11.x)';
  if (major === 20) return 'macOS Catalina (10.15)';
  return `Unknown macOS version (Darwin ${darwinVersion})`;
}

// WebdriverIO config
export const config: Options.Testrunner = {
  runner: 'local',

  specs: featurePaths,
  exclude: [],

  maxInstances: 10,

  capabilities: isAll
      ? [
        {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              ...(isHeadless ? ['--headless', '--disable-gpu'] : []),
              '--disable-blink-features=BlockCredentialedSubresources',
            ],
          },
        },
        {
          browserName: 'firefox',
          'moz:firefoxOptions': {
            args: isHeadless ? ['-headless'] : [],
          },
        },
      ]
      : [
        isFirefox
            ? {
              browserName: 'firefox',
              'moz:firefoxOptions': {
                args: isHeadless ? ['-headless'] : [],
              },
            }
            : {
              browserName: 'chrome',
              'goog:chromeOptions': {
                args: [
                  ...(isHeadless ? ['--headless', '--disable-gpu'] : []),
                  '--disable-blink-features=BlockCredentialedSubresources',
                ],
              },
            },
      ],

  outputDir: './logs',
  logLevel: 'trace',
  logLevels: {
    webdriver: 'trace',
    '@wdio/local-runner': 'trace',
    '@wdio/cli': 'trace',
    '@wdio/cucumber-framework': 'trace'
  },

  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'cucumber',

  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: 'tsconfig.json',
    },
  },

  cucumberOpts: {
    require: [
      path.join(__dirname, '../step-definitions/**/*.ts'),
      path.join(__dirname, '../step-definitions/**/*.js'),
      path.join(__dirname, '../step-definitions/support/**/*.ts')
    ],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: 60000,
    ignoreUndefinedDefinitions: false,
  },

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: allureResultsDir,
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: true
      },
    ],
  ],


  /**
   * Gets executed once before all workers get launched.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: async function (config: object, capabilities: Array<object>) {
    // Helper function to handle directory clean-up and recreation
    const handleDirectory = (directoryPath: string, description: string) => {
      if (fsExtra.existsSync(directoryPath)) {
        try {
          fsExtra.removeSync(directoryPath);
          console.log(chalk.green(`Deleted: ${description} at ${directoryPath}`));
        } catch (err) {
          console.error(`Error deleting ${description} files: ${err}`);
        }
      } else {
        console.log(chalk.green(`Directory ${directoryPath} (${description}) does not exist. No deletion needed.`));
      }

      // Recreate the directory
      try {
        fsExtra.ensureDirSync(directoryPath);
        console.log(chalk.green(`Created: ${description} directory at ${directoryPath}`));
      } catch (err) {
        console.error(`Error creating ${description} directory: ${err}`);
        process.exit(1); // Exit if critical directory creation fails
      }
    };

    // Clean up and recreate allure-results directory
    handleDirectory(directoryPathResults, 'allure-results');

    // Clean up and recreate log directory
    handleDirectory(directoryLogPath, 'logs');

    // Display system information once at the start of the session
    console.log(
        chalk.blue(
            `\nExecuting test automation on a ${process.platform === 'win32' ? 'Windows' : 'MAC/Linux'}, ${process.platform}/${process.arch} architecture.`
        )
    );
  },

  onComplete: async () => {
    const reportError = new Error('Could not generate Allure report');

    return new Promise<void>((resolve, reject) => {
      const generation = allure([
        'generate',
        allureResultsDir,
        '--clean',
        '-o',
        allureReportDir,
      ]);

      generation.on('exit', (exitCode: number) => {
        if (exitCode !== 0) {
          console.error('Allure report generation failed.');
          return reject(reportError);
        }
        console.log(`Allure report successfully generated at ${allureReportDir}`);
        resolve();
      });

      generation.on('error', (err: any) => {
        console.error('Allure process error:', err);
        reject(err);
      });
    });
  },
};
