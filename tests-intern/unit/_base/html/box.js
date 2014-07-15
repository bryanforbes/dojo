define([
	'intern!object',
	'intern/chai!assert',
	'require',
	'dojo/Deferred',
	'dojo/dom-construct',
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo-testing'
], function (
	registerSuite,
	assert,
	require,
	Deferred,
	domConstruct,
	lang,
	arrayUtil,
	dojo
) {
	var margin = '1px';
	var border = '3px solid black';
	var padding = '5px';
	var defaultStyles = {
		height: '100px',
		width: '100px',
		position: 'absolute',
		backgroundColor: 'red'
	};

	var defaultChildStyles = {
		height: '20px',
		width: '20px',
		backgroundColor: 'blue'
	};

	var testStyles = [
		{},
		{ margin: margin },
		{ border: border },
		{ padding: padding },
		{ margin: margin, border: border },
		{ margin: margin, padding: padding },
		{ border: border, padding: padding },
		{ margin: margin, border: border, padding: padding }
	];

	function assertSameBox(inBox1, inBox2) {
		for (var i in inBox1) {
			assert.strictEqual(inBox1[i], inBox2[i]);
		}
	}

	function reciprocalMarginBoxTest(inNode, inBox) {
		var s = inBox || dojo.marginBox(inNode);
		dojo.marginBox(inNode, s);
		var e = dojo.marginBox(inNode);
		assertSameBox(s, e);
	}

	function createStyledElement(inStyle, inParent, inElement, inNoDefault) {
		inStyle = inStyle || {};
		if (!inNoDefault) {
			for (var i in defaultStyles) {
				if (!inStyle[i]) {
					inStyle[i] = defaultStyles[i];
				}
			}
		}
		var n = doc.createElement(inElement || 'div');
		(inParent || doc.body).appendChild(n);
		addedElements.push(n);
		lang.mixin(n.style, inStyle);
		return n;
	}

	function styleIncTop(inStyle) {
		inStyle = lang.mixin({}, inStyle || {});
		inStyle.top = (testInitTop + testTop * testTopInc) + 'px';
		testTopInc++;
		return inStyle;
	}

	// args are (styles, parent, element name, no default)
	function mixCreateElementArgs(inMix, inArgs) {
		var args = [ {} ];

		if (inArgs && inArgs[0]) {
			lang.mixin(args[0], inArgs[0]);
		}

		if (inMix.length) {
			lang.mixin(args[0], inMix[0] || {});
		}

		// parent comes from source
		if (inMix.length > 1) {
			args[1] = inMix[1];
		}

		args[2] = inArgs[2];
		args[3] = inArgs[3];

		return args;
	}

	function createStyledNodes(inArgs, inFunc) {
		var s;
		for (var i = 0, n; (s = testStyles[i]); i++) {
			n = createStyledElement.apply(this, mixCreateElementArgs([styleIncTop(s)], inArgs));
			inFunc && inFunc(n);
		}
	}

	function createStyledParentChild(inParentArgs, inChildArgs, inFunc) {
		for (var i = 0, s, parent, child; (s = testStyles[i]); i++) {
			parent = createStyledElement.apply(this, mixCreateElementArgs([ styleIncTop(s) ], inParentArgs));
			child = createStyledElement.apply(this, mixCreateElementArgs([ {}, parent ], inChildArgs));
			inFunc && inFunc(parent, child);
		}
	}

	function createStyledParentChildren(inParentArgs, inChildArgs, inFunc) {
		var i;
		var j;
		var s;
		var sc;
		var parent;
		var child;

		for (i = 0; (s = testStyles[i]); i++) {
			for (j = 0; (sc = testStyles[j]); j++) {
				parent = createStyledElement.apply(this, mixCreateElementArgs([ styleIncTop(s) ], inParentArgs));
				child = createStyledElement.apply(this, mixCreateElementArgs([ sc, parent ], inChildArgs));
				inFunc && inFunc(parent, child);
			}
		}

		for (i = 0; (s = testStyles[i]); i++) {
			parent = createStyledElement.apply(this, mixCreateElementArgs([ styleIncTop(s) ], inParentArgs));
			child = createStyledElement.apply(this, mixCreateElementArgs([ {}, parent ], inChildArgs));
			inFunc && inFunc(parent, child);
		}
	}

	function runFitTest(inParentStyles, inChildStyles) {
		createStyledParentChildren([ inParentStyles ], [ inChildStyles ], function (parent, child) {
			reciprocalMarginBoxTest(child, dojo.contentBox(parent));
		});
	}

	var testTopInc = 0;
	var testTop = 150;
	var testInitTop = 250;
	var addedElements = [];
	var iframe;
	var win = window;
	var doc = document;

	var suite = {
		name: 'dojo/_base/html/box',

		afterEach: function () {
			var elem;
			while ((elem = addedElements.pop())) {
				// comment the loop body to leave nodes for inspection
				elem.parentNode.removeChild(elem);
				testTopInc--;
			}
		}
	};

	arrayUtil.forEach([ 'standards', 'quirks' ], function (doctype) {
		suite[doctype] = {
			reciprocal: function () {
				createStyledNodes([], function (n) {
					reciprocalMarginBoxTest(n);
				});
			},

			fit: function () {
				runFitTest(null, lang.mixin({}, defaultChildStyles));
			},

			'fit overflow': function () {
				runFitTest(null, lang.mixin({ overflow:'hidden' }, defaultChildStyles));
				runFitTest({ overflow: 'hidden' }, lang.mixin({}, defaultChildStyles));
				runFitTest({ overflow: 'hidden' }, lang.mixin({ overflow:'hidden' }, defaultChildStyles));
			},

			'fit float': function () {
				runFitTest(null, lang.mixin({ 'float': 'left' }, defaultChildStyles));
				runFitTest({ 'float': 'left' }, lang.mixin({}, defaultChildStyles));
				runFitTest({ 'float': 'left' }, lang.mixin({ 'float': 'left' }, defaultChildStyles));
			},

			'reciprocal inline': function () {
				createStyledParentChild([], [{}, null, 'span'], function (parent, child) {
					child.innerHTML = 'Hello World';
					reciprocalMarginBoxTest(child);
				});
			},

			'reciprocal button child': function () {
				createStyledParentChild([], [{}, null, 'button'], function(parent, child) {
					child.innerHTML = 'Hello World';
					reciprocalMarginBoxTest(child);
				});
			}
		};
	});

	suite.quirks.setup = function () {
		window.htmlTestsDfd = new Deferred();
		iframe = domConstruct.create('iframe', null, document.body);
		win = iframe.contentWindow;

		// TODO: use __files prefix when supported by test proxy
		// iframe.src = '/__files' + require.toUrl('./box_quirks.html');
		iframe.src = require.toUrl('./box_quirks.html');

		return window.htmlTestsDfd.then(function () {
			doc = iframe.contentWindow.document;
			dojo.setContext(iframe.contentWindow, doc);
		});
	};

	suite.quirks.teardown = function () {
		dojo.setContext(window, document);
		win = window;
		doc = document;
		domConstruct.destroy(iframe);
		window.htmlTestsDfd = undefined;
	};

	registerSuite(suite);
});
