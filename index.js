'use strict'

const _ = require('lodash')

const
	logs = "info",
	logger = require('./logger/logger')(logs).logger,
	sep = require('./logger/logger')(logs).sep

module.exports = function ($) {

	// Init
	const
		FramePropertyParser = require('./jsonframe/frameproperty.parser')($),
		StringParser = require('./jsonframe/string.parser')($),
		ArrayParser = require('./jsonframe/array.parser')($),
		ObjectParser = require('./jsonframe/object.parser')($)

	// real prototype
	$.prototype.scrape = function (frame, options = {}) {

		logger.debug(`\n ${sep} \n $.prototype.scrape(frame, options) \n`)

		let {
			debug,
			timestats,
			string
		} = Object.assign({
			debug: false,
			timestats: false,
			string: false
		}, options)

		let output = {}
		let mainNode = $(this)

		let setActionsOnIteration = function (obj, output, node) {

			logger.debug(`setActionsOnIteration(obj, output, node)`)

			if (_.isObject(obj)) {

				logger.debug(`setActionsOnIteration(obj, output, node)`)

				_.forOwn(obj, function (value, property) {

					logger.debug(`For the pair, value: ${value}, property: ${property}`)

					let FrameProperty = FramePropertyParser.isFrameProperty(property)

					if (FrameProperty.isTrue) {

						logger.debug(`${property} is a FrameProperty`)
						FramePropertyParser.getData(value, FrameProperty.propertyName, $(node), output, setActionsOnIteration)

					} else {

						logger.debug(`${property} is a named property`)

						if (value && _.isString(value)) {

							logger.debug(`${property} is of type : string`)
							// Extract the data from the selector
							let tempResult = StringParser.getData(value, $(node), output)
							if (tempResult) {
								logger.debug(`${property} found value is : ${tempResult}`)
								output[property] = tempResult
							}

						} else if (value && _.isArray(value)) {

							logger.debug(`${property} is of type : array`)

							let tempResult = ArrayParser.ArrayOfString.getData(value, $(node), output)
							if (tempResult) {
								output[property] = tempResult
							}

						} else if (value && _.isObject(value)) {
							logger.debug(`${property} is of type : object`)

							let tempResult = null
							tempResult = ObjectParser.getData(value, property, $(node), output, setActionsOnIteration)
							if (tempResult) {
								output[property] = tempResult
							}
						}
					}

				})

			} else {
				logger.error('iterateThrough(>>obj<<,...) is not an object')
				return null
			}

		}

		setActionsOnIteration(frame, output, mainNode)

		if (string) {
			output = JSON.stringify(output, null, 2)
		}

		logger.debug(sep)

		return output
	}

}