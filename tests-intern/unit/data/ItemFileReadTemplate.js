define([
	'intern!object',
	'intern/chai!assert',
	'dojo/main',
	'dojo/_base/declare',
	'dojo/has',
	'./mock/data'
], function (registerSuite, assert, dojo, declare, has, mockData) {
	declare('tests.data.Wrapper', null, {
		// summary:
		//		Simple class to use for typeMap in order to	test out falsy _values
		_wrapped: null,

		constructor: function(obj){
			this._wrapped = obj;
		},

		getValue: function(){
			return this._wrapped;
		},

		setValue: function(obj){
			this._wrapped = obj;
		},

		toString: function(){
			 return 'WRAPPER: [' + this._wrapped + ']';
		}
	});

	/*
	 * Because both ItemFileWriteStore is a subclass of ItemFileReadStore, both should pass
	 * the ItemFileReadStore test suite. As such, we define a module that returns a function
	 * that accepts a test name and ItemFile[Read | Write]Store constructor. It will define
	 * the ItemFileReadStore test suite for the given constructor. This allows us to use
	 * this module as a test "template" and easily reuse this code.
	 */
	return function (name, Ctr) {
		var Store;

		registerSuite({
			name: name,

			setup: function () {
				Store = Ctr;
			},

			'Identity API: fetchItemByIdentity()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item) {
					if (item) {
						var name = store.getValue(item, 'name');
						assert.strictEqual(name, 'El Salvador');
					}
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() preventCache': function () {
				var args = mockData('countries');
				args.urlPreventCache = true;

				var store = new Store(args),
					deferred = this.async();

				function onItem(item) {
					if (item) {
						var name = store.getValue(item, 'name');
						assert.strictEqual(name, 'El Salvador');
					}
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() notFound': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item) {
					assert.isNull(item);
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'sv_not',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: getIdentityAttributes()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item) {
					var identifiers = store.getIdentityAttributes(item);
					assert.isArray(identifiers);
					assert.lengthOf(identifiers, 1);
					assert.strictEqual(identifiers[0], 'abbr');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() commentFilteredJson': function () {
				if (!has('host-browser')) { return; }

				var store = new Store({url: require.toUrl('./mock/countries_commentFiltered.json')}),
					deferred = this.async();

				function onItem(item) {
					var name = store.getValue(item, 'name');
					assert.strictEqual(name, 'El Salvador');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() nullValue': function () {
				var store = new Store(mockData('countries_withNull')),
					deferred = this.async();

				function onItem(item) {
					var name = store.getValue(item, 'name');
					assert.isNull(name);
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'ec',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() booleanValue': function () {
				var store = new Store(mockData('countries_withBoolean')),
					deferred = this.async();

				function onItem(item) {
					var name = store.getValue(item, 'name');
					assert.strictEqual(name, 'Utopia');
					var real = store.getValue(item, 'real');
					assert.isFalse(real);
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'ut',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() withoutSpecifiedIdInData': function () {
				var store = new Store(mockData('countries_withoutid')),
					deferred = this.async();

				function onItem(item) {
					var name = store.getValue(item, 'name');
					assert.strictEqual(name, 'El Salvador');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: '2',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() Object.prototype item identifier': function () {
				var store = new Store({
						data: {identifier: 'id', items: [{id: 'toString', value: 'aha'}]}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.strictEqual(store.getValue(item, 'value'), 'aha');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'toString',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() Object.prototype item identifier 2': function () {
				var store = new Store({
						data: {identifier: 'id', items: [{id: 'hasOwnProperty', value: 'yep'}]}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.strictEqual(store.getValue(item, 'value'), 'yep');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'hasOwnProperty',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() Object.prototype identity': function () {
				var store = new Store(mockData('countries_withoutid')),
					deferred = this.async();

				function onItem(item) {
					assert.isNull(item);
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'toString',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: fetchItemByIdentity() Object.prototype identity 2': function () {
				var store = new Store(mockData('countries_withoutid')),
					deferred = this.async();

				function onItem(item) {
					assert.isNull(item);
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'hasOwnProperty',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: getIdentity()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					assert.strictEqual(store.getIdentity(item), 'sv');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Identity API: getIdentity() withoutSpecifiedId': function () {
				var store = new Store(mockData('countries_withoutid')),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					assert.equal(store.getIdentity(item), '2');
					deferred.resolve();
				}

				store.fetch({
					query:{abbr: 'sv'},
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: fetch() all': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function completedAll(items){
					assert.lengthOf(items, 7);
					deferred.resolve();
				}

				store.fetch({onComplete: completedAll, onError: deferred.reject});
			},

			'Read API: fetch() all failOk': function () {
				var store = new Store({
						url: 'noSuchUrl',
						failOk: true
					}),
					deferred = this.async();

				store.fetch({onComplete: deferred.reject, onError: deferred.resolve});
			},

			'Read API: fetch() abort': function () {
				if (!has('host-browser')) { return; }

				var store = new Store(mockData('countries')),
					deferred = this.async(),
					abortCalled = false;

				function completedAll(items){
					assert.lengthOf(items, 7);

					if(abortCalled){
						// Made it to complete callback and abort was called
						deferred.reject();
					}else{
						//We beat out calling abort, so this is okay
						deferred.resolve();
					}
				}

				var req = store.fetch({onComplete: completedAll, onError: deferred.resolve});
				abortCalled = true;
				req.abort();
			},

			'Read API: fetch() all (count === Infinity)': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function completedAll(items){
					assert.lengthOf(items, 7);
					deferred.resolve();
				}

				store.fetch({onComplete: completedAll, onError: deferred.reject, start: 0, count: Infinity});
			},

			'Read API: fetch() all PreventCache': function () {
				var data = mockData('countries');
				data.urlPreventCache = true;

				var store = new Store(data),
					deferred = this.async();

				function completedAll(items){
					assert.lengthOf(items, 7);
					deferred.resolve();
				}

				store.fetch({onComplete: completedAll, onError: deferred.reject});
			},

			'Read API: fetch() one': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 1);
					deferred.resolve();
				}

				store.fetch({
					query: {abbr: 'ec'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: fetch() shallow': function () {
				var store = new Store(mockData('geography_hierarchy_small')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 2);
					deferred.resolve();
				}
				
				store.fetch({
					query: {name: 'A*'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: fetch() multiple': function () {
				var store = new Store(mockData('geography_hierarchy_small')),
					deferred = this.async(null, 2),
					callback = deferred.callback(function () { });
				
				store.fetch({
					query: {name: 'A*'},
					onComplete: callback,
					onError: deferred.reject
				});

				store.fetch({
					query: {name: 'N*'},
					onComplete: callback,
					onError: deferred.reject
				});
			},

			'Read API: fetch() MultipleMixedFetch': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async(null, 2),
					callback = deferred.callback(function () { });

				function onComplete(items) {
					assert.lengthOf(items, 1);
					callback();
				}

				function onItem(item) {
					assert.isNotNull(item);
					var name = store.getValue(item, 'name');
					assert.strictEqual(name, 'El Salvador');
					callback();
				}

				store.fetch({
					query: {name: 'El*'},
					onComplete: onComplete,
					onError: deferred.reject
				});

				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: fetch() deep': function () {
				var store = new Store(mockData('geography_hierarchy_small')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 4);
					deferred.resolve();
				}
				
				store.fetch({
					query: {name: 'A*'},
					onComplete: onComplete,
					onError: deferred.reject,
					queryOptions: {deep:true}
				});
			},

			'Read API: fetch() hierarchy off': function () {
				var store = new Store(mockData('geography_hierarchy_small')),
					deferred = this.async();

				store.hierarchical = false;

				function onComplete(items){
					assert.lengthOf(items, 2);
					var passed = true;

					for (var i = 0; i < items.lenght; i++) {
						var countries = store.getValues(items[i], 'countries');
						if (countries) {
							for(var j = 0; j < countries.length; j++){
								passed = !store.isItem(countries[j]);
								if(!passed){ break; }
							}
						}
						if(!passed){ break; }
					}

					deferred[passed ? 'resolve' : 'reject']();
				}
				
				store.fetch({
					query: {name: 'A*'},
					onComplete: onComplete,
					onError: deferred.reject,
					queryOptions: {deep:true}
				});
			},

			'Read API: fetch() hierarchy off refs still parse': function () {
				var store = new Store(mockData('countries_references')),
					deferred = this.async();

				store.hierarchical = false;

				function onComplete(items){
					assert.lengthOf(items, 4);
					var passed = true;

					for (var i = 0; i < items.lenght; i++) {
						var countries = store.getValues(items[i], 'children');
						if (countries) {
							for(var j = 0; j < countries.length; j++){
								passed = !store.isItem(countries[j]);
								if(!passed){ break; }
							}
						}
						if(!passed){ break; }
					}

					deferred[passed ? 'resolve' : 'reject']();
				}
				
				store.fetch({
					query: {name: 'A*'},
					onComplete: onComplete,
					onError: deferred.reject,
					queryOptions: {deep:true}
				});
			},

			'Read API: fetch() one_commentFilteredJson': function () {
				if (!has('host-browser')) { return; }

				var store = new Store({url: require.toUrl('./countries_commentFiltered.json')}),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 1);
					deferred.resolve();
				}
				
				store.fetch({
					query: {abbr: 'ec'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: fetch() withNull': function () {
				var store = new Store(mockData('countries_withNull')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 4);
					deferred.resolve();
				}
				
				store.fetch({
					query: {name: 'E*'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: fetch() all_streaming': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async(),
					count = 0;

				function onBegin(size) {
					assert.strictEqual(size, 7);
				}

				function onItem(item) {
					assert.isTrue(store.isItem(item));
					count++;
				}

				function onComplete(items) {
					assert.strictEqual(count, 7);
					assert.isNull(items);
					deferred.resolve();
				}
				
				store.fetch({
					onBegin: onBegin,
					onComplete: onComplete,
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: fetch() paging': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function dumpFirstFetch(items, request){
					assert.lengthOf(items, 5);
					request.start = 3;
					request.count = 1;
					request.onComplete = dumpSecondFetch;
					store.fetch(request);
				}

				function dumpSecondFetch(items, request){
					assert.lengthOf(items, 1);
					request.start = 0;
					request.count = 5;
					request.onComplete = dumpThirdFetch;
					store.fetch(request);
				}

				function dumpThirdFetch(items, request){
					assert.lengthOf(items, 5);
					request.start = 2;
					request.count = 20;
					request.onComplete = dumpFourthFetch;
					store.fetch(request);
				}

				function dumpFourthFetch(items, request){
					assert.lengthOf(items, 5);
					request.start = 9;
					request.count = 100;
					request.onComplete = dumpFifthFetch;
					store.fetch(request);
				}

				function dumpFifthFetch(items, request){
					assert.lengthOf(items, 0);
					request.start = 2;
					request.count = 20;
					request.onComplete = dumpSixthFetch;
					store.fetch(request);
				}

				function dumpSixthFetch(items){
					assert.lengthOf(items, 5);
					deferred.resolve();
				}

				function completed(items, request){
					assert.lengthOf(items, 7);
					request.start = 1;
					request.count = 5;
					request.onComplete = dumpFirstFetch;
					store.fetch(request);
				}

				store.fetch({onComplete: completed, onError: deferred.reject});
			},

			'Read API: fetch() with MultiType Match': function () {
				var store = new Store(mockData('data_multitype')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 4);
					deferred.resolve();
				}
				
				store.fetch({
					query: {count: '1*'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: fetch() with RegExp Match': function () {
				var store = new Store(mockData('data_multitype')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 4);
					deferred.resolve();
				}
				
				store.fetch({
					query: {count: new RegExp('^1.*$', 'gi')},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: fetch() with RegExp Match Inline': function () {
				var store = new Store(mockData('data_multitype')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 4);
					deferred.resolve();
				}
				
				store.fetch({
					query: {count: /^1.*$/gi},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: fetch() with MultiType, MultiValue Match': function () {
				var store = new Store(mockData('data_multitype')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 7);
					deferred.resolve();
				}
				
				store.fetch({
					query: {value: 'true'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: getLabel()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 1);
					var label = store.getLabel(items[0]);
					assert.isNotNull(label);
					assert.strictEqual(label, 'Ecuador');
					deferred.resolve();
				}
				
				store.fetch({
					query: {abbr: 'ec'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: getLabelAttributes()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onComplete(items){
					assert.lengthOf(items, 1);
					var labelList = store.getLabelAttributes(items[0]);
					assert.isArray(labelList);
					assert.equal(labelList[0], 'name');
					deferred.resolve();
				}
				
				store.fetch({
					query: {abbr: 'ec'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: getValue()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item){
					assert.isNotNull(item);
					var name = store.getValue(item, 'name');
					assert.strictEqual(name, 'El Salvador');
					deferred.resolve();
				}
				
				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: getValues()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item){
					assert.isNotNull(item);
					var names = store.getValues(item, 'name');
					assert.isArray(names);
					assert.lengthOf(names, 1);
					assert.strictEqual(names[0], 'El Salvador');
					deferred.resolve();
				}
				
				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: isItem()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item){
					assert.isNotNull(item);
					assert.isTrue(store.isItem(item));
					assert.isFalse(store.isItem({}));
					deferred.resolve();
				}
				
				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: isItem() multistore': function () {
				var storeOne = new Store(mockData('countries')),
					storeTwo = new Store(mockData('countries')),
					deferred = this.async();

				function onItemOne(itemOne) {
					assert.isNotNull(itemOne);

					function onItemTwo(itemTwo) {
						assert.isNotNull(itemOne);
						assert.isNotNull(itemTwo);
						assert.isTrue(storeOne.isItem(itemOne));
						assert.isTrue(storeTwo.isItem(itemTwo));
						assert.isFalse(storeOne.isItem(itemTwo));
						assert.isFalse(storeTwo.isItem(itemOne));
						deferred.resolve();
					}

					storeTwo.fetchItemByIdentity({
						identity: 'sv',
						onItem: onItemTwo,
						onError: deferred.reject
					});
				}

				storeOne.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItemOne,
					onError: deferred.reject
				});
			},

			'Read API: hasAttribute()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item){
					try{
						assert.isNotNull(item);
						assert.isTrue(store.hasAttribute(item, 'abbr'));
						assert.isFalse(store.hasAttribute(item, 'abbr_not'));
						var passed = false;
						try{
							store.hasAttribute(item, null);
						}catch (e){
							passed = true;
						}
						assert.isTrue(passed);
						deferred.resolve();
					}catch(e){
						deferred.reject();
					}
				}
				
				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: containsValue()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item){
					try{
						assert.isNotNull(item);
						assert.isTrue(store.containsValue(item, 'abbr', 'sv'));
						assert.isFalse(store.hasAttribute(item, 'abbr_not', 'sv1'));
						assert.isFalse(store.hasAttribute(item, 'abbr_not', null));

						var passed = false;
						try{
							store.containsValue(item, null, 'foo');
						}catch (e){
							passed = true;
						}
						assert.isTrue(passed);
						deferred.resolve();
					}catch(e){
						deferred.reject();
					}
				}
				
				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: getAttributes()': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function onItem(item){
					assert.isNotNull(item);
					assert.isTrue(store.isItem(item));

					var attributes = store.getAttributes(item);
					assert.lengthOf(attributes, 3);
					for (var i = 0; i< attributes.length; i++) {
						assert.isTrue(attributes[i] === 'name' || attributes[i] === 'abbr' || attributes[i] === 'capital');
					}
					deferred.resolve();
				}
				
				store.fetchItemByIdentity({
					identity: 'sv',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: getFeatures()': function () {
				var store = new Store(mockData('countries')),
					features = store.getFeatures();

				assert.isNotNull(features['dojo.data.api.Read']);
				assert.isNotNull(features['dojo.data.api.Identity']);
			},

			'Read API: fetch() patternMatch0': function () {
				var store = new Store(mockData('countries')),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 5);
					var passed = true;
					for(var i = 0; i < items.length; i++){
						var value = store.getValue(items[i], 'abbr');
						if(!(value === 'ec' || value === 'eg' || value === 'er' || value === 'ee' || value === 'et')){
							passed = false;
							break;
						}
					}
					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					query: {abbr: 'e*'},
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() patternMatch1': function () {
				var store = new Store({
						data: {
							dentifier: 'uniqueId',
							items: [
								{uniqueId: 1, value: 'foo*bar'},
								{uniqueId: 2, value: 'bar*foo'},
								{uniqueId: 3, value: 'boomBam'},
								{uniqueId: 4, value: 'bit$Bite'},
								{uniqueId: 5, value: 'ouagadogou'},
								{uniqueId: 6, value: 'BaBaMaSaRa***Foo'},
								{uniqueId: 7, value: 'squawl'},
								{uniqueId: 8, value: 'seaweed'},
								{uniqueId: 9, value: 'jfq4@#!$!@Rf14r14i5u'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 2);
					var passed = true;
					for(var i = 0; i < items.length; i++){
						var value = store.getValue(items[i], 'value');
						if(!(value === 'bit$Bite' || value === 'jfq4@#!$!@Rf14r14i5u')){
							passed = false;
							break;
						}
					}
					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					query: {value: '*$*'},
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() patternMatch2': function () {
				var store = new Store({
						data: {
							dentifier: 'uniqueId',
							items: [
								{uniqueId: 1, value: 'foo*bar'},
								{uniqueId: 2, value: 'bar*foo'},
								{uniqueId: 3, value: 'boomBam'},
								{uniqueId: 4, value: 'bit$Bite'},
								{uniqueId: 5, value: 'ouagadogou'},
								{uniqueId: 6, value: 'BaBaMaSaRa***Foo'},
								{uniqueId: 7, value: 'squawl'},
								{uniqueId: 8, value: 'seaweed'},
								{uniqueId: 9, value: 'jfq4@#!$!@Rf14r14i5u'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 1);
					var passed = true;
					for(var i = 0; i < items.length; i++){
						var value = store.getValue(items[i], 'value');
						if(value !== 'bar*foo'){
							passed = false;
							break;
						}
					}
					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					query: {value: 'bar\*foo'},
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() patternMatch_caseSensitive': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 1, value: 'foo*bar'},
								{uniqueId: 2, value: 'bar*foo'},
								{uniqueId: 3, value: 'BAR*foo'},
								{uniqueId: 4, value: 'BARBananafoo'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 1);
					var passed = true;
					for(var i = 0; i < items.length; i++){
						var value = store.getValue(items[i], 'value');
						if (value !== 'bar*foo') {
							passed = false;
							break;
						}
					}
					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					query: {value: 'bar\\*foo'},
					queryOptions: {ignoreCase: false},
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() patternMatch_caseInsensitive': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 1, value: 'foo*bar'},
								{uniqueId: 2, value: 'bar*foo'},
								{uniqueId: 3, value: 'BAR*foo'},
								{uniqueId: 4, value: 'BARBananafoo'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 2);
					var passed = true;
					for(var i = 0; i < items.length; i++){
						var value = store.getValue(items[i], 'value');
						if(!(value === 'BAR*foo' || value === 'bar*foo')){
							passed = false;
							break;
						}
					}
					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					query: {value: 'bar\\*foo'},
					queryOptions: {ignoreCase: true},
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortNumeric': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 0, value: 'fo|o*b.ar'},
								{uniqueId: 1, value: 'ba|r*foo'},
								{uniqueId: 2, value: 'boomBam'},
								{uniqueId: 3, value: 'bit$Bite'},
								{uniqueId: 4, value: 'ouagadogou'},
								{uniqueId: 5, value: 'jfq4@#!$!@|f1.$4r14i5u'},
								{uniqueId: 6, value: 'BaB{aMa|SaRa***F}oo'},
								{uniqueId: 7, value: 'squawl'},
								{uniqueId: 9, value: 'seaweed'},
								{uniqueId: 10, value: 'zulu'},
								{uniqueId: 8, value: 'seaweed'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 11);
					var passed = true;
					for(var i = 0; i < items.length; i++){
						if (store.getValue(items[i], 'uniqueId') !== i) {
							passed = false;
							break;
						}
					}
					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'uniqueId'}],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortNumericDescending': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 0, value: 'fo|o*b.ar'},
								{uniqueId: 1, value: 'ba|r*foo'},
								{uniqueId: 2, value: 'boomBam'},
								{uniqueId: 3, value: 'bit$Bite'},
								{uniqueId: 4, value: 'ouagadogou'},
								{uniqueId: 5, value: 'jfq4@#!$!@|f1.$4r14i5u'},
								{uniqueId: 6, value: 'BaB{aMa|SaRa***F}oo'},
								{uniqueId: 7, value: 'squawl'},
								{uniqueId: 9, value: 'seaweed'},
								{uniqueId: 10, value: 'zulu'},
								{uniqueId: 8, value: 'seaweed'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 11);
					var passed = true;
					for (var i = 0; i < items.length; i++) {
						if ((items.length - (store.getValue(items[i], 'uniqueId') + 1)) !== i) {
							passed = false;
							break;
						}
					}
					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'uniqueId', descending: true}],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortNumericWithCount': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 0, value: 'fo|o*b.ar'},
								{uniqueId: 1, value: 'ba|r*foo'},
								{uniqueId: 2, value: 'boomBam'},
								{uniqueId: 3, value: 'bit$Bite'},
								{uniqueId: 4, value: 'ouagadogou'},
								{uniqueId: 5, value: 'jfq4@#!$!@|f1.$4r14i5u'},
								{uniqueId: 6, value: 'BaB{aMa|SaRa***F}oo'},
								{uniqueId: 7, value: 'squawl'},
								{uniqueId: 9, value: 'seaweed'},
								{uniqueId: 10, value: 'zulu'},
								{uniqueId: 8, value: 'seaweed'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 5);
					var passed = true,
						itemId = 10;
					for (var i = 0; i < items.length; i++) {
						if (store.getValue(items[i], 'uniqueId') !== itemId) {
							passed = false;
							break;
						}
						itemId--;
					}
					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'uniqueId', descending: true}],
					count: 5,
					onComplete: completed,
					onError: deferred.reject
				});
			},


			'Read API: fetch() sortAlphabetic': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 0, value: 'abc'},
								{uniqueId: 1, value: 'bca'},
								{uniqueId: 2, value: 'abcd'},
								{uniqueId: 3, value: 'abcdefg'},
								{uniqueId: 4, value: 'lmnop'},
								{uniqueId: 5, value: 'foghorn'},
								{uniqueId: 6, value: 'qberty'},
								{uniqueId: 7, value: 'qwerty'},
								{uniqueId: 8, value: ''},
								{uniqueId: 9, value: 'seaweed'},
								{uniqueId: 10, value: '123abc'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 11);

					var orderedArray = [
							'',
							'123abc',
							'abc',
							'abcd',
							'abcdefg',
							'bca',
							'foghorn',
							'lmnop',
							'qberty',
							'qwerty',
							'seaweed'
						],
						passed = true;

					for (var i = 0; i < items.length; i++) {
						if(store.getValue(items[i], 'value') !== orderedArray[i]){
							passed = false;
							break;
						}
					}

					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'value'}],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortAlphabeticDescending': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 0, value: 'abc'},
								{uniqueId: 1, value: 'bca'},
								{uniqueId: 2, value: 'abcd'},
								{uniqueId: 3, value: 'abcdefg'},
								{uniqueId: 4, value: 'lmnop'},
								{uniqueId: 5, value: 'foghorn'},
								{uniqueId: 6, value: 'qberty'},
								{uniqueId: 7, value: 'qwerty'},
								{uniqueId: 8, value: ''},
								{uniqueId: 9, value: 'seaweed'},
								{uniqueId: 10, value: '123abc'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					assert.lengthOf(items, 11);

					var orderedArray = [
							'',
							'123abc',
							'abc',
							'abcd',
							'abcdefg',
							'bca',
							'foghorn',
							'lmnop',
							'qberty',
							'qwerty',
							'seaweed'
						],
						passed = true;
					orderedArray = orderedArray.reverse();
					for (var i = 0; i < items.length; i++) {
						if(store.getValue(items[i], 'value') !== orderedArray[i]){
							passed = false;
							break;
						}
					}

					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'value', descending: true}],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortDate': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 0, value: new Date(0)},
								{uniqueId: 1, value: new Date(100)},
								{uniqueId: 2, value: new Date(1000)},
								{uniqueId: 3, value: new Date(2000)},
								{uniqueId: 4, value: new Date(3000)},
								{uniqueId: 5, value: new Date(4000)},
								{uniqueId: 6, value: new Date(5000)},
								{uniqueId: 7, value: new Date(6000)},
								{uniqueId: 8, value: new Date(7000)},
								{uniqueId: 9, value: new Date(8000)},
								{uniqueId: 10, value: new Date(9000)}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					var orderedArray =	[0, 100, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000];
					assert.lengthOf(items, 11);
					var passed = true;

					for (var i = 0; i < items.length; i++) {
						if (store.getValue(items[i], 'value').getTime() !== orderedArray[i]) {
							passed = false;
							break;
						}
					}

					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'value'}],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortDateDescending': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 0, value: new Date(0)},
								{uniqueId: 1, value: new Date(100)},
								{uniqueId: 2, value: new Date(1000)},
								{uniqueId: 3, value: new Date(2000)},
								{uniqueId: 4, value: new Date(3000)},
								{uniqueId: 5, value: new Date(4000)},
								{uniqueId: 6, value: new Date(5000)},
								{uniqueId: 7, value: new Date(6000)},
								{uniqueId: 8, value: new Date(7000)},
								{uniqueId: 9, value: new Date(8000)},
								{uniqueId: 10, value: new Date(9000)}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					var orderedArray =	[0, 100, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000];
					orderedArray = orderedArray.reverse();
					assert.lengthOf(items, 11);
					var passed = true;

					for (var i = 0; i < items.length; i++) {
						if (store.getValue(items[i], 'value').getTime() !== orderedArray[i]) {
							passed = false;
							break;
						}
					}

					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'value', descending: true}],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortMultiple': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 1, value: 'fo|o*b.ar'},
								{uniqueId: 2, value: 'ba|r*foo'},
								{uniqueId: 3, value: 'boomBam'},
								{uniqueId: 4, value: 'bit$Bite'},
								{uniqueId: 5, value: 'ouagadogou'},
								{uniqueId: 6, value: 'jfq4@#!$!@|f1.$4r14i5u'},
								{uniqueId: 7, value: 'BaB{aMa|SaRa***F}oo'},
								{uniqueId: 8, value: 'squawl'},
								{uniqueId: 10, value: 'seaweed'},
								{uniqueId: 12, value: 'seaweed'},
								{uniqueId: 11, value: 'zulu'},
								{uniqueId: 9, value: 'seaweed'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					var orderedArray0 = [7, 2, 4, 3, 1, 6, 5, 12, 10, 9, 8, 11],
						orderedArray1 = [
							'BaB{aMa|SaRa***F}oo',
							'ba|r*foo',
							'bit$Bite',
							'boomBam',
							'fo|o*b.ar',
							'jfq4@#!$!@|f1.$4r14i5u',
							'ouagadogou',
							'seaweed',
							'seaweed',
							'seaweed',
							'squawl',
							'zulu'
						],
						passed = true;

					for (var i = 0; i < items.length; i++) {
						if (store.getValue(items[i], 'uniqueId') !== orderedArray0[i] || store.getValue(items[i], 'value') !== orderedArray1[i]) {
							passed = false;
							break;
						}
					}

					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'value'}, {attribute: 'uniqueId', descending: true}],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortMultipleSpecialComparator': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 1, status: 'CLOSED'},
								{uniqueId: 2,  status: 'OPEN'},
								{uniqueId: 3,  status: 'PENDING'},
								{uniqueId: 4,  status: 'BLOCKED'},
								{uniqueId: 5,  status: 'CLOSED'},
								{uniqueId: 6,  status: 'OPEN'},
								{uniqueId: 7,  status: 'PENDING'},
								{uniqueId: 8,  status: 'PENDING'},
								{uniqueId: 10, status: 'BLOCKED'},
								{uniqueId: 12, status: 'BLOCKED'},
								{uniqueId: 11, status: 'OPEN'},
								{uniqueId: 9,  status: 'CLOSED'}
							]
						}
					}),
					deferred = this.async();

				store.comparatorMap = {};
				store.comparatorMap.status = function (a, b) {
					var ret = 0;
					// We want to map these by what the priority of these items are, not by alphabetical.
					// So, custom comparator.
					var enumMap = {OPEN: 3, BLOCKED: 2, PENDING: 1, CLOSED: 0};
					if (enumMap[a] > enumMap[b]){ ret = 1; }
					if (enumMap[a] < enumMap[b]){ ret = -1;	}
					return ret;
				};

				function completed(items) {
					var orderedArray = [11, 6, 2, 12, 10, 4, 8, 7, 3, 9, 5, 1],
						passed = true;
					for (var i = 0; i < items.length; i++) {
						if (store.getValue(items[i], 'uniqueId') !== orderedArray[i]) {
							passed = false;
							break;
						}
					}

					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [
						{attribute: 'status', descending: true},
						{attribute: 'uniqueId', descending: true}
					],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: fetch() sortAlphabeticWithUndefined': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 0, value: 'abc'},
								{uniqueId: 1, value: 'bca'},
								{uniqueId: 2, value: 'abcd'},
								{uniqueId: 3, value: 'abcdefg'},
								{uniqueId: 4, value: 'lmnop'},
								{uniqueId: 5, value: 'foghorn'},
								{uniqueId: 6, value: 'qberty'},
								{uniqueId: 7, value: 'qwerty'},
								{uniqueId: 8 },  //Deliberate undefined value
								{uniqueId: 9, value: 'seaweed'},
								{uniqueId: 10, value: '123abc'}
							]
						}
					}),
					deferred = this.async();

				function completed(items) {
					var orderedArray = [10, 0, 2, 3, 1, 5, 4, 6, 7, 9, 8],
						passed = true;

					assert.lengthOf(items, 11);
					for(var i = 0; i < items.length; i++){
						if (store.getValue(items[i], 'uniqueId') !== orderedArray[i]) {
							passed = false;
							break;
						}
					}

					assert.isTrue(passed);
					deferred[passed ? 'resolve' : 'reject']();
				}

				store.fetch({
					sort: [{attribute: 'value'}],
					onComplete: completed,
					onError: deferred.reject
				});
			},

			'Read API: errorCondition_idCollision_inMemory': function () {
				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 12345, value: 'foo'},
								{uniqueId: 123456, value: 'bar'},
								{uniqueId: 12345, value: 'boom'},
								{uniqueId: 123457, value: 'bit'}
							]
						}
					}),
					deferred = this.async();

				store.fetch({
					onComplete: deferred.reject,
					onError: deferred.resolve
				});
			},

			'Read API: errorCondition_idCollision_xhr': function () {
				if (!has('host-browser')) { return; }

				var store = new Store({url: require.toUrl('./countries_idcollision.json')}),
					deferred = this.async();

				store.fetch({
					onComplete: deferred.reject,
					onError: deferred.resolve
				});
			},

			'Read API: Date_datatype': function () {
				var store = new Store(mockData('countries_withDates')),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					var independenceDate = store.getValue(item, 'independence');
					assert.isTrue(independenceDate instanceof Date);
					//Check to see if the value was deserialized properly.  Since the store stores in UTC/GMT, it
					//should also be compared in the UTC/GMT mode
					assert.isTrue(dojo.date.stamp.toISOString(independenceDate, {zulu:true}) === '1993-05-24T00:00:00Z');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'er',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: custom_datatype_Color_SimpleMapping': function () {
				var store = new Store({
						data: {
							identifier: 'name',
							items: [
								{name: 'Kermit', species: 'frog', color: {_type: 'Color', _value: 'green'}},
								{name: 'Beaker', hairColor: {_type:'Color', _value: 'red'}}
							]
						},
						typeMap:{'Color': dojo.Color}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					var hairColor = store.getValue(item, 'hairColor');
					assert.isTrue(hairColor instanceof dojo.Color);
					assert.strictEqual(hairColor.toHex(), '#ff0000');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'Beaker',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: custom_datatype_Color_GeneralMapping': function () {
				var store = new Store({
						data: {
							identifier: 'name',
							items: [
								{name: 'Kermit', species: 'frog', color: {_type: 'Color', _value: 'green'}},
								{name: 'Beaker', hairColor: {_type:'Color', _value: 'red'}}
							]
						},
						typeMap:{'Color': {
							type: dojo.Color,
							deserialize: function (value) {
								return new dojo.Color(value);
							}
						}}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					var hairColor = store.getValue(item, 'hairColor');
					assert.isTrue(hairColor instanceof dojo.Color);
					assert.strictEqual(hairColor.toHex(), '#ff0000');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'Beaker',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: custom_datatype_CustomObject 0 (False) value': function () {
				var store = new Store({
						data: {
							identifier: 'name',
							items: [
								{name: 'Bob', species: 'human', age: {_type: 'tests.data.Wrapper', _value: 0}},
								{name: 'Nancy', species: 'human', age: {_type: 'tests.data.Wrapper', _value: 32}}
							]
						},
						typeMap:{'tests.data.Wrapper': {
							type: tests.data.Wrapper,
							deserialize: function (value) {
								return new tests.data.Wrapper(value);
							}
						}}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					var age = store.getValue(item, 'age');
					assert.isTrue(age instanceof tests.data.Wrapper);
					assert.strictEqual(age.toString(), 'WRAPPER: [0]');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'Bob',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: custom_datatype_CustomObject Boolean False values': function () {
				var store = new Store({
						data: {
							identifier: 'name',
							items: [
								{name: 'Bob', isHuman: {_type: 'tests.data.Wrapper', _value: false}},
								{name: 'Nancy', isHuman: {_type: 'tests.data.Wrapper', _value: true}}
							]
						},
						typeMap:{'tests.data.Wrapper': {
							type: tests.data.Wrapper,
							deserialize: function (value) {
								return new tests.data.Wrapper(value);
							}
						}}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					var isHuman = store.getValue(item, 'isHuman');
					assert.isTrue(isHuman instanceof tests.data.Wrapper);
					assert.strictEqual(isHuman.toString(), 'WRAPPER: [false]');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'Bob',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: custom_datatype_CustomObject Empty String values': function () {
				var store = new Store({
						data: {
							identifier: 'name',
							items: [
								{name: 'Bob', lastName: {_type: 'tests.data.Wrapper', _value:''}},
								{name: 'Nancy', lastName: {_type: 'tests.data.Wrapper', _value: 'Doe'}}
							]
						},
						typeMap:{'tests.data.Wrapper': {
							type: tests.data.Wrapper,
							deserialize: function (value) {
								return new tests.data.Wrapper(value);
							}
						}}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					var lastName = store.getValue(item, 'lastName');
					assert.isTrue(lastName instanceof tests.data.Wrapper);
					assert.strictEqual(lastName.toString(), 'WRAPPER: []');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'Bob',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: custom_datatype_CustomObject explicit null values': function () {
				var store = new Store({
						data: {
							identifier: 'name',
							items: [
								{name: 'Bob', lastName: {_type: 'tests.data.Wrapper', _value: null}},
								{name: 'Nancy', lastName: {_type: 'tests.data.Wrapper', _value: 'Doe'}}
							]
						},
						typeMap:{'tests.data.Wrapper': {
							type: tests.data.Wrapper,
							deserialize: function (value) {
								return new tests.data.Wrapper(value);
							}
						}}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					var lastName = store.getValue(item, 'lastName');
					assert.isTrue(lastName instanceof tests.data.Wrapper);
					assert.strictEqual(lastName.toString(), 'WRAPPER: [null]');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'Bob',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: custom_datatype_CustomObject explicit undefined value': function () {
				var store = new Store({
						data: {
							identifier: 'name',
							items: [
								{name: 'Bob', lastName: {_type: 'tests.data.Wrapper', _value: undefined}},
								{name: 'Nancy', lastName: {_type: 'tests.data.Wrapper', _value: 'Doe'}}
							]
						},
						typeMap:{'tests.data.Wrapper': {
							type: tests.data.Wrapper,
							deserialize: function (value) {
								return new tests.data.Wrapper(value);
							}
						}}
					}),
					deferred = this.async();

				function onItem(item) {
					assert.isNotNull(item);
					var lastName = store.getValue(item, 'lastName');
					assert.isTrue(lastName instanceof tests.data.Wrapper);
					assert.strictEqual(lastName.toString(), 'WRAPPER: [undefined]');
					deferred.resolve();
				}

				store.fetchItemByIdentity({
					identity: 'Bob',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: hierarchical_data': function () {
				var store = new Store(mockData('geography_hierarchy_small')),
					deferred = this.async();

				function onComplete(items) {
					assert.lengthOf(items, 1);
					var northAmerica = items[0],
						canada = store.getValue(northAmerica, 'countries'),
						toronto = store.getValue(canada, 'cities');

					assert.strictEqual(store.getValue(canada, 'name'), 'Canada');
					assert.strictEqual(store.getValue(toronto, 'name'), 'Toronto');
					deferred.resolve();
				}

				store.fetch({
					query: {name: 'North America'},
					onComplete: onComplete,
					onError: deferred.reject
				});
			},

			'Read API: close (clearOnClose: true)': function () {
				if (!has('host-browser')) { return; }

				var params = mockData('countries');
				params.clearOnClose = true;
				params.urlPreventCache = true;
				var store = new Store(params),
					deferred = this.async();

				function onItem(item) {
					var error = null;
					try {
						assert.isNotNull(item);
						var ec = item,
							val = store.getValue(ec, 'name');
						assert.strictEqual(val, 'Ecuador');
						store.close();
						assert.lengthOf(store._arrayOfAllitems, 0);
						assert.isFalse(store._loadFinished);
					}catch (e){
						error = e;
					}
					deferred[error ? 'reject' : 'resolve']();
				}

				store.fetchItemByIdentity({
					identity: 'ec',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: close (clearOnClose: true, reset url.)': function () {
				if (!has('host-browser')) { return; }

				var params = mockData('countries');
				params.clearOnClose = true;
				params.urlPreventCache = true;
				var store = new Store(params),
					deferred = this.async();

				function onItem(item) {
					var error = null;

					function onItem2(item){
						var err;
						try {
							assert.isNotNUll(item);
                            var val = store.getValue(item, 'name');
                            assert.isNull(val);
						} catch (e) {
							err = e;
						}
						deferred[err ? 'reject' : 'resolve']();
					}

					try {
						assert.isNotNull(item);
						var ec = item,
							val = store.getValue(ec, 'name');
						assert.strictEqual(val, 'Ecuador');
						store.close();
						assert.lengthOf(store._arrayOfAllitems, 0);
						assert.isFalse(store._loadFinished);

						store.url = require.toUrl('./countries_withNull.json');
						store.fetchItemByIdentity({
							identity: 'ec',
							onItem: onItem2,
							onError: deferred.reject
						});
					} catch (e){
						error = e;
					}
					deferred[error ? 'reject' : 'resolve']();
				}

				store.fetchItemByIdentity({
					identity: 'ec',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: fetch, close (clearOnClose: true, reset url.)': function () {
				if (!has('host-browser')) { return; }

				var params = mockData('countries');
				params.clearOnClose = true;
				params.urlPreventCache = true;
				var store = new Store(params),
					deferred = this.async();

				function onItem(item) {
					var error = null;

					function onComplete(items){
						 var err;
						try{
							assert.lengthOf(items, 1);
							var item = items[0];
							assert.isNotNull(item);
							assert.isNotNull(store.getValue(item, 'name'));
						} catch (e) {
							err = e;
						}
						deferred[err ? 'reject' : 'resolve']();
					}

					try {
						assert.isNotNull(item);
						var ec = item,
							val = store.getValue(ec, 'name');
						assert.strictEqual(val, 'Ecuador');
						store.close();
						assert.lengthOf(store._arrayOfAllitems, 0);
						assert.isFalse(store._loadFinished);

						store.url = require.toUrl('./countries_withNull.json');
						store.fetch({
							query: {abbr: 'ec'},
							onComplete: onComplete,
							onError: deferred.reject
						});
					} catch (e){
						error = e;
					}
					deferred[error ? 'reject' : 'resolve']();
				}

				store.fetchItemByIdentity({
					identity: 'ec',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: close (clearOnClose: true, reset _jsonFileUrl.)': function () {
				if (!has('host-browser')) { return; }

				var params = mockData('countries');
				params.clearOnClose = true;
				params.urlPreventCache = true;
				var store = new Store(params),
					deferred = this.async();

				function onItem(item) {
					var error = null;

					function onItem2(item){
						var err;
						try{
							assert.isNotNull(item);
							assert.isNull(store.getValue(item, 'name'));
						}catch(e){
							err = e;
						}
						deferred[err ? 'reject' : 'resolve']();
					}

					try {
						assert.isNotNull(item);
						var ec = item,
							val = store.getValue(ec, 'name');
						assert.strictEqual(val, 'Ecuador');
						store.close();
						assert.lengthOf(store._arrayOfAllitems, 0);
						assert.isFalse(store._loadFinished);

						store.url = require.toUrl('./countries_withNull.json');
						store.fetchItemByIdentity({
							identity: 'ec',
							onComplete: onItem2,
							onError: deferred.reject
						});
					} catch (e){
						error = e;
					}
					deferred[error ? 'reject' : 'resolve']();
				}

				store.fetchItemByIdentity({
					identity: 'ec',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: close (clearOnClose: false)': function () {
				if (!has('host-browser')) { return; }

				var params = mockData('countries');
				params.urlPreventCache = true;
				var store = new Store(params),
					deferred = this.async();

				function onItem(item) {
					var error = null;
					try {
						assert.isNotNull(item);
						var ec = item,
							val = store.getValue(ec, 'name');
						assert.strictEqual(val, 'Ecuador');
						store.close();
						assert.notEqual(store._arrayOfAllitems.length, 0);
						assert.isTrue(store._loadFinished);
					}catch (e){
						error = e;
					}
					deferred[error ? 'reject' : 'resolve']();
				}

				store.fetchItemByIdentity({
					identity: 'ec',
					onItem: onItem,
					onError: deferred.reject
				});
			},

			'Read API: close (clearOnClose: true, reset data.)': function () {
				if (!has('host-browser')) { return; }

				var store = new Store({
						data: {
							identifier: 'uniqueId',
							items: [
								{uniqueId: 1, value: 'foo*bar'},
								{uniqueId: 2, value: 'bar*foo'},
								{uniqueId: 3, value: 'boomBam'},
								{uniqueId: 4, value: 'bit$Bite'},
								{uniqueId: 5, value: 'ouagadogou'},
								{uniqueId: 6, value: 'BaBaMaSaRa***Foo'},
								{uniqueId: 7, value: 'squawl'},
								{uniqueId: 8, value: 'seaweed'},
								{uniqueId: 9, value: 'jfq4@#!$!@Rf14r14i5u'}
							]
						}
					}),
					deferred = this.async();

				function firstComplete(items) {
					assert.lengthOf(items, 1);

					var firstItem = items[0];

					//Set the store clearing options and the new data
					store.clearOnClose = true;
					store.data = {
						identifier: 'uniqueId',
						items: [
							{uniqueId: 1, value: 'foo*bar'},
							{uniqueId: 2, value: 'bar*foo'},
							{uniqueId: 3, value: 'boomBam'},
							{uniqueId: 4, value: 'bit$Bite'},
							{uniqueId: 5, value: 'ouagadogou'},
							{uniqueId: 6, value: 'BaBaMaSaRa***Foo'},
							{uniqueId: 7, value: 'squawl'},
							{uniqueId: 8, value: 'seaweed'},
							{uniqueId: 9, value: 'jfq4@#!$!@Rf14r14i5u'}
						]
					};
					store.close();

					//Do the next fetch and verify that the next item you get is not
					//a reference to the same item (data cleared and reloaded.
					var secondComplete = function(items){
						try {
							assert.lengthOf(items.length, 1);
							var secondItem = items[0];
							assert.isNotNull(firstItem);
							assert.isNotNull(secondItem);
							assert.notEqual(firstItem, secondItem);
							deferred.resolve();
						} catch (e) {
							deferred.reject();
						}
					};
					store.fetch({
						query: {value: 'bar\*foo'},
						onComplete: secondComplete,
						onError: deferred.reject
					});
				}

				store.fetch({
					query: {value: 'bar\*foo'},
					onComplete: firstComplete,
					onError: deferred.reject
				});
			},

			'Identity API: no_identifier_specified': function () {
				var store = new Store({
						data: { 
							items: [
								{name: 'Kermit', color: 'green'},
								{name: 'Miss Piggy', likes: 'Kermit'},
								{name: 'Beaker', hairColor: 'red'}
							]
						}
					}),
					deferred = this.async();

				function onComplete(items) {
					assert.isTrue(Boolean(store.getFeatures()['dojo.data.api.Identity']));
					for (var i = 0; i < items.length; ++i) {
						var item = items[i];
						assert.isNull(store.getIdentityAttributes(item));
						assert.typeOf(store.getIdentity(item), 'number');
					}
					deferred.resolve();	
				}

				store.fetch({onComplete: onComplete, onError: deferred.reject});
			},

			'Identity API: hierarchical_data': function () {
				var store = new Store(mockData('geography_hierarchy_small')),
					deferred = this.async();

				function onComplete(items) {
					assert.isTrue(Boolean(store.getFeatures()['dojo.data.api.Identity']));
					for (var i = 0; i < items.length; ++i) {
						var item = items[i];
						assert.isNull(store.getIdentityAttributes(item));
						assert.typeOf(store.getIdentity(item), 'number');
					}
					deferred.resolve();	
				}

				store.fetch({onComplete: onComplete, onError: deferred.reject});
			}

		});
	};
});