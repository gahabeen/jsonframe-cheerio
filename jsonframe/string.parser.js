const
	_ = require('lodash')

const
	logs = "info",
	{logger, sep} = require('./../logger/logger')(logs)

module.exports = function ($) {

	logger.debug(`\n ${sep} \n StringParser \n`)
	// Init
	const
		Node = require('./../cheerio/node.fn')($)

	let getData = function (selector, node, output) {
		logger.debug(`\n ${sep} \n getData(selector, node, output) \n`)
		logger.debug(`\n > selector: ${JSON.stringify(selector, null, 2)}`)

		let result = Node.getAllData(selector, node)

		logger.debug(`\n > ${result}`)
		logger.debug(sep)

		return result
	}

	return {
		getData
	}

}