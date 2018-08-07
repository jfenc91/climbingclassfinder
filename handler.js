'use strict';

module.exports.run = (event, context) => {
  (async () => {
    async function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    const time = new Date();
    console.log(`Your cron function ran at ${time}`);

    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({'headless':true, executablePath: './headless-chromium', args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process']})
    const page = await browser.newPage()

    await page.setViewport({width:960,height:768});
    await page.tracing.start({path: '/tmp/trace.json', categories: ['devtools.timeline']})
    const data = await page.goto('https://touchstoneclimbing.com/mission-cliffs/calendar/');
    console.log('waiting for initial cal load')
    await page.waitForSelector('#ai1ec-calendar-view > table > thead > tr > th:nth-child(4)')
    let content = await page.content()
    content = content.replace(/-/g, '')
    var count = (content.match(/leadclimbing/g) || []).length
    console.log(`Found: ${count}`)

    function sendClassesAdded() {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey('NOKEy');
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
	  //const handler = await page.$x('//*[@id="ai1ec-calendar-view"]/div[1]/div[2]/div/a[4]');
    
    //await page.waitFor(2000);
    await page.$eval('#ai1ec-calendar-view > div.ai1ec-clearfix > div.ai1ec-title-buttons.ai1ec-btn-toolbar > div > a.ai1ec-next-month.ai1ec-load-view.ai1ec-btn.ai1ec-btn-sm.ai1ec-btn-default', x => x.click())

	  
    //const handler = await page.$x('//*[@id="ai1ec-calendar-view"]/div[1]/div[2]/div/a[4]');
    //console.log(handler)
    //console.log(handler[0])
    //await handler[0].click()
	  //await page.waitForSelector('#ai1ec-calendar-view > div.ai1ec-clearfix > div.ai1ec-title-buttons.ai1ec-btn-toolbar > div > a.ai1ec-minical-trigger.ai1ec-btn.ai1ec-btn-sm.ai1ec-btn-default.ai1ec-tooltip-trigger > i')
   // console.log(await page.content())
	  //await page.click('#ai1ec-calendar-view > div.ai1ec-clearfix > div.ai1ec-title-buttons.ai1ec-btn-toolbar > div > a.ai1ec-next-month.ai1ec-load-view.ai1ec-btn.ai1ec-btn-sm.ai1ec-btn-default')
    
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
