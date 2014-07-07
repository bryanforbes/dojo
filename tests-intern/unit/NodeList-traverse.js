define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/query',
	'dojo/NodeList-traverse'
], function (require, registerSuite, assert, Deferred, query) {
	function verify(nl, ids) {
		for(var i = 0, node; (node = nl[i]); i++){
			assert.strictEqual(ids[i], node.id);
		}
		assert.lengthOf(ids, i);
	}

	var divs;

	registerSuite({
		name: 'dojo/NodeList-traverse',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./NodeList-traverse.html'], function (html) {
				document.body.innerHTML = html;
				deferred.resolve();
				divs = query('div.testDiv');
			});
			return deferred.promise;
		},

		children: function () {
			verify(divs.last().children(), ['crass', 'classy', 'yeah']);
		},

		closest: function () {
			var classy = query('#classy');
			var closestDiv = classy.closest('div');
			verify(closestDiv, ['third'], 'closest(\'div\')');
			verify(closestDiv.end().closest('.classy'), ['classy'], 'closestDiv.end().closest(\'.classy\')');

			var bang = query('.bang');
			var closestFooBar = bang.closest('.foo > .bar');
			verify(closestFooBar, ['level4'], '.foo > .bar');


			var closestBogusFoo = bang.closest('.bogus .foo');
			verify(closestBogusFoo, [], '.bogus .foo');

			closestFooBar = bang.closest('.foo > .bar', 'level2');
			verify(closestFooBar, ['level4'], '.foo > .bar query relative to level2');

			var topBar = bang.closest('> .bar', 'level3');
			verify(topBar, ['level4'], '> .bar query relative to level3');

			closestFooBar = bang.closest('.foo > .bar', 'level3');
			verify(closestFooBar, [], '.foo > .bar query relative to level3');

			var closestFoo = query('div').closest('.foo');
			verify(closestFoo, ['level1', 'level3'], '.foo from div');
		 
		},

		parent: function () {
			verify(query('#classy').parent(), ['third']);
		},

		siblings: function () {
			verify(query('#classy').siblings(), ['crass', 'yeah']);
		},

		next: function () {
			verify(query('#crass').next(), ['classy']);
		},

		nextAll: function () {
			verify(query('#crass').nextAll(), ['classy', 'yeah']);
			verify(query('#crass').nextAll('#yeah'), ['yeah']);
		},

		prev: function () {
			verify(query('#classy').prev(), ['crass']);
		},

		prevAll: function () {
			verify(query('#yeah').prevAll(), ['classy', 'crass']);
			verify(query('#yeah').prevAll('#crass'), ['crass']);
		},

		andSelf: function () {
			verify(query('#yeah').prevAll().andSelf(), ['classy', 'crass', 'yeah']);
		},

		first: function () {
			verify(divs.first(), ['sq100']);
		},

		last: function () {
			verify(divs.last(), ['third']);
		},

		even: function () {
			var even = divs.even();
			verify(even, ['t']);
			verify(even.end(), ['sq100', 't', 'third']);
		},

		odd: function () {
			var odd = divs.odd();
			verify(odd, ['sq100', 'third']);
			verify(odd.end(), ['sq100', 't', 'third']);
		}

	});
});
