/**
 * @file common_utils.js
 * @brief Collection of utility functions to abstract scraper.js
 * @author luethan2025
 * @release 2024
 */
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');
const { BadConnectionError } = require('./lib/error');

/**
 * @brief Returns an Array of the titles found on the current page
 * @param {Object} page Puppeteer page instance
 * @return {Array} Array of the titles found on the current page
 */
async function scrapeTitles(page) {
  const re = /\(Light Novels\)|\(Light Novel\)/gi;
  const titlesOnPage = await page.$x('//h2[contains(@class, "a-tile-ttl")]');

  // decode selected tags
  const currentTitles = await Promise.all(
    titlesOnPage.map(
      async (item) => await (await item.getProperty('innerText')).jsonValue()
    )
  );
  const titles = currentTitles.map((title) => title.replace(re, '').trim());
  return titles;
}

/**
 * @brief Returns an Array of the titles found on Book Walker
 * @param {Object} page Puppeteer page instance
 * @return {Array} Array of the titles found on Book Walker
 */
async function collectTitles(page, url) {
  const footer = await page.$x(
    '//div[contains(@class, "book-list-inner")]/div/ul/li'
  );
  // remove the 'Next Button'
  footer.pop();
  const maxPages = Number(
    await (await footer.pop().getProperty('innerText')).jsonValue()
  );

  const titles = [];
  let currentTitles = await scrapeTitles(page);
  titles.push(...currentTitles);

  for (let i = 2; i < maxPages; i++) {
    console.log(`Navigating to ${url}?np=0&page=${i}`);
    try {
      const response = await page.goto(`${url}?np=0&page=${i}`, {
        waitUntil: 'networkidle2'
      });

      const status = response.status();
      if (status !== 200) {
        console.log('Connection was unsucessful');
        throw new BadConnectionError(
          `Status expected HTTP ${200} ${getReasonPhrase(200)}, ` +
            `but was HTTP ${status} ${getReasonPhrase(status)}`
        );
      } else {
        console.log('Connection was sucessful\n');
        currentTitles = await scrapeTitles(page);
        titles.push(...currentTitles);
      }
    } catch (err) {
      console.log(err);
      console.log('Something went wrong. Skipping\n');
      continue;
    }
  }
  return titles;
}

/**
 * Writes the dataset into a file
 * @param {Object} titles Scraped light novel titles
 * @param {String} directory Destination directory
 * @param {String} filePath Path to destination file
 */
function log_titles(titles, directory, filePath) {
  if (existsSync(directory) === false) {
    mkdirSync(directory, { recursive: true });
    console.log(`${directory} was created successfully`);
  } else {
    console.log(`${directory} was found`);
  }

  console.log(`Started writing data to ${filePath}`);
  writeFileSync(filePath, titles.join('\n'), { flag: 'w' });
  console.log('Finished writing data');
}

/**
 * Scraper routine
 * @param {Object} page Puppeteer page instance
 * @param {String} url Base URL
 * @param {String} directory Destination directory
 * @param {String} filename Destination file
 */
async function searchForTitles(page, url, directory, filename) {
  const titles = await collectTitles(page, url);

  const filePath = join(directory, filename);
  log_titles(titles, directory, filePath);
}

module.exports = { searchForTitles };
