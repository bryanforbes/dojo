define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/_base/lang',
	'dojo/parser',
	'dojo/_base/declare'
], function(require, registerSuite, assert, Deferred, lang, parser, declare) {
	declare('tests.parser.Class1', null, {
		constructor: function (args) {
			this.params = args;
			lang.mixin(this, args);
		}, 
		strProp1: 'original1',
		strProp2: 'original2'
	});

	registerSuite({
		name: 'dojo/parser parser args',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./parserArgs.html'], function(html) {
				document.body.innerHTML = html;
				parser.parse().then(deferred.resolve, deferred.reject);
			});
			return deferred.promise;
		},

		'no args': function () {
			var widgets = parser.parse();
			assert.lengthOf(widgets, 1);
			assert.strictEqual(widgets[0].strProp1, 'text');
		},

		'options only': function () {
			var widgets = parser.parse({
				scope: 'myscope'
			});
			assert.lengthOf(widgets, 1);
			assert.strictEqual(window.scopeObj.strProp1, 'text');
		}
	});
});