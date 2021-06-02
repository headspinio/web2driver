import Web2Driver from '../index';
import chai from 'chai';
import should from 'should';

chai.use(should);

const MOCHA_TIMEOUT = 60000;
const INIT_TIMEOUT = 120000;

const SERVER = "127.0.0.1";
const PORT = 4723;
const CAPS = {
  platformName: "iOS",
  browserName: "Safari",
  'appium:platformVersion': "14.4",
  'appium:deviceName': "iPhone 11",
  'appium:automationName': "XCUITest",
};

const TEST_URL = "http://localhost:1234/fixture.html";

if (typeof mocha !== 'undefined') {
  mocha.setup({timeout: MOCHA_TIMEOUT});
}

describe('Web2Driver', function () {

  let driver;

  before(async function () {
    this.timeout(INIT_TIMEOUT);

    driver = await Web2Driver.remote({
      hostname: SERVER,
      port: PORT,
      path: '/',
    }, CAPS);

    await driver.navigateTo(TEST_URL);
  });

  after(async function () {
    await driver.quit();
  });

  it('should store the session id', function () {
    driver.sessionId.should.be.a.string;
  });

  it('should have capabilities from the session', function () {
    driver.capabilities.should.be.a.object;
    driver.capabilities.platformName.should.eql('iOS');
  });

  it('should not be able to use jsonwp commands', async function () {
    should.not.exist(driver.setImplicitWaitTimeout);
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

  it('should be able to run w3c actions', async function () {
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: {pointerType: 'touch'},
      actions: [
        {type: 'pointerMove', duration: 0, x: 500, y: 500},
        {type: 'pointerDown', button: 0},
        {type: 'pause', duration: 200},
        {type: 'pointerUp', button: 0},
      ]
    }]);
  });

  it('should be able to send keys', async function () {
    const ctx = await driver.getContext();
    await driver.switchContext('NATIVE_APP');
    try {
      let el = await driver.waitForElement(1000, 'accessibility id', 'URL');
      await el.click();
      el = await driver.waitForElement(1000, 'accessibility id', 'URL');
      (await el.getText()).should.not.eql('foo');
      await el.sendKeys("foo");
      (await el.getText()).should.eql('foo');
    } finally {
      await driver.switchContext(ctx);
    }
  });

  it('should respect implicit wait timeout', async function () {
    let start = Date.now();
    try {
      await driver.findElement('id', 'doesnotexist');
    } catch (ign) {}
    (Date.now() - start).should.be.below(1000);
    await driver.setTimeouts(2000);
    start = Date.now();
    try {
      await driver.findElement('id', 'doesnotexist');
    } catch (ign) {}
    (Date.now() - start).should.be.above(1900);
  });

  it('should be able to explicitly wait for an element', async function () {
    await driver.waitForElement(2000, 'id', 'innerDiv');
  });

  it('should throw an error after timeout for explicit wait', async function () {
    let start = Date.now();
    try {
      await driver.waitForElement(2000, 'id', 'doesnotexist');
    } catch (ign) {}
    (Date.now() - start).should.be.above(2000);
  });

  it('should be able to explicitly wait for multiple elements', async function () {
    (await driver.waitForElements(2000, 'id', 'innerDiv')).should.have.length(1);
  });

  it('should throw an error after timeout for explicit wait, even for multiple elements', async function () {
    let start = Date.now();
    try {
      await driver.waitForElements(2000, 'id', 'doesnotexist');
    } catch (ign) {}
    (Date.now() - start).should.be.above(2000);
  });

  it('should be able to attach to an existing session', async function () {
    const driver2 = await Web2Driver.attachToSession(driver.sessionId, {
      hostname: SERVER,
      port: PORT,
      path: '/',
    });
    (await driver2.getUrl()).should.eql(TEST_URL);
  });

});

describe('Web2Driver - Direct Connect', function () {

  let driver = null;

  before(function () {
    this.timeout(INIT_TIMEOUT);
  });

  it('should attempt to use new connection details in response capabilities - failure scenario', async function () {
    driver = await Web2Driver.remote({
      hostname: SERVER,
      port: PORT,
      path: '/',
    }, Object.assign({}, CAPS, {
      'appium:directConnectProtocol': 'http',
      'appium:directConnectHost': SERVER,
      'appium:directConnectPort': 4724,
      'appium:directConnectPath': '/w2d/hub',
    }));

    let err;
    try {
      await driver.navigateTo("http://localhost:8080/test/fixture.html");
    } catch (e) {
      err = e;
    }
    driver.connectedUrl.should.eql(`http://${SERVER}:4724/w2d/hub`);
    err.message.should.match(/(NetworkError|ECONNREFUSED)/);
  });

  it('should attempt to use new connection details in response capabilities - unprefixed caps', async function () {
    driver = await Web2Driver.remote({
      hostname: SERVER,
      port: PORT,
      path: '/',
    }, Object.assign({}, CAPS, {
      'appium:directConnectProtocol': 'http',
      'appium:directConnectHost': SERVER,
      'appium:directConnectPort': 4724,
      'appium:directConnectPath': '/w2d/hub',
    }));

    let err;
    try {
      await driver.navigateTo("http://localhost:8080/test/fixture.html");
    } catch (e) {
      err = e;
    }
    driver.connectedUrl.should.eql(`http://${SERVER}:4724/w2d/hub`);
    err.message.should.match(/(NetworkError|ECONNREFUSED)/);
  });

  it('should not use direct connection caps if they are not all present', async function () {
    driver = await Web2Driver.remote({
      hostname: SERVER,
      port: PORT,
      path: '/',
    }, Object.assign({}, CAPS, {
      'appium:directConnectPort': PORT + 1,
    }));

    await driver.navigateTo("http://localhost:8080/test/fixture.html");
    driver.connectedUrl.should.eql(`http://${SERVER}:${PORT}/`);
  });

  it('should attempt to use new connection details in response capabilities - success scenario', async function () {
    driver = await Web2Driver.remote({
      hostname: SERVER,
      port: PORT,
      path: '/',
    }, Object.assign({}, CAPS, {
      'appium:directConnectProtocol': 'http',
      'appium:directConnectHost': SERVER,
      'appium:directConnectPort': PORT,
      'appium:directConnectPath': '',
    }));

    await driver.navigateTo("http://localhost:8080/test/fixture.html");
    driver.connectedUrl.should.eql(`http://${SERVER}:${PORT}`);
  });

  after(async function () {
    if (driver) {
      driver.client.options.port = PORT; // fix things so we can quit
      await driver.quit();
    }
  });
});
