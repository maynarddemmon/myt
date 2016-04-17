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
        this.fireNewEvent('properties', v);
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

myt.loadScript('//ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js', function() {
    WebFont.load({
        custom: {
            families: ['FontAwesome'],
            urls: ['//maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css'],
            testStrings: {'FontAwesome':'\uf00c\uf000'}
        },
        fontactive: function(familyName, fvd) {
            myt.FontAwesome.notifyActive(true);
        }
    });
}, true);
