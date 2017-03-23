const chrono = require('chrono-node')
const humanname = require('humanname')
const addressit = require('addressit')
// const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

let getData = function (data, extractor, multiple = false) {

	let result = data
	let emailRegex = /([a-zA-Z0-9._-]{1,30}@[a-zA-Z0-9._-]{2,15}\.[a-zA-Z0-9._-]{2,15})/gmi
	let phoneRegex = /\+?\(?\d*\)? ?\(?\d+\)?\d*([\s./-]\d{2,})+/gmi
	let websiteRegex = /(?:[\s\W])((https?:\/\/)?(www\.)?[-a-zA-Z0-9:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&/=]*)/gmi

	if (["phone", "telephone"].includes(extractor)) {
		if (multiple) {
			result = data.match(phoneRegex) || ""
		} else {
			result = data.match(phoneRegex) !== null ? data.match(phoneRegex)[0] : ""
		}
	} else if (["numbers", "nb"].includes(extractor)) {
		if (multiple) {
			result = result.match(/\d+/gm) || ""
		} else {
			result = result.match(/\d+/gm) !== null ? result.match(/\d+/gm)[0] : ""
		}
	} else if (["website"].includes(extractor)) {

		let websites = data.match(websiteRegex)

		if (websites && websites.length > 0) {
			websites = websites.map(function (x) {
				return x.substr(1, x.length) // remove first character
			})

			if (multiple) {
				result = websites || ""
			} else {
				result = websites !== null ? websites[0] : ""
			}
		}

	} else if (["address", "add"].includes(extractor)) {
		result = addressit(data)
	} else if (["email", "mail"].includes(extractor)) {
		if (multiple) {
			result = data.match(emailRegex) || data
			if (_.isArray(result) && result.length === 1) {
				result = result[0]
			}
		} else {
			result = data.match(emailRegex) !== null ? data.match(emailRegex)[0] : ""
		}
	} else if (["date", "d"].includes(extractor)) {
		let date = chrono.casual.parseDate(data)
		if (date) {
			result = date.toString()
		} else {
			result = ""
		}
	} else if (["fullName", "prenom", "firstName", "nom", "lastName", "initials", "suffix", "salutation"].includes(extractor)) {
		// compact data before to parse it
		result = humanname.parse(filterData(data, "cmp"))
		if ("fullName".includes(extractor)) {
			// return the object
		} else if (["firstName", "prenom"].includes(extractor)) {
			result = result.firstName
		} else if (["lastName", "nom"].includes(extractor)) {
			result = result.lastName
		} else if ("initials".includes(extractor)) {
			result = result.initials
		} else if ("suffix".includes(extractor)) {
			result = result.suffix
		} else if ("salutation".includes(extractor)) {
			result = result.salutation
		}
	}

	return result
}

module.exports = {
	getData
}