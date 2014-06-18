define([
	'intern!object',
	'intern/chai!assert',
	'dojo/date'
], function (registerSuite, assert, date) {

	// Create a fake Date object with toString and toLocaleString
	// results manually set to simulate tests for multiple browsers
	function FakeDate(str, strLocale) {
		this.str = str || '';
		this.strLocale = strLocale || '';
		this.toString = function () {
			return this.str;
		};
		this.toLocaleString = function () {
			return this.strLocale;
		};
	}
	var dt = new FakeDate();

	registerSuite({
		name: 'dojo/date',
		'.getDaysInMonth': {
			'not February': function () {
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 0, 1)), 31);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 2, 1)), 31);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 3, 1)), 30);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 4, 1)), 31);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 5, 1)), 30);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 6, 1)), 31);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 7, 1)), 31);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 8, 1)), 30);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 9, 1)), 31);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 10, 1)), 30);
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 11, 1)), 31);
			},
			'Februarys': function () {
				assert.strictEqual(date.getDaysInMonth(new Date(2014, 1, 1)), 28);
				assert.strictEqual(date.getDaysInMonth(new Date(2004, 1, 1)), 29);
				assert.strictEqual(date.getDaysInMonth(new Date(2000, 1, 1)), 29);
				assert.strictEqual(date.getDaysInMonth(new Date(1900, 1, 1)), 28);
				assert.strictEqual(date.getDaysInMonth(new Date(1800, 1, 1)), 28);
				assert.strictEqual(date.getDaysInMonth(new Date(1700, 1, 1)), 28);
				assert.strictEqual(date.getDaysInMonth(new Date(1600, 1, 1)), 29);
			}
		},
		'.isLeapYear': {
			'leap years': function () {
				assert.isFalse(date.isLeapYear(new Date(2014, 0, 1)));
				assert.isTrue(date.isLeapYear(new Date(2012, 0, 1)));
				assert.isTrue(date.isLeapYear(new Date(2000, 0, 1)));
				assert.isFalse(date.isLeapYear(new Date(1900, 0, 1)));
				assert.isFalse(date.isLeapYear(new Date(1800, 0, 1)));
				assert.isFalse(date.isLeapYear(new Date(1700, 0, 1)));
				assert.isTrue(date.isLeapYear(new Date(1600, 0, 1)));
			}
		},
		// The getTimezone function pulls from either the date's toString or
		// toLocaleString method -- it's really just a string-processing
		// function (assuming the Date obj passed in supporting both toString
		// and toLocaleString) and as such can be tested for multiple browsers
		// by manually settting up fake Date objects with the actual strings
		// produced by various browser/OS combinations.
		// FIXME: the function and tests are not localized.
		'.getTimezoneName': {
			'Firefox 26.0 on Ubuntu 12.04': function () {
				dt.str = 'Sat Feb 15 2014 12:01:46 GMT+0000 (GMT)';
				dt.strLocale = 'Sat 15 Feb 2014 12:07:19 GMT';
				assert.strictEqual(date.getTimezoneName(dt), 'GMT');
			},
			'Safari 2.0 on Mac OS X 10.4': function () {
				dt.str = 'Sun Sep 17 2006 22:55:01 GMT-0500';
				dt.strLocale = 'September 17, 2006 10:55:01 PM CDT';
				assert.strictEqual(date.getTimezoneName(dt), 'CDT');
			},
			'Firefox 1.5 Mac OS X 10.4': function () {
				dt.str = 'Sun Sep 17 2006 22:57:18 GMT-0500 (CDT)';
				dt.strLocale = 'Sun Sep 17 22:57:18 2006';
				assert.strictEqual(date.getTimezoneName(dt), 'CDT');
			},
			// no TZ data expect empty string return
			'Opera 9 Mac OS X 10.4': function () {
				dt.str = 'Sun, 17 Sep 2006 22:58:06 GMT-0500';
				dt.strLocale = 'Sunday September 17, 22:58:06 GMT-0500 2006';
				assert.strictEqual(date.getTimezoneName(dt), '');
			},
			'IE 6 Windows XP': function () {
				dt.str = 'Mon Sep 18 11:21:07 CDT 2006';
				dt.strLocale = 'Monday, September 18, 2006 11:21:07 AM';
				assert.strictEqual(date.getTimezoneName(dt), 'CDT');
			},
			// no TZ data expect empty string return
			'Opera 9 Ubuntu Linux (Breezy)': function () {
				dt.str = 'Mon, 18 Sep 2006 13:30:32 GMT-0500';
				dt.strLocale = 'Monday September 18, 13:30:32 GMT-0500 2006';
				assert.strictEqual(date.getTimezoneName(dt), '');
			},
			'IE 5.5 Windows 2000': function () {
				dt.str = 'Mon Sep 18 13:49:22 CDT 2006';
				dt.strLocale = 'Monday, September 18, 2006 1:49:22 PM';
				assert.strictEqual(date.getTimezoneName(dt), 'CDT');
			}
		}
	});

	registerSuite({
		name: 'dojo/date math',
		'.compare': function () {
			var d1 = new Date();
			d1.setHours(0);
			var d2 = new Date();
			d2.setFullYear(2005);
			d2.setHours(12);
			assert.strictEqual(date.compare(d1, d1), 0);
			assert.strictEqual(date.compare(d1, d2, 'date'), 1);
			assert.strictEqual(date.compare(d2, d1, 'date'), -1);
			assert.strictEqual(date.compare(d1, d2, 'time'), -1);
			assert.strictEqual(date.compare(d1, d2, 'datetime'), 1);
		},
		'.add': {
			'year interval': function () {
				var interv = 'year';

				var dtA = new Date(2014, 11, 27); // Date to increment
				var dtB = new Date(2015, 11, 27); // Expected result date
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2015, 11, 27);
				dtB = new Date(2014, 11, 27);
				assert.deepEqual(date.add(dtA, interv, -1), dtB);

				dtA = new Date(2012, 1, 29);
				dtB = new Date(2013, 1, 28);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2012, 1, 29);
				dtB = new Date(2017, 1, 28);
				assert.deepEqual(date.add(dtA, interv, 5), dtB);

				dtA = new Date(1900, 11, 31);
				dtB = new Date(1930, 11, 31);
				assert.deepEqual(date.add(dtA, interv, 30), dtB);

				dtA = new Date(1995, 11, 31);
				dtB = new Date(2030, 11, 31);
				assert.deepEqual(date.add(dtA, interv, 35), dtB);
			},
			'quarter interval': function () {
				var interv = 'quarter';

				var dtA = new Date(2012, 0, 1);
				var dtB = new Date(2012, 3, 1);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2012, 1, 29);
				dtB = new Date(2012, 7, 29);
				assert.deepEqual(date.add(dtA, interv, 2), dtB);

				dtA = new Date(2012, 1, 29);
				dtB = new Date(2013, 1, 28);
				assert.deepEqual(date.add(dtA, interv, 4), dtB);
			},
			'month interval': function () {
				var interv = 'month';

				var dtA = new Date(2012, 0, 1);
				var dtB = new Date(2012, 1, 1);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2012, 0, 31);
				dtB = new Date(2012, 1, 29);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2012, 1, 29);
				dtB = new Date(2013, 1, 28);
				assert.deepEqual(date.add(dtA, interv, 12), dtB);
			},
			'week interval': function () {
				var interv = 'week';

				var dtA = new Date(2012, 0, 1);
				var dtB = new Date(2012, 0, 8);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);
			},
			'day interval': function () {
				var interv = 'day';

				var dtA = new Date(2012, 0, 1);
				var dtB = new Date(2012, 0, 2);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2013, 0, 1);
				dtB = new Date(2014, 0, 1);
				assert.deepEqual(date.add(dtA, interv, 365), dtB);

				dtA = new Date(2012, 0, 1);
				dtB = new Date(2013, 0, 1);
				assert.deepEqual(date.add(dtA, interv, 366), dtB);

				dtA = new Date(2012, 1, 28);
				dtB = new Date(2012, 1, 29);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2013, 1, 28);
				dtB = new Date(2013, 2, 1);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2012, 2, 1);
				dtB = new Date(2012, 1, 29);
				assert.deepEqual(date.add(dtA, interv, -1), dtB);

				dtA = new Date(2013, 2, 1);
				dtB = new Date(2013, 1, 28);
				assert.deepEqual(date.add(dtA, interv, -1), dtB);

				dtA = new Date(2012, 0, 1);
				dtB = new Date(2011, 11, 31);
				assert.deepEqual(date.add(dtA, interv, -1), dtB);
			},
			'weekday interval': function () {
				var interv = 'weekday';

				// Sat, Jan 1
				var dtA = new Date(2000, 0, 1);
				// Should be Mon, Jan 3
				var dtB = new Date(2000, 0, 3);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				// Sun, Jan 2
				dtA = new Date(2000, 0, 2);
				// Should be Mon, Jan 3
				dtB = new Date(2000, 0, 3);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				// Sun, Jan 2
				dtA = new Date(2000, 0, 2);
				// Should be Fri, Jan 7
				dtB = new Date(2000, 0, 7);
				assert.deepEqual(date.add(dtA, interv, 5), dtB);

				// Sun, Jan 2
				dtA = new Date(2000, 0, 2);
				// Should be Mon, Jan 10
				dtB = new Date(2000, 0, 10);
				assert.deepEqual(date.add(dtA, interv, 6), dtB);

				// Mon, Jan 3
				dtA = new Date(2000, 0, 3);
				// Should be Mon, Jan 17
				dtB = new Date(2000, 0, 17);
				assert.deepEqual(date.add(dtA, interv, 10), dtB);

				// Sat, Jan 8
				dtA = new Date(2000, 0, 8);
				// Should be Mon, Jan 3
				dtB = new Date(2000, 0, 3);
				assert.deepEqual(date.add(dtA, interv, -5), dtB);

				// Sun, Jan 9
				dtA = new Date(2000, 0, 9);
				// Should be Wed, Jan 5
				dtB = new Date(2000, 0, 5);
				assert.deepEqual(date.add(dtA, interv, -3), dtB);

				// Sun, Jan 23
				dtA = new Date(2000, 0, 23);
				// Should be Fri, Jan 7
				dtB = new Date(2000, 0, 7);
				assert.deepEqual(date.add(dtA, interv, -11), dtB);
			},
			'hour interval': function () {
				var interv = 'hour';

				var dtA = new Date(2012, 0, 1, 11);
				var dtB = new Date(2012, 0, 1, 12);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2013, 9, 28, 0);
				dtB = new Date(dtA.getTime() + (60 * 60 * 1000));
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2013, 9, 28, 23);
				dtB = new Date(2013, 9, 29, 0);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2013, 11, 31, 23);
				dtB = new Date(2014, 0, 1, 0);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);
			},
			'minute interval': function () {
				var interv = 'minute';

				var dtA = new Date(2012, 11, 31, 23, 59);
				var dtB = new Date(2013, 0, 1, 0, 0);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2012, 11, 27, 12, 2);
				dtB = new Date(2012, 11, 27, 13, 2);
				assert.deepEqual(date.add(dtA, interv, 60), dtB);
			},
			'second interval': function () {
				var interv = 'second';

				var dtA = new Date(2012, 11, 31, 23, 59, 59);
				var dtB = new Date(2013, 0, 1, 0, 0, 0);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2012, 11, 27, 8, 10, 59);
				dtB = new Date(2012, 11, 27, 8, 11, 59);
				assert.deepEqual(date.add(dtA, interv, 60), dtB);
			},
			'millisecond interval': function () {
				var interv = 'millisecond';

				var dtA = new Date(2012, 11, 31, 23, 59, 59, 999);
				var dtB = new Date(2013, 0, 1, 0, 0, 0, 0);
				assert.deepEqual(date.add(dtA, interv, 1), dtB);

				dtA = new Date(2012, 11, 27, 8, 10, 53, 2);
				dtB = new Date(2012, 11, 27, 8, 10, 54, 2);
				assert.deepEqual(date.add(dtA, interv, 1000), dtB);
			}
		},
		'.diff': {
			'year interval': function () {
				var interv = 'year';

				var dtA = new Date(2013, 11, 27); // First date to compare
				var dtB = new Date(2014, 11, 27); // Second date to compare
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 11, 31);
				dtB = new Date(2013, 0, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);
			},
			'quarter interval': function () {
				var interv = 'quarter';

				var dtA = new Date(2012, 1, 29);
				var dtB = new Date(2013, 2, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 4);

				dtA = new Date(2012, 11, 1);
				dtB = new Date(2013, 0, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);
			},
			'month interval': function () {
				var interv = 'month';

				var dtA = new Date(2012, 1, 29);
				var dtB = new Date(2013, 2, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 13);

				dtA = new Date(2012, 11, 1);
				dtB = new Date(2013, 0, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);
			},
			'week interval': function () {
				var interv = 'week';

				var dtA = new Date(2012, 1, 1);
				var dtB = new Date(2012, 1, 8);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 1, 28);
				dtB = new Date(2012, 2, 6);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 2, 6);
				dtB = new Date(2012, 1, 28);
				assert.strictEqual(date.difference(dtA, dtB, interv), -1);

			},
			'day interval': function () {
				var interv = 'day';

				var dtA = new Date(2012, 1, 29);
				var dtB = new Date(2012, 2, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 11, 31);
				dtB = new Date(2013, 0, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				// DST leap -- check for rounding err
				// This is dependent on US calendar, but
				// shouldn't break in other locales
				dtA = new Date(2005, 3, 3);
				dtB = new Date(2005, 3, 4);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);
			},
			'weekday interval': function () {
				var interv = 'weekday';

				var dtA = new Date(2006, 7, 3);
				var dtB = new Date(2006, 7, 11);
				assert.strictEqual(date.difference(dtA, dtB, interv), 6);

				// Positive diffs
				dtA = new Date(2006, 7, 4);
				dtB = new Date(2006, 7, 11);
				assert.strictEqual(date.difference(dtA, dtB, interv), 5);

				dtA = new Date(2006, 7, 5);
				dtB = new Date(2006, 7, 11);
				assert.strictEqual(date.difference(dtA, dtB, interv), 5);

				dtA = new Date(2006, 7, 6);
				dtB = new Date(2006, 7, 11);
				assert.strictEqual(date.difference(dtA, dtB, interv), 5);

				dtA = new Date(2006, 7, 7);
				dtB = new Date(2006, 7, 11);
				assert.strictEqual(date.difference(dtA, dtB, interv), 4);

				dtA = new Date(2006, 7, 7);
				dtB = new Date(2006, 7, 13);
				assert.strictEqual(date.difference(dtA, dtB, interv), 4);

				dtA = new Date(2006, 7, 7);
				dtB = new Date(2006, 7, 14);
				assert.strictEqual(date.difference(dtA, dtB, interv), 5);

				dtA = new Date(2006, 7, 7);
				dtB = new Date(2006, 7, 15);
				assert.strictEqual(date.difference(dtA, dtB, interv), 6);

				dtA = new Date(2006, 7, 7);
				dtB = new Date(2006, 7, 28);
				assert.strictEqual(date.difference(dtA, dtB, interv), 15);

				dtA = new Date(2006, 2, 2);
				dtB = new Date(2006, 2, 28);
				assert.strictEqual(date.difference(dtA, dtB, interv), 18);

				// Negative diffs
				dtA = new Date(2006, 7, 11);
				dtB = new Date(2006, 7, 4);
				assert.strictEqual(date.difference(dtA, dtB, interv), -5);

				dtA = new Date(2006, 7, 11);
				dtB = new Date(2006, 7, 5);
				assert.strictEqual(date.difference(dtA, dtB, interv), -4);

				dtA = new Date(2006, 7, 11);
				dtB = new Date(2006, 7, 6);
				assert.strictEqual(date.difference(dtA, dtB, interv), -4);

				dtA = new Date(2006, 7, 11);
				dtB = new Date(2006, 7, 7);
				assert.strictEqual(date.difference(dtA, dtB, interv), -4);

				dtA = new Date(2006, 7, 13);
				dtB = new Date(2006, 7, 7);
				assert.strictEqual(date.difference(dtA, dtB, interv), -5);

				dtA = new Date(2006, 7, 14);
				dtB = new Date(2006, 7, 7);
				assert.strictEqual(date.difference(dtA, dtB, interv), -5);

				dtA = new Date(2006, 7, 15);
				dtB = new Date(2006, 7, 7);
				assert.strictEqual(date.difference(dtA, dtB, interv), -6);

				dtA = new Date(2006, 7, 28);
				dtB = new Date(2006, 7, 7);
				assert.strictEqual(date.difference(dtA, dtB, interv), -15);

				dtA = new Date(2006, 2, 28);
				dtB = new Date(2006, 2, 2);
				assert.strictEqual(date.difference(dtA, dtB, interv), -18);

				// Two days on the same weekend -- no weekday diff
				dtA = new Date(2006, 7, 5);
				dtB = new Date(2006, 7, 6);
				assert.strictEqual(date.difference(dtA, dtB, interv), 0);
			},
			'hour interval': function () {
				var interv = 'hour';

				var dtA = new Date(2012, 11, 31, 23);
				var dtB = new Date(2013, 0, 1, 0);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 11, 31, 12);
				dtB = new Date(2013, 0, 1, 0);
				assert.strictEqual(date.difference(dtA, dtB, interv), 12);
			},
			'minute interval': function () {
				var interv = 'minute';

				var dtA = new Date(2012, 11, 31, 23, 59);
				var dtB = new Date(2013, 0, 1, 0, 0);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 1, 28, 23, 59);
				dtB = new Date(2012, 1, 29, 0, 0);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);
			},
			'second interval': function () {
				var interv = 'second';
				var dtA = new Date(2012, 11, 31, 23, 59, 59);
				var dtB = new Date(2013, 0, 1, 0, 0, 0);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);
			},
			'millisecond interval': function () {
				var interv = 'millisecond';

				var dtA = new Date(2012, 11, 31, 23, 59, 59, 999);
				var dtB = new Date(2013, 0, 1, 0, 0, 0, 0);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 11, 31, 23, 59, 59, 0);
				dtB = new Date(2013, 0, 1, 0, 0, 0, 0);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1000);
			}
		},
		'.add_diff': {
			'year interval': function () {
				var interv = 'year';

				var dtA = new Date(2005, 11, 27);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2005, 11, 27);
				dtB = date.add(dtA, interv, -1);
				assert.strictEqual(date.difference(dtA, dtB, interv), -1);

				dtA = new Date(2000, 1, 29);
				dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2000, 1, 29);
				dtB = date.add(dtA, interv, 5);
				assert.strictEqual(date.difference(dtA, dtB, interv), 5);

				dtA = new Date(1900, 11, 31);
				dtB = date.add(dtA, interv, 30);
				assert.strictEqual(date.difference(dtA, dtB, interv), 30);

				dtA = new Date(1995, 11, 31);
				dtB = date.add(dtA, interv, 35);
				assert.strictEqual(date.difference(dtA, dtB, interv), 35);
			},
			'quarter interval': function () {
				var interv = 'quarter';

				var dtA = new Date(2012, 0, 1);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 1, 29);
				dtB = date.add(dtA, interv, 2);
				assert.strictEqual(date.difference(dtA, dtB, interv), 2);

				dtA = new Date(2012, 1, 29);
				dtB = date.add(dtA, interv, 4);
				assert.strictEqual(date.difference(dtA, dtB, interv), 4);
			},
			'month interval': function () {
				var interv = 'month';

				var dtA = new Date(2012, 0, 1);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 0, 31);
				dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 1, 29);
				dtB = date.add(dtA, interv, 12);
				assert.strictEqual(date.difference(dtA, dtB, interv), 12);
			},
			'week interval': function () {
				var interv = 'week';

				var dtA = new Date(2012, 0, 1);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

			},
			'day interval': function () {
				var interv = 'day';

				var dtA = new Date(2012, 0, 1);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2013, 0, 1);
				dtB = date.add(dtA, interv, 365);
				assert.strictEqual(date.difference(dtA, dtB, interv), 365);

				dtA = new Date(2012, 0, 1);
				dtB = date.add(dtA, interv, 366);
				assert.strictEqual(date.difference(dtA, dtB, interv), 366);

				dtA = new Date(2012, 1, 28);
				dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2013, 1, 28);
				dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 2, 1);
				dtB = date.add(dtA, interv, -1);
				assert.strictEqual(date.difference(dtA, dtB, interv), -1);

				dtA = new Date(2013, 2, 1);
				dtB = date.add(dtA, interv, -1);
				assert.strictEqual(date.difference(dtA, dtB, interv), -1);

				dtA = new Date(2012, 0, 1);
				dtB = date.add(dtA, interv, -1);
				assert.strictEqual(date.difference(dtA, dtB, interv), -1);
			},
			'weekday interval': function () {
				var interv = 'weekday';

				// Sat, Jan 1
				var dtA = new Date(2000, 0, 1);
				// Should be Mon, Jan 3
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				// Sun, Jan 2
				dtA = new Date(2000, 0, 2);
				// Should be Mon, Jan 3
				dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				// Sun, Jan 2
				dtA = new Date(2000, 0, 2);
				// Should be Fri, Jan 7
				dtB = date.add(dtA, interv, 5);
				assert.strictEqual(date.difference(dtA, dtB, interv), 5);

				// Sun, Jan 2
				dtA = new Date(2000, 0, 2);
				// Should be Mon, Jan 10
				dtB = date.add(dtA, interv, 6);
				assert.strictEqual(date.difference(dtA, dtB, interv), 6);

				// Mon, Jan 3
				dtA = new Date(2000, 0, 3);
				// Should be Mon, Jan 17
				dtB = date.add(dtA, interv, 10);
				assert.strictEqual(date.difference(dtA, dtB, interv), 10);

				// Sat, Jan 8
				dtA = new Date(2000, 0, 8);
				// Should be Mon, Jan 3
				dtB = date.add(dtA, interv, -5);
				assert.strictEqual(date.difference(dtA, dtB, interv), -5);

				// Sun, Jan 9
				dtA = new Date(2000, 0, 9);
				// Should be Wed, Jan 5
				dtB = date.add(dtA, interv, -3);
				assert.strictEqual(date.difference(dtA, dtB, interv), -3);

				// Sun, Jan 23
				dtA = new Date(2000, 0, 23);
				// Should be Fri, Jan 7
				dtB = date.add(dtA, interv, -11);
				assert.strictEqual(date.difference(dtA, dtB, interv), -11);
			},
			'hour interval': function () {
				var interv = 'hour';
				var dtA = new Date(2012, 0, 1, 11);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2013, 9, 28, 0);
				dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2013, 9, 28, 23);
				dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2013, 11, 31, 23);
				dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);
			},
			'minute interval': function () {
				var interv = 'minute';

				var dtA = new Date(2012, 11, 31, 23, 59);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 11, 27, 12, 2);
				dtB = date.add(dtA, interv, 60);
				assert.strictEqual(date.difference(dtA, dtB, interv), 60);
			},
			'second interval': function () {
				var interv = 'second';

				var dtA = new Date(2012, 11, 31, 23, 59, 59);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 11, 27, 8, 10, 59);
				dtB = date.add(dtA, interv, 60);
				assert.strictEqual(date.difference(dtA, dtB, interv), 60);
			},
			'millisecond interval': function () {
				var interv = 'millisecond';

				var dtA = new Date(2012, 11, 31, 23, 59, 59, 999);
				var dtB = date.add(dtA, interv, 1);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1);

				dtA = new Date(2012, 11, 27, 8, 10, 53, 2);
				dtB = date.add(dtA, interv, 1000);
				assert.strictEqual(date.difference(dtA, dtB, interv), 1000);
			}
		},

	});
});
