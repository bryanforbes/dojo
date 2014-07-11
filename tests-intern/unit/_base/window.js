define([
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/dom-construct',
	'dojo/promise/all',
	'require',
	'dojo-testing/_base/kernel',
	'dojo-testing/sniff',
	'dojo-testing/_base/window'
], function (registerSuite, assert, Deferred, domConstruct, all, require, dojo, has, win) {
	var iframeStandards;
	var iframeQuirks;

	var suite = {
		name: 'dojo/_base/window',

		setup: function () {
			window.windowStandardsDfd = new Deferred();
			window.windowQuirksDfd = new Deferred();

			// Add iframe to page w/ document in standards mode
			iframeStandards = domConstruct.create('iframe', {
				src: require.toUrl('./window/window_iframe_standards.html')
			}, document.body);

			// Add iframe to page w/ document in quirks mode
			iframeQuirks = domConstruct.create('iframe', {
				src: require.toUrl('./window/window_iframe_quirks.html')
			}, document.body);

			return all([ window.windowStandardsDfd.promise, window.windowQuirksDfd.promise ]);
		},

		teardown: function () {
			window.windowStandardsDfd = undefined;
			window.windowQuirksDfd = undefined;
			domConstruct.destroy(iframeStandards);
			domConstruct.destroy(iframeQuirks);
		},

		'with doc': function () {
			var d = iframeQuirks.contentWindow.document;
			var finished;
			var thisObj = { test: 'myThis' };

			win.withDoc(d, function (a1, a2) {
				assert.strictEqual(a1, 1, 'first passed argument should be 1');
				assert.strictEqual(a2, 2, 'second passed argument should be 2');
				assert.strictEqual(this.test, 'myThis', 'context should be re-hitched');
				assert.strictEqual(win.doc, d, 'win.doc should be reassigned');
				finished = true;
			}, thisObj, [1, 2]);

			assert.isTrue(finished, 'Did withDoc test function complete?');
			assert.strictEqual(document, win.doc, 'win.doc should be restored');
		},

		'with global': function () {
			var w = iframeQuirks.contentWindow;
			var finished;
			var thisObj = {test: 'myThis'};

			win.withGlobal(w, function(a1, a2){
				assert.strictEqual(a1, 1, 'first passed argument should be 1');
				assert.strictEqual(a2, 2, 'second passed argument should be 2');
				assert.strictEqual(this.test, 'myThis', 'context should be re-hitched');
				assert.strictEqual(win.global.answer, 42, 'win.global should be reassigned');
				assert.strictEqual(win.doc, w.document, 'win.doc should be reassigned');
				finished = true;
			}, thisObj, [1, 2]);

			assert.isTrue(finished, 'Did withGlobal test function complete?');
			assert.strictEqual(win.global, window, 'win.global should be restored');
			assert.strictEqual(win.doc, document, 'win.doc should be restored');
		},

		'has quirks': function () {
			var origQuirks = has('quirks');

			win.withGlobal(iframeQuirks.contentWindow, function(){
				// TODO: remove in 2.0
				assert.isTrue(dojo.isQuirks, 'dojo.isQuirks should be true in withDoc w/ quirks document');

				assert.isTrue(has('quirks'), 'has("quirks") should be true in withDoc w/ quirks document');
			});

			// TODO: remove in 2.0
			assert.strictEqual(origQuirks, dojo.isQuirks, 'dojo.isQuirks should be reset to initial value');

			assert.strictEqual(origQuirks, has('quirks'), 'has("quirks") should be reset to initial value');

			win.withGlobal(iframeStandards.contentWindow, function(){
				// TODO: remove in 2.0
				assert.isFalse(dojo.isQuirks, 'dojo.isQuirks should be false in withDoc w/ standards document');

				assert.isFalse(has('quirks'), 'has("quirks") should be false in withDoc w/ standards document');
			});

			// TODO: remove in 2.0
			assert.strictEqual(origQuirks, dojo.isQuirks, 'dojo.isQuirks should be reset to initial value (again)');

			assert.strictEqual(origQuirks, has('quirks'), 'has("quirks") should be reset to initial value (again)');
		}
	};

	// add hasIE test for X-UA-Compatible-triggered switch
	if (has('ie') > 7) {
		suite['has IE'] = function () {
			var origIE = has('ie');
			win.withGlobal(iframeStandards.contentWindow, function() {
				// these are disabled because it doesn't seem that we can really emulate IE7 with frames like this.
				//t.is(7, dojo.isIE,'dojo.isIE should be 7 in withDoc w/ standards document w/ EmulateIE7');	// remove in 2.0
				//t.is(7, has('ie'), 'has('ie') should be 7 in withDoc w/ standards document w/ EmulateIE7');
			});

			// TODO: remove in 2.0
			assert.strictEqual(origIE, dojo.isIE, 'dojo.isIE should be reset to initial value');

			assert.strictEqual(origIE, has('ie'), 'has("ie") should be reset to initial value');
		};
	}

	registerSuite(suite);
});
