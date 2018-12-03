import Web2Driver from '../src';
import chai from 'chai';
import should from 'should';

chai.use(should);

const MOCHA_TIMEOUT = 60000;
const INIT_TIMEOUT = 120000;

const SERVER = "127.0.0.1";
const PORT = 4723;
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
    this.timeout(INIT_TIMEOUT);

    driver = await Web2Driver.remote({
      hostname: SERVER,
      port: PORT,
    }, CAPS);

    await driver.navigateTo("http://localhost:8080/test/fixture.html");
  });

  after(async function () {
    await driver.quit();
  });

  it('should store the session id', function () {
    driver.sessionId.should.be.a.string;
  });

  it('should be able to use jsonwp commands', async function () {
    should.exist((await driver.status()).build);
    should.exist(await driver.getSession());
    await driver.setImplicitTimeout(1000);
  });

  it('should be able to use mjsonwp commands', async function () {
    const ctxs = await driver.getContexts();
    ctxs.length.should.eql(2);
  });

  it('should be able to find elements and do stuff to them', async function () {
    const el = await driver.findElement('id', 'header');
    (await el.getText()).should.eql('This is a header');
  });

  it('should be able to find multiple elements', async function () {
    const els = await driver.findElements('id', 'header');
    (await els[0].getText()).should.eql('This is a header');
  });

  it('should be able to find an element from an element', async function () {
    const el = await driver.findElement('id', 'outerDiv');
    const el2 = await el.findElement('tag name', 'div');
    (await el2.getText()).should.eql('This is an inner div');
  });

  it('should be able to find multiple elements from an element', async function () {
    const el = await driver.findElement('id', 'outerDiv');
    const ps = await el.findElements('tag name', 'p');
    const validTexts = ['This is an outer div', 'This is an inner div'];
    for (const p of ps) {
      validTexts.should.containEql(await p.getText());
    }
  });

  it('should serialize elements for use in executeScript', async function () {
    const el = await driver.findElement('id', 'innerDiv');
    const p = await el.findElement('tag name', 'p');
    const res = await driver.executeScript("return arguments[0].innerHTML;", [p]);
    res.should.eql('This is an inner div');
  });
});
