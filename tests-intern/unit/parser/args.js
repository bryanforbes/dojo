define([
	'intern!object',
	'intern/chai!assert',
	'../../../parser',
	'../../../_base/kernel',
	'dojo/_base/declare',
	'dojo/dom-construct',
	'dojo/_base/window'
], function (registerSuite, assert, parser, dojo, declare, domConstruct, win) {

	var container;

	declare('tests/parser/Class1', null, {
		constructor: function (args) {
			this.params = args;
			declare.safeMixin(this, args);
		}
	});

	registerSuite({
		name: 'args scope test',

		setup: function () {
			container = domConstruct.place('<div>' +
				'<div data-myscope-type="tests/parser/Class1" data-myscope-id="scopeObj" data-myscope-props="strProp1:\'text\'"></div>' +
				'<div data-' + dojo._scopeName + '-type="tests/parser/Class1" data-' + dojo._scopeName + '-id="normalObj" data-' + dojo._scopeName + '-props="strProp1:\'text\'"></div>' +
			'</div>', win.body());
		},

		teardown: function () {
			domConstruct.destroy(container);
		},

		'no args': function () {
			var widgets = parser.parse();
			assert.lengthOf(widgets, 1);
			assert.strictEqual(widgets[0].strProp1, 'text');
		},

		'options only': function () {
			/*globals scopeObj*/
			var widgets = parser.parse({
				scope: 'myscope'
			});

			assert.lengthOf(widgets, 1);
			assert.strictEqual(scopeObj.strProp1, 'text');
		}
	});
});
