
function Jassg(projectDir, verbose, program) {
	this.projectDir = projectDir+'/';
	this.verbose = verbose;
	this.program = program;
	this.contents = null;
}
Jassg.prototype.create = function(projectName) {
	var jassgCreate = require('./jassg/create');
	jassgCreate(this, projectName);
};
Jassg.prototype.stats = function() {
	this.checkProjectDirectoryIsValid();
	
	var ctx = this;
	this.createContentTree(function() {
		var Table = require('cli-table');
		
		//Show complete statistic
		var resultTable = new Table({ head: ['', 'Complete'] });
		resultTable.push(
			{'nodes': [ctx.contents.getNodeCount(true)]},
			{'=> FOLDER': [ctx.contents.getNodeCount(true, 'FOLDER')]},
			{'=> HTML': [ctx.contents.getNodeCount(true, 'HTML')]},
			{'=> SWIG': [ctx.contents.getNodeCount(true, 'SWIG')]},
			{'=> JSON': [ctx.contents.getNodeCount(true, 'JSON')]},
			{'=> MARKDOWN': [ctx.contents.getNodeCount(true, 'MARKDOWN')]}
		);
		console.log(resultTable.toString());
		
		//Show statistic per node
		var resultTable = new Table({ head: ['', 'Type', 'Complete', 'FOLDER', 'HTML', 'SWIG', 'JSON', 'MARKDOWN'] });
		function printStatsForChild(node) {
			var object = {};
			object[node.path+node.name] = [
				node.type,
				node.getNodeCount(true),
				node.getNodeCount(true, 'FOLDER'),
				node.getNodeCount(true, 'HTML'),
				node.getNodeCount(true, 'SWIG'),
				node.getNodeCount(true, 'JSON'),
				node.getNodeCount(true, 'MARKDOWN'),
			];	
			resultTable.push(object);
			
			for(var i in node.childs) {
				printStatsForChild(node.childs[i]);
			}
		}
		printStatsForChild(ctx.contents);
		console.log(resultTable.toString());
		
		//Print the urls
		var resultTable = new Table({ head: ['File', 'URL', 'Template'] });
		function printUrlsForChild(node) {
			if(node.url != '') {
				resultTable.push([node.path+node.name, node.url, node.template]);
			}
			for(var i in node.childs) {
				printUrlsForChild(node.childs[i]);
			}
		}
		printUrlsForChild(ctx.contents);
		console.log(resultTable.toString());
	});
};
Jassg.prototype.build = function() {
	this.checkProjectDirectoryIsValid();
	
	var ctx = this;
	this.createContentTree(function() {
		var jassgBuild = require('./jassg/build');
		jassgBuild(ctx);
	});
};
Jassg.prototype.watch = function() {
	this.checkProjectDirectoryIsValid();
	
	this.createContentTree(function() {
		//TODO watch for content changes
	});
};
Jassg.prototype.server = function() {
	this.checkProjectDirectoryIsValid();
	
	this.createContentTree(function() {
		//TODO start a simpel webserver
	});
};

Jassg.prototype.checkProjectDirectoryIsValid = function() {
	var fs = require('fs-extra');
	
	if(!fs.existsSync(this.projectDir+'config.json')) {
		console.log('Can\'t find project config.json in path "'+this.projectDir+'"');
		process.exit(1);
	}
};
Jassg.prototype.createContentTree = function(callback) {
	try {
		process.chdir(this.projectDir+'contents');
	}
	catch (err) {
		console.log('Can\'t change working directory: ' + err);
		process.exit(1);
	}
	
	var Node = require('./jassg/node');
	this.contents = new Node('FOLDER', '', '.', null);
	this.contents.findChildsAndLeafs(callback);
};

module.exports = Jassg;
