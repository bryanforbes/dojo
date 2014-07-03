define([
	'intern!object',
	'intern/chai!assert',
	'dojo/dom-construct',
	'dojo/_base/array',
	'dojo'
], function (
	registerSuite,
	assert,
	domConstruct,
	arrayUtil,
	dojo
) {
	var _rootNode;

	registerSuite({
		name: 'dojo/_base/html/docScroll',

		setup: function () {
			_rootNode = domConstruct.toDom('<div id="div" style="border:0px;padding:0px;margin:0px;">' +
				'<iframe id="iframe" src="javascript:\'&lt;html&gt;&lt;head&gt;&lt;script&gt;frameElement.iframeContentWindow=window&lt;/script&gt;' +
				'&lt;/head&gt;&lt;body&gt;&lt;div style=\\\'height:500px;width:500px;\\\'&gt;&nbsp;&lt;/div&gt;&lt;/body&gt;\'"></iframe></div>');
			domConstruct.place(_rootNode, dojo.body());

			_rootNode.style.height = (dojo.doc.documentElement.clientHeight + 2) + 'px';
			_rootNode.style.width = (dojo.doc.documentElement.clientWidth + 1) + 'px';
		},

		teardown: function () {
			domConstruct.destroy(_rootNode);
		},

		'non-scrolled': function () {
			dojo.global.scrollTo(0, 0);
			var s = dojo._docScroll();
			assert.strictEqual(s.x, 0);
			assert.strictEqual(s.y, 0);
		},

		scrolled: function () {
			dojo.global.scrollTo(1, 2);
			var s = dojo._docScroll();
			assert.strictEqual(s.x, 1);
			assert.strictEqual(s.y, 2);

			s = dojo._docScroll();
			assert.strictEqual(s.x, 1);
			assert.strictEqual(s.y, 2);
		},

		'quirks non-scrolled': function () {
			// We need to reset the scoll position here because Intern logs test results to the document which can cause
			// the scroll position to shift
			dojo.global.scrollTo(1, 2);

			var iframeWindow = dojo.byId('iframe').iframeContentWindow;
			iframeWindow.scrollTo(0,0);

			var s = dojo.withGlobal(iframeWindow, '_docScroll', dojo);
			assert.strictEqual(s.x, 0);
			assert.strictEqual(s.y, 0);

			s = dojo._docScroll();
			assert.strictEqual(s.x, 1);
			assert.strictEqual(s.y, 2);
		},

		'quirks scrolled': function () {
			dojo.global.scrollTo(0,0);

			var iframeWindow = dojo.byId('iframe').iframeContentWindow;
			iframeWindow.scrollTo(10,20);

			var s = dojo.withGlobal(iframeWindow, '_docScroll', dojo);
			assert.strictEqual(s.x, 10);
			assert.strictEqual(s.y, 20);
		}
	});
});
