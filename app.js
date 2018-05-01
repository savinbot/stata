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


var urlToday = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B03%3A00&filter%5BdateFrom%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BdateTo%5D=${yearToday}-${monthToday}-${dayToday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=1&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Bmain%5D%5B%5D=country_iso3&filter%5Btab%5D=campaign_name`;
var urlYesterday = `https://imonetizeit.com/partner/statistics/get?type=csv&is_offer=0&filter%5BcampaignId%5D=all&filter%5Bvertical%5D=0&filter%5Butc%5D=%2B03%3A00&filter%5BdateFrom%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BdateTo%5D=${yearYesterday}-${monthYesterday}-${dayYesterday}&filter%5BgroupBy%5D=total&filter%5BsubId1%5D=0&filter%5BsubId2%5D=0&filter%5BshowGraph%5D=0&filter%5Binclude_archive%5D=1&filter%5Bcreative%5D=0&filter%5Bmain%5D%5B%5D=campaign_name&filter%5Bmain%5D%5B%5D=country_iso3&filter%5Btab%5D=campaign_name`;


new CronJob('0 */30 * * * *', function() { // Every 30 min

		async.waterfall([
			function(callback) { // Update date

				dateToday = new Date();
				yearToday = dateToday.getFullYear();
				monthToday = dateToday.getMonth() + 1;
				monthToday = (monthToday < 10 ? "0" : "") + monthToday;
				dayToday  = dateToday.getDate();
				dayToday = (dayToday < 10 ? "0" : "") + dayToday;

				callback(null);
			},
			function(callback) { // Download today stat

				var fileName = 'imi_stats_export_today.csv';
				downloadFile(fileName, urlToday, function() { 
					callback(null);
				});

			},
			function(callback) { // Upload today stat

				var fileName = 'imi_stats_export_today.csv';
				uploadZoho(dayToday, monthToday, yearToday, fileName, function() {
					callback(null);
				});

			},
			function(callback) {
					callback(null, 'End');
				}
			],
			function(err, result) {
				console.log('END POST TODAY STAT');
			});

}, null, true, 'Europe/Moscow');

new CronJob('0 0 9 * * *', function() { // Every 9 morning o'clock

        async.waterfall([
            function(callback) { // Update date

                dateYesterday = new Date();
                dateYesterday.setDate(dateToday.getDate() - 1);
                yearYesterday = dateYesterday.getFullYear();
                monthYesterday = dateYesterday.getMonth() + 1;
                monthYesterday = (monthYesterday < 10 ? "0" : "") + monthYesterday;
                dayYesterday  = dateYesterday.getDate();
                dayYesterday = (dayYesterday < 10 ? "0" : "") + dayYesterday;

                callback(null);
            },
            function(callback) { // Download yesterday stat

                var fileName = 'imi_stats_export_yesterday.csv';
                downloadFile(fileName, urlYesterday, function() { 
                    callback(null);
                });

            },
            function(callback) { // Upload yesterday stat

                var fileName = 'imi_stats_export_yesterday.csv';
                uploadZoho(dayYesterday, monthYesterday, yearYesterday, fileName, function() {
                    callback(null);
                });

            },
            function(callback) {
                    callback(null, 'End');
                }
            ],
            function(err, result) {
                console.log('END POST YESTERDAY STAT');
            });

}, null, true, 'Europe/Moscow');



/* FUNCTIONS */

function downloadFile(fileName, url, callback1) {

	console.log('Start download');

	if(fs.existsSync(fileName)) {
				fs.unlink(fileName);
			}


	(async () => {
        try {
    	  var browser = await puppeteer.launch({
    							  headless: true,
    							  args: [
    							    '--proxy-server="direct://"',
    							    '--proxy-bypass-list=*',
                                    '--no-sandbox', 
                                    '--disable-setuid-sandbox'
    							  ]
    							});
    	  var page = await browser.newPage();

    	  await page.goto('https://imonetizeit.com/site/login');
    	  await page.waitForSelector('#LoginForm_email');
    	  await page.focus('#LoginForm_email');
    	  await page.type('#LoginForm_email', imon_login);
    	  await page.focus('#LoginForm_password');
    	  await page.type('#LoginForm_password', imon_pass);
    	  await page.click('#login-form > div.form-row.form-row_button > div > input');

    	  imon_cookies = await page.cookies();
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
    	  	fs.writeFile(fileName, dataGet[0], "binary", function(err, x) {console.log('Wrote file');});
    	  	callback1();
    	  }
        } catch(e) {
            console.log('Error: ' + e);
            callback1();
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
      bot.sendMessage(chatIdImon, 'Stat for ' + `${year}-${month}-${day}` + " \n" + result.data);
      callback1();
    })
    .catch(error => {
        console.error('Upload failed:');
        callback1();
    });

}