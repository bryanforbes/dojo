define([
	'intern!object',
	'intern/chai!assert',
	'dojo/currency',
	'dojo/i18n'
], function (registerSuite, assert, currency) {
	registerSuite({
		name: 'dojo/currency',

		'.format': {
			'en-us locale': {
				'EUR currency': function () {
					assert.equal('\u20ac123.45', currency.format(123.45, {currency: 'EUR', locale: 'en-us'}));
				},

				'USD currency': {
					'hundreds': function () {
						assert.equal('$123.45', currency.format(123.45, {currency: 'USD', locale: 'en-us'}));
					},

					'thousands separator': function () {
						assert.equal('$1,234.56', currency.format(1234.56, {currency: 'USD', locale: 'en-us'}));
					},

					'fractional is false': function () {
						var options = {currency: 'USD', fractional: false, locale: 'en-us'};
						assert.equal('$1,234', currency.format(1234, options));
					}
				},

				'CAD currency': function () {
					assert.equal('CA$123.45', currency.format(123.45, {currency: 'CAD', locale: 'en-us'}));
				},

				'unknown currency': function () {
					// There is no special currency symbol for ADP, so expect the ISO code instead
					assert.equal('ADP123', currency.format(123, {currency: 'ADP', locale: 'en-us'}));
				}
			},

			'en-ca locale': {
				'USD currency': function () {
					assert.equal('US$123.45', currency.format(123.45, {currency: 'USD', locale: 'en-ca'}));
				},

				'CAD currency': function () {
					assert.equal('$123.45', currency.format(123.45, {currency: 'CAD', locale: 'en-ca'}));
				}
			},

			'de-de locale': {
				'EUR currency': {
					'hundreds': function () {
						assert.equal('123,45\xa0\u20ac', currency.format(123.45, {currency: 'EUR', locale: 'de-de'}));
					},

					'thousands': function () {
						var expected = '1.234,56\xa0\u20ac';
						assert.equal(expected, currency.format(1234.56, {currency: 'EUR', locale: 'de-de'}));
					}
				}
			}
		},

		'.parse': {
			'en-us locale': {
				'USD currency': {
					'hundreds': function () {
						assert.equal(123.45, currency.parse('$123.45', {currency: 'USD', locale: 'en-us'}));
					},

					'thousands': function () {
						assert.equal(1234.56, currency.parse('$1,234.56', {currency: 'USD', locale: 'en-us'}));
					},

					'no cents': {
						'default use case': function () {
							assert.equal(1234, currency.parse('$1,234', {currency: 'USD', locale: 'en-us'}));
						},

						'fractional false': function () {
							var options = {currency: 'USD', fractional: false, locale: 'en-us'};
							assert.equal(1234, currency.parse('$1,234', options));
						},

						'fractional true - fails': function () {
							var options = {currency: 'USD', fractional: true, locale: 'en-us'};
							assert.isTrue(isNaN(currency.parse('$1,234', options)));
						}
					}
				}
			},

			'de-de locale': {
				'EUR currency': {
					'hundreds': function () {
						assert.equal(123.45, currency.parse('123,45 \u20ac', {currency: 'EUR', locale: 'de-de'}));
						assert.equal(123.45, currency.parse('123,45\xa0\u20ac', {currency: 'EUR', locale: 'de-de'}));
					},

					'thousands': function () {
						assert.equal(1234.56, currency.parse('1.234,56 \u20ac', {currency: 'EUR', locale: 'de-de'}));
						assert.equal(1234.56, currency.parse('1.234,56\u20ac', {currency: 'EUR', locale: 'de-de'}));
					}
				}
			}
		}
	});
});