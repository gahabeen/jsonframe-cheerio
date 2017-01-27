const expect = require('expect');
var _ = require('lodash');


describe('Frame Scraper for Nightmare.js', () => {

	describe('One line Selector', () => {

		// Example:
		// { "name": ".path.selector" }

		it('should get element textContent : name', (done) => {

			var page = baseUrl + "company.html";
			var frame = {
				"name": "#company .name"
			};

			var nightmare = Nightmare(nightmareOptions);

			nightmare
				.viewport(viewport.w, viewport.h)
				.goto(page, headers)
				.wait(wait)
				.scrape(frame)
				.end()
				.then((result) => {
					expect(result).toInclude({
						"name": "The company name"
					});
					done();
				})
				.catch((e) => done(e));

		});

	});

});