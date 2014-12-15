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
					config: 'tests/dojo.intern.local',
					reporters: ['runner']
				}
			},
			remote: {
				options: {
					runType: 'runner',
					config: 'tests/dojo.intern',
					reporters: ['runner']
				}
			},
			proxy: {
				options: {
					runType: 'runner',
					proxyOnly: true,
					config: 'tests/dojo.intern.proxy',
					reporters: ['runner']
				}
			},
			node: {
				options: {
					runType: 'client',
					config: 'tests/dojo.intern',
					reporters: ['console']
				}
			}
		}
	});

	var servicesServer;
	grunt.registerTask('proxy', function (target) {
		var done = this.async();
		req(['dojo/tests-intern/services/main'], function (services) {
			services.start().then(function (server) {
				servicesServer = server;
				if (target) {
					done(true);
				}
			});
		});
	});

	grunt.registerTask('test', function (target) {
		if (!target || target === 'coverage' || target === 'pretty') {
			target = 'remote';
		}

		function addReporter(reporter) {
			var property = 'intern.' + target + '.options.reporters',
				value = grunt.config.get(property);

			if (value.indexOf(reporter) !== -1) {
				return;
			}

			value.push(reporter);
			grunt.config.set(property, value);
		}
		if (this.flags.coverage) {
			addReporter('lcovhtml');
		}

		if (this.flags.console) {
			addReporter('console');
		}

		if (this.flags.pretty) {
			addReporter('pretty');
		}

		if (target !== 'node') {
			grunt.task.run('proxy:tests');
		}
		grunt.task.run('intern:' + target);
	});
};
