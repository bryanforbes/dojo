define([
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/promise/Promise',
	'dojo/errors/CancelError'
], function (registerSuite, assert, Deferred, Promise, CancelError) {


	function setUp(){
		var self = this;
		this.canceler = function(){};
		this.deferred = new Deferred(function(reason){ return self.canceler(reason); });
	}

	registerSuite({
		name: 'dojo/Deferred',
		setup: function () {
			for(var name in this.tests){
				this.tests[name].tests.forEach(function(test){
					setUp.bind(test)();
				});
			}
		},
		'.resolve': {
			'deferred receives result after resolving': function () {
				var obj = {};
				var received;
				this.deferred.then(function(result){ received = result; });
				this.deferred.resolve(obj);
				assert.isTrue(received === obj);
			},
			'promise receives result after resolving': function () {
				var obj = {};
				var received;
				this.deferred.promise.then(function(){ received = obj; });
				this.deferred.resolve(obj);
				assert.isTrue(received === obj);
			},
			'resolve() returns promise': function () {
				var obj = {};
				var returnedPromise = this.deferred.resolve(obj);
				assert.isTrue(returnedPromise instanceof Promise);
				assert.isTrue(returnedPromise === this.deferred.promise);
			},
			'isResolved() returns true after resolving': function () {
				assert.isFalse(this.deferred.isResolved());
				this.deferred.resolve();
				assert.isTrue(this.deferred.isResolved());
			},
			'isFulfilled() returns true after resolving': function () {
				assert.isFalse(this.deferred.isFulfilled());
				this.deferred.resolve();
				assert.isTrue(this.deferred.isFulfilled());
			},
			'resolve() is ignored after having been fulfilled': function () {
				this.deferred.resolve();
				this.deferred.resolve();
			},
			'resolve() throws error after having been fulfilled and strict': function () {
				this.deferred.resolve();
				// FAIL: Intern fails the testcase when JS engine throws Error...
				// is there way for Intern to continue processing the assert?
				assert.equal(Error, this.deferred.resolve({}, true));
			},
			'resolve() results are cached': function () {
				var obj = {};
				var received;
				this.deferred.resolve(obj);
				this.deferred.then(function(result){ received = result; });
				assert.isTrue(received === obj);
			},
			'resolve() is already bound to the deferred': function () {
				var obj = {};
				var received;
				this.deferred.then(function(result){ received = result; });
				var resolve = this.deferred.resolve;
				resolve(obj);
				assert.isTrue(received === obj);
			}
		},
		'.reject' : {
			'deferred receives result after rejecting': function () {
				var obj = {};
				var received;
				this.deferred.then(null, function(result){ received = result; });
				this.deferred.reject(obj);
				assert.isTrue(received === obj);
			},
			'promise receives result after rejecting': function () {
				var obj = {};
				var received;
				this.deferred.promise.then(null, function(result){ received = result; });
				this.deferred.reject(obj);
				assert.isTrue(received === obj);
			},
			'reject() returns promise': function () {
				var obj = {};
				var returnedPromise = this.deferred.reject(obj);
				assert.isTrue(returnedPromise instanceof Promise);
				assert.isTrue(returnedPromise === this.deferred.promise);
			},
			'isRejected() returns true after rejecting': function () {
				assert.isFalse(this.deferred.isRejected());
				this.deferred.reject();
				assert.isTrue(this.deferred.isRejected());
			},
			'isFulfilled() returns true after rejecting': function () {
				assert.isFalse(this.deferred.isFulfilled());
				this.deferred.reject();
				assert.isTrue(this.deferred.isFulfilled());
			},
			'reject() is ignored after having been fulfilled': function () {
				this.deferred.reject();
				this.deferred.reject();
			},
			'reject() throws error after having been fulfilled and strict': function () {
				this.deferred.reject();
				// FAIL: Intern fails the testcase when JS engine throws Error...
				// is there way for Intern to continue processing the assert?
				assert.equal(Error, this.deferred.reject({}, true));
			},
			'reject() results are cached': function () {
				var obj = {};
				var received;
				this.deferred.reject(obj);
				this.deferred.then(null, function(result){ received = result; });
				assert.isTrue(received === obj);
			},
			'reject() is already bound to the deferred': function () {
				var obj = {};
				var received;
				this.deferred.then(null, function(result){ received = result; });
				var reject = this.deferred.reject;
				reject(obj);
				assert.isTrue(received === obj);
			}
		},
		'.progress': {
			'deferred receives result after progress': function () {
				var obj = {};
				var received;
				this.deferred.then(null, null, function(result){ received = result; });
				this.deferred.progress(obj);
				assert.isTrue(received === obj);
			},
			'promise receives result after progres': function () {
				var obj = {};
				var received;
				this.deferred.promise.then(null, null, function(result){ received = result; });
				this.deferred.progress(obj);
				assert.isTrue(received === obj);
			},
			'progress() returns promise': function () {
				var obj = {};
				var returnedPromise = this.deferred.progress(obj);
				assert.isTrue(returnedPromise instanceof Promise);
				assert.isTrue(returnedPromise === this.deferred.promise);
			},
			'isResolved() returns false after progress': function () {
				assert.isFalse(this.deferred.isResolved());
				this.deferred.progress();
				assert.isFalse(this.deferred.isResolved());
			},
			'isRejected() returns false after progress': function () {
				assert.isFalse(this.deferred.isRejected());
				this.deferred.progress();
				assert.isFalse(this.deferred.isRejected());
			},
			'isFulfilled() returns false after progress': function () {
				assert.isFalse(this.deferred.isFulfilled());
				this.deferred.progress();
				assert.isFalse(this.deferred.isFulfilled());
			},
			'progress() is ignored after having been fulfilled': function () {
				this.deferred.resolve();
				this.deferred.resolve();
			},
			'progress() throws error after having been fulfilled and strict': function () {
				this.deferred.resolve();
				// FAIL: Intern fails the testcase when JS engine throws Error...
				// is there way for Intern to continue processing the assert?
				assert.equal(Error, this.deferred.progress({}, true));
			},
			'progress() results are not cached': function () {
				var obj1 = {}, obj2 = {};
				var received = [];
				this.deferred.progress(obj1);
				this.deferred.then(null, null, function(result){ received.push(result); });
				this.deferred.progress(obj2);
				assert.isTrue(received[0] === obj2);
				assert.strictEqual(1, received.length);
			},
			'progress() with chaining': function () {
				var obj = {};
				var inner = new Deferred();
				var received;
				this.deferred.then(function () { return inner; })
					.then(null, null, function(result){ received = result; });
				this.deferred.resolve();
				inner.progress(obj);
				assert.isTrue(received === obj);
			},
			'after progress(), the progback return value is emitted on the returned promise': function () {
				var received;
				var promise = this.deferred.then(null, null, function(n){ return n * n; });
				promise.then(null, null, function(n){ received = n; });
				this.deferred.progress(2);
				assert.strictEqual(4, received);
			},
			'progress() is already bound to the deferred': function () {
				var obj = {};
				var received;
				this.deferred.then(null, null, function(result){ received = result; });
				var progress = this.deferred.progress;
				progress(obj);
				assert.isTrue(received === obj);
			}
		},
		'.cancel': {
			'cancel() invokes a canceler': function () {
				var invoked;
				this.canceler = function () { invoked = true; };
				this.deferred.cancel();
				assert.isTrue(invoked);
			},
			'isCanceled() returns true after canceling': function () {
				assert.isFalse(this.deferred.isCanceled());
				this.deferred.cancel();
				assert.isTrue(this.deferred.isCanceled());
			},
			'isResolved() returns false after canceling': function () {
				assert.isFalse(this.deferred.isResolved());
				this.deferred.cancel();
				assert.isFalse(this.deferred.isResolved());
			},
			'isRejected() returns true after canceling': function () {
				assert.isFalse(this.deferred.isRejected());
				this.deferred.cancel();
				assert.isTrue(this.deferred.isRejected());
			},
			'isFulfilled() returns true after canceling': function () {
				assert.isFalse(this.deferred.isFulfilled());
				this.deferred.cancel();
				assert.isTrue(this.deferred.isFulfilled());
			},
			'cancel() is ignored after having been fulfilled': function () {
				var canceled = false;
				this.canceler = function () { canceled = true; };
				this.deferred.resolve();
				this.deferred.cancel();
				assert.isFalse(canceled);
			},
			'cancel() throws error after having been fulfilled and strict': function () {
				this.deferred.resolve();
				// FAIL: Intern fails the testcase when JS engine throws Error...
				// is there way for Intern to continue processing the assert?
				assert.equal(Error, this.deferred.cancel(null, true));
			},
			'cancel() without reason results in CancelError': function () {
				var reason = this.deferred.cancel();
				var received;
				this.deferred.then(null, function(result){ received = result; });
				assert.equal(received, reason);
			},
			'cancel() returns default reason': function () {
				var reason = this.deferred.cancel();
				assert.isTrue(reason instanceof CancelError);
			},
			'reason is passed to canceler': function () {
				var obj = {};
				var received;
				this.canceler = function(reason){ received = reason; };
				this.deferred.cancel(obj);
				assert.isTrue(received === obj);
			},
			'cancels with reason returned from canceler': function () {
				var obj = {};
				var received;
				this.canceler = function () { return obj; };
				var reason = this.deferred.cancel();
				// FAIL: jshint complaning about 'reason' not being used!?
				this.deferred.then(null, function(reason){ received = reason; });
				assert.isTrue(received === obj);
			},
			'cancel() returns reason from canceler': function () {
				var obj = {};
				this.canceler = function () { return obj; };
				var reason = this.deferred.cancel();
				assert.isTrue(reason === obj);
			},
			'cancel() returns reason from canceler, if canceler rejects with reason': function () {
				var obj = {};
				var deferred = this.deferred;
				this.canceler = function () { deferred.reject(obj); return obj; };
				var reason = this.deferred.cancel();
				assert.isTrue(reason === obj);
			},
			'with canceler not returning anything, returns default CancelError': function () {
				this.canceler = function () {};
				var reason = this.deferred.cancel();
				var received;
				this.deferred.then(null, function(result){ received = result; });
				assert.isTrue(received === reason);
			},
			'with canceler not returning anything, still returns passed reason': function () {
				var obj = {};
				var received;
				this.canceler = function () {};
				var reason = this.deferred.cancel(obj);
				assert.isTrue(reason === obj);
				this.deferred.then(null, function(result){ received = result; });
				assert.isTrue(received === reason);
			},
			'cancel() does not reject promise if canceler resolves deferred': function () {
				var deferred = this.deferred;
				var obj = {};
				var received;
				this.canceler = function () { deferred.resolve(obj); };
				this.deferred.cancel();
				this.deferred.then(function(result){ received = result; });
				assert.isTrue(received === obj);
			},
			'cancel() does not reject promise if canceler resolves a chain of promises': function () {
				var deferred = this.deferred;
				var obj = {};
				var received;
				this.canceler = function () { deferred.resolve(obj); };
				var last = this.deferred.then().then().then();
				last.cancel();
				last.then(function(result){ received = result; });
				assert.isTrue(received === obj);
				assert.isTrue(this.deferred.isCanceled());
				assert.isTrue(last.isCanceled());
			},
			'cancel() returns undefined if canceler resolves deferred': function () {
				var deferred = this.deferred;
				var obj = {};
				this.canceler = function () { deferred.resolve(obj); };
				var result = this.deferred.cancel();
				assert.isTrue(typeof result === 'undefined');
			},
			'cancel() does not change rejection value if canceler rejects deferred': function () {
				var deferred = this.deferred;
				var obj = {};
				var received;
				this.canceler = function () { deferred.reject(obj); };
				this.deferred.cancel();
				this.deferred.then(null, function(result){ received = result; });
				assert.isTrue(received === obj);
			},
			'cancel() does not change rejection value if canceler rejects a chain of promises': function () {
				var deferred = this.deferred;
				var obj = {};
				var received;
				this.canceler = function () { deferred.reject(obj); };
				var last = this.deferred.then().then().then();
				last.cancel();
				last.then(null, function(result){ received = result; });
				assert.isTrue(received === obj);
				assert.isTrue(this.deferred.isCanceled());
				assert.isTrue(last.isCanceled());
			},
			'cancel() returns undefined if canceler rejects deferred': function () {
				var deferred = this.deferred;
				var obj = {};
				this.canceler = function () { deferred.reject(obj); };
				var result = this.deferred.cancel();
				assert.isTrue(typeof result === 'undefined');
			},
			'cancel() a promise chain': function () {
				var obj = {};
				var received;
				this.canceler = function(reason){ received = reason; };
				this.deferred.then().then().then().cancel(obj);
				assert.isTrue(received === obj);
			},
			'cancel() a returned promise': function () {
				var obj = {};
				var received;
				var inner = new Deferred(function(reason){ received = reason; });
				var chain = this.deferred.then(function () {
					return inner;
				});
				this.deferred.resolve();
				chain.cancel(obj, true);
				assert.isTrue(received === obj);
			},
			'cancel() is already bound to the deferred': function () {
				var received;
				this.deferred.then(null, function(result){ received = result; });
				var cancel = this.deferred.cancel;
				cancel();
				assert.isTrue(received instanceof CancelError);
			}
		},
		'.then': {
			'chained then()': function () {
				function square(n){ return n * n; }

				var result;
				this.deferred.then(square).then(square).then(function(n){
					result = n;
				});
				this.deferred.resolve(2);
				assert.equal(result, 16);
			},
			'asynchronously chained then()': function () {
				function asyncSquare(n){
					var inner = new Deferred();
					setTimeout(function () { inner.resolve(n * n); }, 0);
					return inner.promise;
				}

				var td = new Deferred();
				this.deferred.then(asyncSquare).then(asyncSquare).then(function(n){
					assert.equal(n, 16);
					td.resolve(true);
				});
				this.deferred.resolve(2);
				return td;
			},
			'then() is already bound to the deferred': function () {
				var obj = {};
				var then = this.deferred.then;
				var received;
				then(function(result){ received = result; });
				this.deferred.resolve(obj);
				assert.isTrue(received === obj);
			},
			'then() with progback: returned promise is not fulfilled when progress is emitted': function () {
				var progressed = false;
				var promise = this.deferred.then(null, null, function () { progressed = true; });
				this.deferred.progress();
				assert.isTrue(progressed, 'Progress was received.');
				assert.isFalse(promise.isFulfilled(), 'Promise is not fulfilled.');
			}
		}
	});
});
