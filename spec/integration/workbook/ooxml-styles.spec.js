const testUtils = require('../../utils/index');

const ExcelJS = verquire('exceljs');

function hasEdge(border, edge, style) {
  return border && border[edge] && border[edge].style === style;
}

describe('Workbook', () => {
  describe('OOXML Styles exposure', () => {
    it('exposes parsed styles.xml collections (including borders)', async () => {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('sheet1');

      // Create a table with a column dxf style (populates dxfs)
      ws.addTable({
        name: 'TestTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: {
          theme: 'TableStyleDark3',
          showRowStripes: true,
        },
        columns: [
          {name: 'A'},
          {
            name: 'B',
            // this becomes a dxf style
            style: {font: {bold: true, name: 'Comic Sans MS'}},
          },
        ],
        rows: [
          ['x', 'y'],
          ['x2', 'y2'],
        ],
      });

      // Create at least one custom border, fill, and number format
      const c = ws.getCell('D4');
      c.value = 1;
      c.numFmt = '#,##0.00;[Red]-#,##0.00';
      c.fill = testUtils.styles.fills.redDarkVertical;
      c.font = testUtils.styles.fonts.comicSansUdB16;
      c.border = testUtils.styles.borders.doubleRed;

      const buffer = await wb.xlsx.writeBuffer();

      const wb2 = new ExcelJS.Workbook();
      await wb2.xlsx.load(buffer);

      expect(wb2.styles).to.be.an('object');

      // core collections
      expect(wb2.styles.fonts).to.be.an('array');
      expect(wb2.styles.fills).to.be.an('array');
      expect(wb2.styles.borders).to.be.an('array');
      expect(wb2.styles.cellStyleXfs).to.be.an('array');
      expect(wb2.styles.styles).to.be.an('array');
      expect(wb2.styles.dxfs).to.be.an('array');

      const {borders, dxfs} = wb2.styles;

      // borders: ensure our "double" edges were preserved in styles.xml model
      const hasDoubleBorder = borders.some(
        b =>
          hasEdge(b, 'left', 'double') ||
          hasEdge(b, 'right', 'double') ||
          hasEdge(b, 'top', 'double') ||
          hasEdge(b, 'bottom', 'double')
      );
      expect(hasDoubleBorder).to.equal(true);

      // dxfs: ensure our table column style is present
      const hasComicSansDxf = dxfs.some(
        dxf =>
          dxf && dxf.font && dxf.font.name === 'Comic Sans MS' && dxf.font.bold
      );
      expect(hasComicSansDxf).to.equal(true);
    });
  });
});
