define([
	'require',
	'dojo/Deferred',
	'intern!object',
	'intern/chai!assert'
], function (
	require,
	Deferred,
	registerSuite,
	assert
) {

	registerSuite({
		name: 'dojo/window',

		'.getBox': {

			before: function () {
				return this.get('remote')
					.get(require.toUrl('./window/viewport.html'))
					.waitForCondition('ready', 5000);
			},

			initial: function () {
				var viewportHeight;
				var documentHeight;

				return this.get('remote').execute('compute()')
					.elementById('viewportHeight')
					.getAttribute('value').then(function (height) {
						viewportHeight = parseInt(height, 10);
					})
					.end()
					.elementById('documentHeight')
					.getAttribute('value').then(function (height) {
						documentHeight = parseInt(height, 10);
					}).then(function () {
						assert.isTrue(viewportHeight > documentHeight, 'expected viewport to be bigger than document');
					});
			},

			expand: function () {
				var viewportHeightBefore;
				var viewportHeightAfter;

				return this.get('remote').execute('compute();')
					.elementById('viewportHeight')
					.getAttribute('value').then(function (height) {
						viewportHeightBefore = parseInt(height, 10);
					})
					.end()
					.execute('addText(); compute();')
					.elementById('viewportHeight')
					.getAttribute('value').then(function (height) {
						viewportHeightAfter = parseInt(height, 10);
					}).then(function () {
						assert.isTrue(viewportHeightAfter <= viewportHeightBefore, 'viewport increased in size before: ' + viewportHeightBefore + ' after: ' + viewportHeightAfter);
						assert.isTrue(viewportHeightAfter + 20  >= viewportHeightBefore, 'viewport didn\'t shrink, except for space taken by scrollbars');
					});
			}

		}

	});

});
