define([
	'intern!object',
	'intern/chai!assert',
	'dojo/errors/RequestError'
], function (registerSuite, assert, RequestError) {
	registerSuite({
		name: 'dojo/errors/RequestError',

		'construction': function () {
			var message = 'message';
			var response = 'response';
			var error = new RequestError(message, response);

			assert.instanceOf(error, Error);
			assert.instanceOf(error, RequestError);
			assert.equal(error.name, 'RequestError');
			assert.equal(error.message, message);
			assert.equal(error.response, response);
		}
	});
});