const
logs = "info",
	_ = require('lodash')
logger = require('./../logger/logger')(logs).logger

let frameProperties = {
	'selector': ['_s', '_selector'],
	'data': ['_d', '_data', ],
	'break': ['_b', '_break'],
	'group': ['_g*', '_group*']
}

let pathProperties = {
	'from': ['__fm', '__from'],
	'pagination': ['__pn', '__pagination'],
	'path': ['__ph', '__path'],
	'scrollTo': ['__so', '__scrollTo'],
	'click': ['__ck', '__click'],
	'goto': ['__go', '__goto'],
	'type': ['__te', '__type'],
	'behavior': ['__br', '_behavior'],
	'uniqueness': ['__us', '__uniqueness'],
	'wait': ['__wt', '__wait'],
	'destination': ['__dn', '__destination']
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

let isPathProperty = function (value) {
	let result = {
		isTrue: false,
		propertyName: null
	}

	if (value.startsWith("__")) {
		result =  {
			isTrue: true,
			propertyName: "Unknown"
		}
		let propertyName = isProperty(value, pathProperties).propertyName
		if(propertyName) {
			result.propertyName = propertyName
		}

		return result
	}
	
	return result
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
	let multiple = false
	let value = getPropertyValue(obj, propertyName, frameProperties)

	// if(_.isArray(value)){
	// 	value = value[0]
	// 	multiple = true
	// }
	return value
	// return {
	// 	value: value,
	// 	propertyName: propertyName,
	// 	multiple: multiple
	// } 
}

let getPathPropertyValue = function (obj, propertyName) {
	return getPropertyValue(obj, propertyName, pathProperties)
}

let getSelectorStatus = function (selector) {
	let multiple = false

	if (_.isArray(selector)) {
		multiple = true
		selector = selector[0]
	}

	return {
		selector,
		multiple
	}

}

module.exports = {
	frameProperties,
	pathProperties,
	isPathProperty,
	isFrameProperty,
	getFramePropertyValue,
	getPathPropertyValue,
	getSelectorStatus
}