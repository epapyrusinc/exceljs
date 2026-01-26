const BaseXform = require('../base-xform');

const ThemeElementsXform = require('./theme-elements-xform');
const XmlNodeXform = require('./xml-node-xform');

/**
 * Parses DrawingML theme part `a:theme` (CT_OfficeStyleSheet).
 *
 * This is intentionally read-focused. ExcelJS still round-trips themes via raw XML.
 */
class ThemeXform extends BaseXform {
  constructor() {
    super();
    this.map = {
      'a:themeElements': new ThemeElementsXform(),
    };
  }

  get tag() {
    return 'a:theme';
  }

  reset() {
    super.reset();
    this.parser = null;
    this._currentProp = null;
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    switch (node.name) {
      case 'a:theme':
        this.reset();
        this.model = {
          name: node.attributes && node.attributes.name,
        };
        return true;

      case 'a:themeElements':
        this.parser = this.map['a:themeElements'];
        this._currentProp = 'themeElements';
        this.parser.parseOpen(node);
        return true;

      case 'a:objectDefaults':
        this.parser = new XmlNodeXform('a:objectDefaults');
        this._currentProp = 'objectDefaults';
        this.parser.parseOpen(node);
        return true;

      case 'a:extraClrSchemeLst':
        this.parser = new XmlNodeXform('a:extraClrSchemeLst');
        this._currentProp = 'extraClrSchemeLst';
        this.parser.parseOpen(node);
        return true;

      case 'a:custClrLst':
        this.parser = new XmlNodeXform('a:custClrLst');
        this._currentProp = 'custClrLst';
        this.parser.parseOpen(node);
        return true;

      case 'a:extLst':
        this.parser = new XmlNodeXform('a:extLst');
        this._currentProp = 'extLst';
        this.parser.parseOpen(node);
        return true;

      default:
        return true;
    }
  }

  parseText(text) {
    if (this.parser) this.parser.parseText(text);
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        if (this._currentProp) {
          this.model[this._currentProp] = this.parser.model;
        }
        this.parser = null;
        this._currentProp = null;
      }
      return true;
    }

    switch (name) {
      case 'a:theme':
        return false;
      default:
        return true;
    }
  }
}

module.exports = ThemeXform;
