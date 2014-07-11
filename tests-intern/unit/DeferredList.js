define([
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo-testing/DeferredList'
], function (registerSuite, assert, Deferred, DeferredList) {
	registerSuite({
		name: 'dojo/DeferredList',

		'callback fired': function () {
			var d1 = new Deferred();
			var d2 = new Deferred();
			var dl = new DeferredList([d1, d2]);
			var fired = false;

			dl.addCallback(function (res) {
				return res;
			});
			dl.addCallback(function (res) {
				assert.lengthOf(res, 2);
				assert.isTrue(res[0][0]);
				assert.strictEqual(res[0][1], 'foo');
				assert.isTrue(res[1][0]);
				assert.strictEqual(res[1][1], 'bar');
				fired = true;
				return res;
			});
			d1.resolve('foo');
			d2.resolve('bar');
			assert.isTrue(fired);
		},

		'errback fired': function () {
			var d1 = new Deferred();
			var d2 = new Deferred();
			var dl = new DeferredList([d1, d2]);
			var fired = false;
			var e1 = new Error('foo');
			var e2 = new Error('bar');

			dl.addCallback(function (res) {
				return res;
			});
			dl.addCallback(function (res) {
				assert.lengthOf(res, 2);
				assert.isTrue(!res[0][0]);

				assert.strictEqual(res[0][1], e1);
				assert.isTrue(!res[1][0]);
				assert.strictEqual(res[1][1], e2);
				fired = true;
				return res;
			});
			d1.reject(e1);
			d2.reject(e2);
			assert.isTrue(fired);
		},

		'mixed response': function () {
			var d1 = new Deferred();
			var d2 = new Deferred();
			var dl = new DeferredList([d1, d2]);
			var fired = false;
			var e = new Error('foo');

			dl.addCallback(function (res) {
				return res;
			});
			dl.addCallback(function (res) {
				assert.lengthOf(res, 2);
				assert.isTrue(!res[0][0]);

				assert.strictEqual(res[0][1], e);
				assert.isTrue(res[1][0]);
				assert.strictEqual(res[1][1], 'bar');
				fired = true;
				return res;
			});
			d1.reject(e);
			d2.resolve('bar');
			assert.isTrue(fired);
		},

		gather: function () {
			var d1 = new Deferred();
			var d2 = new Deferred();
			var dl = DeferredList.prototype.gatherResults([d1, d2]);
			var fired = false;
			dl.addCallback(function (res) {
				assert.strictEqual(res[0], 'foo');
				assert.strictEqual(res[1], 'bar');
				fired = true;
				return res;
			});
			d1.resolve('foo');
			d2.resolve('bar');
			assert.isTrue(fired);
		}
	});
});
