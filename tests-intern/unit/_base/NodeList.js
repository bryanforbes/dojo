define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/dom-construct',
	'intern/dojo/dom-style',
	'intern/dojo/dom-attr',
	'intern/dojo/_base/lang',
	'dojo/_base/declare',
	'dojo/_base/NodeList',
	'dojo/on',
	'dojo/query',
	// string and parser are required for some of the NodeList.addContent() tests
	'dojo/string',
	'dojo/parser'
], function (
	registerSuite,
	assert,
	domConstruct,
	domStyle,
	domAttr,
	lang,
	declare,
	NodeList,
	on,
	query
) {

	var spanElement;
	var divElement;
	var divContentElement;
	var fourElementNL;
	var _contentRootElement;

	// All DOM interactions need to be scoped to this element. Reporter output
	// might cause some assertions to fail
	var rootElement;

	/**
	* Some test append content to the body, this function allows us to ensure
	* clean up happens after each test.
	*/
	function appendToBody(element, content) {
		var root = document.createElement('div');
		root.appendChild(element);
		if (content) {
			element.innerHTML = content;
		}
		_contentRootElement = root;
		return rootElement.appendChild(_contentRootElement);
	}


	function verify(nl, ids) {
		/*jshint -W084 */
		for (var i = 0, node; node = nl[i]; i++) {
			assert.equal(ids[i], node.id);
		}
		//Make sure lengths are equal.
		assert.equal(ids.length, i);
	}

	registerSuite({
		name: 'dojo/_base/NodeList',

		beforeEach: function () {
			divContentElement = document.createElement('div');
			divContentElement.id = 'sq100';
			divContentElement.appendChild(document.createTextNode('100px square, abs'));
			// styles required for .coords() tests
			domStyle.set(divContentElement, {
				'background-color': 'black',
				color: 'white',
				position: 'absolute',
				left: '100px',
				top: '100px',
				width: '100px',
				height: '100px',
				border: '0px',
				padding: '0px',
				margin: '0px',
				overflow: 'hidden'
			});
			rootElement.appendChild(divContentElement);

			spanElement = document.createElement('span');
			spanElement.id = 'c1';

			divElement = document.createElement('div');
			divElement.id = 't';
			divElement.appendChild(spanElement);
			rootElement.appendChild(divElement);

			fourElementNL = new NodeList(spanElement, divElement, spanElement, divElement);
		},

		afterEach: function () {
			domConstruct.destroy(divElement);
			domConstruct.destroy(divContentElement);
			domConstruct.destroy(_contentRootElement);
		},

		before: function () {
			rootElement = document.createElement('div');
			document.body.appendChild(rootElement);
		},

		after: function () {
			// clean up declare globals
			window.test = undefined;
			domConstruct.destroy(rootElement);
		},

		'backwards compatible check': function () {
			assert.strictEqual(NodeList, NodeList);
		},

		'constructor': function () {
			var nl = new NodeList();
			nl.push(spanElement);
			assert.equal(1, nl.length);
		},

		'constructor with args': function () {
			var nl = new NodeList(4);
			nl.push(spanElement);
			assert.equal(5, nl.length);
		},

		'constructor with two args': function () {
			var nl = new NodeList(spanElement, divElement);
			assert.equal(2, nl.length);
			assert.equal(spanElement, nl[0], 'expected spanElement');
			assert.equal(divElement, nl[1], 'expected divElement');
		},

		'.forEach()': function () {
			var lastItem;
			var nl = new NodeList(spanElement, divElement);
			nl.forEach(function (i) { lastItem = i; });
			assert.strictEqual(divElement, lastItem, 'expected divElement');

			var r = nl.forEach(function (i, idx, arr) {
				assert.strictEqual(arr.constructor, NodeList, 'expected NodeList constructor');
				assert.equal(2, arr.length);
			});
			assert.equal(r.constructor, NodeList, 'expected NodeList constructor');
			assert.strictEqual(r, nl);
		},

		'.indexOf()': function () {
			assert.equal(0, fourElementNL.indexOf(spanElement));
			assert.equal(1, fourElementNL.indexOf(divElement));
			assert.equal(-1, fourElementNL.indexOf(null));
		},

		'.lastIndexOf': function () {
			assert.equal(2, fourElementNL.lastIndexOf(spanElement));
			assert.equal(3, fourElementNL.lastIndexOf(divElement));
			assert.equal(-1, fourElementNL.lastIndexOf(null));
		},

		'.every()': function () {
			var ctr = 0;
			var ret = fourElementNL.every(function () {
				ctr++;
				return true;
			});
			assert.equal(4, ctr);
			assert.ok(ret);

			ctr = 0;
			ret = fourElementNL.every(function () {
				ctr++;
				return false;
			});
			assert.equal(1, ctr);
			assert.notOk(ret);
		},

		'.some()': function () {
			var ret = fourElementNL.some(function () {
				return true;
			});
			assert.ok(ret);

			ret = fourElementNL.some(function (i) {
				return i.id === 't';
			});
			assert.ok(ret);
		},

		'.map()': function () {
			var cnt = 0;
			var sum = 0;
			var ret = fourElementNL.map(function () {
				return true;
			});

			ret.forEach(function (item) {
				assert.isTrue(item);
			});

			verify(ret.end(), ['c1', 't', 'c1', 't']);

			ret = fourElementNL.map(function () {
				return cnt++;
			});

			assert.strictEqual(ret.constructor, NodeList, 'expected NodeList constructor');

			// make sure that map() returns a NodeList
			fourElementNL.map(function () {
				return 2;
			}).forEach(function (x) {
				sum += x;
			});
			assert.equal(sum, 8);
		},

		'.slice()': function () {
			var pnl = new NodeList(divElement, divElement, spanElement);
			assert.equal(2, pnl.slice(1).length);
			assert.equal(3, pnl.length);
			assert.strictEqual(spanElement, pnl.slice(-1)[0], 'expected spanElement');
			assert.equal(2, pnl.slice(-2).length);
			verify(pnl.slice(1).end(), ['t', 't', 'c1']);
		},

		'.splice()': function () {
			var pnl = new NodeList(divElement, divElement, spanElement);
			assert.equal(2, pnl.splice(1).length);
			assert.equal(1, pnl.length);
			pnl = new NodeList(divElement, divElement, spanElement);
			assert.strictEqual(spanElement, pnl.splice(-1)[0], 'expected spanElement');
			assert.equal(2, pnl.length);
			pnl = new NodeList(divElement, divElement, spanElement);
			assert.equal(2, pnl.splice(-2).length);
		},

		'.splice() insert one': function () {
			var pnl = new NodeList(divElement, divElement, spanElement);
			pnl.splice(0, 0, spanElement);
			assert.equal(4, pnl.length);
			assert.strictEqual(spanElement, pnl[0], 'expected spanElement');
		},

		'.splice() insert multiple': function () {
			var pnl = new NodeList(divElement, divElement, spanElement);
			pnl.splice(0, 0, spanElement, divContentElement);
			assert.equal(5, pnl.length);
			assert.strictEqual(spanElement, pnl[0], 'expected spanElement');
			assert.strictEqual(divContentElement, pnl[1], 'expected divElement');
			assert.strictEqual(divElement, pnl[2], 'expected divElement');
		},

		'.splice() insert multiple at offset': function () {
			var pnl = new NodeList(divElement, divElement, spanElement);
			pnl.splice(1, 0, spanElement, divContentElement);
			assert.equal(5, pnl.length);
			assert.strictEqual(divElement, pnl[0], 'expected divElement');
			assert.strictEqual(spanElement, pnl[1], 'expected spanElement');
			assert.strictEqual(divContentElement, pnl[2], 'expected divContentElement');
			assert.strictEqual(divElement, pnl[3], 'expected divElement');
		},

		'.splice() delete one': function () {
			var pnl = new NodeList(spanElement, divElement, divContentElement);
			pnl.splice(0, 1);
			assert.equal(2, pnl.length);
			assert.strictEqual(divElement, pnl[0], 'expected divElement');
		},

		'.splice() delete multiple': function () {
			var pnl = new NodeList(spanElement, divElement, divContentElement);
			pnl.splice(0, 2);
			assert.equal(1, pnl.length);
			assert.strictEqual(divContentElement, pnl[0], 'expected divContentElement');
		},

		'.splice() delete at offset': function () {
			var pnl = new NodeList(spanElement, divElement, divContentElement);
			pnl.splice(1, 1);
			assert.equal(2, pnl.length);
			assert.strictEqual(spanElement, pnl[0], 'expected spanElement');
			assert.strictEqual(divContentElement, pnl[1], 'expected divContentElement');
		},

		'.splice() insert delete': function () {
			var pnl = new NodeList(spanElement, divElement, divContentElement);
			pnl.splice(1, 1, divContentElement);
			assert.equal(3, pnl.length);
			assert.strictEqual(spanElement, pnl[0], 'expected spanElement');
			assert.strictEqual(divContentElement, pnl[1], 'expected divContentElement');
			assert.strictEqual(divContentElement, pnl[1], 'expected divContentElement');

			pnl = new NodeList(spanElement, divElement, divContentElement);
			pnl.splice(1, 2, divContentElement);
			assert.equal(2, pnl.length);
			assert.strictEqual(spanElement, pnl[0], 'expected spanElement');
			assert.strictEqual(divContentElement, pnl[1], 'expected divContentElement');
		},

		'.query()': function () {
			var pnl = new NodeList(divElement);
			assert.strictEqual(spanElement, pnl.query('span')[0], 'expected spanElement');
			assert.strictEqual(divElement, query(rootElement).query(':last-child')[0], 'expected divElement');
			assert.strictEqual(spanElement, query(rootElement).query(':last-child')[1], 'expected spanElement');
			assert.equal(1, pnl.query().length);
			verify(pnl.query('span').end(), ['t']);
		},

		'.filter()': function () {
			var actualElement = query(':first-child', rootElement).filter(':last-child')[0];
			assert.strictEqual(spanElement, actualElement, 'expected spanElement');
			assert.equal(1, query('*', rootElement).filter(function (n) {
				return n.nodeName.toLowerCase() === 'span';
			}).length);

			var filterObj = {
				filterFunc: function (n) {
					return n.nodeName.toLowerCase() === 'span';
				}
			};
			assert.equal(1, query('*', rootElement).filter(filterObj.filterFunc).length);
			assert.equal(1, query('*', rootElement).filter(filterObj.filterFunc, filterObj).length);
			verify((new NodeList(divElement)).filter('span').end(), ['t']);
		},

		'.coords()': function () {
			var tnl = new NodeList(divContentElement);
			assert.equal(100, tnl.coords()[0].w);
			assert.equal(100, tnl.coords()[0].h);
			assert.equal(100, tnl.position()[0].w);
			assert.equal(100, tnl.position()[0].h);
			assert.equal(rootElement.getElementsByTagName('*').length, query('*', rootElement).coords().length);
			assert.equal(rootElement.getElementsByTagName('*').length, query('*', rootElement).position().length);
		},

		'.style() get': function () {
			var tnl = new NodeList(divContentElement);
			assert.equal(1, tnl.style('opacity')[0]);
			tnl.push(divElement);
			domStyle.set(divElement, 'opacity', 0.5);
			assert.equal(0.5, tnl.style('opacity').slice(-1)[0]);
		},

		'.style() set': function () {
			var tnl = new NodeList(divContentElement, divElement);
			tnl.style('opacity', 0.5);
			assert.equal(0.5, domStyle.get(tnl[0], 'opacity'));
			assert.equal(0.5, domStyle.get(tnl[1], 'opacity'));
		},

		'.style()': function () {
			var tnl = new NodeList(divContentElement, divElement);
			tnl.style('opacity', 1);
			assert.equal(1, tnl.style('opacity')[0]);
			domStyle.set(divElement, 'opacity', 0.5);
			assert.equal(1.0, tnl.style('opacity')[0]);
			assert.equal(0.5, tnl.style('opacity')[1]);
		},

		'.addClass() .removeClass()': function () {
			var tnl = new NodeList(divContentElement, divElement);
			tnl.addClass('a');
			assert.equal('a', divContentElement.className);
			assert.equal('a', divElement.className);
			tnl.addClass('a b');
			assert.equal('a b', divContentElement.className);
			assert.equal('a b', divElement.className);
			tnl.addClass(['a', 'c']);
			assert.equal('a b c', divContentElement.className);
			assert.equal('a b c', divElement.className);
			tnl.removeClass();
			assert.equal('', divContentElement.className);
			assert.equal('', divElement.className);
			tnl.addClass('    a');
			assert.equal('a', divContentElement.className);
			assert.equal('a', divElement.className);
			tnl.addClass(' a  b ');
			assert.equal('a b', divContentElement.className);
			assert.equal('a b', divElement.className);
			tnl.addClass(' c  b a ');
			assert.equal('a b c', divContentElement.className);
			assert.equal('a b c', divElement.className);
			tnl.removeClass(' b');
			assert.equal('a c', divContentElement.className);
			assert.equal('a c', divElement.className);
			tnl.removeClass('a b ');
			assert.equal('c', divContentElement.className);
			assert.equal('c', divElement.className);
			tnl.removeClass(['a', 'c']);
			assert.equal('', divContentElement.className);
			assert.equal('', divElement.className);
			tnl.addClass('a b c');
			tnl.replaceClass('d e', 'a b');
			assert.equal('c d e', divContentElement.className, 'class is c d e after replacing a b with d e');
			assert.equal('c d e', divElement.className, 'class is c d e after replacing a b with d e');
			tnl.replaceClass('f', 'd');
			assert.equal('c e f', divContentElement.className, 'class is c e f after replacing d with f');
			assert.equal('c e f', divElement.className, 'class is c e f after replacing d with f');
			tnl.replaceClass('d');
			assert.equal('d', divContentElement.className);
			assert.equal('d', divElement.className);
			tnl.removeClass();
			assert.equal('', divContentElement.className, 'empty class');
			assert.equal('', divElement.className, 'empty class');
		},

		'.concat()': function () {
			var spans = query('span', rootElement);
			var divs = query('div', rootElement);
			var cat = spans.concat(divs);
			assert.equal((divs.length + spans.length), cat.length);
			verify(cat.end(), ['c1']);
		},

		'.concat() returns NodeList': function () {
			var spans = query('span', rootElement);
			assert.strictEqual(spans.concat([]).constructor, NodeList, 'expected NodeList constructor');
		},

		'.concat() empty list': function () {
			var res = (new NodeList()).concat([]);
			assert.equal(0, res.length);
		},


		'.place()': function () {
			var nl;
			var tn = document.createElement('div');
			appendToBody(tn, '<div><span></span></div><span class="thud"><b>blah</b></span>');
			nl = query('b', tn).place(tn, 'first');
			assert.equal(1, nl.length);
			assert.equal('b', nl[0].nodeName.toLowerCase());
			assert.strictEqual(tn, nl[0].parentNode, 'expected to be parent node');
			assert.strictEqual(tn.firstChild, nl[0], 'expected to be first child');
		},

		'.orphan()': function () {
			var content = '<div><span></span></div><span class="thud"><b>blah</b></span>';
			var nl;
			var tn = document.createElement('div');
			appendToBody(tn, content);
			nl = query('span', tn).orphan();
			assert.equal(2, nl.length);
			assert.equal(1, tn.getElementsByTagName('*').length);

			tn.innerHTML = content;
			nl = query('*', tn).orphan('b');
			assert.equal(1, nl.length);
			assert.equal('blah', nl[0].innerHTML);
		},

		'.adopt()': function () {
			var div = query(document.createElement('div'));
			div.adopt(document.createElement('span'));
			div.adopt(document.createElement('em'), 'first');
			assert.equal(2, query('*', div[0]).length);
			assert.equal('em', div[0].firstChild.tagName.toLowerCase());
			assert.equal('span', div[0].lastChild.tagName.toLowerCase());
		},

		'.addContent() text': function () {
			var tn = document.createElement('div');
			var nl = query(tn).addContent('some text content');

			assert.equal(1, nl[0].childNodes.length);
			assert.equal('some text content', nl[0].firstChild.nodeValue);
		},

		'.addContent() move node': function () {
			var mNode = document.createElement('span');
			var tn = document.createElement('div');
			var nl = query(tn).addContent('some text content');
			mNode.id = 'addContent1';
			mNode.innerHTML = 'hello';
			appendToBody(mNode);
			assert.ok(document.getElementById('addContent1'));

			nl.addContent(mNode);
			assert.notOk(document.getElementById('addContent1'));
			assert.equal('addContent1', nl[0].lastChild.id);
		},

		'.addContent() multiple content clone node': function () {
			var tn = document.createElement('div');
			var nl = query(tn).addContent('some text content');
			tn.innerHTML = '<select><option name="second"  value="second" selected>second</option></select>';
			nl = query('select', tn).addContent('<option name="first" value="first">first</option>', 'first');
			nl.forEach(function (node) {
				assert.equal('first', node.options[0].value);
				assert.notOk(node.options[0].selected);
			});
		},

		'.addContent() template': function () {
			var html = '<div><div class="multitemplate"></div><div class="multitemplate"></div></div>';
			var templs = domConstruct.toDom(html);
			appendToBody(templs);
			templs = query('.multitemplate', rootElement);

			//templateFunc test
			templs.addContent({
				template: '<b>[name]</b>',
				templateFunc: function (str, obj) {
					return str.replace(/\[name\]/g, obj.name);
				},
				name: 'bar'
			});

			var bolds = templs.query('b', rootElement);
			assert.equal(2, bolds.length);
			bolds.forEach(function (node) {
				assert.equal('bar', node.innerHTML);
			});
		},

		'.addContent() template with substitute': function () {
			var html = '<div><div class="multitemplate"></div><div class="multitemplate"></div></div>';
			var templs = domConstruct.toDom(html);
			appendToBody(templs);
			templs = query('.multitemplate', rootElement);
			templs.addContent({
				template: '<p>${name}</p>',
				name: 'baz'
			});

			var ps = templs.query('p');
			assert.equal(2, ps.length);
			ps.forEach(function (node) {
				assert.equal('baz', node.innerHTML);
			});
		},

		'.addContent() with declare': function () {
			var html = '<div><div class="multitemplate"></div><div class="multitemplate"></div></div>';
			var templs = domConstruct.toDom(html);
			appendToBody(templs);

			declare('test.Mini', null, {
				constructor: function (args, node) {
					lang.mixin(this, args);
					node.innerHTML = this.name;
					this.domNode = node;
				},
				name: ''
			});

			templs = query('.multitemplate', rootElement);
			templs.addContent({
				template: '<i dojoType="test.Mini" name="cool"></i>',
				parse: true
			});

			var declaredNodes = templs.query('[dojoType]');

			assert.equal(2, declaredNodes.length);
			declaredNodes.forEach(function (node) {
				assert.equal('cool', node.innerHTML);
			});
		},

		'.connect()': function () {
			var html = '<div><span></span></div><span class="thud"><button>blah</button></span>';
			var tn = appendToBody(domConstruct.toDom(html));

			var ctr = 0;
			var nl = query('button', tn).connect('onclick', function () {
				ctr++;
			});
			nl[0].click();
			assert.equal(1, ctr);
			nl[0].click();
			nl[0].click();
			assert.equal(3, ctr);
		},

		'.on()': function () {
			var html = '<div><span></span></div><span class="thud"><button>blah</button></span>';

			appendToBody(domConstruct.toDom(html));

			var ctr = 0;
			var nl = query('button', rootElement);
			var handle = nl.on('click', function () {
				ctr++;
			});

			nl[0].click();
			assert.equal(1, ctr);

			var inButton = nl[0].appendChild(document.createElement('span'));

			on.emit(nl[0], 'click', {});
			on.emit(inButton, 'click', {
				bubbles: true
			});
			on.emit(inButton, 'click', {
				bubbles: false
			});

			assert.equal(3, ctr);

			handle.remove();

			on.emit(nl[0], 'click', {});

			assert.equal(3, ctr);
		},

		'.on() delegate': function () {
			var html = '<div><span></span></div><span class="thud"><button>blah</button></span>';

			var tn = appendToBody(domConstruct.toDom(html));

			var ctr = 0;
			var nl = query('.thud', rootElement);
			var bl = query('button', rootElement);
			var handle = nl.on('button:click', function () {
				assert.strictEqual(this, bl[0], 'expected to be button element');
				ctr++;
			});
			assert.equal(0, ctr);
			on.emit(nl[0], 'click', {});
			on.emit(bl[0], 'click', {
				bubbles: true
			});
			assert.equal(1, ctr);
			handle.remove();
			on.emit(bl[0], 'click', {
				bubbles: true
			});
			assert.equal(1, ctr);
			// listen and on should behave the same
			query(tn).on('.thud:click, .thud button:custom', function () {
				ctr++;
			});
			on.emit(bl[0], 'click', {
				bubbles: true
			});
			assert.equal(2, ctr);
			on.emit(bl[0], 'click', {
				bubbles: false
			});
			assert.equal(2, ctr);
			on.emit(bl[0], 'custom', {
				bubbles: true
			});
			assert.equal(3, ctr);
			on.emit(bl[0], 'mouseout', {
				bubbles: true
			});
			assert.equal(3, ctr);
			bl[0].click();
			assert.equal(4, ctr);
		},

		'.at()': function () {
			var html = '';
			var divCount = 9;
			while (divCount--) {
				html += '<div id="container_' + divCount + '"></div>';
			}
			var divs = query('div', appendToBody(domConstruct.toDom(html)));
			var at0 = divs.at(0);
			assert.strictEqual(divs[0], at0[0], 'expected first div to be the same');

			var at1 = divs.at(1, 3, 5);
			assert.strictEqual(divs[1], at1[0], 'expected second div');
			assert.strictEqual(divs[3], at1[1], 'expected fourth div');
			assert.strictEqual(divs[5], at1[2], 'expected sixth div');

			var at2 = divs.at(3, 6, 9);
			assert.equal(at2.length, 2);

			var at3 = divs.at(3, 6).at(1);
			assert.strictEqual(divs[6], at3[0], 'expected seventh div');

			var ending = divs.at(0).end();
			verify([ending[0], ending[1]], ['container_8', 'container_7']);

			var at4 = divs.at(-1);
			assert.strictEqual(divs[divs.length - 1], at4[0], 'expected last div');

			var at5 = divs.at(1, -1);
			assert.strictEqual(at5[0], divs[1], 'expected second div');
			assert.strictEqual(at5[1], divs[divs.length - 1]);
		},

		'.attr()': function () {
			var divs = query('div', rootElement);
			var ids = divs.attr('id');
			assert.equal(ids[0], 'sq100');
			assert.equal(ids[1], 't');
		},

		'._adaptAsForEach()': function () {
			var passes = false;
			var count = 0;
			var i = {
				setTrue: function () {
					count++;
					passes = true;
				}
			};
			NodeList.prototype.setTrue = NodeList._adaptAsForEach(i.setTrue, i);
			var divs = query('div', rootElement).setTrue();
			assert.ok(passes);
			assert.equal(count, divs.length);
		},

		'instantiate': function () {
			var html = '<p id="thinger">Hi</p><p id="thinger2">Hi</p>';
			var test = 0;

			appendToBody(domConstruct.toDom(html));

			declare('test._base.NodeList.some.Thing', null, {
				foo: 'baz',
				constructor: function (props) {
					lang.mixin(this, props);
					assert.equal('bar', this.foo);
					test++;
				}
			});

			query('#thinger', rootElement).instantiate(window.test._base.NodeList.some.Thing, {
				foo: 'bar'
			});

			query('#thinger2', rootElement).instantiate('test._base.NodeList.some.Thing', {
				foo: 'bar'
			});

			assert.equal(2, test);
		},

		'.removeAttr()': function () {
			var ih = '<p id="attr" title="Foobar">Hi</p>';
			appendToBody(domConstruct.toDom(ih));

			var n = query('#attr', rootElement);

			assert.ok(domAttr.has(n[0], 'title'));

			var t = n.attr('title');
			assert.equal(t, 'Foobar');

			n.removeAttr('title');

			t = domAttr.has(n[0], 'title');
			assert.notOk(t);
		}
	});
});

