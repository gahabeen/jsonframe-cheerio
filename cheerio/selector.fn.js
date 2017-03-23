// add oneSplitFromEnd
require('./../helpers/string.fn')

const
	logs = "info",
	logger = require('./../logger/logger')(logs).logger,
	sep = require('./../logger/logger')(logs).sep

module.exports = function ($ = null) {

	let selectorDelimiters = [{
		name: 'parser',
		delimiter: '||'
	}, {
		name: 'filter',
		delimiter: '|'
	}, {
		name: 'extractor',
		delimiter: '<'
	}, {
		name: 'attribute',
		delimiter: '@'
	}]


	let hasSelectorDelimiters = function (selector) {
		let result = false
		selectorDelimiters.forEach(function (delimiter) {
			if (selector.includes(` ${delimiter.delimiter} `)) {
				result = true
				return true
			}
		})
		return result
	}

	let getLastAction = function (selector) {

		logger.debug(`\n ${sep} \n getLastAction(selector) \n`)

		let positions = selectorDelimiters.map(function (delimiter, index) {
			return parseInt(selector.lastIndexOf(` ${delimiter.delimiter} `))
		})

		let maxPosition = Math.max(...positions)
		let delimiter = null

		if (maxPosition > 0) {
			delimiter = selectorDelimiters[positions.indexOf(maxPosition)]
		}

		logger.debug(`\n > delimiter: \n ${JSON.stringify(delimiter, null, 2)}`)

		if (delimiter) {
			let splitValues = selector.oneSplitFromEnd(` ${delimiter.delimiter} `)

			let currentSelector = splitValues[0].trim()
			delimiter.value = splitValues[1].trim()

			return {
				currentSelector: currentSelector,
				delimiter: delimiter
			}
		} else {
			return false
		}

	}

	let getSelectorActions = function (selector, node = null) {
		let res = {
			selector: selector
		}

		let selectorHasDelimiter = true
		let actions = []
		let splitValues = null

		let i = 0

		while (selectorHasDelimiter && i < selector.length) {
			i++ // Security

			let lastAction = getLastAction(res.selector)

			if (lastAction) {

				res.selector = lastAction.currentSelector

				let multipleActions = lastAction.delimiter.value.split(" ")

				if (multipleActions.length > 1 && ["filter", "extractor"].includes(lastAction.delimiter.name)) {
					let tempActions = []
					multipleActions.forEach(function (action) {
						tempActions.push({
							name: lastAction.delimiter.name,
							delimiter: lastAction.delimiter.delimiter,
							value: action
						})
					})
					actions.push(...tempActions.reverse())
				} else {
					actions.push(lastAction.delimiter)
				}

			}

			selectorHasDelimiter = hasSelectorDelimiters(res.selector)
		}

		let attributesNumber = 0
		actions.forEach(d => {
			if (d.name === "attribute") {
				return attributesNumber++
			}
		})

		// var attributesNumber = actions.reduce(function(prev, d) {
		// 	if (d.name === "attribute") {
		// 		return prev++
		// 	} else {
		// 		return prev
		// 	}
		// }, 0)

		logger.debug(` > There are ${attributesNumber} attributes so far.`)

		// Detect an image automatically
		if (attributesNumber === 0 && $ && node && $(node).find(res.selector)['0'] && $(node).find(res.selector)['0'].name.toLowerCase() === "img") {
			logger.debug(` > Detected an image, pushing the right attribute`)
			actions.push({
				name: 'attribute',
				delimiter: '@',
				value: 'src'
			})
		}

		let filtersNumber = 0
		actions.forEach(d => {
			if (d.name === "filter") {
				return filtersNumber++
			}
		})

		// let filtersNumber = actions.reduce(function (prev, d) {
		// 	if (d.name === "filter") {
		// 		return prev++
		// 	} else {
		// 		return prev
		// 	}
		// }, 0)

		logger.debug(` > There are ${JSON.stringify(filtersNumber, null, 2)} attributes so far.`)

		if (filtersNumber === 0) {
			logger.debug(` > Add an empty filter to clean the entry`)
			actions.unshift({
				name: 'filter',
				delimiter: '|',
				value: ''
			})
		}

		res.actions = actions.reverse()

		logger.debug(` > Actions in the queue: \n ${JSON.stringify(res.actions, null, 2)}`)

		return res
	}

	return {
		// getLastAction,
		getSelectorActions
	}

}