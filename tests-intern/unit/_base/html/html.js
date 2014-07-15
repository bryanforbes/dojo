define([
	'intern!object',
	'intern/chai!assert',
	'require',
	'dojo/dom-construct',
	'dojo/dom-style',
	'dojo/Deferred',
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/sniff',
	'dojo-testing'
], function (
	registerSuite,
	assert,
	require,
	domConstruct,
	domStyle,
	Deferred,
	lang,
	arrayUtil,
	has,
	dojo
) {
	var iframe;
	var doc;
	var win;
	var toDestroy;

	var suite = {
		name: 'dojo/_base/html/html',

		setup: function () {
			window.htmlTestsDfd = new Deferred();
			iframe = domConstruct.create('iframe', null, document.body);
			win = iframe.contentWindow;

			// TODO: use __files prefix when supported by test proxy
			// iframe.src = '/__files' + require.toUrl('./html.html');
			iframe.src = require.toUrl('./html.html');

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

		'.byId()': function () {
			assert.notOk(dojo.byId('nonExistantId'));
			assert.notOk(dojo.byId(null));
			assert.notOk(dojo.byId(''));
			assert.notOk(dojo.byId(undefined));
		},

		'.marginBox': function () {
			assert.strictEqual(dojo.marginBox('sq100').w, 100);
			assert.strictEqual(dojo.marginBox('sq100').h, 100);
			assert.strictEqual(dojo.marginBox('sq100pad10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100pad10').h, 120);
			assert.strictEqual(dojo.marginBox('sq100nopos').w, 100);
			assert.strictEqual(dojo.marginBox('sq100nopos').h, 100);
			assert.strictEqual(dojo.marginBox('sq100ltpad10').w, 110);
			assert.strictEqual(dojo.marginBox('sq100ltpad10').h, 110);
			assert.strictEqual(dojo.marginBox('sq100border10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100border10').h, 120);
			assert.strictEqual(dojo.marginBox('sq100margin10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100margin10').h, 120);
			assert.strictEqual(dojo.marginBox('sq100margin10pad10').w, 140);
			assert.strictEqual(dojo.marginBox('sq100margin10pad10').h, 140);
			assert.strictEqual(dojo.marginBox('sq100border10margin10').w, 140);
			assert.strictEqual(dojo.marginBox('sq100border10margin10').h, 140);
			assert.strictEqual(dojo.marginBox('sq100ltpad10rbmargin10').w, 120);
			assert.strictEqual(dojo.marginBox('sq100ltpad10rbmargin10').h, 120);
			assert.strictEqual(dojo.marginBox('sq100border10margin10pad10').w, 160);
			assert.strictEqual(dojo.marginBox('sq100border10margin10pad10').h, 160);
		},

		'._getMarginSize': function () {
			assert.strictEqual(dojo._getMarginSize('sq100').w, 100);
			assert.strictEqual(dojo._getMarginSize('sq100').h, 100);
			assert.strictEqual(dojo._getMarginSize('sq100margin10pad10').w, 140);
			assert.strictEqual(dojo._getMarginSize('sq100margin10pad10').h, 140);
		},

		'.contentBox': function () {
			assert.strictEqual(dojo.contentBox('sq100ltpad10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100ltpad10').h, 100);
			assert.strictEqual(dojo.contentBox('sq100border10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100border10').h, 100);
			assert.strictEqual(dojo.contentBox('sq100margin10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100margin10').h, 100);
			assert.strictEqual(dojo.contentBox('sq100border10margin10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100border10margin10').h, 100);
			assert.strictEqual(dojo.contentBox('sq100border10margin10pad10').w, 100);
			assert.strictEqual(dojo.contentBox('sq100border10margin10pad10').h, 100);
		},

		'._getPadExtents': function () {
			var element = dojo.byId('sq100ltpad10rbmargin10');
			var size = dojo._getPadExtents(element);

			assert.strictEqual(size.l, 10);
			assert.strictEqual(size.t, 10);
			assert.strictEqual(size.w, 10);
			assert.strictEqual(size.h, 10);
		},

		'._getMarginExtents': function () {
			var element = dojo.byId('sq100ltpad10rbmargin10');
			var size = dojo._getMarginExtents(element);

			assert.strictEqual(size.l, 0);
			assert.strictEqual(size.t, 0);
			assert.strictEqual(size.w, 10);
			assert.strictEqual(size.h, 10);
		},

		'._getBorderExtents': function () {
			var element = dojo.byId('sq100border10margin10pad10');
			var size = dojo._getBorderExtents(element);

			assert.strictEqual(size.l, 10);
			assert.strictEqual(size.t, 10);
			assert.strictEqual(size.w, 20);
			assert.strictEqual(size.h, 20);
		},

		'._getPadBorderExtents': function () {
			var element = dojo.byId('sq100border10margin10pad10');
			var size = dojo._getPadBorderExtents(element);

			assert.strictEqual(size.l, 20);
			assert.strictEqual(size.t, 20);
			assert.strictEqual(size.w, 40);
			assert.strictEqual(size.h, 40);
		},

		'coords basic': function () {
			assert.deepEqual(dojo.position('sq100', false), {
				x: 100,
				y: 100,
				w: 100,
				h: 100
			});
		},

		'coords margin': function () {
			// position() is getting us the border-box location
			assert.deepEqual(dojo.position('sq100margin10', false), {
				x: 260,
				y: 110,
				w: 100,
				h: 100
			});

			var box = dojo.marginBox('sq100margin10');
			assert.strictEqual(box.w, 120);
			assert.strictEqual(box.h, 120);

			// Though coords shouldn't be used, test it for backward compatibility.
			// coords returns the border-box location and margin-box size
			var coords = dojo.coords('sq100margin10', false);
			assert.strictEqual(coords.x, 260);
			assert.strictEqual(coords.y, 110);
			assert.strictEqual(coords.w, 120);
			assert.strictEqual(coords.h, 120);
		},

		'coords border': function () {
			var position = dojo.position('sq100border10', false);
			assert.strictEqual(position.x, 100);
			assert.strictEqual(position.y, 400);
		},

		sq00nopos: function () {
			var position = dojo.position('sq100nopos', false);
			assert.strictEqual(position.x, 0);
			assert.isTrue(position.y > 0);
			assert.closeTo(position.h, 100, 0.001);
			// FIXME: the 'correct' w is not 100 on Safari WebKit (2.0.4 [419.3]), the right-margin extends to the document edge
			assert.closeTo(position.w, 100, 0.001);
		},

		'coords scrolled': function () {
			var parentElement = doc.createElement('div');
			var childElement = doc.createElement('div');
			var x = 257;
			var y = 285;
			var pos;

			doc.body.appendChild(parentElement);
			toDestroy.push(parentElement);

			parentElement.appendChild(childElement);

			domStyle.set(parentElement, {
				position: 'absolute',
				overflow: 'scroll',
				border: '10px solid black'
			});

			dojo.marginBox(parentElement, {l: x, t: y, w: 100, h: 100});
			dojo.marginBox(childElement, {l: 0, t: 0, w: 500, h: 500});
			parentElement.scrollTop = 200;
			pos = dojo.position(parentElement, true);
			assert.strictEqual(x, pos.x);
			assert.strictEqual(y, pos.y);
		},

		'coords iframe': function () {
			var dfd = this.async();

			setTimeout(dfd.callback(function () {
				var oldLtr = dojo._isBodyLtr();
				var oldQuirks = has('quirks');

				dojo.withGlobal(dojo.byId('iframe_quirks').win, function () {
					assert.isTrue(has('quirks'), 'has("quirks") === true in quirks/iframe');
					assert.isFalse(dojo._isBodyLtr(), 'isBodyLtr === false in RTL/iframe');

					var pos = dojo.position('iframe_00_quirks');
					assert.isTrue(pos.x === 0, 'quirks iframe element x === 0 (x,y,w,h=' + pos.x + ',' + pos.y +
						',' + pos.w + ',' + pos.h + ')');
					assert.isTrue(pos.y === 0, 'quirks iframe element y === 0 (x,y,w,h=' + pos.x + ',' + pos.y +
						',' + pos.w + ',' + pos.h + ')');
					assert.isTrue(pos.w > 0, 'quirks iframe element w > 0 (x,y,w,h=' + pos.x + ',' + pos.y + ','
						+ pos.w + ',' + pos.h + ')');
					assert.isTrue(pos.h > 0, 'quirks iframe element h > 0 (x,y,w,h=' + pos.x + ',' + pos.y + ','
						+ pos.w + ',' + pos.h + ')');
				});

				dojo.withGlobal(dojo.byId('iframe_strict').win, function () {
					assert.isFalse(has('quirks'), 'has("quirks") == false in strict/iframe');
					assert.isFalse(dojo._isBodyLtr(), 'isBodyLtr == false in RTL/iframe');
					var pos = dojo.position('iframe_00_strict');
					assert.isTrue(pos.x===0, 'strict iframe element x == 0 (x,y,w,h=' + pos.x + ',' + pos.y +
						',' + pos.w + ',' + pos.h + ')');
					assert.isTrue(pos.y===0, 'strict iframe element y == 0 (x,y,w,h=' + pos.x + ',' + pos.y +
						',' + pos.w + ',' + pos.h + ')');
					assert.isTrue(pos.w>0, 'strict iframe element w > 0 (x,y,w,h=' + pos.x + ',' + pos.y + ',' +
						pos.w + ',' + pos.h + ')');
					assert.isTrue(pos.h>0, 'strict iframe element h > 0 (x,y,w,h=' + pos.x + ',' + pos.y + ',' +
						pos.w + ',' + pos.h + ')');
				});

				assert.isTrue(oldLtr === dojo._isBodyLtr(), 'isBodyLtr restored after withGlobal');
				assert.strictEqual(oldQuirks, has('quirks'), 'has("quirks") restored after withGlobal');
			}), 1000);

			return dfd;
		},

		style: function () {
			assert.equal(dojo.style('sq100nopos', 'opacity'), 1);
			assert.strictEqual(Number(dojo.style('sq100nopos', 'opacity', 0.1)).toFixed(4), (0.1).toFixed(4));
			assert.strictEqual(Number(dojo.style('sq100nopos', 'opacity', 0.8)).toFixed(4), (0.8).toFixed(4));
			assert.strictEqual(dojo.style('sq100nopos', 'position'), 'static');
		},

		'style object': function () {
			dojo.style('sq100nopos', { 'opacity': 0.1 });
			assert.strictEqual(Number(dojo.style('sq100nopos', 'opacity')).toFixed(4), (0.1).toFixed(4));
			dojo.style('sq100nopos', { 'opacity': 0.8 });
			assert.strictEqual(Number(dojo.style('sq100nopos', 'opacity')).toFixed(4), (0.8).toFixed(4));
		},

		'get background color': function () {
			var bgc = dojo.style('sq100nopos', 'backgroundColor');
			assert.isTrue(
				bgc === 'rgb(0, 0, 0)' ||
				bgc === 'black' ||
				bgc === '#000000'
			);
		},

		'.isDescendant': function () {
			assert.isTrue(dojo.isDescendant('sq100', dojo.body()));
			assert.isTrue(dojo.isDescendant('sq100', dojo.doc));
			assert.isTrue(dojo.isDescendant('sq100', 'sq100'));
			assert.isTrue(dojo.isDescendant(dojo.byId('sq100'), 'sq100'));
			assert.isFalse(dojo.isDescendant('sq100', dojo.byId('sq100').firstChild));
			assert.isTrue(dojo.isDescendant(dojo.byId('sq100').firstChild, 'sq100'));
		},

		'.isDescendant iframe': function () {
			var bif = dojo.byId('blah');
			// this test barely makes sense. disabling it for now.
			// doh.t(dojo.isDescendant(bif.contentDocument.getElementById('subDiv'), bif.parentNode));
			//
			var subDiv = bif.contentWindow.document.getElementById('subDiv');
			assert.isTrue(dojo.isDescendant(subDiv, subDiv));
			assert.isTrue(dojo.isDescendant(subDiv, subDiv.parentNode));
			assert.isFalse(dojo.isDescendant(subDiv.parentNode, subDiv));
		},

		'test class functions': function () {
			var node = dojo.byId('sq100');
			dojo.removeClass(node);
			dojo.addClass(node, 'a');
			assert.strictEqual(node.className, 'a');

			dojo.removeClass(node, 'c');
			assert.strictEqual(node.className, 'a');
			assert.isTrue(dojo.hasClass(node, 'a'));
			assert.isFalse(dojo.hasClass(node, 'b'));

			dojo.addClass(node, 'b');
			assert.strictEqual(node.className, 'a b');
			assert.isTrue(dojo.hasClass(node, 'a'));
			assert.isTrue(dojo.hasClass(node, 'b'));

			dojo.removeClass(node, 'a');
			assert.strictEqual(node.className, 'b');
			assert.isFalse(dojo.hasClass(node, 'a'));
			assert.isTrue(dojo.hasClass(node, 'b'));

			dojo.toggleClass(node, 'a');
			assert.strictEqual(node.className, 'b a');
			assert.isTrue(dojo.hasClass(node, 'a'));
			assert.isTrue(dojo.hasClass(node, 'b'));

			dojo.toggleClass(node, 'a');
			assert.strictEqual(node.className, 'b');
			assert.isFalse(dojo.hasClass(node, 'a'));
			assert.isTrue(dojo.hasClass(node, 'b'));

			dojo.toggleClass(node, 'b');
			assert.strictEqual(node.className, '');
			assert.isFalse(dojo.hasClass(node, 'a'));
			assert.isFalse(dojo.hasClass(node, 'b'));

			dojo.removeClass(node, 'c');
			assert.isTrue(!node.className);

			var acuWorked = true;
			try {
				dojo.addClass(node);
			}
			catch (e) {
				acuWorked = false;
			}
			assert.isTrue(acuWorked, 'addClass handles undefined class');

			dojo.addClass(node, 'a');
			dojo.replaceClass(node, 'b', 'a');
			assert.isTrue(dojo.hasClass(node, 'b'));
			assert.isFalse(dojo.hasClass(node, 'a'));

			dojo.replaceClass(node, '', 'b');
			assert.isFalse(dojo.hasClass(node, 'b'));
			assert.strictEqual(node.className, '');

			dojo.addClass(node, 'b a');
			dojo.replaceClass(node, 'c', '');
			assert.strictEqual(node.className, 'b a c');

			assert.isFalse(dojo.hasClass(document, 'ab"'));
		},

		'test add remove multiple class': function () {
			var node = dojo.byId('sq100');
			dojo.removeClass(node);
			dojo.addClass(node, 'a');
			assert.strictEqual(node.className, 'a');

			dojo.addClass(node, 'a b');
			assert.strictEqual(node.className, 'a b');

			dojo.addClass(node, 'b a');
			assert.strictEqual(node.className, 'a b');

			dojo.addClass(node, ['a', 'c']);
			assert.strictEqual(node.className, 'a b c');

			dojo.removeClass(node, 'c a');
			assert.strictEqual(node.className, 'b');

			dojo.removeClass(node);
			assert.strictEqual(node.className, '');

			dojo.addClass(node, '  c   b   a ');
			assert.strictEqual(node.className, 'c b a');

			dojo.removeClass(node, ' c b ');
			assert.strictEqual(node.className, 'a');

			dojo.removeClass(node, ['a', 'c']);
			assert.strictEqual(node.className, '');

			dojo.addClass(node, 'a b');
			dojo.replaceClass(node, 'c', 'a b');
			assert.strictEqual(node.className, 'c');

			dojo.replaceClass(node, '');
			assert.strictEqual(node.className, '');
		},

		'get type of input': function () {
			var input = dojo.byId('input-no-type');
			assert.notOk(dojo.hasAttr(input, 'type'));
			assert.isNull(dojo.attr(input, 'type'));

			input = dojo.byId('input-with-type');
			assert.ok(dojo.hasAttr(input, 'type'));
			assert.strictEqual(dojo.attr(input, 'type'), 'checkbox');
		},

		'get type by id string': function () {
			assert.notOk(dojo.hasAttr('input-no-type', 'type'));
			assert.isNull(dojo.attr('input-no-type', 'type'));
			assert.ok(dojo.hasAttr('input-with-type', 'type'));
			assert.strictEqual(dojo.attr('input-with-type', 'type'), 'checkbox');
		},

		'attribute id': function () {
			var div;
			assert.ok(dojo.hasAttr('div-no-tabindex', 'id'));
			assert.strictEqual(dojo.attr('div-no-tabindex', 'id'), 'div-no-tabindex');

			div = doc.createElement('div');
			assert.notOk(dojo.hasAttr(div, 'id'));
			assert.isNull(dojo.attr(div, 'id'));

			dojo.attr(div, 'id', 'attrId1');
			assert.ok(dojo.hasAttr(div, 'id'));
			assert.strictEqual(dojo.attr(div, 'id'), 'attrId1');

			dojo.removeAttr(div, 'id');
			assert.notOk(dojo.hasAttr(div, 'id'));
			assert.isNull(dojo.attr(div, 'id'));
		},

		'get tab index div': function () {
			assert.notOk(dojo.hasAttr('div-no-tabindex', 'tabIndex'));
			assert.notOk(dojo.attr('div-no-tabindex', 'tabIndex'));
			assert.ok(dojo.hasAttr('div-tabindex-minus-1', 'tabIndex'));

			if (!has('opera')) {
				// Opera (at least <= 9) does not support tabIndex="-1"
				assert.equal(dojo.attr('div-tabindex-minus-1', 'tabIndex'), -1);
			}

			assert.ok(dojo.hasAttr('div-tabindex-0', 'tabIndex'));
			assert.equal(dojo.attr('div-tabindex-0', 'tabIndex'), 0);
			assert.equal(dojo.attr('div-tabindex-1', 'tabIndex'), 1);
		},

		'get tab index for input elements': function () {
			if (!has('ie') || has('ie') >= 8) {
				// IE6/7 always reports tabIndex as defined
				assert.notOk(dojo.hasAttr('input-no-tabindex', 'tabIndex'));
				assert.notOk(dojo.attr('input-no-tabindex', 'tabIndex'));
			}

			assert.ok(dojo.hasAttr('input-tabindex-minus-1', 'tabIndex'));

			if (!has('opera')) {
				// Opera (at least <= 9) does not support tabIndex="-1"
				assert.equal(dojo.attr('input-tabindex-minus-1', 'tabIndex'), -1);
			}

			assert.ok(dojo.hasAttr('input-tabindex-0', 'tabIndex'));
			assert.equal(dojo.attr('input-tabindex-0', 'tabIndex'), 0);
			assert.equal(dojo.attr('input-tabindex-1', 'tabIndex'), 1);
		},

		'set tabIndex on div': function () {
			var div = doc.createElement('div');
			assert.notOk(dojo.attr(div, 'tabIndex'));

			dojo.attr(div, 'tabIndex', -1);
			if (!has('opera')) {
				// Opera (at least <= 9) does not support tabIndex="-1"
				assert.equal(dojo.attr(div, 'tabIndex'), -1);
			}

			dojo.attr(div, 'tabIndex', 0);
			assert.equal(dojo.attr(div, 'tabIndex'), 0);

			dojo.attr(div, 'tabIndex', 1);
			assert.equal(dojo.attr(div, 'tabIndex'), 1);
		},

		'set tabIndex on input': function () {
			var input = doc.createElement('input');
			assert.notOk(dojo.attr(input, 'tabIndex'));

			dojo.attr(input, 'tabIndex', -1);
			if (!has('opera')) {
				// Opera (at least <= 9) does not support tabIndex="-1"
				assert.equal(dojo.attr(input, 'tabIndex'), -1);
			}

			dojo.attr(input, 'tabIndex', 0);
			assert.equal(dojo.attr(input, 'tabIndex'), 0);

			dojo.attr(input, 'tabIndex', 1);
			assert.equal(dojo.attr(input, 'tabIndex'), 1);
		},

		'remove tabIndex from div': function () {
			var div = doc.createElement('div');
			dojo.attr(div, 'tabIndex', 1);
			assert.equal(dojo.attr(div, 'tabIndex'), 1);

			dojo.removeAttr(div, 'tabIndex');
			assert.notOk(dojo.attr(div, 'tabIndex'));
		},

		'remove tabIndex from input': function () {
			var input = doc.createElement('input');
			dojo.attr(input, 'tabIndex', 1);
			assert.equal(dojo.attr(input, 'tabIndex'), 1);

			dojo.removeAttr(input, 'tabIndex');
			assert.notOk(dojo.attr(input, 'tabIndex'));
		},

		'remove disabled from input': function () {
			var input = doc.createElement('input');
			dojo.attr(input, 'disabled', true);
			assert.ok(dojo.attr(input, 'disabled'));

			dojo.removeAttr(input, 'disabled');
			assert.notOk(dojo.attr(input, 'disabled'));
		},

		'set readonly on input': function () {
			var input = doc.createElement('input');
			assert.notOk(dojo.attr(input, 'readonly'));

			dojo.attr(input, 'readonly', true);
			assert.ok(dojo.attr(input, 'readonly'));

			dojo.attr(input, 'readonly', false);
			assert.notOk(dojo.attr(input, 'readonly'));
		},

		'attribute map': function () {
			var input = doc.createElement('input');
			var input2 = doc.createElement('input');
			var ctr = 0;

			dojo.attr(input, {
				'class': 'thinger blah',
				'tabIndex': 1,
				'type': 'text',
				'onfocus': function () {
					ctr++;
				}
			});
			dojo.body().appendChild(input);
			dojo.body().appendChild(input2);
			assert.equal(dojo.attr(input, 'tabIndex'), 1);

			if (!has('ie') || has('ie') > 7) {
				// IE6/7 treats type="text" as missing, even if it was
				// explicitly specified
				assert.equal(dojo.attr(input, 'type'), 'text');
			}
			assert.strictEqual(ctr, 0, 'onfocus == 0');
			assert.ok(dojo.hasClass(input, 'thinger'), 'hasClass of thinger');
			assert.ok(dojo.hasClass(input, 'blah'), 'hasClass of blah');

			input.focus();

			var dfd = this.async();
			setTimeout(dfd.rejectOnError(function () {
				input2.focus();
				setTimeout(dfd.rejectOnError(function () {
					input.focus();
					setTimeout(dfd.callback(function () {
						assert.strictEqual(ctr, 2);
						domConstruct.destroy(input);
						domConstruct.destroy(input2);
					}), 10);
				}), 10);
			}), 10);
		},

		'attribute reconnect': function () {
			var input = doc.createElement('input');
			var input2 = doc.createElement('input');
			var ctr = 0;

			dojo.attr(input, 'type', 'text');
			dojo.attr(input, 'onfocus', function() { ctr++; });
			dojo.attr(input, 'onfocus', function() { ctr++; });
			dojo.attr(input, 'onfocus', function() { ctr++; });
			dojo.body().appendChild(input);
			dojo.body().appendChild(input2);

			if(!has('ie') || has('ie') > 7){
				// IE6/7 treats type='text' as missing, even if it was
				// explicitly specified
				assert.equal(dojo.attr(input, 'type'), 'text');
			}
			assert.strictEqual(ctr, 0, 'ctr == 0');

			input.focus();

			var dfd = this.async();
			setTimeout(dfd.rejectOnError(function () {
				assert.strictEqual(ctr, 1, 'onfocus ctr == 1');
				input2.focus();
				setTimeout(dfd.rejectOnError(function () {
					input.focus();

					setTimeout(dfd.callback(function () {
						assert.strictEqual(ctr, 2, 'onfocus ctr == 2');
					}), 10);
				}), 10);
			}), 10);
		},

		'attribute specials': function () {
			var node = doc.createElement('div');
			dojo.body().appendChild(node);
			dojo.attr(node, {
				style: {
					opacity: 0.5,
					width: '30px',
					border: '1px solid black'
				}
			});
			assert.equal(dojo.style(node, 'opacity'), 0.5);
			assert.equal(dojo.style(node, 'width'), 30);
			assert.equal(dojo.style(node, 'borderWidth'), 1);

			dojo.attr(node, {
				innerHTML: 'howdy!'
			});
			assert.strictEqual(node.innerHTML, 'howdy!');
			assert.strictEqual(dojo.attr(node, 'innerHTML'), 'howdy!');

			dojo.attr(node, 'innerHTML', '<span>howdy!</span>');
			assert.strictEqual(node.firstChild.nodeType, 1);
			assert.strictEqual(node.firstChild.nodeName.toLowerCase(), 'span');
			assert.strictEqual(node.innerHTML.toLowerCase(), '<span>howdy!</span>');
			assert.strictEqual(dojo.attr(node, 'innerHTML').toLowerCase(), '<span>howdy!</span>');
		},

		'label for attribute': function () {
			// create label with no for attribute make sure requesting
			// it as for and html for returns null
			var label = doc.createElement('label');

			if (!has('ie')) {
				// IE always assumes that "for" is present
				assert.notOk(dojo.attr(label, 'for'));
				assert.notOk(dojo.attr(label, 'htmlFor'));
			}

			// add a for attribute and test that can get by requesting for
			dojo.attr(label, 'for', 'testId');
			assert.strictEqual(dojo.attr(label, 'for'), 'testId');

			// add as htmlFor and make sure it is returned when requested as htmlFor
			var label2 = doc.createElement('label');
			dojo.attr(label2, 'htmlFor', 'testId2');
			assert.strictEqual(dojo.attr(label2, 'htmlFor'), 'testId2');

			// check than when requested as for or htmlFor attribute is found
			assert.ok(dojo.hasAttr(label, 'for'));
			assert.ok(dojo.hasAttr(label2, 'htmlfor'));

			// test from markup
			var labelNoFor = dojo.byId('label-no-for');
			// make sure testing if has attribute using for or htmlFor
			// both return null when no value set
			if (!has('ie')) {
				// IE always assumes that "for" is present
				assert.notOk(dojo.hasAttr(labelNoFor, 'for'));
				assert.notOk(dojo.hasAttr(labelNoFor, 'htmlFor'));
			}
			var labelWithFor = dojo.byId('label-with-for');

			// when markup includes for make certain testing if has attribute
			// using for or htmlFor returns true
			assert.ok(dojo.hasAttr(labelWithFor, 'for'));
			assert.ok(dojo.hasAttr(labelWithFor, 'htmlFor'));

			// when markup include for attrib make sure can retrieve using for or htmlFor
			assert.strictEqual(dojo.attr(labelWithFor, 'for'), 'input-with-label');
			assert.strictEqual(dojo.attr(labelWithFor, 'htmlFor'), 'input-with-label');
		},

		'innerHtml attribute div': function () {
			var expectedHtml = '1<em>2</em>3';
			var div = dojo.create('table', {
				innerHTML: expectedHtml
			}, dojo.body());
			toDestroy.push(div);
			assert.strictEqual(div.innerHTML.toLowerCase().replace(/\s+/g, ''), expectedHtml);
		},

		'innerHtml attribute table': function () {
			var expectedTableHtml = '<thead><tr><th>1st!</th></tr></thead><tbody></tbody>';
			var table = dojo.create('table', {
				innerHTML: expectedTableHtml
			}, dojo.body());
			toDestroy.push(table);
			assert.strictEqual(table.innerHTML.toLowerCase().replace(/\s+/g, ''), expectedTableHtml);
		},

		'attribute input text value': function () {
			var input = dojo.byId('input-text-value');
			assert.strictEqual(input.value, '123');
			assert.strictEqual(dojo.attr('input-text-value', 'value'), '123');

			dojo.attr('input-text-value', 'value', 'abc');
			assert.strictEqual(input.value, 'abc');
			assert.strictEqual(dojo.attr('input-text-value', 'value'), 'abc');

			input.value = 'xyz';
			assert.strictEqual(input.value, 'xyz');
			assert.strictEqual(dojo.attr('input-text-value', 'value'), 'xyz');
		},

		'input disabled': function () {
			assert.notOk(dojo.attr('input-no-disabled', 'disabled'));
			assert.ok(dojo.attr('input-with-disabled', 'disabled'));
			assert.ok(dojo.attr('input-with-disabled-true', 'disabled'));
		},

		'get computed style of svg': function () {
			var rectStyle = dojo.getComputedStyle(dojo.byId('rect1'));
			assert.ok(rectStyle);
		},

		'empty svg': function () {
			dojo.empty(dojo.byId('surface'));
			assert.notOk(dojo.byId('surface').firstChild);
		},

		'destroy svg': function () {
			dojo.destroy(dojo.byId('surface'));
			assert.notOk(dojo.byId('surface'));
		},

		'empty object': function () {
			dojo.empty(dojo.byId('objectToEmpty'));
			assert.notOk(dojo.byId('objectToEmpty').firstChild);
		},

		'destroy object': function () {
			dojo.destroy(dojo.byId('objectToEmpty'));
			assert.notOk(dojo.byId('objectToEmpty'), 'object byId');
		},

		'destroy iframe': function () {
			dojo.destroy(dojo.byId('iframeToDestroy'));
			assert.notOk(dojo.byId('iframeToDestroy'), 'iframe byId');
		},

		'destroy div not in dom': function () {
			var p = dojo.byId('divToRemoveFromDOM');
			var n = dojo.byId('divToDestroy');

			p = p.parentNode.removeChild(p);
			assert.notOk(dojo.byId('divToRemoveFromDOM'), 'div byId');
			assert.ok(p.firstChild, 'div child 1');
			assert.strictEqual(p.firstChild, n, 'div 1st child');
			assert.notStrictEqual(p.firstChild, p.lastChild, 'div 1st child');

			dojo.destroy(n);
			assert.ok(p.firstChild, 'div child 2');
			assert.notStrictEqual(p.firstChild, n, 'div 2nd child');
			assert.strictEqual(p.firstChild, p.lastChild, 'div 2nd child');

			dojo.empty(p);
			assert.notOk(p.firstChild, 'div child 3');

			assert.doesNotThrow(function () {
				dojo.destroy(p);
			});
		}
	};

	arrayUtil.forEach([ 'None', 'Vert', 'Both' ], function (scroll) {
		arrayUtil.forEach([ 'Quirks', 'Strict' ], function (doctype) {
			var id = 'scrolling ' + doctype + ' Iframe ' + scroll;

			suite[id] = function () {
				var dfd = this.async();
				var span = doc.createElement('span');

				span.loaded = function (iframe) {
					// resultReady is called from inside the iframe
					iframe.resultReady = dfd.callback(function(){
						assert.strictEqual(iframe.testResult, 'EQUAL');
					});
					iframe.runScrollingTest(iframe);
				};

				span.innerHTML = '<iframe class="iframeTest" id="' + id + '" src="scrolling' + doctype + 'Iframe.html?ltr&' +
					scroll + '&large" frameborder="0" onload="this.parentNode.loaded(this)" style="background-color:gray;" ' + 
					'allowtransparency></iframe>';
				dojo.byId('iframeContainer').appendChild(span);
			};
		});
	});

	registerSuite(suite);
});

