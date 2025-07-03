import { browser } from "@wdio/globals";

/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export default class Page {
  get paths() {
    return {
      "Basic Auth": "basic_auth",
      Checkboxes: "checkboxes",
      Dropdown: "dropdown",
      inputs: "inputs",

      "A/B Testing": "abtest",
      "Add/Remove Elements": "add_remove_elements/",
      "Broken Images": "broken_images",
      "Challenging DOM": "challenging_dom",
      "Context Menu": "context_menu",
      "Digest Authentication": "digest_auth",
      "Disappearing Elements": "disappearing_elements",
      "Drag and Drop": "drag_and_drop",
      "Dynamic Content": "dynamic_content",
      "Dynamic Controls": "dynamic_controls",
      "Dynamic Loading": "dynamic_loading",
      "Entry Ad": "entry_ad",
      "Exit Intent": "exit_intent",
      "File Download": "download",
      "File Upload": "upload",
      "Floating Menu": "floating_menu",
      "Forgot Password": "forgot_password",
      "Form Authentication": "login",
      Frames: "frames",
      Geolocation: "geolocation",
      "Horizontal Slider": "horizontal_slider",
      Hovers: "hovers",
      "Infinite Scroll": "infinite_scroll",
      "JQuery UI Menus": "jqueryui/menu",
      "JavaScript Alerts": "javascript_alerts",
      "JavaScript onload event error": "javascript_error",
      "Key Presses": "key_presses",
      "Large & Deep DOM": "large",
      "Multiple Windows": "windows",
      "Nested Frames": "nested_frames",
      "Notification Messages": "notification_message",
      "Redirect Link": "redirector",
      "Secure File Download": "download_secure",
      "Shadow DOM": "shadowdom",
      "Shifting Content": "shifting_content",
      "Slow Resources": "slow",
      "Sortable Data Tables": "tables",
      "Status Codes": "status_codes",
      Typos: "typos",
      "WYSIWYG Editor": "tinymce",
    };
  }

  get base() {
    return `https://the-internet.herokuapp.com`;
  }

  async click(name) {
    const anchor = await $(`a[href="/${this.paths[name]}"]`);
    await anchor.click();
  }

  /**
   * Opens a sub page of the page
   * @param path path of the sub page (e.g. /path/to/page.html)
   */
  open(path = "") {
    if (path in this.paths) return this.open(this.paths[path]);
    return browser.url(`${this.base}/${path}`);
  }
}
