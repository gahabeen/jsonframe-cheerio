const expect = require('expect');
const cheerio = require('cheerio');
var _ = require('lodash');

var jsonframe = require('./../index.js');

var html = `
<html>
<head></head>
<body>
    <h2>Pricing</h2>
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
`;

var $ = cheerio.load(html);

jsonframe($);

describe('JsonFrame Tests', () => {

	describe('Get simple data - inline selector', () => {

		it('should get json object of the title between h2 tags', () => {

			var frame = {
				"title": "h2"
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"title": "Pricing"
				});

		});

	});

	describe('Get attribute data - object { selector, attr }', () => {

		it('should get json object of the pro price', () => {

			var frame = {
				"proPrice": {
					"selector": ".planName:contains('Pro') + span",
					"attr": "price"
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"proPrice": "39.00"
				});

		});

	});


	describe('Get array / list of data - object { selector, data: [{}] }', () => {

		it('should get json object with parent > childs []', () => {

			var frame = {
				"pricing": {
					"selector": "#pricing .item",
					"data": [{
						"name": ".planName",
						"price": ".planPrice"
					}]
				}
			};

			var output = $('body').scrape(frame);

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
				});

		});

	});

	describe('Get child data - object { selector, data: {} }', () => {

		it('should get json object with parent > child', () => {

			var frame = {
				"pricing": {
					"selector": "#pricing .item",
					"data": {
						"name": ".planName",
						"price": ".planPrice"
					}
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"pricing": {
						"name": "Hacker",
						"price": "Free"
					}
				});

		});

	});

	describe('Get Typed (telephone or email) data', () => {

		it('should get the USA telephone value', () => {
			var frame = {
				"telephone": {
					"selector": "[itemprop=usaphone]",
					"type": "telephone"
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"telephone": "912148456"
				});
		});

		it('should get the FR telephone value', () => {
			var frame = {
				"telephone": {
					"selector": "[itemprop=frphone]",
					"type": "telephone"
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"telephone": "33238303790"
				});
		});

		it('should get the email value', () => {
			var frame = {
				"email": {
					"selector": "[itemprop=email]",
					"type": "email"
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"email": "lspurcell@suddenlink.net"
				});
		});

	});

	describe('Full examples', () => {

		it('should get the pricing list + details', () => {

			var frame = {
				"pricing": {
					"selector": "#pricing .item",
					"data": [{
						"name": ".planName",
						"price": {
							"selector": ".planPrice",
							"attr": "price"
						},
						"image": {
							"url": {
								"selector": "img",
								"attr": "src"
							},
							"link": {
								"selector": "a",
								"attr": "href"
							}
						}
					}]
				}
			};

			var output = $('body').scrape(frame);

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
				});

		});

	});

});