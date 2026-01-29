const BaseXform = require('../base-xform');

// Color encapsulates translation from color model to/from xlsx
class ColorXform extends BaseXform {
  constructor(name) {
    super();

    // this.name controls the xm node name
    this.name = name || 'color';
  }

  get tag() {
    return this.name;
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.openNode(this.name);
      if (model.argb) {
        xmlStream.addAttribute('rgb', model.argb);
      } else if (model.theme !== undefined) {
        xmlStream.addAttribute('theme', model.theme);
        if (model.tint !== undefined) {
          xmlStream.addAttribute('tint', model.tint);
        }
      } else if (model.indexed !== undefined) {
        xmlStream.addAttribute('indexed', model.indexed);
      } else if (model.auto !== undefined) {
        xmlStream.addAttribute('auto', model.auto ? '1' : '0');
      } else {
        xmlStream.addAttribute('auto', '1');
      }
      xmlStream.closeNode();
      return true;
    }
    return false;
  }

  parseOpen(node) {
    if (node.name === this.name) {
      if (node.attributes.rgb) {
        this.model = {argb: node.attributes.rgb};
      } else if (node.attributes.theme) {
        this.model = {theme: parseInt(node.attributes.theme, 10)};
        if (node.attributes.tint) {
          this.model.tint = parseFloat(node.attributes.tint);
        }
      } else if (node.attributes.indexed) {
        this.model = {indexed: parseInt(node.attributes.indexed, 10)};
      } else if (node.attributes.auto !== undefined) {
        // Excel commonly uses "1"/"0" but accept "true"/"false" too
        const v = String(node.attributes.auto).toLowerCase();
        this.model = {auto: v === '1' || v === 'true'};
      } else {
        this.model = undefined;
      }
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = ColorXform;
