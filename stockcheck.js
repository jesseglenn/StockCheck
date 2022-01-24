const twilio = require('twilio'),
    puppeteer = require('puppeteer'),
    phoneNumber = '15555555',
    twilioNumber = '15555555',
    twilioSID =  '',
    twilioAuth = '';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true }),
            page = await browser.newPage(),
            url = 'https://www.website.com/product',
            buttonClass = 'add-to-cart-button',
            soldOutText = 'Sold Out';

        var evaluatePage = async () => {
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.evaluate(async () => {
                if (document.getElementsByClassName(buttonClass)[0].textContent == soldOutText) {
                    setTimeout(evaluatePage, 150000)
                } else {
                    sendMessage()
                }
            });
        }

        var closeBrowser = async () => {
            await browser.close();
        }

        var reloadPage = async () => {
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            evaluatePage();
        }

        var sendMessage = async () => {
            var client = new twilio(twilioSID, twilioAuth),
                message = 'This product is back in stock! Link: ' + url;

            client.messages.create({
                to: phoneNumber,
                from: twilioNumber,
                body: message
            });
        }

        await page.exposeFunction("closeBrowser", closeBrowser);
        await page.exposeFunction("reloadPage", reloadPage);
        await page.exposeFunction("evaluatePage", evaluatePage);
        await page.exposeFunction("sendMessage", sendMessage);

        evaluatePage();

    } catch (errors) {
        var client = new twilio(twilioSID, twilioAuth),
            message = 'Error: ' + errors;

        client.messages.create({
            to: phoneNumber,
            from: twilioNumber,
            body: message
        });
    }
})()