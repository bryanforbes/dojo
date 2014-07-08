define([
	'intern!object',
	'intern/chai!assert',
	'dojo-testing',
	'dojo-testing/_base/url',
	'require'
], function (registerSuite, assert, dojo, url, require) {
	var compactPath = function (path) {
		var result = [];
		var segment;
		var lastSegment;

	    path = path.split('/');

		while (path.length) {
			segment = path.shift();
			if (segment === '..' && result.length && lastSegment !== '..') {
				result.pop();
			}
			else if (segment !== '.') {
				result.push(lastSegment = segment);
			}
			// else ignore '.'
		}
		return result.join('/');
	};

	registerSuite({
		name: 'dojo/_base/loader/moduleIds',

		compactPath: function () {
			var compactPath = require.compactPath;
			assert.strictEqual(compactPath('../../dojo/../../mytests'), '../../../mytests');
			assert.strictEqual(compactPath('module'), 'module');
			assert.strictEqual(compactPath('a/./b'), 'a/b');
			assert.strictEqual(compactPath('a/../b'), 'b');
			assert.strictEqual(compactPath('a/./b/./c/./d'), 'a/b/c/d');
			assert.strictEqual(compactPath('a/../b/../c/../d'), 'd');
			assert.strictEqual(compactPath('a/b/c/../../d'), 'a/d');
			assert.strictEqual(compactPath('a/b/c/././d'), 'a/b/c/d');
			assert.strictEqual(compactPath('./a/b'), 'a/b');
			assert.strictEqual(compactPath('../a/b'), '../a/b');
			assert.strictEqual(compactPath(''), '');
		},

		testModuleIds: function () {
			require({
				packages:[{
					// canonical...
					name:'pack1',
					location:'../packages/pack1Root'
				}, {
					// nonstandard main
					name:'pack2',
					main:'pack2Main',
					location:'/pack2Root'
				}, {
					// nonstandard main
					name:'pack3',
					main:'public/main',
					location:'/pack3Root'
				}]
			});

			function get(mid, refmod) {
				return require.getModuleInfo(mid, refmod, require.packs, require.modules, '../../dojo/', require.mapProgs, require.pathsMapProg, 1);
			}

			function check(result, expectedPid, expectedMidSansPid, expectedUrl) {
				assert.strictEqual(result.pid, expectedPid);
				assert.strictEqual(result.mid, expectedPid + '/' + expectedMidSansPid);
				assert.strictEqual(result.url, expectedUrl + '.js');
			}

            // non-relative module id resolution...

			var pack1Root = '../../packages/pack1Root/';

			// the various mains...
			check(get('pack1'), 'pack1', 'main', pack1Root + 'main');
			check(get('pack2'), 'pack2', 'pack2Main', '/pack2Root/pack2Main');
			check(get('pack3'), 'pack3', 'public/main', '/pack3Root/public/main');

			// modules...
			check(get('pack1/myModule'), 'pack1', 'myModule', pack1Root + 'myModule');
			check(get('pack2/myModule'), 'pack2', 'myModule', '/pack2Root/myModule');
			check(get('pack3/myModule'), 'pack3', 'myModule', '/pack3Root/myModule');

			// relative module id resolution; relative to module in top-level
			var refmod = {mid:'pack1/main', pack:require.packs.pack1};
			check(get('.', refmod), 'pack1', 'main', pack1Root + 'main');
			check(get('./myModule', refmod), 'pack1', 'myModule', pack1Root + 'myModule');
			check(get('./myModule/mySubmodule', refmod), 'pack1', 'myModule/mySubmodule', pack1Root + 'myModule/mySubmodule');

			// relative module id resolution; relative to module
			refmod = {mid:'pack1/sub/publicModule', pack:require.packs.pack1};
			check(get('.', refmod), 'pack1', 'sub', pack1Root + 'sub');
			check(get('./myModule', refmod), 'pack1', 'sub/myModule', pack1Root + 'sub/myModule');
			check(get('..', refmod), 'pack1', 'main', pack1Root + 'main');
			check(get('../myModule', refmod), 'pack1', 'myModule', pack1Root + 'myModule');
			check(get('../util/myModule', refmod), 'pack1', 'util/myModule', pack1Root + 'util/myModule');
		},

		baseUrl: function () {
			var originalBaseUrl = dojo.config['baseUrl'] || './';
			assert.strictEqual(originalBaseUrl, dojo.baseUrl);
		},

		moduleUrl: function () {
			var expected = require.toUrl('base/tests/myTest.html');
			assert.isNull(dojo.moduleUrl());
			assert.isNull(dojo.moduleUrl(null));
			assert.isNull(dojo.moduleUrl(null, 'myTest.html'));

			// note we expect a trailing slash
			assert.strictEqual(expected.substring(0, expected.length - 11), dojo.moduleUrl('base.tests'));
			assert.strictEqual(expected, dojo.moduleUrl('base.tests', 'myTest.html'));
		},

		modulePaths: function () {
			dojo.registerModulePath('mycoolmod', '../some/path/mycoolpath');
			dojo.registerModulePath('mycoolmod.widget', 'http://some.domain.com/another/path/mycoolpath/widget');

			assert.strictEqual(dojo.moduleUrl('mycoolmod.util'), compactPath(require.baseUrl + '../some/path/mycoolpath/util/'));
			assert.strictEqual(dojo.moduleUrl('mycoolmod.widget'), 'http://some.domain.com/another/path/mycoolpath/widget/');
			assert.strictEqual(dojo.moduleUrl('mycoolmod.widget.thingy'), 'http://some.domain.com/another/path/mycoolpath/widget/thingy/');
		},

		moduleUrls: function () {
			dojo.registerModulePath('mycoolmod', 'some/path/mycoolpath');
			dojo.registerModulePath('mycoolmod2', '/some/path/mycoolpath2');
			dojo.registerModulePath('mycoolmod.widget', 'http://some.domain.com/another/path/mycoolpath/widget');
			dojo.registerModulePath('ipv4.widget', 'http://ipv4user:ipv4passwd@some.domain.com:2357/another/path/ipv4/widget');
			dojo.registerModulePath('ipv6.widget', 'ftp://ipv6user:ipv6passwd@[::2001:0db8:3c4d:0015:0:0:abcd:ef12]:1113/another/path/ipv6/widget');
			dojo.registerModulePath('ipv6.widget2', 'https://[0:0:0:0:0:1]/another/path/ipv6/widget2');


			var basePrefix = require.baseUrl;

			assert.strictEqual(dojo.moduleUrl('mycoolmod', 'my/favorite.html'),
				compactPath(basePrefix + 'some/path/mycoolpath/my/favorite.html'));
			assert.strictEqual(dojo.moduleUrl('mycoolmod.my', 'favorite.html'),
				compactPath(basePrefix + 'some/path/mycoolpath/my/favorite.html'));

			assert.strictEqual(dojo.moduleUrl('mycoolmod2', 'my/favorite.html'),
				'/some/path/mycoolpath2/my/favorite.html');
				
			assert.strictEqual(dojo.moduleUrl('mycoolmod2.my', 'favorite.html'),
				'/some/path/mycoolpath2/my/favorite.html');
				

			assert.strictEqual(dojo.moduleUrl('mycoolmod.widget', 'my/favorite.html'),
				'http://some.domain.com/another/path/mycoolpath/widget/my/favorite.html');
				
			assert.strictEqual(dojo.moduleUrl('mycoolmod.widget.my', 'favorite.html'),
				'http://some.domain.com/another/path/mycoolpath/widget/my/favorite.html');
				
			// individual component testing
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html'))).uri,
				'http://ipv4user:ipv4passwd@some.domain.com:2357/another/path/ipv4/widget/components.html');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html'))).scheme, 'http');

			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html'))).authority,
				'ipv4user:ipv4passwd@some.domain.com:2357');
				
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html'))).user,'ipv4user');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html'))).password, 'ipv4passwd');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html'))).host, 'some.domain.com');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html'))).port, '2357');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html?query'))).path,
				'/another/path/ipv4/widget/components.html');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html?q =somequery'))).query, 'q =somequery');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv4.widget', 'components.html#fragment'))).fragment, 'fragment');

			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html'))).uri,
				'ftp://ipv6user:ipv6passwd@[::2001:0db8:3c4d:0015:0:0:abcd:ef12]:1113/another/path/ipv6/widget/components.html');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html'))).scheme, 'ftp');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html'))).authority,
				'ipv6user:ipv6passwd@[::2001:0db8:3c4d:0015:0:0:abcd:ef12]:1113');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html'))).user, 'ipv6user');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html'))).password,'ipv6passwd');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html'))).host,
				'::2001:0db8:3c4d:0015:0:0:abcd:ef12');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html'))).port, '1113');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html?query'))).path,
				'/another/path/ipv6/widget/components.html');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html?somequery'))).query,'somequery');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget', 'components.html?somequery#somefragment'))).fragment,
				'somefragment');

			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).uri,
				'https://[0:0:0:0:0:1]/another/path/ipv6/widget2/components.html');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).scheme, 'https');
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).authority, '[0:0:0:0:0:1]');
			assert.isNull((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).user);
			assert.isNull((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).password);
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).host, '0:0:0:0:0:1');
			assert.isNull((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).port);
			assert.strictEqual((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).path,
				'/another/path/ipv6/widget2/components.html');
			assert.isNull((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).query);
			assert.isNull((new dojo._Url(dojo.moduleUrl('ipv6.widget2', 'components.html'))).fragment);
		}
	});
});

