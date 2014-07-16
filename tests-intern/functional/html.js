define([
	'require',
	'intern!object',
	'intern/chai!assert'
], function (require, registerSuite, assert) {
	function testQueriedHtmlSet(session, args) {
		return session.executeAsync(function (queryStr, markup, done) {
				require(['dojo/html', 'dojo/query', 'dojo/domReady!'], function (html, query) {
					var targetNode = query(queryStr)[0];
					var actual;

					html.set(targetNode, markup);
					/* global ieTrimSpaceBetweenTags */
					actual = ieTrimSpaceBetweenTags(targetNode.innerHTML.toLowerCase());
					done(markup.toLowerCase() === actual);
				});
			}, args)
			.then(function (result) {
				assert.isTrue(result);
			});
	}

	registerSuite({
		name: 'dojo/html',

		beforeEach: function () {
			return this.get('remote')
				.setExecuteAsyncTimeout(10000)
				.get(require.toUrl('./support/html.html'))
				.executeAsync(function (done) {
					window.ieTrimSpaceBetweenTags = function (str){
						return str.replace(/(<[a-z]*[^>]*>)\s*/ig, '$1');
					};
					require(['dojo/_base/declare'], function (declare) {
						declare('SimpleThing', null, {
							constructor: function(params, node) {
								node.setAttribute('test', 'ok');
							}
						});

						done();
					});
				});
		},

		'.set': {
			'basic usage': function () {
				var query = 'body';
				var markup = 'expected';

				return testQueriedHtmlSet(this.get('remote'), [query, markup]);
			},


			'attach onEnd handler': function () {
				return this.get('remote')
					.executeAsync(function (done) {
						require(['dojo/html', 'dojo/domReady!'], function (html) {
							var targetNode = document.getElementById('container');
							var msg = 'expected';
							var handler = function () {
								done(targetNode.innerHTML);
							};

							html.set(targetNode, msg, { onEnd: handler });
						});
					})
					.then(function (result) {
						assert.equal(result, 'expected');
					});
			},
			'parse content true': function () {
				return this.get('remote')
					.executeAsync(function (done) {
						require(['dojo/html', 'dojo/domReady!'], function (html) {
							var targetNode = document.getElementById('container');
							var content = '<div data-dojo-type="SimpleThing" data-dojo-id="ifrs" data="{}"></div>';
							var options = {
								parseContent: true,
								postscript: function () {
									this.set();

									done({
										/* globals ifrs */
										ifrs: !!(typeof ifrs !== 'undefined' && ifrs.declaredClass === 'SimpleThing'),
										parseResultsLength: this.parseResults.length
									});
								}
							};

							html.set(targetNode, content, options);
						});
					})
					.then(function (result) {
						assert.isTrue(result.ifrs);
						assert.equal(result.parseResultsLength, 1);
					});
			},

			'change content of TRhead': function () {
				var query = 'table#tableTest > thead > tr';
				var markup = '<td><div>This</div>Should<u>Work</u></td>';

				return testQueriedHtmlSet(this.get('remote'), [query, markup]);
			},

			'change content of THhead': function () {
				var query = 'table#tableTest > thead';
				var markup = '<tr><td><div>This</div>Should<u>Work</u></td></tr>';

				return testQueriedHtmlSet(this.get('remote'), [query, markup]);
			},

			'change content of TRBody': function () {
				var query = 'table#tableTest > tbody > tr';
				var markup = '<td><div>This</div>Should<u>Work</u></td>';

				return testQueriedHtmlSet(this.get('remote'), [query, markup]);
			},

			'change content of TBody': function () {
				var query = 'table#tableTest > tbody';
				var markup = '<tr><td><div>This</div>Should<u>Work</u></td></tr>';

				return testQueriedHtmlSet(this.get('remote'), [query, markup]);
			},

			'change content of Table': function () {
				var query = 'table#tableTest';
				var markup = '<tbody><tr><td><div>This</div>Should<u>Work</u></td></tr></tbody>';

				return testQueriedHtmlSet(this.get('remote'), [query, markup]);
			},

			'basic NodeList': function () {
				return this.get('remote')
					.executeAsync(function (done) {
						require([
							'dojo/html',
							'dojo/dom-construct',
							'dojo/query',
							'dojo/domReady!'
						], function (html, domConstruct, query) {
							var targetNode = document.getElementById('container');
							var tmpUL = domConstruct.create('ul');
							domConstruct.create('li', { innerHTML: 'item 1' }, tmpUL);
							domConstruct.create('li', { innerHTML: 'item 2' }, tmpUL);

							html.set(targetNode, tmpUL.childNodes);
							done(query('li', targetNode).length);
						});
					})
					.then(function (result) {
						assert.equal(result, 2);
					});
			},

			'mixed content': function () {
				var query = 'body';
				var markup = '<h4>See Jane</h4>Look at her <span>Run</span>!';

				return testQueriedHtmlSet(this.get('remote'), [query, markup]);
			},

			'extract content option': function () {
				return this.get('remote')
					.executeAsync(function (done) {
						require(['dojo/html', 'dojo/query', 'dojo/domReady!'], function (html, query) {
							var targetNode = document.getElementById('container');
							var markup = ''
								+ '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">'
								+ '<html>											'
								+ '	<head>											'
								+ '		<title>										'
								+ '			the title									 '
								+ '		</title>									'
								+ '	</head>											'
								+ '	<body>											'
								+ '		<p>											'
								+ '			This is the <b>Good Stuff</b><br>		'
								+ '		</p>										'
								+ '	</body>											'
								+ '</html>											';

							html.set(targetNode, markup, { extractContent: true });
							done({
								targetNodeMissingTitle: (targetNode.innerHTML.indexOf('title') === -1),
								actualLength: query('*', targetNode).length
							});
						});
					})
					.then(function (result) {
						assert.isTrue(result.targetNodeMissingTitle);
						assert.equal(result.actualLength, 3);
					});
			},

			'inheritance': (function () {
				function runTest(session, options) {
					return session.executeAsync(function (options, done) {
						require([
							'dojo/html',
							'dojo/parser',
							'dojo/_base/lang',
							'sinon',
							'dojo/domReady!'
						], function (html, parser, lang, sinon) {
							var targetNode = document.getElementById('container');
							var markup = '<div data-dojo-type="SimpleThing" data-dojo-id="ifrs" data="{}"></div>';
							var parseSpy = sinon.spy(parser, 'parse');
							var inherited;

							// FF adds __exposedProps__ to writable objects passed through the eval.
							// cloning options allows html.set write to options as needed
							options = lang.mixin({}, options);
							html.set(targetNode, markup, options);
							inherited = parseSpy.lastCall.args[0].inherited;
							parseSpy.restore();
							done({
								called: parseSpy.called,
								dir: inherited.dir,
								lang: inherited.lang,
								textDir: inherited.textDir
							});
						});
					}, [options]);
				}

				return {
					'dir, lang, textDir are not specified': function () {
						var options = { parseContent: true };

						return runTest(this.get('remote'), options)
							.then(function (result) {
								assert.isTrue(result.called, 'parser was called');
								assert.notOk(result.dir, 'dir should not exist');
								assert.notOk(result.lang, 'lang should not exist');
								assert.notOk(result.textDir, 'textDir should not exist');
							});
					},

					'dir, lang, textDir are specified': function () {
						var options = {
							parseContent: true,
							dir: 'expectedDir',
							lang: 'expectedLang',
							textDir: 'expectedTextDir'
						};

						return runTest(this.get('remote'), options)
							.then(function (result) {
								assert.isTrue(result.called, 'parser was called');
								assert.equal(result.dir, options.dir);
								assert.equal(result.lang, options.lang);
								assert.equal(result.textDir, options.textDir);
							});
					}
				};
			}())
		},

		'._emptyNode': function () {
			return this.get('remote')
				.executeAsync(function (done) {
					require(['dojo/html', 'dojo/domReady!'], function (html) {
						var targetNode = document.getElementById('container');

						targetNode.innerHTML = '<div><span>just</span>some test<br/></div>text';
						html._emptyNode(targetNode);
						done(!!(targetNode.childNodes.length === 0 && targetNode.innerHTML === ''));
					});
				})
				.then(function (result) {
					assert.isTrue(result);
				});
		},

		'query mixin': {
			'simple': function () {
				return this.get('remote')
					.executeAsync(function (done) {
						require([
							'dojo/html',
							'dojo/query',
							'dojo/NodeList-html',
							'dojo/domReady!'
						], function (html, query) {
							var markup = '<p>expected</p>';
							var options = { onEnd: onEnd };

							query('#container').html(markup, options);

							function onEnd() {
								var node = query('#container p');
								done({
									numNodes: node.length,
									contents: node[0].innerHTML
								});
							}
						});
					})
					.then(function (result) {
						assert.equal(result.numNodes, 1);
						assert.equal(result.contents, 'expected');
					});
			},

			'nodelist html': function () {
				return this.get('remote')
					.executeAsync(function (done) {
						require([
							'dojo/html',
							'dojo/query',
							'dojo/NodeList-dom',
							'dojo/NodeList-html',
							'dojo/domReady!'], function (html, query) {
							var options = { parseContent: true, onBegin: onBegin };
							var markup = '<li data-dojo-type=\'SimpleThing\'>1</li><li data-dojo-type=\'' +
								'SimpleThing\'>2</li><li data-dojo-type=\'SimpleThing\'>3</li>';
							var liNodes;

							query('.zork').html(markup, options).removeClass('notdone').addClass('done');

							liNodes = query('.zork > li');
							done({
								// test to make sure three li's were added to class="zork" node (3x 3 set li's)
								numLiNodes: liNodes.length,
								// test the innerHTML's got replaced in our onBegin
								replacementHappened: liNodes.every(function(n) { return n.innerHTML.match(/MOOO/); }),
								// test the parent elements got the correct className
								properClassName: query('.zork').every(classIsZorkDone),
								// and test the parser correctly created object from the child nodes
								// ...they should all have a test attribute now
								hasTestAttribute: liNodes.every(function(n) { return n.getAttribute('test') === 'ok'; })
							});

							function onBegin() {
								this.content = this.content.replace(/([0-9])/g, 'MOOO');
								this.inherited('onBegin', arguments);
							}

							function classIsZorkDone(n) {
								return n.className === 'zork done';
							}
						});
					})
					.then(function (result) {
						assert.equal(result.numLiNodes, 9);
						assert.isTrue(result.replacementHappened);
						assert.isTrue(result.properClassName);
						assert.isTrue(result.hasTestAttribute);
					});
			},

			'_ContentSetter': function () {
				return this.get('remote')
					.executeAsync(function (done) {
						require(['dojo/html', 'dojo/_base/array', 'dojo/domReady!'], function (html, array) {
							var targetNode = document.getElementById('container');
							var args = [
								['simple'],
								[
									'<div data-dojo-type="SimpleThing" data-dojo-id="id00">parsed content</div>',
									{ parseContent: true }
								],
								[
									'<div data-dojo-type="SimpleThing" data-dojo-id="id01">parsed content</div>',
									{ parseContent: true }
								]
							];
							var setter = new html._ContentSetter({ node: targetNode });

							array.forEach(args, function (applyArgs) {
								setter.node = targetNode;
								setter.set.apply(setter, applyArgs);
								setter.tearDown();
							});

							/* global id00 */
							/* global id01 */
							done(!!(id00 && id01 && !setter.parseResults));
						});
					})
					.then(function (result) {
						assert.isTrue(result);
					});
			}
		}
	});
});