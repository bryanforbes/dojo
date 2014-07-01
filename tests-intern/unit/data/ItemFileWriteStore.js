define([
	'intern!object',
	'intern/chai!assert',
	'./ItemFileReadTemplate',
	'dojo/data/ItemFileWriteStore',
	'dojo/main',
	'./mock/data',
	'dojo/data/api/Read',
	'dojo/data/api/Write',
	'dojo/data/api/Notification',
	'dojo/has',
	'dojo/date'
], function(registerSuite, assert, itemFileReadTests, ItemFileWriteStore, dojo, mockData,
	Read, Write, Notification, has, date) {
	
	// First, make sure all ItemFileReadStore superclass tests are OK
	itemFileReadTests('data/ItemFileWriteStore: Read & Identity', ItemFileWriteStore);
	
	registerSuite({
		name: 'data/ItemFileWriteStore: Write & Notification',

		'getFeatures': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				features = store.getFeatures(),
				callback = this.async(null, 4).callback(function () { });

			assert.isNotNull(features['dojo.data.api.Read']);
			assert.isNotNull(features['dojo.data.api.Identity']);
			assert.isNotNull(features['dojo.data.api.Write']);
			assert.isNotNull(features['dojo.data.api.Notification']);
			assert.isUndefined(features['foo.bar.nation']);

			for (var i in features) {
				assert.isTrue(i === 'dojo.data.api.Read' || i === 'dojo.data.api.Identity' || i === 'dojo.data.api.Write' || i === 'dojo.data.api.Notification');
				callback();
			}
		},
		
		'Write API: setValue': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onComplete(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'capital', 'Cairo'));
				assert.isFalse(store.isDirty(item));
				assert.isFalse(store.isDirty());
				store.setValues(item, 'capital', 'New Cairo');
				assert.isTrue(store.isDirty(item));
				assert.isTrue(store.isDirty());
				assert.strictEqual(store.getValue(item, 'capital').toString(), 'New Cairo');
				deferred.resolve();
			}
			store.fetch({
				query: {
					name: 'Egypt'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: setValues': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onComplete(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'name', 'Egypt'));
				assert.isFalse(store.isDirty(item));
				assert.isFalse(store.isDirty());
				store.setValues(item, 'name', ['Egypt 1', 'Egypt 2']);
				assert.isTrue(store.isDirty(item));
				assert.isTrue(store.isDirty());
				var values = store.getValues(item, 'name');
				assert.strictEqual(values[0], 'Egypt 1');
				assert.strictEqual(values[1], 'Egypt 2');
				deferred.resolve();
			}
			store.fetch({
				query: {
					name: 'Egypt'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: unsetAttribute': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onComplete(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'name', 'Egypt'));
				assert.isFalse(store.isDirty(item));
				assert.isFalse(store.isDirty());
				store.unsetAttribute(item, 'name');
				assert.isTrue(store.isDirty(item));
				assert.isTrue(store.isDirty());
				assert.isFalse(store.hasAttribute(item, 'name'));
				deferred.resolve();
			}
			store.fetch({
				query: {
					name: 'Egypt'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: newItem': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async(),
				onNewInvoked = false;
			assert.isFalse(store.isDirty());
			store.onNew = function(newItem, parentInfo) {
				assert.isNotNull(newItem);
				assert.isNull(parentInfo);
				assert.isTrue(store.isItem(newItem));
				onNewInvoked = true;
			};
			var canada = store.newItem({
				name: 'Canada',
				abbr: 'ca',
				capital: 'Ottawa'
			});
			assert.isTrue(onNewInvoked);
			assert.isTrue(store.isDirty(canada));
			assert.isTrue(store.isDirty());
			assert.strictEqual(store.getValue(canada, 'name'), 'Canada');

			function onComplete(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'name', 'Canada'));
				deferred.resolve();
			}
			store.fetch({
				query: {
					name: 'Canada'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: newItem with parent': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();
			assert.isFalse(store.isDirty());
			var onComplete = function(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'name', 'Egypt'));
				var onNewInvoked = false;
				store.onNew = function(newItem, parentInfo) {
					assert.deepEqual(item, parentInfo.item);
					assert.strictEqual('cities', parentInfo.attribute);
					assert.isUndefined(parentInfo.oldValue);
					assert.strictEqual(parentInfo.newValue, newItem);
					onNewInvoked = true;
				};
				//Attach an onSet and verify onSet is NOT called in this case.
				store.onSet = deferred.reject;
				store.newItem({
					name: 'Cairo',
					abbr: 'Cairo'
				}, {
					parent: item,
					attribute: 'cities'
				});
				assert.isTrue(onNewInvoked);

				function onCompleteNewItemShallow(items) {
					assert.lengthOf(items, 0);

					function onCompleteNewItemDeep(items) {
						assert.lengthOf(items, 1);
						assert.strictEqual('Cairo', store.getValue(items[0], 'name'));
						deferred.resolve();
					}
					//Do a deep search now, should find the new item of the city with name attribute Cairo.
					store.fetch({
						query: {
							name: 'Cairo'
						},
						onComplete: onCompleteNewItemDeep,
						onError: deferred.reject,
						queryOptions: {
							deep: true
						}
					});
				}
				store.fetch({
					query: {
						name: 'Cairo'
					},
					onComplete: onCompleteNewItemShallow,
					onError: deferred.reject
				});
			};
			store.fetch({
				query: {
					name: 'Egypt'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: newItem with parent multiple': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();
			assert.isFalse(store.isDirty());
			var onComplete = function(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'name', 'Egypt'));
				store.onNew = function(newItem, parentInfo) {
					assert.deepEqual(item, parentInfo.item);
					assert.strictEqual('cities', parentInfo.attribute);
					assert.isUndefined(parentInfo.oldValue);
					assert.strictEqual(parentInfo.newValue, newItem);
				};
				var newItem1 = store.newItem({
					name: 'Cairo',
					abbr: 'Cairo'
				}, {
					parent: item,
					attribute: 'cities'
				});
				store.onNew = function(newItem, parentInfo) {
					assert.deepEqual(item, parentInfo.item);
					assert.strictEqual('cities', parentInfo.attribute);
					assert.strictEqual(parentInfo.oldValue, newItem1);
					assert.strictEqual(parentInfo.newValue[0], newItem1);
					assert.strictEqual(parentInfo.newValue[1], newItem);
				};
				var newItem2 = store.newItem({
					name: 'Banha',
					abbr: 'Banha',
				}, {
					parent: item,
					attribute: 'cities'
				});
				store.onNew = function(newItem, parentInfo) {
					assert.deepEqual(item, parentInfo.item);
					assert.strictEqual('cities', parentInfo.attribute);
					assert.strictEqual(parentInfo.oldValue[0], newItem1);
					assert.strictEqual(parentInfo.oldValue[1], newItem2);
					assert.strictEqual(parentInfo.newValue[0], newItem1);
					assert.strictEqual(parentInfo.newValue[1], newItem2);
					assert.strictEqual(parentInfo.newValue[2], newItem);
				};
				store.newItem({
					name: 'Damanhur',
					abbr: 'Damanhur',
				}, {
					parent: item,
					attribute: 'cities'
				});
				deferred.resolve();
			};
			store.fetch({
				query: {
					name: 'Egypt'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: deleteItem': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onComplete(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'name', 'Egypt'));
				assert.isFalse(store.isDirty(item));
				assert.isFalse(store.isDirty());
				store.deleteItem(item);
				assert.isTrue(store.isDirty(item));
				assert.isTrue(store.isDirty());
				var onCompleteToo = function(itemsToo) {
					assert.lengthOf(itemsToo, 0);
					deferred.resolve();
				};
				store.fetch({
					query: {
						name: 'Egypt'
					},
					onComplete: onCompleteToo,
					onError: deferred.reject
				});
			}
			store.fetch({
				query: {
					name: 'Egypt'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: isDirty': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onComplete(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'name', 'Egypt'));
				store.setValue(item, 'name', 'Egypt 2');
				assert.strictEqual(store.getValue(item, 'name'), 'Egypt 2');
				assert.isTrue(store.isDirty(item));
				deferred.resolve();
			}
			store.fetch({
				query: {
					name: 'Egypt'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: revert': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onComplete(items) {
				assert.lengthOf(items, 1);
				var item = items[0];
				assert.isTrue(store.containsValue(item, 'name', 'Egypt'));
				assert.isFalse(store.isDirty(item));
				assert.isFalse(store.isDirty());
				store.setValue(item, 'name', 'Egypt 2');
				assert.strictEqual(store.getValue(item, 'name'), 'Egypt 2');
				assert.isTrue(store.isDirty(item));
				assert.isTrue(store.isDirty());
				store.revert();
				var onCompleteToo = function(itemsToo) {
					assert.lengthOf(itemsToo, 1);
					assert.isTrue(store.containsValue(itemsToo[0], 'name', 'Egypt'));
					deferred.resolve();
				};
				store.fetch({
					query: {
						name: 'Egypt'
					},
					onComplete: onCompleteToo,
					onError: deferred.reject
				});
			}
			store.fetch({
				query: {
					name: 'Egypt'
				},
				onComplete: onComplete,
				onError: deferred.reject
			});
		},
		
		'Write API: save': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onItem(item) {
				store.setValue(item, 'capital', 'New Cairo');
				store.save({
					onComplete: deferred.resolve,
					onError: deferred.reject
				});
			}
			store.fetchItemByIdentity({
				identity: 'eg',
				onItem: onItem,
				onError: deferred.reject
			});
		},
		
		'Write API: save (verify state)': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onItem(item) {
				store.setValue(item, 'capital', 'New Cairo');

				function onComplete() {
					//Check internal state.  Note:  Users should NOT do this, this is a UT verification
					//of internals in this case.  Ref tracker: #4394
					assert.isFalse(store._saveInProgress);
					deferred.resolve();
				}
				store.save({
					onComplete: onComplete,
					onError: deferred.reject
				});
			}
			store.fetchItemByIdentity({
				identity: 'eg',
				onItem: onItem,
				onError: deferred.reject
			});
		},
		
		'Write API: save (save everything)': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async(),
				egypt;
			store._saveEverything = function(saveCompleteCallback, saveFailedCallback, newFileContentString) {
				var struct = dojo.fromJson(newFileContentString);
				assert.strictEqual(struct.identifier, store.getIdentityAttributes(egypt)[0]);
				assert.strictEqual(struct.label, store.getLabelAttributes(egypt)[0]);
				assert.lengthOf(struct.items, 7);
				var cloneStore = new ItemFileWriteStore({
					data: struct
				});
				var onItemClone = function(itemClone) {
					var egyptClone = itemClone;
					assert.strictEqual(store.getIdentityAttributes(egypt)[0], cloneStore.getIdentityAttributes(egyptClone)[0]);
					assert.strictEqual(store.getLabelAttributes(egypt)[0], cloneStore.getLabelAttributes(egyptClone)[0]);
					assert.strictEqual(store.getValue(egypt, 'name'), cloneStore.getValue(egyptClone, 'name'));
				};
				cloneStore.fetchItemByIdentity({
					identity: 'eg',
					onItem: onItemClone,
					onError: deferred.reject
				});
				saveCompleteCallback();
			};
			var onItem = function(item) {
				egypt = item;
				store.setValue(egypt, 'capital', 'New Cairo');
				store.save({
					onComplete: deferred.resolve,
					onError: deferred.reject
				});
			};
			store.fetchItemByIdentity({
				identity: 'eg',
				onItem: onItem,
				onError: deferred.reject
			});
		},
		
		'Write API: save (save everything, no hierarchy)': function() {
			var store = new ItemFileWriteStore(mockData('geography_hierarchy_small')),
				deferred = this.async(),
				africa;
			store.hierarchical = false;
			store._saveEverything = function(saveCompleteCallback, saveFailedCallback, newFileContentString) {
				var struct = dojo.fromJson(newFileContentString);
				assert.lengthOf(struct.items, 3);
				var cloneStore = new ItemFileWriteStore({
					data: struct,
					hierarchical: false
				});
				var onItemClone = function(items) {
					assert.strictEqual(store.getValue(africa, 'name'), cloneStore.getValue(items[0], 'name'));
				};
				cloneStore.fetch({
					query: {
						name: 'Africa'
					},
					onComplete: onItemClone,
					onError: deferred.reject,
					queryOptions: {
						deep: true
					}
				});
				saveCompleteCallback();
			};
			var onComplete = function(items) {
				africa = items[0];
				store.setValue(africa, 'size', 'HUGE!');
				store.save({
					onComplete: deferred.resolve,
					onError: deferred.reject
				});
			};
			store.fetch({
				query: {
					name: 'Africa'
				},
				onComplete: onComplete,
				onError: deferred.reject,
				queryOptions: {
					deep: true
				}
			});
		},
		
		'Write API: save (save everything with datatype)': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();
			store._saveEverything = function(saveCompleteCallback, saveFailedCallback, newFileContentString) {
				var dataset = dojo.fromJson(newFileContentString),
					newStore = new ItemFileWriteStore({
						data: dataset
					});

				function gotItem(item) {
					var independenceDate = newStore.getValue(item, 'independence');
					assert.isTrue(independenceDate instanceof Date);
					assert.strictEqual(date.compare(new Date(1993, 4, 24), independenceDate, 'date'), 0);
					saveCompleteCallback();
				}
				newStore.fetchItemByIdentity({
					identity: 'eg',
					onItem: gotItem,
					onError: deferred.reject
				});
			};
			var onItem = function(item) {
				store.setValue(item, 'independence', new Date(1993, 4, 24));
				store.save({
					onComplete: deferred.resolve,
					onError: deferred.reject
				});
			};
			store.fetchItemByIdentity({
				identity: 'eg',
				onItem: onItem,
				onError: deferred.reject
			});
		},
		
		'Write API: save (save everything with color type simple)': function() {
			var customTypeMap = {
				'Color': dojo.Color
			},
				store = new ItemFileWriteStore({
					data: {
						identifier: 'name',
						items: [{
							name: 'Kermit',
							species: 'frog',
							color: {
								_type: 'Color',
								_value: 'green'
							}
						}, {
							name: 'Beaker',
							hairColor: {
								_type: 'Color',
								_value: 'red'
							}
						}]
					},
					typeMap: customTypeMap
				}),
				deferred = this.async();
			store._saveEverything = function(saveCompleteCallback, saveFailedCallback, newFileContentString) {
				//Now load the new data into a datastore and validate that it stored the Color right.
				var dataset = dojo.fromJson(newFileContentString),
					newStore = new ItemFileWriteStore({
						data: dataset,
						typeMap: customTypeMap
					});

				function gotItem(item) {
					var hairColor = newStore.getValue(item, 'hairColor');
					assert.isTrue(hairColor instanceof dojo.Color);
					assert.strictEqual(hairColor.toString(), 'rgba(255, 255, 0, 1)');
					saveCompleteCallback();
				}
				newStore.fetchItemByIdentity({
					identity: 'Animal',
					onItem: gotItem,
					onError: deferred.reject
				});
			};
			store.newItem({
				name: 'Animal',
				hairColor: new dojo.Color('yellow')
			});
			store.save({
				onComplete: deferred.resolve,
				onError: deferred.reject
			});
		},
		
		'Write API: save (save everything with color type general)': function() {
			var customTypeMap = {
				'Color': {
					type: dojo.Color,
					deserialize: function(value) {
						return new dojo.Color(value);
					},
					serialize: function(obj) {
						return obj.toString();
					}
				}
			},
				store = new ItemFileWriteStore({
					data: {
						identifier: 'name',
						items: [{
							name: 'Kermit',
							species: 'frog',
							color: {
								_type: 'Color',
								_value: 'green'
							}
						}, {
							name: 'Beaker',
							hairColor: {
								_type: 'Color',
								_value: 'red'
							}
						}]
					},
					typeMap: customTypeMap
				}),
				deferred = this.async();
			store._saveEverything = function(saveCompleteCallback, saveFailedCallback, newFileContentString) {
				//Now load the new data into a datastore and validate that it stored the Color right.
				var dataset = dojo.fromJson(newFileContentString),
					newStore = new ItemFileWriteStore({
						data: dataset,
						typeMap: customTypeMap
					});

				function gotItem(item) {
					var hairColor = newStore.getValue(item, 'hairColor');
					assert.isTrue(hairColor instanceof dojo.Color);
					assert.strictEqual(hairColor.toString(), 'rgba(255, 255, 0, 1)');
					saveCompleteCallback();
				}
				newStore.fetchItemByIdentity({
					identity: 'Animal',
					onItem: gotItem,
					onError: deferred.reject
				});
			};
			store.newItem({
				name: 'Animal',
				hairColor: new dojo.Color('yellow')
			});
			store.save({
				onComplete: deferred.resolve,
				onError: deferred.reject
			});
		},
		
		'Write API: newItem revert': function() {
			var store = new ItemFileWriteStore({
				data: {
					label: 'name',
					items: [{
						name: 'Ecuador',
						capital: 'Quito'
					}, {
						name: 'Egypt',
						capital: 'Cairo'
					}, {
						name: 'El Salvador',
						capital: 'San Salvador'
					}, {
						name: 'Equatorial Guinea',
						capital: 'Malabo'
					}, {
						name: 'Eritrea',
						capital: 'Asmara'
					}, {
						name: 'Estonia',
						capital: 'Tallinn'
					}, {
						name: 'Ethiopia',
						capital: 'Addis Ababa'
					}]
				}
			});
			var newCountry = store.newItem({
				name: 'Utopia',
				capitol: 'Perfect'
			});
			//DO NOT ACCESS THIS WAY.  THESE ARE INTERNAL VARIABLES.  DOING THIS FOR TEST PURPOSES.
			var itemEntryNum = newCountry[store._itemNumPropName];
			assert.strictEqual(store._arrayOfAllItems[itemEntryNum], newCountry);
			store.revert();
			assert.isNull(store._arrayOfAllItems[itemEntryNum], null);
		},
		
		'Write API: newItem modify revert': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async;
			assert.isFalse(store.isDirty());
			var intialFetch = function(items) {
				var initialCount = items.length,
					canada = store.newItem({
						name: 'Canada',
						abbr: 'ca',
						capital: 'Ottawa'
					});
				store.setValue(canada, 'someattribute', 'modified a new item!');
				var afterNewFetch = function(items) {
					var afterNewCount = items.length;
					assert.strictEqual(afterNewCount, (initialCount + 1));
					store.revert();
					var afterRevertFetch = function(items) {
						assert.lengthOf(items, initialCount);
						deferred.resolve();
					};
					store.fetch({
						onComplete: afterRevertFetch,
						onError: deferred.reject
					});
				};
				store.fetch({
					onComplete: afterNewFetch,
					onError: deferred.reject
				});
			};
			store.fetch({
				onComplete: intialFetch,
				onError: deferred.reject
			});
		},
		
		'Write API: newItem modify delete revert': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async,
				found = false,
				i;
			assert.isFalse(store.isDirty());
			var intialFetch = function(items) {
				var initialCount = items.length,
					canada = store.newItem({
						name: 'Canada',
						abbr: 'ca',
						capital: 'Ottawa'
					});
				store.setValue(canada, 'someattribute', 'modified a new item!');
				var afterNewFetch = function(items) {
					assert.lengthOf(items, initialCount + 1);
					store.deleteItem(canada);
					var afterDeleteFetch = function(items) {
						assert.lengthOf(items, initialCount);
						for (i = 0; i < items.length; i++) {
							found = (store.getIdentity(items[i]) === 'ca');
							if (found) {
								break;
							}
						}
						if (found) {
							deferred.errback(new Error('Error: Found the supposedly deleted item!'));
						} else {
							store.revert();
							var afterRevertFetch = function(items) {
								assert.lengthOf(items, initialCount);
								for (i = 0; i < items.length; i++) {
									found = (store.getIdentity(items[i]) === 'ca');
									if (found) {
										break;
									}
								}
								deferred[found ? 'reject' : 'resolve']();
							};
							store.fetch({
								onComplete: afterRevertFetch,
								onError: deferred.reject
							});
						}
					};
					store.fetch({
						onComplete: afterDeleteFetch,
						onError: deferred.reject
					});
				};
				store.fetch({
					onComplete: afterNewFetch,
					onError: deferred.reject
				});
			};
			store.fetch({
				onComplete: intialFetch,
				onError: deferred.reject
			});
		},
		
		'Write API: onSet': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = new this.async();

			function onItem(fetchedItem) {
				var egypt = fetchedItem,
					connectHandle = null;

				function setValueHandler(item, attribute, oldValue, newValue) {
					assert.isTrue(store.isItem(item));
					assert.strictEqual(item, egypt);
					assert.strictEqual(attribute, 'capital');
					assert.strictEqual(oldValue, 'Cairo');
					assert.strictEqual(newValue, 'New Cairo');
					deferred.resolve();
					dojo.disconnect(connectHandle);
				}
				connectHandle = dojo.connect(store, 'onSet', setValueHandler);
				store.setValue(egypt, 'capital', 'New Cairo');
			}
			store.fetchItemByIdentity({
				identity: 'eg',
				onItem: onItem,
				onError: deferred.reject
			});
		},
		
		'Write API: onNew': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = new this.async(),
				connectHandle = null;

			function newItemHandler(item) {
				assert.isTrue(store.isItem(item));
				assert.strictEqual(store.getValue(item, 'name'), 'Canada');
				deferred.callback(true);
				dojo.disconnect(connectHandle);
			}
			connectHandle = dojo.connect(store, 'onNew', newItemHandler);
			store.newItem({
				name: 'Canada',
				abbr: 'ca',
				capital: 'Ottawa'
			});
		},
		
		'Write API: onDelete': function() {
			var store = new ItemFileWriteStore(mockData('countries')),
				deferred = this.async();

			function onItem(fetchedItem) {
				var egypt = fetchedItem,
					connectHandle = null;

				function deleteItemHandler(item) {
					assert.isFalse(store.isItem(item));
					assert.strictEqual(item, egypt);
					deferred.resolve();
					dojo.disconnect(connectHandle);
				}
				connectHandle = dojo.connect(store, 'onDelete', deleteItemHandler);
				store.deleteItem(egypt);
			}
			store.fetchItemByIdentity({
				identity: 'eg',
				onItem: onItem,
				onError: deferred.reject
			});
		},
		
		'Read API: Read Function Conformance': function () {
			var testStore = new ItemFileWriteStore(mockData('countries')),
				readApi = new Read(),
				passed = true;

			for (var functionName in readApi) {
				var member = readApi[functionName];
				if (typeof member === 'function'){
					var testStoreMember = testStore[functionName];
					if (typeof testStoreMember !== 'function') {
						passed = false;
						break;
					}
				}
			}

			assert.isTrue(passed);
		},
		
		'Read API: Write Function Conformance': function () {
			var testStore = new ItemFileWriteStore(mockData('countries')),
				readApi = new Write(),
				passed = true;

			for (var functionName in readApi) {
				var member = readApi[functionName];
				if (typeof member === 'function'){
					var testStoreMember = testStore[functionName];
					if (typeof testStoreMember !== 'function') {
						passed = false;
						break;
					}
				}
			}

			assert.isTrue(passed);
		},
		
		'Read API: Notification Function Conformance': function () {
			var testStore = new ItemFileWriteStore(mockData('countries')),
				readApi = new Notification(),
				passed = true;

			for (var functionName in readApi) {
				var member = readApi[functionName];
				if (typeof member === 'function'){
					var testStoreMember = testStore[functionName];
					if (typeof testStoreMember !== 'function') {
						passed = false;
						break;
					}
				}
			}

			assert.isTrue(passed);
		},

		'Identity API: no identifier specified': function () {
			var store = new ItemFileWriteStore({
					data: {
						label: 'name',
						items: [
							{name: 'Ecuador', capital: 'Quito'},
							{name: 'Egypt', capital: 'Cairo'},
							{name: 'El Salvador', capital: 'San Salvador'},
							{name: 'Equatorial Guinea', capital: 'Malabo'},
							{name: 'Eritrea', capital: 'Asmara'},
							{name: 'Estonia', capital:' Tallinn'},
							{name: 'Ethiopia', capital: 'Addis Ababa'}
						]
					}
				}),
				deferred = new this.async();

			
			var onComplete = function(items) {
				assert.lengthOf(items, 7);

				var lastItem = items[(items.length - 1)];

				store.deleteItem(lastItem);
				store.newItem({name: 'Canada', capital: 'Ottawa'});

				var onCompleteAgain = function(itemsAgain) {
					assert.lengthOf(itemsAgain, 7);
					var identitiesInUse = {};
					for (var i = 0; i < itemsAgain.length; ++i) {
						var item = itemsAgain[i],
							id = store.getIdentity(item);
						if (identitiesInUse.hasOwnProperty(id)) {
							deferred.reject();
						} else {
							identitiesInUse[id] = item;
						}
					}
					deferred.resolve();
				};
				store.fetch({onComplete: onCompleteAgain, onError: deferred.reject});
			};

			store.fetch({onComplete: onComplete, onError: deferred.reject});
		},

		'Identity API: no identifier specified revert': function () {
			var store = new ItemFileWriteStore({
					data: {
						label: 'name',
						items: [
							{name: 'Ecuador', capital: 'Quito'},
							{name: 'Egypt', capital: 'Cairo'},
							{name: 'El Salvador', capital: 'San Salvador'},
							{name: 'Equatorial Guinea', capital: 'Malabo'},
							{name: 'Eritrea', capital: 'Asmara'},
							{name: 'Estonia', capital:' Tallinn'},
							{name: 'Ethiopia', capital: 'Addis Ababa'}
						]
					}
				}),
				deferred = new this.async();

			
			var onComplete = function(items) {
				assert.lengthOf(items, 7);

				var lastItem = items[(items.length - 1)];

				store.deleteItem(lastItem);
				store.newItem({name: 'Canada', capital: 'Ottawa'});

				var onCompleteAgain = function(itemsAgain) {
					assert.lengthOf(itemsAgain, 7);
					var identitiesInUse = {};
					for (var i = 0; i < itemsAgain.length; ++i) {
						var item = itemsAgain[i],
							id = store.getIdentity(item);
						if (identitiesInUse.hasOwnProperty(id)) {
							deferred.reject();
						} else {
							identitiesInUse[id] = item;
						}
					}
					store.revert();

					var revertComplete = function(itemsReverted) {
						assert.lengthOf(itemsReverted, 7);
						deferred.resolve();
					};
					store.fetch({onComplete: revertComplete, onError: deferred.reject});
				};
				store.fetch({onComplete: onCompleteAgain, onError: deferred.reject});
			};

			store.fetch({onComplete: onComplete, onError: deferred.reject});
		},

		'Reference Integrity: check references': function () {
			var store = new ItemFileWriteStore(mockData('reference_integrity')),
				deferred = new this.async();

			var onComplete = function(items) {
				var item10 = null,
					item1  = null,
					item3  = null,
					item5  = null;

				var i;
				for (i = 0; i < items.length; i++){
					var ident = store.getIdentity(items[i]);
					if (ident === 10){
						item10 = items[i];
					}else if (ident === 1){
						item1 = items[i];
					}else if (ident === 3){
						item3 = items[i];
					}else if (ident === 5){
						item5 = items[i];
					}
				}
				var friends = store.getValues(item10, 'friends');
				assert.isNotNull(friends);
				assert.isNotUndefined(friends);
				assert.isTrue(store.isItem(item10));
				assert.isTrue(store.isItem(item1));
				assert.isTrue(store.isItem(item3));
				assert.isTrue(store.isItem(item5));

				var found = 0;
				try{
					for (i = 0; i < friends.length; i++){
						if (i === 0){
							assert.isTrue(store.isItem(friends[i]));
							assert.strictEqual(friends[i], item1);
							assert.strictEqual(store.getIdentity(friends[i]), 1);
							found++;
						}else if (i === 1){
							assert.isTrue(store.isItem(friends[i]));
							assert.strictEqual(friends[i], item3);
							assert.strictEqual(store.getIdentity(friends[i]), 3);
							found++;
						}else if (i === 2){
							assert.isTrue(store.isItem(friends[i]));
							assert.strictEqual(friends[i], item5);
							assert.strictEqual(store.getIdentity(friends[i]), 5);
							found++;
						}
					}
				}catch(e){
					deferred.reject();
				}
				assert.strictEqual(found, 3);
				deferred.reject();
			};

			store.fetch({onError: deferred.reject, onComplete: onComplete});
		},

		'Reference Integrity: delete reference item': function () {
			var store = new ItemFileWriteStore(mockData('reference_integrity')),
				deferred = new this.async();

			function verifyRefDelete(items) {
				var passed = true;
				for(var i = 0; i < items.length; i++){
					var curItem = items[i],
						attributes = store.getAttributes(curItem);
					for(var j = 0; j < attributes.length; j++){
						var values = store.getValues(curItem, attributes[j]),
							badRef = false;
						for(var k = 0; k < values.length; k++){
							var value = values[k];
							try{
								var id = store.getIdentity(value);
								if (id === 10) {
									badRef = true;
									break;
								}
							}catch(e){/*Not an item, even a dead one, just eat it.*/}
						}
						if (badRef){
							deferred.reject();
							passed = false;
							break;
						}
					}
				}
				if (passed){
					deferred.callback(true);
				}
			}

			function onItem(item) {
				try {
					store.deleteItem(item);
					
					store.fetch({onComplete: verifyRefDelete, onError: deferred.reject});
				}catch(error){
					deferred.reject();
				}
			}

			store.fetchItemByIdentity({identity: 10, onError: deferred.reject, onItem: onItem});
			
		},

		'Reference Integrity: delete reference item revert': function () {
			var store = new ItemFileWriteStore(mockData('reference_integrity')),
				deferred = new this.async();

			function onItem(item) {
				try{
					store._dumpReferenceMap();
					var beforeDelete = dojo.toJson(item[store._reverseRefMap]);
					store.deleteItem(item);
					store._dumpReferenceMap();
					dojo.toJson(item[store._reverseRefMap]);
					store.revert();
					store._dumpReferenceMap();
					var afterRevert = dojo.toJson(item[store._reverseRefMap]);
					assert.strictEqual(afterRevert, beforeDelete);
				}catch(e){
					deferred.reject();
				}
				deferred.resolve();
			}

			store.fetchItemByIdentity({identity: 10, onError: deferred.reject, onItem: onItem});
		},

		'Reference Integrity: delete multiple item revert': function () {
			var store = new ItemFileWriteStore(mockData('countries_references')),
				deferred = new this.async();

			function onItem(item){
				assert.isTrue(store.isItem(item));
				var egypt = item;

				function onItem2(item){
					assert.isTrue(store.isItem(item));
					var nairobi = item;

					store.deleteItem(egypt);
					store.deleteItem(nairobi);
					try{
						store.revert();
						store.fetch({
							query: {name: '*'},
							start: 0,
							count: 20,
							onComplete: deferred.resolve,
							onError: deferred.reject
						});
					}catch(e){
						deferred.errback(e);
					}
				}

				store.fetchItemByIdentity({
					identity: 'Nairobi',
					onError: deferred.reject,
					onItem: onItem2
				});
			}

			store.fetchItemByIdentity({
				identity: 'Egypt',
				onError: deferred.reject,
				onItem: onItem
			});
		},

		'Reference Integrity: delete item by attribute': function () {
			var store = new ItemFileWriteStore(mockData('reference_integrity')),
				deferred = new this.async();

			function onItem(item){
				try{
					store.setValues(item, 'friends', [null]);

					function onItem2(item10){
						var refMap = item10[store._reverseRefMap];
						store._dumpReferenceMap();
						assert.isNull(refMap['11'].friends);
						store.setValues(item, 'siblings', [0, 1, 2]);
						assert.isNull(refMap['11']);
						deferred.resolve();
					}
					
					store.fetchItemByIdentity({identity: 10, onError: deferred.reject, onItem: onItem2});

				}catch(e){
					deferred.reject();
				}
			}

			store.fetchItemByIdentity({identity: 11, onError: deferred.reject, onItem: onItem});
		},

		'Reference Integrity: delete referenced item non parent': function () {
			var store = new ItemFileWriteStore(mockData('reference_integrity')),
				deferred = new this.async();

			function onItem(item){
				try{
					store.deleteItem(item);
					function verifyRefDelete(items){
						var passed = true;
						for(var i = 0; i < items.length; i++){
							var curItem = items[i];
							var attributes = store.getAttributes(curItem);
							for(var j = 0; j < attributes.length; j++){
								var values = store.getValues(curItem, attributes[j]);
								var badRef = false;
								for(var k = 0; k < values.length; k++){
									var value = values[k];
									try{
										var id = store.getIdentity(value);
										if (id === 16){
											badRef = true;
											break;
										}
									}catch(e){/*Not an item, even a dead one, just eat it.*/}
								}
								if (badRef){
									deferred.reject();
									passed = false;
									break;
								}
							}
						}
						if (passed){
							deferred.resolve();
						}
					}
					store.fetch({onComplete: verifyRefDelete, onError: deferred.reject});
				}catch(error){
					deferred.reject();
				}
			}

			store.fetchItemByIdentity({identity: 16, onError: deferred.reject, onItem: onItem});
		},

		'Reference Integrity: add reference to attribute': function () {
			var store = new ItemFileWriteStore(mockData('reference_integrity')),
				deferred = new this.async();

			function onComplete(items){
				assert.lengthOf(items, 2);

				var item1 = items[0],
					item2 = items[1];

				store.setValue(item1, 'siblings', item2);
				assert.isNotNull(item2[store._reverseRefMap]);
				assert.isNotNull(item2[store._reverseRefMap][store.getIdentity(item1)].siblings);
				deferred.resolve();
			}

			store.fetch({onError: deferred.reject, onComplete: onComplete});
		},

		'Reference Integrity: new item with parent references': function () {
			var store = new ItemFileWriteStore(mockData('reference_integrity')),
				deferred = new this.async();

			function onItem(item) {
				try{
					var newItem = store.newItem({
						id: 17,
						name: 'Item 17'
					}, {
						parent: item,
						attribute: 'uncles'
					});
					
					var refs = newItem[store._reverseRefMap];
					assert.isNotNull(refs['10'].uncles);
				}catch(e){
					deferred.reject();
				}
				deferred.resolve();
			}
			store.fetchItemByIdentity({identity: 10, onError: deferred.reject, onItem: onItem});
		},

		'Reference Integrity: new item with reference to existing item': function () {
			var store = new ItemFileWriteStore(mockData('reference_integrity')),
				deferred = new this.async();
			
			function onItem(item) {
				try{
					store.newItem({id: 17, name: 'Item 17', friends: [item]});
					var refs = item[store._reverseRefMap];

					assert.isNotNull(refs['17'].friends);
				}catch(e){
					deferred.reject();
				}
				deferred.resolve();
			}
			store.fetchItemByIdentity({identity: 10, onError: deferred.reject, onItem: onItem});
		},

		'Reference Integrity: disable reference integrity': function () {
			var params = mockData('reference_integrity');
			params.referenceIntegrity = false;
			var store = new ItemFileWriteStore(params),
				deferred = new this.async();

			function onItem(item) {
				deferred[item[store._reverseRefMap] === undefined ? 'resolve' : 'reject']();
			}

			store.fetchItemByIdentity({identity: 10, onError: deferred.reject, onItem: onItem});
		},

		'Read API: close dirty failure': function () {
			if (!has('host-browser')) { return; }

			var params = mockData('countries');
			params.clearOnClose = true;
			params.urlPreventCache = true;
			var store = new ItemFileWriteStore(params),
				deferred = this.async();

			var onItem = function(item) {
				var error = null;
				try {
					assert.isNotNull(item);
					assert.strictEqual(store.getValue(item, 'name'), 'Ecuador');
					store.newItem({abbr: 'foo', name: 'bar'});
					store.close();
				}catch (e){
					error = e;
				}
				deferred[error ? 'resolve' : 'reject']();
			};

			store.fetchItemByIdentity({
				identity: 'ec',
				onItem: onItem,
				onError: deferred.reject
			});
		}

	});
});