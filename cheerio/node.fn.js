const
	logs = "info",
	_ = require('lodash'),
	{logger, sep} = require('./../logger/logger')(logs)

const
	Extractors = require('./../modules/extractors.fn'),
	Filters = require('./../modules/filters.fn'),
	Parsers = require('./../modules/parsers.fn')

module.exports = function ($) {

	// Init
	const
		Selector = require('./selector.fn')($)

	let getAllData = function (selector, node, options = {}) {
		logger.debug(`\n ${sep} \n getAllData(selector, node, options) \n`)
		logger.debug(`\n > selector: ${selector} \n > options: ${JSON.stringify(options, null, 2)} `)
		let selectorActions = Selector.getSelectorActions(selector, node)
		let actions = selectorActions.actions
		let cleanSelector = selectorActions.selector

		logger.debug(`\n > cleanSelector: ${cleanSelector}`)
		logger.debug(`\n > actions: \n ${JSON.stringify(actions, null, 2)}`)

		let nodes = getNodes(cleanSelector, node, options)
		logger.debug(`\n > nodes: \n ${nodes}`)

		let data = handleEachNode(nodes, actions, options)
		logger.debug(`\n > data: \n ${data}`)
		logger.debug(sep)

		return data

	}

	let getNodes = function (selector, node, options = {}) {
		logger.debug(`\n ${sep} \n getNodes(selector, node, options = {}) \n`)

		let nodes = null
		let {
			multiple
		} = Object.assign({
			multiple: false
		}, options)

		logger.debug(`\n > multiple: ${multiple}`)
		logger.debug(`\n > selector: ${selector}`)

		if (selector.includes("_parent_")) {
			selector = selector.replace("_parent_", "")
			nodes = node
		}

		if (selector.trim().length > 0) {

			nodes = $(node).find(selector)

			if (!multiple) {
				nodes = $(nodes).first()
			}

		}

		logger.debug(sep)

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
		logger.debug(`\n ${sep} \n getData(node, actions = [], options) \n`)

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
			actions.forEach(function (action) {
				if (action.name === "attribute") {
					attribute = action
					return true
				}
			})

			logger.debug(` > Attribute is: \n ${JSON.stringify(attribute, null, 2)}`)

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
				result = $(node).html()
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