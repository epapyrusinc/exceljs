const BaseXform = require('../base-xform');

function cloneAttributes(attrs) {
  return attrs ? {...attrs} : {};
}

/**
 * Parses DrawingML `a:fontScheme` (CT_FontScheme).
 *
 * Model shape:
 * {
 *   name: string;
 *   majorFont: FontCollection;
 *   minorFont: FontCollection;
 * }
 *
 * FontCollection shape:
 * {
 *   latin: TextFont;
 *   ea: TextFont;
 *   cs: TextFont;
 *   fonts?: Array<{ script: string; typeface: string }>;
 * }
 */
class FontSchemeXform extends BaseXform {
  get tag() {
    return 'a:fontScheme';
  }

  reset() {
    super.reset();
    this._currentCollection = null; // 'majorFont' | 'minorFont'
  }

  parseOpen(node) {
    switch (node.name) {
      case 'a:fontScheme':
        this.reset();
        this.model = {
          name: node.attributes && node.attributes.name,
        };
        return true;

      case 'a:majorFont':
        this._currentCollection = 'majorFont';
        this.model.majorFont = {};
        return true;

      case 'a:minorFont':
        this._currentCollection = 'minorFont';
        this.model.minorFont = {};
        return true;

      case 'a:latin':
      case 'a:ea':
      case 'a:cs': {
        if (!this._currentCollection) return true;
        const key = node.name.slice(2); // remove 'a:'
        this.model[this._currentCollection][key] = cloneAttributes(node.attributes);
        return true;
      }

      case 'a:font': {
        if (!this._currentCollection) return true;
        const fonts = (this.model[this._currentCollection].fonts = this.model[this._currentCollection].fonts || []);
        fonts.push({
          script: node.attributes && node.attributes.script,
          typeface: node.attributes && node.attributes.typeface,
        });
        return true;
      }

      default:
        return true;
    }
  }

  parseText() {}

  parseClose(name) {
    switch (name) {
      case 'a:fontScheme':
        return false;
      case 'a:majorFont':
      case 'a:minorFont':
        this._currentCollection = null;
        return true;
      default:
        return true;
    }
  }
}

module.exports = FontSchemeXform;
