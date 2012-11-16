
function checkFileExtension(ext) {
	return ext=='html';
}

function Html() {
}
Html.prototype.getType = function() {
	return 'HTML';
};
Html.prototype.parse = function(node, callback) {
	//TODO parse html file
	callback(false, null);
};


module.exports.checkFileExtension = checkFileExtension;
module.exports.Format = Html;
