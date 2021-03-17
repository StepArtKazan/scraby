const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const fetch = require('node-fetch');

const url = 'https://www.amazon.com/s?k=stand+up+desks&ref=nb_sb_noss';
const port = 3002;


//   fetch('https://onremoteworks.bubbleapps.io/version-test/api/1.1/obj/product')
//         .then(res => res.text())
//         .then(text => JSON.parse(text).response.results.forEach(item => {
// console.log(item.URL);
// }))


app.get('/', async (req, res) => {
    console.log('get parse info');
    const result = await fetchProductList(url);

    res.send(JSON.stringify(result));
});

app.listen(port);

async function fetchProductList(url) {
    let startTime = Date.now();

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // await page.setViewport({width: 1366, height: 800});
    await page.goto(url, {waitUntil: 'networkidle2'});

    // await page.waitForSelector('div.s-desktop-width-max');
    await page.waitFor('div[data-cel-widget^="search_result_"]');
    const result = await page.evaluate(() => {
        // counts total number of products
        let totalSearchResults = Array.from(document.querySelectorAll('div[data-cel-widget^="search_result_"]')).length;

        let productsList = [];

        for (let i = 1; i < totalSearchResults - 1; i++) {
            let product = {
                brand: '',
                product: '',
            };
            let onlyProduct = false;
            let emptyProductMeta = false;

            // traverse for brand and product names
            let productNodes = Array.from(document.querySelectorAll(`div[data-cel-widget="search_result_${i}"] .a-size-base-plus.a-color-base`));

            if (productNodes.length === 0) {
                // traverse for brand and product names
                // (in case previous traversal returned empty elements)
                productNodes = Array.from(document.querySelectorAll(`div[data-cel-widget="search_result_${i}"] .a-size-base-plus.a-color-base.a-text-normal`));
                productNodes.length > 0 ? onlyProduct = true : emptyProductMeta = true;
            }

            let productsDetails = productNodes.map(el => el.innerText);

            if (!emptyProductMeta) {
                product.brand = onlyProduct ? '' : productsDetails[0];
                product.product = onlyProduct ? productsDetails[0] : productsDetails[0];
            }

            // traverse for product image
            let rawImage = document.querySelector(`div[data-cel-widget="search_result_${i}"] .s-image`);
            product.image = rawImage ? rawImage.src : '';

            // traverse for product url
            let rawUrl = document.querySelector(`div[data-cel-widget="search_result_${i}"] a.a-text-normal`);
            product.url = rawUrl ? rawUrl.href : '';

            // traverse for product price
            let rawPrice = document.querySelector(`div[data-cel-widget="search_result_${i}"] span.a-offscreen`);
            product.price = rawPrice ? rawPrice.innerText : '';

            let rawRating = document.querySelector(`div[data-cel-widget="search_result_${i}"] span.a-icon-alt`);
            product.rating = rawRating ? rawRating.innerText : '';

            let rawFeedback = document.querySelector(`div[data-cel-widget="search_result_${i}"] span.a-size-base`);
            product.Feedback = rawFeedback ? rawFeedback.innerText : '';

            if (typeof product.product !== 'undefined') {
                !product.product.trim() ? null : productsList = productsList.concat(product);
            }
        }

        return {
            productsList: productsList,
            totalLength: totalSearchResults
        };
    })

    console.log(result, ' result');

    return result

}

fetchProductList(url)
