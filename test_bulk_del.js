// We can test this by running a simple playwright script to ensure it correctly appends to the UI
const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const filePath = path.resolve('prototype2/q70.html');
    await page.goto(`file://${filePath}`);

    await page.evaluate(() => { window.checkAccess = function() { return true; }; });

    // open the modal
    await page.click('#openBulkDeliveriesModalButton');
    await page.waitForSelector('#bulkDeliveriesModal', { state: 'visible' });

    // add item 1
    await page.fill('#bulkDelItemSearch', 'NEW-ITEM-1');
    await page.fill('#bulkDelQtyInput', '50');
    await page.fill('#bulkDelPalletCapacity', '10');
    await page.click('#addToListBulkBtn');

    // add item 1 again with a different qty
    await page.fill('#bulkDelItemSearch', 'NEW-ITEM-1');
    await page.fill('#bulkDelQtyInput', '20');
    await page.fill('#bulkDelPalletCapacity', '10');
    await page.click('#addToListBulkBtn');

    // Check the UI
    const rows = await page.evaluate(() => {
        const els = document.querySelectorAll('#bulkDeliveryList .bulk-del-item');
        return Array.from(els).map(el => {
            return {
                code: el.querySelector('input[placeholder="Material Code"]').value,
                qty: el.querySelectorAll('.item-input input')[0].value
            };
        });
    });

    console.log("Rows in list:", rows);
    await browser.close();
})();
