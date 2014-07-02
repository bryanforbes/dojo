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
						try {
							var node = dom.byId('node'),
								style = domStyle.getComputedStyle(node);
							assert.isNotNull(style);
							node = document.createElement('div');
							domStyle.set(node, 'nodeStyle');
							s = domStyle.getComputedStyle(node);
							assert.isNotNull(style);
						} catch (err) {
							assert.isTrue(false);
						}
					});
				});
		}
	});
});
