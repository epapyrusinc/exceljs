/* eslint-disable import/no-extraneous-dependencies */

'use strict';

const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
  testDir: './spec/browser',
  use: {
    headless: true,
  },
  reporter: 'list',
});
