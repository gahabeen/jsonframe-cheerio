'use strict';

const _ = require('lodash')

var cleanEntry = function (text) {
	return text.replace(/\s+/gm, " ").trim()
}

var getTheRightData = function (node, {
	attr = null,
	extractor = null,
	parse = null
} = {}) {

	var result = null
	if (!attr && extractor === "html") {
		result = cleanEntry(parseData(node.html(), parse))
	} else if (!attr) {
		result = cleanEntry(parseData(extractByExtractor(node.text(), extractor), parse))
	} else {
		result = cleanEntry(parseData(extractByExtractor(node.attr(attr), extractor), parse))
	}

	return result
}

var parseData = function (data, regex) {
	var result = data
	if (regex) {
		try {
			var rgx = regex
			if (_.isString(regex)) {
				rgx = new RegExp(regex, 'gim')
			}
			result = data.match(rgx)[0]
		} catch (error) {
			// console.log("Regex error: ", error);
		}
	}

	return result
}

var filter

var extractByExtractor = function (data, extractor) {
	var result = data
	var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi

	if (["telephone", "phone"].includes(extractor)) {
		result = data.replace(/\D/g, "") || data
	} else if (["email", "mail", "@"].includes(extractor)) {
		result = data.match(emailRegex)[0] || data
	}

	return result
}

