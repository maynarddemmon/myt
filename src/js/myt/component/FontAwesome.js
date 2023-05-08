(pkg => {
    const sizeClasses = ['','fa-lg','fa-2x','fa-3x','fa-4x','fa-5x'],
        
        makeTag = props => {
            if (Array.isArray(props)) {
                let len = props.length;
                if (len > 0) {
                    props.unshift('fa');
                    len++;
                    
                    if (!props[1].startsWith('fa-')) props[1] = 'fa-' + props[1];
                    
                    if (len >= 3) props[2] = sizeClasses[props[2]] ?? '';
                    
                    if (len > 3) {
                        for (let i = 3; len > i; i++) {
                            if (!props[i].startsWith('fa-')) props[i] = 'fa-' + props[i];
                        }
                    }
                    
                    return '<i class="' + props.join(' ') + '"></i>';
                }
            }
            
            pkg.dumpStack('Error making tag');
            console.error(props);
            return '';
        },
        
        updateInstance = instance => {
            let props = instance.properties;
            if (props) {
                if (typeof props === 'string') {
                    props = props.split(' ');
                } else {
                    props = props.slice();
                }
            } else {
                props = [];
            }
            props.unshift(instance.icon, instance.size);
            
            instance.setHtml(makeTag(props));
        },
        
        registerForNotification = instance => {
            ['Free 400', 'Free 900', 'Brands 400'].forEach(fontName => {
                pkg.registerForFontNotification(instance, 'Font Awesome 5 ' + fontName);
            });
        };
    
    /** An adapter for FontAwesome.
        
        Attributes:
            icon:string - The name of the FA icon to set.
            size:number - A number from 0 to 5 with 0 being normal size and 5 being the largest size.
            propeties:string || array - A space separated string or list of FA CSS classes to set.
        
        @class */
    pkg.FontAwesome = new JS.Class('FontAwesome', pkg.Markup, {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            makeTag: makeTag,
            registerForNotification: registerForNotification
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            this.size = 0;
            this.icon = '';
            
            this.callSuper(parent, attrs);
            
            updateInstance(this);
            registerForNotification(this);
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
    
    pkg.loadCSSFonts(['https://use.fontawesome.com/releases/v5.15.4/css/all.css']);
})(myt);
