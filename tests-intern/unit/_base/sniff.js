define([
	'intern!object',
	'intern/chai!assert',
	'dojo-testing',
	'dojo-testing/sniff'
], function (registerSuite, assert, dojo) {
	registerSuite({
		name: 'dojo/_base/sniff',

		// basic sanity check
		basic: function () {
			var browsers = 0;
			dojo['isChrome'] && browsers++;
			dojo['isSafari'] && browsers++;
			dojo['isOpera'] && browsers++;
			dojo['isMozilla'] && browsers++;
			dojo['isMoz'] && browsers++;
			dojo['isFF'] && browsers++;
			dojo['isIE'] && browsers++;
			dojo['isIos'] && browsers++;
			dojo['isAndroid'] && browsers++;
			dojo['isWii'] && browsers++;
			dojo['isAir'] && browsers++;
			assert.notEqual(browsers, 0, 'At least one browser should have been defined');
		}
	});
});
