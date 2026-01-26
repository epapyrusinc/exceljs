const BaseXform = require('../base-xform');

function isWhitespace(text) {
  return !text || /^\s+$/.test(text);
}

function cloneAttributes(attrs) {
  // `saxes` provides a plain object but we defensively clone.
  return attrs ? {...attrs} : {};
}

/**
 * Generic XML subtree capture.
 *
 * Builds a simple object tree:
 *   { tag: string, attrs: Record<string,string>, children: Array<XmlNode|string> }
 *
 * This is intentionally namespace-prefix-preserving (e.g. "a:fmtScheme").
 */
class XmlNodeXform extends BaseXform {
  constructor(rootTag) {
    super();
    this.rootTag = rootTag;
    this.stack = null;
  }

  get tag() {
    return this.rootTag;
  }

  reset() {
    super.reset();
    this.stack = null;
  }

  parseOpen(node) {
    if (!this.stack) {
      if (node.name !== this.rootTag) return false;
      const root = {
        tag: node.name,
        attrs: cloneAttributes(node.attributes),
        children: [],
      };
      this.stack = [root];
      this.model = root;
      return true;
    }

    const parent = this.stack[this.stack.length - 1];
    const child = {
      tag: node.name,
      attrs: cloneAttributes(node.attributes),
      children: [],
    };
    parent.children.push(child);
    this.stack.push(child);
    return true;
  }

  parseText(text) {
    if (!this.stack || isWhitespace(text)) return;
    const node = this.stack[this.stack.length - 1];
    // Merge adjacent text nodes to keep output compact
    const last = node.children[node.children.length - 1];
    if (typeof last === 'string') {
      node.children[node.children.length - 1] = last + text;
    } else {
      node.children.push(text);
    }
  }

  parseClose(name) {
    if (!this.stack) return true;

    const top = this.stack[this.stack.length - 1];
    if (top && top.tag === name) {
      this.stack.pop();
    }

    if (name === this.rootTag && this.stack.length === 0) {
      return false;
    }
    return true;
  }
}

module.exports = XmlNodeXform;
