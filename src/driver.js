import WDCore from 'webdriver';
import Session from './session';

export default class Web2Driver {

  static async remote ({
    protocol = "http",
    hostname = "0.0.0.0",
    port = 4444,
    path = "/wd/hub",
  },
    capabilities = {}
  ) {
    const params = {protocol, hostname, port, path, capabilities};
    let sessionClient = await WDCore.newSession(params);
    return new Session(sessionClient);
  }
}
