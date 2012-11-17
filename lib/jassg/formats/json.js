
var fs = require('fs-extra');


function checkFileExtension(ext) {
	return ext=='json';
}

function Json() {
}
Json.prototype.getType = function() {
	return 'JSON';
};
Json.prototype.parse = function(node, callback) {
	fs.readJSONFile(node.path+node.name, function(err, nodeObj) {
		if(err) {
			console.log('Error can\'t read json file: '+err);
			callback(err, null);
		}
		else {
			if(nodeObj.url) {
				node.setURL(nodeObj.url);
				delete nodeObj.url;
			}
			if(nodeObj.template) {
				node.template = nodeObj.template;
				delete nodeObj.template;
			}
			for(var key in nodeObj) {
				node.meta[key] = nodeObj[key];
			}			
			callback(false, null);
		}
	});
};
Json.prototype.compile = function(node) {};


module.exports.checkFileExtension = checkFileExtension;
module.exports.Format = Json;
