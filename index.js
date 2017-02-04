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
	if (!attr) {
		result = cleanEntry(parseData(extractByType(node.text(), type), parse))
	} else {
		result = cleanEntry(parseData(extractByType(node.attr(attr), type), parse))
	}

	return result
}

var parseData = function (data, regex) {
	var result = data
	if (regex) {
		result = data.match(regex)[0]
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

					if (typeof obj[key] === "object") {

						var gSelector = getPropertyFromObj(obj[key], 'selector')
						var gAttribute = getPropertyFromObj(obj[key], 'attribute')
						var gType = getPropertyFromObj(obj[key], 'type')
						var gData = getPropertyFromObj(obj[key], 'data')
						var gParse = getPropertyFromObj(obj[key], 'parse')

						if (gSelector && typeof gSelector === "string") {

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
												elem[key]['_value'][i] = getTheRightData($(n))
											});
											elem[key]['_timestat'] = timeSpent(gTime)
										} else {
											n.each(function (i, n) {
												elem[key][i] = getTheRightData($(n))
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

						var n = getNodeFromSmartSelector($(node), obj[key])
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