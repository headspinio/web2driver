# web2driver

A pure-JS webdriver client that runs in the browser. Since it runs in the browser it depends on XHR requests to speak to the automation server. Because of CORS, the automation server must send the appropriate access control headers for requests from web2driver to the automation server to work. Appium does this by default, but Selenium does not.

This means that, unless you put a proxy in front of Selenium, web2driver currently works only with Appium.

## Install

On npm as the `web2driver` package, but bundled and exported for importing into browsers. Use webpack or some other tool to incorporate it into your app.

## Usage

First, get your Appium server up and running on a host and port that you know. Then, use Web2Driver to initiate sessions on that server and do automation with those sessions.

```js
import Web2Driver from 'web2driver';

async function automation() {
    const serverOpts = {hostname: "localhost", port: 4723};
    // we could also specify 'protocol' and 'path', which default to
    // 'http' and '/wd/hub' respectively

    const capabilities = {browserName: "Safari"}; //...

    // initialize a session
    const driver = await Web2Driver.remote(serverOpts, capabilities);

    // do stuff with a session
    const el = await driver.findElement('xpath', '//foo');
    await el.click();
    // ...

    // end the session
    await driver.quit();
}
```

## API

TBD. Web2Driver uses the WebDriverIO's [base protocol layer](https://github.com/webdriverio/webdriverio/blob/master/packages/webdriver/protocol) basically without change, so command names are the same as are listed in the various available protocols.

## Dev / Test

```bash
npm run build # use webpack to build the JS
npm run build-test # build the test bundle
npm run test-server # build the test bundle and host it using webpack-dev-server
npm run test-open # open up the test bundle in a browser, causing the tests to launch
```

At the moment, tests assume an Appium server running on port 4723, with iOS support (so running on a Mac).
