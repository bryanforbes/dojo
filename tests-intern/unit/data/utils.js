define([
	'intern!object',
	'intern/chai!assert',
	'dojo/data/util/filter'
], function (registerSuite, assert, filter) {
	registerSuite({
		name: 'data/utils',

		'WildcardFilter_1': function () {
			var pattern = 'ca*',
				values = ['ca', 'california', 'Macca', 'Macca*b', 'Macca\\b'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'WildcardFilter_2': function () {
			var pattern = '*ca',
				values = ['ca', 'california', 'Macca', 'Macca*b', 'Macca\\b'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'WildcardFilter_3': function () {
			var pattern = '*ca*',
				values = ['ca', 'california', 'Macca', 'Macca*b', 'Macca\\b'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'WildcardFilter_4': function () {
			//Try and match <anything>c<anything>a*b
			var pattern = '*c*a\\*b*',
				values = ['ca', 'california', 'Macca', 'Macca*b', 'Macca\\b'];

			assert.isNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'WildcardFilter_5': function () {
			var pattern = '*c*a\\\\*b',
				values = ['ca', 'california', 'Macca', 'Macca*b', 'Macca\\b'];

			assert.isNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'WildcardFilter_caseInsensitive': function () {
			var pattern = 'ca*',
				values = ['CA', 'california', 'Macca', 'Macca*b', 'Macca\\b'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern, true)));
			assert.isNotNull(values[1].match(filter.patternToRegExp(pattern, true)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern, true)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern, true)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern, true)));
		},

		'SingleChar_1': function () {
			var pattern = 'bob?le',
				values = ['bobble', 'boble', 'foo', 'bobBle', 'bar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'SingleChar_2': function () {
			var pattern = '?ob?le',
				values = ['bobble', 'cob1le', 'foo', 'bobBle', 'bar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'BracketChar': function () {
			//Make sure we don't treat this as regexp
			var pattern = '*[*]*',
				values = ['bo[b]ble', 'cob1le', 'foo', '[bobBle]', 'b[]ar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'BraceChar': function () {
			//Make sure we don't treat this as regexp
			var pattern = '*{*}*',
				values = ['bo{b}ble', 'cob1le', 'foo', '{bobBle}', 'b{}ar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'ParenChar': function () {
			//Make sure we don't treat this as regexp
			var pattern = '*(*)*',
				values = ['bo(b)ble', 'cob1le', 'foo', '{bobBle}', 'b()ar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'PlusChar': function () {
			//Make sure we don't treat this as regexp, so match anything with a + in it.
			var pattern = '*+*',
				values = ['bo+ble', 'cob1le', 'foo', '{bobBle}', 'b{}ar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'PeriodChar': function () {
			//Make sure we don't treat this as regexp, so match anything with a period
			var pattern = '*.*',
				values = ['bo.ble', 'cob1le', 'foo', '{bobBle}', 'b{}ar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'BarChar': function () {
			//Make sure we don't treat this as regexp, so match anything with a pipe bar
			var pattern = '*|*',
				values = ['bo.ble', 'cob|le', 'foo', '{bobBle}', 'b{}ar'];

			assert.isNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'DollarSignChar': function () {
			//Make sure we don't treat this as regexp, so match anything with a $ in it
			var pattern = '*$*',
				values = ['bo$ble', 'cob$le', 'foo', '{bobBle}', 'b{}ar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'CarrotChar': function () {
			//Make sure we don't treat this as regexp, so match anything with a ^ in it
			var pattern = '*^*',
				values = ['bo$ble', 'cob$le', 'f^oo', '{bobBle}', 'b{}ar'];

			assert.isNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNotNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'EscapeChar': function () {
			//Make sure we escape properly, so match this single word.
			var pattern = 'bob\*ble',
				values = ['bob*ble', 'cob$le', 'f^oo', '{bobBle}', 'b{}ar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		},

		'AbsoluteMatch': function () {
			var pattern = 'bobble',
				values = ['bobble', 'cob$le', 'f^oo', '{bobBle}', 'b{}ar'];

			assert.isNotNull(values[0].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[1].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[2].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[3].match(filter.patternToRegExp(pattern)));
			assert.isNull(values[4].match(filter.patternToRegExp(pattern)));
		}
	});
});
