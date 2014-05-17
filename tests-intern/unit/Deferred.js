define([
	'intern!object',
	'intern/chai!assert',
	"dojo/Deferred",
	"dojo/promise/Promise",
	"dojo/errors/CancelError"
], function (registerSuite, assert, Deferred, Promise, CancelError) {

	registerSuite({
		name: 'dojo/Deferred',

		beforeEach: function () {
			var self = this;
			this.canceler = function(reason){};
			this.deferred = new Deferred(function(reason) {
				return self.canceler(reason);
			});
		},

		'deferred receives result after resolving' : function () {
			var obj = {};
			var received;
			this.parent.deferred.then(function(result){ received = result; });
			this.parent.deferred.resolve(obj);
			assert.ok(received === obj);
		},
		"resolve() returns promise": function(t){
			var obj = {};
			var returnedPromise = this.parent.deferred.resolve(obj);
			assert.ok(returnedPromise instanceof Promise);
			assert.ok(returnedPromise === this.parent.deferred.promise);
		},

		"isResolved() returns true after resolving": function(t){
			assert.isFalse(this.parent.deferred.isResolved());
			this.parent.deferred.resolve();
			assert.ok(this.parent.deferred.isResolved());
		},

		"isFulfilled() returns true after resolving": function(t){
			assert.isFalse(this.parent.deferred.isFulfilled());
			this.parent.deferred.resolve();
			assert.ok(this.parent.deferred.isFulfilled());
		},
		"resolve() is ignored after having been fulfilled": function(t){
			this.parent.deferred.resolve();
			this.parent.deferred.resolve();
		},

		"resolve() throws error after having been fulfilled and strict": function(t){
			this.parent.deferred.resolve();
			assert.throws(function() {
				this.parent.deferred.resolve({}, true)
			}, Error);
		},

		"resolve() results are cached": function(t){
			var obj = {};
			var received;
			this.parent.deferred.resolve(obj);
			this.parent.deferred.then(function(result){ received = result; });
			assert.ok(received === obj);
		},

		"resolve() is already bound to the deferred": function(t){
			var obj = {};
			var received;
			this.parent.deferred.then(function(result){ received = result; });
			var resolve = this.parent.deferred.resolve;
			resolve(obj);
			assert.ok(received === obj);
		},

		"deferred receives result after rejecting": function(t){
			var obj = {};
			var received;
			this.parent.deferred.then(null, function(result){ received = result; });
			this.parent.deferred.reject(obj);
			assert.ok(received === obj);
		},

		"promise receives result after rejecting": function(t){
			var obj = {};
			var received;
			this.parent.deferred.promise.then(null, function(result){ received = result; });
			this.parent.deferred.reject(obj);
			assert.ok(received === obj);
		},

		"reject() returns promise": function(t){
			var obj = {};
			var returnedPromise = this.parent.deferred.reject(obj);
			assert.ok(returnedPromise instanceof Promise);
			assert.ok(returnedPromise === this.parent.deferred.promise);
		},

		"isRejected() returns true after rejecting": function(t){
			assert.isFalse(this.parent.deferred.isRejected());
			this.parent.deferred.reject();
			assert.ok(this.parent.deferred.isRejected());
		},

		"isFulfilled() returns true after rejecting": function(t){
			assert.isFalse(this.parent.deferred.isFulfilled());
			this.parent.deferred.reject();
			assert.ok(this.parent.deferred.isFulfilled());
		},

		"reject() is ignored after having been fulfilled": function(t){
			this.parent.deferred.reject();
			this.parent.deferred.reject();
		},

		"reject() throws error after having been fulfilled and strict": function(t){
			this.parent.deferred.reject();
			assert.throws(function() {
				this.parent.deferred.reject({}, true)
			}, Error);
		},

		"reject() results are cached": function(t){
			var obj = {};
			var received;
			this.parent.deferred.reject(obj);
			this.parent.deferred.then(null, function(result){ received = result; });
			assert.ok(received === obj);
		},

		"reject() is already bound to the deferred": function(t){
			var obj = {};
			var received;
			this.parent.deferred.then(null, function(result){ received = result; });
			var reject = this.parent.deferred.reject;
			reject(obj);
			assert.ok(received === obj);
		},

		"deferred receives result after progress": function(t){
			var obj = {};
			var received;
			this.parent.deferred.then(null, null, function(result){ received = result; });
			this.parent.deferred.progress(obj);
			assert.ok(received === obj);
		},

		"promise receives result after progres": function(t){
			var obj = {};
			var received;
			this.parent.deferred.promise.then(null, null, function(result){ received = result; });
			this.parent.deferred.progress(obj);
			assert.ok(received === obj);
		},

		"progress() returns promise": function(t){
			var obj = {};
			var returnedPromise = this.parent.deferred.progress(obj);
			assert.ok(returnedPromise instanceof Promise);
			assert.ok(returnedPromise === this.parent.deferred.promise);
		},

		"isResolved() returns false after progress": function(t){
			assert.isFalse(this.parent.deferred.isResolved());
			this.parent.deferred.progress();
			assert.isFalse(this.parent.deferred.isResolved());
		},

		"isRejected() returns false after progress": function(t){
			assert.isFalse(this.parent.deferred.isRejected());
			this.parent.deferred.progress();
			assert.isFalse(this.parent.deferred.isRejected());
		},

		"isFulfilled() returns false after progress": function(t){
			assert.isFalse(this.parent.deferred.isFulfilled());
			this.parent.deferred.progress();
			assert.isFalse(this.parent.deferred.isFulfilled());
		},

		"progress() is ignored after having been fulfilled": function(t){
			this.parent.deferred.resolve();
			this.parent.deferred.resolve();
		},

		"progress() throws error after having been fulfilled and strict": function(t){
			this.parent.deferred.resolve();
			assert.throws(function() {
				this.parent.deferred.progress({}, true)
			}, Error);
		},

		"progress() results are not cached": function(t){
			var obj1 = {}, obj2 = {};
			var received = [];
			this.parent.deferred.progress(obj1);
			this.parent.deferred.then(null, null, function(result){ received.push(result); });
			this.parent.deferred.progress(obj2);
			assert.ok(received[0] === obj2);
			assert.strictEqual(1, received.length);
		},

		"progress() with chaining": function(t){
			var obj = {};
			var inner = new Deferred();
			var received;
			this.parent.deferred.then(function(){ return inner; }).then(null, null, function(result){ received = result; });
			this.parent.deferred.resolve();
			inner.progress(obj);
			assert.ok(received === obj);
		},

		"after progress(), the progback return value is emitted on the returned promise": function(t){
			var received;
			var promise = this.parent.deferred.then(null, null, function(n){ return n * n; });
			promise.then(null, null, function(n){ received = n; });
			this.parent.deferred.progress(2);
			assert.strictEqual(4, received);
		},

		"progress() is already bound to the deferred": function(t){
			var obj = {};
			var received;
			this.parent.deferred.then(null, null, function(result){ received = result; });
			var progress = this.parent.deferred.progress;
			progress(obj);
			assert.ok(received === obj);
		},

		"cancel() invokes a canceler": function(t){
			var invoked;
			this.parent.canceler = function(){ invoked = true; };
			this.parent.deferred.cancel();
			assert.ok(invoked);
		},

		"isCanceled() returns true after canceling": function(t){
			assert.isFalse(this.parent.deferred.isCanceled());
			this.parent.deferred.cancel();
			assert.ok(this.parent.deferred.isCanceled());
		},

		"isResolved() returns false after canceling": function(t){
			assert.isFalse(this.parent.deferred.isResolved());
			this.parent.deferred.cancel();
			assert.isFalse(this.parent.deferred.isResolved());
		},

		"isRejected() returns true after canceling": function(t){
			assert.isFalse(this.parent.deferred.isRejected());
			this.parent.deferred.cancel();
			assert.ok(this.parent.deferred.isRejected());
		},

		"isFulfilled() returns true after canceling": function(t){
			assert.isFalse(this.parent.deferred.isFulfilled());
			this.parent.deferred.cancel();
			assert.ok(this.parent.deferred.isFulfilled());
		},

		"cancel() is ignored after having been fulfilled": function(t){
			var canceled = false;
			this.parent.canceler = function(){ canceled = true; };
			this.parent.deferred.resolve();
			this.parent.deferred.cancel();
			assert.isFalse(canceled);
		},

		"cancel() throws error after having been fulfilled and strict": function(t){
			this.parent.deferred.resolve();
			assert.throws(function() {
				this.parent.deferred.cancel(null, true)
			}, Error)
		},

		"cancel() without reason results in CancelError": function(t){
			var reason = this.parent.deferred.cancel();
			var received;
			this.parent.deferred.then(null, function(result){ received = result; });
			assert.ok(received, reason);
		},

		"cancel() returns default reason": function(t){
			var reason = this.parent.deferred.cancel();
			assert.ok(reason instanceof CancelError);
		},

		"reason is passed to canceler": function(t){
			var obj = {};
			var received;
			this.parent.canceler = function(reason){ received = reason; };
			this.parent.deferred.cancel(obj);
			assert.ok(received === obj);
		},

		"cancels with reason returned from canceler": function(t){
			var obj = {};
			var received;
			this.parent.canceler = function(){ return obj; };
			var reason = this.parent.deferred.cancel();
			this.parent.deferred.then(null, function(reason){ received = reason; });
			assert.ok(received === obj);
		},

		"cancel() returns reason from canceler": function(t){
			var obj = {};
			this.parent.canceler = function(){ return obj; };
			var reason = this.parent.deferred.cancel();
			assert.ok(reason === obj);
		},

		"cancel() returns reason from canceler, if canceler rejects with reason": function(t){
			var obj = {};
			var deferred = this.parent.deferred;
			this.parent.canceler = function(){ deferred.reject(obj); return obj; };
			var reason = this.parent.deferred.cancel();
			assert.ok(reason === obj);
		},

		"with canceler not returning anything, returns default CancelError": function(t){
			this.parent.canceler = function(){};
			var reason = this.parent.deferred.cancel();
			var received;
			this.parent.deferred.then(null, function(result){ received = result; });
			assert.ok(received === reason);
		},

		"with canceler not returning anything, still returns passed reason": function(t){
			var obj = {};
			var received;
			this.parent.canceler = function(){};
			var reason = this.parent.deferred.cancel(obj);
			assert.ok(reason === obj);
			this.parent.deferred.then(null, function(result){ received = result; });
			assert.ok(received === reason);
		},

		"cancel() doesn't reject promise if canceler resolves deferred": function(t){
			var deferred = this.parent.deferred;
			var obj = {};
			var received;
			this.parent.canceler = function(){ deferred.resolve(obj); };
			this.parent.deferred.cancel();
			this.parent.deferred.then(function(result){ received = result; });
			assert.ok(received === obj);
		},

		"cancel() doesn't reject promise if canceler resolves a chain of promises": function(t){
			var deferred = this.parent.deferred;
			var obj = {};
			var received;
			this.parent.canceler = function(){ deferred.resolve(obj); };
			var last = this.parent.deferred.then().then().then();
			last.cancel();
			last.then(function(result){ received = result; });
			assert.ok(received === obj);
			assert.ok(this.parent.deferred.isCanceled());
			assert.ok(last.isCanceled());
		},

		"cancel() returns undefined if canceler resolves deferred": function(t){
			var deferred = this.parent.deferred;
			var obj = {};
			this.parent.canceler = function(){ deferred.resolve(obj); };
			var result = this.parent.deferred.cancel();
			assert.ok(typeof result === "undefined");
		},

		"cancel() doesn't change rejection value if canceler rejects deferred": function(t){
			var deferred = this.parent.deferred;
			var obj = {};
			var received;
			this.parent.canceler = function(){ deferred.reject(obj); };
			this.parent.deferred.cancel();
			this.parent.deferred.then(null, function(result){ received = result; });
			assert.ok(received === obj);
		},

		"cancel() doesn't change rejection value if canceler rejects a chain of promises": function(t){
			var deferred = this.parent.deferred;
			var obj = {};
			var received;
			this.parent.canceler = function(){ deferred.reject(obj); };
			var last = this.parent.deferred.then().then().then();
			last.cancel();
			last.then(null, function(result){ received = result; });
			assert.ok(received === obj);
			assert.ok(this.parent.deferred.isCanceled());
			assert.ok(last.isCanceled());
		},

		"cancel() returns undefined if canceler rejects deferred": function(t){
			var deferred = this.parent.deferred;
			var obj = {};
			this.parent.canceler = function(){ deferred.reject(obj); };
			var result = this.parent.deferred.cancel();
			assert.ok(typeof result === "undefined");
		},

		"cancel() a promise chain": function(t){
			var obj = {};
			var received;
			this.parent.canceler = function(reason){ received = reason; };
			this.parent.deferred.then().then().then().cancel(obj);
			assert.ok(received === obj);
		},

		"cancel() a returned promise": function(t){
			var obj = {};
			var received;
			var inner = new Deferred(function(reason){ received = reason; });
			var chain = this.parent.deferred.then(function(){
				return inner;
			});
			this.parent.deferred.resolve();
			chain.cancel(obj, true);
			assert.ok(received === obj);
		},

		"cancel() is already bound to the deferred": function(t){
			var received;
			this.parent.deferred.then(null, function(result){ received = result; });
			var cancel = this.parent.deferred.cancel;
			cancel();
			assert.ok(received instanceof CancelError);
		},

		"chained then()": function(t){
			function square(n){ return n * n; }

			var result;
			this.parent.deferred.then(square).then(square).then(function(n){
				result = n;
			});
			this.parent.deferred.resolve(2);
			assert.strictEqual(result, 16);
		},

		"asynchronously chained then()": function(t) {
			function asyncSquare(n) {
				var inner = new Deferred();
				setTimeout(function(){
					inner.resolve(n * n);
				}, 0);
				return inner.promise;
			}
			var self = this;
			var td = this.async(1000);
			var canceler = function(reason){};
			td.then(asyncSquare)
				.then(asyncSquare)
				.then(function(n) {
					assert.strictEqual(n, 16);
					td.callback(true);
			});
			td.resolve(2);
			return td;
		},

		"then() is already bound to the deferred": function(t){
			var obj = {};
			var then = this.parent.deferred.then;
			var received;
			then(function(result){ received = result; });
			this.parent.deferred.resolve(obj);
			assert.ok(received === obj);
		},

		"then() with progback: returned promise is not fulfilled when progress is emitted": function(t){
			var progressed = false;
			var promise = this.parent.deferred.then(null, null, function(){ progressed = true; });
			this.parent.deferred.progress();
			assert.ok(progressed, "Progress was received.");
			assert.isFalse(promise.isFulfilled(), "Promise is not fulfilled.");
		}
	});

});