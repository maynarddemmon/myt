!function(e){var t="object"==typeof exports,n="undefined"==typeof JS?require("./core"):JS,r=n.Enumerable||require("./enumerable").Enumerable,i=n.Hash||require("./hash").Hash;t&&(exports.JS=exports),e(n,r,i,t?exports:n)}(function(e,t,n,r){"use strict";var i=new e.Class("Range",{include:t||{},extend:{compare:function(t,n){return e.isType(t,Object)?t.compareTo(n):n>t?-1:t>n?1:0},succ:function(n){if(e.isType(n,"string")){for(var r=n.split(""),i=r.length,s=null,o=null,a=!0;a&&i--;)s=null,t.forEach.call(this.SETS,function(e){var t=this[e];r[i]===t._last&&(o=t,s=t._first)},this),null===s&&(s=String.fromCharCode(r[i].charCodeAt(0)+1),a=!1),r[i]=s;return a&&r.unshift("0"===o._first?"1":o._first),r.join("")}return e.isType(n,"number")?n+1:"function"==typeof n.succ?n.succ():null}},initialize:function(e,t,n){this._first=e,this._last=t,this._excludeEnd=!!n},forEach:function(n,r){if(!n)return this.enumFor("forEach");n=t.toFn(n);var i=this._first,s=this._excludeEnd;if(!(this.klass.compare(i,this._last)>0)){for(var o=e.isType(i,Object)?function(e,t){return e.compareTo(t)<0}:function(e,t){return e!==t};o(i,this._last);)if(n.call(r,i),i=this.klass.succ(i),e.isType(i,"string")&&i.length>this._last.length){s=!0;break}this.klass.compare(i,this._last)>0||s||n.call(r,i)}},equals:function(n){return e.isType(n,i)&&t.areEqual(n._first,this._first)&&t.areEqual(n._last,this._last)&&n._excludeEnd===this._excludeEnd},hash:function(){var e=n.codeFor(this._first)+"..";return this._excludeEnd&&(e+="."),e+=n.codeFor(this._last)},first:function(){return this._first},last:function(){return this._last},excludesEnd:function(){return this._excludeEnd},includes:function(e){var t=this.klass.compare(e,this._first),n=this.klass.compare(e,this._last);return t>=0&&(this._excludeEnd?0>n:0>=n)},step:function(e,n,r){if(!n)return this.enumFor("step",e);n=t.toFn(n);var i=0;this.forEach(function(t){0===i%e&&n.call(r,t),i+=1})},toString:function(){var e=""+this._first+"..";return this._excludeEnd&&(e+="."),e+=""+this._last}});i.extend({DIGITS:new i("0","9"),LOWERCASE:new i("a","z"),UPPERCASE:new i("A","Z"),SETS:["DIGITS","LOWERCASE","UPPERCASE"]}),i.alias({begin:"first",end:"last",covers:"includes",match:"includes",member:"includes"}),r.Range=i});
//@ sourceMappingURL=range.js.map