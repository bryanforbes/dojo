define([
	'intern!object',
	'intern/chai!assert',
	'dojo/on',
	'intern/dojo/Evented',
	'intern/dojo/_base/array',		// Using in-test version of dojo because intern's version doesn't include array utils
	'intern/dojo/has',
	'intern/dojo/has!host-browser?intern/dojo/dom-construct',
	'intern/dojo/domReady!'
], function (registerSuite, assert, on, Evented, arrayUtil, has, domConstruct) {

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

	var suite = {
		name: 'dojo/on',

		afterEach: function () {
			while (handles.length > 0) {
				handles.pop().remove();
			}
		}
	};

	function createCommonTests(createTarget) {
		var target;
		return {
			beforeEach: function () {
				target = createTarget();
			},

			'on and on.emit': function () {
				var listenerCallCount = 0,
					emittedEvent;

				on(target, 'test', function (actualEvent) {
					listenerCallCount++;
					assert.strictEqual(actualEvent.value, emittedEvent.value);
				});

				emittedEvent = { value: 'foo' };
				on.emit(target, 'test', emittedEvent);
				assert.strictEqual(listenerCallCount, 1);

				emittedEvent = { value: 'bar' };
				on.emit(target, 'test', emittedEvent);
				assert.strictEqual(listenerCallCount, 2);
			},

			'on.emit return value': function () {
				assert.isFalse(!on.emit(target, 'test', { cancelable: false }));
				assert.isTrue(on.emit(target, 'test', { cancelable: true }));

				on(target, 'test', function (event) {
					event.preventDefault();
				});
				assert.isFalse(on.emit(target, 'test', { cancelable: true }));
			},

			'on - multiple event names': function () {
				var listenerCallCount = 0,
					emittedEventType,
					emittedEvent;

				on(target, 'test1, test2', function (actualEvent) {
					listenerCallCount++;
					assert.strictEqual(actualEvent.type, emittedEventType);
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

			'on - extension event': function () {
				var listenerCallCount = 0,
					emittedEvent,
					extensionEvent = function (target, listener) {
						return on(target, 'test', listener);
					};

				on(target, extensionEvent, function (actualEvent) {
					listenerCallCount++;
					assert.strictEqual(actualEvent.value, emittedEvent.value);
				});

				emittedEvent = { value: 'foo' };
				on.emit(target, 'test', emittedEvent);
				assert.strictEqual(listenerCallCount, 1);

				emittedEvent = { value: 'bar' };
				on.emit(target, 'test', emittedEvent);
				assert.strictEqual(listenerCallCount, 2);
			},

			'on.pausable': function () {
				var listenerCallCount = 0,
					handle = on.pausable(target, 'test', function () {
						listenerCallCount++;
					});

				on.emit(target, 'test', {});
				assert.strictEqual(listenerCallCount, 1);

				handle.pause();
				on.emit(target, 'test', {});
				assert.strictEqual(listenerCallCount, 1);

				handle.resume();
				on.emit(target, 'test', {});
				assert.strictEqual(listenerCallCount, 2);
			},

			'on.once': function () {
				var listenerCallCount = 0;

				on(target, 'test', function () {
					++listenerCallCount;
				});

				assert.strictEqual(listenerCallCount, 0);
				on.emit('test', {});
				assert.strictEqual(listenerCallCount, 1);
				on.emit('test', {});
				assert.strictEqual(listenerCallCount, 1);
			},

			'event.preventDefault': function () {
				var lastEvent;
				on(target, 'test', function (event) {
					event.preventDefault();
					lastEvent = event;
				})
				assert.isDefined(lastEvent);
				assert.isTrue('defaultPrevented' in lastEvent ? lastEvent.defaultPrevented : !lastEvent.returnValue);
			},

			'event.stopImmediatePropagation': function () {
				on(target, 'test', function(event){
					event.stopImmediatePropagation();
				});

				var afterStop = false;
				on(target, 'test', function(event){
					afterStop = true;
				});

				on.emit(target, 'test', {});
				assert.isFalse(afterStop, 'expected no other listener to be called');
			},

			'listener call order': function () {
				// TODO: This is a straight copy from the DOH-based 'object' test. Convert it
				var order = [];
				var obj = new Evented();
				obj.oncustom = function(event){
					order.push(event.a);
					return event.a+1;
				};
				var signal = on.pausable(obj, "custom", function(event){
					order.push(0);
					return event.a+1;
				});
				obj.oncustom({a:0});
				var signal2 = on(obj, "custom, foo", function(event){
					order.push(event.a);
				});
				on.emit(obj, "custom", {
					a: 3
				});
				signal.pause();
				var signal3 = on(obj, "custom", function(a){
					order.push(3);
				}, true);
				on.emit(obj, "custom", {
					a: 3
				});
				signal2.remove();
				signal.resume();
				on.emit(obj, "custom", {
					a: 6
				});
				signal3.remove();
				var signal4 = on(obj, "foo, custom", function(a){
					order.push(4);
				}, true);
				signal.remove();
				on.emit(obj, "custom", {
					a: 7
				});
				t.is(order, [0,0,3,0,3,3,3,3,6,0,3,7,4]);

			}
		};
	}

	suite['common tests'] = {
		'object events': createCommonTests(function () {
			return new Evented;
		})
	};

	if (has('host-browser')) {
		suite['common tests']['DOM events'] = createCommonTests(function () {
			return domConstruct.create('div');
		});

		// TODO: Consider renaming to containerDiv and childSpan to help make the tests more readable
		var containerNode,
			childNode;
		suite['DOM-specific tests'] = {

			'beforeEach': function () {
				containerNode = domConstruct.create('div', null, document.body);
				childNode = domConstruct.create('span', null, containerNode);
			},
			'afterEach': function () {
				domConstruct.destroy(containerNode);
				containerNode = childNode = null;
			},

			'on.selector and extension events': function () {
				childNode.setAttribute("foo", 2);
				var order = [];
				var customEvent = function(target, listener){
					return on(target, "custom", listener);
				};
				on(containerNode, customEvent, function(event){
					order.push(event.a);
				});
				on(containerNode, on.selector("span", customEvent), function(event){
					order.push(+this.getAttribute("foo"));
				});
				on.emit(containerNode, "custom", {
					a: 0
				});
				// should trigger selector
				assert.isTrue(on.emit(childNode, "custom", {
					a: 1,
					bubbles: true,
					cancelable: true
				}));
				// shouldn't trigger selector
				assert.isTrue(on.emit(containerNode, "custom", {
					a: 3,
					bubbles: true,
					cancelable: true
				}));
				assert.deepEqual(order, [0, 1, 2, 3]);
			},

			'listener call order': function () {
				var expectedOrder = [ 1, 2, 3 ],
					actualOrder = [];

				arrayUtil.forEach(expectedOrder, function (number) {
					on(containerNode, 'click', function () {
						actualOrder.push(number);
					});
				});
				containerNode.click();

				assert.deepEqual(actualOrder, expectedOrder, 'listeners were not called in the order added');
			},

			'event.preventDefault - native event': function () {
				var button = domConstruct.create('button', null, containerNode),
					defaultPrevented = false;

				on(containerNode, 'click', function(event){
					event.preventDefault();
					defaultPrevented = 'defaultPrevented' in event ? event.defaultPrevented : !event.returnValue;
				});

				button.click();
				assert.isTrue(defaultPrevented);
			},

				// TODO: This is likely a bug we've been supporting with tests. preventDefault shouldn't stop bubbling
				/*'synthetic event': function () {
					// TODO

					// make sure that evt.defaultPrevented gets set for synthetic events too
					signal = on(childNode, 'click', function(event){
						event.preventDefault();
					});
					signal2 = on(containerNode, 'click', function(event){
						signal2Fired = true;
						defaultPrevented = event.defaultPrevented;
					});
					signal2Fired = false;
					on.emit(button, 'click', {bubbles: true, cancelable: true});
					t.t(signal2Fired, 'bubbled synthetic event on div');
					t.t(defaultPrevented, 'defaultPrevented set for synthetic event on div');
					signal.remove();
					signal2.remove();
				}*/

			'emitting events from document and window': function () {
				// make sure 'document' and 'window' can also emit events
				var eventEmitted;
				var iframe = domConstruct.place('<iframe></iframe>', document.body);
				var globalObjects = [document, window, iframe.contentWindow, iframe.contentDocument || iframe.contentWindow.document];
				for(var i = 0, len = globalObjects.length; i < len; i++) {
					eventEmitted = false;
					on(globalObjects[i], 'custom-test-event', function () {
						eventEmitted = true;
					});
					on.emit(globalObjects[i], 'custom-test-event', {});
					t.is(true, eventEmitted);
				}
			},

			'event delegation': {
				'CSS selector': function () {
					var button = domConstruct.create('button', null, childNode);

					var actualEvent;
					on(containerNode, 'button:click', function(event){
						actualEvent = event;
					});
					assert.ok(actualEvent);
				},

				'listening on document': function () {
					var button = domConstruct.create('button', null, childNode);

					var actualEvent;
					on(document, 'button:click', function (event) {
						actualEvent = event;
					});
					assert.ok(actualEvent);
				},

				'CSS selector and text node target': function () {
					childNode.className = 'textnode-parent';
					childNode.innerHTML = 'text';

					var actualEvent;
					on(containerNode, '.textnode-parent:click', function (event) {
						actualEvent = event;
					});

					on.emit(childNode.firstChild, 'click', { bubbles: true, cancelable: true });
					assert.ok(actualEvent);
				},

				'custom selector': function () {
					var button = domConstruct.create('button', null, childNode);

					var actualEvent;
					on(containerNode, on.selector(function (node) {
						return node.tagName == 'BUTTON';
					}, 'click'), function (event) {
						actualEvent = event;
					});

					button.click();
					assert.ok(actualEvent);

					// TODO: What is the point of this?
					on(childNode, 'propertychange', function(){}); // make sure it doesn't throw an error
				}

				// on.selector - DOM-specific TODO
			},

			'event propagation': {

				// TODO: Is this actually for synthetic events emitted on DOM nodes?
				'native event bubbling': function () {
					var button = domConstruct.create('button', null, childNode),
						eventBubbled = false;

					on(containerNode, 'click', function(event){
						eventBubbled = true;
					});

					button.click();
					assert.isTrue(eventBubbled, 'expected event to bubble');
				},

				'event.stopPropagation': function () {
					// TODO:
				}
			},

			'event augmentation': function () {
				var button = domConstruct.create('button', null, containerNode);
				on(button, 'click', function(event){
					event.modified = true;
					event.test = 3;
				});
				var testValue;
				on(containerNode, 'click', function(event){
					testValue = event.test;
				});
				button.click();
				assert.strictEqual(testValue, 3);
			}
		};

		has('touch') && (suite['DOM events']['touch event normalization'] = function () {
			var div = document.body.appendChild(document.createElement('div'));
			on(div, 'touchstart', function (event) {
				assert.property(event, 'rotation');
				assert.property(event, 'pageX');
			});
			on.emit(div, 'touchstart', {changedTouches: [{pageX:100}]});
		});
	}

	registerSuite(suite);
});
