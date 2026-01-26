const fs = require('fs');
const path = require('path');
const {PassThrough} = require('readable-stream');

const parseSax = verquire('utils/parse-sax');
const ThemeXform = verquire('xlsx/xform/theme/theme-xform');

function hasTag(node, tag) {
  if (!node) return false;
  if (node.tag === tag) return true;
  if (!node.children) return false;
  // eslint-disable-next-line no-restricted-syntax
  for (const child of node.children) {
    if (typeof child !== 'string' && hasTag(child, tag)) return true;
  }
  return false;
}

describe('ThemeXform', () => {
  it('parses lib/xlsx/xml/theme1.xml into a coherent CT_OfficeStyleSheet model', async () => {
    const themeXmlPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      'lib',
      'xlsx',
      'xml',
      'theme1.xml'
    );
    const xml = fs.readFileSync(themeXmlPath).toString().replace(/\r\n/g, '\n');

    const stream = new PassThrough();
    stream.end(xml);

    const xform = new ThemeXform();
    const model = await xform.parse(parseSax(stream));

    expect(model.name).to.equal('Office Theme');

    expect(model.themeElements).to.be.an('object');
    expect(model.themeElements.clrScheme.name).to.equal('Office');
    expect(model.themeElements.clrScheme.colors.accent1.type).to.equal(
      'srgbClr'
    );
    expect(model.themeElements.clrScheme.colors.accent1.attrs.val).to.equal(
      '4F81BD'
    );

    expect(model.themeElements.fontScheme.name).to.equal('Office');
    expect(model.themeElements.fontScheme.majorFont.latin.typeface).to.equal(
      'Cambria'
    );

    expect(model.themeElements.fmtScheme.tag).to.equal('a:fmtScheme');
    expect(model.themeElements.fmtScheme.children).to.be.an('array');
    expect(model.themeElements.fmtScheme.children.length).to.be.greaterThan(0);

    expect(model.objectDefaults.tag).to.equal('a:objectDefaults');
    expect(hasTag(model.objectDefaults, 'a:spDef')).to.equal(true);
    expect(hasTag(model.objectDefaults, 'a:lnDef')).to.equal(true);

    expect(model.extraClrSchemeLst.tag).to.equal('a:extraClrSchemeLst');
    expect(model.extraClrSchemeLst.children).to.deep.equal([]);
  });
});
