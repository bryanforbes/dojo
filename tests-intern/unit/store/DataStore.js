define([
	'intern!object',
	'intern/chai!assert',
	'dojo/store/DataStore',
	'dojo/data/ItemFileReadStore',
	'dojo/data/ItemFileWriteStore',
	'dojo/_base/lang'
], function (registerSuite, assert, DataStore, ItemFileReadStore, ItemFileWriteStore, lang) {
	var data, dataStore, store;

	registerSuite({
		name: 'dojo/store/DataStore',

		'beforeEach': function () {
			data = {
				items: [
					{id: 1, name: "one", prime: false},
					{id: 2, name: "two", even: true, prime: true},
					{id: 3, name: "three", prime: true},
					{id: 4, name: "four", even: true, prime: false},
					{id: 5, name: "five", prime: true,
						children:[
							{ _reference: 1 },
							{ _reference: 2 },
							{ _reference: 3 }
						]
					}
				],
				identifier:"id"
			};

			dataStore = new ItemFileWriteStore({ data: lang.clone(data) });
			dataStore.fetchItemByIdentity({identity:null});
			store = new DataStore({store:dataStore});
		},

		'.get': function () {
			assert.equal(store.get(1).name, "one");
			assert.equal(store.get(4).name, "four");
			assert.isTrue(store.get(5).prime);
			assert.equal(store.get(5).children[1].name, "two");
		},

		'.query': {
			'basic query': function () {
				var dfd = this.async(500);
				var query = { prime: true };

				store.query(query).then(dfd.callback(
					function (results) {
						assert.lengthOf(results, 3);
						assert.equal(results[2].children[2].name, "three");
					}
				), dfd.reject.bind(dfd));
			},

			'query 2': function () {
				var dfd = this.async(500);
				var query = { even: true };
				var result = store.query(query);

				result.map(dfd.callback(function (record) {
					var expected = data.items[record.id - 1];
					for(var key in record) {
						if(record.hasOwnProperty(key))
							assert.propertyVal(expected, key, record[key]);
					}
				}));
			}
		}
	});
});