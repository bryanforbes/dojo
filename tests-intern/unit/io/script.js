define([
	'intern!object',
	'intern/chai!assert',
	'dojo/io/script'
], function (registerSuite, assert, script) {
	var global = (function() { return this; })();

	registerSuite({
		name: 'dojo/io/script',

		'.get': {
			'basic usage': function () {
				var varname = 'basic_usage';
				var dfd = script.get({
					url: '/__services/request/script?scriptVar=' + varname
				});

				dfd.addBoth(function () {
					assert.isDefined(global[varname]);
					assert.equal(global[varname], 'loaded');
				});

				return dfd;
			},

			'checkString looks for a variable to be defined': function () {
				var varname = 'myTasks';
				var dfd = script.get({
					url: '/__services/request/script?scriptVar=' + varname,
					checkString: varname
				});

				dfd.addBoth(function () {
					assert.isDefined(global[varname]);
					assert.equal(global[varname], 'loaded');
				});
			},

			'jsonp': function () {
				var varname = 'jsonp';
				var dfd = script.get({
					url: '/__services/request/script?scriptVar=' + varname,
					content: { foo: 'bar' },
					jsonp: 'callback'
				});

				return dfd.addBoth(function (res) {
					assert.notInstanceOf(res, Error);
					assert.equal(res.animalType, 'mammal');
				});
			},

			'jsonp timeout': function () {
				var dfd = this.async();
				script.get({
					url: '/__services/request/script',
					callbackParamName: 'callback',
					content: {delay: 3000},
					timeout: 500,
					handleAs: 'json',
					preventCache: true,
					handle: dfd.callback(function (response) {
						assert.instanceOf(response, Error);
						assert.equal(response.dojoType, 'timeout');
					})
				});
			}
		}
	});
});