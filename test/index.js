import Web2Driver from '../src';

const MOCHA_TIMEOUT = 60000;

const SERVER = "127.0.0.1";
const PORT = 4444;
const CAPS = {
  platformName: "iOS",
  platformVersion: "11.4",
  deviceName: "iPhone 8",
  browserName: "Safari"
};

mocha.setup({timeout: MOCHA_TIMEOUT});

describe('Web2Driver', function () {
  it('should exist', function () {
    new Web2Driver();
  });

  it('should start and stop a session', async function () {
    const driver = await Web2Driver.remote({
      hostname: SERVER,
      port: PORT,
    }, CAPS);
    await driver.quit();
  });
});