var getPropertyFromObj = function (obj, propertyName) {
	var properties = {
		'selector': ['selector', '_s', '_selector'],
		'attribute': ['attr', 'attribute', '_attr', '_a'],
		'filter': ['filter', '_filter', '_f'],
		'extractor': ['extractor', '_e', 'type', '_t'], //keep temporary old types
		'data': ['data', '_d', '_data'],
		'parser': ['parse', '_parse', '_p'],
		'group': ['_g', '_group']
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

String.protoextractor.oneSplitFromEnd = function (char) {
	var arr = this.split(char),
		res = []

	res[1] = arr[arr.length - 1]
	arr.pop()
	res[0] = arr.join(char)
	return res
}

var extractSmartSelector = function ({
	selector,
	attribute = null,
	filter = null,
	extractor = null,
	parse = null
}) {
	var res = {
		"selector": selector,
		"attribute": attribute,
		"filter": filter,
		"extractor": extractor,
		"parse": parse
	}

	// console.log("Selector Working on: ", selector)
	// console.log("Entry :", JSON.stringify(res, null, 2))

	if (res.selector.includes('||')) {
		res.parse = res.selector.oneSplitFromEnd('||')[1].trim()
		res.selector = res.selector.oneSplitFromEnd('||')[0].trim()
	}

	if (res.selector.includes('|')) {
		res.filter = res.selector.oneSplitFromEnd('|')[1].trim()
		res.selector = res.selector.oneSplitFromEnd('|')[0].trim()
	}

	if (res.selector.includes('<')) {
		res.extractor = res.selector.oneSplitFromEnd('<')[1].trim()
		res.selector = res.selector.oneSplitFromEnd('<')[0].trim()
	}

	if (res.selector.includes('@')) {
		res.attribute = res.selector.oneSplitFromEnd('@')[1].trim()
		res.selector = res.selector.oneSplitFromEnd('@')[0].trim()
	}

	// console.log("Result :", JSON.stringify(res, null, 2))

	return res
}

module.exports = function ($) {

	// real protoextractor
	$.protoextractor.scrape = function (frame, {
		debug = false,
		timestats = false
	} = {}) {

		var output = {}
		var mainNode = $(this)

		let iterateThrough = function (obj, elem, node) {

			let gTime = new Date().getTime()

			Object.keys(obj).forEach(function (key) {

				// Security for jsonpath in "_to" > "_frame"
				if (key === "_frame" || key === "_from") {
					elem[key] = obj[key]
				} else {

					try {

						var gSelector, gAttribute, gExtractor, gData, gParse, gGroup, gINFO

						if (_.isObject(obj[key]) && !_.isArray(obj[key])) {
							gSelector = getPropertyFromObj(obj[key], 'selector')
							gAttribute = getPropertyFromObj(obj[key], 'attribute')
							gFilter = getPropertyFromObj(obj[key], 'filter')
							gExtractor = getPropertyFromObj(obj[key], 'extractor')
							gData = getPropertyFromObj(obj[key], 'data')
							gParse = getPropertyFromObj(obj[key], 'parser')
							gGroup = getPropertyFromObj(obj, 'group')
							// console.log("gSelector", gSelector);
							// console.log("gData", gData);

							// console.log("gParse", gParse);


							if (gSelector && gData && _.isObject(gGroup)) {

								var n = getNodeFromSmartSelector($(node), gSelector)
								iterateThrough(gData, elem, $(n))

							} else if (gSelector && _.isString(gSelector)) {

								gINFO = extractSmartSelector({
									selector: gSelector
								})

								gSelector = gINFO.selector
								gParse = gParse ? gParse : gINFO.parse
								gAttribute = gAttribute ? gAttribute : gINFO.attribute
								gExtractor = gExtractor ? gExtractor : gINFO.extractor

								if (gData && _.isObject(gData)) {

									if (_.isArray(gData)) {

										// Check if object in array
										if (_.isObject(gData[0]) && _.size(gData[0]) > 0) {

											elem[key] = [];

											$(node).find(gSelector).each(function (i, n) {
												elem[key][i] = {};
												iterateThrough(gData[0], elem[key][i], $(n));
											});

											// If no object, taking the single string
										} else if (_.isString(gData[0])) {
											elem[key] = []

											var n = getNodeFromSmartSelector($(node), gSelector)

											if (timestats) {
												elem[key] = {}
												elem[key]['_value'] = []
												n.each(function (i, n) {
													elem[key]['_value'][i] = getTheRightData($(n), {
														extractor: gExtractor,
														attr: gAttribute,
														parse: gParse
													})
												});
												elem[key]['_timestat'] = timeSpent(gTime)
											} else {
												n.each(function (i, n) {
													elem[key][i] = getTheRightData($(n), {
														extractor: gExtractor,
														attr: gAttribute,
														parse: gParse
													})
												});
											}


										}

										// Simple data object to use parent selector as base
									} else {

										if (_.size(gData) > 0) {
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
												extractor: gExtractor,
												attr: gAttribute,
												parse: gParse
											});
											elem[key]['_timestat'] = timeSpent(gTime)
										} else {
											elem[key] = getTheRightData($(n), {
												extractor: gExtractor,
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
						} else if (_.isArray(obj[key])) {

							if (_.isString(obj[key][0])) {

								gINFO = extractSmartSelector({
									selector: obj[key][0]
								})
								gSelector = gINFO.selector
								gParse = gParse ? gParse : gINFO.parse
								gAttribute = gAttribute ? gAttribute : gINFO.attribute
								gExtractor = gExtractor ? gExtractor : gINFO.extractor

								elem[key] = []
								var n = getNodeFromSmartSelector($(node), gSelector)

								if (timestats) {
									elem[key] = {}
									elem[key]['_value'] = []
									n.each(function (i, n) {
										elem[key]['_value'][i] = getTheRightData($(n), {
											extractor: gExtractor,
											attr: gAttribute,
											parse: gParse
										})
									});
									elem[key]['_timestat'] = timeSpent(gTime)
								} else {
									n.each(function (i, n) {
										elem[key][i] = getTheRightData($(n), {
											extractor: gExtractor,
											attr: gAttribute,
											parse: gParse
										})
									});
								}

							}
						}
						// The Parameter is a single string === selector > directly scraped
						else {

							gINFO = extractSmartSelector({
								selector: obj[key]
							})
							gSelector = gINFO.selector
							gParse = gParse ? gParse : gINFO.parse
							gAttribute = gAttribute ? gAttribute : gINFO.attribute
							gExtractor = gExtractor ? gExtractor : gINFO.extractor

							var n = getNodeFromSmartSelector($(node), gSelector)
							// console.log(object);
							if (n.length > 0) {

								if (!gAttribute && n.get(0).tagName === "img") {
									gAttribute = "src"
								}

								if (timestats) {
									elem[key] = {}
									elem[key]['_value'] = getTheRightData(n, {
										extractor: gExtractor,
										attr: gAttribute,
										parse: gParse
									})
									elem[key]['_timestat'] = timeSpent(gTime)
								} else {
									elem[key] = getTheRightData(n, {
										extractor: gExtractor,
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


				}

			})
		}

		iterateThrough(frame, output, mainNode)

		return output
	};


};