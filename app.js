const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const async = require('async');
const axios = require('axios');
const FormData = require('form-data');
const puppeteer = require('puppeteer');
var CronJob = require('cron').CronJob;

var imon_login = process.env.IMON_LOGIN;
var imon_pass = process.env.IMON_PASSWORD;
var imon_cookies;


const token = process.env.TG_TOKEN;
var chatIdImon = process.env.CHAT_ID;

const bot = new TelegramBot(token, {polling: true});


process.on('uncaughtException', function (err) {
  console.log("Error. Node NOT Exiting...");
});


var dateToday = new Date();
var yearToday = dateToday.getFullYear();
var monthToday = dateToday.getMonth() + 1;
    monthToday = (monthToday < 10 ? "0" : "") + monthToday;
var dayToday  = dateToday.getDate();
    dayToday = (dayToday < 10 ? "0" : "") + dayToday;

var dateYesterday = new Date();
    dateYesterday.setDate(dateToday.getDate() - 1);
var yearYesterday = dateYesterday.getFullYear();
var monthYesterday = dateYesterday.getMonth() + 1;
    monthYesterday = (monthYesterday < 10 ? "0" : "") + monthYesterday;
var dayYesterday  = dateYesterday.getDate();
    dayYesterday = (dayYesterday < 10 ? "0" : "") + dayYesterday;


var urlTodayGeo = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B00%3A00&filter%5BdateFrom%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BdateTo%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=0&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Bmain%5D%5B%5D=country_iso3&filter%5Btab%5D=campaign_name`;
var urlYesterdayGeo = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B00%3A00&filter%5BdateFrom%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BdateTo%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=0&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Bmain%5D%5B%5D=country_iso3&filter%5Btab%5D=campaign_name`;
var urlToday = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B00%3A00&filter%5BdateFrom%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BdateTo%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=0&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Btab%5D=campaign_name`;
var urlYesterday = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B00%3A00&filter%5BdateFrom%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BdateTo%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=0&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Btab%5D=campaign_name`;

var zohoTodayGeo;
var zohoToday;
var zohoYesterdayGeo;
var zohoYesterday;
var msgID = "";

var checkToday = false;
var checkTodayGeo = false;
var checkYesterdayGeo = false;
var checkYesterday = false;

new CronJob('0 */30 * * * *', function() { // Every 30 min
  var iter = 0;
  async.doWhilst(
   function(callback2) {

    async.waterfall([
            function(callback) { // Update date

      	      dateToday = new Date();
      	      yearToday = dateToday.getFullYear();
      	      monthToday = dateToday.getMonth() + 1;
      	      monthToday = (monthToday < 10 ? "0" : "") + monthToday;
      	      dayToday  = dateToday.getDate();
      	      dayToday = (dayToday < 10 ? "0" : "") + dayToday;

              dateYesterday = new Date();
              dateYesterday.setDate(dateToday.getDate() - 1);
              yearYesterday = dateYesterday.getFullYear();
              monthYesterday = dateYesterday.getMonth() + 1;
              monthYesterday = (monthYesterday < 10 ? "0" : "") + monthYesterday;
              dayYesterday  = dateYesterday.getDate();
              dayYesterday = (dayYesterday < 10 ? "0" : "") + dayYesterday;

              urlTodayGeo = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B00%3A00&filter%5BdateFrom%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BdateTo%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=1&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Bmain%5D%5B%5D=country_iso3&filter%5Btab%5D=campaign_name`;
              urlYesterdayGeo = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B00%3A00&filter%5BdateFrom%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BdateTo%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=1&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Bmain%5D%5B%5D=country_iso3&filter%5Btab%5D=campaign_name`;
              urlToday = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B00%3A00&filter%5BdateFrom%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BdateTo%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=0&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Btab%5D=campaign_name`;
              urlYesterday = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B00%3A00&filter%5BdateFrom%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BdateTo%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=0&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Btab%5D=campaign_name`;

              callback(null);
            },
            function(callback) { // get cookies
              getCookies(function(check) { 
                checkTodayGeo = check;
                checkToday = check;
                checkYesterdayGeo = check;
                checkYesterday = check;
                callback(null);
              });
            },
      			function(callback) { // Download today stat (GEO)
              var fileName = 'imi_stats_export_geo_today.csv';
              downloadFile(fileName, urlTodayGeo, function(check) { 
                checkTodayGeo = check;
                callback(null);
              });
            },
            function(callback) { // Download today stat
      				var fileName = 'imi_stats_export_today.csv';
      				downloadFile(fileName, urlToday, function(check) { 
                checkToday = check;
                callback(null);
              });
      			},
            function(callback) { // Download yesterday stat (GEO)

              var fileName = 'imi_stats_export_geo_yesterday.csv';
              downloadFile(fileName, urlYesterdayGeo, function(check) { 
                checkYesterdayGeo = check;
                callback(null);
              });

            },
            function(callback) { // Download yesterday stat

              var fileName = 'imi_stats_export_yesterday.csv';
              downloadFile(fileName, urlYesterday, function(check) { 
                checkYesterday = check;
                callback(null);
              });

            },
      			function(callback) { // Upload today stat (GEO)
              var fileName = 'imi_stats_export_geo_today.csv';
              uploadZoho(dayToday, monthToday, yearToday, fileName, function(check, zoho) {
                checkTodayGeo = check;
                zohoTodayGeo = zoho;
                callback(null);
              });
            },
            function(callback) { // Upload today stat
      				var fileName = 'imi_stats_export_today.csv';
      				uploadZoho(dayToday, monthToday, yearToday, fileName, function(check, zoho) {
                checkToday = check;
                zohoToday = zoho;
                callback(null);
              });
      	    },
            function(callback) { // Upload yesterday stat (GEO)

              var fileName = 'imi_stats_export_geo_yesterday.csv';
              uploadZoho(dayYesterday, monthYesterday, yearYesterday, fileName, function(check, zoho) {
                checkYesterdayGeo = check;
                zohoYesterdayGeo = zoho;
                callback(null);
              });

            },
            function(callback) { // Upload yesterday stat

              var fileName = 'imi_stats_export_yesterday.csv';
              uploadZoho(dayYesterday, monthYesterday, yearYesterday, fileName, function(check, zoho) {
                checkYesterday = check;
                zohoYesterday = zoho;
                callback(null);
              });

            },
            function(callback) { // Send message
              if (!checkTodayGeo && !checkYesterdayGeo && !checkToday && !checkYesterday) {
                var options = {
                  reply_markup: JSON.stringify({
                    inline_keyboard: [
                    [{ text: '💰 ЗА СЕГОДНЯ', url: zohoToday }],
                    [{ text: '💰 ЗА СЕГОДНЯ (ГЕО)', url: zohoTodayGeo }],
                    [{ text: '💰 ЗА ВЧЕРА', url: zohoYesterday }],
                    [{ text: '💰 ЗА ВЧЕРА (ГЕО)', url: zohoYesterdayGeo }]
                    ]
                  })
                };
                if (msgID != "") {
                  bot.deleteMessage(chatIdImon, msgID);
                }
                bot.sendMessage(chatIdImon, "📈СТАТИСТИКА С МОНЕТЫ:" ,options).then(sender => {
                  msgID = sender.message_id;
                });

                callback(null);
              } else {
                callback(null);
              }

            },
            function(callback) {
             callback(null, 'End');
           }
           ],
           function(err, result) {
            console.log('END POST TODAY STAT');
	    iter++;
            callback2();
          });
},
function() {    
 return ((checkToday || checkYesterday || checkYesterdayGeo || checkTodayGeo) && (iter < 3)); 
},
function (err, result) {
 console.log('END CYCLE');
}
);

}, null, true, 'Europe/Moscow');



