var fs = require('fs');
var async = require('async');

var HtmlFormat = require('./formats/html');
var JsonFormat = require('./formats/json');
var MarkdownFormat = require('./formats/markdown');
var SwigFormat = require('./formats/swig');


function Node(type, path, name, parent, root) {
	this.type = type;
	this.path = path;
	this.name = name;
	this.parent = parent;
	this.internalUrl = '';
	this.template = 'default';
	this.format = 'html';
	this.childs = [];
	this.meta = {};
	this.raw = '';
	this.compiled = '';
	this.compiledFile = '';
	this.isCompiled = false;
	this.formater = null;
	this.root = root;
	if(this.root == null) {
		this.root = this;
	}
	
	if(this.type != 'FOLDER' && this.type != 'RESOURCE') {
		this.internalUrl = this.path.substr(2)+this.name.substr(0, this.name.lastIndexOf('.'));
		this.url = this.internalUrl+'.'+this.format;
	}
};
Node.prototype.setURL = function(url) {
	if(url.substr(0, 1) == '/') {
		this.internalUrl = url.substr(1);
	}
	else {
		this.internalUrl = this.path.substr(2)+url;
	}
	this.url = this.internalUrl+'.'+this.format;
};
Node.prototype.getOutput = function() {
	if(!this.isCompiled) {
		if(this.formater) {
			this.formater.compile(this);
		}
		this.isCompiled = true;
	}
	
	return this.compiled;
};
Node.prototype.compileFileOutput = function(callback) {
	var ctx = this;
	fs.readFile('./../templates/'+this.template+'.'+this.format+'.swig', 'UTF-8', function (err, data) {
		if(err) {
			console.log('Err: '+err);
			callback(err, null);
			return;
		}
	
		var path = '../templates/'+ctx.template;
		if(path.lastIndexOf('/') != -1) {
			path = path.substr(0, path.lastIndexOf('/'));
		}
		else {
			 path = '../templates/';
		}
		
		ctx.compiledFile = SwigFormat.compileStringWithRootPath(data, path, ctx);
		callback(false, null);
	});
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
			if(filesCount==0) {
				finished(false, null);
				return;
			}
			
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
	if(fileName.charAt(0) == '_') {
		finished(false, null);
		return;
	}
	
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
	
	var formater = null;
	var child = null;
	if(HtmlFormat.checkFileExtension(ext)) {
		formater = new HtmlFormat.Format();
	}
	else if(JsonFormat.checkFileExtension(ext)) {
		formater = new JsonFormat.Format();
	}
	else if(MarkdownFormat.checkFileExtension(ext)) {
		formater = new MarkdownFormat.Format();
	}
	else if(SwigFormat.checkFileExtension(ext)) {
		formater = new SwigFormat.Format();
	}
	else {
		var node = new Node('RESOURCE', path, fileName, this);
		this.childs.push(node);
	}
	
	if(formater) {
		var ctx = this;
		var node = new Node(formater.getType(), path, fileName, this, this.root);
		formater.parse(node, function(err, results) {
			node.formater = formater;
			ctx.childs.push(node);
			finished(err, results);
		});
	}
	else {
		finished(false, null);
	}
};
Node.prototype.parseDirectory = function(path, fileName, finished) {
	var child = new Node('FOLDER', path, fileName, this, this.root);
	this.childs.push(child);
	child.findChildsAndLeafs(finished);
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
