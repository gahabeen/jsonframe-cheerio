const
	_ = require('lodash')

const
	logs = "info",
	{
		logger,
		sep
	} = require('./../logger/logger')(logs)

module.exports = function ($) {

	const
		Node = require('./../cheerio/node.fn')($),
		StringParser = require('./string.parser')($),
		FramePropertyParser = require('./frameproperty.parser')($)

	let getData = function (value, property, node, output, callback) {
		logger.debug(`\n ${sep} \n getData(value, node, output, callback) \n`)

		logger.debug(`${JSON.stringify(FramePropertyParser,null,2)}`)

		let selector = FramePropertyParser.getFramePropertyValue(value, "selector")
		let data = FramePropertyParser.getFramePropertyValue(value, "data")
		let breakk = FramePropertyParser.getFramePropertyValue(value, "break")

		let multiple = false
		if (_.isArray(data)) {
			multiple = true
			data = data[0]
		}

		if (selector && _.isString(selector) && data && !breakk) {
			if (_.isString(data)) {

				let nextNode = Node.getNodes(selector, $(node), {
					multiple
				})
				return StringParser.getData(data, $(nextNode), output)

			} else if (_.isObject(data)) {

				let nextNode = Node.getNodes(selector, node, {
					multiple
				})

				if (multiple) {
					output[property] = []
					$(nextNode).each(function (index, n) {
						output[property][index] = {}
						callback(data, output[property][index], $(n))
					})
				} else {
					output[property] = {}
					callback(data, output[property], nextNode)
				}

			}

		} else if (selector && _.isString(selector) && data && breakk && _.isString(breakk) && multiple) {
			// To redo

			// Pass on the object for organization
		} else if (!selector) {
			output[property] = {}
			callback(value, output[property], node)
		}

		logger.debug(sep)
	}


	return {
		getData
	}

}