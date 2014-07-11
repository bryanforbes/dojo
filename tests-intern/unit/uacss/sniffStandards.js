define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/_base/lang',
	'dojo/parser',
	'dojo/dom',
	'dojo/json',
	'dojo/has',
	'dojo/dom-geometry',
	'dojo/dom-style'
], function(require, registerSuite, assert, Deferred, lang, parser, dom, json, has, domGeom, domStyle) {
	registerSuite({
		name: 'dojo/uacss sniff standards',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./sniffStandards.html'], function(html) {
				document.body.innerHTML = html;
				parser.parse().then(deferred.resolve, deferred.reject);
			});
			return deferred.promise;
		},

		'measure node': function () {
			var node = dom.byId('box1');
			var reportNode = dom.byId('log');
			reportNode.innerHTML = json.stringify({
				boxModel: domGeom.boxModel,
				hasQuirks: has('quirks'),
				width: domStyle.get(node, 'width'),
				marginBoxWidth: domGeom.getMarginBox(node).w,
				htmlClassName: document.documentElement.className
			}, null, '    ');
			
			assert.strictEqual(node.offsetWidth, 100);
		}
	});
});