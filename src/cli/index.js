import chalk from "chalk";
import parseArgv from "minimist";

const usage = `
  usage: jassg [options] [command]
  commands:
    ${chalk.bold("build")} [options] - build a site
    ${chalk.bold("preview")} [options] - run local webserver
    ${chalk.bold("new")} <location> - create a new site
    ${chalk.bold("plugin")} - manage plugins
    also see [command] --help
  global options:
    -v, --verbose   show debug information
    -q, --quiet     only output critical errors
    -V, --version   output version and exit
    -h, --help      show help
`;

const globalOptions = {
    boolean: ["verbose", "quiet", "version", "help"],
    alias: {
        verbose: 'v',
        quiet: 'q',
        version: 'V',
        help: 'h'
    }
};

function main(argv) {
    const opts = parseArgv(argv, globalOptions);

    let cmd = opts._[2];
    if (!!cmd) {
        try {
            cmd = require(`${__dirname}/${cmd}`).default;
        } catch (e) {
            if (e.code === "MODULE_NOT_FOUND") {
                console.log(`'${cmd}' - no such command`);
                process.exit(1);
            } else {
                throw e;
            }
        }
    }

    if (opts.version) {
        console.log(require(`${__dirname}/version`).default);
        process.exit(0);
    }

    if (opts.help || !cmd) {
        console.log(!!cmd ? cmd.usage : usage);
        process.exit(0);
    }
}

module.exports.main = main;
