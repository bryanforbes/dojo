define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'dojo/aspect',
	'dojo/dom-style',
	'dojo/query',
	'dojo/NodeList-fx',
	'dojo/NodeList-dom'
], function (require, registerSuite, assert, Deferred, aspect, domStyle, query) {
	registerSuite({
		name: 'dojo/NodeList-fx',

		before: function () {
			var deferred = new Deferred();
			require(['dojo/text!./NodeList-fx.html'], function (html) {
				document.body.innerHTML = html;
				deferred.resolve();
			});
			return deferred.promise;
		},

		fadeOut: function () {
			var deferred = this.async();
			query('p').style('opacity', 1);
			var anim = query('p').fadeOut();
			aspect.after(anim, 'onEnd', deferred.callback(function () {
				query('p').forEach(function(item){ 
					assert.equal(domStyle.get(item, 'opacity'), 0);
				});
			}), true);
			anim.play();
		},

		fadeIn: function () {
			var deferred = this.async();
			query('p').style('opacity', 0);
			var anim = query('p').fadeIn();
			aspect.after(anim, 'onEnd', deferred.callback(function () {
				query('p').forEach(function(item){ 
					assert.equal(domStyle.get(item, 'opacity'), 1);
				});
			}), true);
			anim.play();
		},

		wipeOut: function () {
			var deferred = this.async();
			query('p').style('height', '');
			var anim = query('p').wipeOut();
			aspect.after(anim, 'onEnd', deferred.callback(function () {
				query('p').forEach(function(item){ 
					assert.equal(domStyle.get(item, 'height'), 0);
				});
			}), true);
			anim.play();
		},

		wipeIn: function () {
			var deferred = this.async();
			query('p').style('height', 0);
			var anim = query('p').wipeIn();
			aspect.after(anim, 'onEnd', deferred.callback(function () {
				query('p').forEach(function(item){ 
					assert.notEqual(domStyle.get(item, 'height'), 0);
				});
			}), true);
			anim.play();
		},

		slideTo: function () {
			var deferred = this.async();
			var anim = query('p').slideTo({ left: 500 });
			aspect.after(anim, 'onEnd', deferred.callback(function () {
				query('p').forEach(function(item){ 
					assert.equal(domStyle.get(item, 'left'), 500);
				});
			}), true);
			anim.play();
		},

		anim: function () {
			var deferred = this.async();
			query('p').style('position', '');
			query('p').style('left', '');
			var anim = query('p').anim({ width: 500 });
			aspect.after(anim, 'onEnd', deferred.callback(function () {
				query('p').forEach(function (item) { 
					assert.equal(domStyle.get(item, 'width'), 500);
				});
			}), true);
		},

		auto: function () {
			var deferred =  this.async(null, 3);
			query('p').fadeOut({ 
				auto:true,
				onEnd: deferred.callback(function () {})
			});
		}
	});
});
