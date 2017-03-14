const fs = require('fs')
const cheerio = require('cheerio')
let jsonframe = require('./../../index')

let html = fs.readFileSync('./sample.html').toString()

let $ = cheerio.load(html)
jsonframe($)

let frame = {
	"title": "title"
	// _g_body: {
	// 	_s: "body",
	// 	_d: {
	// 		"ul": ["ul li  | ucase"]
	// 	}
	// }
}

let result = $('html').scrape(frame, {
	string: true
})

console.log("Result:", result)