import { toPairs } from 'lodash';

const W3C_ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf'
const JWP_ELEMENT_KEY = 'ELEMENT';

export default class UIElement {
  constructor (elementKey, findRes, parent) {
    this.elementKey = elementKey;
    this.elementId = this[elementKey] = findRes[elementKey];
    this.__is_w2d_element = true;
    this.parent = parent;
    this.session = parent.session || parent;
  }

  get executeObj () {
    return {[this.elementKey]: this.elementId};
  }

  async findElement (using, value) {
    const res = await this.session.cmd('findElementFromElement', this.elementId, using, value);
    return getElementFromResponse(res, this);
  }

  async findElements (using, value) {
    const ress = await this.session.cmd('findElementsFromElement', this.elementId, using, value);
    return ress.map(res => getElementFromResponse(res, this));
  }
}


function getElementFromResponse (res, parent) {
  let elementKey;
  if (res[W3C_ELEMENT_KEY])  {
    elementKey = W3C_ELEMENT_KEY;
  } else {
    elementKey = JWP_ELEMENT_KEY;
  }

  if (!res[elementKey]) {
    throw new Error(`Bad findElement response; did not have element key. ` +
                    `Response was: ${JSON.stringify(res)}`);
  }

  return new UIElement(elementKey, res, parent);
}

const ELEMENT_CMDS = {
  isElementSelected: "isSelected",
  isElementDisplayed: "isDisplayed",
  getElementAttribute: "getAttribute",
  getElementCSSValue: "getCSSValue",
  getElementText: "getText",
  getElementTagName: "getTagName",
  getElementLocation: "getLocation",
  getElementLocationInView: "getLocationInView",
  getElementProperty: "getProperty",
  getElementRect: "getRect",
  getElementSize: "getSize",
  getElementEnabled: "getEnabled",
  elementClick: "click",
  elementSubmit: "submit",
  elementClear: "clear",
  elementSendKeys: "sendKeys",
  takeElementScreenshot: "takeScreenshot",
};

for (const [protoCmd, newCmd] of toPairs(ELEMENT_CMDS)) {
  UIElement.prototype[newCmd] = async function (...args) {
    return await this.session.cmd(protoCmd, this.elementId, ...args);
  }
}

export { ELEMENT_CMDS, W3C_ELEMENT_KEY, JWP_ELEMENT_KEY, getElementFromResponse };
