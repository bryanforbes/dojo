define([
	'intern!object',
	'intern/chai!assert',
	'dojo/parser',
	'dojo/dom-construct',
	'dojo/_base/window'
], function (registerSuite, assert, parser, domConstruct, win) {
	/*globals dr1, dr2, dr3, dr4, dr5*/
	var container;

	registerSuite({
		name: 'parser auto-require',

		setup: function () {
			container = domConstruct.place(
				'<div id="main">' +
					'<div data-dojo-id="dr1" data-dojo-type="dojo/tests/resources/AMDWidget" data-dojo-props="foo: \'bar\'"></div>' +
					'<div data-dojo-id="dr2" data-dojo-type="dojo/tests/resources/AMDWidget2" data-dojo-props="foo: \'bar\'"></div>' +
					'<div data-dojo-id="dr3" data-dojo-type="dojo/tests/resources/AMDWidget3" data-dojo-props="foo: \'bar\'"></div>' +
				'</div', win.body());
			return parser.parse();
		},

		teardown: function () {
			domConstruct.destroy(container);
			container = null;
		},

		'parseOnLoad': function () {
			assert.isObject(dr1, 'object using MID mapped to return var');
			assert.equal(dr1.params.foo, 'bar', 'parameters set on instantiation');
			assert.isObject(dr2, 'object using MID mapped to return var');
			assert.equal(dr2.params.foo, 'bar', 'parameters set on instantiation');
			assert.isObject(dr3, 'object using fully required');
			assert.equal(dr3.params.foo, 'bar', 'parameters set on instantiation');
		}
	});

	registerSuite({
		name: 'parser parseOnLoad:true, async:false',

		setup: function () {
			container = domConstruct.place(
				'<div id="main">' +
					'<script type="dojo/require">' +
						'AMDWidget: "dojo/tests/resources/AMDWidget",' +
						'AMDWidget2: "dojo/tests/resources/AMDWidget2"' +
					'</script>' +
					'<div data-dojo-id="dr1" data-dojo-type="AMDWidget" data-dojo-props="foo: \'bar\'"></div>' +
					'<div data-dojo-id="dr2" data-dojo-type="AMDWidget2" data-dojo-props="foo: \'bar\'"></div>' +
					'<script type="dojo/require">' +
						'"acme.AMDWidget3": "dojo/tests/resources/AMDWidget3"' +
					'</script>' +
					'<div data-dojo-id="dr3" data-dojo-type="acme.AMDWidget3" data-dojo-props="foo: \'bar\'"></div>' +
					'<script type="dojo/require">' +
						'amdmodule: "dojo/tests/resources/amdmodule"' +
					'</script>' +
					'<div data-dojo-id="dr4" data-dojo-type="AMDWidget" data-dojo-props="foo: amdmodule(1)"></div>' +
					'<div data-dojo-id="dr5" data-dojo-type="AMDWidget2">' +
						'<script type="dojo/aspect" data-dojo-advice="before" data-dojo-method="method1" data-dojo-args="value">' +
							'return [amdmodule(value)];' +
						'</script>' +
					'</div>' +
				'</div', win.body());
			return parser.parse();
		},

		teardown: function () {
			domConstruct.destroy(container);
			container = null;
		},

		'parseOnLoad': function () {
			assert.isObject(dr1, 'dr1 created');
			assert.equal(dr1.params.foo, 'bar', 'dr1 parameters set on instantiation');
			assert.isObject(dr2, 'dr2 created');
			assert.equal(dr2.params.foo, 'bar', 'dr2 parameters set on instantiation');
			assert.isObject(dr3, 'dr3 created');
			assert.equal(dr3.params.foo, 'bar', 'dr3 parameters set on instantiation');
			assert.equal(dr4.params.foo, 2, 'module loaded and executed');
			assert.equal(dr5.method1(1), 3, 'declarative script has access to parser scope');
		}
	});
});
