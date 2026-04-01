# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ePapyrus fork of ExcelJS — a library for reading/writing XLSX and CSV files in Node.js and browsers. Published as `@epapyrus/exceljs`.

## Commands

```bash
# Build (Babel transpile + Browserify + Terser → dist/)
npm run build              # or: grunt build

# Lint
npm run lint               # eslint with airbnb-base + prettier
npm run lint:fix           # auto-fix with prettier-eslint

# Test (all tests require build first)
npm run test:full          # build + unit + integration + end-to-end + jasmine
npm run test:unit          # mocha spec/unit (no build needed)
npm run test:integration   # mocha spec/integration
npm run test:end-to-end    # mocha spec/end-to-end
npm run test:typescript    # mocha with ts-node for type definition tests

# Run a single test file
npx mocha --require spec/config/setup spec/unit/path/to/test.spec.js

# Run a single unit test file (needs setup-unit too)
npx mocha --require spec/config/setup --require spec/config/setup-unit spec/unit/path/to/test.spec.js

# Benchmark
npm run benchmark          # requires --expose-gc
```

## Code Style

- ESLint: airbnb-base + prettier + node/recommended
- Max line length: 120 (comments and strings exempt)
- Single quotes, semicolons required, no trailing commas in function params
- `object-curly-spacing: never` → `{foo}` not `{ foo }`
- `no-underscore-dangle: off` — private fields use `_` prefix by convention
- `no-param-reassign: off` — mutation of params is allowed
- Source is CommonJS (`require`/`module.exports`), not ES modules

## Architecture

### Entry Points

- `excel.js` → `lib/exceljs.nodejs.js` (Node.js)
- `lib/exceljs.browser.js` / `lib/exceljs.bare.js` (browser builds)
- `index.d.ts` — TypeScript type definitions (manually maintained, ~5800 lines)
- Build outputs: `dist/es5/` (transpiled), `dist/exceljs.min.js` (browser bundle)

### Core Document Model (`lib/doc/`)

`Workbook` → `Worksheet[]` → `Row[]` → `Cell[]`, plus `Column`, `Table`, `PivotTable`, `DefinedNames`, `Image`, `Note`.

- Cell values are polymorphic — `cell._value` holds a type-specific object (Null, Number, String, Date, Hyperlink, Formula, RichText, Boolean, Error, SharedString, Merge). See `ValueType` enum in `lib/doc/enums.js`.
- Worksheets use sparse arrays for rows and cells.
- Styles inherit: row → column → cell.

### Xform Pattern (`lib/xlsx/xform/`)

The XML serialization layer. Each Xform class handles one XML element type with a consistent interface:

- `prepare(model, options)` — mutate model before writing
- `render(xmlStream, model)` — write model as XML
- `parseOpen(node)` / `parseText(text)` / `parseClose(name)` — SAX-driven parsing
- `reconcile(model, options)` — post-parse processing

Base classes: `BaseXform` → `CompositeXform` (nested elements), `ListXform` (arrays), `StaticXform` (fixed XML).

Organized by XML part: `core/`, `book/`, `sheet/`, `style/`, `table/`, `drawing/`, `strings/`, `comment/`, `theme/`, `pivot-table/`.

### XLSX Read/Write (`lib/xlsx/xlsx.js`)

- **Read**: ZIP → extract parts → SAX parse via Xforms → reconcile into Workbook model
- **Write**: Workbook model → prepare → Xforms render XML → Archiver zips parts

### Streaming API (`lib/stream/xlsx/`)

Separate `WorkbookWriter`/`WorkbookReader` and `WorksheetWriter`/`WorksheetReader` classes for memory-efficient processing of large files. Not a drop-in replacement for the document model — rows must be committed sequentially.

### CSV (`lib/csv/`)

Wraps `fast-csv` for parsing/writing. Uses `dayjs` for date handling.

### Utilities (`lib/utils/`)

- `col-cache.js` — bidirectional mapping between column letters (A, B, ..., AA) and numbers
- `utils.js` — date conversion (Excel serial ↔ JS Date), XML encoding, shared helpers
- `parse-sax.js` — SAX parser wrapper over `saxes`
- `xml-stream.js` — XML writing helper
- `stream-buf.js` — buffered stream for file output

## Test Structure

- `spec/unit/` — isolated component tests (use `--require spec/config/setup --require spec/config/setup-unit`)
- `spec/integration/` — read/write round-trip tests with real Excel files in `spec/integration/data/`
- `spec/end-to-end/` — full workflow tests
- `spec/typescript/` — validates `index.d.ts` type definitions
- Test framework: Mocha + Chai (expect style)
