class DropdownPage {
  get elements() {
    return {
      header: () => $("h3"),
      dropdown: () => $("select#dropdown"),
      selectedOption: () => $('option[selected="selected"]'),
    };
  }

  async select(option) {
    const dropdown = await this.elements.dropdown();
    await dropdown.selectByVisibleText(option);
  }

  async selectedOptionText() {
    const selectedOption = await this.elements.selectedOption();
    return await selectedOption.getText();
  }
}

export default new DropdownPage();
