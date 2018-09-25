export default class Session {

  constructor (wdSessionClient) {
    this.client = wdSessionClient;
  }

  async quit () {
    await this.client.deleteSession();
  }

  async getContexts () {
    return this.client.getContexts();
  }
}
