'use strict'

const _ = require('lodash')
// const chrono = require('chrono-node')
// const humanname = require('humanname')
// const addressit = require('addressit')
// const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

const
	Properties = require('./common/properties.fn')

module.exports = function ($) {
	
	// Init
	const
		FramePropertyParser = require('./jsonframe/frameproperty.parser')($),
		StringParser = require('./jsonframe/string.parser')($),
		ArrayParser = require('./jsonframe/array.parser')($),
		ObjectParser = require('./jsonframe/object.parser')


	// real prototype
	$.prototype.scrape = function (frame, options = {}) {

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

			if (_.isObject(obj)) {

				_.forOwn(obj, function (value, property) {

					let FrameProperty = Properties.isFrameProperty(property)
					let PathProperty = Properties.isPathProperty(property)

					if (FrameProperty.isTrue) {

						FramePropertyParser.get(value, FrameProperty.propertyName, $(node), output, setActionsOnIteration)

					} else if (PathProperty.isTrue) {
						// Do nothing here
						// Not supposed to see some
					} else {

						if (value && _.isString(value)) {
							// Extract the data from the selector
							let tempResult = StringParser.getData(value, $(node), output)
							if (tempResult) {
								output[property] = tempResult
							}

						} else if (value && _.isArray(value)) {
							
							let tempResult = ArrayParser.ArrayOfString.getData(value, $(node), output)
							if (tempResult) {
								output[property] = tempResult
							}
							
						} else if (value && _.isObject(value)) {


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

		return output
	}

}





// // Security for jsonpath in "_to" > "_frame"
// if (key === "_frame" || key === "_from") {
// 	elem[key] = value

// 	// If it's a group key
// } else if (isAGroupKey(key)) {

// 	let selector = getPropertyFromObj(value, 'selector')
// 	let data = getPropertyFromObj(value, 'data')
// 	let n = getNodesFromSmartSelector($(node), selector)
// 	iterateThrough(data, elem, $(n))

// } else {

// 	let g = {}

// 	if (_.isObject(value) && !_.isArray(value)) {
// 		g = getFunctionalParameters(value)


// 		if (g.selector && _.isString(g.selector)) {
// 			g = updateFunctionalParametersFromSelector(g, g.selector, $(node))

// 			if (g.data && _.isObject(g.data)) {

// 				if (_.isArray(g.data)) {

// 					// Check if break included
// 					if (g.break && _.isString(g.break)) {

// 						let parent = getNodesFromSmartSelector($(node), g.selector)
// 						// Clone the parent to leave the initial DOM in place :)
// 						let tempParent = $(parent).clone()
// 						// Get the number of blocks to create
// 						let l = $(tempParent).children(g.break).length
// 						// Random name to set the list
// 						var breaklist = "#breaklist1234"
// 						// Add the list after the parent in the DOM
// 						$(parent).after('<div id="breaklist1234"></div>')

// 						// Moving the dom elements to blocks
// 						for (var index = 0; index < l; index++) {

// 							$(breaklist).append('<div class="break"></div>')
// 							// console.log("Appending: ",$(parent).children(g.break).first().text())

// 							// Move the break element to the .break block
// 							$(breaklist).children().last().append($(tempParent).children(g.break).first())

// 							// Move the next blocks to the .break block
// 							$(tempParent).children().first().nextUntil(g.break).each(function (i, e) {
// 								// console.log("nextItem", $(e).text());
// 								$(breaklist).children().last().append($(e))
// 							})

// 						}

// 						elem[key] = []

// 						// Iterating in this list
// 						$(breaklist).children(".break").each(function (i, e) {
// 							elem[key][i] = {}
// 							iterateThrough(g.data[0], elem[key][i], $(e))
// 						})

// 					}
// 					// Check if object in array
// 					else if (_.isObject(g.data[0]) && _.size(g.data[0]) > 0) {

// 						elem[key] = []
// 						let nn = getNodesFromSmartSelector($(node), g.selector)

// 						if ($(nn).length > 0) {
// 							$(nn).each(function (i, n) {
// 								elem[key][i] = {}
// 								iterateThrough(g.data[0], elem[key][i], $(n))
// 							})
// 						}


// 						// If no object, taking the single string
// 					} else if (_.isString(g.data[0])) {

// 						let n = getNodesFromSmartSelector($(node), g.selector)
// 						let dataResp = getDataFromNodes($(n), g)
// 						if (dataResp) {
// 							elem[key] = dataResp
// 						}

// 					}

// 					// Simple data object to use parent selector as base
// 				} else {

// 					if (_.size(g.data) > 0) {
// 						elem[key] = {}
// 						let n = $(node).find(g.selector).first()
// 						iterateThrough(g.data, elem[key], $(n))
// 					}

// 				}

// 			} else {

// 				let n = getNodesFromSmartSelector($(node), g.selector)
// 				let dataResp = getDataFromNodes($(n), g, {
// 					multiple: false
// 				})
// 				if (dataResp) {
// 					// push data as unit of array
// 					elem[key] = dataResp
// 				}

// 			}
// 		}

// 		// There is no Selector but still an Object for organization
// 		else {
// 			elem[key] = {}
// 			iterateThrough(value, elem[key], node)
// 		}
// 	} else if (_.isArray(value)) {

// 		elem[key] = []
// 		// For each unique string
// 		value.forEach(function (arrSelector, h) {
// 			if (_.isString(arrSelector)) {

// 				g = updateFunctionalParametersFromSelector(g, arrSelector, $(node))
// 				let n = getNodesFromSmartSelector($(node), g.selector)
// 				let dataResp = getDataFromNodes($(n), g)
// 				if (dataResp) {
// 					// push data as unit of array
// 					elem[key].push(...dataResp)
// 				}

// 			}
// 		})

// 	}
// 	// The Parameter is a single string === selector > directly scraped
// 	else {

// 		g = updateFunctionalParametersFromSelector(g, value, $(node))
// 		let n = getNodesFromSmartSelector($(node), g.selector)
// 		let dataResp = getDataFromNodes($(n), g, {
// 			multiple: false
// 		})

// 		if (dataResp) {
// 			// push data as unit of array
// 			elem[key] = dataResp
// 		}

// 	}


// }