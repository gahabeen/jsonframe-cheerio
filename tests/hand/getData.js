const fs = require('fs')
const cheerio = require('cheerio')
let jsonframe = require('./../../index')

let html = fs.readFileSync('./sample.html').toString()

let $ = cheerio.load(html)
jsonframe($)

let frame = {
	"img": ".picture @ src",
	"__something": {
		"yes": "title"
	}
}


let result = $('html').scrape(frame, {
	string: true
})

console.log("Result:", result)