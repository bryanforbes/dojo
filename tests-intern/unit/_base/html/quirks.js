define([
	'intern!object',
	'intern/chai!assert',
	'require',
	'dojo/Deferred',
	'dojo/dom-construct',
	'dojo/_base/array',
	'dojo/sniff',
	'dojo-testing'
], function (
	registerSuite,
	assert,
	require,
	Deferred,
	domConstruct,
	arrayUtil,
	has,
	dojo
) {
	var iframe;
	var doc;
	var win;
	var toDestroy;

	var suite = {
		name: 'dojo/_base/html/quirks',

		setup: function () {
			window.htmlTestsDfd = new Deferred();
			iframe = domConstruct.create('iframe', null, document.body);
			win = iframe.contentWindow;

			// TODO: use __files prefix when supported by test proxy
			// iframe.src = '/__files' + require.toUrl('./quirks.html');
			iframe.src = require.toUrl('./quirks.html');

			return window.htmlTestsDfd.then(function () {
				doc = iframe.contentWindow.document;
				dojo.setContext(iframe.contentWindow, doc);
			});
		},

		teardown: function () {
			dojo.setContext(window, document);
			domConstruct.destroy(iframe);
			window.htmlTestsDfd = undefined;
		},

		beforeEach: function () {
			toDestroy = [];
		},

		afterEach: function () {
			var element;
			while ((element = toDestroy.pop())) {
				domConstruct.destroy(element);
			}
		},

		basic:  function () {
			assert.strictEqual(dojo.marginBox('sq100').w, 100);
			assert.strictEqual(dojo.marginBox('sq100').h, 100);

			assert.strictEqual(dojo.marginBox('sq100margin10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100margin10').h, 120);
			assert.strictEqual(dojo.contentBox('sq100margin10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100margin10').h, 100);

			// FIXME: the 'correct' w is not 100 on Safari WebKit (2.0.4 [419.3]), the right-margin extends to the document edge
			//"t.is(100, dojo.marginBox('sq100nopos').w);",
			assert.strictEqual(dojo.marginBox('sq100nopos').h, 100);
		},

		'coords basic': function () {
			var position = dojo.position('sq100', false);
			assert.strictEqual(position.x, 100);
			assert.strictEqual(position.y, 100);
			assert.strictEqual(position.w, 100);
			assert.strictEqual(position.h, 100);
		},

		'coords margin': function () {
			// position() is getting us the border-box location
			var position = dojo.position('sq100margin10', false);
			assert.strictEqual(position.x, 260);
			assert.strictEqual(position.y, 110);
			assert.strictEqual(position.w, 100);
			assert.strictEqual(position.h, 100);

			position = dojo.marginBox('sq100margin10');
			assert.strictEqual(position.w, 120);
			assert.strictEqual(position.h, 120);

			// Though coords shouldn't be used, test it for backward compatibility.
			// coords returns the border-box location and margin-box size
			position = dojo.coords('sq100margin10', false);
			assert.strictEqual(position.x, 260);
			assert.strictEqual(position.y, 110);
			assert.strictEqual(position.w, 120);
			assert.strictEqual(position.h, 120);
		},

		'coords border': function () {
			var position = dojo.position('sq100border10', false);
			assert.strictEqual(position.x, 100);
			assert.strictEqual(position.y, 400);
		},

		sq100nopos: function () {
			var position = dojo.position('sq100nopos', false);
			assert.strictEqual(position.x, 0);
			assert.isTrue(position.y > 0);
			// FIXME: the 'correct' w is not 100 on Safari WebKit (2.0.4 [419.3]), the right-margin extends to the document edge
			//assert.strictEqual(position.w, 100);
			assert.strictEqual(position.h, 100);
		},

		'empty SVG': function () {
			dojo.empty(dojo.byId('surface'));
			assert.notOk(dojo.byId('surface').firstChild, 'svg firstChild');
		},

		'destroy SVG': function () {
			dojo.destroy(dojo.byId('surface'));
			assert.notOk(dojo.byId('surface'), 'svg byId');
		},

		'empty object': function () {
			dojo.empty(dojo.byId('objectToEmpty'));
			assert.notOk(dojo.byId('objectToEmpty').firstChild, 'object firstChild');
		},

		'destroy object': function () {
			dojo.destroy(dojo.byId('objectToEmpty'));
			assert.notOk(dojo.byId('objectToEmpty'), 'object byId');
		},

		'destroy iframe': function () {
			dojo.destroy(dojo.byId('iframeToDestroy'));
			assert.notOk(dojo.byId('iframeToDestroy'), 'iframe byId');
		},

		'destroy div not in DOM': function () {
			var p = dojo.byId('divToRemoveFromDOM');
			var n = dojo.byId('divToDestroy');

			p = p.parentNode.removeChild(p);
			assert.isFalse(!!dojo.byId('divToRemoveFromDOM'), 'div byId');
			assert.isTrue(!!p.firstChild, 'div child 1');
			assert.strictEqual(p.firstChild, n, 'div 1st child');
			assert.notStrictEqual(p.firstChild, p.lastChild, 'div 1st child');

			dojo.destroy(n);
			assert.isTrue(!!p.firstChild, 'div child 2');
			assert.notStrictEqual(p.firstChild, n, 'div 2nd child');
			assert.strictEqual(p.firstChild, p.lastChild, 'div 2nd child');

			dojo.empty(p);
			assert.isFalse(!!p.firstChild, 'div child 3');

			assert.doesNotThrow(function () {
				dojo.destroy(p);
			});
		}
	};

	if (has('ie') <= 9) {
		suite['IE box model'] = function () {
			assert.strictEqual(dojo.marginBox('sq100margin10pad10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100margin10pad10').h, 120);

			assert.strictEqual(dojo.marginBox('sq100pad10').w, 100);
			assert.strictEqual(dojo.marginBox('sq100pad10').h, 100);

			assert.strictEqual(dojo.marginBox('sq100ltpad10').w, 100);
			assert.strictEqual(dojo.marginBox('sq100ltpad10').h, 100);
			assert.strictEqual(dojo.contentBox('sq100ltpad10').w, 90);
			assert.strictEqual(dojo.contentBox('sq100ltpad10').h, 90);

			assert.strictEqual(dojo.marginBox('sq100ltpad10rbmargin10').w, 110);
			assert.strictEqual(dojo.marginBox('sq100ltpad10rbmargin10').h, 110);

			assert.strictEqual(dojo.marginBox('sq100border10').w, 100);
			assert.strictEqual(dojo.marginBox('sq100border10').h, 100);
			assert.strictEqual(dojo.contentBox('sq100border10').w, 80);
			assert.strictEqual(dojo.contentBox('sq100border10').h, 80);

			assert.strictEqual(dojo.marginBox('sq100border10margin10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100border10margin10').h, 120);
			assert.strictEqual(dojo.contentBox('sq100border10margin10').w, 80);
			assert.strictEqual(dojo.contentBox('sq100border10margin10').h, 80);

			assert.strictEqual(dojo.marginBox('sq100border10margin10pad10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100border10margin10pad10').h, 120);
			assert.strictEqual(dojo.contentBox('sq100border10margin10pad10').w, 60);
			assert.strictEqual(dojo.contentBox('sq100border10margin10pad10').h, 60);
		};
	}
	else {
		suite['IE box model'] = function () {
			assert.strictEqual(dojo.marginBox('sq100margin10pad10').w, 140);
			assert.strictEqual(dojo.marginBox('sq100margin10pad10').h, 140);

			assert.strictEqual(dojo.marginBox('sq100pad10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100pad10').h, 120);

			assert.strictEqual(dojo.marginBox('sq100ltpad10').w, 110);
			assert.strictEqual(dojo.marginBox('sq100ltpad10').h, 110);
			assert.strictEqual(dojo.contentBox('sq100ltpad10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100ltpad10').h, 100);

			assert.strictEqual(dojo.marginBox('sq100ltpad10rbmargin10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100ltpad10rbmargin10').h, 120);

			assert.strictEqual(dojo.marginBox('sq100border10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100border10').h, 120);
			assert.strictEqual(dojo.contentBox('sq100border10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100border10').h, 100);

			assert.strictEqual(dojo.marginBox('sq100border10margin10').w, 140);
			assert.strictEqual(dojo.marginBox('sq100border10margin10').h, 140);
			assert.strictEqual(dojo.contentBox('sq100border10margin10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100border10margin10').h, 100);

			assert.strictEqual(dojo.marginBox('sq100border10margin10pad10').w, 160);
			assert.strictEqual(dojo.marginBox('sq100border10margin10pad10').h, 160);
			assert.strictEqual(dojo.contentBox('sq100border10margin10pad10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100border10margin10pad10').h, 100);
		};
	}

	registerSuite(suite);
});
