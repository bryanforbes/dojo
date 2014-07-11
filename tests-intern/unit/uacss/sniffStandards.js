define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred'
], function(require, registerSuite, assert, Deferred) {
	var iframe = document.createElement('iframe');

	registerSuite({
		name: 'dojo/uacss sniff standards',

		before: function () {
			var deferred = new Deferred();
			iframe.onload = deferred.resolve;
			iframe.src = require.toUrl('./sniffStandards.html');
			document.body.appendChild(iframe);
			return deferred.promise;
		},

		'measure node': function () {
			var node = iframe.contentDocument.body.querySelector('#box1');
			assert.strictEqual(node.offsetWidth, 100);
		}
	});
});