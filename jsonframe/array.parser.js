const
	_ = require('lodash')

module.exports = function ($) {

	// Init
	const
		Node = require('./../cheerio/node.fn')($)

	let getSelectorStatus = function (selector) {
		let multiple = false

		if (_.isArray(selector)) {
			multiple = true
			selector = selector[0]
		}

		return {
			selector,
			multiple
		}

	}

	let ArrayOfString = {
		getData: function (selector, node, output) {

			let multiple = false
			let selectorObj = getSelectorStatus(selector)

			selector = selectorObj.selector
			multiple = selectorObj.multiple

			return Node.getAllData(selector, node, {
				multiple: multiple
			})
		}

	}
	return {
		ArrayOfString
	}

}