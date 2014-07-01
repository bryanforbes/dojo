define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/main',
	'dojo/store/JsonRest',
	'dojo/store/Memory',
	'dojo/data/ObjectStore',
	'dojo/has'
], function (require, registerSuite, assert, dojo, JsonRest, Memory, ObjectStore, has) {
	var restStore = new JsonRest({target: require.toUrl('./mock/') }),
		memoryStore = new Memory({
			data: [
				{id: 1, name: 'one', prime: false},
				{id: 2, name: 'two', even: true, prime: true},
				{id: 3, name: 'three', prime: true},
				{id: 4, name: 'four', even: true, prime: false},
				{id: 5, name: 'five', prime: true}
			]
		}),
		dataStore = new ObjectStore({objectStore: restStore}),
		memoryDataStore = new ObjectStore({objectStore: memoryStore});


	registerSuite({
		name: 'data/ObjectStore',

		'NewItem': function () {
			var newItem = memoryDataStore.newItem({
				foo: 'bar',
				id: Math.random()
			});
			memoryDataStore.setValue(newItem, 'prop1', 1);
			memoryDataStore.save();
			memoryDataStore.setValue(newItem, 'prop1', 10);
			memoryDataStore.revert();
			assert.strictEqual(memoryDataStore.getValue(newItem, 'prop1'), 1);
			memoryDataStore.fetchItemByIdentity({
				identity: memoryDataStore.getIdentity(newItem),
				onItem: function(item){
					assert.strictEqual(memoryDataStore.getValue(item, 'foo'), 'bar');
					memoryDataStore.setValue(newItem, 'prop2', 2);
					assert.strictEqual(memoryDataStore.getValue(item, 'prop1'), 1);
					assert.strictEqual(memoryDataStore.getValue(item, 'prop2'), 2);
				}});
			newItem = memoryDataStore.newItem({
				foo: 'bar',
				id: Math.random()
			});
			memoryDataStore.deleteItem(newItem);
			memoryDataStore.save();
			memoryDataStore.fetchItemByIdentity({
				identity: memoryDataStore.getIdentity(newItem),
				onItem: function(item){
					assert.strictEqual(item, undefined);
				}
			});
		},

		'MemoryQuery': function () {
			var d = this.async();
			memoryDataStore.fetch({query:{name:'one'}, onComplete: function(results){
				var object = results[0];
				assert.strictEqual(results.length, 1);
				assert.strictEqual(object.name, 'one');
				d.resolve();
			}});
		},

		'MemoryQueryEmpty': function () {
			var d = this.async();
			memoryDataStore.fetch({query:{name:'o'}, onComplete: function(results){
				assert.strictEqual(results.length, 0);
				d.resolve();
			}});
		},

		'MemoryQueryWithWildcard': function () {
			var d = this.async();
			memoryDataStore.fetch({query:{name:'f*'}, onComplete: function(results){
				var object = results[0];
				assert.strictEqual(results.length, 2);
				assert.strictEqual(object.name, 'four');
				d.resolve();
			}});
		},

		'MemoryQueryWithEscapedWildcard': function () {
			var d = this.async();
			memoryDataStore.fetch({query:{name:'s\\*'}, onComplete: function(results){
				assert.strictEqual(results.length, 0);
			}});
			memoryDataStore.newItem({
				name: 's*',
				id: Math.random()
			});
			memoryDataStore.save();
			memoryDataStore.fetch({query:{name:'s\\*'}, onComplete: function(results){
				var object = results[0];
				assert.strictEqual(results.length, 1);
				assert.strictEqual(object.name, 's*');
				d.resolve();
			}});
		},

		'MemoryQueryWithWildcardCaseInsensitive': function () {
			var d = this.async();
			memoryDataStore.fetch({query:{name:'F*'}, queryOptions: {ignoreCase: true}, onComplete: function(results){
				var object = results[0];
				assert.strictEqual(results.length, 2);
				assert.strictEqual(object.name, 'four');
				d.resolve();
			}});
		},

		'FetchByIdentity': function () {
			if (!has('host-browser')) { return; }
			var d = this.async();
			dataStore.fetchItemByIdentity({identity: 'node1.1', onItem: function(object) {
				assert.strictEqual(object.name, 'node1.1');
				assert.strictEqual(object.someProperty, 'somePropertyA1');
				d.resolve();
			}});
		},

		'Query': function () {
			if (!has('host-browser')) { return; }
			var d = this.async();
			dataStore.fetch({query: 'treeTestRoot', onComplete: function(results){
				var object = results[0];
				assert.strictEqual(object.name, 'node1');
				assert.strictEqual(object.someProperty, 'somePropertyA');
				d.resolve();
			}});
		}
	});
});
