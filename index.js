'use strict';


/**
 * Plugin function.
 * @param  {json} frame with DOM selectors.
 * @param  {function?} handle the frame json structure to output the scraped version
 * @return {javascript object} with the scraped structured data 
 */

var cleanEntry = function (text) {
	return text.replace(/\s+/gm, " ").trim();
};

Object.prototype.has = function (o) {
	// o: parameter | type
	var me = this;

	if (o['parameter'] || o['p']) {
		me = me[o['parameter']] || me[o['p']];
	}
	if (o['type'] && o['type'] === 'array') {
		return (me.constructor === Array);
	} else if (o['type']) {
		return (typeof me === o['type']);
	} else {
		return (typeof me !== "undefined");
	}
};

module.exports = function ($) {

	$.prototype.scrape = function (frame, debug) {

		var output = {};
		var mainNode = $(this);

		var iterateThrough = function (obj, elem, node) {
			if(debug) {
				console.log("-------------");
				console.log("-------------");
				console.log("ENTRY DATA");
				console.log("-------------");
				console.log("obj", obj);
				console.log("elem", elem);
				// console.log("node", node.children());
				console.log("-------------");
			}

			Object.keys(obj).forEach(function (key) {
				// The parameter is an Object  

				if(debug) {
					console.log("TAKING CARE OF " + key);
					console.log("-------------");
					console.log("obj[key] ::", key, " || ",  obj[key]);
					// console.log("elem[key]", elem[key]);
					console.log("-------------");
				}

				try {

					if (obj[key].has({
							'type': 'object'
						})) {

						// Check if selector is here
						if (obj[key].has({
								'p': 'selector',
								'type': 'string'
							})) {
							// if (typeof obj[key]['selector'] !== "undefined") {

							// There is only the selector, yeaah
							if (Object.keys(obj[key]).length === 1) {
								if (debug){ console.log("$$ ONLY ONE SELECTOR"); }
								var n = $(node).find(obj[key]['selector']);
								if(n.length > 0) {
									if (debug){ console.log(">> SETTING A VALUE FOR " + key); }
									elem[key] = cleanEntry($(n).text());
								} else {
									if (debug){ console.log(">> SETTING NULL"); }
									elem[key] = null;
								}
							}

							// Has a Selector + Attr item
							// Ignore other parameters
							// Example
							// "something": {
							// 	"selector": ".path",
							// 	"attr": "href"
							// }
							else if (obj[key].has({'p': 'attr','type': 'string'})) {
								if (debug){ console.log("$$ ATTR + SELECTOR"); }
								
								var n = $(node).find(obj[key]['selector']);
								if(n.length > 0) {
									if (debug){ console.log(">> SETTING A VALUE FOR " + key); }
									elem[key] = cleanEntry($(n).attr(obj[key]['attr']));
								} else {
									if (debug){ console.log(">> SETTING NULL"); }
									elem[key] = null;
								}
							}

							// Going to loop through selector via queryAll
							// Use a Parent Node Path
							// Example
							// "something": {
							// 	"selector": ".path",
							// 	"data": [{
							// 
							// }]
							// }
							else if (obj[key].has({'p': 'data','type': 'array'})) {
								if (debug){ console.log("$$ DATA ARRAY + SELECTOR"); }

								if (Object.keys(obj[key]['data']).length > 0) {
									if (debug){ console.log(">> SETTING A VALUE FOR " + key); }

									if(obj[key]['raw'] && obj[key]['raw'] === true){
										elem[key] = {};
										elem[key]['raw'] = cleanEntry($(node).find(obj[key]['selector']).html());
										elem[key]['values'] = [];
										elem[key] = elem[key]['values'];
									} else {
										elem[key] = [];
									}
									$(node).find(obj[key]['selector']).each(function (i, n) {
										elem[key][i] = {};
										iterateThrough(obj[key]['data'][0], elem[key][i], $(n));
									});
								}
							}

							// Going to retrieve data with parent selector
							// Chain selectors 
							else if (obj[key].has({'p': 'data','type': 'object'})) {
								if (debug){ console.log("$$ DATA OBJ + SELECTOR"); }

								if (Object.keys(obj[key]['data']).length > 0) {
									if (debug){ console.log(">> RETURNING OBJ TO SET " + key); }
									elem[key] = {};
									var n = $(node).find(obj[key]['selector']);
									iterateThrough(obj[key]['data'], elem[key], $(n));
								}

							}
						}

						// If it's only an array with no selector
						// Check if direct scrollable doc with direct selector or selector 
						// else if (obj[key].has({'type': 'array'})) {
						// 	// else if (obj[key].constructor === Array) {
						// 	if (Object.keys(obj[key]).length > 0) {

						// 		// ATTR + SELECTOR
						// 		if (obj[key][0].has({'p': 'attr'}) && obj[key][0].has({'p': 'selector'})) {
						// 		if (debug){ console.log("$$ DATA OBJ + SELECTOR"); }
									
						// 			elem[key] = [];
						// 			$(node).find(obj[key][0]['selector']).each(function (i, n) {
						// 				elem[key][i] = cleanEntry($(n).attr(obj[key][0]['attr']));
						// 			});

						// 			// SELECTOR ONLY
						// 		} else if (obj[key][0].has({
						// 				'p': 'selector'
						// 			})) {
						// 			// } else if (typeof obj[key][0]['selector'] !== "undefined") {
						// 			elem[key] = [];
						// 			$(node).find(obj[key][0]['selector']).each(function (i, n) {
						// 				elem[key][i] = cleanEntry($(n).text());
						// 			});
						// 		}

						// 		// To handle first item as selector source
						// 		else if (obj[key][0].has({
						// 				'p': Object.keys(obj[key][0]),
						// 				'type': 'string'
						// 			})) {
						// 			// else if (typeof obj[key][0][Object.keys(obj[key][0])] === 'string') {
						// 			elem[key] = [];
						// 			var firstKey = Object.keys(obj[key][0]);
						// 			var firstSelector = obj[key][0][firstKey];

						// 			$(node).find(firstSelector).each(function (i, n) {
						// 				elem[key][i] = {};
						// 				elem[key][i][firstKey] = cleanEntry($(n).text());
						// 			});
						// 		}
						// 	}
						// }

						// There is no Selector but still an Object
						// It's just for organhasation then
						else {
							if (debug){ console.log("$$ NO SELECTOR - GOING THROUGH"); }
							elem[key] = {};
							iterateThrough(obj[key], elem[key], node);
						}

					}

					// The Parameter is a single string === selector > directly scraped
					else {
						if (debug){ console.log("$$ NATURAL SELECTOR"); }
						// obj[key] value is a selector
						if(node.length > 0) {
							if (debug){ console.log(">> SETTING A VALUE FOR " + key); }
							elem[key] = cleanEntry($(node).find(obj[key]).text());
						} else {
							if (debug){ console.log(">> SETTING NULL"); }
							elem[key] = null;
						}
					}

				} catch (error) {
					if(debug) {
						console.log("ERROR DETECTED ----");
						console.log("----------");
						console.log("obj[key]", obj[key]);
						console.log("elem[key]", elem);
						console.log("----------");
						console.log("LOG");
						console.log("-------------");
						console.log(error);
						console.log("-------------");
					}
				}


			});
		}

		iterateThrough(frame, output, mainNode);
		return output;
	};


};