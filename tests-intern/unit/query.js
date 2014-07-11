define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo-testing/_base/array',
	'dojo-testing/dom',
	'dojo-testing',
	'dojo-testing/request/iframe',
	'dojo-testing/NodeList',
	'dojo-testing/sniff'
], function (
	require,
	registerSuite,
	assert,
	array,
	dom,
	dojo,
	iframe,
	NodeList,
	has
) {
	var iframe;
	var iframeDocument;

	function getIframeContent(quirks) {
		return [
			quirks ? '' : '<!DOCTYPE html>',
			'<html>',
			'<head>',
			(quirks && has('ie')) ? '<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />' : '',
			'<style type="text/css">',
			'	@import "../../../resources/dojo.css";',
			'</style>',
			'</head>',
			'<body class="upperclass">',
			'<h1>Testing dojo/query module.</h1>',
			'<div id="t" class="lowerclass">',
			'	<h3>h3 <span>span</span> endh3 </h3>',
			'	<!-- comment to throw things off -->',
			'	<div class="foo bar" id="_foo">',
			'		<h3>h3</h3>',
			'		<span id="foo"></span>',
			'		<span></span>',
			'	</div>',
			'	<h3>h3</h3>',
			'	<h3 class="baz foobar" title="thud">h3</h3>',
			'	<span class="fooBar baz foo"></span>',
			'	<span foo="bar"></span>',
			'	<span foo="baz bar thud"></span>',
			'	<!-- FIXME: should foo="bar-baz-thud" match? [foo$=thud] ??? -->',
			'	<span foo="bar-baz-thudish" id="silly:id::with:colons"></span>',
			'	<div id="container">',
			'		<div id="child1" qux="true"></div>',
			'		<div id="child2"></div>',
			'		<div id="child3" qux="true"></div>',
			'	</div>',
			'	<div id="silly~id" qux="true"></div>',
			'	<input id="notbug" name="bug" type="hidden" value="failed"> ',
			'	<input id="bug" type="hidden" value="passed"> ',
			'</div>',
			'<div id="t2" class="lowerclass">',
			'	<input type="checkbox" name="checkbox1" id="checkbox1" value="foo">',
			'	<input type="checkbox" name="checkbox2" id="checkbox2" value="bar" checked>',

			'	<input type="radio" disabled="true" name="radio" id="radio1" value="thinger">',
			'	<input type="radio" name="radio" id="radio2" value="stuff" checked>',
			'	<input type="radio" name="radio" id="radio3" value="blah">',
			'</div>',
			'<select id="t2select" multiple="multiple">',
			'	<option>0</option>',
			'	<option selected="selected">1</option>',
			'	<option selected="selected">2</option>',
			'</select>',
			'',
			'<iframe id="t3" name="t3" src="../../resources/blank.html"></iframe>',
			'<div id="t4">',
			'	<div id="one" class="subDiv">',
			'		<p class="one subP"><a class="subA">one</a></p>',
			'		<div id="two" class="subDiv">',
			'			<p class="two subP"><a class="subA">two</a></p>',
			'		</div>',
			'	</div>',
			'</div>',
			'<section></section>',
			'<div id="other">',
			'  <div id="abc55555"></div>',
			'  <div id="abd55555efg"></div>',
			'  <div id="55555abc"></div>',
			'  <div id="1"></div>',
			'  <div id="2c"></div>',
			'  <div id="3ch"></div>',
			'  <div id="4chr"></div>',
			'  <div id="5char"></div>',
			'  <div id="6chars"></div>',
			'</div>',

			'<div id="attrSpecialChars">',
			'	<select name="special">',
			'		<!-- tests for special characters in attribute values (characters that are part of query syntax) -->',
			'		<option value="a+b">1</option>',
			'		<option value="a~b">2</option>',
			'		<option value="a^b">3</option>',
			'		<option value="a,b">4</option>',
			'	</select>',

			'	<!-- tests for quotes in attribute values -->',
			'	<a href="foo=bar">hi</a>',
			'	<!-- tests for brackets in attribute values -->',
			'	<input name="data[foo][bar]">',
			'	<!-- attribute name with a dot, goes down separate code path -->',
			'	<input name="foo[0].bar">',
			'	<input name="test[0]">',
			'</div>',
			'</body>',
			'</html>'
		].join('\n');
	}

	function suiteSetup() {
		iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		iframeDocument = iframe.contentWindow.document;
		iframeDocument.open();
		iframeDocument.write(getIframeContent(false));

		// point dojo at the iframe
		dojo.setContext(iframe.contentWindow, iframeDocument);
	}

	function suiteTeardown() {
		document.body.removeChild(iframe);
		window.queryTestDfd = undefined;
		dojo.setContext(window, document);
	}

	function createDocument (xml) {
		var fauxXhr = { responseText: xml };
		if ('DOMParser' in window){
			var parser = new DOMParser();
			fauxXhr.responseXML = parser.parseFromString(xml, 'text/xml');
		}
		// kludge: code from dojo/_base/xhr contentHandler to create doc on IE
		var result = fauxXhr.responseXML;
		if (has('ie')) {
			// Needed for IE6-8
			if ((!result || !result.documentElement)) {
				var ms = function(n){ return 'MSXML' + n + '.DOMDocument'; };
				var dp = ['Microsoft.XMLDOM', ms(6), ms(4), ms(3), ms(2)];
				array.some(dp, function(p){
					try {
						var dom = new window.ActiveXObject(p);
						dom.async = false;
						dom.loadXML(fauxXhr.responseText);
						result = dom;
					}
					catch (e) {
						return false;
					}
					return true;
				});
			}
		}
		return result; // DOMDocument
	}

	function buildSuite (selector, query, quirks) {
		var suite = {
			name: 'dojo/query-' + selector + (quirks ? '-quirks' : ''),
			setup: suiteSetup,
			teardown: suiteTeardown
		};

		suite.css2 = {
			// Tests that should work for any selector engine (lite or acme)
			// .class, #id, tag, and star, attribute selectors, and child (>), descendant (space),and union (,)
			// combinators. With a native selector engine, the lite engine does not support pseudo classes.
			'sanity': function() {
				assert.strictEqual(query('h3').length, 4);
				assert.strictEqual(query('#t').length, 1);
				assert.strictEqual(query('#bug').length, 1);
				assert.strictEqual(query('#t h3').length, 4);
				assert.strictEqual(query('div#t').length, 1);
				assert.strictEqual(query('div#t h3').length, 4);
				assert.strictEqual(query('span#t').length, 0);
				assert.strictEqual(query('.bogus').length, 0);
				assert.strictEqual(query('.bogus', dom.byId('container')).length, 0);
				assert.strictEqual(query('#bogus').length, 0);
				assert.strictEqual(query('#bogus', dom.byId('container')).length, 0);
				assert.strictEqual(query('#t div > h3').length, 1);
				assert.strictEqual(query('.foo').length, 2);
				assert.strictEqual(query('.foo.bar').length, 1);
				assert.strictEqual(query('.baz').length, 2);
				assert.strictEqual(query('#t > h3').length, 3);
				
				// this fails on IE8 because qSA completely fails on unknown elements. not sure how to fix this other than completely disable qSA on IE8, which would be an unacceptable performance regression
				//assert.ok(query.matches(query('section')[0],'section'));

				assert.strictEqual(query('#baz,#foo,#t').length, 2);
				assert.strictEqual(query('#foo,#baz,#t').length, 2);
				assert.strictEqual(query(null).length, 0);

				//assert.strictEqual((query('#bug')).length, 1);
			},

			'syntactic equivalents': function () {
				assert.strictEqual(query('#t > *').length, 12);
				assert.strictEqual(query('.foo > *').length, 3);
			},

			'with a root, by ID': function () {
				assert.strictEqual(query('> *', 'container').length, 3);
				assert.strictEqual(query('> *, > h3', 'container').length, 3);
				assert.strictEqual(query('> h3', 't').length, 3);
			},

			'compound queries': function () {
				assert.strictEqual(query('.foo, .bar').length, 2);
				assert.strictEqual(query('.foo,.bar').length, 2);
			},

			'multiple class attribute': function () {
				assert.strictEqual(query('.foo.bar').length, 1);
				assert.strictEqual(query('.foo').length, 2);
				assert.strictEqual(query('.baz').length, 2);
			},

			'case sensitivity': function () {
				assert.strictEqual(query('span.baz').length, 1);
				assert.strictEqual(query('sPaN.baz').length, 1);
				assert.strictEqual(query('SPAN.baz').length, 1);
				// For quirks mode, case sensitivity is browser dependent, so querying .fooBar
				//  may return 1 or 2 entries. See #8775 and #14874 for details.
				if (!quirks) {
					assert.strictEqual(query('.fooBar').length, 1);
				}
			},

			'attribute selectors': function () {
				assert.strictEqual(query('[foo]').length, 3);
			},

			'attribute substring selectors': function () {
				assert.strictEqual((query('[foo$="thud"]')).length, 1);
				assert.strictEqual((query('[foo$=thud]')).length, 1);
				assert.strictEqual((query('[foo$="thudish"]')).length, 1);
				assert.strictEqual((query('#t [foo$=thud]')).length, 1);
				assert.strictEqual((query('#t [title$=thud]')).length, 1);
				assert.strictEqual((query('#t span[title$=thud ]')).length, 0);
				assert.strictEqual((query('[id$=\'55555\']')).length, 1);
				assert.strictEqual((query('[foo~="bar"]')).length, 2);
				assert.strictEqual((query('[ foo ~= "bar" ]')).length, 2);
				assert.strictEqual((query('[foo|="bar"]')).length, 2);
				assert.strictEqual((query('[foo|="bar-baz"]')).length, 1);
				assert.strictEqual((query('[foo|="baz"]')).length, 0);
			},

			'^=, *=': function () {
				// TODO
			},

			'descendant selectors': function () {
				assert.strictEqual(query('> *', 'container').length, 3);
				assert.strictEqual(query('> [qux]', 'container').length, 2);
				assert.strictEqual(query('> [qux]', 'container')[0].id, 'child1');
				assert.strictEqual(query('> [qux]', 'container')[1].id, 'child3');
				assert.strictEqual(query('> *', 'container').length, 3);
				assert.strictEqual(query('>*', 'container').length, 3);
				assert.strictEqual(query('#bug')[0].value, 'passed');
			},

			'bug 9071': function () {
				assert.strictEqual((query('a', 't4')).length, 2);
				assert.strictEqual((query('p a', 't4')).length, 2);
				assert.strictEqual((query('div p', 't4')).length, 2);
				assert.strictEqual((query('div p a', 't4')).length, 2);
				assert.strictEqual((query('.subA', 't4')).length, 2);
				assert.strictEqual((query('.subP .subA', 't4')).length, 2);
				assert.strictEqual((query('.subDiv .subP', 't4')).length, 2);
				assert.strictEqual((query('.subDiv .subP .subA', 't4')).length, 2);
			},

			'failed scope arg': function () {
				assert.strictEqual((query('*', 'thinger')).length, 0);
				assert.strictEqual((query('div#foo').length), 0);
			},

			
			'escaping special characters with quotes': function () {
				// bug 10651 (http://www.w3.org/TR/CSS21/syndata.html#strings)
				assert.strictEqual(query('option[value="a+b"]', 'attrSpecialChars').length, 1);
				assert.strictEqual(query('option[value="a~b"]', 'attrSpecialChars').length, 1);
				assert.strictEqual(query('option[value="a^b"]', 'attrSpecialChars').length, 1);
				assert.strictEqual(query('option[value="a,b"]', 'attrSpecialChars').length, 1);
			},

			'selector with substring that contains equals sign': function () {
				// bug 7479
				assert.strictEqual(query('a[href*="foo=bar"]', 'attrSpecialChars').length, 1);
			},

			'selector with substring that contains brackets': function () {
				// bug 9193, 11189, 13084
				assert.strictEqual(query('input[name="data[foo][bar]"]', 'attrSpecialChars').length, 1);
				assert.strictEqual(query('input[name="foo[0].bar"]', 'attrSpecialChars').length, 1);
				assert.strictEqual(query('input[name="test[0]"]', 'attrSpecialChars').length, 1);
			},

			'escaping special characters with backslashes': function () {
				// http://www.w3.org/TR/CSS21/syndata.html#characters
				// selector with substring that contains brackets (bug 9193, 11189, 13084)
				assert.strictEqual(query('input[name=data\\[foo\\]\\[bar\\]]', 'attrSpecialChars').length, 1);
				assert.strictEqual(query('input[name=foo\\[0\\]\\.bar]', 'attrSpecialChars').length, 1);
			},

			'cross-document queries': function () {
				var doc = iframe.contentWindow.frames.t3.document;
				doc.open();
				doc.write([
					'<html><head>',
					'<title>inner document</title>',
					'</head>',
					'<body>',
					'<div id="st1"><h3>h3 <span>span <span> inner <span>inner-inner</span></span></span> endh3 </h3></div>',
					'</body>',
					'</html>'
				].join(''));

				assert.strictEqual(query('h3', dom.byId('st1', doc)).length, 1);
				// use a long query to force a test of the XPath system on FF. see bug #7075
				assert.strictEqual(query('h3 > span > span > span', dom.byId('st1', doc)).length, 1);
				assert.strictEqual(query('h3 > span > span > span', doc.body.firstChild).length, 1);
			},

			'silly IDs': function () {
				// escaping of ':' chars inside an ID
				assert.ok(iframeDocument.getElementById('silly:id::with:colons'), 'getElementById');
				assert.strictEqual(query('#silly\\:id\\:\\:with\\:colons').length, 1, 'query("#silly\\:id\\:\\:with\\:colons")');
				assert.strictEqual(query('#silly\\~id').length, 1, 'query("#silly\\~id")');
			},

			'NodeList identity': function () {
				// TODO: this test was only in queryQuirks.html...why?
				var foo = new NodeList([ dom.byId('container') ]);
				assert.strictEqual(foo, query(foo));
			},

			'xml': function () {
				var doc = createDocument([
					'<ResultSet>',
					'<Result>One</Result>',
					'<RESULT>Two</RESULT>',
					'<result><nested>Three</nested></result>',
					'<result>Four</result>',
					'</ResultSet>'
				].join(''));
				var de = doc.documentElement;

				assert.strictEqual(query('result', de).length, 2, 'all lower');

				//assert.strictEqual(query('result>nested', de).length, 1, 'nested XML');
				assert.strictEqual(query('Result', de).length, 1, 'mixed case');
				assert.strictEqual(query('RESULT', de).length, 1, 'all upper');
				assert.strictEqual(query('resulT', de).length, 0, 'no match');
				assert.strictEqual(query('rEsulT', de).length, 0, 'no match');
			},

			'xml attrs': function () {
				if (!has('ie')) {	// remove if() when #14880 is fixed
					var doc = createDocument([
						'<ResultSet>',
						'<RESULT thinger="blah">ONE</RESULT>',
						'<RESULT thinger="gadzooks"><CHILD>Two</CHILD></RESULT>',
						'</ResultSet>'
					].join(''));
					var de = doc.documentElement;

					assert.strictEqual(query('RESULT', de).length, 2, 'result elements');
					assert.strictEqual(query('RESULT[THINGER]', de).length, 0, 'result elements with attrs (wrong)');
					assert.strictEqual(query('RESULT[thinger]', de).length, 2, 'result elements with attrs');
					assert.strictEqual(query('RESULT[thinger=blah]', de).length, 1, 'result elements with attr value');
					assert.strictEqual(query('RESULT > CHILD', de).length, 1, 'Using child operator');
				} // remove when #14880 is fixed
			},

			'smoke test': function () {
				var i = query('div');
				i.sort(function(a, b) {
					return 1;
				});
			}
		};

		if (selectors.indexOf(selector) < selectors.indexOf('css2.1')) {
			return suite;
		}

		suite['css2.1'] = {
			// Tests for CSS2.1+, and also CSS2 pseudo selectors (which aren't supported by selector=css2 or
			// selector=lite)
			'first-child': function () {
				assert.strictEqual((query('h1:first-child')).length, 1);
				assert.strictEqual((query('h3:first-child')).length, 2);
			},

			'+ sibling selector': function () {
				assert.strictEqual((query('.foo+ span')).length, 1);
				assert.strictEqual((query('.foo+span')).length, 1);
				assert.strictEqual((query('.foo +span')).length, 1);
				assert.strictEqual((query('.foo + span')).length, 1);
			}
		};

		if (selectors.indexOf(selector) < selectors.indexOf('css3')) {
			return suite;
		}

		suite.css3 = {
			// Tests for CSS3+
			'sub-selector parsing': function () {
				assert.strictEqual(query('#t span.foo:not(:first-child)').length, 1);
			},

			'~ sibling selector': function () {
				assert.strictEqual((query('.foo~ span')).length, 4);
				assert.strictEqual((query('.foo~span')).length, 4);
				assert.strictEqual((query('.foo ~span')).length, 4);
				assert.strictEqual((query('.foo ~ span')).length, 4);
				assert.strictEqual((query('#foo~ *')).length, 1);
				assert.strictEqual((query('#foo ~*')).length, 1);
				assert.strictEqual((query('#foo ~*')).length, 1);
				assert.strictEqual((query('#foo ~ *')).length, 1);
				// assert.strictEqual((query('[ foo ~= \"\\'bar\\'\" ]')).length, 0);
			},

			'nth-child tests': function () {
				assert.strictEqual(query('#t > h3:nth-child(odd)').length, 2);
				assert.strictEqual(query('#t h3:nth-child(odd)').length, 3);
				assert.strictEqual(query('#t h3:nth-child(2n+1)').length, 3);
				assert.strictEqual(query('#t h3:nth-child(even)').length, 1);
				assert.strictEqual(query('#t h3:nth-child(2n)').length, 1);
				assert.strictEqual(query('#t h3:nth-child(2n+3)').length, 1);
				assert.strictEqual(query('#t h3:nth-child(1)').length, 2);
				assert.strictEqual(query('#t > h3:nth-child(1)').length, 1);
				assert.strictEqual(query('#t :nth-child(3)').length, 3);
				assert.strictEqual(query('#t > div:nth-child(1)').length, 0);
				assert.strictEqual(query('#t span').length, 7);
				assert.strictEqual(query('#t > *:nth-child(n+10)').length, 3);
				assert.strictEqual(query('#t > *:nth-child(n+12)').length, 1);
				assert.strictEqual(query('#t > *:nth-child(-n+10)').length, 10);
				assert.strictEqual(query('#t > *:nth-child(-2n+10)').length, 5);
				assert.strictEqual(query('#t > *:nth-child(2n+2)').length, 6);
				assert.strictEqual(query('#t > *:nth-child(2n+4)').length, 5);
				assert.strictEqual(query('#t > *:nth-child(2n+4)').length, 5);
				assert.strictEqual(query('#t> *:nth-child(2n+4)').length, 5);

				if (!quirks) {
					// Disabled in quirks mode until #14879 is fixed
					assert.strictEqual(query('#t > *:nth-child(n-5)').length, 12);
					assert.strictEqual(query('#t >*:nth-child(n-5)').length, 12);
				}
				
				assert.strictEqual(query('#t > *:nth-child(2n-5)').length, 6);
				assert.strictEqual(query('#t>*:nth-child(2n-5)').length, 6);
				// TODO: uncomment when #14879 fixed
				// assert.strictEqual(query('.foo:nth-child(2)')[0], dom.byId('_foo'));

				// assert.strictEqual(query(':nth-child(2)')[0], query('style')[0]);
			},

			':checked pseudo-selector': function () {
				assert.strictEqual(query('#t2 > :checked').length, 2);
				assert.strictEqual(query('#t2 > input[type=checkbox]:checked')[0], dom.byId('checkbox2'));
				assert.strictEqual(query('#t2 > input[type=radio]:checked')[0], dom.byId('radio2'));
				// This :checked selector is only defined for elements that have the checked property, option elements are not specified by the spec (http://www.w3.org/TR/css3-selectors/#checked) and not universally supported 
				//assert.strictEqual(query('#t2select option:checked').length, 2);
			},

			':enabled/:disabled psuedo-selectors': function () {
				assert.strictEqual(query('#radio1:disabled').length, 1);
				assert.strictEqual(query('#radio1:enabled').length, 0);
				assert.strictEqual(query('#radio2:disabled').length, 0);
				assert.strictEqual(query('#radio2:enabled').length, 1);
			},


			':empty pseudo-selector': function () {
				assert.strictEqual(query('#t > span:empty').length, 4);
				assert.strictEqual(query('#t span:empty').length, 6);
				assert.strictEqual(query('h3 span:empty').length, 0);
				assert.strictEqual(query('h3 :not(:empty)').length, 1);
			}
		};

		if (selectors.indexOf(selector) < selectors.indexOf('acme')) {
			return suite;
		}

		suite.acme = {
			// Tests for ACME specific functionality (not part of CSS3)
			'case insensitive class selectors': function () {
				// (#8775, #14874).
				// In standards mode documents, querySelectorAll() is case-sensitive about class selectors,
				// but acme is case-insensitive for backwards compatibility.
				assert.strictEqual(query('.fooBar').length, 1);
			},

			'sub-selector parsing': function () {
				// TODO: move this test to CSS3 section when #14875 is fixed
				assert.strictEqual(query('#t span.foo:not(span:first-child)').length, 1);
			},

			'special characters in attribute values without backslashes': function () {
				// supported by acme but apparently not standard, see http://www.w3.org/TR/CSS21/syndata.html#characters
				// bug 10651
				assert.strictEqual(query('option[value=a+b]', 'attrSpecialChars').length, 1, 'value=a+b');
				assert.strictEqual(query('option[value=a~b]', 'attrSpecialChars').length, 1, 'value=a~b');
				assert.strictEqual(query('option[value=a^b]', 'attrSpecialChars').length, 1, 'value=a^b');
			},

			'implied * after >': function () {
				// (non-standard syntax)
				assert.strictEqual(query('#t >').length, 12);
				assert.strictEqual(query('.foo >').length, 3);
				assert.strictEqual(query('>', 'container').length, 3);
				assert.strictEqual(query('> .not-there').length, 0);
				assert.strictEqual(query('#foo ~').length, 1);
				assert.strictEqual(query('#foo~').length, 1);
			},

			'implied * before and after + and ~': function () {
				// (non-standard syntax)
				assert.strictEqual(query('+', 'container').length, 1);
				assert.strictEqual(query('~', 'container').length, 3);
			},

			'check for correct document order': function () {
				// not sure if this is guaranteed by css3, so putting in acme section
				var inputs = query('.upperclass .lowerclass input');
				assert.strictEqual(inputs[0].id, 'notbug');
				assert.strictEqual(inputs[1].id, 'bug');
				assert.strictEqual(inputs[2].id, 'checkbox1');
				assert.strictEqual(inputs[3].id, 'checkbox2');
				assert.strictEqual(inputs[4].id, 'radio1');
				assert.strictEqual(inputs[5].id, 'radio2');
				assert.strictEqual(inputs[6].id, 'radio3');
			},

			'xml nth-child': function () {
				// TODO: move to css2 section after #7869 fixed for lite engine (on IE)
				var doc = createDocument([
					'<ResultSet>',
					'<result>One</result>',
					'<result>Two</result>',
					'<result>Three</result>',
					'<result>Four</result>',
					'</ResultSet>'
				].join(''));
				var de = doc.documentElement;
				assert.strictEqual(query('result:nth-child(4)', de)[0].firstChild.data, 'Four', 'fourth child');
			}
		};

		return suite;
	}

	var selectors = [ 'lite', 'css2', 'css2.1', 'css3', 'acme' ];
	array.forEach(selectors, function (selector) {
		var moduleId = 'dojo-testing/query!' + selector;
		require([ moduleId ], function (queryModule) {
			registerSuite(buildSuite(selector, queryModule));
			registerSuite(buildSuite(selector, queryModule, true));
		});
	});
});