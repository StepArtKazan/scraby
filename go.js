const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const fetch = require('node-fetch');

const url = 'https://www.amazon.com/Standing-Desk-Converter-Adjustable-Workstation/dp/B07613BR1D/ref=sxin_9_pa_sp_search_thematic_sspa?cv_ct_cx=stand+up+desk&dchild=1&keywords=stand+up+desk&pd_rd_i=B07613BR1D&pd_rd_r=a56bb224-7685-4ed7-9cc9-a149bf4886da&pd_rd_w=B2C9I&pd_rd_wg=z4ZK2&pf_rd_p=4bad7638-dca1-43b9-ab64-2d55023aec7c&pf_rd_r=1KSKWS9W45YG1NVK61TD&qid=1615838717&sr=1-5-a8004193-6951-43f6-852a-aff7dbba9115-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyWUMxT1BSWDVUR1lNJmVuY3J5cHRlZElkPUEwMzg2Nzk0MjE1SzBIWUdIQUtEMCZlbmNyeXB0ZWRBZElkPUEwNzY5Mjg2MTVJUTA1NlA5WEtQMSZ3aWRnZXROYW1lPXNwX3NlYXJjaF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=';
const port = 3007;




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
    await page.waitForSelector('#dp-container');
    const result = await page.evaluate(() => {
        // counts total number of products
        let totalSearchResults = Array.from(document.querySelectorAll('#dp-container')).length;

        let productsList = [];

        for (let i = 1; i < totalSearchResults - 1; i++) {
            let product = {
                brand: '',
                product: '',
            };
            let onlyProduct = false;
            let emptyProductMeta = false;

            // traverse for brand and product names
            let productNodes = Array.from(document.querySelectorAll(`#title_feature_div`));

            if (productNodes.length === 0) {
                // traverse for brand and product names
                // (in case previous traversal returned empty elements)
                productNodes = Array.from(document.querySelectorAll(`#title_feature_div`));
                // productNodes.length > 0 ? onlyProduct = true : emptyProductMeta = true;
            }

            let productsDetails = productNodes.map(el => el.innerText);

            // if (!emptyProductMeta) {
            //     product.brand = onlyProduct ? '' : productsDetails[0];
            //     product.product = onlyProduct ? productsDetails[0] : productsDetails[0];
            // }



            // traverse for product price
            let rawPrice = document.querySelector(`#priceblock_ourprice > font > font`);
            product.price = rawPrice ? rawPrice.innerText : '';

            let rawRating = document.querySelector(`#acrPopover > span.a-declarative > a > i.a-icon.a-icon-star.a-star-5 > span`);
            product.rating = rawRating ? rawRating.innerText : '';

            let rawFeedback = document.querySelector(`#averageCustomerReviews`);
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
