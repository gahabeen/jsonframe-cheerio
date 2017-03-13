const Selector = require('./../../cheerio/selector.fn')()

let sample = ".class @ href | cap noc super < email || \\d+"
// let sample = ".class @ href"

let result = Selector.getSelectorActions(sample)
// let result = Selector.getLastAction(sample)
console.log(JSON.stringify(result,null,2))