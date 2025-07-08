class DropdownPage {
  get elements() {
    return {
      dropdown: () => $('select#dropdown'),
      selectedOption: () => $('option[selected="selected"]'),
    };
  }

  async open() {
    await browser.url('/dropdown');
  }

  async select(optionText) {
    const dropdown = await this.elements.dropdown();
    await dropdown.selectByVisibleText(optionText);
  }

  async selectedOptionText() {
    const selected = await this.elements.selectedOption();
    return await selected.getText();
  }

}

export default new DropdownPage();
