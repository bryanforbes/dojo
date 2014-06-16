define([
	'intern!object',
	'intern/chai!assert',
	'dojo/topic'
], function (registerSuite, assert, topic) {

	var handles;

	function subscribe(channel, handler) {
		var handle = topic.subscribe(channel, handler);
		handles.push(handle);
		return handle;
	}

	registerSuite({
		name: 'dojo/topic',

		before: function () {
			handles = [];
		},

		after: function () {
			var handle;
			while (handle = handles.pop()) {
				handle.remove();
			}
		},

		'publish on topic': function () {
			var wasPublished;
			subscribe('test', function () {
				wasPublished = true;
			});
			topic.publish('test');
			assert.isTrue(wasPublished);
		},

		'publish with argument': function () {
			var expectedArg = {expected: 'object'};
			var actualArg;
			subscribe('test', function (arg) {
				actualArg = arg;
			});
			topic.publish('test', expectedArg);
			assert.strictEqual(actualArg, expectedArg);
		},

		'publish with multiple arguments': function () {
			var expectedArg1 = {expected: 'object1'};
			var expectedArg2 = {expected: 'object2'};
			var actualArg1;
			var actualArg2;
			subscribe('test', function (arg1, arg2) {
				actualArg1 = arg1;
				actualArg2 = arg2;
			});
			topic.publish('test', expectedArg1, expectedArg2);
			assert.strictEqual(actualArg1, expectedArg1);
			assert.strictEqual(actualArg2, expectedArg2);
		},

		'publish on single topic': function () {
			var wasExpectedPublished;
			var wasOtherPublished = false;
			subscribe('test', function () {
				wasExpectedPublished = true;
			});
			subscribe('other', function () {
				wasOtherPublished = true;
			});
			topic.publish('test');
			assert.isTrue(wasExpectedPublished);
			assert.isFalse(wasOtherPublished);
		},

		'returns handle object': function () {
			var handle;
			handle = subscribe('test', function () {});
			assert.isFunction(handle.remove);
		},

		'handle removes subscription': function () {
			var publishCount = 0;
			var handle;
			handle = subscribe('test', function () {
				publishCount++;
			});
			topic.publish('test');
			handle.remove();
			topic.publish('test');
			assert.equal(publishCount, 1);
		}

	});
});

