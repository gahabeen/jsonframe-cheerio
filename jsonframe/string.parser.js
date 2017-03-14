const
	_ = require('lodash')

const
	logs = "debug",
	Properties = require('./../common/properties.fn'),
	logger = require('./../logger/logger')(logs).logger

module.exports = function ($) {

	logger.debug(`StringParser`)
	// Init
	const
		Node = require('./../cheerio/node.fn')($)

	let getData = function (selector, node, output) {
		logger.debug(`\n *****************************************`)
		logger.debug(`getData(selector, node, output)`)

		let result = Node.getAllData(selector, node)

		logger.debug(`  > ${result}`)
		
		return result
	}

	return {
		getData
	}

}