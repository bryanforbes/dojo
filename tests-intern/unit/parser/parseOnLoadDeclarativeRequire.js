define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/parser'
], function(require, registerSuite, assert, Deferred, parser) {
	registerSuite({
		name: 'dojo/parser parseOnLoad declarative require',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./parseOnLoadDeclarativeRequire.html'], function(html) {
				document.body.innerHTML = html;
				parser.parse().then(deferred.resolve, deferred.reject);
			});
			return deferred.promise;
		},

		'auto require': function () {
			assert.typeOf(window.dr1, 'object');
			assert.strictEqual(window.dr1.params.foo, 'bar');
			assert.typeOf(window.dr2, 'object');
			assert.strictEqual(window.dr2.params.foo, 'bar');
			assert.typeOf(window.dr3, 'object');
			assert.strictEqual(window.dr3.params.foo, 'bar');
			assert.strictEqual(window.dr4.params.foo, 2);
			assert.strictEqual(window.dr5.method1(1), 3);
		}
	});
});