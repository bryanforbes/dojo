define([
	'intern!object',
	'intern/chai!assert',
	'dojo/dom-construct',
	'dojo/_base/window',
	'dojo'
], function (
	registerSuite,
	assert,
	domConstruct,
	win,
	dojo
) {
	var _rootNode;

	registerSuite({
		name: 'dojo/_base/html/isBodyLtr',

		setup: function () {
			_rootNode = domConstruct.toDom('<div id="div" style="display:none;">' +
				'<iframe id="iframe" src="javascript:\'&lt;html&gt;&lt;head&gt;&lt;script&gt;frameElement.iframeContentWindow=window&lt;/script&gt;' +
				'&lt;/head&gt;&lt;body&gt;&lt;/body&gt;\'"></iframe></div>');
			domConstruct.place(_rootNode, win.body());
			dojo.body().setAttribute('dir', 'rtl');
		},

		teardown: function () {
			domConstruct.destroy(_rootNode);
		},

		rtl: function () {
			assert.notOk(dojo._isBodyLtr());
		},

		cache: function () {
			assert.notOk(dojo._isBodyLtr());
			dojo.body().setAttribute('dir', 'ltr');
			assert.ok(dojo._isBodyLtr());
		},

		'html value': function () {
			dojo.body().setAttribute('dir', 'RTL');
			assert.notOk(dojo._isBodyLtr());
			dojo.body().removeAttribute('dir');
			assert.ok(dojo._isBodyLtr());
		},

		'default value': function () {
			dojo.doc.documentElement.setAttribute('dir', 'rtl');
			assert.notOk(dojo._isBodyLtr());
			dojo.doc.documentElement.removeAttribute('dir');
			assert.ok(dojo._isBodyLtr());
		},

		'hidden iframe': function () {
			dojo.doc.documentElement.setAttribute('dir', 'rtl');
			assert.notOk(dojo._isBodyLtr());
			assert.ok(dojo.withGlobal(dojo.byId('iframe').iframeContentWindow, '_isBodyLtr', dojo));
			dojo.doc.documentElement.setAttribute('dir', 'ltr');
		}
	});
});
