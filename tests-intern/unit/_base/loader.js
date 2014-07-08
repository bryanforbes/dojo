define([
	'intern!object',
	'intern/chai!assert',
	'dojo/dom-construct',
	'dojo/has',
	'dojo/_base/lang',
	'dojo/Deferred',
	'dojo/promise/all',
	'dojo/_base/url',
	'require',
	'dojo/has!dojo-amd-factory-scan?./loader/modules',
	'dojo/has!dojo-publish-privates?./loader/moduleIds'
], function (registerSuite, assert, domConstruct, has, lang, Deferred, all, url, require) {
	// These tests all initialize the dojo loader in an iframe and then run tests on the resulting context.

	var iframe;
	var baseUrl;

	// creates a deferred with Intern-like callback and rejectOnError methods
	function createDeferred() {
		var dfd = new Deferred();

		dfd.callback = function (callback) {
			var self = this;
			return self.rejectOnError(function () {
				callback.apply(this, arguments);
				self.resolve();
			});
		};

		// Wraps a callback to reject the deferred if the callback throws an Error.
		dfd.rejectOnError = function (callback) {
			var self = this;
			return function () {
				try {
					callback.apply(this, arguments);
				}
				catch (error) {
					self.reject(error);
				}
			};
		};

		return dfd;
	}

	// test equality of items from different contexts
	function itemsAreEqual(item1, item2) {
		if (lang.isArray(item1)) {
			return arraysAreEqual(item1, item2);
		}
		if (lang.isObject(item1)) {
			return objectsAreEqual(item1, item2);
		}
		return item1 === item2;
	}

	// test equality of arrays from different contexts
	function arraysAreEqual(array1, array2) {
		if (array1.length !== array2.length) {
			return false;
		}

		for (var i = 0; i < array1.length; i++) {
			if (!itemsAreEqual(array1[i], array2[i])) {
				return false;
			}
		}

		return true;
	}

	// test equality of objects from different contexts
	function objectsAreEqual(object1, object2) {
		for (var k in object1) {
			if (!itemsAreEqual(object1[k], object2[k])) {
				return false;
			}
		}

		return true;
	}

	// Create a test for an initialization document. The document will be loaded in an iframe, and then the test will be
	// executed. The test will use the iframe's global object as `this` and will be passed any arguments received by the
	// initialization deferred's resolve method.
	//
	// Note that the initialization deferred's value is assumed to be an array of arguments.
	//
	function createTest(url, test, testArgs) {
		return function () {
			var dfd = this.async();
			var iframeDfd = window.loaderTestDfd = new Deferred();

			if (testArgs) {
				window.loaderTestArgs = testArgs;
			}

			// use the __files root to prevent the loaded pages from being instrumented by Intern
			iframe.src = '/__files' + require.toUrl(url);

			iframeDfd.then(function (value) {
				try {
					var returnValue = test.apply(iframe.contentWindow, value);
					if (returnValue && returnValue.then) {
						returnValue.then(dfd.resolve, dfd.reject);
					}
					else {
						dfd.resolve();
					}
				}
				catch (e) {
					dfd.reject(e);
				}
			});
		};
	}

	var suite = {
		name: 'dojo/_base/loader',

		setup: function () {
			iframe = domConstruct.toDom('<iframe style="width:400px;height:400px"></iframe>');
			document.body.appendChild(iframe);

			var base = location.href.split('__intern')[0];
			baseUrl = window.loaderTestBaseUrl = base + require.toUrl('.');
		},

		afterEach: function () {
			window.loaderTestDfd = undefined;
			window.loaderTestArgs = undefined;
		},

		teardown: function () {
			document.body.removeChild(iframe);
			window.loaderTestBaseUrl = undefined;
		},

		'async with Dojo require': createTest('./loader/asyncWithDojoRequire.html', function () {
			assert.strictEqual(this.syncFromAsyncModule, 'OK');
		}),

		'config': (function () {
			function createConfigTest(search, configName) {
				return createTest('./loader/config.html?' + search, function () {
					var config = this[configName];
					var require = this.require;
					var dfd = createDeferred();

					require([ 'dojo', 'dojo/has' ], dfd.callback(function (dojo, has) {
						assert.strictEqual(require.rawConfig.baseUrl, config.baseUrl);
						assert.strictEqual(require.rawConfig.waitSeconds, config.waitSeconds);
						assert.strictEqual(require.rawConfig.locale, config.locale);
						assert.strictEqual(require.rawConfig.has, config.has);
						assert.strictEqual(require.rawConfig.cats, config.cats);
						assert.strictEqual(require.rawConfig.a, config.a);
						assert.ok(arraysAreEqual(require.rawConfig.b, config.b));

						assert.strictEqual(require.baseUrl, config.baseUrl + '/');
						for (var key in config.has) {
							assert.ok(has(key));
						}
						assert.isUndefined(require.cats);
						assert.isUndefined(require.a);
						assert.isUndefined(require.b);

						assert.strictEqual(dojo.config.baseUrl, config.baseUrl + '/');
						assert.strictEqual(dojo.config.waitSeconds, config.waitSeconds);
						assert.strictEqual(dojo.config.locale, config.locale);
						assert.strictEqual(dojo.config.cats, config.cats);
						assert.strictEqual(dojo.config.a, config.a);
						assert.ok(arraysAreEqual(dojo.config.b, config.b));
					}));

					return dfd.promise;
				});
			}

			var testDescriptions = [
				{ search: 'djConfig', configName: '_djConfig' },
				{ search: 'djConfig-require', configName: '_djConfig' },
				{ search: 'dojoConfig', configName: '_dojoConfig' },
				{ search: 'dojoConfig-djConfig', configName: '_dojoConfig' },
				{ search: 'dojoConfig-djConfig-require', configName: '_dojoConfig' },
				{ search: 'dojoConfig-require', configName: '_dojoConfig' },
				{ search: 'require', configName: '_require' }
			];
			var tests = {};
			var test;

			while ((test = testDescriptions.shift())) {
				tests[test.search] = createConfigTest(test.search, test.configName);
			}
			
			return tests;
		})(),

		'config sniff': createTest('./loader/config-sniff.html', function () {
			var require = this.require;
			var dfd = createDeferred();

			require([ 'dojo' ], dfd.callback(function (dojo) {
				// show that sniff overrides dojoConfig
				assert.equal(require.rawConfig.async, true);
				assert.strictEqual(require.rawConfig.baseUrl, '../../../..');
				assert.strictEqual(require.rawConfig.waitSeconds, 6);
				assert.strictEqual(require.rawConfig.cats, 'dojo-config-dogs');
				assert.strictEqual(require.rawConfig.a, 2);
				assert.ok(arraysAreEqual(require.rawConfig.b, [ 3, 4, 5 ]));

				assert.equal(require.async, true);
				assert.strictEqual(require.baseUrl, '../../../../');
				assert.isUndefined(require.cats);
				assert.isUndefined(require.a);
				assert.isUndefined(require.b);

				assert.strictEqual(dojo.config.baseUrl, '../../../../');
				assert.strictEqual(dojo.config.cats, 'dojo-config-dogs');
				assert.strictEqual(dojo.config.a, 2);
				assert.ok(arraysAreEqual(dojo.config.b, [ 3, 4, 5 ]));
			}));

			return dfd.promise;
		}),

		'config sniff djConfig': createTest('./loader/config-sniff-djConfig.html', function () {
			var require = this.require;
			var dfd = createDeferred();

			require([ 'dojo' ], dfd.callback(function (dojo) {
				// show that sniff overrides dojoConfig
				assert.equal(require.rawConfig.async, true);
				assert.strictEqual(require.rawConfig.baseUrl, '../../../..');
				assert.strictEqual(require.rawConfig.waitSeconds, 6);
				assert.strictEqual(require.rawConfig.cats, 'dojo-config-dogs');
				assert.strictEqual(require.rawConfig.a, 2);
				assert.ok(arraysAreEqual(require.rawConfig.b, [ 3, 4, 5 ]));

				assert.equal(require.async, true);
				assert.strictEqual(require.baseUrl, '../../../../');
				assert.isUndefined(require.cats);
				assert.isUndefined(require.a);
				assert.isUndefined(require.b);

				assert.strictEqual(dojo.config.baseUrl, '../../../../');
				assert.strictEqual(dojo.config.cats, 'dojo-config-dogs');
				assert.strictEqual(dojo.config.a, 2);
				assert.ok(arraysAreEqual(dojo.config.b, [ 3, 4, 5 ]));
			}));

			return dfd.promise;
		}),

		'config has': createTest('./loader/config-has.html', function () {
			var require = this.require;
			var dfd = createDeferred();

			require([ 'dojo/has' ], dfd.callback(function (has) {
				assert.strictEqual(require.rawConfig.someConfigSwitch, 0);
				assert.strictEqual(require.rawConfig.isDebug, 1);
				assert.strictEqual(require.rawConfig.anotherConfigSwitch, 2);

				assert.strictEqual(has('config-someConfigSwitch'), 0);
				assert.strictEqual(has('config-isDebug'), 1);
				assert.strictEqual(has('config-anotherConfigSwitch'), 2);
				assert.strictEqual(has('some-has-feature'), 5);

				// setting an existing config variable after boot does *not* affect the has cache
				require({ someConfigSwitch: 3 });
				assert.strictEqual(require.rawConfig.someConfigSwitch, 3);
				assert.strictEqual(has('config-someConfigSwitch'), 0);

				// but, we can add new configfeatures any time
				require({ someNewConfigSwitch: 4 });
				assert.strictEqual(require.rawConfig.someNewConfigSwitch, 4);
				assert.strictEqual(has('config-someNewConfigSwitch'), 4);

				// setting an existing has feature via config after boot does *not* affect the has cache
				require({ has: { 'some-has-feature': 6 } });
				assert.strictEqual(has('some-has-feature'), 5);

				// setting an existing has feature via has.add does *not* affect the has cache...
				has.add('some-has-feature', 6);
				assert.strictEqual(has('some-has-feature'), 5);

				// ...*unless* you use force...
				has.add('some-has-feature', 6, 0, 1);
				assert.strictEqual(has('some-has-feature'), 6);

				// but, we can add new has features any time
				require({ has: { 'some-new-has-feature': 7 } });
				assert.strictEqual(has('some-new-has-feature'), 7);
			}));

			return dfd.promise;
		}),

		'declare steps on provide': createTest('./loader/declareStepsOnProvide.html', function () {
			var require = this.require;
			var dfd = createDeferred();

			require([
				'dojo',
				'dojo/tests-intern/unit/_base/loader/declareStepsOnProvideAmd'
			], dfd.callback(function (dojo, DeclareStepsOnProvide) {
				var instance = new DeclareStepsOnProvide();
				assert.strictEqual(instance.status(), 'OK');

				// requiring dojo/tests/_base/loader/declareStepsOnProvideAmd caused
				// dojo/tests/_base/loader/declareStepsOnProvide to load which loaded *two* modules 
				// and dojo.declare stepped on both of them
				instance = new (require('dojo/tests-intern/unit/_base/loader/declareStepsOnProvide1'))();
				assert.strictEqual(instance.status(), 'OK-1');
			}));

			return dfd.promise;
		}),

		'publish require result': (function () {
			function doTest() {
				var dojo = this.dojo;
				var require = this.require;
				var dfd = createDeferred();
				var self = this;

				dojo.setObject('dojo.tests._base.loader.pub1', 'do-not-mess-with-me');
				dojo.require('dojo.tests._base.loader.pub1');
				dojo.require('dojo.tests._base.loader.pub2');

				require([ 'dojo/has' ], dfd.callback(function (has) {
					assert.strictEqual(dojo.tests._base.loader.pub1, 'do-not-mess-with-me');

					if (self.publishing) {
						assert.ok(has('config-publishRequireResult'));
						assert.strictEqual(dojo.tests._base.loader.pub2.status, 'ok');
					}
					else {
						assert.ok(!has('config-publishRequireResult'));
						assert.ok(!dojo.config.publishRequireResult);
						assert.strictEqual(dojo.tests._base.loader.pub2.status, undefined);
					}
				}));

				return dfd.promise;
			}

			return {
				'publish': createTest('./loader/publishRequireResult.html', doTest),
				'no publish': createTest('./loader/publishRequireResult.html?do-not-publish', doTest)
			};
		})(),

		'top level module by paths': createTest('./loader/paths.html', function () {
			var require = this.require;
			var define = this.define;

			var myModule1Value = {};
			var myModule2Value = {};

			define('myModule1', [], myModule1Value);
			define('myModule2', [], myModule2Value);

			require({
				aliases:[
					// yourModule --> myModule1
					[ 'yourModule', 'myModule1' ],
		
					// yourOtherModule --> myModule1						
					[ /yourOtherModule/, 'myModule1' ],
		
					// yourModule/*/special --> yourModule/common/special
					// this will result in a resubmission to finally resolve in the next one
					[ /yourOtherModule\/([^\/]+)\/special/, 'yourOtherModule/common/special' ],
		
					// yourModule/common/special --> myModule2
					// notice the regex above also finds yourOtherModule/common/special; 
					// the extra parenthesized subexprs make this have priority
					[ /(yourOtherModule\/(common))\/special/, 'myModule2' ]
				],
				paths:{ myTopLevelModule: './tests-intern/unit/_base/loader/myTopLevelModule' }
			});

			var dfd = createDeferred();
				
			require([
				'myTopLevelModule',
				'myModule1',
				'myModule2',
				'yourModule',
				'yourOtherModule',
				'yourOtherModule/stuff/special'
			], dfd.callback(function(myModule, myModule1, myModule2, myModule1_1, myModule1_2, myModule2_1) {
				// aliases
				assert.strictEqual(myModule1Value, myModule1);
				assert.strictEqual(myModule1Value, myModule1_1);
				assert.strictEqual(myModule1Value, myModule1_2);
				assert.strictEqual(myModule2Value, myModule2);
				assert.strictEqual(myModule2Value, myModule2_1);

				// top level module via path
				// Note that myTopLevelModule is loaded into the global scope of the iframe
				var myTopLevelModule = iframe.contentWindow.myTopLevelModule;
				assert.strictEqual(myTopLevelModule.name, 'myTopLevelModule');
				assert.strictEqual(myTopLevelModule.myModule.name, 'myTopLevelModule.myModule');
			}));

			return dfd.promise;
		}),

		xdomain: (function () {
			function xdomainTest() {
				var define = this.define;
				var require = this.require;
				var testArgs = this.testArgs;
				var expectedSequence = this.expectedSequence;
				var xdomainExecSequence = this.xdomainExecSequence;
				var xdomainLog = this.xdomainLog;
				var dfd = createDeferred();

				define('dijit', [ 'dojo' ], function(dojo) { return dojo.dijit; });
				define('dojox', [ 'dojo' ], function(dojo) { return dojo.dojox; });

				require([ 'dojo', 'dojo/ready' ], dfd.rejectOnError(function (dojo, ready) {
					if (!('legacyMode' in require)) {
						assert.strictEqual(define.vendor, 'dojotoolkit.org');
						assert.property(require, 'legacyMode');
						return;
					}

					// pretend that everything except the stuff in dojo/tests/_base/loader/xdomain is xdomain
					require.isXdUrl = function (url) {
						return !/loader\/xdomain/.test(url) && !/syncBundle/.test(url);
					};

					// each of these dojo.requires a xdomain module which puts the loader in xdomain loading mode,
					// then dojo.requires a local tree of modules with various loading challenges. Many of the loading
					// challenges are in local1; therefore we test when that module causes the xdomain shift and when
					// the loader is already in xdomain when that module is demanded
					if (testArgs.variation === 1) {
						dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local1');

						//>>excludeStart('srcVersion', kwArgs.copyTests=='build');
						if (testArgs.async === 0) {
							// can't stop the local module from completely executing...
							xdomainLog.push(11, dojo['tests-intern'].unit._base.loader.xdomain.local1 === 'stepOnLocal1');
							xdomainLog.push(12, dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local1') === 'stepOnLocal1');
							xdomainLog.push(13, require('dojo/tests-intern/unit/_base/loader/xdomain/local1') === 'stepOnLocal1');
						}
						else {
							xdomainLog.push(11, dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1') === undefined);
						}
						//>>excludeEnd('srcVersion');
					}
					else {
						dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local2');
						//>>excludeStart('srcVersion', kwArgs.copyTests=='build');
						if (testArgs.async === 0) {
							// can't stop the local module from completely executing...
							xdomainLog.push(11, dojo['tests-intern'].unit._base.loader.xdomain.local2.status === 'local2-loaded');
							xdomainLog.push(12, dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local2').status === 'local2-loaded');
							xdomainLog.push(13, require('dojo/tests-intern/unit/_base/loader/xdomain/local2').status === 'local2-loaded');
						}
						else {
							xdomainLog.push(11, dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local2') === undefined);
						}

						xdomainLog.push(16,	dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1') === undefined);

						if (dojo.isIE !== 6) {
							try {
								require('dojo/tests-intern/unit/_base/loader/xdomain/local1');
								xdomainLog.push(19, false);
							}
							catch (e) {
								xdomainLog.push(19, true);
							}
						}
						//>>excludeEnd('srcVersion');
					}

					// but none of the modules after going into xdomain loading should be executed
					// (WARNING: ie might look different because of its strange caching behavior)
					xdomainLog.push(14, (dojo.hash === undefined));
					xdomainLog.push(15, (dojo.cookie === undefined));
					xdomainLog.push(17, dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local3') === undefined);

					if (dojo.isIE !== 6) {
						try {
							require('dojo/tests-intern/unit/_base/loader/xdomain/local3');
							xdomainLog.push(18, false);
						}
						catch (e) {
							xdomainLog.push(18, true);
						}
					}

					ready(dfd.callback(function () {
						for (var i = 0; i < xdomainLog.length; i += 2) {
							assert.ok(xdomainLog[i+1], 'failed at id = ' + xdomainLog[i]);
						}

						assert.strictEqual(xdomainExecSequence.join(';'), expectedSequence);

						assert.strictEqual(dojo['tests-intern'].unit._base.loader.xdomain.local1, 'stepOnLocal1');
						assert.strictEqual(dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1'), 'stepOnLocal1');
						assert.strictEqual(dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local1'), 'stepOnLocal1');
						assert.strictEqual(require('dojo/tests-intern/unit/_base/loader/xdomain/local1'), 'stepOnLocal1');

						assert.strictEqual(dojo['tests-intern'].unit._base.loader.xdomain.local1SteppedOn, 'stepOn1SteppedOn');
						assert.strictEqual(dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1SteppedOn'), 'stepOn1SteppedOn');
						assert.strictEqual(dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local1SteppedOn'), 'stepOn1SteppedOn');
						assert.strictEqual(require('dojo/tests-intern/unit/_base/loader/xdomain/local1SteppedOn'), 'stepOn1SteppedOn');

						assert.strictEqual(dojo['tests-intern'].unit._base.loader.xdomain.local1NotSteppedOn.status, 'local1NotSteppedOn');
						assert.strictEqual(dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1NotSteppedOn.status'), 'local1NotSteppedOn');
						assert.strictEqual(dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local1NotSteppedOn').status, 'local1NotSteppedOn');
						assert.strictEqual(require('dojo/tests-intern/unit/_base/loader/xdomain/local1NotSteppedOn').status, 'local1NotSteppedOn');

						assert.strictEqual(dojo['tests-intern'].unit._base.loader.xdomain['local1-dep'].status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-dep-ok');
						assert.strictEqual(dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1-dep.status'), 'dojo.tests-intern.unit._base.loader.xdomain.local1-dep-ok');
						assert.strictEqual(dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local1-dep').status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-dep-ok');
						assert.strictEqual(require('dojo/tests-intern/unit/_base/loader/xdomain/local1-dep').status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-dep-ok');

						assert.strictEqual(dojo['tests-intern'].unit._base.loader.xdomain['local1-runtimeDependent1'].status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-runtimeDependent1-ok');
						assert.strictEqual(dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1-runtimeDependent1.status'), 'dojo.tests-intern.unit._base.loader.xdomain.local1-runtimeDependent1-ok');
						assert.strictEqual(dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local1-runtimeDependent1').status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-runtimeDependent1-ok');
						assert.strictEqual(require('dojo/tests-intern/unit/_base/loader/xdomain/local1-runtimeDependent1').status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-runtimeDependent1-ok');

						assert.strictEqual(dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1-runtimeDependent').status, 'ok');

						assert.isUndefined(dojo['tests-intern'].unit._base.loader.xdomain['local1-runtimeDependent2']);
						assert.isUndefined(dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1-runtimeDependent2'));

						assert.throws(function () {
							require('dojo/tests-intern/unit/_base/loader/xdomain/local1/runtimeDependent2');
						});

						assert.strictEqual(dojo['tests-intern'].unit._base.loader.xdomain['local1-browser'].status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-browser-ok');
						assert.strictEqual(dojo.getObject('dojo.tests-intern.unit._base.loader.xdomain.local1-browser.status'), 'dojo.tests-intern.unit._base.loader.xdomain.local1-browser-ok');
						assert.strictEqual(dojo.require('dojo.tests-intern.unit._base.loader.xdomain.local1-browser').status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-browser-ok');
						assert.strictEqual(require('dojo/tests-intern/unit/_base/loader/xdomain/local1-browser').status, 'dojo.tests-intern.unit._base.loader.xdomain.local1-browser-ok');

						assert.isDefined(dojo.cookie);
						assert.strictEqual(dojo.getObject('dojo.cookie'), dojo.cookie);
						assert.strictEqual(require('dojo/cookie'), dojo.cookie);

						if (testArgs.variation !== 1) {
							assert.isDefined(dojo.hash);
							assert.strictEqual(dojo.getObject('dojo.hash'), dojo.hash);
							assert.strictEqual(require('dojo/hash'), dojo.hash);
						}
					}));
				}));

				return dfd.promise;
			}

			return {
				'sync 1': createTest('./loader/xdomain/xdomain.html', xdomainTest, { async: 0, variation: 1 }),
				'sync 2': createTest('./loader/xdomain/xdomain.html', xdomainTest, { async: 0, variation: 2 }),
				'async 1': createTest('./loader/xdomain/xdomain.html', xdomainTest, { async: 'legacyAsync', variation: 1 }),
				'async 2': createTest('./loader/xdomain/xdomain.html', xdomainTest, { async: 'legacyAsync', variation: 2 })
			};
		})(),

		requirejs: (function () {
			function createSyncAsyncTests(url, test) {
				return {
					sync: createTest(url, test, { async: 0 }),
					async: createTest(url, test, { async: 1 })
				};
			}

			var tests = {
				'simple': createSyncAsyncTests('./loader/requirejs/simple.html', function () {
					var require = this.require;
					var dfd1 = createDeferred();

					require({
						baseUrl: './'
					}, [
						'map', 'simple', 'dimple', 'func'
					], dfd1.callback(function (map, simple, dimple, func) {
						assert.strictEqual(map.name, 'map');
						assert.strictEqual(simple.color, 'blue');
						assert.strictEqual(dimple.color, 'dimple-blue');
						assert.strictEqual(func(), 'You called a function');
					}));

					var path = this.location.href.replace(/simple\.html$/, 'foo');
					var index = path.indexOf(':');
					var noProtocolPath = path.substring(index + 1, path.length).replace(/foo/, 'bar');
					var self = this;
					var dfd2 = createDeferred();

					require([ path, noProtocolPath ], dfd2.callback(function() {
						assert.strictEqual(self.foo.name, 'foo'); 
						assert.strictEqual(self.bar.name, 'bar'); 
					}));

					return all([ dfd1.promise, dfd2.promise ]);
				}),

				config: createSyncAsyncTests('./loader/requirejs/config.html', function (simple, dimple, func) {
					assert.strictEqual(simple.color, 'blue');
					assert.strictEqual(dimple.color, 'dimple-blue');
					assert.strictEqual(func(), 'You called a function');
				}),

				'simple, no head': createSyncAsyncTests('./loader/requirejs/simple-nohead.html', function () {
					var require = this.require;
					var dfd = createDeferred();

					require([ 'simple', 'dimple', 'func'], dfd.callback(function(simple, dimple, func) {
						assert.strictEqual(simple.color, 'blue');
						assert.strictEqual(dimple.color, 'dimple-blue');
						assert.strictEqual(func(), 'You called a function');
					}));

					return dfd.promise;
				}),

				circular: createTest('./loader/requirejs/circular.html', function () {
					var dfd = createDeferred();

					this.require([
						'require',
						'two',
						'funcTwo',
						'funcThree'
					], dfd.callback(function (require, two, FuncTwo, funcThree) {
						var args = two.doSomething();
						var twoInst = new FuncTwo('TWO');
						assert.strictEqual(args.size, 'small');
						assert.strictEqual(args.color, 'redtwo');
						assert.strictEqual(twoInst.name, 'TWO');
						assert.strictEqual(twoInst.oneName(), 'ONE-NESTED');
						assert.strictEqual(funcThree('THREE'), 'THREE-THREE_SUFFIX');
					}));

					return dfd.promise;
				}, { async: 1 }),

				'url fetch': createSyncAsyncTests('./loader/requirejs/urlfetch/urlfetch.html', function () {
					var require = this.require;
					var dfd = createDeferred();
					var self = this;

					require({
						baseUrl: './',
						paths: {
							'one' : 'two',
							'two' : 'two',
							'three': 'three',
							'four': 'three'
						}
					}, [ 'one', 'two', 'three', 'four' ], dfd.callback(function(one, two, three, four) {
						var scripts = self.document.getElementsByTagName('script');
						var counts = {};
						var url;

						//First confirm there is only one script tag for each module
						for (var i = scripts.length - 1; i > -1; i--) {
							url = scripts[i].src;
							if (url) {
								if (!(url in counts)) {
									counts[url] = 0;
								}
								counts[url] += 1;
							}
						}

						if (require.async) {
							for (var prop in counts) {
								assert.strictEqual(counts[prop], 1);
							}
						}

						assert.strictEqual(one.name, 'one');
						assert.strictEqual(two.oneName, 'one');
						assert.strictEqual(two.name, 'two');
						assert.strictEqual(three.name, 'three');
						assert.strictEqual(four.threeName, 'three');
						assert.strictEqual(four.name, 'four');
					}));

					return dfd.promise;
				}),

				// TODO: there are more of the i18n tests...
				i18n: {
					i18n: (function () {
						function i18nTest() {
							//Allow locale to be set via query args.
							var locale = null;
							var query = this.location.href.split('#')[0].split('?')[1];
							var match = query && query.match(/locale=([\w-]+)/);
							if (match) {
								locale = match[1];
							}

							//Allow bundle name to be loaded via query args.
							var bundle = 'i18n!nls/colors';
							match = query && query.match(/bundle=([^\&]+)/);
							if (match) {
								bundle = match[1];
							}

							var red = 'red';
							var blue = 'blue';
							var green = 'green';

							if (locale && locale.indexOf('en-us-surfer') !== -1 || bundle.indexOf('nls/en-us-surfer/colors') !== -1) {
								red = 'red, dude';
							}
							else if ((locale && locale.indexOf('fr-') !== -1) || bundle.indexOf('fr-') !== -1) {
								red = 'rouge';
								blue = 'bleu';
							}

							var require = this.require;
							var dfd = createDeferred();

							require([ 'dojo' ], dfd.rejectOnError(function (dojo) {
								// dojo/i18n! looks at dojo.locale
								locale && (dojo.locale= locale);
								require([ bundle ], dfd.callback(function (colors) {
									assert.strictEqual(colors.red, red);
									assert.strictEqual(colors.blue, blue);
									assert.strictEqual(colors.green, green);
								}));
							}));

							return dfd.promise;
						}

						return {
							'locale unknown': createSyncAsyncTests('./loader/requirejs/i18n/i18n.html?bundle=i18n!nls/fr-fr/colors', i18nTest),
							base: createSyncAsyncTests('./loader/requirejs/i18n/i18n.html', i18nTest),
							locale: createSyncAsyncTests('./loader/requirejs/i18n/i18n.html?locale=en-us-surfer', i18nTest),
							bundle: createSyncAsyncTests('./loader/requirejs/i18n/i18n.html??bundle=i18n!nls/en-us-surfer/colors', i18nTest)
						};
					})(),

					common: (function () {
						function commonTest() {
							//Allow locale to be set via query args.
							var locale = null;
							var query = this.location.href.split('#')[0].split('?')[1];
							var match = query && query.match(/locale=([\w-]+)/);

							if (match) {
								locale = match[1];
							}

							var red = 'red';
							var blue = 'blue';

							if (locale && locale.indexOf('en-us-surfer') !== -1) {
								red = 'red, dude';
							}
							else if ((locale && locale.indexOf('fr-') !== -1)) {
								red = 'rouge';
								blue = 'bleu';
							}

							var require = this.require;
							var dfd = createDeferred();

							require([ 'dojo' ], dfd.rejectOnError(function (dojo) {
								// dojo/i18n! looks at dojo.locale
								locale && (dojo.locale= locale);
								require([ 'commonA', 'commonB' ], dfd.callback(function (commonA, commonB) {
									assert.strictEqual(commonA, red);
									assert.strictEqual(commonB, blue);
								}));
							}));

							return dfd.promise;
						}

						return {
							base: createSyncAsyncTests('./loader/requirejs/i18n/i18n.html', commonTest),
							locale: createSyncAsyncTests('./loader/requirejs/i18n/i18n.html?locale=en-us-surfer', commonTest)
						};
					})()
				},

				paths: createSyncAsyncTests('./loader/requirejs/paths/paths.html', function () {
					var scriptCounter = 0;
					var require = this.require;
					var dfd = createDeferred();
					var self = this;

					require({
						baseUrl: './',
						packages: [
							{
								name: 'first',
								location: 'first.js',
								main: './first'
							}
						]
					}, [ 'first!whatever' ], dfd.callback(function (first) {
						//First confirm there is only one script tag for each
						//module:
						var scripts = self.document.getElementsByTagName('script');
						var modName;

						for (var i = scripts.length - 1; i > -1; i--) {
							modName = scripts[i].getAttribute('src');
							if (/first\.js$/.test(modName)) {
								scriptCounter += 1;
							}
						}

						if (require.async){
							assert.strictEqual(scriptCounter, 1);
						}

						assert.strictEqual(self.globalCounter, 2);
						assert.strictEqual(first.name, 'first');
						assert.strictEqual(first.secondName, 'second');
					}));

					return dfd.promise;
				}),

				relative: createSyncAsyncTests('./loader/requirejs/relative/relative.html', function () {
					// alias dojo's text module to text!
					this.define( 'text', [ 'dojo/text' ], function (text) {
						return text;
					});

					var require = this.require;
					var dfd = createDeferred();

					require({
						baseUrl: require.has('host-browser') ? './' : './relative/',
						paths: {
							text: '../../text'
						}
					}, [ 'foo/bar/one' ], dfd.callback(function (one) {
						assert.strictEqual(one.name, 'one');
						assert.strictEqual(one.twoName, 'two');
						assert.strictEqual(one.threeName, 'three');
						assert.strictEqual(one.message.replace(/\r|\n/g, ''), 'hello world');
					}));

					return dfd.promise;
				}),

				text: (function () {
					function textTest(context, useAlias) {
						var require = context.require;
						var define = context.define;
						var dfd = createDeferred();

						if (useAlias) {
							// alias dojo's text module to text!
							require({ aliases: [ [ 'text', 'dojo/text' ] ] });
						}
						else {
							define('text', [ 'dojo/text' ], function (text) { return text; });
						}

						require({
							baseUrl: './',
							paths: {
								text: '../../text'
							}
						}, [
							'widget',
							'local',
							'text!resources/sample.html!strip'
						],
						dfd.callback(function (widget, local, sampleText) {
							function check(expected, actual) {
								assert.strictEqual(actual.replace(/\r|\n/g, ''), expected);
							}

							check('<span>Hello World!</span>', sampleText);
							check('<div data-type="widget"><h1>This is a widget!</h1><p>I am in a widget</p></div>', widget.template);
							check('subwidget', widget.subWidgetName);
							check('<div data-type="subwidget"><h1>This is a subwidget</h1></div>', widget.subWidgetTemplate);
							check('<span>This! is template2</span>', widget.subWidgetTemplate2);
							check('<h1>Local</h1>', local.localHtml);
						}));

						return dfd.promise;
					}

					return {
						alias: createSyncAsyncTests('./loader/requirejs/text/text.html', function () {
							return textTest(this, true);
						}),

						'non-alias': createSyncAsyncTests('./loader/requirejs/text/text.html', function () {
							return textTest(this);
						})
					};
				})(),

				'text only': createSyncAsyncTests('./loader/requirejs/text/textOnly.html', function () {
					var define = this.define;
					var require = this.require;
					var dfd = createDeferred();

					// alias dojo's text module to text!
					define('text', [ 'dojo/text' ], function (text) { return text; });

					require({
						baseUrl: './',
						paths: {
							text: '../../text'
						}
					}, [ 'text!resources/sample.html!strip'], dfd.callback(function (sampleText) {
						assert.strictEqual(sampleText, '<span>Hello World!</span>');
					}));

					return dfd.promise;
				}),

				exports: createTest('./loader/requirejs/exports/exports.html', function () {
					var require = this.require;
					var dfd = createDeferred();

					try {
						require({
							baseUrl: require.has('host-browser') ? './' : './exports/'
						}, [
							'vanilla',
							'funcSet',
							'assign',
							'assign2',
							'usethis',
							'implicitModule',
							'simpleReturn'
						], dfd.callback(function(vanilla, funcSet, assign, assign2, usethis, implicitModule, simpleReturn) {
							assert.strictEqual(vanilla.name, 'vanilla');
							assert.strictEqual(funcSet, 'funcSet');
							assert.strictEqual(assign, 'assign');
							assert.strictEqual(assign2, 'assign2');
							//TODO: not implemented in dojo assert.strictEqual(usethis.name, 'usethis');
							assert.strictEqual(implicitModule(), 'implicitModule');
							assert.strictEqual(simpleReturn(), 'simpleReturn');
						}));
					} catch (e) {
						console.error(e);
					}

					return dfd.promise;
				})
			};

			function badBaseTest() {
				var require = this.require;
				var self = this;
				var dfd1 = createDeferred();

				// set the base URL
				require({ baseUrl: baseUrl + '/loader/requirejs/' });

				require([ 'simple', 'dimple', 'func' ], dfd1.callback(function (simple, dimple, func) {
					assert.strictEqual(simple.color, 'blue');
					assert.strictEqual(dimple.color, 'dimple-blue');
					assert.strictEqual(func(), 'You called a function');
				}));

				//This test is only in the HTML since it uses an URL for a require
				//argument. It will not work well in say, the Rhino tests.
				var path = this.location.href.replace(/simple-badbase\.html$/, 'foo');
				var index = path.indexOf(':');
				var noProtocolPath = path.substring(index + 1, path.length).replace(/foo/, 'bar');
				var dfd2 = createDeferred();

				require([ path, noProtocolPath ], dfd2.callback(function () {
					assert.strictEqual(self.foo.name, 'foo'); 
					assert.strictEqual(self.bar.name, 'bar'); 
				}));

				return all([ dfd1.promise, dfd2.promise ]);
			}

			if (has('ie') > 6) {
				tests['simple, bad base async'] = createTest('./loader/requirejs/simple-badbase.html', badBaseTest, { async: 1 });
			}
			tests['simple, bad base sync'] = createTest('./loader/requirejs/simple-badbase.html', badBaseTest, { async: 0 });

			if (has('dojo-requirejs-api')) {
				tests.dataMain = createSyncAsyncTests('./loader/requirejs/dataMain.html', function (simple) {
					assert.strictEqual(simple.color, 'blue');
				}),

				tests.depoverlap = createSyncAsyncTests('./loader/requirejs/depoverlap.html', function (uno) {
					//First confirm there is only one script tag for each module:
					var scripts = this.document.getElementsByTagName('script');
					var i;
					var counts = {};
					var modName;
					var something;

					for (i = scripts.length - 1; i > -1; i--) {
						modName = scripts[i].getAttribute('data-requiremodule');
						if (modName) {
							if (!(modName in counts)) {
								counts[modName] = 0;
							}
							counts[modName] += 1;
						}
					}

					//Now that we counted all the modules make sure count
					//is always one.
					for (var prop in counts){
						assert.strictEqual(counts[prop], 1);
					}

					assert.strictEqual(uno.name, 'uno');
					something = uno.doSomething();
					assert.strictEqual(something.dosName, 'dos');
					assert.strictEqual(something.tresName, 'tres');
				});
			}

			if (has('dojo-amd-factory-scan')) {
				tests.uniques = createSyncAsyncTests('./loader/requirejs/uniques/uniques.html', function () {
					var require = this.require;
					var dfd = createDeferred();

					require({
							baseUrl: './'
					}, [ 'one', 'two', 'three' ], dfd.callback(function (one, two, three) {
						assert.strictEqual(one.name, 'one');
						assert.strictEqual(one.threeName, 'three');
						assert.strictEqual(one.threeName2, 'three');
						assert.strictEqual(two.oneName, 'one');
						assert.strictEqual(two.oneName2, 'one');
						assert.strictEqual(two.name, 'two');
						assert.strictEqual(two.threeName, 'three');
						assert.strictEqual(three.name, 'three');
					}));

					return dfd.promise;
				});
			}

			return tests;
		})(),

		'config/test': createTest('./loader/config/test.html', function () {
			var require = this.require;

			require({
				config: {
					'loader/someModule': {
						someConfig: 'this is the config for someModule-someConfig'
					},
					'pkgMapped/m1': {
						globalConfig: 'globalConfigForpkgMapped/m1',
						isMapped: true
					},
					'pkgMapped/m2': {
						globalConfig: 'globalConfigForpkgMapped/m2'
					}
				}
			});

			var dfd1 = createDeferred();

			require([
				'loader/someModuleConfiggedPriorToBoot',
				'loader/someModule'
			], dfd1.rejectOnError(function (someModuleConfiggedPriorToBoot, someModule) {
				assert.ok(objectsAreEqual(someModuleConfiggedPriorToBoot.getConfig(), {
					someConfig: 'this is the config for someModuleConfiggedPriorToBoot'
				}));
				assert.ok(objectsAreEqual(someModule.getConfig(), {
					someConfig: 'this is the config for someModule-someConfig'
				}));
				assert.ok(objectsAreEqual(someModule.m1.getConfig(), {
					globalConfig: 'globalConfigForpkgMapped/m1', 
					isMapped: true,
					configThroughMappedRefForM1: 'configThroughMappedRefForM1'
				}));
				assert.ok(objectsAreEqual(someModule.m2.getConfig(), {
					globalConfig: 'globalConfigForpkgMapped/m2', 
					configThroughMappedRefForM1: 'configThroughMappedRefForM1',
					config1: 'mapped-config1',
					config2: 'mapped-config2',
					config3: 'mapped-config3'
				}));

				setTimeout(function () {
					require({
						config: {
							'loader/someModule': {
								someMoreConfig:
									'this is the config for someModule-someMoreConfig'
							}
						}
					});

					require(['loader/someModule'], dfd1.callback(function (someModule) {
						assert.ok(objectsAreEqual(someModule.getConfig(), {
							someConfig: 'this is the config for someModule-someConfig',
							someMoreConfig: 'this is the config for someModule-someMoreConfig'
						}));
					}));
				}, 10);
			}));

			var dfd2 = createDeferred();

			require({
				config: {
					'pkg/m1': { globalConfig: 'globalConfigForM1' },
					'pkg/m2': { globalConfig: 'globalConfigForM2' }
				}
			}, [ 'pkg/m1', 'pkg/m2' ], dfd2.callback(function (m1, m2) {
				assert.ok(objectsAreEqual(m1.getConfig(), { globalConfig: 'globalConfigForM1' }));
				assert.ok(objectsAreEqual(m2.getConfig(), {
					globalConfig: 'globalConfigForM2', 
					config1: 'config1',
					config2: 'config2',
					config3: 'config3'
				}));
			}));

			return all([ dfd1.promise, dfd2.promise ]);
		}),

		mapping: createTest('./loader/mapping.html', function () {
			var dfd = createDeferred();
			var require = this.require;
			var define = this.define;

			// simulate a built layer, this is added to dojo.js by the builder
			require({
				cache: {
					'my/replacement/A': function () {
						define([ '../A' ], function () {
							return { it: 'is a replacement module' };
						});
					},
					'my/A': function () {
						define([ './B' ], function () {
							return { it: 'is the original module' };
						});
					},
					'my/B': function () {
						define([], function () {
							return { it: 'is a module dependency' };
						});
					}
				}
			});

			// consume pending cache, the following are added at the end of a built dojo.js in a closure
			require({ cache: {} });
			!require.async && require([ 'dojo' ]);
			require.boot && require.apply(null, require.boot);

			// begin test:
			// moving modules from the pending cache to the module cache should ignore
			// any mapping, pathing, or alias rules
			var handle = require.on('error', function (e) {
				dfd.reject(e);
			});

			dfd.promise.always(function () {
				handle.remove();
			});

			require([ 'my/A' ], dfd.callback(function (A) {
				assert.equal(A.it, 'is a replacement module');
			}));

			return dfd.promise;
		})
	};

	if (has('dojo-publish-privates')) {
		suite['config API'] = createTest('./loader/configApi.html', function () {
			var require = this.require;

			var expectedConfig1;
			var expectedConfig2;
			var called1;
			var called2;
			var savedRawConfig;
			var configListener1 = function (config, rawConfig) {
				called1 = true;
				savedRawConfig = rawConfig;
				assert.strictEqual(config, expectedConfig1);
			};
			var configListener2 = function(config, rawConfig){
				called2 = true;
				savedRawConfig = rawConfig;
				assert.strictEqual(config, expectedConfig2);
			};
			var configListeners = require.listenerQueues.config ||
				(require.listenerQueues.config = []);
			var listenerCount = configListeners.length;
			var h1 = require.on('config', configListener1);
			var h2 = require.on('config', configListener2);

			assert.strictEqual(configListeners.length, listenerCount+2);
			assert.strictEqual(configListeners[listenerCount], configListener1);
			assert.strictEqual(configListeners[listenerCount+1], configListener2);
			expectedConfig1 = expectedConfig2 = {
				someFeature: 1
			};						

			called1 = called2 = 0;
			require(expectedConfig1);
			assert.ok(called1);
			assert.ok(called2);

			h1.remove();
			assert.strictEqual(configListeners.length, listenerCount+1);
			assert.strictEqual(configListeners[listenerCount], configListener2);
			expectedConfig1 = expectedConfig2 = {
				someFeature: 0,
				someOtherFeature: 1
			};						

			called1 = called2 = 0;
			require(expectedConfig1);
			assert.strictEqual(called1, 0);
			assert.ok(called2);
			assert.strictEqual(savedRawConfig.someFeature, 0);
			assert.strictEqual(savedRawConfig.someOtherFeature, 1);
			h2.remove();

			require({ async: 1 });
			assert.strictEqual(require.async, true);
			assert.strictEqual(require.legacyMode, false);

			require({ async: true });
			assert.strictEqual(require.async, true);
			assert.strictEqual(require.legacyMode, false);

			require({ async: 2 });
			assert.strictEqual(require.async, true);
			assert.strictEqual(require.legacyMode, false);

			require({ async: 'nonsense'});
			assert.strictEqual(require.async, true);
			assert.strictEqual(require.legacyMode, false);

			require({ async: 0 });
			assert.strictEqual(require.async, false);
			assert.strictEqual(require.legacyMode, 'sync');

			require({ async: false });
			assert.strictEqual(require.async, false);
			assert.strictEqual(require.legacyMode, 'sync');

			require({ async: 'sync'});
			assert.strictEqual(require.async, false);
			assert.strictEqual(require.legacyMode, 'sync');

			require({ async: 'legacyAsync'});
			assert.strictEqual(require.async, false);
			assert.strictEqual(require.legacyMode, 'legacyAsync');
		});

		suite.internals = function () {
			var compactPath = require.compactPath;
			assert.strictEqual('../../../mytests', compactPath('../../dojo/../../mytests'));
			assert.strictEqual('module', compactPath('module'));
			assert.strictEqual('a/b', compactPath('a/./b'));
			assert.strictEqual('b', compactPath('a/../b'));
			assert.strictEqual('a/b/c/d', compactPath('a/./b/./c/./d'));
			assert.strictEqual('d', compactPath('a/../b/../c/../d'));
			assert.strictEqual('a/d', compactPath('a/b/c/../../d'));
			assert.strictEqual('a/b/c/d', compactPath('a/b/c/././d'));
			assert.strictEqual('a/b', compactPath('./a/b'));
			assert.strictEqual('../a/b', compactPath('../a/b'));
			assert.strictEqual('', compactPath(''));
		};
	}

	registerSuite(suite);
});
