class CheckboxesPage {
  get elements() {
    return {
      header: () => $("h3"),
      checkbox: (num) => $(`#checkboxes input:nth-of-type(${num})`),
    };
  }

  async select(num) {
    const checkbox = await this.elements.checkbox(num);
    await checkbox.waitForExist({ timeout: 3000 });
    await checkbox.scrollIntoView();

    const isBefore = await checkbox.isSelected();
    console.log(`🔍 Checkbox ${num} selected before click: ${isBefore}`);

    if (!isBefore) {
      await checkbox.click();
    } else {
    }
    const isAfter = await checkbox.isSelected();
  }

}
  export default new CheckboxesPage();
