define([
	'intern!object',
	'intern/chai!assert',
	'dojo/errors/RequestTimeoutError',
	'dojo/errors/RequestError'
], function (registerSuite, assert, RequestTimeoutError, RequestError) {
	registerSuite({
		name: 'dojo/errors/RequestTimeoutError',

		'construction': function () {
			var message = 'message';
			var response = 'response';
			var error = new RequestTimeoutError(message, response);

			assert.instanceOf(error, RequestError);
			assert.instanceOf(error, RequestTimeoutError);
			assert.equal(error.message, message);
			assert.equal(error.name, 'RequestTimeoutError');
			assert.equal(error.response, response);
			assert.propertyVal(error, 'dojoType', 'timeout');
		}
	});
});