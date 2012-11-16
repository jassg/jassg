var packageJson = require('../../../package.json');

var program = require('commander')
	.version(packageJson.version)
	.option('-v, --verbose', 'enables verbose output')
	.option('-p, --project <dir>', 'path to a project, default [.]', '.')
;


var Jassg = require('../../jassg');
var jassg = null;

function createJassg() {
	jassg = new Jassg(program.project, program.verbose, program);
}


program
   .command('create <name>')
   .description('create the basic folder structure for a new site')
   .action(function(name) {
	   createJassg();
	   
	   jassg.create(name);
   })
;
program
   .command('stats')
   .description('display many stats for a jassg project')
   .action(function() {
	   createJassg();
	   
	   jassg.stats();
   })
;
program
   .command('build')
   .description('build the complete project')
   .action(function() {
	   createJassg();
	   
	   jassg.build();
   })
;
program
   .command('watch')
   .description('build the project and watch after that for changes and if a change occours build the project automaticly new')
   .action(function() {
	   createJassg();
	   
	   jassg.build();
	   jassg.watch();
   })
;
program
   .command('server')
   .description('creates a simple webserver for testing. it generates the files on request')
   .action(function() {
	   createJassg();
	   
	   jassg.server();
   })
;


program.parse(process.argv);
