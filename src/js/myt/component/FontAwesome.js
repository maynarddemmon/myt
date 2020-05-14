((pkg) => {
    const sizeClasses = ['','fa-lg','fa-2x','fa-3x','fa-4x','fa-5x'],
        
        updateInstance = (instance) => {
            let props = instance.properties;
            if (props) {
                if (typeof props === 'string') {
                    props = props.split(' ');
                } else {
                    props = props.concat();
                }
                props.unshift(instance.size);
                props.unshift(instance.icon);
            } else {
                props = [instance.icon, instance.size];
            }
            
            instance.setHtml(FontAwesome.makeTag(props));
        };
    
    pkg.loadCSSFonts(['//use.fontawesome.com/releases/v5.0.8/css/all.css']);
    
    /** An adapter for FontAwesome.
        
        Attributes:
            icon:string The name of the FA icon to set.
            size:number A number from 0 to 5 with 0 being normal size and 5 being
                the largest size.
            propeties:string || array A space separated string or list of FA
                CSS classes to set.
    */
    const FontAwesome = pkg.FontAwesome = new JS.Class('FontAwesome', pkg.Markup, {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            makeTag: function(props) {
                if (Array.isArray(props)) {
                    let len = props.length,
                        prop,
                        i;
                    if (len > 0) {
                        props.unshift('fa');
                        ++len;
                        
                        if (props[1].indexOf('fa-') !== 0) props[1] = 'fa-' + props[1];
                        
                        if (len >= 3) props[2] = sizeClasses[props[2]] || '';
                        
                        if (len > 3) {
                            i = 3;
                            for (; len > i; ++i) {
                                prop = props[i];
                                if (prop.indexOf('fa-') !== 0) props[i] = 'fa-' + prop;
                            }
                        }
                        
                        return '<i class="' + props.join(' ') + '"></i>';
                    }
                }
                
                pkg.dumpStack('Error making tag');
                console.error(props);
                return '';
            },
            
            registerForNotification: (instance) => {
                pkg.registerForFontNotification(instance, 'Font Awesome\ 5 Free 400'); // regular
                pkg.registerForFontNotification(instance, 'Font Awesome\ 5 Free 900'); // solid
                pkg.registerForFontNotification(instance, 'Font Awesome\ 5 Brands 400'); // brands
            },
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            this.size = 0;
            this.icon = '';
            
            this.callSuper(parent, attrs);
            
            updateInstance(this);
            
            FontAwesome.registerForNotification(this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setIcon: function(v) {
            const existing = this.icon;
            this.set('icon', v, true);
            if (this.inited && existing !== v) updateInstance(this);
        },
        
        setSize: function(v) {
            const existing = this.size;
            this.set('size', v, true);
            if (this.inited && existing !== v) updateInstance(this);
        },
        
        setProperties: function(v) {
            this.properties = v;
            this.fireEvent('properties', v);
            if (this.inited) updateInstance(this);
        }
    });
})(myt);
