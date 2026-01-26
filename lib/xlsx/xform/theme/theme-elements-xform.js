const BaseXform = require('../base-xform');

const ClrSchemeXform = require('./clr-scheme-xform');
const FontSchemeXform = require('./font-scheme-xform');
const XmlNodeXform = require('./xml-node-xform');

class ThemeElementsXform extends BaseXform {
  constructor() {
    super();
    this.map = {
      'a:clrScheme': new ClrSchemeXform(),
      'a:fontScheme': new FontSchemeXform(),
    };
  }

  get tag() {
    return 'a:themeElements';
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
      case 'a:themeElements':
        this.reset();
        this.model = {};
        return true;

      case 'a:clrScheme':
        this.parser = this.map['a:clrScheme'];
        this._currentProp = 'clrScheme';
        this.parser.parseOpen(node);
        return true;

      case 'a:fontScheme':
        this.parser = this.map['a:fontScheme'];
        this._currentProp = 'fontScheme';
        this.parser.parseOpen(node);
        return true;

      case 'a:fmtScheme':
        this.parser = new XmlNodeXform('a:fmtScheme');
        this._currentProp = 'fmtScheme';
        this.parser.parseOpen(node);
        return true;

      case 'a:extLst':
        this.parser = new XmlNodeXform('a:extLst');
        this._currentProp = 'extLst';
        this.parser.parseOpen(node);
        return true;

      default:
        // ignore unknown
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
      case 'a:themeElements':
        return false;
      default:
        return true;
    }
  }
}

module.exports = ThemeElementsXform;
