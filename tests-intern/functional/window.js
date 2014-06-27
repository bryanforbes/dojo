define([
	'require',
	'dojo/Deferred',
	'intern!object',
	'intern/chai!assert',
	'tests-intern/functional/window/iframe_content/scrollDocuments',
], function (
	require,
	Deferred,
	registerSuite,
	assert,
	testScenarioDocuments
) {

	/*
	* There are many permutations of document layouts that need to be tested.
	* This function will generate a test for every layout scenario
	*/
	function generateTestsForScenarios(suite) {
		testScenarioDocuments.forEach(function (doc) {
			suite[doc.label] = function () {
				var visibleBefore;
				var visibleAfter;
				var hasScrolled;

				return this.get('remote').elementById(doc.id)
					.elementByClassName('before')
					.getAttribute('value').then(function (visible) {
						visibleBefore = parseInt(visible, 10);
					})
					.end()
					.elementByClassName('scrollBtn')
					.click()
					.end()
					.elementByClassName('hasScrolled')
					.getAttribute('value').then(function (scrolled) {
						hasScrolled = parseInt(scrolled, 10);
					})
					.end()
					.elementByClassName('after')
					.getAttribute('value').then(function (visible) {
						visibleAfter = parseInt(visible, 10);
					})
					.then(function () {
						if (hasScrolled) {
							assert.notOk(visibleBefore, 'scrolled, target should not be visible before');
							assert.ok(visibleAfter, 'scrolled, target should be visible after');
						} else {
							assert.ok(visibleBefore, 'not scrolled, target should be visible before');
							assert.ok(visibleAfter, 'not scrolled, target should be visible after');
						}
					});
			};
		});
	}

	registerSuite(function () {

		var suite = {
			name: 'dojo/window'
		};

		suite['.scrollIntoView()'] = {
			before: function () {
				return this.get('remote')
					.get(require.toUrl('./window/scroll.html'))
					.setAsyncScriptTimeout(5000)
					.waitForConditionInBrowser('ready');
			}
		};

		generateTestsForScenarios(suite['.scrollIntoView()']);

		suite['.getBox'] = {

			before: function () {
				return this.get('remote')
					.get(require.toUrl('./window/viewport.html'))
					.setAsyncScriptTimeout(5000)
					.waitForConditionInBrowser('ready');
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
		};

		return suite;
	});

});

