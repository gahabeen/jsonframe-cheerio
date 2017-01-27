<h2 align="center">_json_ frame</h1> 

<h4 align="center">
	<p>plugin for Cheerio adding smart & powerful multi-level scraper with json input/output</p>


</h4>

## Quick example
```js
let cheerio = require('cheerio')
let frame = require('jsonframe-cheerio'); // json frame plugin

let html = `
<body>
	<ul id="pricing" class="menu">
		<li class="item">
			<span class="planName">Hacker</span>
			<span class="planPrice">Free</span>
		</div>
		<li class="item">
			<span class="planName">Pro</span>
			<span class="planPrice">$39</span>
		</div>
	</ul>
</body>
`;
let $ = cheerio.load(html);

frame($); // initializing the plugin

var pricingFrame = {
	"pricing": {
		"selector": "#pricing",
		"data": [{
			"name": ".planName",
			"price": ".planPrice"
		}]
	}
};

var output = $('body').scrape(pricingFrame); // scrape data based on pricingFrame json obj
console.log(output);
/*
{
	"pricing": [
		{	
			"name": "Hacker",
			"price": "Free"
		},
		{	
			"name": "Pro",
			"price": "$39"
		}
	]
}

*/

```

## Installation

```js
npm i jsonframe-cheerio --save
// or
yarn i jsonframe-cheerio --save
```

## Features


## Get started
Start by loading Cheerio.
```js
let cheerio = require('cheerio')
let $ = cheerio.load("HTML DOM to load"); // See Cheerio API
```

Then load and apply json frame plugin.
```js
let frame = require('jsonframe-cheerio'); // loading from npm package
frame($);
```

## API

## 🤝 Contributing
> Feel free to follow the procedure to make it even more awesome!

1. Create an `issue` so we `get the discussion started`
2. Fork it!
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request :D

## History

## License
> Released under MIT License