import 'regenerator-runtime/runtime';

import {expect} from 'chai';
import * as ExcelJS from '../..';

describe('typescript: workbook themes', () => {
  it('round-trips themes as a name->xml map (and typings match)', async () => {
    // Compile-time assertions (validated by TypeScript during test compilation)
    type Themes = ExcelJS.WorkbookModel['themes'];
    const okThemes: NonNullable<Themes> = {theme1: {} as any};
    // @ts-expect-error themes are not stored as a string[]
    const badThemes: Themes = ['<xml />'];
    void okThemes;
    void badThemes;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('blort');
    ws.getCell('A1').value = 7;

    const buffer = await wb.xlsx.writeBuffer();

    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.load(buffer);

    // Runtime: when a workbook is loaded, theme XML is preserved as raw strings keyed by name.
    expect(wb2._themes).to.be.an('object');
    expect(wb2._themes && wb2._themes.theme1).to.be.an('object');
    expect(wb2._themes && wb2._themes.theme1.name).to.equal('Office Theme');

    expect(wb2._themes && wb2._themes.theme1.themeElements.clrScheme.colors.accent1.attrs.val).to.be.a('string');
  });

  it('rejects string[] assignment to Workbook._themes (type-level)', () => {
    const wb = {} as ExcelJS.Workbook;
    // @ts-expect-error _themes is a name->xml map, not a string[]
    wb._themes = ['<xml />'];
  });

  it('types: parsed themes are exposed as structured models (type-level)', () => {
    const wb = {} as ExcelJS.Workbook;
    const ok: NonNullable<ExcelJS.Workbook['_themes']> = {theme1: {themeElements: {} as any}};
    void ok;
    void wb;
  });
});


