
var fs = require('fs');
var yaml = require('js-yaml');
var SwigFormat = require('./swig');
var marked = require('marked');
var nsh = require('node-syntaxhighlighter');


marked.setOptions({
	gfm: true,
	pedantic: false,
	sanitize: false,
	highlight: function(code, lang) {
		var language = nsh.getLanguage(lang);
		return nsh.highlight(code, language);
	}
});


function checkFileExtension(ext) {
	return ext=='md';
}

function Markdown() {
	this.disableSwig = false;
}
Markdown.prototype.getType = function() {
	return 'MARKDOWN';
};
Markdown.prototype.parse = function(node, callback) {
	var ctx = this;
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
			if(meta.disableSwig) {
				ctx.disableSwig = meta.disableSwig;
				delete meta.disableSwig;
			}
			if(meta.format) {
				node.format = meta.format;
				delete meta.format;
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
Markdown.prototype.compile = function(node) {
	var content = node.raw;
	if(!this.disableSwig) {
		content = SwigFormat.compileString(content, node);
	}
	node.compiled = marked(content);
};


module.exports.checkFileExtension = checkFileExtension;
module.exports.Format = Markdown;
