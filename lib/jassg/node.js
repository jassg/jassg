var fs = require('fs');
var async = require('async');

var HtmlFormat = require('./formats/html');
var JsonFormat = require('./formats/json');
var MarkdownFormat = require('./formats/markdown');
var SwigFormat = require('./formats/swig');


function Node(type, path, name, parent, finished) {
	this.type = type;
	this.path = path;
	this.name = name;
	this.parent = parent;
	this.url = '';
	this.template = 'default';
	this.childs = [];
	this.meta = {};
	this.raw = '';
	this.compiled = '';
	
	if(this.type == 'FOLDER') {
		this.findChildsAndLeafs(function(err, results) {
			if(finished) {
				finished(err, results);
			}
		});
	}
	else {
		this.url = this.path.substr(2)+this.name.substr(0, this.name.lastIndexOf('.'))+'.html';
	}
};
Node.prototype.setURL = function(url) {
	if(url.substr(0, 1) == '/') {
		this.url = url.substr(1);
	}
	else {
		this.url = this.path.substr(2)+url;
	}
}; 
Node.prototype.findChildsAndLeafs = function(finished) {
	this.childs = [];
	
	if(this.type != 'FOLDER') {
		finished(false, null);
		return;
	}
	
	var ctx = this;
	var searchPath = this.path+this.name+'/';
	fs.readdir(searchPath, function(err, files) {
		if(err) {
			console.log('Error while reading directory "'+searchPath+'"');
		}
		else {
			var pathsToRead = [];
			var filesCount = files.length;
			function clb(err, results) {
				filesCount -= 1;
				if(filesCount==0) {
					finished(err, results);
				}
			}
			
			for(var i in files) {
				ctx.parseFileForStats(searchPath, files[i], clb);
			}
		}
	});
};
Node.prototype.parseFileForStats = function(path, fileName, finished) {
	var ctx = this;
	fs.stat(path+fileName, function(err, stats) {
		if(err) {
			console.log('Error while getting stats for path "'+path+fileName+'"');
		}
		else {
			if(stats.isFile()) {
				ctx.parseFile(path, fileName, finished);
			}
			else if(stats.isDirectory()) {
				ctx.parseDirectory(path, fileName, finished);
			}
			else {
				console.log('Error path "'+path+fileName+'" has unsupported type');
			}
		}
	});
};
Node.prototype.parseFile = function(path, fileName, finished) {
	var ext = this.getExtension(fileName);
	
	var format = null;
	var child = null;
	if(HtmlFormat.checkFileExtension(ext)) {
		format = new HtmlFormat.Format();
	}
	else if(JsonFormat.checkFileExtension(ext)) {
		format = new JsonFormat.Format();
	}
	else if(MarkdownFormat.checkFileExtension(ext)) {
		format = new MarkdownFormat.Format();
	}
	else if(SwigFormat.checkFileExtension(ext)) {
		format = new SwigFormat.Format();
	}
	else {
		//TODO just copy file
		console.log('Error path "'+path+fileName+'" has unsupported extension "'+ext+'"');
	}
	
	if(format) {
		var ctx = this;
		var node = new Node(format.getType(), path, fileName, this);
		format.parse(node, function(err, results) {
			node.format = format;
			ctx.childs.push(node);
			finished(err, results);
		});
	}
	else {
		finished(false, null);
	}
};
Node.prototype.parseDirectory = function(path, fileName, finished) {
	var ctx = this;
	var child = new Node('FOLDER', path, fileName, this, function(err, results) {
		ctx.childs.push(child);
		finished(err, results);
	});
};
Node.prototype.getNodeCount = function(recursive, filter) {
	if(filter) {
		var count = 0;
		for(var i in this.childs) {
			if(this.childs[i].type == filter) {
				count += 1;
			}
			if(recursive) {
				count += this.childs[i].getNodeCount(recursive, filter);
			}
		}
		return count;
	}
	else {
		var count = this.childs.length;
		if(recursive) {
			for(var i in this.childs) {
				count += this.childs[i].getNodeCount(recursive, filter);
			}
		}
		return count;
	}
};
Node.prototype.getExtension = function(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i+1);
};


module.exports = Node;