/* FUNCTIONS */

function getCookies(callback1) {
  (async () => {
    var browser = await puppeteer.launch({
      headless: true,
      args: [
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*',
      '--no-sandbox', 
      '--disable-setuid-sandbox'
      ]
    });
    try {
      var page = await browser.newPage();

      await page.goto('https://imonetizeit.com/site/login');
      await page.waitForSelector('#LoginForm_email');
      await page.focus('#LoginForm_email');
      await page.type('#LoginForm_email', imon_login);
      await page.focus('#LoginForm_password');
      await page.type('#LoginForm_password', imon_pass);
      await page.click('#login-form > div.form-row.form-row_button > div > input');
      await page.waitForSelector('#calendarApply');

      imon_cookies = await page.cookies();

      await browser.close();
      await main();
      function main() {
        callback1(false);
      }
    } catch(e) {
      console.log('Error get cookies: ' + e);
      browser.close();
      callback1(true);
    }
  })();
}

function downloadFile(fileName, url, callback1) {

	console.log('Start download');

	if(fs.existsSync(fileName)) {
		fs.unlink(fileName);
	}


	(async () => {
   var browser = await puppeteer.launch({
     headless: true,
     args: [
     '--proxy-server="direct://"',
     '--proxy-bypass-list=*',
     '--no-sandbox', 
     '--disable-setuid-sandbox'
     ]
   });
   try {
     var page = await browser.newPage();
     await page.goto('https://imonetizeit.com/site/login');
     await page.waitForSelector('#LoginForm_email');
     await page.setCookie(...imon_cookies);
     await page.reload();
     await page.waitForSelector('#calendarApply');

     var dataGet = await page.evaluate((url) => {
      var data = [];
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
      xhr.send();
      data.push(xhr.responseText);
      return data;
    }, url);

     await browser.close();
     await main();
     function main() {
      fs.writeFile(fileName, dataGet[0], "binary", function(err, x) {
        console.log('Wrote file');
        callback1(false);
      });
    }
  } catch(e) {
    console.log('Error: ' + e);
    browser.close();
    callback1(true);
  }
})();

}


function uploadZoho(day, month, year, fileName, callback1) {

  var form = new FormData();

  form.append('content', fs.createReadStream(fileName), {
    filename: `imi_stats_for_${year}-${month}-${day}.csv`,
    contentType: 'application/vnd.ms-excel'
  });

  form.append('file', 'import');
  form.append('mode', 'url');
  form.append('proxyURL', 'viewer');

  axios.post('https://sheet.zoho.com/sheet/view.do', form, {
    headers: form.getHeaders(),
  }).then(result => {
    console.log(result.data);
    callback1(false, result.data);
  })
  .catch(error => {
    console.error('Upload failed:');
    callback1(true, "");
  });

}
