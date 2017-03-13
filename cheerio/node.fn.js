const
	logs = "info",
	_ = require('lodash'),
	logger = require('./../logger/logger')(logs).logger

const
	Extractors = require('./../modules/extractors.fn'),
	Filters = require('./../modules/filters.fn'),
	Parsers = require('./../modules/parsers.fn'),
	Properties = require('./../common/properties.fn')

module.exports = function ($) {

	// Init
	const
		Selector = require('./selector.fn')($)

	let getAllData = function (selector, node, options = {}) {

		logger.debug(`getAllData(selector, node, options): \n > selector: ${selector} \n > options: ${JSON.stringify(options, null, 2)} `)
		let selectorActions = Selector.getSelectorActions(selector, node)
		let actions = selectorActions.actions
		selector = selectorActions.selector
		logger.debug(`> actions: \n ${JSON.stringify(actions, null, 2)}`)

		let nodes = getNodes(selector, node, options)
		logger.debug(`> nodes: \n ${nodes}`)

		let data = handleEachNode(nodes, actions, options)
		logger.debug(`> data: \n ${data}`)

		return data

	}

	let getNodes = function (selector, node, options = {}) {
		let nodes = null

		let {
			multiple
		} = Object.assign({
			multiple: false
		}, options)

		if (selector.includes("__parent__")) {
			selector = selector.replace("__parent__", "")
			nodes = node
		}

		if (selector.trim().length > 0) {

			nodes = $(node).find(selector)

			if (!multiple) {
				nodes = $(nodes).first()
			}

		}

		return nodes
	}

	let handleEachNode = function (nodes, actions = [], options = {}) {

		let {
			multiple
		} = Object.assign({
			multiple: false
		}, options)

		let result = []

		$(nodes).each(function (i, n) {
			let r = getData($(n), actions, options)
			if (r) {
				result.push(r)
			}

			// not multiple wanted, stop at the first one
			if (!multiple) {
				return false
			}
		})

		if (!multiple) {
			result = result[0]
		}

		return result
	}

	let getData = function (node, actions = [], options = {}) {
		logger.debug(`getData(node, actions = [], options)`)

		let {
			multiple
		} = Object.assign({
			multiple: false
		}, options)

		// let result = []
		let result = null
		let localNode = node[0] || node // in case of many, shouldn't happen

		// result[0] = $(localNode).text()
		result = $(localNode).text()

		if (_.isArray(actions) && actions.length > 0) {

			logger.debug(`  > Yes, actions is an array \n ${JSON.stringify(actions, null, 2)}`)

			// Get attribute first if there is one
			let attribute = null
			attribute = actions.forEach(function (action) {
				if (action.name === "attribute") {
					return actions.pop()
				}
			})

			if (attribute) {
				result = $(localNode).attr(attribute.value) || "" // wrong attribute - return nothing
			}

			// Play actions
			actions.forEach(function (action) {
				let tempResult = playAction($(localNode), action, result, multiple)
				result = tempResult ? tempResult : result
			})

		} else {
			logger.debug(`  > Actions is not an array \n ${JSON.stringify(actions, null, 2)}`)
		}

		// if (result.length === 1 && !multiple) {
		// 	result = result[0]
		// }

		return result
	}

	let playAction = function (node, action, result, multiple = false) {

		logger.debug(`PlayAction()`)
		logger.debug(`result: ${JSON.stringify(result, null, 2)}`)

		// result.map(function (item) {

		if (action.name === "extractor") {
			logger.debug(`PlayAction() > Extractor detected with action: \n ${JSON.stringify(action,null,2)}`)
			if (action.value === "html") {
				result = $(localNode).html()
			} else {
				return Extractors.getData(result, action.value, multiple)
			}

		} else if (action.name === "filter") {
			logger.debug(`PlayAction() > Filter detected with action: \n ${JSON.stringify(action,null,2)}`)
			return Filters.getData(result, action.value, multiple)

		} else if (action.name === "parser") {
			logger.debug(`PlayAction() > Parser detected with action: \n ${JSON.stringify(action,null,2)}`)
			return Parsers.getData(result, action.value, multiple)
		}

		// })

		return result
	}

	return {
		handleEachNode,
		getNodes,
		getData,
		getAllData
	}
}