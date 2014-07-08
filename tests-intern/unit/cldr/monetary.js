define([
	'intern!object',
	'intern/chai!assert',
	'dojo/cldr/monetary',
	'dojo/_base/kernel'
], function (registerSuite, assert, monetary, dojo) {
	registerSuite({
		name: 'dojo/cldr/monetary',

		'added to kernel': function () {
			assert.isDefined(dojo.cldr.monetary);
			assert.equal(dojo.cldr.monetary, monetary);
		},

		'.getData': {
			'known exception': function () {
				var actual = monetary.getData('ITL');

				assert.equal(actual.places, 0);
				assert.equal(actual.round, 0);
			},

			'unknown or standard location': function () {
				var actual = monetary.getData('USD');

				assert.equal(actual.places, 2);
				assert.equal(actual.round, 0);
			},

			'undefined defaults': function () {
				var actual = monetary.getData();

				assert.equal(actual.places, 2);
				assert.equal(actual.round, 0);
			}
		}
	});
});