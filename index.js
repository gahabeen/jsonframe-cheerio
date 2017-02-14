'use strict';

const _ = require('lodash')
const chrono = require('chrono-node')
const humanname = require('humanname')
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()


let parseData = function (data, regex) {
	let result = data
	if (regex) {
		try {
			let rgx = regex
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

let filterData = function (data, filter) {
	let result = data
	if (["raw"].includes(filter)) {
		// let the raw data
	} else if (["trim"].includes(filter)) {
		result = result.trim()
	} else if (["lowercase", "lcase"].includes(filter)) {
		result = result.toLowerCase()
	} else if (["uppercase", "ucase"].includes(filter)) {
		result = result.toUpperCase()
	} else if (["capitalize", "cap"].includes(filter)) {
		result = _.startCase(result)
	} else if (["numbers"].includes(filter)) {
		result = result.replace(/\D/g, "")
	} else {
		// Default trim and set one spaces
		result = result.replace(/\s+/gm, " ").trim()
	}
	return result
}

let extractByExtractor = function (data, extractor, plural = false) {
	let result = data
	let emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gmi
	let phoneRegex = /\+?\(?\d*\)? ?\(?\d+\)?\d*([\s./-]\d{2,})+/gmi

	if (["phone", "telephone"].includes(extractor)) {
		if (plural) {
			result = data.match(phoneRegex) || data
		} else {
			result = data.match(phoneRegex) !== null ? data.match(phoneRegex)[0] : data
		}
		// let countryCode = result.match(/([A-Z])+/)[0]
		// console.log("countryCode", countryCode);
		// if (countryCode) {
		// 	try {
		// 		result = phoneUtil.parse(result, "US") // with option, the country code number
		// 	} catch (e) {
		// 		//
		// 	}
		// }
	} else if (["email", "mail", "@"].includes(extractor)) {
		if (plural) {
			result = data.match(emailRegex) || data
		} else {
			result = data.match(emailRegex) !== null ? data.match(emailRegex)[0] : data
		}
	} else if (["date", "d"].includes(extractor)) {
		result = chrono.casual.parseDate(data).toString()
	} else if (["fullName", "firstName", "lastName", "initials", "suffix", "salutation"].includes(extractor)) {
		result = humanname.parse(data)
		if ("fullName".includes(extractor)) {
			// return the object
		} else if ("firstName".includes(extractor)) {
			result = result.firstName
		} else if ("lastName".includes(extractor)) {
			result = result.lastName
		} else if ("initials".includes(extractor)) {
			result = result.initials
		} else if ("suffix".includes(extractor)) {
			result = result.suffix
		} else if ("salutation".includes(extractor)) {
			result = result.salutation
		}
	}

	return result
}

let getPropertyFromObj = function (obj, propertyName) {
	let properties = {
		'selector': ['selector', '_s', '_selector'],
		'attribute': ['attr', 'attribute', '_attr', '_a'],
		'filter': ['filter', '_filter', '_f'],
		'extractor': ['extractor', '_e', 'type', '_t'], //keep temporary old types
		'data': ['data', '_d', '_data'],
		'parserr': ['parser', '_parser', '_p'],
		'group': ['_g', '_group']
	}
	let ob = this
	let res = null
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

let getNodeFromSmartSelector = function (node, selector) {
	if (selector === "_parent_") {
		return node
	} else {
		return node.find(selector)
	}
}

let timeSpent = function (lastTime) {
	return new Date().getTime() - lastTime
}

String.prototype.oneSplitFromEnd = function (char) {
	let arr = this.split(char),
		res = []

	res[1] = arr[arr.length - 1]
	arr.pop()
	res[0] = arr.join(char)
	return res
}

let extractSmartSelector = function ({
	selector,
	attribute = null,
	filter = null,
	extractor = null,
	parser = null
}) {
	let res = {
		"selector": selector,
		"attribute": attribute,
		"filter": filter,
		"extractor": extractor,
		"parser": parser
	}

	if (res.selector.includes('||')) {
		res.parser = res.selector.oneSplitFromEnd('||')[1].trim()
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

	return res
}

module.exports = function ($) {

	let getTheRightData = function (node, {
		attr = null,
		extractor = null,
		filter = null,
		parser = null,
		multiple = false
	} = {}) {

		let results = []
		let localNodes = []

		for (var index = 0; index < node.length; index++) {
			localNodes.push(node[index])
		}

		if (multiple && localNodes.length > 1) {
			// Do a looop and stuff
		} else if (localNodes.length > 1) {
			// reset to the only first child
			let tempNode = localNodes[0]
			localNodes = []
			localNodes.push(tempNode)
		}

		localNodes.forEach(function (localNode, index) {

			if (attr) {
				results[index] = $(localNode).attr(attr)
			} else if (extractor === "html") {
				results[index] = $(localNode).html()
			} else {
				results[index] = $(localNode).text()
			}

			if (extractor && extractor !== "html") {
				results[index] = extractByExtractor(results[index], extractor)
			}

			if (_.isObject(results[index])) {
				_.forOwn(results[index], function (value, key) {
					results[index][key] = filterData(results[index][key], filter)
				})
			} else {
				results[index] = filterData(results[index], filter)
			}

			if (parser) {
				results[index] = parseData(results[index], parser)
			}

		})

		if (!multiple) {
			return results[0]
		} else {
			return results
		}

	}


	// real prototype
	$.prototype.scrape = function (frame, {
		debug = false,
		timestats = false,
		string = false
	} = {}) {

		let output = {}
		let mainNode = $(this)

		let iterateThrough = function (obj, elem, node) {

			let gTime = new Date().getTime()

			Object.keys(obj).forEach(function (key) {

				// Security for jsonpath in "_to" > "_frame"
				if (key === "_frame" || key === "_from") {
					elem[key] = obj[key]
				} else {

					try {

						let gSelector, gAttribute, gExtractor, gData, gParser, gGroup, gFilter, gINFO

						if (_.isObject(obj[key]) && !_.isArray(obj[key])) {
							gSelector = getPropertyFromObj(obj[key], 'selector')
							gAttribute = getPropertyFromObj(obj[key], 'attribute')
							gFilter = getPropertyFromObj(obj[key], 'filter')
							gExtractor = getPropertyFromObj(obj[key], 'extractor')
							gData = getPropertyFromObj(obj[key], 'data')
							gParser = getPropertyFromObj(obj[key], 'parserr')
							gGroup = getPropertyFromObj(obj, 'group')
							// console.log("gSelector", gSelector);
							// console.log("gData", gData);

							// console.log("gParser", gParser);


							if (gSelector && gData && _.isObject(gGroup)) {

								let n = getNodeFromSmartSelector($(node), gSelector)
								iterateThrough(gData, elem, $(n))

							} else if (gSelector && _.isString(gSelector)) {

								gINFO = extractSmartSelector({
									selector: gSelector
								})

								gSelector = gINFO.selector
								gParser = gParser ? gParser : gINFO.parser
								gFilter = gFilter ? gFilter : gINFO.filter
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

											let n = getNodeFromSmartSelector($(node), gSelector)

											if (timestats) {
												elem[key] = {}
												elem[key]['_value'] = []
												n.each(function (i, n) {
													elem[key]['_value'][i] = getTheRightData($(n), {
														extractor: gExtractor,
														filter: gFilter,
														attr: gAttribute,
														parser: gParser
													})
												});
												elem[key]['_timestat'] = timeSpent(gTime)
											} else {
												n.each(function (i, n) {
													elem[key][i] = getTheRightData($(n), {
														extractor: gExtractor,
														filter: gFilter,
														attr: gAttribute,
														parser: gParser
													})
												});
											}


										}

										// Simple data object to use parent selector as base
									} else {

										if (_.size(gData) > 0) {
											elem[key] = {};
											let n = $(node).find(gSelector).first();
											iterateThrough(gData, elem[key], $(n));
										}

									}

								} else {

									let n = getNodeFromSmartSelector($(node), gSelector)

									if (n.length > 0) {

										if (!gAttribute && n.get(0).tagName === "img") {
											gAttribute = "src"
										}

										if (timestats) {
											elem[key] = {}
											elem[key]['_value'] = getTheRightData($(n), {
												extractor: gExtractor,
												filter: gFilter,
												attr: gAttribute,
												parser: gParser
											});
											elem[key]['_timestat'] = timeSpent(gTime)
										} else {
											elem[key] = getTheRightData($(n), {
												extractor: gExtractor,
												filter: gFilter,
												attr: gAttribute,
												parser: gParser
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
								gParser = gParser ? gParser : gINFO.parser
								gFilter = gFilter ? gFilter : gINFO.filter
								gAttribute = gAttribute ? gAttribute : gINFO.attribute
								gExtractor = gExtractor ? gExtractor : gINFO.extractor

								elem[key] = []
								let n = getNodeFromSmartSelector($(node), gSelector)

								if (timestats) {
									elem[key] = {}
									elem[key]['_value'] = []
									n.each(function (i, n) {
										elem[key]['_value'][i] = getTheRightData($(n), {
											extractor: gExtractor,
											filter: gFilter,
											attr: gAttribute,
											parser: gParser
										})
									});
									elem[key]['_timestat'] = timeSpent(gTime)
								} else {
									n.each(function (i, n) {
										elem[key][i] = getTheRightData($(n), {
											extractor: gExtractor,
											filter: gFilter,
											attr: gAttribute,
											parser: gParser
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
							gParser = gParser ? gParser : gINFO.parser
							gFilter = gFilter ? gFilter : gINFO.filter
							gAttribute = gAttribute ? gAttribute : gINFO.attribute
							gExtractor = gExtractor ? gExtractor : gINFO.extractor

							let n = getNodeFromSmartSelector($(node), gSelector)

							if (n.length > 0) {

								if (!gAttribute && n.get(0).tagName === "img") {
									gAttribute = "src"
								}

								if (timestats) {
									elem[key] = {}
									elem[key]['_value'] = getTheRightData(n, {
										extractor: gExtractor,
										filter: gFilter,
										attr: gAttribute,
										parser: gParser
									})
									elem[key]['_timestat'] = timeSpent(gTime)
								} else {
									elem[key] = getTheRightData(n, {
										extractor: gExtractor,
										filter: gFilter,
										attr: gAttribute,
										parser: gParser
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

		if(string) {
			output = JSON.stringify(output, null, 2)
		}

		return output
	};


};