/** A spinner. Makes use of Spin.js.
    
    Events:
        None
    
    Attributes:
        lines:number
        length:number
        lineWidth:number
        radius:number
        corners:number
        lineColor:string
        direction:number
        speed:number
        trail:number
        lineOpacity:number
    
    Private Attributes:
        __spinner:Spinner the Spin.js spinner.
*/
myt.Spinner = new JS.Class('Spinner', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.lines = 12;
        this.length = 7;
        this.lineWidth = 5;
        this.radius = 10;
        this.corners = 1;
        this.lineColor = '#000000';
        this.direction = this.speed = 1;
        this.trail = 100;
        this.lineOpacity = 0.25;
        
        if (attrs.visible === undefined) attrs.visible = false;
        
        this.callSuper(parent, attrs);
        
        if (this.visible) this.__show();
    },
    
    /** @overrides myt.View */
    destroyBeforeOrphaning: function() {
        this.__hide();
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLines: function(v) {this.lines = v;},
    setLength: function(v) {this.length = v;},
    setLineWidth: function(v) {this.lineWidth = v;},
    setRadius: function(v) {this.radius = v;},
    setCorners: function(v) {this.corners = v;},
    setLineColor: function(v) {this.lineColor = v;},
    setDirection: function(v) {this.direction = v;},
    setSpeed: function(v) {this.speed = v;},
    setTrail: function(v) {this.trail = v;},
    setLineOpacity: function(v) {this.lineOpacity = v;},
    
    /** @overrides myt.View */
    setVisible: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            if (this.visible) {
                this.__show();
            } else {
                this.__hide();
            }
        }
    },
    
    getSize: function() {
        return 2 * (this.radius + this.length + this.lineWidth);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __show: function() {
        var spinner = this.__spinner || (this.__spinner = new myt.Spinner.FACTORY({
            lines:this.lines, 
            length:this.length, 
            width:this.lineWidth, 
            radius:this.radius, 
            corners:this.corners,
            color:this.lineColor,
            direction:this.direction,
            speed:this.speed,
            trail:this.trail,
            opacity:this.lineOpacity
        }));
        
        var size = this.getSize();
        this.setWidth(size);
        this.setHeight(size);
        
        spinner.spin(this.domElement);
    },
    
    /** @private */
    __hide: function() {
        var spinner = this.__spinner;
        if (spinner) spinner.stop();
    }
});

/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 * 
 * fgnass.github.com/spin.js#v1.3
 */
myt.Spinner.FACTORY = function() {
  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(myt.getElement('head'), el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    if(s[prop] !== undefined) return prop
    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /** The constructor */
  function Spinner(o) {
    this.opts = o;
  }

  /**
   * Adds the spinner to the given target element. If this instance is already
   * spinning, it is automatically removed from its previous target b calling
   * stop() internally.
   */
  Spinner.prototype.spin = function(target) {
    this.stop()
    var el = this.el = css(createEl(), {
      position:'relative',
      left:(target.offsetWidth >> 1) + 'px',
      top:(target.offsetHeight >> 1) + 'px'
    })
    target.insertBefore(el, null)
    this.lines(el, this.opts)
    return this
  }
  
  /**
   * Stops and removes the Spinner.
   */
  Spinner.prototype.stop = function() {
    var el = this.el
    if (el) {
      if (el.parentNode) el.parentNode.removeChild(el)
      this.el = undefined
    }
    return this
  }
  
  /**
   * Internal method that draws the individual lines. Will be overwritten
   * in VML fallback mode below.
   */
  Spinner.prototype.lines = function(el, o) {
    var i = 0
      , start = (o.lines - 1) * (1 - o.direction) / 2
      , seg
    
    function fill(color) {
      return css(createEl(), {
        position: 'absolute',
        width: (o.length+o.width) + 'px',
        height: o.width + 'px',
        background: color,
        transformOrigin: 'left',
        transform: 'rotate(' + ~~(360/o.lines*i) + 'deg) translate(' + o.radius+'px' +',0)',
        borderRadius: (o.corners * o.width>>1) + 'px'
      })
    }
    
    for (; i < o.lines; i++) {
      seg = css(createEl(), {
        position: 'absolute',
        top: 1+~(o.width/2) + 'px',
        transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
        opacity: o.opacity,
        animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
      })
      
      ins(el, ins(seg, fill(o.color)))
    }
    return el
  }

  var probe = css(createEl('group'))
  useCssAnimations = vendor(probe, 'animation')

  return Spinner
}();
