const expect = require('expect');
const cheerio = require('cheerio');
var _ = require('lodash');

var jsonframe = require('./../index.js');

var html = `
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
`;

var $ = cheerio.load(html);

jsonframe($);

describe('JsonFrame Tests', () => {

	describe('Get Data from Inline Selector', () => {

		it('should get simple text', () => {

			var frame = {
				"title": "h2"
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"title": "Pricing"
				});

		});

		
		it('should get img src automatically', () => {

			var frame = {
				"picture": ".picture" // even without mentionning the img tag
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"picture": "somepath/to/image.png"
				});

		});

	})

	describe('Get Attribute Data from Object {selector, attribute}', () => {

		it('should get the price attribute value', () => {

			var frame = {
				"proPrice": {
					_s: ".planName:contains('Pro') + span",
					_a: "price"
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"proPrice": "39.00"
				});

		});

		it('should get the link (href) attribute value', () => {

			var frame = {
				"link": {
					_s: ".mainLink",
					_a: "href"
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"link": "some/url/to/somewhere"
				});

		});

	})

	
	describe('Get Data with Type {selector, type[, attribute,]}', () => {

		it('should get the USA telephone value', () => {
			var frame = {
				"telephone": {
					_s: "[itemprop=usaphone]",
					_t: "telephone"
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
					_s: "[itemprop=frphone]",
					_t: "telephone"
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
					_s: "[itemprop=email]",
					_t: "email"
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"email": "lspurcell@suddenlink.net"
				});
		});

		it('should get the inner html value', () => {
			var frame = {
				"inner": {
					_s: ".popup",
					_t: "html"
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"inner": "<span>Some inner content</span>"
				});
		});
		

	})

	describe('Get Parsed Data thanks to Regex {selector, parse[, type, attribute]}', () => {

		it('should get the parsed date dd/mm/yyyy from regex', () => {
			
			var frame = {
				"data": {
					_s: ".date",
					_p: /\d{1,2}\/\d{1,2}\/\d{2,4}/
				}
			};

			var output = $('body').scrape(frame);

			expect(output)
				.toContain({
					"data": "04/02/2017"
				});


		})

	})

	describe('Get Child Obj Data {selector, data: {}}', () => {

		it('should get json object with parent > child', () => {

			var frame = {
				"pricing": {
					_s: "#pricing .item",
					_d: {
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

	describe('Get Array / List of Data {selector, data: [{}]}', () => {

		it('should get json object with parent > childs []', () => {

			var frame = {
				"pricing": {
					_s: "#pricing .item",
					_d: [{
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

	describe('Full examples', () => {

		it('should get the pricing list + details', () => {

			var frame = {
				"pricing": {
					_s: "#pricing .item",
					_d: [{
						"name": ".planName",
						"price": {
							_s: ".planPrice",
							_a: "price"
						},
						"image": {
							"url": {
								_s: "img",
								_a: "src"
							},
							"link": {
								_s: "a",
								_a: "href"
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