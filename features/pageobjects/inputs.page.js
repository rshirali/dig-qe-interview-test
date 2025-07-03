class DropdownPage {
  get elements() {
    return {
      header: () => $("h3"),
      input: () => $("/html/body/div[2]/div/div/div/div/input"),
    };
  }

  async set(value) {
    await (await this.elements.input()).setValue(value);
  }
}

export default new DropdownPage();
