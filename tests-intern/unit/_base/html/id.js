define([
	'intern!object',
	'intern/chai!assert',
	'dojo/dom-construct',
	'dojo/_base/array',
	'dojo'
], function (
	registerSuite,
	assert,
	domConstruct,
	arrayUtil,
	dojo
) {
	var _rootElement;

	registerSuite({
		name: 'dojo/_base/html/id',

		setup: function () {
			var testElements = domConstruct.toDom(
				'<form name="foobar">' +
					'<input type="text" name="baz" value="baz1">' +
					'<input type="text" name="baz" value="baz2">' +
				'</form>' +
				'<form name="dude"></form>' +
				'<form name="ranch">' +
					'<input type="text" name="cattle" id="ranch" value="baz1">' +
				'</form>' +
				'<form name="ranch2">' +
					'<input type="text" name="cattle2" value="baz1">' +
				'</form>' +
				'<form name="ranch3">' +
					'<input type="text" name="cattle3" value="baz1">' +
					'<input type="text" name="cattle3" id="cattle3" value="cattle3">' +
				'</form>' +
				'<form name="sea">' +
					'<input type="text" name="fish" value="fish">' +
					'<input type="text" name="turtle" value="turtle">' +
				'</form>' +
				'<span id="fish">Fish span</span>' +
				'<form name="lamps">' +
					'<input type="text" name="id" value="blue">' +
				'</form>' +
				'<form name="chairs" id="chairs">' +
					'<input type="text" name="id" value="recliner">' +
				'</form>' +
				'<div id="start">a start node</div>'
			);

			_rootElement = document.createElement('div');
			_rootElement.appendChild(testElements);
			document.body.appendChild(_rootElement);
		},

		teardown: function () {
			domConstruct.destroy(_rootElement);
		},

		'by id does not exist': function () {
			assert.notOk(dojo.byId(null));
			assert.notOk(dojo.byId(undefined));
			assert.notOk(dojo.byId('baz'));
			assert.notOk(dojo.byId('foobar'));
			assert.notOk(dojo.byId('dude'));
			assert.notOk(dojo.byId('cattle'));
			assert.notOk(dojo.byId('cattle2'));
			assert.notOk(dojo.byId('lamps'));
			assert.notOk(dojo.byId('blue'));
		},

		'by id exists': function () {
			assert.ok(dojo.byId('chairs'));
			assert.ok(dojo.byId('ranch'));
			assert.ok(dojo.byId('cattle3'));
		},

		'expected node name': function () {
			assert.equal(dojo.byId('fish').nodeName.toLowerCase(), 'span');
		},

		'clone node': function () {
			var startNode = dojo.byId('start');
			var clonedNode = dojo.clone(startNode);
			var expectedContent = 'This is a cloned div';
			var newId = 'clonedStart';
			clonedNode.id = newId;
			clonedNode.innerHTML = expectedContent;
			dojo.body().appendChild(clonedNode);

			assert.equal(dojo.byId(newId).innerHTML, expectedContent);
			domConstruct.destroy(clonedNode);
		}

	});

});
