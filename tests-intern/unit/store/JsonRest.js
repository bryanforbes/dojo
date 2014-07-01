require({
	map: {
		'dojo/store/JsonRest': {
			'dojo/_base/xhr': 'tests-intern/unit/store/support/xhrStub'
		},
		'dojo-testing/store/JsonRest': {
			'dojo-testing/_base/xhr': 'tests-intern/unit/store/support/xhrStub'
		}
	}
}, [], function () {
	define([
		'intern!object',
		'intern/chai!assert',
		'dojo/store/JsonRest',
		'dojo/Deferred',
		'intern/dojo/_base/lang',
		'intern/dojo/_base/array',
		'tests-intern/unit/store/support/xhrStub',
		'sinon'
	], function (registerSuite, assert, JsonRest, Deferred, lang, array, xhrStub, sinon) {
		var globalHeaders = {
			'test-global-header-a': true,
			'test-global-header-b': 'yes'
		};
		var requestHeaders = {
			'test-local-header-a': true,
			'test-local-header-b': 'yes',
			'test-override': 'overridden'
		};
		var store;

		function assertHeaders(xhrHeaders) {
			var expectedHeaders = Array.prototype.slice.call(arguments, 1);

			expectedHeaders.push(globalHeaders);
			array.forEach(expectedHeaders, function (headers) {
				for (var key in headers) {
					if (headers.hasOwnProperty(key)) {
						assert.propertyVal(xhrHeaders, key, headers[key]);
					}
				}
			});
		}

		registerSuite({
			name: 'store/JsonRest',

			'beforeEach': function () {
				xhrStub.reset();
				xhrStub.objectToQuery = sinon.stub();

				store = new JsonRest({
					target: require.toUrl('dojo/tests/store/x.y').match(/(.+)x\.y$/)[1],
					headers: lang.mixin({ 'test-override': false }, globalHeaders)
				});
			},

			'.get': {
				'beforeEach': function () {
					var data = {
						id: 'node1.1',
						name: 'node1.1',
						someProperty: 'somePropertyA1',
						children: [
							{ $ref: 'node1.1.1', name: 'node1.1.1' },
							{ $ref: 'node1.1.2', name: 'node1.1.2' }
						]
					};
					var dfd = new Deferred();

					dfd.resolve(data);
					xhrStub.returns(dfd);
				},

				'test': function () {
					var dfd = this.async();
					var expectedName = 'node1.1';

					store.get(expectedName).then(dfd.callback(function (object) {
						assert.equal(object.name, expectedName);
						assert.equal(object.someProperty, 'somePropertyA1');
					}), lang.hitch(dfd, 'reject'));
				},

				'headers provided as object': function () {
					var xhrOptions;

					store.get('destinationUrl', requestHeaders);
					xhrOptions = xhrStub.lastCall.args[1];

					assertHeaders(xhrOptions.headers, requestHeaders);
				},

				'headers provided in options': function () {
					var xhrOptions;

					store.get('destinationUrl', { headers: requestHeaders });
					xhrOptions = xhrStub.lastCall.args[1];

					assertHeaders(xhrOptions.headers, requestHeaders);
				}
			},

			'.query': {
				'beforeEach': function () {
					var data = [
						{ id: 'node1', name: 'node1', someProperty: 'somePropertyA', children: [
							{ $ref: 'node1.1', name: 'node1.1', children: true },
							{ $ref: 'node1.2', name: 'node1.2' }
						] },
						{ id: 'node2', name: 'node2', someProperty: 'somePropertyB' },
						{ id: 'node3', name: 'node3', someProperty: 'somePropertyC' },
						{ id: 'node4', name: 'node4', someProperty: 'somePropertyA' },
						{ id: 'node5', name: 'node5', someProperty: 'somePropertyB' }
					];
					var dfd = new Deferred();

					dfd.resolve(data);
					xhrStub.returns(dfd);
				},

				'test': function () {
					var dfd = this.async();

					store.query('treeTestRoot').then(dfd.callback(function (results) {
						var object = results[0];
						assert.equal(object.name, 'node1');
						assert.equal(object.someProperty, 'somePropertyA');
					}), lang.hitch(dfd, 'reject'));
				},

				'result iteration': function () {
					var dfd = this.async();

					store.query('treeTestRoot').forEach(function (object, index) {
						var expectedName = 'node' + (index + 1);

						assert.equal(object.name, expectedName);
					}).then(lang.hitch(dfd, 'resolve'), lang.hitch(dfd, 'reject'));
				},

				'headers provided in options with range elements': function () {
					var expectedRangeHeaders = { 'X-Range': 'items=20-61', 'Range': 'items=20-61' };
					var xhrOptions;

					store.query({}, { headers: requestHeaders, start: 20, count: 42 });
					xhrOptions = xhrStub.lastCall.args[1];

					assertHeaders(xhrOptions.headers, requestHeaders, expectedRangeHeaders);
				}
			},

			'.remove': {
				'headers provied in options': function () {
					var xhrOptions;

					store.remove('destinationUrl', { headers: requestHeaders });
					xhrOptions = xhrStub.lastCall.args[1];

					assertHeaders(xhrOptions.headers, requestHeaders);
				}
			},

			'.put': {
				'headers provided in options': function () {
					var xhrOptions;

					store.put({}, { headers: requestHeaders });
					xhrOptions = xhrStub.lastCall.args[1];

					assertHeaders(xhrOptions.headers, requestHeaders);
				}
			},

			'.add': {
				'headers provided in options': function () {
					var xhrOptions;

					store.add({}, { headers: requestHeaders });
					xhrOptions = xhrStub.lastCall.args[1];

					assertHeaders(xhrOptions.headers, requestHeaders);
				}
			},

			'after': function () {
				// prevent accidental reuse after test completion
				xhrStub.throws(new Error('this is a stub function'));
			}
		});
	});
});
