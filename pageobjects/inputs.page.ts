import Commands from "../helpers/ui/Commands.js";

class InputsPage {
  get elements() {
    return {
      header: () => browser.$("h3"),
      input: () => browser.$('input[type="number"]'),
    };
  }

  async set(value: string | number): Promise<void> {
    const input = await this.elements.input();
    await Commands.setText(input, String(value)); // Convert to string explicitly
  }

  async increment(times = 1): Promise<void> {
    const input = await this.elements.input();
    await input.click();
    for (let i = 0; i < times; i++) {
      await browser.keys("ArrowUp");
    }
  }

  async decrement(times = 1): Promise<void> {
    const input = await this.elements.input();
    await input.click();
    for (let i = 0; i < times; i++) {
      await browser.keys("ArrowDown");
    }
  }

  async getValue(): Promise<string> {
    return (await this.elements.input()).getValue();
  }
}

export default new InputsPage();
