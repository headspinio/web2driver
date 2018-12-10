import WDCore from 'webdriver';
import Session from './session';
import { cloneDeep } from 'lodash';

export default class Web2Driver {

  static async remote ({
    protocol = "http",
    hostname = "0.0.0.0",
    port = 4444,
    path = "/wd/hub",
  },
    capabilities = {}
  ) {
    // force w3c style caps until wdio does this more elegantly
    if (!capabilities.alwaysMatch) {
      capabilities = {
        alwaysMatch: cloneDeep(capabilities),
        firstMatch: [{}],
      };
    }
    const params = {protocol, hostname, port, path, capabilities};
    let sessionClient = await WDCore.newSession(params);
    return new Session(sessionClient);
  }
}
