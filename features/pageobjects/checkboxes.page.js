class CheckboxesPage {
  get elements() {
    return {
      header: () => $("h3"),
      checkbox: (num) => $(`input:nth-child(${num})`),
    };
  }

  async select(num) {
    const checkbox = await this.elements.checkbox(num);
    await checkbox.click();
  }
}

export default new CheckboxesPage();
