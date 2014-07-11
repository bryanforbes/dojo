define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/dom',
	'dojo/_base/array',
	'dojo/parser'
], function(require, registerSuite, assert, Deferred, declare, lang, dom, array, parser) {

	var finishCreatingAsyncWidgets = new Deferred();

	var AsyncWidget = declare('AsyncWidget', null, {
		markupFactory: function (params, node) {
			return finishCreatingAsyncWidgets.then(function(){ return new AsyncWidget(params, node); });
		},
		constructor: function(args){
			this.params = args;
			lang.mixin(this, args);
		},
		startup: function(){
			this._started = true;
		}
	});

	declare('SyncWidget', null, {
		constructor: function(args){
			this.params = args;
			lang.mixin(this, args);
		},
		startup: function(){
			this._started = true;
		}
	});

	registerSuite({
		name: 'dojo/parser async',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./parserAsync.html'], function(html) {
				document.body.innerHTML = html;
				deferred.resolve();
				// parser.parse().then(deferred.resolve, deferred.reject);
			});
			return deferred.promise;
		},

		'async parse': function () {
			var deferred = this.async();

			var parsePromise = parser.parse(dom.byId('main'));
			
			assert.isFalse(parsePromise.isFulfilled());
			assert.isUndefined(window.asyncWidget);
			assert.isUndefined(window.syncWidget._started);

			finishCreatingAsyncWidgets.resolve(true);

			parsePromise.then(deferred.callback(function(list){
				assert.isTrue(window.asyncWidget._started, 'async widget started');
				assert.isTrue(window.syncWidget._started, 'sync widget started too');
				assert.strictEqual(array.map(list, function(cls){ return cls.declaredClass; }).join(', '), 'AsyncWidget, SyncWidget');
			}));
		}
	});
});