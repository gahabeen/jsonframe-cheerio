
String.prototype.oneSplitFromEnd = function (char) {
	let arr = this.split(char),
		res = []

	res[1] = arr[arr.length - 1]
	arr.pop()
	res[0] = arr.join(char)
	return res
}