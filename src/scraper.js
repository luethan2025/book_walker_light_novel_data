/**
 * @file scraper.js
 * @brief BOOK☆WALKER light novel dataset
 * @author luethan2025
 * @release 2024
 */
const puppeteer = require('puppeteer-extra');
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(
  AdblockerPlugin({
    // optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
  })
);
const { Command, Option } = require('commander');
const { getReasonPhrase } = require('http-status-codes');
const { BadConnectionError } = require('./lib/error');
const { searchForTitles } = require('./common_utils');

/** Main routine */
(async () => {
  const program = new Command();
  program
    .name('scraper')
    .description('BOOK☆WALKER light novel dataset')
    .version('0.0.1');

  program
    .addOption(
      new Option('--directory <string>', 'destination directory').default(
        './data/'
      )
    )
    .addOption(
      new Option('--filename <string>', 'destination file').default(
        'titles.txt'
      )
    );

  program.parse(process.argv);

  const options = program.opts();
  const { directory, filename } = options;

  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1366,
      height: 768
    },
    headless: true
  });

  const page = await browser.newPage();

  const url = 'https://global.bookwalker.jp/categories/3/';
  console.log(`Navigating to ${url}`);
  const response = await page.goto(url, {
    waitUntil: 'networkidle2'
  });

  const status = response.status();
  if (status !== 200) {
    console.log('Connection was unsucessful. Try again at another time.');
    throw new BadConnectionError(
      `Status expected HTTP ${200} ${getReasonPhrase(200)}, ` +
        `but was HTTP ${status} ${getReasonPhrase(status)}`
    );
  }
  console.log('Connection was sucessful\n');
  await searchForTitles(page, url, directory, filename);

  await browser.close();
})();
