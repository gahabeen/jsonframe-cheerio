const
	_ = require('lodash')

module.exports = function ($) {

	const Node = require('./../cheerio/node.fn')($)

	let frameProperties = {
		'selector': ['_s', '_selector'],
		'data': ['_d', '_data', ],
		'break': ['_b', '_break'],
		'group': ['_g*', '_group*']
	}

	let isProperty = function (value, propertiesList) {
		let p = propertiesList // local declaration just in case
		let status = false
		let propertyName = null
		let including = false
		Object.keys(p).forEach(function (property) {
			p[property].forEach(function (item) {
				if (item.includes('*')) {
					item = item.replace("*", "")
					including = true
				}
				if ((including && value.includes(item)) || item === value) {
					status = true
					propertyName = property
					return true
				}
			})
		})
		return {
			isTrue: status,
			propertyName: propertyName
		}
	}

	let isFrameProperty = function (value) {
		return isProperty(value, frameProperties)
	}
	let getPropertyValue = function (obj, propertyName, propertiesList) {
		let p = propertiesList
		let propertyNames = null
		let result = null
		let including = false

		if (p[propertyName]) {
			propertyNames = p[propertyName]

			Object.keys(obj).forEach(function (property) {
				propertyNames.forEach(function (name) {
					if (name.includes('*')) {
						name = name.replace("*", "")
						logger.debug(`${name} from ${propertyName} includes a * in the property name: ${property}`)
						including = true
					} else {
						including = false
					}
					if ((including && property && property.includes(name)) || name === property) {
						result = obj[property]
						return true
					}
				})
			})

			return result

		} else {
			return false
		}
	}

	let getFramePropertyValue = function (obj, propertyName) {
		return getPropertyValue(obj, propertyName, frameProperties)
	}


	let getData = function (value, propertyName, node, output, callback) {

		if (propertyName === "group") {

			let selector = getFramePropertyValue(value, "selector")
			let data = getFramePropertyValue(value, "data")
			let multiple = false
			if (_.isArray(data)) {
				multiple = true
			}

			if (selector && data) {

				if (_.isString(selector)) {

					let nextNode = Node.getNodes(selector, node, {
						multiple
					})
					callback(data, output, nextNode)
				}
			}
		}
	}

	return {
		getData,
		getFramePropertyValue,
		isFrameProperty
	}

}