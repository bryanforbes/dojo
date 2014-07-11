/* global objC1: false, objC2: false, buttonClicked: false, objI1: false, objI2: false,
objI3: false, contI1: false, button: false, mixedObj: false, noLang: false, inheritedFromHtml: false,
noTextdir: false, inheritedTextdir: false, specifiedTextdir: false, inheritedLang: false,
specifiedLang: false, inheritRtl: false, inheritLtr: false, setRtl: false, setLtr: false, inheritRtl2: false,
obj: false, obj2: false, obj3: false, obj4: false, disabledObj: false, checkedObj: false, container1: false,
container2: false, html5simple: false, html5simple2: false, html5simple3: false, onForm: false,
htmldojomethod: false, objOnWatch: false, objAspect: false, objAMDWidget: false */

define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/date/stamp',
	'dojo/Evented',
	'dojo/Stateful',
	'dojo/parser',
	'dojo/dom',
	'dojo/_base/array',
	'dojo/dom-construct',
	'dojo/aspect',
	'dojo/dom-attr',
	'dojo/on'
], function(require, registerSuite, assert, Deferred, declare, lang, dstamp, Evented, Stateful, parser, dom, array, domConstruct, aspect, domAttr, on) {

	var Widget = declare('tests.parser.Widget', null, {
		constructor: function (args) {
			this.params = args;
		}
	});

	var Class1 = declare('tests.parser.Class1', null, {
		constructor: function (args) {
			this.params = args;
			lang.mixin(this, args);
		},
		preambleTestProp: 1,
		preamble: function () {
			this.preambleTestProp++;
		},
		intProp: 1,
		callCount: 0,
		callInc: function () {
			this.callCount++;
		},
		callCount2: 0,
		strProp1: 'original1',
		strProp2: 'original2',
		arrProp: [],
		arrProp2: ['foo'],
		boolProp1: false,
		boolProp2: true,
		boolProp3: false,
		boolProp4: true,
		dateProp1: dstamp.fromISOString('2007-01-01'),
		dateProp2: dstamp.fromISOString('2007-01-01'),
		dateProp3: dstamp.fromISOString('2007-01-01'),
		funcProp: function () {},
		funcProp2: function () {},
		funcProp3: function () {},
		onclick: function () {
			this.prototypeOnclick = true;
		}
	});

	var Class2 = declare('tests.parser.Class2', null, {
		constructor: function( ) {
			this.fromMarkup = false;
		},
		fromMarkup: false,
		markupFactory: function () {
			var i = new Class2();
			i.fromMarkup = true;
			return i;
		}
	});

	var Class3 = declare('tests.parser.Class3', Class2, {
		fromMarkup: false,
		markupFactory: function(args, node, classCtor) {
			var i = new classCtor();
			i.classCtor = classCtor;
			i.params = args;
			return i;
		}
	});

	declare('tests.parser.InputClass', null, {
		constructor: function (args) {
			this.params = args;
			lang.mixin(this, args);
		},
		disabled: false,
		readonly: false,
		checked: false,
		value: 'default value',
		title: 'default title',
		tabIndex: '0',
		custom1: 123,
		custom2: 456
	});

	declare('tests.parser.BidiClass', Widget, {
		constructor: function(args) {
			lang.mixin(this, args);
		},
		dir: '',
		lang: '',
		textdir: '',
		name: ''
	});

	declare('tests.parser.NormalContainer', null, {
		constructor: function (args) {
			lang.mixin(this, args);
		}
	});

	declare('tests.parser.ShieldedContainer', null, {
		constructor: function (args) {
			lang.mixin(this, args);
		},
		stopParser: true
	});

	var HTML5Props = declare('tests.parser.HTML5Props', null, {
		constructor: function (args) {
			lang.mixin(this, args);
		},
		simple: false,
		a: 2,
		b: null,
		c: null,
		d: null,
		e: null,
		f: null,
		afn: function () {
			return this.a * 2;
		}
	});

	HTML5Props._aDefaultObj = {
		a: 1,
		b: 2,
		simple: true
	};

	declare('tests.parser.HTML5withMethod', null, {
		constructor: function (args) {
			lang.mixin(this, args);
		},
		baseValue: 10,
		someMethod: function () {
			return this.baseValue;
		},
		diffMethod: function () {
			this._ran = true;
		}
	});

	declare('tests.parser.StatefulClass', [Evented, Stateful], {
		strProp1: '',
		objProp1: {},
		boolProp1: false,
		prototypeOnclick: false,
		onclick: function() {
			this.prototypeOnclick = true;
		}
	});

	declare('tests.parser.MethodClass', null, {
		method1ran: false,
		method1after: false,
		method2ran: false,
		method2before: false,
		method2after: false,
		method3result: '',
		method4ran: false,
		method4after: false,
		method1: function() {
			this.method1ran = true;
		},
		method2: function() {
			this.method2ran = true;
		},
		method3: function(result) {
			this.method3result = result;
		},
		method4: function() {
			this.method4ran = true;
		}
	});

	declare('tests.parser.ClassForMixins', null, {
		classDone: true
	});

	window.deepTestProp = {
		blah: {
			thinger: 1
		}
	};

	declare('tests.parser.FormClass', Widget, {
		encType: ''
	});

	registerSuite({
		name: 'dojo/parser',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./parserApi.html'], function(html) {
				document.body.innerHTML = html;
				parser.parse(dom.byId('main')).then(deferred.resolve, deferred.reject);
			});
			return deferred.promise;
		},	

		'basic tests': {
			DataDojoId: function () {
				assert.typeOf(obj, 'object');
			},

			JsId: function () {
				assert.typeOf(obj3, 'object');
			},

			StrProp: function () {
				assert.typeOf('string', typeof obj.strProp1);
				assert.strictEqual(obj.strProp1, 'text');
				assert.typeOf('string', typeof obj.strProp2);
				assert.strictEqual(obj.strProp2, '');
			},

			IntProp: function () {
				assert.typeOf(obj.intProp, 'number');
				assert.strictEqual(obj.intProp, 5);
			},

			ArrProp: function () {
				assert.lengthOf(obj.arrProp, 3);
				assert.lengthOf(obj.arrProp[1], 3);
				assert.deepEqual(obj.arrProp, ['foo', 'bar', 'baz']);
				assert.deepEqual(obj.arrProp2, []);
			},

			BoolProp: function () {
				assert.typeOf(obj.boolProp1, 'boolean');
				assert.isTrue(obj.boolProp1);

				assert.typeOf(obj.boolProp2, 'boolean');
				assert.isFalse(obj.boolProp2);
				
				assert.typeOf(obj.boolProp3, 'boolean');
				assert.isFalse(obj.boolProp3);
				
				assert.typeOf(obj.boolProp4, 'boolean');
				assert.isTrue(obj.boolProp4);
			},

			DateProp: function () {
				assert.strictEqual(dstamp.toISOString(obj.dateProp1, {selector: 'date'}), '2006-01-01');
				assert.isTrue(isNaN(obj.dateProp2));
				assert.strictEqual(dstamp.toISOString(new Date(), {selector: 'date'}),
					dstamp.toISOString(obj.dateProp3, {selector: 'date'}));
			},

			DisabledFlag: function () {
				assert.typeOf(disabledObj.disabled, 'boolean');
				assert.isTrue(disabledObj.disabled);
				assert.isFalse(disabledObj.checked);
			},

			CheckedFlag: function () {
				assert.typeOf(checkedObj.checked, 'boolean');
				assert.isFalse(checkedObj.disabled);
				assert.isTrue(checkedObj.checked);
			},

			Connect: function () {
				obj.callInc();
				assert.strictEqual(obj.callCount, 2);
			},

			FunctionAssignment: function () {
				obj.callInc2();
				assert.strictEqual(obj.callCount2, 1);
			},

			SubNodeParse: function () {
				assert.isFalse(lang.exists('obj2'));
				var toParse = dom.byId('toParse');
				parser.parse(toParse.parentNode);
				assert.isTrue(lang.exists('obj2'));
				assert.strictEqual(obj2.declaredClass, 'tests.parser.Class1');
			},

			MarkupFactory: function () {
				assert.isTrue(lang.exists('obj3'), 'obj3 exists');
				assert.isTrue(obj3.fromMarkup);
			},

			MarkupFactoryClass: function () {
				assert.isTrue(lang.exists('obj4'), 'obj4 exists');
				assert.strictEqual(obj4.classCtor, Class3);
				assert.isTrue(obj4 instanceof Class3);
				assert.isTrue(obj4 instanceof Class2);
			},

			nostart: function () {

				var started = false;
				declare('SampleThinger', null, {
					startup: function(){
						started = true;
					}
				});

				domConstruct.create('div', { dojoType:'SampleThinger' }, 'parsertest');
				parser.parse('parsertest', { noStart:true });

				assert.isFalse(started, 'first started check');

				domConstruct.empty('parsertest');

				started = false;

				domConstruct.create('div', { dojoType:'SampleThinger' }, 'parsertest');
				parser.parse({ noStart:true, rootNode:'parsertest' });

				assert.isFalse(started, 'second started check');
			},

			cacheRefresh: function () {
				var wrapper = domConstruct.place('<div><div dojo-testingType=\'tests.parser.Class3\' newParam=12345>hi</div></div>', document.body, 'last');

				lang.extend(Class2, {
					newParam: 0
				});

				var widgets = parser.parse({rootNode: wrapper});
				assert.lengthOf(widgets, 1);
				assert.strictEqual(widgets[0].params.newParam, 12345);
			},

			recurse: function () {
				assert.isNotNull(container1, 'normal container created');
				assert.isNotNull(container1.incr, 'script tag works too');
				assert.isNotNull(window.contained1, 'child widget also created');
				assert.isNotNull(window.contained2, 'child widget 2 also created');

				assert.isNotNull(container2, 'shielded container created');
				assert.isNotNull(container2.incr, 'script tag works too');
				assert.isUndefined(window.contained3, 'child widget not created');
				assert.isUndefined(window.contained4, 'child widget 2 not created');
			},

			simpleHTML5: function (){
				assert.typeOf(html5simple, 'object');
				assert.typeOf(html5simple2, 'object');

				assert.isTrue(html5simple.simple, 'default respecified in props=\'\'');
				assert.isFalse(html5simple2.simple, 'default overridden by props=\'\'');

				var it = html5simple2;
				assert.strictEqual(it.a, 1);
				assert.strictEqual(it.b, 'two');
				assert.isTrue(it.c instanceof Array, 'array in param');
				assert.lengthOf(it.c, 3);
				assert.strictEqual(it.e.f, 'g');
				assert.strictEqual(it, it.d());
			},

			html5inherited: function (){
				assert.typeOf(html5simple3, 'object');
				var val = html5simple3.afn();
				assert.strictEqual(html5simple3.a * 2, val);
			},

			html5withMethod: function () {
				assert.typeOf(htmldojomethod, 'object');
				assert.isTrue(htmldojomethod._methodRan, 'plain dojo/method ran');

				var x = htmldojomethod.someMethod(2, 2);
				assert.strictEqual(x, 14, 'overridden dojo/method');

				htmldojomethod.diffMethod(2);
				assert.isTrue(htmldojomethod._ran, 'ensures original was called first');
				assert.strictEqual(htmldojomethod._fromvalue, 2, 'ensures connected was executed in scope');
			},

			OnWatch: function (){
				assert.typeOf(objOnWatch, 'object');
				objOnWatch.set('strProp1','newValue1');
				assert.strictEqual(objOnWatch.arrProp.newValue, 'newValue1');

				objOnWatch.onclick();
				assert.isTrue(objOnWatch.prototypeOnclick, 'ensures original was called');
				assert.isTrue(objOnWatch.boolProp1, 'ensure on executed in scope');
			},


			On2: function (){
				parser.parse('on');
				assert.isTrue('onForm' in window, 'widget created');
				onForm.emit('click');
				assert.isTrue(onForm.clicked, 'on callback fired');
			},


			Aspect: function (){
				assert.typeOf(objAspect, 'object');
				assert.isFalse(objAspect.method1ran, 'ensures method unfired');
				assert.isFalse(objAspect.method2ran, 'ensures method unfired');
				assert.strictEqual(objAspect.method3result, '', 'ensures method unfired');
				assert.isFalse(objAspect.method4ran, 'ensures method unfired');

				objAspect.method1();
				objAspect.method2();
				objAspect.method3('something');
				objAspect.method4();

				assert.isTrue(objAspect.method1ran, 'method fired');
				assert.isTrue(objAspect.method1after, 'after advice fired');
				assert.isTrue(objAspect.method2ran, 'method fired');
				assert.isTrue(objAspect.method2before, 'around before advice fired');
				assert.isTrue(objAspect.method2after, 'around after advice fired');
				assert.strictEqual(objAspect.method3result, 'before', 'before argument passed');
				assert.isTrue(objAspect.method4ran, 'method fired');
				assert.isTrue(objAspect.method4after, 'after advice fired');
			},


			MID: function (){
				assert.typeOf(objAMDWidget, 'object');
				assert.strictEqual(objAMDWidget.params.value, 'Value1');
			}
		},

		'BIDI': {
			dirAttr: function () {
				parser.parse('dirSection1');
				parser.parse('dirSection2');
				assert.strictEqual(setRtl.dir, 'rtl');
				assert.strictEqual(inheritRtl.dir, 'rtl');
				assert.strictEqual(inheritLtr.dir, 'ltr');
				assert.strictEqual(inheritRtl2.dir, 'rtl');
				assert.strictEqual(setLtr.dir, 'ltr');
			},

			langAttr: function () {
				parser.parse('langSection');
				assert.isFalse(lang in noLang.params);
				assert.strictEqual(inheritedLang.lang, 'it_it');
				assert.strictEqual(specifiedLang.lang, 'en_us');
			},

			textdirAttr: function () {
				parser.parse('textDirSection');
				assert.isFalse('textDir' in noTextdir.params);
				assert.strictEqual(inheritedTextdir.textDir, 'rtl');
				assert.strictEqual(specifiedTextdir.textDir, 'ltr');
			},

			'inheritance from HTML': {
				before: function () {
					domAttr.set(window.document.documentElement, {dir: 'rtl', lang: 'ja-jp', 'data-dojo-testing-textdir': 'auto'});
					parser.parse('bidiInheritanceFromHtml');
				},

				inheritance: function () {
					assert.strictEqual(inheritedFromHtml.params.dir, 'rtl');
					assert.strictEqual(inheritedFromHtml.params.lang, 'ja-jp');
					assert.strictEqual(inheritedFromHtml.params.textDir, 'auto');
				},

				after: function () {
					array.forEach(['dir', 'lang', 'data-dojo-textdir'], function(attr){
						window.document.documentElement.removeAttribute(attr);
					});
				}
			}
		},

		'IE attribute detection': {
			input1: function (){
				var widgets = parser.instantiate([dom.byId('ieInput1')]);
				var params = widgets[0].params;

				assert.strictEqual(params.type, 'checkbox');
				assert.isTrue(params.disabled, 'disabled');
				assert.isTrue(params.checked, 'checked');
				assert.isTrue(params.readonly, 'readonly');
				assert.strictEqual(params.foo, 'bar');
				assert.strictEqual(params.bar, 'zaz');
				assert.strictEqual(params.bob, 'escaped\"dq');
				assert.strictEqual(params.frank, 'escaped\'sq');
			},

			input2: function (){
				var widgets = parser.instantiate([dom.byId('ieInput2')]);
				var params = widgets[0].params;

				assert.isUndefined(params.type);
				assert.isUndefined(params.name);
				assert.isUndefined(params.value);
				assert.isUndefined(params['data-dojo-type']);
				assert.isUndefined(params['data-dojo-props']);
				assert.strictEqual(params.foo, 'hi');
				assert.isUndefined(params.value);
			},

			input3: function (){
				var widgets = parser.instantiate([dom.byId('ieInput3')]);
				var params = widgets[0].params;

				assert.strictEqual(params.type, 'password');
				assert.strictEqual(params.name, 'test');
				assert.strictEqual(params.value, '123');
				assert.strictEqual(params.class, 'myClass');
				assert.strictEqual(params.style.replace(/[ ;]/g, '').toLowerCase(), 'display:block');
				assert.strictEqual(params.tabIndex, '3');
			},

			textarea: function (){
				var widgets = parser.instantiate([dom.byId('ieTextarea')]);
				var params = widgets[0].params;

				assert.strictEqual(params.value, 'attrVal');
			},

			button1: function (){
				var widgets = parser.instantiate([dom.byId('ieButton1')]);
				var params = widgets[0].params;

				assert.isTrue(params.checked);
				assert.strictEqual(params.value, 'button1val');
			},

			button2: function (){
				var widgets = parser.instantiate([dom.byId('ieButton2')]);
				var params = widgets[0].params;

				assert.isUndefined(params.checked);
				assert.isUndefined(params.value);
			},

			button3: function (){
				var widgets = parser.instantiate([dom.byId('ieButton3')]);
				var params = widgets[0].params;

				assert.isTrue(params.checked);
			},

			button4: function (){
				var widgets = parser.instantiate([dom.byId('ieButton4')]);
				var params = widgets[0].params;

				assert.isUndefined(params.checked);
			},

			form1: function (){
				var widgets = parser.instantiate([dom.byId('ieForm1')]);
				var params = widgets[0].params;

				assert.strictEqual(params.encType, 'foo');
			},

			form2: function (){
				var widgets = parser.instantiate([dom.byId('ieForm2')]);
				var params = widgets[0].params;

				assert.isUndefined(params.encType);
			},

			li: function (){
				var widgets = parser.instantiate([dom.byId('li')]);
				var params = widgets[0].params;

				assert.strictEqual(params.value, 'home');
			}
		},

		'promise error handling support': {
			asyncError: function (){
				var deferred = new this.async();

				parser.parse('errorHandling').then(deferred.reject, deferred.callback(function (e) {
					assert.typeOf(e, 'object');
				}));
			},

			missingCtor: function (){
				var deferred = new this.async();

				parser.parse('missingCtor').then(deferred.reject, deferred.callback(function (e) {
					assert.typeOf(e, 'object');
					assert.strictEqual(e.toString(), 'Error: Unable to resolve constructor for: \'some.type\'');
				}));
			},
		},

		'double connect': function () {
			window.Behavioral1 = declare(null, {
				constructor: function (params, node) {
					on(node, 'click', lang.hitch(this, 'onClick'));
					lang.mixin(this, params);
				},
				onClick: function(){ },
				foo: ''
			});

			parser.parse('behavioral');

			window.behavioralClickCounter = 0;
			on.emit(dom.byId('bh1'), 'click', {bubbles: true, cancelable: true});

			assert.strictEqual(window.behavioralClickCounter, 1);
			assert.strictEqual(dom.byId('bh1').getAttribute('id'), 'bh1');
		},

		'mixed attribute specification': function () {
			parser.parse(dom.byId('mixedContainer'));
			assert.typeOf(mixedObj, 'object');
			assert.strictEqual(mixedObj.value, 'mixedValue');
			assert.strictEqual(mixedObj.custom1, 999);
			assert.strictEqual(mixedObj.title, 'custom title');
		},

		'functions': function () {
			declare('tests.parser.Button', null, {
				onClick: function () {},
				constructor: function(args, node){
					lang.mixin(this, args);
					this.domNode = node;
					aspect.after(this.domNode, 'onclick', lang.hitch(this, 'onClick'));
				}
			});
			window.buttonClicked = function(){};
			parser.parse('functions');

			assert.typeOf(button, 'object');
			assert.typeOf(button.onClick, 'function');
			assert.strictEqual(buttonClicked, button.onClick);
		},

		'instantiate': function () {
			var nodes = [dom.byId('objId1'), dom.byId('objId2'), dom.byId('contId1'), dom.byId('objId3')];
			parser.instantiate(nodes);
			assert.typeOf(objI1, 'object');
			assert.typeOf(objI2, 'object');
			assert.isNotNull(contI1);
			assert.typeOf(objI3, 'object');
			assert.isUndefined(window.objI4);
		},

		'construct': function () {
			parser.construct(Class1, dom.byId('objC1'));
			assert.typeOf(objC1, 'object');
			assert.strictEqual(objC1.intProp, 5);

			parser.construct(Class1, dom.byId('objC2'));
			assert.typeOf(objC2, 'object');
			assert.strictEqual(objC2.intProp, 5);
		}
	});
});