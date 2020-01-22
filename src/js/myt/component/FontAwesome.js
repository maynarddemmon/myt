/** An adapter for FontAwesome.
    
    Attributes:
        icon:string The name of the FA icon to set.
        size:number A number from 0 to 5 with 0 being normal size and 5 being
            the largest size.
        propeties:string || array A space separated string or list of FA
            CSS classes to set.
*/
myt.FontAwesome = new JS.Class('FontAwesome', myt.Markup, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        FA_SIZE_CLASSES: ['','fa-lg','fa-2x','fa-3x','fa-4x','fa-5x'],
        
        makeTag: function(props) {
            if (Array.isArray(props)) {
                var len = props.length;
                if (len > 0) {
                    props.unshift('fa');
                    ++len;
                    
                    if (props[1].indexOf('fa-') !== 0) props[1] = 'fa-' + props[1];
                    
                    if (len >= 3) props[2] = this.FA_SIZE_CLASSES[props[2]] || '';
                    
                    if (len > 3) {
                        var prop, i = 3;
                        for (; len > i; ++i) {
                            prop = props[i];
                            if (prop.indexOf('fa-') !== 0) props[i] = 'fa-' + prop;
                        }
                    }
                    
                    return '<i class="' + props.join(' ') + '"></i>';
                }
            }
            
            myt.dumpStack('Error making tag');
            console.error(props);
            return '';
        },
        
        targets: [],
        active: false,
        
        registerForNotification: function(fa) {
            if (!this.active) this.targets.push(fa);
        },
        
        notifyActive: function(active) {
            this.active = active;
            if (active) {
                var targets = this.targets;
                while (targets.length) targets.pop().sizeViewToDom();
            }
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.size = 0;
        this.icon = '';
        
        this.callSuper(parent, attrs);
        
        this.__update();
        
        myt.FontAwesome.registerForNotification(this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setIcon: function(v) {
        var existing = this.icon;
        this.set('icon', v, true);
        if (this.inited && existing !== v) this.__update();
    },
    
    setSize: function(v) {
        var existing = this.size;
        this.set('size', v, true);
        if (this.inited && existing !== v) this.__update();
    },
    
    setProperties: function(v) {
        this.properties = v;
        this.fireEvent('properties', v);
        if (this.inited) this.__update();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __update: function() {
        var props = this.properties;
        if (props) {
            if (typeof props === 'string') {
                props = props.split(' ');
            } else {
                props = props.concat();
            }
            props.unshift(this.size);
            props.unshift(this.icon);
        } else {
            props = [this.icon, this.size];
        }
        
        this.setHtml(myt.FontAwesome.makeTag(props));
    }
});

/* Font Face Observer v2.1.0 - © Bram Stein. License: BSD-3-Clause */(function(){function l(a,b){document.addEventListener?a.addEventListener("scroll",b,!1):a.attachEvent("scroll",b)}function m(a){document.body?a():document.addEventListener?document.addEventListener("DOMContentLoaded",function c(){document.removeEventListener("DOMContentLoaded",c);a()}):document.attachEvent("onreadystatechange",function k(){if("interactive"==document.readyState||"complete"==document.readyState)document.detachEvent("onreadystatechange",k),a()})};function t(a){this.a=document.createElement("div");this.a.setAttribute("aria-hidden","true");this.a.appendChild(document.createTextNode(a));this.b=document.createElement("span");this.c=document.createElement("span");this.h=document.createElement("span");this.f=document.createElement("span");this.g=-1;this.b.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
this.f.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText="display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c)}
function u(a,b){a.a.style.cssText="max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:"+b+";"}function z(a){var b=a.a.offsetWidth,c=b+100;a.f.style.width=c+"px";a.c.scrollLeft=c;a.b.scrollLeft=a.b.scrollWidth+100;return a.g!==b?(a.g=b,!0):!1}function A(a,b){function c(){var a=k;z(a)&&a.a.parentNode&&b(a.g)}var k=a;l(a.b,c);l(a.c,c);z(a)};function B(a,b){var c=b||{};this.family=a;this.style=c.style||"normal";this.weight=c.weight||"normal";this.stretch=c.stretch||"normal"}var C=null,D=null,E=null,F=null;function G(){if(null===D)if(J()&&/Apple/.test(window.navigator.vendor)){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);D=!!a&&603>parseInt(a[1],10)}else D=!1;return D}function J(){null===F&&(F=!!document.fonts);return F}
function K(){if(null===E){var a=document.createElement("div");try{a.style.font="condensed 100px sans-serif"}catch(b){}E=""!==a.style.font}return E}function L(a,b){return[a.style,a.weight,K()?a.stretch:"","100px",b].join(" ")}
B.prototype.load=function(a,b){var c=this,k=a||"BESbswy",r=0,n=b||3E3,H=(new Date).getTime();return new Promise(function(a,b){if(J()&&!G()){var M=new Promise(function(a,b){function e(){(new Date).getTime()-H>=n?b(Error(""+n+"ms timeout exceeded")):document.fonts.load(L(c,'"'+c.family+'"'),k).then(function(c){1<=c.length?a():setTimeout(e,25)},b)}e()}),N=new Promise(function(a,c){r=setTimeout(function(){c(Error(""+n+"ms timeout exceeded"))},n)});Promise.race([N,M]).then(function(){clearTimeout(r);a(c)},
b)}else m(function(){function v(){var b;if(b=-1!=f&&-1!=g||-1!=f&&-1!=h||-1!=g&&-1!=h)(b=f!=g&&f!=h&&g!=h)||(null===C&&(b=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),C=!!b&&(536>parseInt(b[1],10)||536===parseInt(b[1],10)&&11>=parseInt(b[2],10))),b=C&&(f==w&&g==w&&h==w||f==x&&g==x&&h==x||f==y&&g==y&&h==y)),b=!b;b&&(d.parentNode&&d.parentNode.removeChild(d),clearTimeout(r),a(c))}function I(){if((new Date).getTime()-H>=n)d.parentNode&&d.parentNode.removeChild(d),b(Error(""+
n+"ms timeout exceeded"));else{var a=document.hidden;if(!0===a||void 0===a)f=e.a.offsetWidth,g=p.a.offsetWidth,h=q.a.offsetWidth,v();r=setTimeout(I,50)}}var e=new t(k),p=new t(k),q=new t(k),f=-1,g=-1,h=-1,w=-1,x=-1,y=-1,d=document.createElement("div");d.dir="ltr";u(e,L(c,"sans-serif"));u(p,L(c,"serif"));u(q,L(c,"monospace"));d.appendChild(e.a);d.appendChild(p.a);d.appendChild(q.a);document.body.appendChild(d);w=e.a.offsetWidth;x=p.a.offsetWidth;y=q.a.offsetWidth;I();A(e,function(a){f=a;v()});u(e,
L(c,'"'+c.family+'",sans-serif'));A(p,function(a){g=a;v()});u(p,L(c,'"'+c.family+'",serif'));A(q,function(a){h=a;v()});u(q,L(c,'"'+c.family+'",monospace'))})})};"object"===typeof module?module.exports=B:(window.FontFaceObserver=B,window.FontFaceObserver.prototype.load=B.prototype.load);}());

(new FontFaceObserver('Font Awesome\ 5 Free')).load('\uf00c\uf000').then(
    () => {
        // A timeout seems to be necessary to correctly measure the height of
        // the dom elements after the font has been loaded.
        setTimeout(() => {
            myt.FontAwesome.notifyActive(true);
        }, 100);
    }
);
myt.loadCSSFonts(['//use.fontawesome.com/releases/v5.0.8/css/all.css']);
