/*global define*/

define([
	'intern!object',
	'intern/chai!assert',
	'dojo/store/JsonRest',
	'dojo/store/util/QueryResults',
    'dojo/Promise/all'
], function (registerSuite, assert, JsonRestStore, QueryResults, all) {
    'use strict';
    
    var baseTarget = '/tests-intern/unit/store/';

	registerSuite({
		name: 'dojo/store/JsonRest',

		'.get': [
			function () {
                var target = baseTarget + 'JsonRest-data/',
                    store = new JsonRestStore({
                        target: target
                    });
                
                return all([
                    store.get(1),
                    store.get(4),
                    store.get(5)
                ]).then(function (responses) {
                    assert.strictEqual(responses[0].name, 'one');
                    assert.strictEqual(responses[1].name, 'four');
                    assert.ok(responses[2].prime);
                });
			}
		],

        // Note: The same file is loaded everytime, whatever the query parameters. So only the query parameters are checked.
		'.query': {
			'with boolean': function () {
                var promise,
                    target = baseTarget + 'JsonRest-data.json',
                    store = new JsonRestStore({
                        target: target
                    });

                promise = store.query({ prime: true });
                
                return promise.then(function(response) {
                    assert.strictEqual(promise.ioArgs.url, target + '?prime=true');
                    assert.strictEqual(response.length, 5);
                    assert.strictEqual(response[0].name, 'one');
                });
			},

			'with string having character to be escaped': function () {
                var promise,
                    target = baseTarget + 'JsonRest-data.json',
                    store = new JsonRestStore({
                        target: target
                    });

                promise = store.query({ name: 'two&three four' });
                
                return promise.then(function(response) {
                    assert.strictEqual(promise.ioArgs.url, target + '?name=two%26three%20four');
                });
			}
       }
    });
});
