const
	_ = require('lodash')

const
	Properties = require('./../common/properties.fn')

module.exports = function ($) {

	// Init
	const
		Node = require('./../cheerio/node.fn')($)

	let getData = function (selector, node, output) {
		return Node.getAllData(selector, node)
	}

	return {
		getData
	}

}