// add oneSplitFromEnd
require('./../common/string.fn')

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

		let positions = selectorDelimiters.map(function (delimiter, index) {
			return parseInt(selector.lastIndexOf(` ${delimiter.delimiter} `))
		})

		let delimiter = selectorDelimiters[positions.indexOf(Math.max(...positions))]

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

		let attributesNumber = actions.reduce((prev, delimiter) => {
			if (delimiter.name === "attribute") {
				return prev + 1
			}
		}, 0)

		// Detect an image automatically
		if (attributesNumber > 0 && $ && node && $(node).find(res.selector)['0'] && $(node).find(res.selector)['0'].name.toLowerCase() === "img") {
			actions.push({
				name: 'attribute',
				delimiter: '@',
				value: 'src'
			})
		}

		res.actions = actions.reverse()

		return res
	}

	return {
		// getLastAction,
		getSelectorActions
	}

}