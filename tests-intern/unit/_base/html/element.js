define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/dom-construct',
	'intern/dojo/_base/array',
	'dojo'
], function (
	registerSuite,
	assert,
	domConstruct,
	arrayUtil,
	dojo
) {

	var _rootElement;


	registerSuite({
		name: 'dojo/_base/html/element',

		beforeEach: function () {
			var testElements = domConstruct.toDom(
				'<div id="holder1"></div>' +
				'<ul id="holder2">' +
					'<li class="first">first</li>' +
					'<li class="last">last</li>' +
				'</ul>' +
				'<div id="holder3"></div>' +
				'<p id="someId"></p>' +
				'<div>' +
					'<div>' +
						'<a id="ancFoo" href="null.html">link</a>' +
					'</div>' +
				'</div>'
			);

			_rootElement = document.createElement('div');
			_rootElement.id = 'root';
			_rootElement.appendChild(testElements);
			document.body.appendChild(_rootElement);
		},

		afterEach: function () {
			domConstruct.destroy(_rootElement);
		},

		'create element': function () {
			var element = dojo.create('div');
			dojo.byId('holder1').appendChild(element);
			dojo.addClass(element, 'testing');
			var elements = dojo.query('.testing');
			assert.equal(elements.length, 1);
			assert.equal(element.nodeName.toLowerCase(), 'div');
		},

		'create with attributes': function () {
			var element = dojo.create('div', {
				'class': 'hasClass',
				title: 'foo',
				style: 'border:2px solid #ededed; padding:3px'
			});
			// plain placement:
			dojo.byId('holder1').appendChild(element);

			assert.ok(dojo.hasClass(element, 'hasClass'));
			assert.equal(dojo.attr(element, 'title'), 'foo');
		},

		'create and place': function () {
			var element = dojo.create('div', null, _rootElement);
			element.innerHTML = '<p class="bar">a</p>';
			var q = dojo.query('p', element);
			assert.equal(q.length, 1);
			assert.ok(dojo.hasClass(q[0], 'bar'));
		},

		'create with HTML': function () {
			var element = dojo.create('div', {
				innerHTML: '<p class="bar2">a</p>'
			}, _rootElement);
			var q = dojo.query('p', element);

			assert.equal(q.length, 1);
			assert.ok(dojo.hasClass(q[0], 'bar2'));
		},

		'create and place before': function () {
			var ref = dojo.query('#holder2 > li.last')[0];

			dojo.create('li', {
				innerHTML: 'middle',
				'class': 'middleNode'
			}, ref, 'before');

			assert.equal(dojo.query('#holder2 li').length, 3);

			dojo.create('li', {
				innerHTML: 'afterLast',
				'class': 'afterLast'
			}, ref, 'after');

			// TODO: this is dependant on query() retaining DOM order.
			//		is that safe? nextSibling and friends are a PITA
			var classes = ['first', 'middleNode', 'last', 'afterLast'];
			var q = dojo.query('#holder2 li');
			assert.equal(q.length, 4);

			q.forEach(function (ele, i) {
				assert.equal(ele.className, classes[i]);
			});

		},

		'destroy list': function () {
			dojo.destroy('holder2');
			assert.notOk(dojo.byId('holder2'));
			// destroyed because is child of holder
			assert.equal(dojo.query('.first').length, 0);
		},

		'create list': function () {
			var es = [
				'div',
				'a',
				'span',
				'br',
				'table',
				'ul',
				'dd',
				'img',
				'h2'
			];

			arrayUtil.forEach(es, function (el) {
				dojo.create(el, null, 'holder3');
			});
			var q = dojo.query('>', 'holder3');
			assert.equal(q.length, es.length);

			// destroy this list:
			q.forEach(dojo.destroy);
			q = dojo.query('>', 'holder3');
			assert.equal(q.length, 0);

		},

		'destroy all': function () {
			var c = function () {
				// eg: don't destroy firebug lite in page
				return dojo.query('*', _rootElement).filter(function (n) {
					return !dojo.hasClass(n, 'firebug');
				});
			};
			c().forEach(dojo.destroy);

			// check for deepest embeeded id
			assert.notOk(dojo.byId('ancFoo'));
			assert.equal(c().length, 0);
		},

		'recreate one': function () {
			dojo.create('h2', {
				'class': 'restored',
				innerHTML: '<span>The End</span>'
			}, _rootElement);

			assert.equal(dojo.query('.restored').length, 1);
		},

		'recreate with place': function () {
			dojo.place('<h2 class="restored"><span>The End</span></h2>',
				_rootElement);
			assert.equal(dojo.query('.restored').length, 1);
		},

		'empty div': function () {
			var n = dojo.create('div', {
				innerHTML: '1<span class="red">2</span>3<em custom="x">4</em>5'
			});
			assert.ok(n.innerHTML);
			dojo.empty(n);
			assert.notOk(n.innerHTML);
		},

		'empty table': function () {
			var table = dojo.create('table', null, _rootElement),
				tr1 = dojo.create('tr', null, table),
				tr2 = dojo.create('tr', null, table);

			dojo.create('td', {innerHTML: 'c'}, tr2),
			dojo.create('td', {innerHTML: 'd'}, tr2);
			dojo.create('td', {innerHTML: 'a'}, tr1),
			dojo.create('td', {innerHTML: 'b'}, tr1),
			assert.ok(table.innerHTML);
			dojo.empty(table);
			assert.notOk(table.innerHTML);
		},

		'._toDom() spans': function () {
			var n = dojo._toDom('<span>1</span><span>2</span>');
			assert.equal(n.childNodes.length, 2);
			assert.equal(n.firstChild.tagName.toLowerCase(), 'span');
			assert.equal(n.firstChild.innerHTML, '1');
			assert.equal(n.lastChild.tagName.toLowerCase(), 'span');
			assert.equal(n.lastChild.innerHTML, '2');
		},

		'._toDom() tr': function () {
			var n = dojo._toDom('<tr><td>First!</td></tr>');
			assert.equal(n.tagName.toLowerCase(), 'tr');
			assert.equal(n.childNodes.length, 1);
			assert.equal(n.firstChild.tagName.toLowerCase(), 'td');
			assert.equal(n.firstChild.innerHTML, 'First!');
		},

		'._toDom() text': function () {
			var expectedValue = 'Hello, world!';
			var n = dojo._toDom(expectedValue);
			assert.equal(n.nodeType, 3);
			assert.equal(n.nodeValue, expectedValue);
		},

		'._toDom() option': function () {
			var n = dojo._toDom('<option value="1">First</option>');
			assert.notOk(n.selected);

			n = dojo._toDom('<option value="1" selected="selected">First</option>');
			assert.ok(n.selected);

			n = dojo._toDom('<option value="1">First</option><option value="2" selected>Second</option>');
			assert.notOk(n.childNodes[0].selected);
			assert.ok(n.childNodes[1].selected);
		},

		'.place() divs': function () {
			var n;
			dojo.place('<p class="disposable">2</p>', _rootElement);
			n = dojo.query('.disposable')[0];
			dojo.place('<p class="disposable">0</p><p class="disposable">1</p>', n, 'before');
			dojo.place('<p class="disposable">3</p><p class="disposable">4</p>', n, 'after');
			dojo.place('<span>a</span>', n, 'first');
			dojo.place('<span>z</span>', n, 'last');
			n = dojo.query('.disposable');
			assert.equal(n.length, 5);
			assert.equal(n[0].innerHTML, '0');
			assert.equal(n[1].innerHTML, '1');
			assert.equal(n[3].innerHTML, '3');
			assert.equal(n[4].innerHTML, '4');
			assert.equal(n[2].innerHTML.toLowerCase(), '<span>a</span>2<span>z</span>');
		},

		'.place() table': function () {
			var n;
			dojo.place('<table class="disposable"><tbody></tbody></table>', _rootElement);
			n = dojo.query('table.disposable > tbody')[0];
			dojo.place('<tr><td>2</td></tr>', n);
			dojo.place('<tr><td>0</td></tr><tr><td>1</td></tr>', n, 'first');
			dojo.place('<tr><td>3</td></tr><tr><td>4</td></tr>', n, 'last');
			n = dojo.query('table.disposable tr');
			assert.equal(n.length, 5);
			assert.equal(n[0].innerHTML.toLowerCase(), '<td>0</td>');
			assert.equal(n[1].innerHTML.toLowerCase(), '<td>1</td>');
			assert.equal(n[2].innerHTML.toLowerCase(), '<td>2</td>');
			assert.equal(n[3].innerHTML.toLowerCase(), '<td>3</td>');
			assert.equal(n[4].innerHTML.toLowerCase(), '<td>4</td>');
		},

		'.place() replace': function () {
			var n;
			dojo.place('<p class="disposable">2</p>', _rootElement);
			n = dojo.query('.disposable')[0];
			dojo.place('<p class="disposable">0</p><p class="disposable">1</p>', n, 'replace');
			n = dojo.query('.disposable');
			assert.equal(n.length, 2);
			assert.equal(n[0].innerHTML, '0');
			assert.equal(n[1].innerHTML, '1');
		},

		'.place()': function () {
			var n;
			dojo.place('<p class="disposable"><em>1</em>2<strong>3</strong></p>', _rootElement);
			n = dojo.query('.disposable')[0];
			dojo.place('<span>42</span>99', n, 'only');
			n = dojo.query('.disposable');
			assert.equal(n.length, 1);
			assert.equal(n[0].innerHTML.toLowerCase(), '<span>42</span>99');
		},

		'.place() number': function () {
			var n = dojo.place('<p><em>1</em><em>2</em></p>', _rootElement);
			assert.equal(n.childNodes.length, 2);
			dojo.place('<span>C</span>', n, 99);
			assert.equal(n.childNodes.length, 3);
			assert.equal(n.childNodes[2].tagName.toLowerCase(), 'span');
			assert.equal(n.childNodes[2].innerHTML, 'C');
			dojo.place('<span>A</span>', n, -1);
			assert.equal(n.childNodes.length, 4);
			assert.equal(n.childNodes[0].tagName.toLowerCase(), 'span');
			assert.equal(n.childNodes[0].innerHTML, 'A');
			dojo.place('<span>B</span>', n, 2);
			assert.equal(n.childNodes.length, 5);
			assert.equal(n.childNodes[2].tagName.toLowerCase(), 'span');
			assert.equal(n.childNodes[2].innerHTML, 'B');
		}

	});
});

