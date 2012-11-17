
var fs = require('fs');
var yaml = require('js-yaml');


function checkFileExtension(ext) {
	return ext=='md';
}

function Markdown() {
}
Markdown.prototype.getType = function() {
	return 'MARKDOWN';
};
Markdown.prototype.parse = function(node, callback) {
	fs.readFile(node.path+node.name, 'UTF-8', function (err, data) {
		if(err) {
			callback(err, null);
			return;
		}
		
		var metaBegin = data.indexOf('---'+"\n");
		var metaEnd = data.indexOf('---'+"\n", metaBegin+4);
		if(metaBegin != -1 && metaEnd != -1) {
			var metaStr = data.substr(metaBegin+4, metaEnd-5);
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
			data = data.substr(metaEnd+5);
		}
		node.raw = data;
		callback(false, null);
	});
};


module.exports.checkFileExtension = checkFileExtension;
module.exports.Format = Markdown;
