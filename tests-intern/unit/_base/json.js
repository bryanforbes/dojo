define([
	'intern!object',
	'intern/chai!assert',
	'dojo/_base/json'
], function (registerSuite, assert, json) {
	registerSuite({
		name: 'dojo/_base/json',
		'toAndFromJson': function () {
			// Not testing dojo.toJson() on its own since Rhino will output the object properties in a different order.
			// Still valid json, but just in a different order than the source string.

			// take a json-compatible object, convert it to a json string, then put it back into json.
			var testObj = {
				a: 'a',
				b: 1,
				c: 'c',
				d: 'd',
				e: {
					e1: 'e1',
					e2: 2
				},
				f: [1, 2, 3],
				g: 'g',
				h: {
					h1: { h2: { h3: 'h3' }}
				},
				i: [[0, 1, 2], [3], [4]]
			},
			obj = json.fromJson(json.toJson(testObj));

			assert.equal('a', obj.a);
			assert.equal(1, obj.b);
			assert.equal('c', obj.c);
			assert.equal('d', obj.d);
			assert.equal('e1', obj.e.e1);
			assert.equal(2, obj.e.e2);
			assert.equal(1, obj.f[0]);
			assert.equal(2, obj.f[1]);
			assert.equal(3, obj.f[2]);
			assert.equal('g', obj.g);
			assert.equal('h3', obj.h.h1.h2.h3);
			assert.lengthOf(obj.i[0], 3);
			assert.lengthOf(obj.i[1], 1);
			assert.lengthOf(obj.i[2], 1);

			var badJson;
			try {
				badJson = json.fromJson('bad json'); // should throw an exception, and not set badJson
			} catch (e) {}
			assert.isUndefined(badJson);
		},

		'dojoExtendedJson': function () {
			var testObj = {
				ex1: {
					b: 3,
					json: function () {
						return 'json' + this.b;
					}
				},
				ex2: {
					b: 4,
					__json__: function () {
						return '__json__' + this.b;
					}
				}
			},
			testStr = json.toJson(testObj);
			assert.equal('{"ex1":"json3","ex2":"__json__4"}', testStr);
		},

		'prettyPrintJson': function () {
			if (typeof JSON === 'undefined') { // only test our JSON stringifier
				var testObj = {array: [1, 2, { a: 4, b: 4 }]};
				var testStr = json.toJson(testObj, true);
				assert.equal('{\n\t\"array\": [\n\t\t1,\n\t\t2,\n\t\t{\n\t\t\t\"a\": 4,\n\t\t\t\"b\": 4\n\t\t}\n\t]\n}', testStr);
			}
		},

		'evalJson': function () {
			var testStr = '{func: function(){}, number: Infinity}';
			var testObj = json.fromJson(testStr);

			assert.equal('function', typeof testObj.func);
			assert.equal('number', typeof testObj.number);
		},

		'toJsonStringObject': function () {
			assert.equal('"hello"', json.toJson('hello'));
		}
	});
});
