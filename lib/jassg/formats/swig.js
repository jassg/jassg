
var fs = require('fs');
var yaml = require('js-yaml');
var swig = require('swig');
var Merge = require('merge');


function checkFileExtension(ext) {
	return ext=='swig';
}

function compileStringWithRootPath(str, rootPath, node) {
	swig.init({
		'root': rootPath,
		'cache': false
	});
	
	var vars = Merge(/*node.root.jassg.config.meta,*/ node.meta, {'node': node, 'contents': node.root});
	if(node.isCompiled) {
		vars.content = node.getOutput();
	}
	
	var tpl = swig.compile(str);
	return tpl(vars);
}

function compileString(str, node) {
	return compileStringWithRootPath(str, node.path, node);
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
			if(meta.format) {
				node.format = meta.format;
				delete meta.format;
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
module.exports.compileStringWithRootPath = compileStringWithRootPath;
