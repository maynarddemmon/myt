((pkg) => {
    let colorPicker,
        
        isEmpty,
        initialColorHex,
        currentColorHex,
        
        currentHue = 0,
        currentSaturation = 0,
        currentValue = 0,
        
        selectionPalette = [],
        defaultPalette,
        
        paletteContainer,
        colorView,
        colorThumb,
        hueView,
        hueThumb,
        inputView,
        currentColorButton;
    
    const JSClass = JS.Class,
        Color = pkg.Color,
        LocalStorage = pkg.LocalStorage,
        View = pkg.View,
        Button = pkg.Button,
        Draggable = pkg.Draggable,
        
        mathMin = Math.min,
        mathMax = Math.max,
        
        TRANSPARENT = 'transparent',
        LOCAL_STORAGE_KEY = 'myt.default',
        DOM_CLASS_CHECKERBOARD = 'mytCheckerboardPattern',
        CHECKMARK = pkg.FontAwesome.makeTag(['check']),
        BORDER_333 = [1, 'solid', '#333'],
        BORDER_999 = [1, 'solid', '#999'],
        
        paletteLookup = {},
        
        hsvToHex = (h, s, v) => Color.makeColorFromHSV(h * 360, s * 100, v * 100).getHtmlHexString(),
        
        Swatch = new JSClass('Swatch', View, {
            include:[Button],
            initNode: function(parent, attrs) {
                attrs.width = attrs.height = 16;
                attrs.border = BORDER_999;
                this.callSuper(parent, attrs);
                
                if (this.bgColor === currentColorHex) {
                    const color = Color.makeColorFromHexString(currentColorHex);
                    new pkg.Text(this, {
                        x:2, y:2, text:CHECKMARK, fontSize:'12px', 
                        textColor:color.red + color.green + color.blue < 3*255/2 ? '#fff' : '#000'
                    });
                }
            },
            setBgColor: function(v) {
                this.callSuper(v);
                this.setTooltip(v);
            },
            doActivated: function() {colorPicker.setColor(this.bgColor);},
            drawHoverState: function() {this.setBorder(BORDER_333);},
            drawReadyState: function() {this.setBorder(BORDER_999);}
        });
    
    pkg.ColorPicker = new JSClass('ColorPicker', View, {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            colorPicker = this;
            
            initialColorHex = attrs.color || TRANSPARENT;
            delete attrs.color;
            
            defaultPalette = attrs.palette || [];
            defaultPalette.forEach(color => {paletteLookup[color] = true;});
            delete attrs.palette;
            
            isEmpty = initialColorHex === TRANSPARENT;
            
            colorPicker.callSuper(parent, attrs);
            
            // Build UI
            paletteContainer = new View(colorPicker, {width:160, height:170});
            new pkg.WrappingLayout(paletteContainer, {spacing:4, lineSpacing:4});
            
            colorView = new View(colorPicker, {x:170, width:139, height:139, border:BORDER_333}, [Draggable, {
                requestDragPosition: function(x, y) {
                    colorView.callSuper(colorView.x, colorView.y);
                    const pos = this.getPagePosition();
                    currentSaturation = parseFloat(mathMax(0, mathMin(1, (x + this.dragInitX - pos.x) / this.width)));
                    currentValue = parseFloat(1 - mathMax(0, mathMin(1, (y + this.dragInitY - pos.y) / this.height)));
                    isEmpty = false;
                    colorPicker.updateUI();
                }
            }]);
            const satView = new View(colorView, {width:139, height:139}),
                valView = new View(satView, {width:139, height:139});
            satView.getInnerDomStyle().backgroundImage = 'linear-gradient(to right, #fff, rgba(204, 154, 129, 0))';
            valView.getInnerDomStyle().backgroundImage = 'linear-gradient(to top, #000, rgba(204, 154, 129, 0))';
            colorThumb = new View(valView, {width:6, height:6, bgColor:'#000', border:[1, 'solid', '#ffffff'], roundedCorners:4});
            
            hueView = new View(colorPicker, {x:315, y:30, width:24, height:109, border:BORDER_333}, [Draggable, {
                requestDragPosition: function(x, y) {
                    this.callSuper(hueView.x, hueView.y);
                    currentHue = parseFloat(mathMax(0, mathMin(1, (y + this.dragInitY - this.getPagePosition().y) / this.height)));
                    isEmpty = false;
                    colorPicker.updateUI();
                }
            }]);
            hueView.getInnerDomStyle().background = 'linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)';
            hueThumb = new View(hueView, {x:-1, width:24, height:2, bgColor:'#fff', border:[1, 'solid', '#000']});
            
            new View(colorPicker, {
                x:315, width:24, height:24, border:BORDER_333, tooltip:'Set to transparent.', domClass:DOM_CLASS_CHECKERBOARD
            }, [Button, {doActivated: () => {colorPicker.setColor(TRANSPARENT);}}]);
            
            inputView = new pkg.InputText(colorPicker, {x:236, y:146, width:105, height:25, roundedCorners:3, textColor:'#333', border:BORDER_333, maxLength:11});
            colorPicker.attachToDom(inputView, '_submitInput', 'blur');
            colorPicker.attachToDom(inputView, '_handleKeyDown', 'keydown');
            inputView.getInnerDomStyle().paddingLeft = '6px';
            
            const initialColorContainer = new View(colorPicker, {x:170, y:146, width:60, height:23, border:BORDER_333});
            new View(initialColorContainer, {
                width:30, height:23, focusEmbellishment:false,
                bgColor:initialColorHex, domClass:isEmpty ? DOM_CLASS_CHECKERBOARD : ''
            }, [Button, {doActivated: () => {colorPicker.setColor(initialColorHex);}}]);
            currentColorButton = new View(initialColorContainer, {x:30, width:30, height:23}, [{
                setBgColor: function(v) {
                    this.callSuper(v);
                    this[(v === TRANSPARENT ? 'add' : 'remove') + 'DomClass'](DOM_CLASS_CHECKERBOARD);
                }
            }]);
            
            // Load Palette
            const savedPalette = LocalStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedPalette) {
                selectionPalette = savedPalette.split(';');
                selectionPalette.forEach(color => {paletteLookup[color] = true;});
            }
            
            colorPicker.setColor(initialColorHex);
        },
        
        /** @private */
        _handleKeyDown: event => {
            if (pkg.KeyObservable.getKeyCodeFromEvent(event) === 13) colorPicker._submitInput();
        },
        
        /** @private */
        _submitInput: () => {
            colorPicker.setColor(inputView.value);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        addToPalette: hexColor => {
            if (hexColor && hexColor !== TRANSPARENT && !paletteLookup[hexColor]) {
                selectionPalette.unshift(hexColor);
                selectionPalette.length = mathMin(selectionPalette.length, 56);
                LocalStorage.setItem(LOCAL_STORAGE_KEY, selectionPalette.join(';'));
            }
        },
        
        setColor: color => {
            if (color && color !== TRANSPARENT) {
                const newHsv = (Color.makeColorFromHexString(color)).getHSV();
                currentHue = newHsv.h / 360;
                currentSaturation = newHsv.s;
                currentValue = newHsv.v;
                isEmpty = false;
            } else {
                isEmpty = true;
            }
            colorPicker.updateUI();
        },
        
        getColor: () => isEmpty ? TRANSPARENT : hsvToHex(currentHue, currentSaturation, currentValue),
        
        updateUI: () => {
            const isNotEmpty = !isEmpty;
            hueThumb.setVisible(isNotEmpty);
            colorThumb.setVisible(isNotEmpty);
            if (isNotEmpty) {
                colorThumb.setX(mathMax(0, mathMin(1, currentSaturation) * (colorView.width + 2)) - 5);
                colorThumb.setY(mathMax(0, mathMin(1, 1 - currentValue) * (colorView.height + 2)) - 5);
                hueThumb.setY((currentHue * (hueView.height - 2)) - 1);
            }
            
            colorView.setBgColor(hsvToHex(currentHue, 1, 1));
            
            // Update input
            currentColorHex = colorPicker.getColor();
            inputView.setValue(currentColorHex);
            currentColorButton.setBgColor(currentColorHex);
            
            colorPicker.redrawPalette();
        },
        
        redrawPalette: pkg.debounce(() => {
            const subs = paletteContainer.getSubviews();
            let i = subs.length;
            while (i) subs[--i].destroy();
            defaultPalette.forEach(color => {new Swatch(paletteContainer, {bgColor:color});});
            selectionPalette.forEach(color => {new Swatch(paletteContainer, {bgColor:color});});
        }, 50)
    });
})(myt);
