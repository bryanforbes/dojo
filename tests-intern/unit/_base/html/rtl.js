define([
	'intern!object',
	'intern/chai!assert',
	'dojo/dom-construct',
	'dojo/Deferred',
	'dojo/_base/array',
	'require',
	'dojo-testing'
], function (
	registerSuite,
	assert,
	domConstruct,
	Deferred,
	arrayUtil,
	require,
	dojo
) {
	var iframe;
	var doc;
	var win;

	var suite = {
		name: 'dojo/_base/html/rtl',

		setup: function () {
			window.rtlTestsDfd = new Deferred();
			iframe = domConstruct.create('iframe', null, document.body);
			win = iframe.contentWindow;

			// TODO: use __files prefix when supported by test proxy
			// iframe.src = '/__files' + require.toUrl('./rtl.html');
			iframe.src = require.toUrl('./rtl.html');

			return window.rtlTestsDfd.then(function () {
				doc = iframe.contentWindow.document;
				dojo.setContext(iframe.contentWindow, doc);
			});
		},

		teardown: function () {
			domConstruct.destroy(iframe);
			window.rtlTestsDfd = undefined;
		},

		'coords with scrolling': function () {
			var dfd = this.async(1000);

			// allow browsers time to return the scroll point back to the last position
			setTimeout(dfd.rejectOnError(function () {
				// scroll a little
				scrollTo(100, 100);

				// net 50px horizontal movement: back-n-forth scrolling helps with different browsers
				scrollBy(-50, -50);

				// time to scroll...
				setTimeout(dfd.callback(function () {
					var pos = dojo.position('rect100', true);
					assert.strictEqual(pos.y, 100, 'y pos should be 100 after vertical scroll');
					assert.strictEqual(pos.x, 100, 'x pos should be 100 after horizontal scroll');
				}), 100);
			}), 100);
		},

		'event client XY IE': function () {
			var dfd = this.async(2000);
			var rect = dojo.byId('rect100');

			var handler = dojo.connect(rect.offsetParent, 'onclick', null,
				dfd.rejectOnError(function (e) {
					// move the rectangle to the mouse point
					dojo.disconnect(handler);

					var	scroll = dojo.docScroll();
					var pageX = (e.pageX || e.pageY) ? e.pageX : ((e.clientX || 0) + scroll.x);
					var pageY = (e.pageX || e.pageY) ? e.pageY : ((e.clientY || 0) + scroll.y);

					rect.style.left = pageX + 'px';
					rect.style.top = pageY + 'px';

					setTimeout(dfd.callback(function () {
						var rectPos = dojo.position(rect, true);
						assert.strictEqual(rectPos.x, pageX, 'pageX');
						assert.strictEqual(rectPos.y, pageY, 'pageY');
					}), 500); // time to move rect to cursor position
				})
			);

			rect.scrollIntoView();

			setTimeout(dfd.rejectOnError(function () {
				if (!('dispatchEvent' in rect.offsetParent)) {
					rect.offsetParent.fireEvent('onclick'); // IE < 9
				}
				else {
					var clickEvent = rect.offsetParent.ownerDocument.createEvent('MouseEvent');
					clickEvent.initMouseEvent('click', false, false, window, 0, 0, 0, 60, 60, 0, 0, 0, 0, 0, null);
					rect.offsetParent.dispatchEvent(clickEvent);
				}
			}), 500); // time to finish any pre-scrolling
		},

		'test scrolled position': function () {
			var dfd = this.async(10000);
			var control = doc.getElementById('control');
			control.resultReady = dfd.callback(function () {
				assert.strictEqual(control.testResult, 'EQUAL');
			});
			win.runScrollingTest(control);
		}
	};

	arrayUtil.forEach(['None', 'Horz', 'Vert', 'Both'], function (scroll) {
		arrayUtil.forEach(['Quirks', 'Strict'], function (doctype) {
			arrayUtil.forEach(['Small', 'Large'], function (size) {
				var id = 'scrolling' + doctype + 'Iframe' + scroll + size;

				suite[id] = function () {
					var dfd = this.async(4000);
					var span = doc.createElement('span');

					span.loaded = function (iframe) {
						// resultReady is called from inside the iframe
						iframe.resultReady = dfd.callback(function () {
							assert.strictEqual(iframe.testResult, 'EQUAL');
						});
						iframe.runScrollingTest(iframe);
					};

					span.innerHTML = '<iframe class="iframeTest" id="' + id + '" src="scrolling' + doctype +
						'Iframe.html?rtl&' + scroll + '&' + size +
						'" frameborder="0" onload="this.parentNode.loaded(this)" style="background-color:gray;" allowtransparency></iframe>';
					dojo.byId('iframeContainer').appendChild(span);
				};
			});
		});
	});

	registerSuite(suite);
});
