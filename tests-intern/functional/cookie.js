define([
	'require',
	'intern!object',
	'intern/chai!assert'
], function (require, registerSuite, assert) {
	var remotePromise, pagePromise;

	registerSuite({
		name: 'dojo/cookie',

		'before': function () {
			remotePromise = this.get('remote').setAsyncScriptTimeout(10000);
			return remotePromise;
		},

		'beforeEach': function () {
			pagePromise = remotePromise.get(require.toUrl('./support/standard.html'));

			// TODO this intermittently fails in Inter 1.7 w/ wd 0.2.2
			// https://github.com/admc/wd/issues/172
//			return pagePromise.deleteAllCookies();

			// HACK
			return pagePromise.execute(function () {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var name = cookies[i].split('=')[0];
					document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
				}
				return {};
			});
		},

		'set': {
			'one new cookie': function () {
				return pagePromise.executeAsync(function (done) {
					require(['dojo/cookie'], function (cookie) {
						var cookieName = 'dojo_test';
						var cookieValue = 'test value';

						cookie(cookieName, cookieValue);
						done(document.cookie);
					});
				}).then(function (cookieStr) {
					var cookieName = 'dojo_test';
					var cookieValue = encodeURIComponent('test value');
					var regExp = new RegExp(cookieName + '=([^;]*)');
					var results;

					assert.isDefined(cookieStr);
					assert.isTrue(cookieStr.indexOf(cookieName+'=') >= 0);
					results = cookieStr.match(regExp);
					assert.lengthOf(results, 2);
					assert.equal(results[1], cookieValue);
				});
			},

			'a cookie with a negative expires': function () {
				return pagePromise.executeAsync(function (done) {
					require(['dojo/cookie'], function (cookie) {
						// set a cookie with a numerical expires
						cookie('dojo_num', 'foo', { expires: 10 });
						done(cookie('dojo_num'));
					});
				}).then(function (actual) {
					assert.isNotNull(actual);
				}).executeAsync(function (done) {
					require(['dojo/cookie'], function (cookie) {
						// remove the cookie by setting it with a negative
						// numerical expires. value doesn't really matter here
						cookie('dojo_num', '-deleted-', { expires: -10 });
						done(cookie('dojo_num'));
					});
				}).then(function (actual) {
					assert.isNull(actual);
				});
			}
		},

		'get': {
			'an existing cookie': function () {
				var expected = 'an existing cookie';

				return pagePromise.executeAsync(function (done) {
					require(['dojo/cookie'], function (cookie) {
						// set the cookie
						var cookieName = 'dojo_test';
						var cookieValue = 'an existing cookie';
						document.cookie = cookieName + '=' + cookieValue;

						done(cookie(cookieName));
					});
				}).then(function (cookieValue) {
					assert.equal(cookieValue, expected);
				});
			}
		},

		'add and remove two new cookies with the same suffix': function () {
			return pagePromise.executeAsync(function (done) {
				require(['dojo/cookie'], function (cookie) {
					// set two cookies with the same suffix
					cookie('user', '123', { expires: 10 });
					cookie('xuser', 'abc', { expires: 10 });

					done({
						cookie: {
							user: cookie('user'),
							xuser: cookie('xuser')
						}
					});
				});
			}).then(function (actual) {
				assert.equal(actual.cookie.user, '123');
				assert.equal(actual.cookie.xuser, 'abc');
			}).executeAsync(function (done) {
				require(['dojo/cookie'], function (cookie) {
					// remove the cookie by setting it with a negative
					// numerical expires. value doesn't really matter here
					cookie('user', '-deleted-', { expires: -10 });
					cookie('xuser', '-deleted-', { expires: -10 });
					done({
						cookie: {
							user: cookie('user'),
							xuser: cookie('xuser')
						}
					});
				});
			}).then(function (actual) {
				assert.isNull(actual.cookie.user);
				assert.isNull(actual.cookie.xuser);
			});
		}
	});
});