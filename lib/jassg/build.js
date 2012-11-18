
var fs = require('fs-extra');
var async = require('async');


function copyResources(jassg, callback) {
	var copyArrayCallbacks = [];
	function addFileForCopy(file) {
		copyArrayCallbacks.push(function (clb) {
			fs.touch('../build/'+file, function(err) {
				fs.copy(file, '../build/'+file, function(err) {
					if(err) {
						console.log('Error can\'t copy resource "'+file+'"');
					}
					clb(false, null);
				});
			});
		});
	}
	
	function checkNode(node) {
		if(node.type=='RESOURCE') {
			addFileForCopy(node.path+node.name);
		}
		
		for(var i in node.childs) {
			checkNode(node.childs[i]);
		}
	}
	checkNode(jassg.contents);
	
	async.parallel(copyArrayCallbacks, function(err, results) {
		callback(null, false);
	});
}

function compileFiles(jassg, callback) {
	callback(null, false);
}

function jassgBuild(jassg) {
	fs.mkdirs('../build', function(err) {
		if(err) {
			console.error('Can\'t create output directory: '+err);
			return;
		}
		
		async.parallel([
			function(callback) {
				copyResources(jassg, callback);
			},
			function(callback) {
				compileFiles(jassg, callback);
			}
		], function(err, results) {
			console.log('Project succesfull compiled');
		});
	});
}


module.exports = jassgBuild;
