define([
	'intern!object',
	'intern/chai!assert',
	'dojo/errors/create',
	'sinon'
], function (registerSuite, assert, create, sinon) {
	var name = 'NewError';
	var message = 'message';

	function assertBasicConstruction(error, name, message, Class) {
		assert.equal(error.name, name);
		assert.equal(error.message, message);
		assert.isDefined(error.stack);
		assert.instanceOf(error, Class);
	}

	registerSuite({
		name: 'dojo/errors/create',

		'name only': function () {
			var NewError = create(name);
			var error = new NewError(message);

			assertBasicConstruction(error, name, message, NewError);
		},
		
		'name + constructor method': function () {
			var ctor = sinon.stub();
			var NewError = create(name, ctor);
			var error = new NewError(message);
			
			assertBasicConstruction(error, name, message, NewError);
			assert.isTrue(ctor.calledOn(error));
			assert.equal(ctor.firstCall.args[0], message);
		},
		
		'extending another error and providing properties': function () {
			var ctor = sinon.stub();
			var NewError = create(name, ctor);
			var extendedName = 'ExtendedError';
			var extendedCtor = sinon.stub();
			var properties = { foo: 'bar' };
			var ExtendedError = create(extendedName, extendedCtor, NewError, properties);
			var error = new ExtendedError(message);

			assertBasicConstruction(error, extendedName, message, ExtendedError);
			assert.instanceOf(error, NewError);
			assert.isTrue(ctor.calledOn(error));
			assert.equal(ctor.firstCall.args[0], message);
			assert.isTrue(extendedCtor.calledOn(error));
			assert.equal(extendedCtor.firstCall.args[0], message);
			assert.isTrue(ctor.calledBefore(extendedCtor));
			assert.propertyVal(error, 'foo', 'bar');
		}
	});
});