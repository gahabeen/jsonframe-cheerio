const
	_ = require('lodash')

const
	Properties = require('./../common/properties.fn')

module.exports = function ($) {

	const
		Node = require('./../cheerio/node.fn')($)

	let getData = function (value, propertyName, node, output, callback) {

		if (propertyName === "group") {

			let selector = Properties.getFramePropertyValue(value, "selector")
			let data = Properties.getFramePropertyValue(value, "data")
			let multiple = false
			if (_.isArray(data)) {
				multiple = true
			}

			if (selector && data) {

				if (_.isString(selector)) {

					let nextNode = Node.getNodes(selector, node,{
						multiple
					})
					callback(data, output, nextNode)
				}
			}
		}
	}

	return {
		getData
	}

}