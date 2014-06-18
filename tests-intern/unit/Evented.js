define([
	'intern!object',
	'intern/chai!assert',
	'dojo/Evented'
], function (registerSuite, assert, Evented)  {

	var evented;

	registerSuite({
		name: 'dojo/Evented',
		before: function () {
			evented = new Evented();
		},
		'emit on topic': function () {
			var wasPublished = false;
			evented.on('test', function () {
				wasPublished = true;
			});
			evented.emit('test');
			assert.isTrue(wasPublished);
		},
		'emit only on expected topic': function () {
			var wasExpectedPublished = false;
			var wasOtherPublished = false;
			evented.on('test', function () {
				wasExpectedPublished = true;
			});
			evented.on('unexpectedTest', function () {
				wasOtherPublished = true;
			});
			evented.emit('test');
			assert.isTrue(wasExpectedPublished);
			assert.isFalse(wasOtherPublished);
		},
		'emit with argument': function () {
			var expectedArg = {expected: 'object'};
			var actualArg;
			evented.on('test', function (arg) {
				actualArg = arg;
			});
			evented.emit('test', expectedArg);
			assert.equal(actualArg, expectedArg);
		},
		'emit with multiple arguments': function () {
			var expectedArg1 = {expected: 'object1'};
			var expectedArg2 = {expected: 'object2'};
			var actualArg1;
			var actualArg2;
			evented.on('test', function (arg1, arg2) {
				actualArg1 = arg1;
				actualArg2 = arg2;
			});
			evented.emit('test', expectedArg1, expectedArg2);
			assert.equal(actualArg1, expectedArg1);
			assert.equal(actualArg2, expectedArg2);
		}
	});
});

