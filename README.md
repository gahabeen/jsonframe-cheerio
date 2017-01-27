<h2 align="center">_json_ frame</h2> 

<h4 align="center">
<span>smart & powerful multi-level scraper with json input/output</span><br>

![a Cheerio plugin](https://img.shields.io/badge/plugin-Cheerio-red.svg)

</h4>

## Features

😍 **JSON Syntax**: `_json_ frame` gives you the ability to scrape any multi-level structured data from a JSON object to another JSON object as output.

🌈 **Simple & Crazy Fast**: forget about the coding and focus on the data to extract - see them being scraped at light speed.

💪 **Supercharged**: `_json_ frame` also includes in its core some amazing features like **email** or **phone parsing**.

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
			<span class="planPrice">Free</span>
		</div>
		<li class="item">
			<span class="planName">Pro</span>
			<span class="planPrice">$39</span>
		</div>
	</ul>
</body>
</html>
```

#### $( selector ).scrape( frame , [options])

`selector` is defined in [Cheerio's documentation](https://github.com/cheeriojs/cheerio#-selector-context-root-)

`frame` is a JSON or Javascript Object

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

#### Simple inline selector

```js
var frame = { "title": "h2" };
```

will output to:

```js
{ "title": "Pricing" };
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