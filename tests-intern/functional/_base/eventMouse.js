define([
	'require',
	'intern!object',
	'intern/chai!assert',
], function (require, registerSuite, assert) {
	/*jshint -W020 */
	registerSuite({
		name: 'mouseenter/mouseleave',

		'before': function () {
			return this.get('remote')
				.setAsyncScriptTimeout(5000)
				.get(require.toUrl('./eventMouse.html'))
				.waitForConditionInBrowser('ready')
				.elementById('header')
					.moveTo(1, 1)
				.end()
				.click();
		},

		'enter middle': function () {
			return this.get('remote')
				.elementById('outer')
					.moveTo(1, 1)
				.end()
				.wait(1000)
				.elementById('middleLabel')
					.moveTo(1, 1)
				.end()
				.execute(function () {
					var input = dojo.byId('event-target-input');

					return input.value;
				})
				.then(function (value) {
					assert.strictEqual('mouseenter_outer', value, 'input text matches event');
				})
				.end();
		},

		'enter inner1': function () {
			return this.get('remote')
				.elementById('inner1')
					.moveTo(1, 1)
				.end()
				.wait(1000)
				.execute(function () {
					var input = dojo.byId('event-target-input');

					return input.value;
				})
				.then(function (value) {
					assert.strictEqual('mouseenter_outer', value, 'input text matches event');
				});
		},

		'after outer': function () {
			return this.get('remote')
				.elementById('outer')
					.moveTo(1, 1)
				.end()
				.wait(1000)
				.elementById('afterOuter')
					.moveTo(1, 1)
				.end()
				.execute(function () {
					var input = dojo.byId('event-target-input');

					return input.value;
				})
				.then(function (value) {
					assert.strictEqual('mouseleave_outer', value, 'input text matches event');
				});
		}
	});

	registerSuite({
		name: 'mousedown, stopEvent',

		'before': function () {
			return this.get('remote')
				.setAsyncScriptTimeout(5000)
				.waitForConditionInBrowser('ready')
				.elementById('header')
					.moveTo(1, 1)
				.end()
				.click();
		},

		'mousedown inner1 div': function () {
			return this.get('remote')
				.elementById('inner1')
					.moveTo(1, 1)
				.end()
				.click()
				.execute(function () {
					var targetInput = dojo.byId('event-target-input'),
						currentTargetInput = dojo.byId('event-current-target-input');

					return [targetInput.value, currentTargetInput.value];
				})
				.then(function (arr) {
					assert.strictEqual('onclick_inner1', arr[0], 'input text matches event');
					assert.strictEqual('onclick_middle', arr[1], 'input text matches event');
				});
		},

		'mousedown outer div': function () {
			return this.get('remote')
				.elementById('outerLabel')
					.moveTo(1, 1)
				.end()
				.click()
				.execute(function () {
					var targetInput = dojo.byId('event-target-input'),
						currentTargetInput = dojo.byId('event-current-target-input');

					return [targetInput.value, currentTargetInput.value];
				})
				.then(function (arr) {
					assert.strictEqual('onclick_outerLabel', arr[0], 'one event');
					assert.strictEqual('onclick_outer', arr[1], 'one event');
				});
		}
	});
});
