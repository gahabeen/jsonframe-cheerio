'use strict';

/**
 * Plugin function.
 * @param  {json} frame with DOM selectors.
 * @param  {function?} handle the frame json structure to output the scraped version
 * @return {javascript object} with the scraped structured data 
 */

var cleanEntry = function (text) {
	return text.replace(/\s+/gm, " ").trim()
}

var getTheRightData = function (node, {
	attr = null,
	type = null,
	parse = null
} = {}) {

	var result = null
	if (!attr && type === "html") {
		result = cleanEntry(parseData(node.html(), parse))
	} else if (!attr) {
		result = cleanEntry(parseData(extractByType(node.text(), type), parse))
	} else {
		result = cleanEntry(parseData(extractByType(node.attr(attr), type), parse))
	}

	return result
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

var parseData = function (data, regex) {
	var result = data
	if (regex) {
		if(typeof regex === "string") { 
			// var rgx = escapeRegExp(regex)
			// // var rgx = new RegExp('' + regex.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/, "\\$&") + '')
			// rgx = new RegExp(rgx)
			// console.log("rgx", rgx)
			// console.log("data.match(rgx)", data.match(rgx))
			// result = data.match(rgx)[0]
		} else {
			result = data.match(regex)[0]
		}
	}

	return result
}

var extractByType = function (data, type) {
	var result = data
	var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi

	if (["telephone", "phone"].includes(type)) {
		result = data.replace(/\D/g, "") || data
	} else if (["email", "mail", "@"].includes(type)) {
		result = data.match(emailRegex)[0] || data
	}

	return result
}

var getPropertyFromObj = function (obj, propertyName) {
	var properties = {
		'selector': ['selector', '_s', '_selector'],
		'attribute': ['attr', 'attribute', '_attr', '_a'],
		'type': ['type', '_t'],
		'data': ['data', '_d', '_data'],
		'parse': ['parse', '_parse', '_p']
	}
	var ob = this
	var res = null
	if (properties[propertyName]) {
		properties[propertyName].forEach(function (property, i) {
			if (obj[property]) {
				res = obj[property]
				return
			}
		})
	}
	return res
}

var getNodeFromSmartSelector = function (node, selector) {
	if (selector === "_parent_") {
		return node
	} else {
		return node.find(selector)
	}
}

var timeSpent = function (lastTime) {
	return new Date().getTime() - lastTime
}

String.prototype.oneSplitFromEnd = function (char) {
	var arr = this.split(char),
		res = []
	res[1] = arr[arr.length - 1]
	arr.pop()
	res[0] = arr.join(char)
	return res
}

var extractSmartSelector = function ({selector, attribute = null, type = null, parse = null}) {
	var res = {	
		"selector": selector,
		"attribute": attribute,
		"type": type,
		"parse": parse
	}

	// console.log("Selector Working on: ", selector)
	// console.log("Entry :", JSON.stringify(res, null, 2))

	if (res.selector.includes('||')) {
		res.parse = res.selector.oneSplitFromEnd('||')[1].trim()
		res.selector = res.selector.oneSplitFromEnd('||')[0].trim()
	}

	if (res.selector.includes('|')) {
		res.type = res.selector.oneSplitFromEnd('|')[1].trim()
		res.selector = res.selector.oneSplitFromEnd('|')[0].trim()
	}

	if (res.selector.includes('@')) {
		res.attribute = res.selector.oneSplitFromEnd('@')[1].trim()
		res.selector = res.selector.oneSplitFromEnd('@')[0].trim()
	}

	// console.log("Result :", JSON.stringify(res, null, 2))

	return res
}

module.exports = function ($) {

	// real prototype
	$.prototype.scrape = function (frame, {
		debug = false,
		timestats = false
	} = {}) {

		var output = {}
		var mainNode = $(this)

		let iterateThrough = function (obj, elem, node) {

			let gTime = new Date().getTime()

			Object.keys(obj).forEach(function (key) {

				try {

					var gSelector, gAttribute, gType, gData, gParse, gINFO

					if (typeof obj[key] === "object") {

						gSelector = getPropertyFromObj(obj[key], 'selector')
						gAttribute = getPropertyFromObj(obj[key], 'attribute')
						gType = getPropertyFromObj(obj[key], 'type')
						gData = getPropertyFromObj(obj[key], 'data')
						gParse = getPropertyFromObj(obj[key], 'parse')

						console.log("gParse", gParse);

						if (gSelector && typeof gSelector === "string") {

							gINFO = extractSmartSelector({selector: gSelector})
							gSelector = gINFO.selector
							gParse = gParse ? gParse : gINFO.parse
							gAttribute = gAttribute ? gAttribute : gINFO.attribute
							gType = gType ? gType : gINFO.type

							if (gData && typeof gData === "object") {

								if (Array.isArray(gData)) {

									// Check if object in array
									if (typeof gData[0] === "object" && Object.keys(gData[0]).length > 0) {

										elem[key] = [];

										$(node).find(gSelector).each(function (i, n) {
											elem[key][i] = {};
											iterateThrough(gData[0], elem[key][i], $(n));
										});

										// If no object, taking the single string
									} else if (typeof gData[0] === "string") {
										elem[key] = []

										var n = getNodeFromSmartSelector($(node), gSelector)

										if (timestats) {
											elem[key] = {}
											elem[key]['_value'] = []
											n.each(function (i, n) {
												elem[key]['_value'][i] = getTheRightData($(n), {
													type: gType,
													attr: gAttribute,
													parse: gParse
												})
											});
											elem[key]['_timestat'] = timeSpent(gTime)
										} else {
											n.each(function (i, n) {
												elem[key][i] = getTheRightData($(n), {
													type: gType,
													attr: gAttribute,
													parse: gParse
												})
											});
										}


									}

									// Simple data object to use parent selector as base
								} else {

									if (Object.keys(gData).length > 0) {
										elem[key] = {};
										var n = $(node).find(gSelector).first();
										iterateThrough(gData, elem[key], $(n));
									}

								}

							} else {

								var n = getNodeFromSmartSelector($(node), gSelector)

								if (n.length > 0) {

									if (!gAttribute && n.get(0).tagName === "img") {
										gAttribute = "src"
									}

									if (timestats) {
										elem[key] = {}
										elem[key]['_value'] = getTheRightData($(n), {
											type: gType,
											attr: gAttribute,
											parse: gParse
										});
										elem[key]['_timestat'] = timeSpent(gTime)
									} else {
										elem[key] = getTheRightData($(n), {
											type: gType,
											attr: gAttribute,
											parse: gParse
										});
									}

								} else {
									elem[key] = null;
								}
							}
						}

						// There is no Selector but still an Object for organization
						else {
							elem[key] = {};
							iterateThrough(obj[key], elem[key], node);
						}
					}

					// The Parameter is a single string === selector > directly scraped
					else {

						gINFO = extractSmartSelector({selector: obj[key]})
						gSelector = gINFO.selector
						gParse = gParse ? gParse : gINFO.parse
						gAttribute = gAttribute ? gAttribute : gINFO.attribute
						gType = gType ? gType : gINFO.type

						var n = getNodeFromSmartSelector($(node), gSelector)
						// console.log(object);
						if (n.length > 0) {

							if (!gAttribute && n.get(0).tagName === "img") {
								gAttribute = "src"
							}

							if (timestats) {
								elem[key] = {}
								elem[key]['_value'] = getTheRightData(n, {
									type: gType,
									attr: gAttribute,
									parse: gParse
								})
								elem[key]['_timestat'] = timeSpent(gTime)
							} else {
								elem[key] = getTheRightData(n, {
									type: gType,
									attr: gAttribute,
									parse: gParse
								})
							}


						} else {
							elem[key] = null
						}
					}

				} catch (error) {
					console.log(error)
				}

			})
		}

		iterateThrough(frame, output, mainNode)

		return output
	};


};