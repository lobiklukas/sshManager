#!/usr/bin/env node

/**
 * sshManager
 * Custom ssh manager
 *
 * @author Lukáš Lobík <->
 */
const inquirer = require('inquirer');
const execSh = require('exec-sh');

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const servers = require('./data/list');
const chalk = require('chalk');

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

inquirer.registerPrompt('search-list', require('inquirer-search-list'));

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);

	const answers = await inquirer.prompt({
		name: 'server',
		type: 'search-list',
		message: 'Select server',
		choices: servers.map(item => ({
			name: item.description
				? `${item.name} - ${item.description}`
				: `${item.name}`,
			value: item
		})),
		pageSize: 30
	});

	const { server } = answers;
	const address = getSshCmd(server);

	if (server.cyberArkPassword || server.targetPassword) {
		execSh(
			`sshpass -p '${
				server.cyberArkPassword || server.targetPassword
			}' ssh ${address}`,
			{},
			function (err) {
				if (err) {
					console.log('Exit code: ', err.code);
				}
			}
		);
	} else {
		execSh(`ssh ${address}`, {}, function (err) {
			if (err) {
				console.log('Exit code: ', err.code);
			}
		});
	}
})();

function getSshCmd(data) {
	const {
		username,
		username2,
		ipAdress,
		cyberArkIpAdress,
		cyberArkPassword,
		targetPassword
	} = data;
	let str = `${username}`;

	for (const param of [
		username2,
		ipAdress,
		targetPassword,
		cyberArkIpAdress
	]) {
		if (param) str += `@${param}`;
	}
	return str;
}
