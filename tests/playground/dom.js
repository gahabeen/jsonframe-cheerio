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
				"phone": {
					"selector": ".phone",
					"type": "phone"	
				},
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

// var s = $('body').scrape(f);

// console.log("RESULTS");
// console.log(JSON.stringify(s, null, 2));

// console.log(f["companies"]['data'][0]);

// var parseType = function (type, data){
// 	var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

var parseByType = function (type, data){
	var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

	if(type === "telephone"){
		return data.replace(/\D/g, "");
	} else if (type === "email"){
		return data.match(emailRegex);
	} else {
		return data;
	}
};
// console.log(parseType('telephone', "(979) 776-2697"));
console.log(parseByType('email', "Email: lspurcell@suddenlink.net"));