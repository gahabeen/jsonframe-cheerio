let getData = function (data, regex, multiple = false) {

	let result = data
	let extracted
	if (regex) {
		try {
			let rgx = regex
			if (typeof regex === "string") {
				rgx = new RegExp(regex, 'gim')
			}
			extracted = rgx.exec(data)
			if (multiple) {
				result = extracted
				// result = data.match(rgx)
			} else {
				if (extracted[1]) {
					result = extracted[1]
				} else {
					result = extracted[0]
				}
				// result = data.match(rgx)[0]
			}
		} catch (error) {
			// console.log("Regex error: ", error)
		}
	}
	return result
}

module.exports = {
	getData
}