# The internet is broken

We're trying to test https://the-internet.herokuapp.com/ but, it's going horribly. Goodness gracious, barely any tests are green. Please help us by doing the following:

1. Unzip this repo.
2. Create a new GitHub repo.
3. Push this repo in its broken state to your new repo.
4. Fix as much as you can.
5. Make any changes you feel would make this better.
6. Make a PR against the original.
7. Send us the PR link for review.

## Node JS

The recommended node version is v20.19.3 or v18.20.8
We recommend using nvm to install and manage node versions. It can be found at https://github.com/nvm-sh/nvm.

## Running Tests

| Script                      | Command                         | Description                                                          |
| --------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| **Run default (Chrome)**    | `npm run wdio`                  | Runs tests using default config (Chrome in non-headless mode).       |
| **Run headless (Chrome)**   | `npm run wdio-headless`         | Runs tests in Chrome headless mode. Useful for CI environments.      |
| **Run in Chrome**           | `npm run wdio:chrome`           | Explicitly runs tests in Chrome (non-headless).                      |
| **Run in Chrome headless**  | `npm run wdio:chrome:headless`  | Runs tests in Chrome headless mode.                                  |
| **Run in Firefox**          | `npm run wdio:firefox`          | Runs tests in Firefox (non-headless).                                |
| **Run in Firefox headless** | `npm run wdio:firefox:headless` | Runs tests in Firefox headless mode.                                 |
| **Run all browsers**        | `npm run wdio:all`              | Runs tests in both Chrome and Firefox (non-headless) in parallel.    |
| **Run all headless**        | `npm run wdio:all:headless`     | Runs tests in both Chrome and Firefox headless in parallel (for CI). |

View test execution results in `./reports/ui/allure-report/latest/index.html`
Run specific tests with `npm run wdio -- --cucumberOpts.tagExpression="@TAG"`


