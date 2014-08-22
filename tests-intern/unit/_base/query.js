define([
	'intern!object',
	'intern/chai!assert',
	'require',
	'dojo/Deferred',
	'dojo-testing'
], function (registerSuite, assert, require, Deferred, dojo) {
	//
	// Legacy tests for dojo/_base/query.  Replaced by dojo/tests/query/query.html.
	// TODO: remove in 2.0.
	//

	var iframe;
	var iframeDocument;

	function createDocument (xml) {
		var fauxXhr = { responseText: xml };
		if ('DOMParser' in dojo.global) {
			var parser = new DOMParser();
			fauxXhr.responseXML = parser.parseFromString(xml, 'text/xml');
		}
		// kludge: use dojo.xhr contentHandler for XML to process IE XMLDOC as needed
		return dojo._contentHandlers['xml'](fauxXhr); // DOMDocument
	}

	registerSuite({
		name: 'dojo/_base/query',

		setup: function () {
			iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			window.queryTestDfd = new Deferred();

			iframe.src = require.toUrl('./query.html');
			return window.queryTestDfd.promise.then(function () {
				iframeDocument = iframe.contentWindow.document;

				// point dojo at the iframe
				dojo.setContext(iframe.contentWindow, iframeDocument);
			});
		},

		teardown: function () {
			document.body.removeChild(iframe);
			window.queryTestDfd = undefined;
			dojo.setContext(window, document);
		},

		basic: function () {
			// basic sanity checks
			assert.strictEqual(4, (dojo.query('h3')).length);
			assert.strictEqual(1, (dojo.query('h1:first-child')).length);
			assert.strictEqual(2, (dojo.query('h3:first-child')).length);
			assert.strictEqual(1, (dojo.query('#t')).length);
			assert.strictEqual(1, (dojo.query('#bug')).length);
			assert.strictEqual(4, (dojo.query('#t h3')).length);
			assert.strictEqual(1, (dojo.query('div#t')).length);
			assert.strictEqual(4, (dojo.query('div#t h3')).length);
			assert.strictEqual(0, (dojo.query('span#t')).length);
			assert.strictEqual(0, (dojo.query('.bogus')).length);
			assert.strictEqual(0, (dojo.query('.bogus', dojo.byId('container'))).length);
			assert.strictEqual(0, (dojo.query('#bogus')).length);
			assert.strictEqual(0, (dojo.query('#bogus', dojo.byId('container'))).length);
			assert.strictEqual(1, (dojo.query('#t div > h3')).length);
			assert.strictEqual(2, (dojo.query('.foo')).length);
			assert.strictEqual(1, (dojo.query('.foo.bar')).length);
			assert.strictEqual(2, (dojo.query('.baz')).length);
			assert.strictEqual(3, (dojo.query('#t > h3')).length);

			assert.strictEqual(2, (dojo.query('#baz,#foo,#t')).length);

			assert.strictEqual(1, dojo.query('.fooBar').length);

			// syntactic equivalents
			assert.strictEqual(12, (dojo.query('#t > *')).length);
			assert.strictEqual(12, (dojo.query('#t >')).length);
			assert.strictEqual(3, (dojo.query('.foo >')).length);
			assert.strictEqual(3, (dojo.query('.foo > *')).length);

			// with a root, by ID
			assert.strictEqual(3, (dojo.query('> *', 'container')).length);
			assert.strictEqual(3, (dojo.query('> h3', 't')).length);

			// compound queries
			assert.strictEqual(2, (dojo.query('.foo, .bar')).length);
			assert.strictEqual(2, (dojo.query('.foo,.bar')).length);

			// multiple class attribute
			assert.strictEqual(1, (dojo.query('.foo.bar')).length);
			assert.strictEqual(2, (dojo.query('.foo')).length);
			assert.strictEqual(2, (dojo.query('.baz')).length);

			// case sensitivity
			assert.strictEqual(1, (dojo.query('span.baz')).length);
			assert.strictEqual(1, (dojo.query('sPaN.baz')).length);
			assert.strictEqual(1, (dojo.query('SPAN.baz')).length);
			assert.strictEqual(1, (dojo.query('[class = "foo bar"]')).length);
			assert.strictEqual(2, (dojo.query('[foo~="bar"]')).length);
			assert.strictEqual(2, (dojo.query('[ foo ~= "bar" ]')).length);

			// "t.is(0, (dojo.query('[ foo ~= \"\\'bar\\'\" ]')).length);
			assert.strictEqual(3, (dojo.query('[foo]')).length);
			assert.strictEqual(1, (dojo.query('[foo$="thud"]')).length);
			assert.strictEqual(1, (dojo.query('[foo$=thud]')).length);
			assert.strictEqual(1, (dojo.query('[foo$="thudish"]')).length);
			assert.strictEqual(1, (dojo.query('[id$="55555"]')).length);
			assert.strictEqual(1, (dojo.query('#t [foo$=thud]')).length);
			assert.strictEqual(1, (dojo.query('#t [ title $= thud ]')).length);
			assert.strictEqual(0, (dojo.query('#t span[ title $= thud ]')).length);
			assert.strictEqual(2, (dojo.query('[foo|="bar"]')).length);
			assert.strictEqual(1, (dojo.query('[foo|="bar-baz"]')).length);
			assert.strictEqual(0, (dojo.query('[foo|="baz"]')).length);
			assert.strictEqual(dojo.byId('_foo'), dojo.query('.foo:nth-child(2)')[0]);
			assert.strictEqual(dojo.query('style')[0], dojo.query(':nth-child(2)')[0]);

			// descendant selectors
			assert.strictEqual(3, dojo.query('>', 'container').length);
			assert.strictEqual(0, dojo.query('> .not-there').length);
			assert.strictEqual(3, dojo.query('> *', 'container').length);
			assert.strictEqual(2, dojo.query('> [qux]', 'container').length);
			assert.strictEqual('child1', dojo.query('> [qux]', 'container')[0].id);
			assert.strictEqual('child3', dojo.query('> [qux]', 'container')[1].id);
			assert.strictEqual(3, dojo.query('>', 'container').length);
			assert.strictEqual(3, dojo.query('> *', 'container').length);
			assert.strictEqual(3, dojo.query('>*', 'container').length);
			assert.strictEqual('passed', dojo.query('#bug')[0].value);

			// bug 9071
			assert.strictEqual(2, (dojo.query('a', 't4')).length);
			assert.strictEqual(2, (dojo.query('p a', 't4')).length);
			assert.strictEqual(2, (dojo.query('div p', 't4')).length);
			assert.strictEqual(2, (dojo.query('div p a', 't4')).length);
			assert.strictEqual(2, (dojo.query('.subA', 't4')).length);
			assert.strictEqual(2, (dojo.query('.subP .subA', 't4')).length);
			assert.strictEqual(2, (dojo.query('.subDiv .subP', 't4')).length);
			assert.strictEqual(2, (dojo.query('.subDiv .subP .subA', 't4')).length);

			// failed scope arg
			assert.strictEqual(0, (dojo.query('*', 'thinger')).length);
			assert.strictEqual(0, (dojo.query('div#foo').length));

			// sibling selectors
			assert.strictEqual(1, dojo.query('+', 'container').length);
			assert.strictEqual(3, dojo.query('~', 'container').length);
			assert.strictEqual(1, (dojo.query('.foo+ span')).length);
			assert.strictEqual(1, (dojo.query('.foo+span')).length);
			assert.strictEqual(1, (dojo.query('.foo +span')).length);
			assert.strictEqual(1, (dojo.query('.foo + span')).length);
			assert.strictEqual(4, (dojo.query('.foo~ span')).length);
			assert.strictEqual(4, (dojo.query('.foo~span')).length);
			assert.strictEqual(4, (dojo.query('.foo ~span')).length);
			assert.strictEqual(4, (dojo.query('.foo ~ span')).length);
			assert.strictEqual(1, (dojo.query('#foo~ *')).length);
			assert.strictEqual(1, (dojo.query('#foo ~*')).length);
			assert.strictEqual(1, (dojo.query('#foo ~*')).length);
			assert.strictEqual(1, (dojo.query('#foo ~ *')).length);
			assert.strictEqual(1, (dojo.query('#foo ~')).length);
			assert.strictEqual(1, (dojo.query('#foo~')).length);

			// sub-selector parsing
			assert.strictEqual(1, dojo.query('#t span.foo:not(span:first-child)').length);
			assert.strictEqual(1, dojo.query('#t span.foo:not(:first-child)').length);

			// nth-child tests
			assert.strictEqual(2, dojo.query('#t > h3:nth-child(odd)').length);
			assert.strictEqual(3, dojo.query('#t h3:nth-child(odd)').length);
			assert.strictEqual(3, dojo.query('#t h3:nth-child(2n+1)').length);
			assert.strictEqual(1, dojo.query('#t h3:nth-child(even)').length);
			assert.strictEqual(1, dojo.query('#t h3:nth-child(2n)').length);
			assert.strictEqual(1, dojo.query('#t h3:nth-child(2n+3)').length);
			assert.strictEqual(2, dojo.query('#t h3:nth-child(1)').length);
			assert.strictEqual(1, dojo.query('#t > h3:nth-child(1)').length);
			assert.strictEqual(3, dojo.query('#t :nth-child(3)').length);
			assert.strictEqual(0, dojo.query('#t > div:nth-child(1)').length);
			assert.strictEqual(7, dojo.query('#t span').length);
			assert.strictEqual(3, dojo.query('#t > *:nth-child(n+10)').length);
			assert.strictEqual(1, dojo.query('#t > *:nth-child(n+12)').length);
			assert.strictEqual(10, dojo.query('#t > *:nth-child(-n+10)').length);
			assert.strictEqual(5, dojo.query('#t > *:nth-child(-2n+10)').length);
			assert.strictEqual(6, dojo.query('#t > *:nth-child(2n+2)').length);
			assert.strictEqual(5, dojo.query('#t > *:nth-child(2n+4)').length);
			assert.strictEqual(5, dojo.query('#t > *:nth-child(2n+4)').length);
			assert.strictEqual(5, dojo.query('#t> *:nth-child(2n+4)').length);
			assert.strictEqual(12, dojo.query('#t > *:nth-child(n-5)').length);
			assert.strictEqual(12, dojo.query('#t >*:nth-child(n-5)').length);
			assert.strictEqual(6, dojo.query('#t > *:nth-child(2n-5)').length);
			assert.strictEqual(6, dojo.query('#t>*:nth-child(2n-5)').length);

			// :checked pseudo-selector
			assert.strictEqual(2, dojo.query('#t2 > :checked').length);
			assert.strictEqual(dojo.byId('checkbox2'), dojo.query('#t2 > input[type=checkbox]:checked')[0]);
			assert.strictEqual(dojo.byId('radio2'), dojo.query('#t2 > input[type=radio]:checked')[0]);
			assert.strictEqual(2, dojo.query('#t2select option:checked').length);
		},

		'special chars in attr': function () {
			// special characters in attribute values
			// bug 10651
			assert.strictEqual(1, dojo.query('option[value=a+b]', 'attrSpecialChars').length, 'value=a+b');
			assert.strictEqual(1, dojo.query('option[value=a~b]', 'attrSpecialChars').length, 'value=a~b');
			assert.strictEqual(1, dojo.query('option[value=a^b]', 'attrSpecialChars').length, 'value=a^b');
			assert.strictEqual(1, dojo.query('option[value=\"a+b\"]', 'attrSpecialChars').length, 'value="a^b"');
			assert.strictEqual(1, dojo.query('option[value=\"a~b\"]', 'attrSpecialChars').length, 'value="a~b"');
			assert.strictEqual(1, dojo.query('option[value=\"a^b\"]', 'attrSpecialChars').length, 'value="a^b"');

			// selector with substring that contains equals sign (bug 7479)
			assert.strictEqual(1, dojo.query('a[href*="foo=bar"]', 'attrSpecialChars').length, 'a[href*="foo=bar"]');

			// selector with substring that contains brackets (bug 9193, 11189, 13084)
			// note: inner quotes don't work in second dojo.query(), not sure why
			assert.strictEqual(1, dojo.query('input[name="data[foo][bar]"]', 'attrSpecialChars').length, 'data[foo][bar]');
			assert.strictEqual(1, dojo.query('input[name=data\\[foo\\]\\[bar\\]]', 'attrSpecialChars').length, 'data\\[foo\\]\\[bar\\]');
			assert.strictEqual(1, dojo.query('input[name="foo\\[0\\].bar"]', 'attrSpecialChars').length, 'foo[0].bar');
			assert.strictEqual(1, dojo.query('input[name="test[0]"]', 'attrSpecialChars').length, 'test[0]');
		},

		'DOM order': function () {
			// check for correct document order
			var inputs = dojo.query('.upperclass .lowerclass input');
			assert.strictEqual('notbug', inputs[0].id);
			assert.strictEqual('bug', inputs[1].id);
			assert.strictEqual('checkbox1', inputs[2].id);
			assert.strictEqual('checkbox2', inputs[3].id);
			assert.strictEqual('radio1', inputs[4].id);
			assert.strictEqual('radio2', inputs[5].id);
			assert.strictEqual('radio3', inputs[6].id);
		},

		'cross document query': function () {
			var t3 = iframe.contentWindow.frames['t3'];
			var doc = t3.document;
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

			assert.strictEqual(1, dojo.query('h3', dojo.byId('st1', doc)).length);
			// use a long query to force a test of the XPath system on FF. see bug #7075
			assert.strictEqual(1, dojo.query('h3 > span > span > span', dojo.byId('st1', doc)).length);
			assert.strictEqual(1, dojo.query('h3 > span > span > span', doc.body.firstChild).length);
		},

		'emtpy pseudo-selector': function () {
			// :empty pseudo-selector
			assert.strictEqual(4, dojo.query('#t > span:empty').length);
			assert.strictEqual(6, dojo.query('#t span:empty').length);
			assert.strictEqual(0, dojo.query('h3 span:empty').length);
			assert.strictEqual(1, dojo.query('h3 :not(:empty)').length);
		},

		'silly IDs': function () {
			// escaping of ":" chars inside an ID
			assert.ok(iframeDocument.getElementById('silly:id::with:colons'));
			assert.strictEqual(1, dojo.query('#silly\\:id\\:\\:with\\:colons').length);
		},

		'NodeList identity': function () {
			var foo = new dojo.NodeList([dojo.byId('container')]);
			assert.strictEqual(foo, dojo.query(foo));
		},

		xml: function () {
			var doc = createDocument([
				'<ResultSet>',
				'<Result>One</Result>',
				'<RESULT>Two</RESULT>',
				'<result>Three</result>',
				'<result>Four</result>',
				'</ResultSet>'
			].join('')
			);
			var de = doc.documentElement;

			assert.strictEqual(2, dojo.query('result', de).length, 'all lower');
			assert.strictEqual(1, dojo.query('Result', de).length, 'mixed case');
			assert.strictEqual(1, dojo.query('RESULT', de).length, 'all upper');
			assert.strictEqual(0, dojo.query('resulT', de).length, 'no match');
			assert.strictEqual(0, dojo.query('rEsulT', de).length, 'no match');
		},

		'xml attrs': function () {
			var doc = createDocument([
				'<ResultSet>',
				'<RESULT thinger="blah">ONE</RESULT>',
				'<RESULT thinger="gadzooks"><CHILD>Two</CHILD></RESULT>',
				'</ResultSet>'
			].join(''));
			var de = doc.documentElement;

			assert.strictEqual(2, dojo.query('RESULT', de).length, 'result elements');
			assert.strictEqual(0, dojo.query('RESULT[THINGER]', de).length, 'result elements with attrs (wrong)');
			assert.strictEqual(2, dojo.query('RESULT[thinger]', de).length, 'result elements with attrs');
			assert.strictEqual(1, dojo.query('RESULT[thinger=blah]', de).length, 'result elements with attr value');
			assert.strictEqual(1, dojo.query('RESULT > CHILD', de).length, 'Using child operator');
		},

		sort: function () {
			var i = dojo.query('div');
			// smoke test
			assert.doesNotThrow(function () {
				i.sort(function () { return 1; });
			});
		}
	});
});
