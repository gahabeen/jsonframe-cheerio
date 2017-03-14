const _ = require('lodash')

let getData = function (data, filter, multiple = false) {

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
	} else if (filter === "" || ["compact", "cmp"].includes(filter)) {
		result = result.replace(/\s+/gm, " ").trim()
	}
	return result
}


module.exports = {
	getData
}