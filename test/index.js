import Web2Driver from '../src';
import chai from 'chai';
import should from 'should';

chai.use(should);

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

  let driver;

  before(async function () {
    driver = await Web2Driver.remote({
      hostname: SERVER,
      port: PORT,
    }, CAPS);
  });

  after(async function () {
    await driver.quit();
  });

  it('should be able to use mjsonwp commands', async function () {
    const ctxs = await driver.getContexts();
    ctxs.length.should.eql(2);
  });
});
