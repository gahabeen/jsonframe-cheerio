const
	_ = require('lodash')

const
	Properties = require('./../common/properties.fn'),
	Node = require('./../cheerio/node.fn')

module.exports = function ($) {

	let get = function (value, propertyName, node, output, callback) {

		if (propertyName === "group") {

			let selector = Properties.getFramePropertyValue(value, "selector")
			let data = Properties.getFramePropertyValue(value, "data")
			let multiple = false
			if (_.isArray(data)) {
				multiple = true
			}

			if (selector && data) {

				if (_.isString(selector)) {

					let nextNode = Node.getNodes(node, selector, {
						multiple
					})
					callback(data, output, nextNode)
				}


			} else {


			}
		}
	}

	return get

}