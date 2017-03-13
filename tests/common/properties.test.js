const Properties = require('./../../common/properties.fn')

let obj = {
	"_group_top": {
		"_s": ".selector",
		"_d": {
			"title": ".title",
			"montre": ".montre"
		}
	}
}

// let result = Properties.getFramePropertyValue(obj._group_top, "data")
// let result = Properties.isFrameProperty("_d")


console.log(JSON.stringify(result, null, 2))