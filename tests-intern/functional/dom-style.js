define([
	'require',
	'intern!object',
	'intern/chai!assert'
], function (require, registerSuite, assert) {
	registerSuite({
		name: 'dojo/dom-style',

		'getComputedStyle': function () {
			return this.get('remote')
				.get(require.toUrl('./dom-style.html'))
				.setExecuteAsyncTimeout(10000)
				.executeAsync(function (send) {
					require([
						'dojo/dom-style',
						'dojo/dom'
					], function (domStyle, dom) {
						var node = dom.byId('node'),
							initialStyle = domStyle.getComputedStyle(node);
						// Create a new node and set it's style to a CSS class name,
						// verifying its computed style is still retrieved
						node = document.createElement('div');
						domStyle.set(node, 'nodeStyle');
						var classStyle = domStyle.getComputedStyle(node);
						send(initialStyle, classStyle);
					});
				})
				.then(function (initialStyle, classStyle) {
					assert.isNotNull(initialStyle);
					assert.isNotNull(classStyle);
				});
		}
	});
});
