
function checkFileExtension(ext) {
	return ext=='swig';
}

function Swig() {
}
Swig.prototype.getType = function() {
	return 'SWIG';
};
Swig.prototype.parse = function(node, callback) {
	//TODO parse swig file
	callback(false, null);
};


module.exports.checkFileExtension = checkFileExtension;
module.exports.Format = Swig;
