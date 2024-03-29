import { includes, keys, toPairs } from 'lodash';
import logger from '@wdio/logger';
import { ELEMENT_CMDS, getElementFromResponse } from './element';
import WebDriverProtocol from '@wdio/protocols/protocols/webdriver.json';
import JsonWProtocol from '@wdio/protocols/protocols/jsonwp.json';
import MJsonWProtocol from '@wdio/protocols/protocols/mjsonwp.json';
import AppiumProtocol from '@wdio/protocols/protocols/appium.json';
import { DEFAULTS } from './driver';

const log = logger('web2driver');

const DIRECT_CONNECT_PREFIX = 'directConnect';
let DIRECT_CONNECT_CAPS = ['Protocol', 'Host', 'Port', 'Path'];
DIRECT_CONNECT_CAPS = DIRECT_CONNECT_CAPS.map(c => `${DIRECT_CONNECT_PREFIX}${c}`);
const PREFIXED_DIRECT_CAPS = DIRECT_CONNECT_CAPS.map(c => `appium:${c}`);

export default class Session {

  constructor (wdSessionClient, logLevel = DEFAULTS.logLevel) {
    this.client = wdSessionClient;
    log.setLevel && log.setLevel(logLevel);
  }

  async cmd (commandName, ...args) {
    const res = await this.client[commandName](...args);
    if (res && res.error) {
      throw new Error(res.message ? res.message : res.error);
    }
    return res;
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
    const res = await this.cmd('findElement', using, value);
    return getElementFromResponse(res, this);
  }

  async findElements (using, value) {
    const ress = await this.cmd('findElements', using, value);
    return ress.map(res => getElementFromResponse(res, this));
  }

  async waitForElement (ms, using, value) {
    let el = null;
    const start = Date.now();
    const end = start + ms;
    while (el === null && Date.now() < end) {
      try {
        el = await this.findElement(using, value);
      } catch (ign) {}
    }

    if (el) {
      return el;
    }

    throw new Error(`Could not find element using strategy ${using} and value '${value}' after ${ms}ms`);
  }

  async waitForElements (ms, using, value) {
    let els = [];
    const start = Date.now();
    const end = start + ms;
    while (els.length === 0 && Date.now() < end) {
      els = await this.findElements(using, value);
    }

    if (els.length) {
      return els;
    }

    throw new Error(`Could not find any elements using strategy ${using} and value '${value}' after ${ms}ms`);
  }

  async executeBase (cmd, script, args) {
    args = args.map((a) => {
      if (a.__is_w2d_element) {
        return a.executeObj;
      }
      return a;
    });
    return await this.cmd(cmd, script, args);
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
        return await this.cmd(cmdData.command, ...args);
      }
    }
  }
}
