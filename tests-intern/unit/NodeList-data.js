define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'intern/dojo/dom-construct',
	'dojo/query',
	'dojo/NodeList-data',
	'dojo/main'
], function (require, registerSuite, assert, Deferred, domConstruct, query, NodeList, dojo) {
	function len(obj){
		var x = 0;
		for(var i in obj){ x++; }
		return x;
	}

	registerSuite({
		name: 'dojo/NodeList-data',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./NodeList-data.html'], function (html) {
				document.body.innerHTML = html;
				deferred.resolve();
			});
			return deferred.promise;
		},

		sanity: function () {
			var list = query('#foo');
			var lis = query('#bar > li');
			assert.lengthOf(list, 1);
			assert.lengthOf(lis, 2);
			list.data('a', 'b');
			lis.data('a', 'b');
			console.log();
			assert.strictEqual(list.data('a')[0], 'b');
			assert.strictEqual(lis.data('a')[0], 'b');
			assert.strictEqual(lis.data('a')[1], 'b');
			assert.strictEqual(lis.data('a')[0], 'b');
		},

		'basic data': function () {
			var list = query('#foo');
			list.data('bar', 6)
				.data('baz', 'a')
				.data('bam', [1,2,3])
				.data('foo', { a:'b' });
			var newlist = query('#foo');
			assert.strictEqual(newlist.data('bar')[0], 6);
			assert.strictEqual(newlist.data('baz')[0], 'a');
			assert.lengthOf(newlist.data('bam')[0], 3);
			assert.strictEqual(newlist.data('bam')[0][0], 1);
		},

		'hash data': function () {
			query('#foo').data({
				bar:'baz',
				foo:'bap'
			});
			assert.strictEqual(query('#foo').data('bar')[0], 'baz');
			assert.strictEqual(query('#foo').data('foo')[0], 'bap');
		},

		'but does it chain': function () {
			query('#foo').data('bar', 42).style('color', 'red');
			assert.strictEqual(query('#foo').data('bar')[0], 42);
		},

		'get an object back': function () {
			query('#foo').data('afoo', 1);
			query('#foo').data('bfoo', 2);
			var obj = query('#foo').data()[0];
			assert.strictEqual(obj.afoo, 1);
			assert.strictEqual(obj.bfoo, 2);
		},

		'plain data': function () {
			// query('#bar li').data('bar', 42).forEach(function(){
			// 	assert.strictEqual(dojo._nodeData('n', 'bar'), 42);
			// });
		},

		'removeData': function () {
			query('#bar li').removeData('bar');
			query('#bar li').forEach(function(n){
				assert.isTrue(!dojo._nodeData(n, 'bar'));
			});
			query('#bar li').data({ a: 'b', c: 'd', e: 'f' });
			query('#bar li').removeData();
			var data = query('#bar li').data()[0];
			assert.isUndefined(data.a);
			assert.isUndefined(data.c);
			assert.isUndefined(data.e);
		},

		'multi data': function () {
			var ret = query('#bar li');
			assert.lengthOf(ret, 2);
			ret = ret.data('bar', 'baz').data();
			assert.strictEqual(ret[0].bar, 'baz', 'item 0 was set');
			assert.strictEqual(ret[1].bar, 'baz', 'item 1 was set');
			query('li').at(0).removeData();
			var ret2 = query('#bar li').data();
			assert.lengthOf(ret, 2);
			assert.isUndefined(ret2[0].bar, 'at(0) was removed');
			assert.strictEqual(ret2[1].bar, 'baz', 'at(1) was untouched');
		},

		'obj': function () {
			var x = query('#foo').data({ bar: { baz:'bam' }}).data('bar');
			assert.strictEqual(x[0].baz, 'bam');
		},

		'clean data': function () {
			var me = query('#bar li').data('die', 'yes');
			me.at(0).attr('id', 'killme');
			assert.lengthOf(me, 2);
			assert.strictEqual(me.data('die')[0], 'yes');
			assert.strictEqual(me.data('die')[1], 'yes');
			var l = len(NodeList._nodeDataCache);
			domConstruct.destroy('killme');
			NodeList._gcNodeData();
			assert.strictEqual(l - 1, len(NodeList._nodeDataCache));
			me = query('#bar li');
			assert.lengthOf(me, 1);
		},

		'literals': function () {
			var x = {a: 1};
			query('#lit span').data('literal', x);
			x.a++;
			assert.strictEqual(query('#lit span').data('literal')[0].a, 2);
			assert.strictEqual(query('#lit span').data('literal')[1].a, 2);
		},

		'clear all': function () {
			var l = len(NodeList._nodeDataCache);
			assert.strictEqual(l, 4, 'there is stuff in the cache');
			query('#b > *').forEach(domConstruct.destroy);
			dojo._gcNodeData();
			assert.strictEqual(len(NodeList._nodeDataCache), 0);
		}
	});
});
