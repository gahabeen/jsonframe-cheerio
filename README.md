<h2 align="center"><i>json</i>frame</h2> 

<h4 align="center">
	<span>simple multi-level scraper json input/output</span><br>
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

****

## **2.0.0** features

😍 **JSON Syntax**: input json, output the same structured json including with scraped data

🌈 **Simple patterns**: simple inline `selectors`, `extractors`, `filters` and `parser`.

💪 **Reliable & fast**: used in production within crawlers


## Example

```js
let cheerio = require('cheerio')
let $ = cheerio.load(`
	<body>
		<h1>I love jsonframe!</h1>
		<span itemprop="email"> Email: gabin@datascraper.pro  </span>
	<body>`);

let jsonframe = require('jsonframe-cheerio');
jsonframe($); // initializing the plugin

let frame = {
	"title": "h1", // this is an inline selector
	"email": "span[itemprop=email] < email" // output an extracted email
}

console.log( JSON.stringify( $('body').scrape(frame) ,null,2) );
/*=> 
{
	"title": "I love jsonframe!",
	"email": "gabin@datascraper.pro"
}
/*
```

## Use

**Install the plugin** to your Node.js app through **NPM**

```
npm i jsonframe-cheerio --save
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
```

#### $( selector ).scrape( frame , {options})

