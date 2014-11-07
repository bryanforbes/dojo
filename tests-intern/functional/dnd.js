define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!leadfoot/helpers/pollUntil'
], function (require, registerSuite, assert, pollUntil) {
	var testPageUrl;
	var remote;

	function getTestPage() {
		return remote
			.get(testPageUrl)
			.then(pollUntil('return window.ready', 3000));
	}

	function dragAndDropTest(sourceContainerId, sourceIndex, targetContainerId, sourceChange, targetChange) {
		var sourceCount;
		var targetCount;

		return getTestPage()
			// get the initial count in the target
			.findAllByCssSelector('#' + targetContainerId + ' > div')
			.then(function (elements) {
				targetCount = elements.length;
			})
			.end()

			// get the initial count in c1 and set the context to the first div in c1
			.findAllByCssSelector('#' + sourceContainerId + ' > div')
			.then(function (elements, setContext) {
				sourceCount = elements.length;
				setContext(elements[sourceIndex]);
			})
			// click the div
			.moveMouseTo()
			.pressMouseButton(1)
			.sleep(200)
			.end()
			.end()

			// do a short drag to initiate the drag start
			.moveMouseTo(10, -10)
			.sleep(200)

			// move the dragged item to the target container
			.findById(targetContainerId)
			.moveMouseTo()
			.releaseMouseButton()
			.end()

			// verify that an element was removed from the source container
			.findAllByCssSelector('#' + sourceContainerId + ' > div')
			.then(function (elements) {
				assert.lengthOf(elements, sourceCount + sourceChange);
			})
			.end()

			// verify that an element was added to the target container
			.findAllByCssSelector('#' + targetContainerId + ' > div')
			.then(function (elements) {
				assert.lengthOf(elements, targetCount + targetChange);
			});
	}

	registerSuite({
		name: 'dojo/dnd',

		setup: function () {
			testPageUrl = require.toUrl('./support/dnd.html');
			remote = this.get('remote');
		},

		'drag a normal source': function () {
			return dragAndDropTest('c1', 0, 'c2', -1, 1);
		},

		'drag a copy-on-drag source': function () {
			return dragAndDropTest('c2', 2, 'c1', 0, 1);
		},

		'drag a target': function () {
			return dragAndDropTest('c5', 0, 'c2', 0, 0);
		},

		'custom avatar': function () {
			return getTestPage()
				// set the context to the first div in c3
				.findAllByCssSelector('#c3 > div')
				.then(function (elements, setContext) {
					setContext(elements[0]);
				})
				// click the div
				.moveMouseTo()
				.pressMouseButton(1)
				.sleep(200)
				.end()
				.end()

				// do a short drag to initiate the drag start
				.moveMouseTo(10, -10)
				.sleep(200)

				// find the avatar and check its value
				.findByCssSelector('.dojoDndAvatar .dojoDndAvatarItem .dojoDndItem strong')
				.getVisibleText()
				.then(function (text) { 
					assert.equal(text, 'Special');
				});
		}
	});
});
