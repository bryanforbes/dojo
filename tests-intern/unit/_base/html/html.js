define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/dom-construct',
	'intern/dojo/dom-style',
	'intern/dojo/_base/lang',
	'intern/dojo/_base/array',
	'intern/dojo/sniff',
	'dojo'
], function (
	registerSuite,
	assert,
	domConstruct,
	domStyle,
	lang,
	arrayUtil,
	has,
	dojo
) {

	var _elements = [];
	var _baseStyles = {
		'background-color': 'black',
		color: 'white',
		position: 'absolute',
		overflow: 'hidden'
	};

	function createElement(id, styles) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(id));
		div.id = id;
		domStyle.set(div, lang.mixin(lang.clone(_baseStyles), styles));
		_elements.push(div);
		document.body.appendChild(div);
	}

	registerSuite({
		name: 'dojo/_base/html',

		beforeEach: function () {

			var attributeElements = domConstruct.toDom('' +
				'<input id="input-no-type">' +
				'<input id="input-with-type" type="checkbox">' +
				'<input id="input-no-tabindex">' +
				'<input id="input-tabindex-minus-1" tabIndex="-1">' +
				'<input id="input-tabindex-0" tabIndex="0">' +
				'<input id="input-tabindex-1" tabIndex="1">' +
				'<input id="input-text-value" type="text" value="123">' +
				'<input id="input-no-disabled" type="text">' +
				'<input id="input-with-disabled" type="text" disabled>' +
				'<input id="input-with-disabled-true" disabled="disabled">' +
				'<div id="div-no-tabindex"></div>' +
				'<div id="div-tabindex-minus-1" tabIndex="-1"></div>' +
				'<div id="div-tabindex-0" tabIndex="0"></div>' +
				'<div id="div-tabindex-1" tabIndex="1"></div>' +
				'<label id="label-no-for">label with no for </label>' +
				'<input type="text" id="label-test-input">' +
				'<label id="label-with-for" for="input-with-label">label with for </label>' +
				'<input type="text" id="input-with-label">' +
				'<svg id="surface" xmlns="http://www.w3.org/2000/svg" width="100px" height="100px">' +
					'<rect id="rect1" fill="rgb(255, 0, 0)" x="0" y="0" width="80" height="60" ry="0" rx="0" fill-rule="evenodd"/>' +
				'</svg>' +
				'<div id="divToRemoveFromDOM">' +
					'<div id="divToDestroy"></div>' +
					'<div></div>' +
				'</div>'
			);
			var attributeRoot = document.createElement('div');

			createElement('sq100', {
				left: '100px',
				top: '100px',
				width: '100px',
				height: '100px',
				border: '0px',
				padding: '0px',
				margin: '0px'
			});

			createElement('sq100pad10', {
				left: '100px',
				top: '100px',
				width: '100px',
				height: '100px',
				border: '0px',
				padding: '10px',
				margin: '0px'
			});

			createElement('sq100ltpad10', {
				left: '250px',
				top: '250px',
				width: '100px',
				height: '100px',
				border: '0px',
				'padding-left': '10px',
				'padding-top': '10px',
				'padding-right': '0px',
				'padding-bottom': '0px',
				margin: '0px'
			});

			createElement('sq100margin10', {
				left: '400px',
				top: '100px',
				width: '100px',
				height: '100px',
				border: '0px',
				padding: '0px',
				margin: '10px'
			});

			createElement('sq100margin10pad10', {
				left: '250x',
				top: '100px',
				width: '100px',
				height: '100px',
				border: '0px',
				padding: '10px',
				margin: '10px'
			});

			createElement('sq100ltpad10rbmargin10', {
				left: '400px',
				top: '250px',
				width: '100px',
				height: '100px',
				border: '0px',
				'padding-left': '10px',
				'padding-top': '10px',
				'padding-right': '0px',
				'padding-bottom': '0px',
				'margin-left': '0px',
				'margin-top': '0px',
				'margin-right': '10px',
				'margin-bottom': '10px'
			});

			createElement('sq100border10', {
				left: '100px',
				top: '400px',
				width: '100px',
				height: '100px',
				border: '10px solid yellow',
				padding: '0px',
				margin: '0px'
			});

			createElement('sq100border10margin10', {
				left: '250px',
				top: '400px',
				width: '100px',
				height: '100px',
				border: '10px solid yellow',
				padding: '0px',
				margin: '10px'
			});

			createElement('sq100border10margin10pad10', {
				left: '400px',
				top: '400px',
				width: '100px',
				height: '100px',
				border: '10px solid yellow',
				padding: '10px',
				margin: '10px'
			});

			createElement('sq100nopos', {
				position: 'static',
				width: '100px',
				height: '100px',
				padding: '0px',
				margin: '0px'
			});

			attributeRoot.appendChild(attributeElements);
			document.body.appendChild(attributeRoot);
			_elements.push(attributeRoot);

		},

		afterEach: function () {
			arrayUtil.forEach(_elements, function (element) {
				domConstruct.destroy(element);
			});
		},

		'.byId()': function () {
			assert.isNull(dojo.byId('nonExistantId'));
			assert.isNull(dojo.byId(null));
			assert.isNull(dojo.byId(''));
			assert.isNull(dojo.byId(undefined));
		},

		'.marginBox()': function () {
			assert.equal(dojo.marginBox('sq100').w, 100);
			assert.equal(dojo.marginBox('sq100').h, 100);
			assert.equal(dojo.marginBox('sq100pad10').w, 120);
			assert.equal(dojo.marginBox('sq100pad10').h, 120);
			assert.equal(dojo.marginBox('sq100nopos').w, 100);
			assert.equal(dojo.marginBox('sq100nopos').h, 100);
			assert.equal(dojo.marginBox('sq100ltpad10').w, 110);
			assert.equal(dojo.marginBox('sq100ltpad10').h, 110);
			assert.equal(dojo.marginBox('sq100border10').w, 120);
			assert.equal(dojo.marginBox('sq100border10').h, 120);
			assert.equal(dojo.marginBox('sq100margin10').w, 120);
			assert.equal(dojo.marginBox('sq100margin10').h, 120);
			assert.equal(dojo.marginBox('sq100margin10pad10').w, 140);
			assert.equal(dojo.marginBox('sq100margin10pad10').h, 140);
			assert.equal(dojo.marginBox('sq100border10margin10').w, 140);
			assert.equal(dojo.marginBox('sq100border10margin10').h, 140);
			assert.equal(dojo.marginBox('sq100ltpad10rbmargin10').w, 120);
			assert.equal(dojo.marginBox('sq100ltpad10rbmargin10').h, 120);
			assert.equal(dojo.marginBox('sq100border10margin10pad10').w, 160);
			assert.equal(dojo.marginBox('sq100border10margin10pad10').h, 160);
		},

		'._getMarginSize()': function () {
			assert.equal(dojo._getMarginSize('sq100').w, 100);
			assert.equal(dojo._getMarginSize('sq100').h, 100);
			assert.equal(dojo._getMarginSize('sq100margin10pad10').w, 140);
			assert.equal(dojo._getMarginSize('sq100margin10pad10').h, 140);
		},

		'.contentBox()': function () {
			assert.equal(dojo.contentBox('sq100ltpad10').w, 100);
			assert.equal(dojo.contentBox('sq100ltpad10').h, 100);
			assert.equal(dojo.contentBox('sq100border10').w, 100);
			assert.equal(dojo.contentBox('sq100border10').h, 100);
			assert.equal(dojo.contentBox('sq100margin10').w, 100);
			assert.equal(dojo.contentBox('sq100margin10').h, 100);
			assert.equal(dojo.contentBox('sq100border10margin10').w, 100);
			assert.equal(dojo.contentBox('sq100border10margin10').h, 100);
			assert.equal(dojo.contentBox('sq100border10margin10pad10').w, 100);
			assert.equal(dojo.contentBox('sq100border10margin10pad10').h, 100);

		},

		'._getPadExtents()': function () {
			var element = dojo.byId('sq100ltpad10rbmargin10');
			var size = dojo._getPadExtents(element);

			assert.equal(size.l, 10);
			assert.equal(size.t, 10);
			assert.equal(size.w, 10);
			assert.equal(size.h, 10);
		},

		'._getMarginExtents()': function () {
			var element = dojo.byId('sq100ltpad10rbmargin10');
			var size = dojo._getMarginExtents(element);

			assert.equal(size.l, 0);
			assert.equal(size.t, 0);
			assert.equal(size.w, 10);
			assert.equal(size.h, 10);
		},

		'._getBorderExtents()': function () {
			var element = dojo.byId('sq100border10margin10pad10');
			var size = dojo._getBorderExtents(element);

			assert.equal(size.l, 10);
			assert.equal(size.t, 10);
			assert.equal(size.w, 20);
			assert.equal(size.h, 20);
		},

		'._getPadBorderExtents()': function () {
			var element = dojo.byId('sq100border10margin10pad10');
			var size = dojo._getPadBorderExtents(element);

			assert.equal(size.l, 20);
			assert.equal(size.t, 20);
			assert.equal(size.w, 40);
			assert.equal(size.h, 40);
		},

		'.position()': function () {
			var pos = dojo.position('sq100', false);

			assert.deepEqual(pos, {
				x: 100,
				y: 100,
				w: 100,
				h: 100
			});

			// position() is getting us the border-box location
			pos = dojo.position('sq100margin10', false);
			assert.deepEqual(pos, {
				x: 410,
				y: 110,
				w: 100,
				h: 100
			});

			pos = dojo.position('sq100border10', false);
			assert.deepEqual(pos, {
				x: 100,
				y: 400,
				w: 120,
				h: 120
			});

			pos = dojo.position('sq100nopos', false);
			assert.deepEqual(pos, {
				x: 8,
				y: 8,
				w: 100,
				h: 100
			});


		},

		'.coords()': function () {
			// Though coords shouldn't be used, test it for backward compatibility.
			// coords returns the border-box location and margin-box size
			var pos = dojo.coords('sq100margin10', false);
			assert.equal(pos.x, 410);
			assert.equal(pos.y, 110);
			assert.equal(pos.w, 120);
			assert.equal(pos.h, 120);
		},

		'.coords() scrolled': function () {
			var parentElement = document.createElement('div');
			var childElement = document.createElement('div');
			var x = 257;
			var y = 285;
			var pos;

			document.body.appendChild(parentElement);
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
			assert.equal(x, pos.x);
			assert.equal(y, pos.y);
			domConstruct.destroy(parentElement);
		},

		'.style()': function () {
			var bgc;
			assert.equal(1, dojo.style('sq100nopos', 'opacity'));
			assert.equal(Number(dojo.style('sq100nopos', 'opacity', 0.1)).toFixed(4), (0.1).toFixed(4));
			assert.equal(Number(dojo.style('sq100nopos', 'opacity', 0.8)).toFixed(4), (0.8).toFixed(4));
			assert.equal(dojo.style('sq100nopos', 'position'), 'static');
			bgc = dojo.style('sq100nopos', 'backgroundColor');
			assert.isTrue(
				bgc === 'rgb(0, 0, 0)' ||
				bgc === 'black' ||
				bgc === '#000000'
			);
		},

		'.style() object': function () {
			dojo.style('sq100nopos', { 'opacity': 0.1 });
			assert.equal(Number(dojo.style('sq100nopos', 'opacity')).toFixed(4), (0.1).toFixed(4));
			dojo.style('sq100nopos', { 'opacity': 0.8 });
			assert.equal(Number(dojo.style('sq100nopos', 'opacity')).toFixed(4), (0.8).toFixed(4));
		},

		'.isDescendant()': function () {
			assert.isTrue(dojo.isDescendant('sq100', dojo.body()));
			assert.isTrue(dojo.isDescendant('sq100', dojo.doc));
			assert.isTrue(dojo.isDescendant('sq100', 'sq100'));
			assert.isTrue(dojo.isDescendant(dojo.byId('sq100'), 'sq100'));
			assert.isFalse(dojo.isDescendant('sq100', dojo.byId('sq100').firstChild));
			assert.isTrue(dojo.isDescendant(dojo.byId('sq100').firstChild, 'sq100'));
		},

		'test class functions': function () {
			var node = dojo.byId('sq100');
			dojo.removeClass(node);
			dojo.addClass(node, 'a');
			assert.equal(node.className, 'a');
			dojo.removeClass(node, 'c');
			assert.equal(node.className, 'a');
			assert.isTrue(dojo.hasClass(node, 'a'));
			assert.isFalse(dojo.hasClass(node, 'b'));
			dojo.addClass(node, 'b');
			assert.equal(node.className, 'a b');
			assert.isTrue(dojo.hasClass(node, 'a'));
			assert.isTrue(dojo.hasClass(node, 'b'));
			dojo.removeClass(node, 'a');
			assert.equal(node.className, 'b');
			assert.isFalse(dojo.hasClass(node, 'a'));
			assert.isTrue(dojo.hasClass(node, 'b'));
			dojo.toggleClass(node, 'a');
			assert.equal(node.className, 'b a');
			assert.isTrue(dojo.hasClass(node, 'a'));
			assert.isTrue(dojo.hasClass(node, 'b'));
			dojo.toggleClass(node, 'a');
			assert.equal(node.className, 'b');
			assert.isFalse(dojo.hasClass(node, 'a'));
			assert.isTrue(dojo.hasClass(node, 'b'));
			dojo.toggleClass(node, 'b');
			assert.equal(node.className, '');
			assert.isFalse(dojo.hasClass(node, 'a'));
			assert.isFalse(dojo.hasClass(node, 'b'));
			dojo.removeClass(node, 'c');
			assert.isTrue(!node.className);
			var acuWorked = true;
			try{
				dojo.addClass(node);
			}catch(e){
				acuWorked = false;
			}
			assert.isTrue(acuWorked, 'addClass handles undefined class');
			dojo.addClass(node, 'a');
			dojo.replaceClass(node, 'b', 'a');
			assert.isTrue(dojo.hasClass(node, 'b'));
			assert.isFalse(dojo.hasClass(node, 'a'));

			dojo.replaceClass(node, '', 'b');
			assert.isFalse(dojo.hasClass(node, 'b'));
			assert.equal(node.className, '');

			dojo.addClass(node, 'b a');
			dojo.replaceClass(node, 'c', '');
			assert.equal(node.className, 'b a c');

			assert.isFalse(dojo.hasClass(document, 'ab"'));
		},

		'test add remove multiple class': function () {
			var node = dojo.byId('sq100');
			dojo.removeClass(node);
			dojo.addClass(node, 'a');
			assert.equal(node.className, 'a');
			dojo.addClass(node, 'a b');
			assert.equal(node.className, 'a b');
			dojo.addClass(node, 'b a');
			assert.equal(node.className, 'a b');
			dojo.addClass(node, ['a', 'c']);
			assert.equal(node.className, 'a b c');
			dojo.removeClass(node, 'c a');
			assert.equal(node.className, 'b');
			dojo.removeClass(node);
			assert.equal(node.className, '');
			dojo.addClass(node, '  c   b   a ');
			assert.equal(node.className, 'c b a');
			dojo.removeClass(node, ' c b ');
			assert.equal(node.className, 'a');
			dojo.removeClass(node, ['a', 'c']);
			assert.equal(node.className, '');
			dojo.addClass(node, 'a b');
			dojo.replaceClass(node, 'c', 'a b');
			assert.equal(node.className, 'c');
			dojo.replaceClass(node, '');
			assert.equal(node.className, '');
		},

		'get type of input': function () {
			var input = dojo.byId('input-no-type');
			assert.notOk(dojo.hasAttr(input, 'type'));
			assert.isNull(dojo.attr(input, 'type'));

			input = dojo.byId('input-with-type');
			assert.ok(dojo.hasAttr(input, 'type'));
			assert.equal(dojo.attr(input, 'type'), 'checkbox');
		},

		'get type by id string': function () {
			assert.notOk(dojo.hasAttr('input-no-type', 'type'));
			assert.isNull(dojo.attr('input-no-type', 'type'));
			assert.ok(dojo.hasAttr('input-with-type', 'type'));
			assert.equal(dojo.attr('input-with-type', 'type'), 'checkbox');
		},

		'attribute id': function () {
			var div;

			assert.ok(dojo.hasAttr('div-no-tabindex', 'id'));
			assert.equal(dojo.attr('div-no-tabindex', 'id'), 'div-no-tabindex');
			div = document.createElement('div');
			assert.notOk(dojo.hasAttr(div, 'id'));
			assert.isNull(dojo.attr(div, 'id'));
			dojo.attr(div, 'id', 'attrId1');
			assert.ok(dojo.hasAttr(div, 'id'));
			assert.equal(dojo.attr(div, 'id'), 'attrId1');
			dojo.removeAttr(div, 'id');
			assert.notOk(dojo.hasAttr(div, 'id'));
			assert.isNull(dojo.attr(div, 'id'));
		},

		'tab index': function () {
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
			var div = document.createElement('div');
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
			var input = document.createElement('input');
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
			var div = document.createElement('div');
			dojo.attr(div, 'tabIndex', 1);
			assert.equal(dojo.attr(div, 'tabIndex'), 1);
			dojo.removeAttr(div, 'tabIndex');
			assert.notOk(dojo.attr(div, 'tabIndex'));
		},

		'remove tabIndex from input': function () {
			var input = document.createElement('input');
			dojo.attr(input, 'tabIndex', 1);
			assert.equal(dojo.attr(input, 'tabIndex'), 1);
			dojo.removeAttr(input, 'tabIndex');
			assert.notOk(dojo.attr(input, 'tabIndex'));
		},

		'remove disabled from input': function () {
			var input = document.createElement('input');
			dojo.attr(input, 'disabled', true);
			assert.ok(dojo.attr(input, 'disabled'));
			dojo.removeAttr(input, 'disabled');
			assert.notOk(dojo.attr(input, 'disabled'));
		},

		'set readonly on input': function () {
			var input = document.createElement('input');
			assert.notOk(dojo.attr(input, 'readonly'));
			dojo.attr(input, 'readonly', true);
			assert.ok(dojo.attr(input, 'readonly'));
			dojo.attr(input, 'readonly', false);
			assert.notOk(dojo.attr(input, 'readonly'));
		},

		'attribute map': function () {
			var input = document.createElement('input');
			var input2 = document.createElement('input');
			var ctr = 0;
			var dfd = this.async();
			dojo.attr(input, {
				'class': 'thinger blah',
				'tabIndex': 1,
				'type': 'text',
				'onclick': function () {
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
			assert.ok(dojo.hasClass(input, 'thinger'));
			assert.ok(dojo.hasClass(input, 'blah'));
			input.click();
			setTimeout(function () {
				input2.click();
				setTimeout(function () {
					input.click();
					setTimeout(dfd.callback(function () {
						assert.equal(ctr, 2);
						domConstruct.destroy(input);
						domConstruct.destroy(input2);
					}), 10);
				}, 10);
			}, 10);
		},

		'attribute map style': function () {
			var node = document.createElement('div');

			dojo.body().appendChild(node);

			dojo.attr(node, {
				style: {
					opacity: 0.5,
					width: '30px',
					border: '1px solid black'
				}
			});

			assert.equal(Number(dojo.style(node, 'opacity')).toFixed(4), (0.5).toFixed(4));
			assert.equal(dojo.style(node, 'width'), 30);
			assert.equal(dojo.style(node, 'borderWidth'), 1);

			domConstruct.destroy(node);

		},

		'attribute with innerHTML': function () {
			var node = document.createElement('div');
			var expectedString = 'howdy!';
			var expectedHtml = '<span>howdy!</span>';

			dojo.body().appendChild(node);

			dojo.attr(node, {
				innerHTML: expectedString
			});
			assert.equal(node.innerHTML, expectedString);
			assert.equal(dojo.attr(node, 'innerHTML'), expectedString);
			dojo.attr(node, 'innerHTML', expectedHtml);
			assert.equal(node.firstChild.nodeType, 1);
			assert.equal(node.firstChild.nodeName.toLowerCase(), 'span');
			assert.equal(node.innerHTML.toLowerCase(), expectedHtml);
			assert.equal(dojo.attr(node, 'innerHTML').toLowerCase(), expectedHtml);
			domConstruct.destroy(node);
		},

		'label for attribute': function () {
			// create label with no for attribute make sure requesting
			// it as for and html for returns null
			var label = document.createElement('label');

			if (!has('ie')) {
				// IE always assumes that "for" is present
				assert.notOk(dojo.attr(label, 'for'));
				assert.notOk(dojo.attr(label, 'htmlFor'));
			}
			// add a for attribute and test that can get by requesting for
			dojo.attr(label, 'for', 'testId');
			assert.equal(dojo.attr(label, 'for'), 'testId');
			// add as htmlFor and make sure it is returned when requested as htmlFor
			var label2 = document.createElement('label');
			dojo.attr(label2, 'htmlFor', 'testId2');
			assert.equal(dojo.attr(label2, 'htmlFor'), 'testId2');
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
			assert.equal(dojo.attr(labelWithFor, 'for'), 'input-with-label');
			assert.equal(dojo.attr(labelWithFor, 'htmlFor'), 'input-with-label');
		},

		'innerHtml attribute table': function () {
			var expectedTableHtml = '<thead><tr><th>1st!</th></tr></thead><tbody></tbody>';
			var table = dojo.create('table', {
					innerHTML: expectedTableHtml
				}, dojo.body());

			assert.equal(table.innerHTML.toLowerCase().replace(/\s+/g, ''), expectedTableHtml);
			domConstruct.destroy(table);
		},

		'attribute input text value': function () {
			var input = dojo.byId('input-text-value');

			assert.equal(input.value, '123');
			assert.equal(dojo.attr('input-text-value', 'value'), '123');
			dojo.attr('input-text-value', 'value', 'abc');
			assert.equal(input.value, 'abc');
			assert.equal(dojo.attr('input-text-value', 'value'), 'abc');
			input.value = 'xyz';
			assert.equal(input.value, 'xyz');
			assert.equal(dojo.attr('input-text-value', 'value'), 'xyz');
		},

		'test input disabled': function () {
			assert.notOk(dojo.attr('input-no-disabled', 'disabled'));
			assert.ok(dojo.attr('input-with-disabled', 'disabled'));
			assert.ok(dojo.attr('input-with-disabled-true', 'disabled'));
		},

		'test get computed style of svg': function () {
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

		'destroy div not in dom': function () {
			var p = dojo.byId('divToRemoveFromDOM');
			var n = dojo.byId('divToDestroy');
			p = p.parentNode.removeChild(p);
			assert.notOk(dojo.byId('divToRemoveFromDOM'));
			assert.ok(p.firstChild);
			assert.strictEqual(p.firstChild, n);
			assert.notStrictEqual(p.firstChild, p.lastChild);
			dojo.destroy(n);
			assert.ok(p.firstChild);
			assert.notStrictEqual(p.firstChild, n);
			assert.strictEqual(p.firstChild, p.lastChild);
			dojo.empty(p);
			assert.notOk(p.firstChild);
			dojo.destroy(p);
		},

		'object': {
			// creating and removing an object element is slow. Only create the
			// element for the object test.
			beforeEach: function () {
				var element = domConstruct.toDom(
					'<object width="500" height="500" id="objectToEmpty" data="data:application/x-silverlight," type="application/x-silverlight">' +
						'<param name="background" value="transparent"/>' +
					'</object>'
				);
				var root = document.createElement('div');
				root.appendChild(element);
				document.body.appendChild(root);
				_elements.push(root);
			},

			'empty object': function () {
				dojo.empty(dojo.byId('objectToEmpty'));
				assert.notOk(dojo.byId('objectToEmpty').firstChild);
			}
		},

		'iframe': {

			beforeEach: function () {
				var element = domConstruct.toDom(
					'<iframe id="iframeToDestroy" src="about:blank">' +
						'<span></span>' +
					'</iframe>'
				);
				var root = document.createElement('div');
				root.appendChild(element);
				document.body.appendChild(root);
				_elements.push(root);
			},

			'destroy iframe': function () {
				var iframe = dojo.byId('iframeToDestroy');
				assert.ok(iframe);
				dojo.destroy(iframe);
				assert.notOk(dojo.byId('iframeToDestroy'));

			}

		}



	});
});

