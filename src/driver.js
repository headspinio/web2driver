import WDCore from 'webdriver';
import Session from './session';
import { cloneDeep } from 'lodash';

const DEFAULTS = {
  protocol: "http",
  hostname: "0.0.0.0",
  port: 4444,
  path: "/wd/hub",
};

export default class Web2Driver {

  static async remote ({
    protocol = DEFAULTS.protocol,
    hostname = DEFAULTS.hostname,
    port = DEFAULTS.port,
    path = DEFAULTS.path,
    ...otherParams
  },
    capabilities = {}
  ) {
    const params = {protocol, hostname, port, path, capabilities, ...otherParams};
    const sessionClient = await WDCore.newSession(params);
    return new Session(sessionClient);
  }

  static async attachToSession (sessionId, {
    protocol = DEFAULTS.protocol,
    hostname = DEFAULTS.hostname,
    port = DEFAULTS.port,
    path = DEFAULTS.path,
    ...otherParams
  }, capabilities = {}, isW3C = true) {
    if (!sessionId) {
      throw new Error("Can't attach to a session without a session id");
    }
    const params = {sessionId, isW3C, protocol, hostname, port, path, capabilities, ...otherParams};
    const sessionClient = await WDCore.attachToSession(params);
    return new Session(sessionClient);
  }
}
