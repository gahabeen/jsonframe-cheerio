let cheerio = require('cheerio');
var fs = require('fs');
var frame = require('./../index.js');

var $ = cheerio.load(fs.readFileSync('./../html/company.html'));

frame($);

// $('body').find('#headline').text()

var f = {
	"headline": "#headline",
	"mycompanies": {
		"companies": {
			"selector": "#company",
			"data": [{
				"name": ".name",
				"phone": ".phone",
				"email": {
					"selector": ".email",
					"attr": "itemprop"
				}
			}]
		}
	}
};

// $('body').find('#company').each(function(i, n){
// 	console.log($(n).find('.name').text());	
// });

var s = $('body').scrape(f);

console.log("RESULTS");
console.log(JSON.stringify(s, null, 2));

// console.log(f["companies"]['data'][0]);