`selector` is defined in [Cheerio's documentation](https://github.com/cheeriojs/cheerio#-selector-context-root-)

`frame` is a JSON or Javascript Object

`{options}` are detailed [later in its own section](#options)

```js
let frame = {
	"title": "h2" // CSS selector
};
```

We then pass the frame to the function:

```js
let result = $('body').scrape(frame);
console.log(JSON.stringify( result , null, 2 ))
//=> {"title": "Pricing"}
```

### Frame

#### Inline Selector
Most common selector, `inline line` by specifying nothing more than the data name property and the selector as its value.

```js
...
let frame = { "title": "h2" }

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
	{ "title": "Pricing" }
*/
...
```

#### New : Inline attribute / extractor / parser
You can now declare everything in line. You should just be careful to always use them in the following order when combining them : `@ (attribute), | (extractor), || (parse)`.

_See examples for each of them above._

#### Attribute
`_a: "attributeName"` allows you to retrieve `any attribute data`  
`@` inside the selector `_s` allows you to do it inline

```js
...
let frame = {
	"proPrice": ".planName:contains('Pro') + span@price"
}

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
	{ "proPrice": "39.00" }
*/
...
```


#### Extractor
`|` inside the selector `_s` allows you to do it inline

It currently supports `email` (also `mail`), `telephone` (also `phone`) and `html` (to get the inner html) and by default (no declaration), we get the `inner text`.

```js
...
let frame = { 
	"email": "[itemprop=email] < phone",
	"frphone": "[itemprop=frphone] < phone"
}

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
	{ 
		"email": "example@google.net",
		"frphone": "33238303790"
	}
*/
...
```

#### Parse / Regex
`||` inside the selector `_s` allows you to use regexes in line
`_p: /regex/` allows you to extract data based on **regular expressions**  


```js
...
let frame = { 
	"data": ".date || \\d{1,2}/\\d{1,2}/\\d{2,4}"
}

// or use the longer version for proper regex entry

let frame = {
	"data": {
		_s: ".date",
		_p: /\d{1,2}\/\d{1,2}\/\d{2,4}/ // n[n]/n[n]/nn[nn] format here
	}
}

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
	{ 
		"date": "04/02/2017"
	}
*/
...
```

#### List / Array
`_d: [{ }]` allows you to get an `array / list of data`  
`_d: ["_parent_"]` will retrieves a list based on the parent selector  

You could even shorten it more by listing right from the selector as follows: 
`"selectorName": [".selector"]` which returns an array of strings

```js
...
let frame = { 
	"pricing": {
		_s: "#pricing .item",
		_d: [{
			"name": ".planName",
			"price": ".planPrice"
		}]
	}	
}

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
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

// Or a shorter way which works for simple string arrays

let frame = { 
	"pricingNames": ["#pricing .item .planName"]
}

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
	{ 
		"pricingNames": ["Hacker", "Pro"]	
	}
*/
...
```
#### Grouped
`"_g": { _s: "", _d: {} }` allows you to group some data selectors by a parent selector without naming the parent

```js
...
let frame = { 
	_g: {
		_s: "#pricing .item",
		_d: {
			"name": ".planName",
			"price": ".planPrice"
		}
	}	
}

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
	{ 
		"name": "Hacker",
		"price": "Free"
	}
*/
...
```

#### Nested
`"parent": { _s: "parentSelector", _d: {} }` allows you to segment your data by `setting a parent section` from which the child data will be scraped.  

You can also use `"parent": { }` when you only want to nest data into objects without setting a parent selector.

```js
...
let frame = { 
	"pricing": {
		_s: "#pricing .item",
		_d: {
			"name": ".planName",
			"price": ".planPrice"
		}
	}	
}

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
	{ 
		"pricing":{
			"name": "Hacker",
			"price": "Free"
		}
	}
*/
...
```

> Note here that we get the first returned result (#pricing .item).

#### Example
See how you can properly `structure your data`, ready for the output!

```js
...
let frame = { 
	"pricing": {
		_s: "#pricing .item",
		_d: [{
			"name": ".planName",
			"price": ".planPrice @ price",
			"image": {
				"url": "img @ src",
				"link": "a @href"
			}
		}]
	}	
}

let result = $('body').scrape(frame)
console.log(JSON.stringify( result , null, 2 ))

/* output =>
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
	}
*/
...
```

> Note here that we get the first returned result (#pricing .item).


### Options

#### { timestats: true } (_default: false_)  
Measure time spent on each node (in milliseconds)

```js
...
let frame = { 
	"proPrice": {
		_s: ".planName:contains('Pro') + span",
		_a: "price"
	}	
};

let result = $('body').scrape(frame, {timestats: true})
console.log(JSON.stringify( result , null, 2 ))

/* output =>
	{ 
		"proPrice": {
			"value":"39.00",
			"_timestats": "1" // ms
		}
	
	}
*/
...
```

## Tests

One shot tests
```bash
npm run test
```

Watching test on updates
```bash
npm run test-watch
```


## Changelog

**2.0.0** (12/02/2017)
- ⚠ Changing  ~~`Type`~~ for `Extractor` with shortcode `<` instead of `|`
- ⚠ Adding `filters` with the shortcode `|`
- Adding inline parameters support for `"attribute"`, `"extractor"` and `"parse"`
- Adding simple string arrays from inline selector
- Adding group property to group data selectors whitout naming the group (childs take the place of the group property `"_g"` or `"_group"` )


**1.1.1** (05/02/2017)
- Adding short & functionnal parameters ( `_s`, `_t`, `_a`) instead of `"selector"`, `"extractor"`, `"attr"`. Idea behind being to easily differentiate **retrieved data name** to **functionnal data**.
- Adding an automatic handler for `img` selected element (automatically retrieve the img src link)
- Adding the `_parent_` selector to target the **parent content**
- Adding a **regex parser** with the functionnal parameter **parse**: `_p` (`_parse` works too)
- Adding **extractor** `_t: "html"` feature to get back **inner html of a selector**
- Added **timestats** to measure time spent on each node via `.scrape(frame, {timestats: true})`
- Refactorization of the whole code to make it evolutive (DRY)
- Update of the tests cases accordingly


**1.0.0** (27/01/2017)
- Stable version release with basic features  

## Contributing 🤝
> Feel free to follow the procedure to make it even more awesome!

1. Create an `issue` so we `get the discussion started`
2. Fork it!
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request :D


## License
[Gabin Desserprit](mailto:gabin@datascraper.pro) - [datascraper.pro](datascraper.pro)  
Released under MIT License