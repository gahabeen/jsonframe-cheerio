'use strict'

const _ = require('lodash')
const chrono = require('chrono-node')
const humanname = require('humanname')
const addressit = require('addressit')
// const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()


let parseData = function (data, regex, {
	multiple = false
} = {}) {
	let result = data
	let extracted
	if (regex) {
		try {
			let rgx = regex
			if (_.isString(regex)) {
				rgx = new RegExp(regex, 'gim')
			}
			extracted = rgx.exec(data)
			if (multiple) {
				result = extracted
				// result = data.match(rgx)
			} else {
				if (extracted[1]) {
					result = extracted[1]
				} else {
					result = extracted[0]
				}
				// result = data.match(rgx)[0]
			}
		} catch (error) {
			// console.log("Regex error: ", error)
		}
	}
	return result
}

let filterData = function (data, filter) {

	let paranthethisRegex = /(?:\()(.+)(?:\))/gim

	let result = data
	if (["raw"].includes(filter)) {
		// let the raw data

	} else if (filter && filter.includes("split")) {
		let splitValue = paranthethisRegex.exec(filter)
		if (splitValue && splitValue[1]) {
			result = result.split(splitValue[1])
		} else {
			result = result.split(" ")
		}
		result = result.filter(function (x) {
			return x !== ""
		})
		result = result.map(function (x) {
			return x.trim()
		})
	} else if (filter && filter.includes("between")) {
		let betweenValues = paranthethisRegex.exec(filter)
		if (betweenValues && betweenValues[1]) {
			betweenValues = betweenValues[1].split("&&")
			if (betweenValues.length > 1) {
				result = result.split(betweenValues[0].replace(/_/gm, " ").trim()).pop().split(betweenValues[1].replace(/_/gm, " ").trim()).shift().trim() || ""
			}
		}
	} else if (filter && filter.includes("after")) {
		let afterValue = paranthethisRegex.exec(filter)
		if (afterValue && afterValue[1]) {
			result = result.split(afterValue[1].replace(/_/gm, " ").trim()).pop().trim() || ""
		}
	} else if (filter && filter.includes("before")) {
		let beforeValue = paranthethisRegex.exec(filter)
		if (beforeValue && beforeValue[1]) {
			result = result.split(beforeValue[1].replace(/_/gm, " ").trim()).shift().trim() || ""
		}
	} else if (filter && filter.includes("css")) {
		// let cssValue = paranthethisRegex.exec(filter)
		// if(cssValue && cssValue[1]){
		// 	result = result.split(cssValue[1].trim()).pop().split(",",1).shift().trim() || ""
		// }	
	} else if (["trim"].includes(filter)) {
		result = result.trim()
	} else if (filter && filter.includes("join") && _.isArray(result)) {
		let joinChar = paranthethisRegex.exec(filter)
		if (joinChar && joinChar[1]) {
			result = result.join(joinChar[1].replace(/_/gm, " "))
		} else {
			result = result.join(" ")
		}
	} else if (["lowercase", "lcase"].includes(filter)) {
		result = result.toLowerCase()
	} else if (["uppercase", "ucase"].includes(filter)) {
		result = result.toUpperCase()
	} else if (["capitalize", "cap"].includes(filter)) {
		result = _.startCase(result)
	} else if (["number", "nb"].includes(filter)) {
		result = result.match(/\d+/gm)
		result = result.join(" ")
	} else if (["words", "w"].includes(filter)) {
		result = result.replace(/\W/gm, " ")
	} else if (["noescapchar", "nec"].includes(filter)) {
		result = result.replace(/\t+|\n+|\r+/gm, " ")

	} else if (filter && filter.includes("right")) {
		let regexified = filter.match(/\d+/g)
		if (regexified && regexified[0]) {
			let nb = regexified[0]
			if (_.isArray(result)) {
				result = result.slice(result.length - nb, result.length)
			} else {
				result = result.substr(result.length - nb)
			}
		}
	} else if (filter && filter.includes("left")) {
		let regexified = filter.match(/\d+/g)
		if (regexified && regexified[0]) {
			let nb = regexified[0]
			if (_.isArray(result)) {
				result = result.slice(0, nb)
			} else {
				result = result.substr(0, nb)
			}
		}
	} else if (filter && filter.includes("fromto")) {
		let regexified = paranthethisRegex.exec(filter)
		if (regexified && regexified[1]) {
			let nbs = regexified[1].split(/[,-]/gim)
			let start, end
			if (nbs.length > 1) {
				start = parseInt(nbs[0].trim())
				end = parseInt(nbs[1].trim())
				if (_.isArray(result)) {
					result = result.slice(start, end + 1)
				} else {
					result = result.substr(start, end)
				}
			}
		}

	} else if (filter && filter.includes("get")) {
		let regexified = filter.match(/\d+/g)
		if (regexified && regexified[0]) {
			let nb = regexified[0]
			if (_.isArray(result)) {
				result = result[nb]
			} else {
				result = result.charAt(nb)
			}
		}
		//default
	} else if (["compact", "cmp"].includes(filter) || !filter) {
		result = result.replace(/\s+/gm, " ").trim()
	}
	return result
}

