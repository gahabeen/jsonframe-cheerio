const
	_ = require('lodash')

const
	Properties = require('./../common/properties.fn')

module.exports = function ($) {

	// Init
	const
		Node = require('./../cheerio/node.fn')($)

	let ArrayOfString = {
		getData: function (selector, node, output) {
			
			let multiple = false
			let selectorObj = Properties.getSelectorStatus(selector)
			
			selector = selectorObj.selector
			multiple = selectorObj.multiple

			return Node.getAllData(selector, node, {multiple: multiple})
		}

	}
	return {
		ArrayOfString
	}

}