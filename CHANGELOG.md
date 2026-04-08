
# Changelog

All notable changes since `0617362` are documented here.

## 4.4.0-rc.4 (2026-04-08)

### Changed
- fix(deps): harden security - remove vulnerable deps and overrides (`405127d`)
- fix(deps): upgrade dev toolchain and fix security vulnerabilities (`7c8b1fe`)
- fix(deps): upgrade archiver to 7.x and fix security vulnerabilities (`6a79877`)

### Fixed
- fix: update HeaderFooter interface and hyperlink handling (`c99c112`)

## 4.4.0-rc.3 (2026-01-30)

### Fixed
- fix: add missing text field to containsText CFRule (`d3c458a`)

## 4.4.0-rc.2 (2026-01-29)

### Added
- feat: Adopt conditional formatting fixes from upstream PRs #2803 and #2736 (`791338d`)

### Changed
- feat(grid)!: cell, row, and col logic improvements (`01247c2`)
- chore: reveal dxfId (`f990b41`)

### Fixed
- fix(themes): fixed theme parsing (`66eab67`)
- fix(cf): add more types to conditional formatting rules (`10c850f`)
- fix(color): update Color (`3076b22`)

## 4.4.0-rc.1 (2026-01-26)

### Added
- feat(themes): added themes (`2896375`)
- feat: expose styles (`d4d1b3d`)

## 4.4.0-rc.0 (2026-01-09)

### Changed
- chore: add _merges to Worksheet (`c537170`)
- chore: update README and package.json (`e47f208`)
- chore: fix typo in README (`b77e2db`)

### Fixed
- fix: add missing vertical and horizontal border in Borders (`0617362`)
- fix: border optional tags and missing 0 value in formula tags (`d42c193`)
- fix(streaming-reader): buffer deferred worksheets until sharedStrings parsed (`d07a49f`)
