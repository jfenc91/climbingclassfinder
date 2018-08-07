'use strict';

module.exports.run = (event, context) => {
  (async () => {
    async function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    const time = new Date();
    console.log(`Your cron function ran at ${time}`);

    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({'headless':true, executablePath: './headless-chromium', args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()

    await page.setViewport({width:960,height:768});
    await page.tracing.start({path: 'trace.json', categories: ['devtools.timeline']})
    const data = await page.goto('https://touchstoneclimbing.com/mission-cliffs/calendar/');
    console.log('waiting for initial cal load')
    await page.waitForSelector('#ai1ec-calendar-view > table > thead > tr > th:nth-child(4)')
    let content = await page.content()
    content = content.replace(/-/g, '')
    var count = (content.match(/leadclimbing/g) || []).length
    console.log(`Found: ${count}`)

    function sendClassesAdded() {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey('NOKEY');
      const msg = {
	to: 'jfenc91@gmail.com',
	from: 'jfenc91@gmail.com',
	subject: 'Climbing classes have been added. Go sign up!!',
	text: ' https://touchstoneclimbing.com/mission-cliffs/calendar/',
	html: '<strong>do it!</strong>',
      };
      console.log("sent with sg")
      sgMail.send(msg,  function(err, json) {
  if (err) { return console.error(err); }
  console.log(json);
});
    }
    if (count > 12) {
      sendClassesAdded()
      console.log('Classes Added!!')
    }
    process.exit()
    const handler = await page.$x('//*[@id="ai1ec-calendar-view"]/div[1]/div[2]/div/a[4]');
    await handler[0].click()
    process.exit()
	  //await page.waitForSelector('#ai1ec-calendar-view > div.ai1ec-clearfix > div.ai1ec-title-buttons.ai1ec-btn-toolbar > div > a.ai1ec-minical-trigger.ai1ec-btn.ai1ec-btn-sm.ai1ec-btn-default.ai1ec-tooltip-trigger > i')

    console.log('waiting for cal month change')	  
    await page.waitForFunction('document.querySelector(\'#ai1ec-calendar-view > div.ai1ec-clearfix > div.ai1ec-title-buttons.ai1ec-btn-toolbar > div > a.ai1ec-minical-trigger.ai1ec-btn.ai1ec-btn-sm.ai1ec-btn-default.ai1ec-tooltip-trigger > span.ai1ec-calendar-title\').innerHTML == "September 2018"');

    content = await page.content()
    content = content.replace(/-/g, '')
    var count = (content.match(/leadclimbing/g) || []).length
    console.log(`Found: ${count}`)

    if (count > 0) {
      sendClassesAdded()
      console.log('Classes Added!!')
    }
    
    await page.tracing.stop();
    await browser.close()
  })()
};
