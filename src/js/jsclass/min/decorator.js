(function(b){var c=(typeof exports==='object'),a=(typeof JS==='undefined')?require('./core'):JS;if(c)exports.JS=exports;b(a,c?exports:a)})(function(e,i){'use strict';var g=new e.Class('Decorator',{initialize:function(b,c){var a=new e.Class(),h={},f,d;for(f in b.prototype){d=b.prototype[f];if(typeof d==='function'&&d!==b)d=this.klass.delegate(f);h[f]=d}a.include(new e.Module(h),{_0:false});a.include(this.klass.InstanceMethods,{_0:false});a.include(c);return a},extend:{delegate:function(b){return function(){return this.component[b].apply(this.component,arguments)}},InstanceMethods:new e.Module({initialize:function(b){this.component=b;this.klass=this.constructor=b.klass;var c,a;for(c in b){if(this[c])continue;a=b[c];if(typeof a==='function')a=g.delegate(c);this[c]=a}},extend:function(b){this.component.extend(b);var c,a;for(c in b){a=b[c];if(typeof a==='function')a=g.delegate(c);this[c]=a}}})}});i.Decorator=g});
//@ sourceMappingURL=decorator.js.map