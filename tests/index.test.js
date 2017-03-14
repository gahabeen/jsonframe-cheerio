const expect = require('expect')
const cheerio = require('cheerio')
let _ = require('lodash')

let jsonframe = require('./../index.js')

let html = `
<html>
<head></head>
<body>
    <h2>Pricing</h2>
		<img class="picture" src="somepath/to/image.png">
		<a class="mainLink" href="some/url/to/somewhere">A Link</a>
		<span class="date"> We are the 04/02/2017</span>
		<div class="popup"><span>Some inner content</span></div>
    <ul id="pricing" class="menu">
        <li class="item">
            <span class="planName">Hacker</span>
            <span class="planPrice" price="0">Free</span>
            <a href="/hacker"> <img src="./img/hacker.png"> </a>
        </div>
        <li class="item">
            <span class="planName">Pro</span>
            <span class="planPrice" price="39.00">$39</span>
            <a href="/pro"> <img src="./img/pro.png"> </a>
        </div>
    </ul>
	<div id="contact">
		<span itemprop="usaphone">Phone USA: (912) 148-456</div>
		<span itemprop="frphone">Phone FR: +332 38 30 37 90</div>
		<span itemprop="email">Email: lspurcell@suddenlink.net</div>
	</div>
</body>
</html>
`

let $ = cheerio.load(html)

jsonframe($)

describe('JsonFrame Tests', () => {

	describe('Get Data from Inline Selector', () => {

		it('should get simple text', () => {

			let frame = {
				"title": "h2"
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"title": "Pricing"
				})

		})


		it('should get img src automatically', () => {

			let frame = {
				"picture": ".picture" // even without mentionning the img tag
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"picture": "somepath/to/image.png"
				})

		})

	})

	describe('Get Attribute Data from Object {selector, attribute}', () => {


		it('should get the price attribute value', () => {

			let frame = {
				"proPrice": ".planName:contains('Pro') + span @ price"
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"proPrice": "39.00"
				})

		})

		it('should get the link (href) attribute value', () => {

			let frame = {
				"link": ".mainLink @ href"
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"link": "some/url/to/somewhere"
				})

		})

	})


	describe('Get Data with Type {selector, type[, attribute,]}', () => {


		it('should get the USA telephone value', () => {
			let frame = {
				"telephone": "[itemprop=usaphone] < telephone"
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"telephone": "(912) 148-456"
				})
		})

		it('should get the FR telephone value', () => {
			let frame = {
				"telephone": "[itemprop=frphone] < telephone"
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"telephone": "+332 38 30 37 90"
				})
		})

		it('should get the email value', () => {
			let frame = {
				"email": "[itemprop=email] < email"
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"email": "lspurcell@suddenlink.net"
				})
		})

		it('should get the inner html value', () => {
			let frame = {
				"inner": ".popup < html"
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"inner": "<span>Some inner content</span>"
				})
		})


	})

	describe('Get Parsed Data thanks to Regex {selector, parse[, type, attribute]}', () => {

		it('should get the parsed date dd/mm/yyyy from regex', () => {

			let frame = {
				"data": ".date || \\d{1,2}/\\d{1,2}/\\d{2,4}"
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"data": "04/02/2017"
				})
		})

	})

	describe('Get Child Obj Data {selector, data: {}}', () => {

		it('should get json object with parent > child', () => {

			let frame = {
				"pricing": {
					_s: "#pricing .item",
					_d: {
						"name": ".planName",
						"price": ".planPrice"
					}
				}
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"pricing": {
						"name": "Hacker",
						"price": "Free"
					}
				})

		})

	})

	describe('Get Array / List of Data {selector, data: [{}]}', () => {

		it('should get json object with parent > childs []', () => {

			let frame = {
				"pricing": {
					_s: "#pricing .item",
					_d: [{
						"name": ".planName",
						"price": ".planPrice"
					}]
				}
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"pricing": [{
							"name": "Hacker",
							"price": "Free"
						},
						{
							"name": "Pro",
							"price": "$39"
						}
					]
				})

		})

	})

	describe('Get child elements grouped by a selector with _g', () => {

		it('should get the data within the first li item', () => {
			let frame = {
				_g: {
					_s: "#pricing .item",
					_d: {
						"name": ".planName",
						"price": ".planPrice @ price",
						"image": {
							"url": "img",
							"link": "a @ href"
						}
					}
				}
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"name": "Hacker",
					"price": "0",
					"image": {
						"url": "./img/hacker.png",
						"link": "/hacker"
					}
				})
		})

	})

	describe('Full examples', () => {

		it('should get the pricing list + details', () => {

			let frame = {
				"pricing": {
					_s: "#pricing .item",
					_d: [{
						"name": ".planName",
						"price": ".planPrice @ price",
						"image": {
							"url": "img",
							"link": "a @ href"
						}
					}]
				}
			}

			let output = $('body').scrape(frame)

			expect(output)
				.toContain({
					"pricing": [{
							"name": "Hacker",
							"price": "0",
							"image": {
								"url": "./img/hacker.png",
								"link": "/hacker"
							}
						},
						{
							"name": "Pro",
							"price": "39.00",
							"image": {
								"url": "./img/pro.png",
								"link": "/pro"
							}
						}
					]
				})

		})

	})

})