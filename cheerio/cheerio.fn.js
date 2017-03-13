module.exports = function ($) {


	let isAGroupKey = function (groupKey) {
		let groupProperties = ['_g', '_group', '_groupe']
		let isAGroup = false
		groupProperties.forEach(function (value) {
			if (value === groupKey || groupKey.startsWith(value + '_')) {
				isAGroup = true
				return
			}
		})
		return isAGroup
	}

	let updateFunctionalParametersFromSelector = function (g, selector, node) {

		let gUpdate = extractSmartSelector({
			selector: selector,
			node: $(node)
		})

		g.selector = gUpdate.selector
		g.parser = g.parser ? g.parser : gUpdate.parser
		g.filter = g.filter ? g.filter : gUpdate.filter
		g.attribute = g.attribute ? g.attribute : gUpdate.attribute
		g.extractor = g.extractor ? g.extractor : gUpdate.extractor

		return g
	}

	return {
		isAGroupKey,
		getPropertyFromObj,
		getNodesFromSmartSelector,
		getFunctionalParameters,
		updateFunctionalParametersFromSelector
	}


}