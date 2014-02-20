define([
	'intern!object',
	'intern/chai!assert',
	'dojo/on',
	'intern/dojo/Evented',
	'intern/dojo/_base/array',	// Using in-test version of dojo because intern's version doesn't include array utils
	'intern/dojo/has',
	'intern/dojo/has!host-browser?intern/dojo/dom-construct',
	'intern/dojo/has!host-browser?intern/dojo/mouse',
	'intern/dojo/has!host-browser?dojo/query',	// included to test on.selector. using in-test version of dojo
												// because dojo/on relies on a global dojo.query not in intern's version
	'intern/dojo/domReady!'
], function (registerSuite, assert, on, Evented, arrayUtil, has, domConstruct, mouse) {

	var handles = [];

	var originalOn = on;
	on = function () {
		var handle = originalOn.apply(null, arguments);
		handles.push(handle);
		return handle;
	};
	for (var key in originalOn) {
		on[key] = originalOn[key];
	}

	function cleanUpListeners() {
		while (handles.length > 0) {
			handles.pop().remove();
		}
	}

	function createCommonTests(args) {
		var target,
			testEventName = args.eventName;
		return {
			beforeEach: function () {
				target = args.createTarget();
			},
			afterEach: function () {
				// This would ideally be specified in a suite-wide afterEach,
				// but Safari throws exceptions if listener clean-up occurs after DOM nodes are destroyed
				cleanUpListeners();

				args.destroyTarget && args.destroyTarget(target);
			},

			'on and on.emit': function () {
				var listenerCallCount = 0,
					emittedEvent;

				on(target, testEventName, function (actualEvent) {
					listenerCallCount++;
					assert.strictEqual(actualEvent.value, emittedEvent.value);
				});

				emittedEvent = { value: 'foo' };
				on.emit(target, testEventName, emittedEvent);
				assert.strictEqual(listenerCallCount, 1);

				emittedEvent = { value: 'bar' };
				on.emit(target, testEventName, emittedEvent);
				assert.strictEqual(listenerCallCount, 2);
			},

			'.emit return value': function () {
				// TODO: Run jshint on this code w/ our official config
				var returnValue = on.emit(target, testEventName, { cancelable: false });
				assert.propertyVal(returnValue, 'cancelable', false);

				returnValue = on.emit(target, testEventName, { cancelable: true });
				assert.propertyVal(returnValue, 'cancelable', true);

				on(target, testEventName, function (event) {
					if ('preventDefault' in event) {
						event.preventDefault();
					}
					else {
						event.cancelable = false;
					}
				});
				assert.isFalse(on.emit(target, testEventName, { cancelable: true }));
			},

			'on - multiple event names': function () {
				var listenerCallCount = 0,
					emittedEventType,
					emittedEvent;

				on(target, 'test1, test2', function (actualEvent) {
					listenerCallCount++;
					if (emittedEventType in actualEvent) {
						assert.strictEqual(actualEvent.type, emittedEventType);
					}
					assert.strictEqual(actualEvent.value, emittedEvent.value);
				});

				emittedEventType = 'test1';
				emittedEvent = { value: 'foo' };
				on.emit(target, emittedEventType, emittedEvent);
				assert.strictEqual(listenerCallCount, 1);

				emittedEventType = 'test2';
				emittedEvent = { value: 'bar' };
				on.emit(target, emittedEventType, emittedEvent);
				assert.strictEqual(listenerCallCount, 2);
			},

			'on - extension events': function () {
				var listenerCallCount = 0,
					emittedEvent,
					extensionEvent = function (target, listener) {
						return on(target, testEventName, listener);
					};

				on(target, extensionEvent, function (actualEvent) {
					listenerCallCount++;
					assert.strictEqual(actualEvent.value, emittedEvent.value);
				});

				emittedEvent = { value: 'foo' };
				on.emit(target, testEventName, emittedEvent);
				assert.strictEqual(listenerCallCount, 1);

				emittedEvent = { value: 'bar' };
				on.emit(target, testEventName, emittedEvent);
				assert.strictEqual(listenerCallCount, 2);
			},

			'.pausable': function () {
				var listenerCallCount = 0,
					handle = on.pausable(target, testEventName, function () {
						listenerCallCount++;
					});

				on.emit(target, testEventName, {});
				assert.strictEqual(listenerCallCount, 1);

				handle.pause();
				on.emit(target, testEventName, {});
				assert.strictEqual(listenerCallCount, 1);

				handle.resume();
				on.emit(target, testEventName, {});
				assert.strictEqual(listenerCallCount, 2);
			},

			'.once': function () {
				var listenerCallCount = 0;

				on.once(target, testEventName, function () {
					++listenerCallCount;
				});

				assert.strictEqual(listenerCallCount, 0);
				on.emit(target, testEventName, {});
				assert.strictEqual(listenerCallCount, 1);
				on.emit(target, testEventName, {});
				assert.strictEqual(listenerCallCount, 1);
			},

			'listener call order': function () {
				var order = [],
					onMethodName = 'on' + testEventName;

				target[onMethodName] = function (event) {
					order.push(event.a);
				};
				var signal = on.pausable(target, testEventName, function () {
					order.push(1);
				});
				var signal2 = on(target, testEventName + ', foo', function (event) {
					order.push(event.a);
				});
				on.emit(target, testEventName, {
					a: 3
				});
				signal.pause();
				var signal3 = on(target, testEventName, function () {
					order.push(3);
				}, true);
				on.emit(target, testEventName, {
					a: 3
				});
				signal2.remove();
				signal.resume();
				on.emit(target, testEventName, {
					a: 6
				});
				signal3.remove();
				on(target, 'foo, ' + testEventName, function () {
					order.push(4);
				}, true);
				signal.remove();
				on.emit(target, testEventName, {
					a: 7
				});
				assert.deepEqual(order,  [ 3, 1, 3, 3, 3, 3, 6, 1, 3, 7, 4 ]);
			}
		};
	}

	var suite = {
		name: 'dojo/on',

		common: {
			'object events': createCommonTests({
				eventName: 'test',
				createTarget: function () {
					return new Evented();
				}
			})
			// TODO: Test syntheticStopPropagation
			// TODO: Test `if(!evt){return evt;}`, mouseout/mouseover normalization, keyCode normalization, and preventDefault in _fixEvent
			// TODO: Test touch-related sections
		},

		'cannot target non-emitter': function () {
			var threwError = false;
			try {
				var nonEmitter = {};
				on(nonEmitter, 'test', function () {});
			}
			catch (err) {
				threwError = true;
			}
			assert.isTrue(threwError);
		}
	};

	if (has('host-browser')) {
		suite.common['DOM events'] = createCommonTests({
			eventName: 'click',
			createTarget: function () {
				return domConstruct.create('div', null, document.body);
			},
			destroyTarget: function (target) {
				domConstruct.destroy(target);
			}
		});

		// TODO: Consider renaming to containerDiv and childSpan to help make the tests more readable
		var containerNode,
			childNode;
		suite['DOM-specific'] = {

			'beforeEach': function () {
				containerNode = domConstruct.create('div', null, document.body);
				childNode = domConstruct.create('span', null, containerNode);
			},
			'afterEach': function () {
				cleanUpListeners();

				domConstruct.destroy(containerNode);
				containerNode = childNode = null;
			},

			'event.preventDefault': {
				'native event': function () {
					var defaultPrevented = false;

					on(childNode, 'click', function (event) {
						event.preventDefault();
						defaultPrevented = event.defaultPrevented;
					});

					childNode.click();
					assert.isTrue(defaultPrevented);
				},
				'synthetic event': function () {
					var secondListenerCalled = false,
						defaultPrevented = false;
					on(childNode, 'click', function (event) {
						event.preventDefault();
					});
					on(containerNode, 'click', function (event) {
						secondListenerCalled = true;
						defaultPrevented = event.defaultPrevented;
					});
					on.emit(childNode, 'click', {bubbles: true, cancelable: true});
					assert.isTrue(secondListenerCalled, 'bubbled synthetic event on div');
					assert.isTrue(defaultPrevented, 'defaultPrevented set for synthetic event on div');
				}
			},

			'event bubbling': function () {
				var eventBubbled = false;

				on(containerNode, 'click', function () {
					eventBubbled = true;
				});

				childNode.click();
				assert.isTrue(eventBubbled, 'expected event to bubble');
			},

			'event.stopPropagation': function () {
				var eventBubbled = false;

				on(containerNode, 'click', function () {
					eventBubbled = true;
				});
				on(childNode, 'click', function (event) {
					event.stopPropagation();
				});

				childNode.click();
				assert.isFalse(eventBubbled, 'expected event not to bubble');
			},


			'event.stopImmediatePropagation': function () {
				on(childNode, 'click', function (event) {
					event.stopImmediatePropagation();
				});

				var afterStop = false;
				on(childNode, 'click', function () {
					afterStop = true;
				});

				childNode.click();
				assert.isFalse(afterStop, 'expected no other listener to be called');
			},

			'emitting events from document and window': function () {
				// make sure 'document' and 'window' can also emit events
				var eventEmitted;
				var iframe = domConstruct.place('<iframe></iframe>', containerNode);
				var globalObjects = [
					document, window, iframe.contentWindow, iframe.contentDocument || iframe.contentWindow.document
				];
				for (var i = 0, len = globalObjects.length; i < len; i++) {
					eventEmitted = false;
					on(globalObjects[i], 'custom-test-event', function () {
						eventEmitted = true;
					});
					on.emit(globalObjects[i], 'custom-test-event', {});
					assert.isTrue(eventEmitted);
				}
			},

			'event delegation': {
				'CSS selector': function () {
					var button = domConstruct.create('button', null, childNode);

					var listenerCalled = false;
					on(containerNode, 'button:click', function () {
						listenerCalled = true;
					});
					button.click();
					assert.isTrue(listenerCalled);
				},

				'listening on document': function () {
					var button = domConstruct.create('button', null, childNode);

					var listenerCalled = false;
					on(document, 'button:click', function () {
						listenerCalled = true;
					});
					button.click();
					assert.isTrue(listenerCalled);
				},

				'CSS selector and text node target': function () {
					childNode.className = 'textnode-parent';
					childNode.innerHTML = 'text';

					var listenerCalled;
					on(containerNode, '.textnode-parent:click', function () {
						listenerCalled = true;
					});

					on.emit(childNode.firstChild, 'click', { bubbles: true, cancelable: true });
					assert.isTrue(listenerCalled);
				},

				'custom selector': function () {
					var button = domConstruct.create('button', null, childNode);

					var listenerCalled = false;
					on(containerNode, on.selector(function (node) {
						return node.tagName === 'BUTTON';
					}, 'click'), function () {
						listenerCalled = true;
					});

					button.click();
					assert.isTrue(listenerCalled);
				},

				'on.selector and extension events': {
					'basic extension events': function () {
						childNode.setAttribute('foo', 2);
						var order = [];
						var customEvent = function (node, listener) {
							return on(node, 'custom', listener);
						};
						on(containerNode, customEvent, function (event) {
							order.push(event.a);
						});
						on(containerNode, on.selector('span', customEvent), function () {
							order.push(+this.getAttribute('foo'));
						});
						on.emit(containerNode, 'custom', {
							a: 0
						});
						// should trigger selector
						on.emit(childNode, 'custom', {
							a: 1,
							bubbles: true,
							cancelable: true
						});
						// shouldn't trigger selector
						on.emit(containerNode, 'custom', {
							a: 3,
							bubbles: true,
							cancelable: true
						});
						assert.deepEqual(order, [0, 1, 2, 3]);
					},

					'extension events with bubbling forms': function () {
						var listenerCalled = false,
							bubbleListenerCalled = false;

						var customEvent = function (node, listener) {
							return on(node, 'custom', listener);
						};
						// simply test that an extension event's bubble method is applied if it exists
						customEvent.bubble = function (select) {
							return function (node, listener) {
								return customEvent(node, function (event) {
									bubbleListenerCalled = true;

									if (select(event.target)) {
										listener(event);
									}
								});
							};
						};

						on(containerNode, on.selector('span', customEvent), function () {
							listenerCalled = true;
						});
						on.emit(childNode, 'custom', { bubbles: true });
						assert.isTrue(listenerCalled);
						assert.isTrue(bubbleListenerCalled);
					}
				}
			},

			'event augmentation': function () {
				var button = domConstruct.create('button', null, containerNode);
				on(button, 'click', function (event) {
					event.modified = true;
					event.test = 3;
				});
				var testValue;
				on(containerNode, 'click', function (event) {
					testValue = event.test;
				});
				button.click();
				assert.strictEqual(testValue, 3);
			}
		};

		has('touch') && (suite['DOM-specific']['touch event normalization'] = function () {
			var div = document.body.appendChild(document.createElement('div'));
			on(div, 'touchstart', function (event) {
				assert.property(event, 'rotation');
				assert.property(event, 'pageX');
			});
			on.emit(div, 'touchstart', { changedTouches: [{ pageX: 100 }] });
		});
	}

	registerSuite(suite);
});
