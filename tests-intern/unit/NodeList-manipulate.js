define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/dom',
	'dojo/query',
	'dojo/_base/array',
	'dojo/dom-construct',
	'dojo/NodeList-manipulate'
], function (require, registerSuite, assert, Deferred, dom, query, array, domConstruct) {

	var divs;

	registerSuite({
		name: 'dojo/NodeList-manipulate',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./NodeList-manipulate.html'], function (html) {
				document.body.innerHTML = html;
				divs = query('div.testDiv');
				deferred.resolve();
			});
			return deferred.promise;
		},

		innerHTML: function () {
			divs.innerHTML('<ul><li>Test</li></ul>');
			array.forEach(divs, function(node){
				assert.lengthOf(node.childNodes, 1);
				assert.strictEqual(node.childNodes[0].nodeName.toLowerCase(), 'ul');
			});

			assert.strictEqual(divs.innerHTML().toLowerCase().replace(/[\r\n]/g, ''), '<ul><li>test</li></ul>');
			divs.innerHTML('');
			assert.strictEqual(divs.innerHTML().toLowerCase().replace(/[\r\n]/g, ''), '');
		},

		html: function () {
			divs.html('<ul><li>Test</li></ul>');
			array.forEach(divs, function(node){
				assert.lengthOf(node.childNodes, 1);
				assert.strictEqual(node.childNodes[0].nodeName.toLowerCase(), 'ul');
			});

			assert.strictEqual(divs.html().toLowerCase().replace(/[\r\n]/g, ''), '<ul><li>test</li></ul>');
		},

		text: function () {
			assert.strictEqual(divs.text(), 'TestTestTest');

			divs.text('Hello World');

			array.forEach(divs, function(node){
				assert.lengthOf(node.childNodes, 1);
				assert.strictEqual(node.childNodes[0].nodeValue, 'Hello World');
			});

			assert.strictEqual(divs.text(), 'Hello WorldHello WorldHello World');
		},

		val: function () {
			//Input text test.
			query('[type=\"text\"]').val('Hello');
			assert.strictEqual(dom.byId('inputText').value, 'Hello');

			//Textarea test.
			query('textarea', 'inputForm').val('World');
			assert.strictEqual(dom.byId('inputTextArea').value, 'World');

			//Radio button test
			query('[type=\"radio\"]').val('radio2');
			assert.isFalse(dom.byId('inputRadio1').checked);
			assert.isTrue(dom.byId('inputRadio2').checked);

			//Checkbox test
			query('[type=\"checkbox\"]').val('checkbox2');
			assert.isFalse(dom.byId('inputCheckBox1').checked);
			assert.isTrue(dom.byId('inputCheckBox2').checked);

			var selects = query('select', 'inputForm');

			//Single select test.
			selects.at(0).val('two');
			assert.strictEqual(dom.byId('inputSelect1').selectedIndex, 1);
			query('option', 'inputSelect1').forEach(function(node){
				if(node.value === 'two'){
					assert.isTrue(node.selected);
				}else{
					assert.isFalse(node.selected);
				}
			});

			//Multiple select test.
			selects.at(1).val(['four', 'six']);
			query('option', 'inputSelect2').forEach(function(node){
				if(node.value === 'four' || node.value === 'six'){
					assert.isTrue(node.selected);
				}else{
					assert.isFalse(node.selected);
				}
			});

		},

		append: function () {
			//Test string content
			divs.append('<span class="foo">foo</span><span class="bar">bar</span>')
				.forEach(function(node){
					assert.lengthOf(node.childNodes, 3);
					assert.strictEqual(node.childNodes[1].className, 'foo');
					assert.strictEqual(node.childNodes[2].className, 'bar');
				}
			);

			//Test DOMNode content
			divs.append(query('h1')[0]).forEach(function(node){
				assert.lengthOf(node.childNodes, 4);
				assert.strictEqual(node.childNodes[3].nodeName.toLowerCase(), 'h1');
			});

			var h1s = query('h1');
			assert.lengthOf(h1s, 3);

			//Move all the h1s to one div to test NodeList content.
			query('#t, #yeah').append(document.getElementsByTagName('h1')).forEach(function(node){
				assert.lengthOf(node.childNodes, 6);
				assert.strictEqual(node.childNodes[3].nodeName.toLowerCase(), 'h1');
				assert.strictEqual(node.childNodes[4].nodeName.toLowerCase(), 'h1');
				assert.strictEqual(node.childNodes[5].nodeName.toLowerCase(), 'h1');
			});

			//clean up
			query('h1').remove();
		},

		appendTo: function () {
			//Create some new things.
			query('body').append('<p class="singer">bo</p><p class="singer">diddly</p>');

			var ret = query('.foo').appendTo('.singer');
			assert.lengthOf(ret, 6);

			query('.singer').forEach(function(node){
				assert.lengthOf(node.childNodes, 4);
				assert.strictEqual(node.childNodes[1].className, 'foo');
				assert.strictEqual(node.childNodes[2].className, 'foo');
				assert.strictEqual(node.childNodes[3].className, 'foo');
			});

			query('body').append('<p class="bands"></p><p class="drummer">john</p><p class="drummer">bonham</p>');
			var bands = query('.bands');
			query('.drummer').appendTo(bands);
			bands.forEach(function(node){
				assert.lengthOf(node.childNodes, 2);
				assert.strictEqual(node.childNodes[0].className, 'drummer');
				assert.strictEqual(node.childNodes[1].className, 'drummer');  
			});

			query('body').append('<p class="guitarist">jimmy</p><p class="guitarist">page</p>');
			query('.guitarist').appendTo(bands[0]);
			bands.forEach(function(node){
				assert.lengthOf(node.childNodes, 4);
				assert.strictEqual(node.childNodes[2].className, 'guitarist');
				assert.strictEqual(node.childNodes[3].className, 'guitarist');              
			});

			//Get rid of bands
			bands.remove();
		},

		prepend: function () {
			query('.singer').prepend('<span class="fry">layla</span>')
				.forEach(function(node){
					assert.lengthOf(node.childNodes, 5);
					assert.strictEqual(node.childNodes[0].className, 'fry');
				}
			);
		},

		prependTo: function () {
			//Create some new things.
			query('body').append('<p class="actor">steve</p><p class="actor">martin</p>');

			var ret = query('.bar').prependTo('.actor');
			assert.lengthOf(ret, 6);


			query('.actor').forEach(function(node){
				assert.lengthOf(node.childNodes, 4);
				assert.strictEqual(node.childNodes[0].className, 'bar');
				assert.strictEqual(node.childNodes[1].className, 'bar'); 
				assert.strictEqual(node.childNodes[2].className, 'bar');
			});

			//Clean up
			query('p').remove();
		},

		after: function () {
			divs.after('<span class="after">after</span>')
				.forEach(function(node){
					assert.strictEqual(node.nextSibling.className, 'after');
				}
			);

			query('form').after(query('.after')).forEach(function(node){
				for (var i = 0; i < 3; i++) {
					assert.strictEqual(node.nextSibling.className, 'after');
					node = node.nextSibling;
				}
			});
		},

		insertAfter: function () {
			// query('body').prepend('<h1>testing dojo.NodeList-manipulate</h1>');
			// console.log(query('.after'));
			var ret = query('#inputForm').insertAfter('h3');
			assert.lengthOf(ret, 1);

			query('h3').forEach(function (node){
				for(var i = 0; i < 1; i++){
					assert.strictEqual(node.nextSibling.id, 'yeah');
					node = node.nextSibling;
				}
			});
		},

		beforeNode: function () {
			divs.before('<span class="before">before</span>')
				.forEach(function(node){
					assert.strictEqual(node.previousSibling.className, 'before');
				}
			);

			query('form').before(query('.before')).forEach(function(node){
				for (var i = 0; i < 3; i++) {
					assert.strictEqual(node.previousSibling.className, 'before');
					node = node.previousSibling;
				}
			});
		},

		insertBefore: function () {
			var ret = query('.before').insertBefore('h1');
			assert.lengthOf(ret, 3);

			query('h1').forEach(function(node){
				for(var i = 0; i < 3; i++){
					assert.strictEqual(node.previousSibling.className, 'before');
					node = node.previousSibling;
				}
			});
		},

		remove: function () {
			//Already did some removes, make sure they are not still here.
			//This is also just an alias for orphan which has its own tests.
			assert.lengthOf(query('p'), 0);
		},

		wrap: function () {
			query('body').prepend('<h1>testing dojo.NodeList-manipulate</h1>');
			query('.before').wrap('<b><i></i></b>').forEach(function (node) {
				assert.strictEqual(node.parentNode.nodeName.toLowerCase(), 'i');
				assert.strictEqual(node.parentNode.parentNode.nodeName.toLowerCase(), 'b');
			});

			query('b').wrap(query('h1')[0]).forEach(function (node) {
				assert.strictEqual(node.parentNode.nodeName.toLowerCase(), 'h1');
				assert.lengthOf(query('h1'), 4);
			});
		},

		wrapAll: function () {
			query('h1').wrapAll('<h4></h4>');
			var h4s = query('h4');
			assert.lengthOf(h4s, 1);

			var h4 = h4s[0];
			assert.lengthOf(h4.childNodes, 4);
			query('h1').forEach(function (node) {
				assert.strictEqual(node.parentNode.nodeName.toLowerCase(), 'h4');
			});

			var div = domConstruct.create('div', {'class': 'myClass'});
			query('#inputForm').query('select').wrapAll(div).end().query('input').wrapAll(div);
			var myClass = query('.myClass');

			assert.lengthOf(myClass, 2);
		},

		wrapInner: function () {
			query('h4').wrapInner('<h3></h3>');
			var h3s = query('h3');
			assert.lengthOf(h3s, 1);

			var h3 = h3s[0];
			assert.lengthOf(h3.childNodes, 4);
			query('h1').forEach(function(node){
				assert.strictEqual('h3', node.parentNode.nodeName.toLowerCase());
			});
		},

		replaceWith: function () {
			query('h1').replaceWith('<span class="replace">replace</span><b>hello</b>');

			query('h3').forEach(function (node) {
				assert.lengthOf(node.childNodes, 8);
				assert.strictEqual('replace', node.childNodes[0].className);
				assert.strictEqual('b', node.childNodes[1].nodeName.toLowerCase());
			});
		},

		replaceAll: function () {
			query('.testDiv').replaceAll('h4');

			assert.lengthOf(query('.testDiv'), 3);
			assert.lengthOf(query('h4'), 0);

			query('body').append('<i class="italics">italics</i>');
			assert.strictEqual(query('.italics').replaceAll('.after')[0].nodeName.toLowerCase(), 'i');
			assert.lengthOf(query('.after'), 0);
			assert.lengthOf(query('.italics'), 1);
		},

		clone: function () {
			query('.italics').clone().appendTo('body');
			assert.lengthOf(query('.italics'), 2);
		}

	});
});
