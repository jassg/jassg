var fs = require('fs-extra');
var async = require('async');


function createProject(jassg, projectName) {
	jassg.projectDir = jassg.projectDir+projectName;
		
	async.series([
		function(callback) {
			fs.mkdirs(jassg.projectDir, function(err) {
				callback(err, null);
			});
		},
		function(callback) {
			fs.mkdirs(jassg.projectDir+'templates', function(err) {
				callback(err, null);
			});
		},
		function(callback) {
			fs.mkdirs(jassg.projectDir+'contents', function(err) {
				callback(err, null);
			});
		},
		function(callback) {
			var defaultConfig = {
				"meta": {
					"title": projectName,
					"description": ""
				}
			}
			fs.writeJSONFile(jassg.projectDir+'config.json', defaultConfig, function(err) {
				callback(err, null);
			});
		}
	], function(err, results) {
		if(err) {
			console.log('There was an error while creating the project: '+err);
			process.exit(1);
		}
		else {
			process.exit(0);
		}
	});
}

function jassgCreate(jassg, projectName) {
	if(fs.existsSync(jassg.projectDir+projectName)) {
		jassg.program.confirm('Directory "'+jassg.projectDir+projectName+'" already exists. Continue? ', function(ok) {
			if(ok) {
				createProject(jassg, projectName);
			}
			else {
				console.log('Aborted');
				process.exit(0);
			}
		});
		return;
	}
	else {
		createProject(jassg, projectName);
	}
}


module.exports = jassgCreate;
