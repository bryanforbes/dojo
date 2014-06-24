define([
	'intern!object',
	'intern/chai!assert',
	'dojo/request/registry',
	'dojo/has',
	'intern/dojo/has!host-browser?dojo/domReady!'
], function (registerSuite, assert, registry, has) {

	var suite = {
		name: 'dojo/request/registry',
		'.register': {
			'RegExp registration works': function () {
				var dfd = this.async();
				var handle = registry.register(/^foo/, dfd.callback(function (url) {
					assert.match(url, /^foo/);
					handle.remove();
				}));

				registry.get('foobar');
			},

			'functional registration works': function () {
				var dfd = this.async();
				var handle = registry.register(function (url, options) {
					return options.method === 'POST';
				}, dfd.callback(function (url, options) {
					assert.equal(options.method, 'POST');
					handle.remove();
				}));

				registry.post('foobar');
			},

			'string registration works': function () {
				var dfd = this.async();
				var handle = registry.register('foobar', dfd.callback(function (url) {
					assert.equal(url, 'foobar');
					handle.remove();
				}));

				registry.get('foobar');
			}
		}
	};

	if(has('host-browser')) {
		suite['.get'] = {
			'fallback works': function () {
				var dfd = this.async();
				var url = 'client.html';
				var handle = registry.register('foobar', function () {
				});

				registry.get(url)
					.then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd))
					.always(function () {
						handle.remove();
					}
				);
			}
		};
	}

	registerSuite(suite);
});