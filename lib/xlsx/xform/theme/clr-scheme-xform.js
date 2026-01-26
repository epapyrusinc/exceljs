const BaseXform = require('../base-xform');

function stripPrefix(tag) {
  const idx = tag.indexOf(':');
  return idx >= 0 ? tag.slice(idx + 1) : tag;
}

function cloneAttributes(attrs) {
  return attrs ? {...attrs} : {};
}

/**
 * Parses DrawingML `a:clrScheme` (CT_ColorScheme).
 *
 * Model shape:
 * {
 *   name: string;
 *   colors: {
 *     dk1, lt1, dk2, lt2, accent1..accent6, hlink, folHlink: ThemeColor
 *   }
 * }
 *
 * ThemeColor shape:
 * {
 *   type: 'sysClr' | 'srgbClr' | 'schemeClr' | 'prstClr' | 'scrgbClr' | 'hslClr';
 *   attrs: Record<string,string>;
 *   transforms?: Array<{ tag: string; attrs: Record<string,string> }>;
 * }
 */
class ClrSchemeXform extends BaseXform {
  get tag() {
    return 'a:clrScheme';
  }

  reset() {
    super.reset();
    this._currentKey = null;
    this._currentChoice = null;
  }

  parseOpen(node) {
    switch (node.name) {
      case 'a:clrScheme':
        this.reset();
        this.model = {
          name: node.attributes && node.attributes.name,
          colors: {},
        };
        return true;

      case 'a:dk1':
      case 'a:lt1':
      case 'a:dk2':
      case 'a:lt2':
      case 'a:accent1':
      case 'a:accent2':
      case 'a:accent3':
      case 'a:accent4':
      case 'a:accent5':
      case 'a:accent6':
      case 'a:hlink':
      case 'a:folHlink':
        this._currentKey = stripPrefix(node.name);
        return true;

      case 'a:scrgbClr':
      case 'a:srgbClr':
      case 'a:hslClr':
      case 'a:sysClr':
      case 'a:schemeClr':
      case 'a:prstClr': {
        if (!this._currentKey || !this.model) return true;
        const type = stripPrefix(node.name);
        const choice = {
          type,
          attrs: cloneAttributes(node.attributes),
        };
        this.model.colors[this._currentKey] = choice;
        this._currentChoice = choice;
        return true;
      }

      default: {
        // Color transforms (e.g. a:tint, a:shade, ...) may appear as children of a:*Clr nodes.
        if (this._currentChoice) {
          const transforms = (this._currentChoice.transforms = this._currentChoice.transforms || []);
          transforms.push({tag: node.name, attrs: cloneAttributes(node.attributes)});
        }
        return true;
      }
    }
  }

  parseText() {}

  parseClose(name) {
    switch (name) {
      case 'a:clrScheme':
        return false;
      case 'a:dk1':
      case 'a:lt1':
      case 'a:dk2':
      case 'a:lt2':
      case 'a:accent1':
      case 'a:accent2':
      case 'a:accent3':
      case 'a:accent4':
      case 'a:accent5':
      case 'a:accent6':
      case 'a:hlink':
      case 'a:folHlink':
        this._currentKey = null;
        return true;
      case 'a:scrgbClr':
      case 'a:srgbClr':
      case 'a:hslClr':
      case 'a:sysClr':
      case 'a:schemeClr':
      case 'a:prstClr':
        this._currentChoice = null;
        return true;
      default:
        return true;
    }
  }
}

module.exports = ClrSchemeXform;
