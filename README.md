<h2 align="center"><i>json</i>frame</h2> 

<h4 align="center">
	<span>smart & powerful multi-level scraper with json input/output</span><br>
	<br>
	<a href="https://www.npmjs.com/package/jsonframe-cheerio">
		<img src="https://img.shields.io/badge/npm-jsonframe--cheerio-green.svg" alt="npm jsonframe-cheerio">
	</a>
	<a href="https://travis-ci.org/gahabeen/jsonframe-cheerio">
		<img src="https://img.shields.io/travis/gahabeen/jsonframe-cheerio.svg" alt="">
	</a>
	<a href="https://github.com/cheeriojs/cheerio#cheerio">
		<img src="https://img.shields.io/badge/plugin-Cheerio-red.svg" alt="a Cheerio Plugin" />
	</a>
</h4>

## Features

😍 **JSON Syntax**: `json frame` gives you the ability to scrape any multi-level structured data from a JSON object to another JSON object as output.

🌈 **Simple & Crazy Fast**: forget about the coding and focus on the data to extract - see them being scraped at light speed.

💪 **Supercharged**: `json frame` also includes in its core some amazing features like **email** or **phone parsing**.

🤙 **As simple as**:

```js
let cheerio = require('cheerio')
let $ = cheerio.load('<div><h1>I love jsonframe!</h1><div>');

let jsonframe = require('jsonframe-cheerio');
jsonframe($); // initializing the plugin

console.log( $('div').scrape({"title": "h1"}) );
//=> {"title": "I love jsonframe!"}

```

## Installation

Via `NPM`

```
npm i jsonframe-cheerio --save
```

Via `YARN`

```
yarn add jsonframe-cheerio
```

## API


### Loading
Start by `loading Cheerio`.

```js
let cheerio = require('cheerio')
let $ = cheerio.load("HTML DOM to load"); // See Cheerio API
```

Then `load the jsonframe plugin`.

```js
let jsonframe = require('jsonframe-cheerio'); // require from npm package
jsonframe($); // apply the plugin to the current Cheerio instance
```

### Scraper 

Once the plugin is loaded, you've first got to set the **frame** of your data.

Let's take the following `HTML example`:

```html
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
		<span itemprop="email">Email: example@google.net</div>
	</div>
</body>
</html>
```

#### $( selector ).scrape( frame , [options])

`selector` is defined in [Cheerio's documentation](https://github.com/cheeriojs/cheerio#-selector-context-root-)

`frame` is a JSON or Javascript Object

`options` are detailed [later in its own section](#options)

```js
var frame = {
	"title": "h2" // CSS selector
};
```

We then pass the frame to the function:

```js
var result = $('body').scrape(frame);
console.log( result );
//=> {"title": "Pricing"}
```

### Frame

#### Get simple data - inline selector
Most common selector, `only one line`.

```js
var frame = { "title": "h2" };
```

will output to:

```js
{ "title": "Pricing" };
```

#### Get attribute data - object { selector, attr }
Allows you to retrieve `any attribute data`.

```js
var frame = { 
	"proPrice": {
		"selector": ".planName:contains('Pro') + span",
		// The selector above shows that it works even when more complex
		// You could have of course simply used .planPrice ;)
		"attr": "price"
	}	
};
```

will output to:

```js
{ "proPrice": "39.00" };
```

#### Get parsed data with type - object { selector, type }
Allows you to parse specific data like `telephone` or `email`.

```js
var frame = { 
	"email": {
		"selector": "[itemprop=email]",
		"type": "email"		
	},
	"frphone": {
		"selector": "[itemprop=frphone]",
		"type": "telephone"	
	}
};
```

will output to:

```js
{ 
	"email": "example@google.net",
	"frphone": "33238303790"
};
```

#### Get array / list of data - object { selector, data: [{}] }
Allows you to get an `array / list of data`.

```js
var frame = { 
	"pricing": {
		"selector": "#pricing .item",
		"data": [{
			"name": ".planName",
			"price": ".planPrice"
		}]
	}	
};
```

will output to:

```js
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
};
```

#### Get child data - object { selector, data: {} }
Allows you to segment your data by `setting a parent section` from which the child data will be scraped.

```js
var frame = { 
	"pricing": {
		"selector": "#pricing .item",
		"data": {
			"name": ".planName",
			"price": ".planPrice"
		}
	}	
};
```

will output to:

```js
{ 
	"pricing":{
		"name": "Hacker",
		"price": "Free"
	}
};
```
> Note here that we get the first returned result (#pricing .item).

#### Full example
See how you can properly `structure your data`, ready for the output!

```js
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
```

will output to:

```js
{ 
	"pricing":[
		{
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
};
```
> Note here that we get the first returned result (#pricing .item).


### Options
More to come soon!

## Tests

One shot tests
```bash
npm run test
```

Watching test on updates
```bash
npm run test-watch
```

## Contributing 🤝
> Feel free to follow the procedure to make it even more awesome!

1. Create an `issue` so we `get the discussion started`
2. Fork it!
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request :D


## License
Made by Gabin Desserprit 🇫🇷 <br>
Released under MIT License