let extractByExtractor = function (data, extractor, {
	multiple = false
} = {}) {
	let result = data
	let emailRegex = /([a-zA-Z0-9._-]{1,30}@[a-zA-Z0-9._-]{2,15}\.[a-zA-Z0-9._-]{2,15})/gmi
	let phoneRegex = /\+?\(?\d*\)? ?\(?\d+\)?\d*([\s./-]\d{2,})+/gmi
	let websiteRegex = /(?:[\s\W])((https?:\/\/)?(www\.)?[-a-zA-Z0-9:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&/=]*)/gmi

	if (["phone", "telephone"].includes(extractor)) {
		if (multiple) {
			result = data.match(phoneRegex) || ""
		} else {
			result = data.match(phoneRegex) !== null ? data.match(phoneRegex)[0] : ""
		}
	} else if (["numbers", "nb"].includes(extractor)) {
		if (multiple) {
			result = result.match(/\d+/gm) || ""
		} else {
			result = result.match(/\d+/gm) !== null ? result.match(/\d+/gm)[0] : ""
		}
	} else if (["website"].includes(extractor)) {

		let websites = data.match(websiteRegex)

		if (websites && websites.length > 0) {
			websites = websites.map(function (x) {
				return x.substr(1, x.length) // remove first character
			})

			if (multiple) {
				result = websites || ""
			} else {
				result = websites !== null ? websites[0] : ""
			}
		}

	} else if (["address", "add"].includes(extractor)) {
		result = addressit(data)
	} else if (["email", "mail", "@"].includes(extractor)) {
		if (multiple) {
			result = data.match(emailRegex) || data
			if (_.isArray(result) && result.length === 1) {
				result = result[0]
			}
		} else {
			result = data.match(emailRegex) !== null ? data.match(emailRegex)[0] : ""
		}
	} else if (["date", "d"].includes(extractor)) {
		let date = chrono.casual.parseDate(data)
		if (date) {
			result = date.toString()
		} else {
			result = ""
		}
	} else if (["fullName", "prenom", "firstName", "nom", "lastName", "initials", "suffix", "salutation"].includes(extractor)) {
		// compact data before to parse it
		result = humanname.parse(filterData(data, "cmp"))
		if ("fullName".includes(extractor)) {
			// return the object
		} else if (["firstName", "prenom"].includes(extractor)) {
			result = result.firstName
		} else if (["lastName", "nom"].includes(extractor)) {
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

let isAGroupKey = function (groupKey) {
	let groupProperties = ['_g', '_group', '_groupe']
	let isAGroup = false
	groupProperties.forEach(function (value) {
		if (value === groupKey || groupKey.startsWith(value + '_')) {
			isAGroup = true
			return
		}
	})
	return isAGroup
}

let getPropertyFromObj = function (obj, propertyName) {
	let properties = {
		'selector': ['_s', '_selector', '_selecteur', 'selector'],
		'attribute': ['_a', '_attr', '_attribut', 'attr', 'attribute'],
		'filter': ['_filter', '_f', '_filtre', 'filter'],
		'extractor': ['_e', '_extracteur', 'extractor', 'type', '_t'], //keep temporary old types
		'data': ['_d', '_data', '_donnee', 'data'],
		'parser': ['_p', '_parser', '_parseur', 'parser'],
		'break': ['_b', '_break', '_cassure']
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

module.exports = function ($) {


	let getNodesFromSmartSelector = function (node, selector) {
		if (selector === "_parent_") {
			return node
		} else {
			return $(node).find(selector)
		}
	}

	let getFunctionalParameters = function (obj) {
		let result = {
			selector: getPropertyFromObj(obj, 'selector'),
			attribute: getPropertyFromObj(obj, 'attribute'),
			filter: getPropertyFromObj(obj, 'filter'),
			extractor: getPropertyFromObj(obj, 'extractor'),
			data: getPropertyFromObj(obj, 'data'),
			parser: getPropertyFromObj(obj, 'parser'),
			break: getPropertyFromObj(obj, 'break')
		}

		return result
	}

	let updateFunctionalParametersFromSelector = function (g, selector, node) {

		let gUpdate = extractSmartSelector({
			selector: selector,
			node: $(node)
		})

		g.selector = gUpdate.selector
		g.parser = g.parser ? g.parser : gUpdate.parser
		g.filter = g.filter ? g.filter : gUpdate.filter
		g.attribute = g.attribute ? g.attribute : gUpdate.attribute
		g.extractor = g.extractor ? g.extractor : gUpdate.extractor

		return g
	}

	let getDataFromNodes = function (nodes, g, {
		timestats = false,
		multiple = true
	} = {}) {

		let result = []

		if (timestats) {
			result = {}
			result['_value'] = []
		}

		// Getting data
		$(nodes).each(function (i, n) {
			let r = getTheRightData($(n), {
				extractor: g.extractor,
				filter: g.filter,
				attr: g.attribute,
				parser: g.parser,
				multiple: multiple
			})

			if (_.isArray(r) && r.length === 1) {
				r = r[0]
			}

			if (r) {
				if (result['_value']) {
					if (_.isArray(r) && r.length > 1) {
						result['_value'] = r
					} else {
						result['_value'].push(r)
					}
				} else {
					if (_.isArray(r) && r.length > 1) {
						result = r
					} else {
						result.push(r)
					}
				}
			}

			// not multiple wanted, stop at the first one
			if (!multiple) {
				return false
			}
		})

		if (result['_value']) {
			result['_timestat'] = timeSpent(gTime)
		}

		// avoid listing
		if ((!g.filter || !g.filter.join("").includes("split")) && !multiple && result[0]) {
			result = result[0]
		}

		if (g.filter && g.filter.join("").includes("join") && result.length === 1) {
			result = result[0]
		}

		if (result.length === 0) {
			result = null
		}

		return result
	}

	let extractSmartSelector = function ({
		selector,
		node = null,
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
			res.filter = res.filter.split(/\s+/)
			res.selector = res.selector.oneSplitFromEnd('|')[0].trim()
		}

		if (res.selector.includes('<')) {
			res.extractor = res.selector.oneSplitFromEnd('<')[1].trim()
			res.extractor = res.extractor.split(/\s+/)
			res.selector = res.selector.oneSplitFromEnd('<')[0].trim()
		}

		if (res.selector.includes('@')) {
			res.attribute = res.selector.oneSplitFromEnd('@')[1].trim()
			res.selector = res.selector.oneSplitFromEnd('@')[0].trim()
		}

		if (!res.extractor && !res.attribute && $(node).find(res.selector)['0'] && $(node).find(res.selector)['0'].name.toLowerCase() === "img") {
			res.attribute = "src"
		}

		return res
	}

	let getTheRightData = function (node, {
		attr = null,
		extractor = null,
		filter = null,
		parser = null,
		multiple = false
	} = {}) {

		//assuming we handle only one node from getDataFromNodes

		let result = null
		let localNode = node[0] || node // in case of many, shouldn't happen

		if (attr) {
			result = $(localNode).attr(attr) || ""
		} else {
			result = $(localNode).text()
		}

		let extractors = []

		// build an array of extractors anyway
		if (!_.isArray(extractor)) {
			extractors.push(extractor)
		} else {
			extractors = extractor
		}

		if (extractors[0] && extractors[0] === "html") {
			result = $(localNode).html()
		}

		if (_.isObject(result)) {
			_.forOwn(result, function (value, key) {
				extractors.forEach(function (ext, index) {
					result[key] = extractByExtractor(result[key], ext, {
						multiple
					})
				})
			})
		} else {
			extractors.forEach(function (ext, index) {
				result = extractByExtractor(result, ext, {
					multiple
				})
			})
		}

		if (_.isObject(result)) {
			_.forOwn(result, function (value, key) {
				if (_.isArray(filter)) {
					filter.forEach(function (f, index) {
						result[key] = filterData(result[key], f)
					})
				} else {
					// handle type of child
					if (_.isString(result[key])) {
						result[key] = filterData(result[key], filter)
					}
				}
			})
		} else {
			if (_.isArray(filter)) {
				filter.forEach(function (f, index) {
					result = filterData(result, f)
				})
			} else {
				result = filterData(result, filter)
			}
		}

		if (parser) {
			result = parseData(result, parser, {
				multiple
			})
		}

		// if(!multiple && _.isArray(result)){
		// 	result = result[0]
		// }

		return result

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

			if (_.isObject(obj)) {

				_.forOwn(obj, function (currentValue, key) {

					// Security for jsonpath in "_to" > "_frame"
					if (key === "_frame" || key === "_from") {
						elem[key] = currentValue

						// If it's a group key
					} else if (isAGroupKey(key)) {

						let selector = getPropertyFromObj(currentValue, 'selector')
						let data = getPropertyFromObj(currentValue, 'data')
						let n = getNodesFromSmartSelector($(node), selector)
						iterateThrough(data, elem, $(n))

					} else {

						try {

							let g = {}

							if (_.isObject(currentValue) && !_.isArray(currentValue)) {
								g = getFunctionalParameters(currentValue)


								if (g.selector && _.isString(g.selector)) {
									g = updateFunctionalParametersFromSelector(g, g.selector, $(node))

									if (g.data && _.isObject(g.data)) {

										if (_.isArray(g.data)) {

											// Check if break included
											if (g.break && _.isString(g.break)) {

												let parent = getNodesFromSmartSelector($(node), g.selector)
												// Clone the parent to leave the initial DOM in place :)
												let tempParent = $(parent).clone()
												// Get the number of blocks to create
												let l = $(tempParent).children(g.break).length
												// Random name to set the list
												var breaklist = "#breaklist1234"
												// Add the list after the parent in the DOM
												$(parent).after('<div id="breaklist1234"></div>')

												// Moving the dom elements to blocks
												for (var index = 0; index < l; index++) {

													$(breaklist).append('<div class="break"></div>')
													// console.log("Appending: ",$(parent).children(g.break).first().text())

													// Move the break element to the .break block
													$(breaklist).children().last().append($(tempParent).children(g.break).first())

													// Move the next blocks to the .break block
													$(tempParent).children().first().nextUntil(g.break).each(function (i, e) {
														// console.log("nextItem", $(e).text());
														$(breaklist).children().last().append($(e))
													})

												}

												elem[key] = []

												// Iterating in this list
												$(breaklist).children(".break").each(function (i, e) {
													elem[key][i] = {}
													iterateThrough(g.data[0], elem[key][i], $(e))
												})

											}
											// Check if object in array
											else if (_.isObject(g.data[0]) && _.size(g.data[0]) > 0) {

												elem[key] = []
												let nn = getNodesFromSmartSelector($(node), g.selector)

												if ($(nn).length > 0) {
													$(nn).each(function (i, n) {
														elem[key][i] = {}
														iterateThrough(g.data[0], elem[key][i], $(n))
													})
												}


												// If no object, taking the single string
											} else if (_.isString(g.data[0])) {

												let n = getNodesFromSmartSelector($(node), g.selector)
												let dataResp = getDataFromNodes($(n), g)
												if (dataResp) {
													elem[key] = dataResp
												}

											}

											// Simple data object to use parent selector as base
										} else {

											if (_.size(g.data) > 0) {
												elem[key] = {}
												let n = $(node).find(g.selector).first()
												iterateThrough(g.data, elem[key], $(n))
											}

										}

									} else {

										let n = getNodesFromSmartSelector($(node), g.selector)
										let dataResp = getDataFromNodes($(n), g, {
											multiple: false
										})
										if (dataResp) {
											// push data as unit of array
											elem[key] = dataResp
										}

									}
								}

								// There is no Selector but still an Object for organization
								else {
									elem[key] = {}
									iterateThrough(currentValue, elem[key], node)
								}
							} else if (_.isArray(currentValue)) {

								elem[key] = []
								// For each unique string
								currentValue.forEach(function (arrSelector, h) {
									if (_.isString(arrSelector)) {

										g = updateFunctionalParametersFromSelector(g, arrSelector, $(node))
										let n = getNodesFromSmartSelector($(node), g.selector)
										let dataResp = getDataFromNodes($(n), g)
										if (dataResp) {
											// push data as unit of array
											elem[key].push(...dataResp)
										}

									}
								})

							}
							// The Parameter is a single string === selector > directly scraped
							else {

								g = updateFunctionalParametersFromSelector(g, currentValue, $(node))
								let n = getNodesFromSmartSelector($(node), g.selector)
								let dataResp = getDataFromNodes($(n), g, {
									multiple: false
								})

								if (dataResp) {
									// push data as unit of array
									elem[key] = dataResp
								}

							}

						} catch (error) {
							// console.log("obj key", key);
							console.log(error)
						}

					}

				})
			}

		}

		iterateThrough(frame, output, mainNode)

		if (string) {
			output = JSON.stringify(output, null, 2)
		}

		return output
	}


}