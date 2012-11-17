
var fs = require('fs');
var yaml = require('js-yaml');
var swig = require('swig');


function checkFileExtension(ext) {
	return ext=='swig';
}

function compileString(str, node) {
	
}


function Swig() {
}
Swig.prototype.getType = function() {
	return 'SWIG';
};
Swig.prototype.parse = function(node, callback) {
	fs.readFile(node.path+node.name, 'UTF-8', function (err, data) {
		if(err) {
			callback(err, null);
			return;
		}
		
		var metaBegin = data.indexOf('{#'+"\n");
		var metaEnd = data.indexOf('#}'+"\n");
		if(metaBegin != -1 && metaEnd != -1) {
			var metaStr = data.substr(metaBegin+3, metaEnd-4);
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
			data = data.substr(metaEnd+3);
		}
		node.raw = data;
		callback(false, null);
	});
};
Swig.prototype.compile = function(node) {
	node.compiled = compileString(node.raw, node);
};


module.exports.checkFileExtension = checkFileExtension;
module.exports.Format = Swig;
module.exports.compileString = compileString;
