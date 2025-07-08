// import { $ } from "@wdio/globals";
// import Page from "./page.js";

class BasicAuthPage {
  get message() {
    return $(".example > p");
  }
  async login(username, password) {
    await this.open(username, password);
  }
  open(username, password) {
    const fullUrl = `https://${username}:${password}@the-internet.herokuapp.com/basic_auth`;
    return browser.url(fullUrl);
  }
}

export default new BasicAuthPage();
