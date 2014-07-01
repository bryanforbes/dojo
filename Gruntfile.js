/* jshint node:true */
module.exports = function (grunt) {
	grunt.loadNpmTasks('intern-geezer');

	var req = (function () {
		this.dojoConfig = {
			async: true,
			baseUrl: __dirname,
			packages: [
				{ name: 'intern', location: 'node_modules/intern-geezer' },
				{ name: 'when', location: 'node_modules/when', main: 'when' },
				{ name: 'dojo', location: '.' }
			],
			map: {
				'*': {
					'intern/dojo': 'intern/node_modules/dojo'
				}
			}
		};
		require('intern-geezer/node_modules/dojo/dojo');
		return this.require;
	})();

	grunt.initConfig({
		intern: {
			local: {
				options: {
					runType: 'runner',
					config: 'tests-intern/intern.local',
					reporters: ['runner']
				}
			},
			remote: {
				options: {
					runType: 'runner',
					config: 'tests-intern/intern',
					reporters: ['runner']
				}
			},
			remoteCi: {
				options: {
					runType: 'runner',
					config: 'tests-intern/intern.ci',
					reporters: ['runner']
				}
			},
			proxy: {
				options: {
					runType: 'runner',
					proxyOnly: true,
					config: 'tests-intern/intern.proxy',
					reporters: ['runner']
				}
			},
			node: {
				options: {
					runType: 'client',
					config: 'tests-intern/intern',
					reporters: ['console']
				}
			}
		}
	});

	var servicesServer;
	grunt.registerTask('proxy', function (proxyHost) {
		var done = this.async();
		req(['dojo/tests-intern/services/main'], function (services) {
			services.start(proxyHost).then(function (server) {
				servicesServer = server;
				done(true);
			});
		});
	});

	grunt.registerTask('test', function (target) {
		function addReporter(reporter, target) {
			var property = 'intern.' + target + '.options.reporters',
				value = grunt.config.get(property);
 
			if (value.indexOf(reporter) !== -1) {
				return;
			}
 
			value.push(reporter);
			grunt.config.set(property, value);
		}

		function runIntern(target, isCombined, isCi) {
			if (self.flags.console) {
				addReporter('console', target);
			}

			if (self.flags.coverage) {
				addReporter((isCi || isCombined) ? 'combined' : 'lcovhtml', target);
			}
	 
			if (target !== 'node') {
				grunt.task.run('proxy' + (isCi ? ':intern.dev' : ''));
			}

			grunt.task.run('intern:' + target);
		}

		var self = this;

		if (!target || target === 'coverage') {
			target = 'remote';
		}

		if (target === 'ci') {
			runIntern('node', true, true);
			runIntern('remoteCi', true, true);
		}
		else if (target === 'all') {
			runIntern('node', true, false);
			runIntern('remote', true, false);
		}
		else {
			runIntern(target);
		}
	});
};
