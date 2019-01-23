import { sum, includes } from 'lodash';
import logger from '@wdio/logger';
import UIElement, { ELEMENT_CMDS, getElementFromResponse } from './element';
import { keys, toPairs } from 'lodash';
import WebDriverProtocol from 'webdriver/protocol/webdriver.json';
import JsonWProtocol from 'webdriver/protocol/jsonwp.json';
import MJsonWProtocol from 'webdriver/protocol/mjsonwp.json';
import AppiumProtocol from 'webdriver/protocol/appium.json';

const log = logger('web2driver');

const DIRECT_CONNECT_PREFIX = 'directConnect';
let DIRECT_CONNECT_CAPS = ['Protocol', 'Host', 'Port', 'Path'];
DIRECT_CONNECT_CAPS = DIRECT_CONNECT_CAPS.map(c => `${DIRECT_CONNECT_PREFIX}${c}`);
const PREFIXED_DIRECT_CAPS = DIRECT_CONNECT_CAPS.map(c => `appium:${c}`);

export default class Session {

  constructor (wdSessionClient) {
    this.client = wdSessionClient;
    this.updateConnectionDetails();
  }

  updateConnectionDetails () {
    // if the remote end has given us a direct url to use different than the
    // one we used to instantiate the session, make sure we use that instead
    const receivedCaps = this.client.options.capabilities;
    const directCapsPresent = Object.keys(receivedCaps)
      .filter(c => includes(DIRECT_CONNECT_CAPS, c));
    const prefixedCapsPresent = Object.keys(receivedCaps)
      .filter(c => includes(PREFIXED_DIRECT_CAPS, c));
    const usePrefixedCaps = prefixedCapsPresent.length > directCapsPresent;
    const directCapsToUse = usePrefixedCaps ? prefixedCapsPresent : directCapsPresent;
    if (directCapsToUse.length > 0) {
      if (directCapsToUse.length < DIRECT_CONNECT_CAPS.length) {
        log.warn(
          `Direct connect caps were used, but not all were present. ` +
          `Required caps are: ${JSON.stringify(DIRECT_CONNECT_CAPS)}. Caps ` +
          `received were: ${JSON.stringify(directCapsPresent)}. Will use ` +
          `original server information.`
        );
        return;
      }
      log.info(`Direct connect caps were provided, will send subsequent requests to new host`);
      const prefix = usePrefixedCaps ?
        `appium:${DIRECT_CONNECT_PREFIX}` :
        DIRECT_CONNECT_PREFIX;
      this.client.options.protocol = receivedCaps[`${prefix}Protocol`];
      this.client.options.hostname = receivedCaps[`${prefix}Host`];
      this.client.options.port = receivedCaps[`${prefix}Port`];
      this.client.options.path = receivedCaps[`${prefix}Path`];
    }
  }

  get connectedUrl () {
    const {protocol, hostname, port, path} = this.client.options;
    return `${protocol}://${hostname}:${port}${path}`;
  }

  get sessionId () {
    return this.client.sessionId;
  }

  get capabilities () {
    return this.client.options.capabilities;
  }

  async findElement (using, value) {
    const res = await this.client.findElement(using, value);
    return getElementFromResponse(res, this);
  }

  async findElements (using, value) {
    const ress = await this.client.findElements(using, value);
    return ress.map(res => getElementFromResponse(res, this));
  }

  async executeBase (cmd, script, args) {
    args = args.map((a) => {
      if (a.__is_w2d_element) {
        return a.executeObj;
      }
      return a;
    });
    return await this.client[cmd](script, args);
  }

  async executeScript (script, args) {
    return await this.executeBase('executeScript', script, args);
  }

  async executeAsyncScript (script, args) {
    return await this.executeBase('executeAsyncScript', script, args);
  }
}

const AVOID_CMDS = [
  "newSession",
  "findElement",
  "findElements",
  "findElementFromElement",
  "findElementsFromElement",
  "executeScript",
  "executeAsyncScript",
];

const ALIAS_CMDS = {
  deleteSession: "quit"
}

// here we walk through the protocol specification from the webdriver package
// and simply put all the methods on Session (except for element methods and
// edge cases)

for (const proto of [WebDriverProtocol, JsonWProtocol, MJsonWProtocol, AppiumProtocol]) {
  for (const [route, methods] of toPairs(proto)) {
    for (const [method, cmdData] of toPairs(methods)) {
      // if we've explicitly asked not to include the command, skip it
      if (AVOID_CMDS.includes(cmdData.command)) {
        continue;
      }

      // likewise skip element commands; those are handled by element.js
      if (keys(ELEMENT_CMDS).includes(cmdData.command)) {
        continue;
      }

      // give the command a new name if we so desire
      const cmdName = keys(ALIAS_CMDS).includes(cmdData.command) ?
                      ALIAS_CMDS[cmdData.command] :
                      cmdData.command;

      Session.prototype[cmdName] = async function (...args) {
        return await this.client[cmdData.command](...args);
      }
    }
  }
}
