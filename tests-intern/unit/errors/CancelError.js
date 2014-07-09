define([
	'intern!object',
	'intern/chai!assert',
	'dojo/errors/CancelError'
], function (registerSuite, assert, CancelError) {
	registerSuite({
		name: 'dojo/errors/CancelError',

		'construction': function () {
			var message = 'message';
			var error = new CancelError(message);

			assert.instanceOf(error, CancelError);
			assert.instanceOf(error, Error);
			assert.equal(error.message, message);
			assert.equal(error.name, 'CancelError');
			assert.propertyVal(error, 'dojoType', 'cancel');
		}
	});
});