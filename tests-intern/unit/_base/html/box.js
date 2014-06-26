define([

	'intern!object',
	'intern/chai!assert',
	'intern/dojo/dom-construct',
	'intern/dojo/dom-style',
	'intern/dojo/_base/lang',
	'intern/dojo/_base/array',
	'intern/dojo/sniff',
	'dojo'

], function (
	registerSuite,
	assert,
	domConstruct,
	domStyle,
	lang,
	arrayUtil,
	has,
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
		{margin: margin},
		{border: border},
		{padding: padding},
		{margin: margin, border: border},
		{margin: margin, padding: padding},
		{border: border, padding: padding},
		{margin: margin, border: border, padding: padding}
	];


	function sameBox(inBox1, inBox2) {
		for (var i in inBox1) {
			if (inBox1[i] !== inBox2[i]) {
				return false;
			}
		}
		return true;
	}

	function reciprocalMarginBoxTest(inNode, inBox) {
		var s = inBox || dojo.marginBox(inNode);
		dojo.marginBox(inNode, s);
		var e = dojo.marginBox(inNode);
		return sameBox(s, e);
	}

	function fitTest(inParent, inChild) {
		var pcb = dojo.contentBox(inParent);
		return reciprocalMarginBoxTest(inChild, pcb);
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
		var n = document.createElement(inElement || 'div');
		(inParent || document.body).appendChild(n);
		dojo.mixin(n.style, inStyle);
		return n;
	}

	var _testTopInc = 0;
	var _testTop = 150;
	var _testInitTop = 250;
	function styleIncTop(inStyle) {
		inStyle = dojo.mixin({}, inStyle || {});
		inStyle.top = (_testInitTop + _testTop * _testTopInc) + 'px';
		_testTopInc++;
		return inStyle;
	}

	function removeTestNode(inNode) {
		// leave nodes for inspection or don't return to delete them
		return;
		inNode = dojo.byId(inNode);
		inNode.parentNode.removeChild(inNode);
		_testTopInc--;
	}

	function testAndCallback(inTest, inAssert, inOk, inErr) {
		inTest.assertTrue(inAssert);
		if (inAssert) {
			inOk && inOk();
		} else {
			inErr && inErr();
		}
	}

	// args are (styles, parent, element name, no default)
	function mixCreateElementArgs(inMix, inArgs) {
		var args = [{}];
		if (inArgs && inArgs[0]) {
			dojo.mixin(args[0], inArgs[0]);
		}
		if (inMix.length) {
			dojo.mixin(args[0], inMix[0] || {});
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
		for (var i = 0, s, p, c; (s = testStyles[i]); i++) {
			p = createStyledElement.apply(this, mixCreateElementArgs([styleIncTop(s)], inParentArgs));
			c = createStyledElement.apply(this, mixCreateElementArgs([{}, p], inChildArgs));
			inFunc && inFunc(p, c);
		}
	}

	function createStyledParentChildren(inParentArgs, inChildArgs, inFunc) {
		for (var i = 0, s, p; (s = testStyles[i]); i++) {
			for (var j = 0, sc, c; (sc = testStyles[j]); j++) {
				p = createStyledElement.apply(this, mixCreateElementArgs([styleIncTop(s)], inParentArgs));
				c = createStyledElement.apply(this, mixCreateElementArgs([sc, p], inChildArgs));
				inFunc && inFunc(p, c);
			}
		}

		for (i = 0, s, p, c; (s = testStyles[i]); i++) {
			p = createStyledElement.apply(this, mixCreateElementArgs([styleIncTop(s)], inParentArgs));
			c = createStyledElement.apply(this, mixCreateElementArgs([{}, p], inChildArgs));
			inFunc && inFunc(p, c);
		}
	}


	function runFitTest(inTest, inParentStyles, inChildStyles) {
		createStyledParentChildren([inParentStyles], [inChildStyles], function(p, c) {
			testAndCallback(inTest, fitTest(p, c), function() {removeTestNode(p); });
		});
	}

	registerSuite({
		name: 'dojo/_base/html/box',

		'reciprocal': function () {
			createStyledNodes([], function(n) {
				testAndCallback(t, reciprocalMarginBoxTest(n), function() {
					removeTestNode(n);
				});
			});

		}
	});

});
