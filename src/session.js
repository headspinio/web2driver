import UIElement, { ELEMENT_CMDS, getElementFromResponse } from './element';
import { keys, toPairs } from 'lodash';
import WebDriverProtocol from 'webdriver/protocol/webdriver.json';
import JsonWProtocol from 'webdriver/protocol/jsonwp.json';
import MJsonWProtocol from 'webdriver/protocol/mjsonwp.json';
import AppiumProtocol from 'webdriver/protocol/appium.json';

export default class Session {

  constructor (wdSessionClient) {
    this.client = wdSessionClient;
  }

  get sessionId () {
    return this.client.sessionId;
  }

  async findElement (using, value) {
    const res = await this.client.findElement(using, value);
    return getElementFromResponse(res, this);
  }

  async findElements (using, value) {
    const ress = await this.client.findElements(using, value);
    return ress.map(res => getElementFromResponse(res, this));
  }
}

const AVOID_CMDS = [
  "newSession",
  "findElement",
  "findElements",
  "findElementFromElement",
  "findElementsFromElement",
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
