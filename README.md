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

## Core API

TBD. Web2Driver uses the WebDriverIO's [base protocol layer](https://github.com/webdriverio/webdriverio/blob/master/packages/webdriver/protocol) basically without change, so command names are the same as are listed in the various available protocols.

## Additional Features

### Explicit Waits

You can wait for an element up to a timeout in milliseconds:

```js
const el = await driver.waitForElement(10000, 'accessibility id', 'foo');
```

There is also the ability to wait for multiple elements (which will retry until the list of elements is non-empty, and throw after the timeout if it's still empty):

```js
const els = await driver.waitForElements(10000, 'class name', 'android.widget.EditText');
```

### Direct Connect URLs

If your Selenium/Appium server decorates the new session capabilities response with the following keys:

* `directConnectProtocol`
* `directConnectHost`
* `directConnectPort`
* `directConnectPath`

Then web2driver will switch its endpoint to the one specified by the values of those keys. This is useful for load-balanced servers to be a single point of entry for starting sessions, but to reply with more detailed information that allows web2driver to speak directly to the host running the session.

### Attach to Session

If you have an existing session ID corresponding to a session running on a host, you can attach to it:

```js
import Web2Driver from 'web2driver';

async function automation() {
    const serverOpts = {hostname: "localhost", port: 4723}; // same opts as in the basic example
    const sessionId = "1234567890134"; // we would get this externally somehow

    // attach to a session
    const driver = await Web2Driver.attachToSession(sessionId, serverOpts);

    // now we can do stuff with the session

    // we could also pass in whether or not the session is or isn't W3C (default is true):
    const driver = await Web2Driver.attachToSession(sessionId, serverOpts, false);

    // we could also pass in capabilities to store them on the session
    const driver = await Web2Driver.attachToSession(sessionId, serverOpts, false, {browserName: 'foo'});
}
```

### Other Webdriver Params

Since web2driver is based on [WebdriverIO's core library](https://github.com/webdriverio/webdriverio/tree/master/packages/webdriver), many [WebdriverIO options](https://webdriver.io/docs/options.html) also work with web2driver (for example, you could set `connectionRetryCount` to `0` to disable connection retries):

```js
import Web2Driver from 'web2driver';

async function automation() {
    const serverOpts = {hostname: "localhost", port: 4723, connectionRetryCount: 0};
    const capabilities = {browserName: "Safari"}; //...

    // initialize a session
    const driver = await Web2Driver.remote(serverOpts, capabilities);
}
```

## Dev / Test

```bash
npm run build # use webpack to build the JS
npm run build-test # build the test bundle
npm run test-server # build the test bundle and host it using webpack-dev-server
npm run test-open # open up the test bundle in a browser, causing the tests to launch
```

At the moment, tests assume an Appium server running on port 4723, with iOS support (so running on a Mac).

## Credits

[![][headspin-wordmark]](https://headspin.io)

`web2driver` is maintained by [HeadSpin](https://headspin.io). HeadSpin is the next generation global platform for mobile app testing and monitoring.


[headspin-wordmark]: docs/images/headspin-wordmark.png "HeadSpin"
