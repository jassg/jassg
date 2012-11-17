
var fs = require('fs');
var yaml = require('js-yaml');


function checkFileExtension(ext) {
	return ext=='html';
}

function Html() {
}
Html.prototype.getType = function() {
	return 'HTML';
};
Html.prototype.parse = function(node, callback) {
	fs.readFile(node.path+node.name, 'UTF-8', function (err, data) {
		if(err) {
			callback(err, null);
			return;
		}
		
		var metaBegin = data.indexOf('<!--'+"\n");
		var metaEnd = data.indexOf('//-->'+"\n");
		if(metaBegin != -1 && metaEnd != -1) {
			var metaStr = data.substr(metaBegin+5, metaEnd-6);
			var meta = yaml.load(metaStr);
			if(meta.url) {
				node.setURL(meta.url);
				delete meta.url;
			}
			if(meta.template) {
				node.template = meta.template;
				delete meta.template;
			}
			for(var key in meta) {
				node.meta[key] = meta[key];
			}
			data = data.substr(metaEnd+6);
		}
		node.raw = data;
		node.compiled = data
		callback(false, null);
	});
};
Html.prototype.compile = function(node) {};


module.exports.checkFileExtension = checkFileExtension;
module.exports.Format = Html;
