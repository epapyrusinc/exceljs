## Reason: Expose `Worksheet._merges` in `index.d.ts`

### Summary of the change

`Worksheet` instances in this codebase have always tracked merged-cell state internally via a `_merges` field. JavaScript consumers can access it at runtime, but TypeScript users could not access it without `any` casts because `index.d.ts` did not declare it.

This change **adds `_merges` to the public TypeScript surface** (still clearly marked as internal via the leading underscore) and types it to match the **two concrete runtime representations** used by the library:

- **In-memory worksheets** (`lib/doc/worksheet.js`): `_merges` is a map keyed by the **master cell address** (`"A1"`, `"C5"`, …) whose values are `Range` objects.
- **Streaming worksheets** (`lib/stream/xlsx/worksheet-writer.js`): `_merges` is a `Range[]` used when emitting `<mergeCells>` during streaming output, and it also carries a no-op `.add()` method for compatibility with internal writer plumbing.

### Background: what “merges” mean in ExcelJS

Merged cells are stored by Excel as rectangular regions (ranges). ExcelJS supports merges through public APIs such as:

- `worksheet.mergeCells(...)`
- `worksheet.unMergeCells(...)`
- `worksheet.hasMerges`
- persisted output in `worksheet.model.merges`

Internally, ExcelJS also needs a richer structure to:

- **detect overlap** (`intersects`) when creating a new merge
- **find and unmerge** merge blocks reliably
- **emit merge definitions** for streamed XLSX output

That internal state is `_merges`.

### The two runtime `_merges` representations (why the TS type is a union)

#### In-memory `Worksheet` (`lib/doc/worksheet.js`)

The normal worksheet implementation initializes and maintains `_merges` as an object:

- `_merges` starts as `{}` (empty map).
- When a merge is created, the code stores the merge range under the master cell’s address:
  - key: `master.address` (e.g. `"B2"`)
  - value: a `Range` instance describing the merged rectangle
- When a merge is removed, the entry is deleted.

This yields an internal structure like:

```ts
// conceptual structure
{
  "A1": Range(/* A1:C3 */),
  "D5": Range(/* D5:D6 */),
}
```

This representation is optimized for:

- fast “is this master cell a merge master?” checks (`_merges[address]`)
- iterating merge blocks by master
- reliable unmerge operations (the master is the index)

#### Streaming `WorksheetWriter` (`lib/stream/xlsx/worksheet-writer.js`)

The streaming writer cannot keep the same rich in-memory graph as the normal worksheet, and it emits XML incrementally. In this path:

- `_merges` is an array of `Range`-like objects (`Dimensions` is `require('../../doc/range')`)
- merges are collected via `this._merges.push(dimensions)`
- when writing the sheet XML, it emits `<mergeCell ref="..."/>` for each entry

Additionally, the writer attaches:

```js
this._merges.add = function() {};
```

That stub exists to satisfy internal code paths which may call `options.merges.add(model)` when encountering merged-cell records (e.g. the cell xform). In streaming mode, merge collection is handled elsewhere, so the `add()` is intentionally a no-op.

Because these two representations are both real and both reachable from values typed as `Worksheet` in TypeScript (streaming and non-streaming code use the same `Worksheet` interface in `index.d.ts`), the accurate TS declaration must accept both.

### Why this is a TypeScript-only “exposure” (no runtime behavior change)

This change only updates `index.d.ts`. It:

- **does not** change how merges are created, stored, or written
- **does not** alter output XLSX content
- **does not** change runtime objects

It simply stops TypeScript from treating `_merges` as an unknown property, which previously forced consumers into unsafe patterns like `const merges = (ws as any)._merges`.

### Type definition rationale

The added declaration is:

```ts
_merges: Partial<Record<string, Range>>
  | (Range[] & { add?: (merge: { address: string; master: string }) => void });
```

Key points:

- **`Partial<Record<string, Range>>` for in-memory worksheets**
  - The map is sparse and entries are removed via `delete`, so “a key may be missing” is fundamental.
  - Using `Partial<...>` makes “possibly undefined by key” explicit and encourages correct guards (`if (ws._merges[addr])`).
- **`Range[]` for streaming worksheets**
  - Streaming merges are collected as an array of `Range`/`Dimensions`.
  - The writer sometimes attaches `.add()`; we model it as optional (`add?`) so the type still works for a plain `Range[]` and doesn’t over-promise the method in non-writer contexts.
- **Why not a single shared “Merges” class type**
  - There is also a `Merges` helper used by the XLSX transform layer (`lib/xlsx/xform/sheet/merges.js`), but `_merges` on a worksheet is not an instance of that helper in either the normal or streaming worksheet implementations.
  - Modeling `_merges` as the two concrete runtime shapes keeps the typing honest and avoids introducing a misleading exported type.

### Practical guidance for consumers

#### Prefer the public API when possible

If you only need the merge list for persistence, `worksheet.model.merges` is the stable exported shape.

#### If you need `_merges`, narrow by representation

Because `_merges` is a union, TypeScript consumers should narrow before use:

```ts
function getMergeMasters(ws: import('./index').Worksheet): string[] {
  const merges = ws._merges;
  if (Array.isArray(merges)) {
    // streaming: array of ranges
    return merges.map(r => r.tl);
  }
  // in-memory: map keyed by master address
  return Object.keys(merges);
}
```

### Compatibility notes

- This is an **additive** type surface change for users who only consume real `Worksheet` objects from ExcelJS.
- TypeScript projects that create **mock `Worksheet` objects** and type them as `Worksheet` may need to include `_merges` in their mocks (because it is a real runtime field on real worksheets). If that becomes a pain point for consumers, the declaration could be revisited to make `_merges` optional, but the current form matches runtime behavior.

### References (files and relevant regions)

- `index.d.ts`: `Worksheet` interface includes the added `_merges` property (around the start of the interface)
- `lib/doc/worksheet.js`: initializes `_merges = {}` and stores `Range` values keyed by master cell address
- `lib/stream/xlsx/worksheet-writer.js`: initializes `_merges = []`, attaches `_merges.add = function() {}`, pushes merge ranges, and later writes `<mergeCells>`
- `lib/xlsx/xform/sheet/cell-xform.js`: calls `options.merges.add(model)` for merged-cell records (motivating the writer’s no-op `.add()`)
- `lib/xlsx/xform/sheet/merges.js`: transform-layer merge helper (distinct from worksheet `_merges`)

