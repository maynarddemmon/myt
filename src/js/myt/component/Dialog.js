(pkg => {
    let // ColorPicker
        colorPicker,
        
        isEmpty,
        supportsAlphaChannel,
        currentColorHex,
        
        currentHue = 0,
        currentSaturation = 0,
        currentValue = 0,
        currentOpacity = 255,
        
        selectionPalette = [],
        defaultPalette,
        
        paletteContainer,
        colorView,
        colorThumb,
        hueView,
        hueThumb,
        inputView,
        currentColorButton,
        alphaChannelSlider,
        
        // DatePicker
        localeData,
        dateOnly,
        timeOnly,
        firstDayOfWeek,
        allowedDays,
        minDate,
        maxDate,
        minTime,
        maxTime,
        minuteInterval,
        
        pickedDate,
        
        prevMonthBtn,
        curMonthTxt,
        nextMonthBtn,
        calendarView,
        timeListView;
    
    const JSClass = JS.Class,
        View = pkg.View,
        Text = pkg.Text,
        ModalPanel = pkg.ModalPanel,
        SizeToChildren = pkg.SizeToChildren,
        SpacedLayout = pkg.SpacedLayout,
        SelectionManager = pkg.SelectionManager,
        Color = pkg.Color,
        LocalStorage = pkg.LocalStorage,
        Button = pkg.Button,
        TextButton = pkg.TextButton,
        Draggable = pkg.Draggable,
        
        makeTag = pkg.FontAwesome.makeTag,
        
        objectAssign = Object.assign,
        
        mathMin = Math.min,
        mathMax = Math.max,
        
        BORDER_333 = [1, 'solid', '#333'],
        BORDER_999 = [1, 'solid', '#999'],
        BORDER_FFF = [1, 'solid', '#fff'],
        
        /*  Hide spinner related elements. */
        hideSpinner = dialog => {
            if (dialog.spinner) {
                dialog.spinner.setVisible(false);
                dialog.spinner = undefined;
            }
        },
        
        /*  The class used as the default BUTTON_CLASS in myt.Dialog. */
        DialogButton = new JSClass('DialogButton', TextButton, {
            /** @overrides */
            initNode: function(parent, attrs) {
                attrs.height ??= 17;
                attrs.paddingTop ??= 3;
                attrs.paddingLeft ??= 10;
                attrs.paddingRight ??= 10;
                attrs.activeColor ??= '#bbb';
                attrs.hoverColor ??= '#ddd';
                attrs.readyColor ??= '#ccc';
                
                attrs.domClass = 'mytButtonText';
                
                this.callSuper(parent, attrs);
            }
        }),
        
        // ColorPicker
        TRANSPARENT = 'transparent',
        LOCAL_STORAGE_KEY = 'myt.default',
        DOM_CLASS_CHECKERBOARD = 'mytCheckerboardPattern',
        CHECKMARK = makeTag(['check']),
        
        initializePaletteLookup = palette => {
            palette.forEach(color => {
                if (color && color.length === 7) color += 'ff';
                paletteLookup[color] = true;
            });
        },
        paletteLookup = {},
        
        hsvToHex = (h, s, v) => Color.makeColorFromHSV(h * 360, s * 100, v * 100).getHtmlHexString(),
        
        /** @class */
        Swatch = new JSClass('Swatch', View, {
            include:[Button],
            initNode: function(parent, attrs) {
                const size = attrs.width = attrs.height = 16;
                attrs.border = BORDER_999;
                attrs.domClass = DOM_CLASS_CHECKERBOARD;
                
                const bgColor = attrs.bgColor;
                
                this.callSuper(parent, attrs);
                
                this.colorView = new View(this, {width:size, height:size, bgColor:bgColor});
                
                if (bgColor === currentColorHex) {
                    const color = Color.makeColorFromHexString(currentColorHex);
                    new pkg.Text(this, {
                        x:2, y:2, text:CHECKMARK, fontSize:'12px', 
                        textColor:color.red + color.green + color.blue < 3*255/2 ? '#fff' : '#000'
                    });
                }
            },
            setBgColor: function(v) {
                if (this.colorView) this.colorView.setBgColor(v);
                this.setTooltip(v);
            },
            doActivated: function() {
                colorPicker.setColor(this.colorView.bgColor);
            },
            drawHoverState: function() {this.setBorder(BORDER_333);},
            drawReadyState: function() {this.setBorder(BORDER_999);}
        }),
        
        /** @class */
        ColorPicker = pkg.ColorPicker = new JSClass('ColorPicker', View, {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                colorPicker = this;
                colorPicker._isReady = false;
                
                let initialColorHex = attrs.color ?? TRANSPARENT;
                delete attrs.color;
                
                supportsAlphaChannel = attrs.alphaChannel ?? false;
                delete attrs.alphaChannel;
                
                defaultPalette = attrs.palette ?? [];
                initializePaletteLookup(defaultPalette);
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
                satView.getIDS().backgroundImage = 'linear-gradient(to right, #fff, rgba(204, 154, 129, 0))';
                valView.getIDS().backgroundImage = 'linear-gradient(to top, #000, rgba(204, 154, 129, 0))';
                colorThumb = new View(valView, {width:6, height:6, bgColor:'#000', border:BORDER_FFF, roundedCorners:4});
                
                hueView = new View(colorPicker, {x:315, y:30, width:24, height:109, border:BORDER_333}, [Draggable, {
                    requestDragPosition: function(x, y) {
                        this.callSuper(hueView.x, hueView.y);
                        currentHue = parseFloat(mathMax(0, mathMin(1, (y + this.dragInitY - this.getPagePosition().y) / this.height)));
                        isEmpty = false;
                        colorPicker.updateUI();
                    }
                }]);
                hueView.getIDS().background = 'linear-gradient(to top, #f00 0%, #f0f 17%, #00f 33%, #0ff 50%, #0f0 67%, #ff0 83%, #f00 100%)';
                hueThumb = new View(hueView, {x:-1, width:24, height:2, bgColor:'#fff', border:[1, 'solid', '#000']});
                
                new View(colorPicker, {
                    x:315, width:24, height:24, border:BORDER_333, tooltip:'Set to transparent.', domClass:DOM_CLASS_CHECKERBOARD
                }, [Button, {doActivated: () => {colorPicker.setColor(TRANSPARENT);}}]);
                
                let y = 146;
                
                // Alpha Channel Row
                if (supportsAlphaChannel) {
                    alphaChannelSlider = new pkg.LabelSlider(colorPicker, {
                        x:170, y:y, width:139 + 26 + 6,
                        minValue:0, maxValue:255, flipThreshold:55, labelColor:'#fff'
                    }, [{
                        setText: function(event, noAnim) {
                            let v = event.value;
                            
                            if (v == null || isNaN(v)) v = 0;
                            
                            event.value = pkg.formatAsPercentage(v / 255, 0);
                            this.callSuper(event, true);
                            
                            currentOpacity = v;
                            if (colorPicker._isReady) {
                                isEmpty = false;
                                colorPicker.updateUI();
                            }
                        }
                    }]);
                    
                    y += 23;
                }
                
                // Selection Row
                inputView = new pkg.InputText(colorPicker, {
                    x:236, y:y, width:105, height:25, roundedCorners:3, textColor:'#333', border:BORDER_333, maxLength:11,
                    fontFamily:'monospace'
                });
                colorPicker.attachToDom(inputView, '_submitInput', 'blur');
                colorPicker.attachToDom(inputView, '_handleKeyDown', 'keydown');
                inputView.getIDS().paddingLeft = '6px';
                
                const initialColorContainer = new View(colorPicker, {
                    x:170, y:y, width:60, height:23, border:BORDER_333, domClass:DOM_CLASS_CHECKERBOARD
                });
                new View(initialColorContainer, {
                    width:30, height:23, focusIndicator:false,
                    bgColor:initialColorHex
                }, [Button, {doActivated: () => {colorPicker.setColor(initialColorHex);}}]);
                currentColorButton = new View(initialColorContainer, {x:30, width:30, height:23});
                
                // Load Palette
                const savedPalette = LocalStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedPalette) {
                    selectionPalette = savedPalette.split(';');
                    initializePaletteLookup(selectionPalette);
                }
                
                colorPicker.setColor(initialColorHex);
                
                colorPicker._isReady = true;
            },
            
            /** @private */
            _handleKeyDown: event => {
                if (pkg.KeyObservable.isEnterKeyEvent(event)) colorPicker._submitInput();
            },
            
            /** @private */
            _submitInput: () => {
                colorPicker.setColor(inputView.value);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            addToPalette: hexColor => {
                if (hexColor && hexColor !== TRANSPARENT && !paletteLookup[hexColor]) {
                    selectionPalette.unshift(hexColor);
                    selectionPalette.length = mathMin(selectionPalette.length, 56);
                    LocalStorage.setItem(LOCAL_STORAGE_KEY, selectionPalette.join(';'));
                }
            },
            
            setColor: color => {
                const colorIsNotTransparent = color && color !== TRANSPARENT;
                
                // Extract alpha channel
                if (supportsAlphaChannel) {
                    let alpha = 'ff';
                    if (colorIsNotTransparent && color.length > 7) {
                        alpha = color.slice(7,9);
                        color = color.slice(0,7);
                    }
                    alphaChannelSlider.setValue(parseInt(alpha, 16));
                } else {
                    if (colorIsNotTransparent && color.length > 7) {
                        color = color.slice(0,7);
                    }
                }
                
                if (colorIsNotTransparent) {
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
            
            getColor: () => {
                if (isEmpty) {
                    return TRANSPARENT;
                } else {
                    let opacityPart = '';
                    if (supportsAlphaChannel) {
                        opacityPart = currentOpacity.toString(16);
                        if (opacityPart.length < 2) opacityPart = '0' + opacityPart;
                    }
                    return hsvToHex(currentHue, currentSaturation, currentValue) + opacityPart;
                }
            },
            
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
                const alreadyAdded = new Set();
                defaultPalette.push(...selectionPalette);
                defaultPalette.forEach(color => {
                    if (supportsAlphaChannel || color.length === 7) {
                        if (color.length === 7) color += 'ff';
                        if (!alreadyAdded.has(color)) {
                            new Swatch(paletteContainer, {bgColor:color});
                            alreadyAdded.add(color);
                        }
                    }
                });
            }, 50)
        }),
        
        // DatePicker
        clipValue = (value, max) => mathMax(0, mathMin(max, parseInt(value))),
        
        parseTime = timeStr => {
            const parts = timeStr.split(':');
            return [clipValue(parts[0], 23), clipValue(parts[1], 60)];
        },
        
        resetSelectionManager = view => {
            view.deselectAll();
            const subs = view.getSubviews();
            let i = subs.length;
            while (i) subs[--i].destroy();
        },
        
        SelectableBtn = new JSClass('SelectableBtn', TextButton, {
            include:[pkg.Selectable],
            
            setSelected: function(v) {
                this.callSuper(v);
                this.updateUI();
            },
            
            updateUI: function() {
                this.callSuper();
                
                if (this.isSelected()) {
                    this.setBgColor('#666');
                    this.setTextColor('#fff');
                } else {
                    this.setTextColor();
                }
            }
        }),
        
        /** @class */
        TimeBtn = new JSClass('TimeBtn', SelectableBtn, {
            initNode: function(parent, attrs) {
                attrs.width = timeOnly ? 175 : 49;
                this.callSuper(parent, attrs);
            },
            
            doActivated: function() {
                this.callSuper();
                const value = this.text,
                    timeParts = parseTime(value);
                timeListView.selectById(value);
                pickedDate.setHours(timeParts[0]);
                pickedDate.setMinutes(timeParts[1]);
            }
        }),
        
        /** @class */
        DayBtn = new JSClass('DayBtn', SelectableBtn, {
            initNode: function(parent, attrs) {
                attrs.width = 23;
                attrs.border = BORDER_FFF;
                this.callSuper(parent, attrs);
            },
            
            setData: function(v) {this.data = v;},
            
            setIsAnotherMonth: function(v) {this.isAnotherMonth = v;},
            setIsToday: function(v) {this.isToday = v;},
            setIsSunday: function(v) {this.isSunday = v;},
            setIsSaturday: function(v) {this.isSaturday = v;},
            
            updateUI: function() {
                if (!this.destroyed) {
                    this.callSuper();
                    
                    if (!this.isSelected()) this.setTextColor(this.isAnotherMonth ? '#ccc' : (this.isSunday ? '#d40' : (this.isSaturday ? '#04a' : null)));
                    this.setBorderColor(this.isToday ? '#090' : '#fff');
                }
            },
            
            doActivated: function() {
                this.callSuper();
                const targetDate = new Date(this.data);
                targetDate.setHours(pickedDate.getHours());
                targetDate.setMinutes(pickedDate.getMinutes());
                drawForDate(targetDate);
            }
        }),
        
        drawForDate = date => {
            date.setSeconds(0);
            date.setMilliseconds(0);
            
            // Prevent selection of disallowed days of the week
            const hasDisallowedDays = allowedDays.length <= 6;
            let i;
            if (hasDisallowedDays) {
                i = 7;
                while (i--) {
                    if (allowedDays.includes(date.getDay())) {
                        break;
                    } else {
                        date.setDate(date.getDate() + 1);
                    }
                }
            }
            
            // Save new date to Picker data
            pickedDate = date;
            
            // Calculate dates
            const timeListScrollTop = timeListView.getODE().scrollTop,
                todayDateObj = new Date(),
                todayFullYear = todayDateObj.getFullYear(),
                todayMonth = todayDateObj.getMonth(),
                todayDate = todayDateObj.getDate(),
                todayHours = todayDateObj.getHours(),
                todayMinutes = todayDateObj.getMinutes(),
                dateFullYear = date.getFullYear(),
                dateMonth = date.getMonth(),
                dateDate = date.getDate(),
                dateTime = date.getTime(),
                dateHours = date.getHours(),
                dateMinutes = date.getMinutes(),
                firstWday = new Date(dateFullYear, dateMonth, 1).getDay() - firstDayOfWeek,
                lastDay = new Date(dateFullYear, dateMonth + 1, 0).getDate(),
                beforeMonthLastDay = new Date(dateFullYear, dateMonth, 0).getDate(),
                dateBeforeMonth = new Date(dateFullYear, dateMonth, 0),
                dateNextMonth = new Date(dateFullYear, dateMonth + 2, 0),
                isCurrentYear = todayFullYear == dateFullYear,
                isCurrentMonth = isCurrentYear && todayMonth == dateMonth,
                isCurrentDay = isCurrentMonth && todayDate == dateDate,
                isPastMonth = dateFullYear < todayFullYear || (isCurrentYear && dateMonth < todayMonth);
            
            let realDayObj;
            if (!timeOnly) {
                resetSelectionManager(calendarView);
                
                // Header
                const cDate = new Date(dateTime),
                    firstDayDiff = 7 + firstDayOfWeek,
                    daysOfWeek = localeData['days'];
                curMonthTxt.setText(dateFullYear + ' ' + localeData['sep'] + ' ' + localeData['months'][dateMonth]);
                cDate.setMinutes(59);
                cDate.setHours(23);
                cDate.setSeconds(59);
                cDate.setDate(0); // last day of previous month
                prevMonthBtn.setVisible(minDate == null || minDate < cDate.getTime());
                cDate.setMinutes(0);
                cDate.setHours(0);
                cDate.setSeconds(0);
                cDate.setDate(1); // First day of next month
                cDate.setMonth(dateMonth + 1);
                nextMonthBtn.setVisible(maxDate == null || maxDate > cDate.getTime());
                
                // Column Headers
                for (i = 0; i < 7; i++) {
                    new Text(calendarView, {
                        width:23, height:20, textAlign:'center',
                        text:daysOfWeek[(i + firstDayDiff) % 7],
                        textColor:'#999'
                    });
                }
                
                // Days
                i = 0;
                let cellNum = 42;
                if (firstWday < 0) {
                    i = -7;
                    cellNum = 35;
                }
                
                realDayObj = new Date(dateTime);
                realDayObj.setHours(0);
                realDayObj.setMinutes(0);
                realDayObj.setSeconds(0);
                for (; i < cellNum; i++) {
                    const realDay = i + 1 - firstWday,
                        wday = (i + firstDayDiff) % 7,
                        dayCell = new DayBtn(calendarView);
                    
                    if (firstWday > i) {
                        // Prev month days
                        dayCell.setText(beforeMonthLastDay + realDay);
                        dayCell.setData(dateBeforeMonth.getFullYear() + '/' + (dateBeforeMonth.getMonth() + 1) + '/' + (beforeMonthLastDay + realDay));
                        dayCell.setIsAnotherMonth(true);
                        realDayObj.setDate(beforeMonthLastDay + realDay);
                        realDayObj.setMonth(dateBeforeMonth.getMonth());
                        realDayObj.setYear(dateBeforeMonth.getFullYear());
                    } else if (i < firstWday + lastDay) {
                        // Current month days
                        dayCell.setText(realDay);
                        dayCell.setData((dateFullYear) + '/' + (dateMonth + 1) + '/' + realDay);
                        realDayObj.setDate(realDay);
                        realDayObj.setMonth(dateMonth);
                        realDayObj.setYear(dateFullYear);
                    } else {
                        // Next month days
                        dayCell.setText(realDay - lastDay);
                        dayCell.setData(dateNextMonth.getFullYear() + '/' + (dateNextMonth.getMonth() + 1) + '/' + (realDay - lastDay));
                        dayCell.setIsAnotherMonth(true);
                        realDayObj.setDate(realDay - lastDay);
                        realDayObj.setMonth(dateNextMonth.getMonth());
                        realDayObj.setYear(dateNextMonth.getFullYear());
                    }
                    
                    if (hasDisallowedDays && !allowedDays.includes(wday)) {
                        dayCell.setDisabled(true);
                    } else {
                        if (wday === 0) {
                            dayCell.setIsSunday(true);
                        } else if (wday === 6) {
                            dayCell.setIsSaturday(true);
                        }
                        
                        // Set active and today indication
                        if (realDay === dateDate) {
                            calendarView.select(dayCell);
                            dayCell.focus();
                        }
                        if (isCurrentMonth && realDay === todayDate) dayCell.setIsToday(true);
                        
                        const realDayObjMin =  new Date(realDayObj.getTime());
                        realDayObjMin.setHours(23);
                        realDayObjMin.setMinutes(59);
                        realDayObjMin.setSeconds(59);
                        if (
                            (minDate != null && (minDate > realDayObjMin.getTime())) || (maxDate != null && (maxDate < realDayObj.getTime()))
                        ) {
                            dayCell.setDisabled(true);
                        }
                    }
                    dayCell.updateUI();
                }
            }
            
            if (!dateOnly) {
                const maxTimeInMinutes = maxTime[0] * 60 + maxTime[1];
                
                resetSelectionManager(timeListView);
                
                let [hours, minutes] = minTime;
                realDayObj = new Date(dateTime);
                while (hours * 60 + minutes < maxTimeInMinutes) {
                    const is_past_time = hours < todayHours || (hours == todayHours && minutes < todayMinutes),
                        is_past = isCurrentDay && is_past_time,
                        timeCell = new TimeBtn(timeListView, {
                            text:('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2)
                        });
                    if (hours === dateHours && minutes === dateMinutes) timeListView.select(timeCell);
                    
                    realDayObj.setHours(hours);
                    realDayObj.setMinutes(minutes);
                    const realDayObjTime = realDayObj.getTime();
                    if ((minDate != null && (minDate > realDayObjTime)) || (maxDate != null && (maxDate < realDayObjTime))) timeCell.setDisabled(true);
                    
                    minutes += minuteInterval;
                    if (minutes >= 60) {
                        minutes -= 60;
                        hours++;
                    }
                }
                
                // Restore the scroll position
                timeListView.scrollYTo(timeListScrollTop);
            }
        },
        
        /** @class */
        DatePicker = pkg.DatePicker = new JSClass('DatePicker', View, {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                const opt = objectAssign({
                    current:null,
                    dateOnly:false,
                    timeOnly:false,
                    locales:null,
                    locale:'',
                    minuteInterval:30,
                    firstDayOfWeek:0,
                    showTodayButton:true,
                    minDate:null,
                    maxDate:null,
                    minTime:'00:00',
                    maxTime:'23:59',
                    allowedDays:null // An array of day nums: [1,2,3,4,5] for week days only.
                }, attrs.opt);
                delete attrs.opt;
                
                this.callSuper(parent, attrs);
                
                localeData = opt.locales[opt.locale ?? 'en'];
                dateOnly = opt.dateOnly;
                timeOnly = opt.timeOnly;
                firstDayOfWeek = opt.firstDayOfWeek;
                minuteInterval = mathMax(5, mathMin(30, opt.minuteInterval));
                
                allowedDays = opt.allowedDays;
                if (!Array.isArray(allowedDays) || allowedDays.length === 0) allowedDays = [0,1,2,3,4,5,6];
                
                minDate = Date.parse(opt.minDate);
                minDate = isNaN(minDate) ? null : minDate;
                maxDate = Date.parse(opt.maxDate);
                maxDate = isNaN(maxDate) ? null : maxDate;
                
                minTime = parseTime(opt.minTime);
                maxTime = parseTime(opt.maxTime);
                
                // Build UI
                const headerView = new View(this, {visible:!timeOnly});
                if (opt.showTodayButton) {
                    new TextButton(headerView, {width:24, text:makeTag(['home']), tooltip:localeData['today']}, [{
                        doActivated: () => {
                            drawForDate(new Date());
                        }
                    }]);
                }
                prevMonthBtn = new TextButton(headerView, {width:24, x:28, text:makeTag(['chevron-left']), tooltip:localeData['prevMonth']}, [{
                    doActivated: () => {
                        const targetMonth_lastDay = new Date(pickedDate.getFullYear(), pickedDate.getMonth(), 0).getDate();
                        if (targetMonth_lastDay < pickedDate.getDate()) pickedDate.setDate(targetMonth_lastDay);
                        
                        pickedDate.setMonth(pickedDate.getMonth() - 1);
                        drawForDate(pickedDate);
                        prevMonthBtn.focus();
                    }
                }]);
                curMonthTxt = new Text(headerView, {width:100, x:52, textAlign:'center'});
                nextMonthBtn = new TextButton(headerView, {width:24, x:152, text:makeTag(['chevron-right']), tooltip:localeData['nextMonth']}, [{
                    doActivated: () => {
                        const targetMonth_lastDay = new Date(pickedDate.getFullYear(), pickedDate.getMonth() + 1, 0).getDate();
                        if (targetMonth_lastDay < pickedDate.getDate()) pickedDate.setDate(targetMonth_lastDay);
                        
                        // Check a last date of a next month
                        const lastDate = (new Date(pickedDate.getFullYear(), pickedDate.getMonth() + 2, 0)).getDate();
                        if (lastDate < pickedDate.getDate()) pickedDate.setDate(lastDate);
                        
                        pickedDate.setMonth(pickedDate.getMonth() + 1);
                        drawForDate(pickedDate);
                        nextMonthBtn.focus();
                    }
                }]);
                
                calendarView = new View(this, {
                    y:25, width:175, height:175,
                    visible:!timeOnly,
                    maxSelected:1,
                    itemSelectionId:'data'
                }, [SelectionManager]);
                new pkg.WrappingLayout(calendarView, {spacing:2, lineInset:2, lineSpacing:3});
                
                timeListView = new View(this, {
                    x:timeOnly ? 0 : 195,
                    y:timeOnly ? 0 : 25,
                    width:(timeOnly ? 175 : 49) + pkg.DomElementProxy.getScrollbarSize(),
                    height:timeOnly ? 200 : 175,
                    overflow:'autoy',
                    visible:!dateOnly,
                    maxSelected:1,
                    itemSelectionId:'text'
                }, [SelectionManager]);
                new SpacedLayout(timeListView, {axis:'y', inset:1, spacing:3});
                
                this.setWidth(timeListView.visible ? timeListView.x + timeListView.width : calendarView.width);
                
                drawForDate(opt.current ?? new Date());
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            getPickedDate: () => pickedDate
        }),
        
        /** A modal panel that contains a Dialog.
            
            Attributes:
                callbackFunction:function (read only) A function that gets called when the dialog 
                    is about to be closed. A single argument is passed in that indicates the UI 
                    element interacted with that should close the dialog. Supported values are: 
                    'closeBtn', 'cancelBtn' and 'confirmBtn'. The function should return true if 
                    the close should be aborted.
            
            @class */
        Dialog = pkg.Dialog = new JSClass('Dialog', ModalPanel, {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** The default corner radius. */
                RADIUS: 12,
                
                /** The default button class. */
                BUTTON_CLASS: DialogButton,
                
                /** The default box shadow. */
                SHADOW: [0, 4, 20, '#666'],
                
                /** The default border */
                BORDER: BORDER_FFF,
                
                /** The default background color. */
                BGCOLOR: '#fff',
                
                /** Makes the text wrap at 200px and the dialog will be at least 200px wide. */
                WRAP_TEXT_DEFAULTS: {
                    width:200,
                    fontWeight:'bold',
                    whiteSpace:'normal',
                    wordWrap:'break-word'
                },
                
                /** Makes the text stay on a single line and the dialog sizes to fit. */
                NO_WRAP_TEXT_DEFAULTS: {
                    width:'auto',
                    fontWeight:'bold',
                    whiteSpace:'nowrap',
                    wordWrap:'break-word'
                },
                
                /** Defaults used in a confirm dialog. */
                CONFIRM_DEFAULTS: {
                    cancelTxt:'Cancel',
                    confirmTxt:'Confirm',
                    maxContainerHeight:300,
                    showClose:false
                },
                
                /** Defaults used in a color picker dialog. */
                COLOR_PICKER_DEFAULTS: {
                    cancelTxt:'Cancel',
                    confirmTxt:'Choose',
                    titleText:'Choose a Color',
                    color:'#000000',
                    alphaChannel:false
                },
                
                /** Defaults used in a date picker dialog. */
                DATE_PICKER_DEFAULTS: {
                    cancelTxt:'Cancel',
                    confirmTxt:'Choose',
                    titleText:'Choose a Date',
                    timeOnlyTitleText:'Choose a Time',
                    color:'#000',
                    locales:{
                        en: {
                            days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            sep: '-',
                            prevMonth: 'Previous month',
                            nextMonth: 'Next month',
                            today: 'Today'
                        }
                    },
                    locale:'en'
                }
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                attrs.buttonClass ??= Dialog.BUTTON_CLASS;
                
                this.callSuper(parent, attrs);
                
                const content = this.content;
                content.setRoundedCorners(Dialog.RADIUS);
                content.setBgColor(Dialog.BGCOLOR);
                content.setBoxShadow(Dialog.SHADOW);
                content.setBorder(Dialog.BORDER);
                content.setFocusCage(true);
                
                this.makeCloseButton(content);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setButtonClass: function(v) {this.buttonClass = v;},
            setCallbackFunction: function(v) {this.callbackFunction = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Make a standard button for a Dialog.
                @param {!Object} btnContainer - The myt.View to create the button on.
                @param {!Object} attrs - The attributes for the new button.
                @returns {!Object} - The created button.*/
            makeButton: function(btnContainer, attrs) {
                const self = this;
                return new self.buttonClass(btnContainer, attrs, [{
                    doActivated: function() {self.doCallback(this);}
                }]);
            },
            
            /** Creates a close button on the provided targetView.
                @param {!Object} targetView - The myt.View to create the button on.
                @returns {!Object} - The created myt.Button. */
            makeCloseButton: function(targetView) {
                return this.makeButton(targetView, {
                    name:'closeBtn',
                    ignoreLayout:true,
                    y:2,
                    align:'right',
                    alignOffset:2,
                    width:19,
                    height:16,
                    paddingLeft:0,
                    paddingRight:0,
                    roundedCorners:10,
                    activeColor:'#c00',
                    hoverColor:'#f33',
                    readyColor:'#f00',
                    textColor:'#fff',
                    text:makeTag(['times']),
                    tooltip:'Close Dialog.',
                });
            },
            
            /** @overrides myt.Dimmer */
            hide: function(ignoreRestoreFocus) {
                hideSpinner(this);
                
                this.callSuper(ignoreRestoreFocus);
            },
            
            /** Called before a dialog is shown to reset state and cleanup UI elements from the 
                previous display of the Dialog.
                @returns {undefined} */
            destroyContent: function() {
                hideSpinner(this);
                
                const content = this.content, 
                    stc = content.sizeToChildren,
                    svs = content.getSubviews();
                
                // Destroy all children except the close button since that gets reused.
                let i = svs.length;
                while (i) {
                    const sv = svs[--i];
                    if (sv.name !== 'closeBtn') sv.destroy();
                }
                
                // The blank dialog sets this.
                content.setVisible(true);
                this.overlay.setBgColor(pkg.Dimmer.COLOR);
                
                // Message and Confirm dialogs set this.
                this.setCallbackFunction();
                
                // The confirm dialog modifies this.
                stc.setPaddingY(ModalPanel.PADDING_Y);
                
                // The confirm content dialog modifies this.
                stc.setPaddingX(ModalPanel.PADDING_X);
                
                // Any opts could modify this
                content.setRoundedCorners(Dialog.RADIUS);
                content.setBgColor(Dialog.BGCOLOR);
                content.setBoxShadow(Dialog.SHADOW);
                content.setBorder(Dialog.BORDER);
            },
            
            /** Called by each of the buttons that can trigger the dialog to be hidden.
                @param {!Object} sourceView - The myt.View that triggered the hiding of the dialog.
                @returns {undefined} */
            doCallback: function(sourceView) {
                const cbf = this.callbackFunction;
                if (!cbf || !cbf.call(this, sourceView.name)) this.hide();
            },
            
            /** Shows this dialog as a regular dimmer.
                @param {?Object} opts - If opts.bgColor is provided it will be used for the bgColor 
                    of the overlay.
                @returns {undefined} */
            showBlank: function(opts) {
                this.destroyContent();
                
                this.content.setVisible(false);
                if (opts && opts.bgColor) this.overlay.setBgColor(opts.bgColor);
                
                this.show();
            },
            
            /** Shows a dialog with a message and the standard cancel button.
                @param {string} msg - The message to show.
                @param {?Function} [callbackFunction] - A function that gets called when the close 
                    button is activated. A single argument is passed in that indicates the UI 
                    element interacted with that should close the dialog. Supported values are: 
                    'closeBtn', 'cancelBtn' and 'confirmBtn'. The function should return true if 
                    the close should be aborted.
                @param {?Object} [opts] - Options that modify how the message is displayed. 
                    Supports: fontWeight, whiteSpace, wordWrap and width.
                @returns {undefined} */
            showMessage: function(msg, callbackFunction, opts) {
                const self = this,
                    content = self.content, 
                    closeBtn = content.closeBtn;
                
                opts = objectAssign({}, Dialog.WRAP_TEXT_DEFAULTS, opts);
                
                self.destroyContent();
                
                self.setCallbackFunction(callbackFunction);
                
                const msgView = new Text(content, {
                    name:'msg',
                    text:msg,
                    whiteSpace:opts.whiteSpace,
                    wordWrap:opts.wordWrap,
                    fontWeight:opts.fontWeight,
                    x:opts.msgX == null ? ModalPanel.PADDING_X : opts.msgX,
                    y:opts.msgY == null ? ModalPanel.PADDING_Y : opts.msgY,
                    width:opts.width
                });
                
                if (opts.titleText) {
                    self.setupTitle(content, opts.titleText);
                    msgView.setY(msgView.y + 24);
                }
                
                self.show();
                
                if (opts.showClose === false) {
                    closeBtn.setVisible(false);
                } else {
                    closeBtn.setVisible(true);
                    closeBtn.focus();
                }
            },
            
            showSimple: function(contentBuilderFunc, callbackFunction, opts, afterSetupFunc) {
                opts = opts ?? {};
                
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn,
                    maxHeight = opts.maxContainerHeight;
                
                self.destroyContent();
                
                if (opts.bgColor) content.setBgColor(opts.bgColor);
                if (opts.roundedCorners) content.setRoundedCorners(opts.roundedCorners);
                if (opts.boxShadow) content.setBoxShadow(opts.boxShadow);
                if (opts.border) content.setBorder(opts.border);
                
                content.sizeToChildren.setPaddingX(1);
                self.setCallbackFunction(callbackFunction);
                
                const contentContainer = new View(content, {
                    name:'contentContainer', x:1, y:25, overflow:'auto'
                }, [{
                    setHeight: function(v) {
                        if (v > maxHeight) v = maxHeight;
                        this.callSuper(v);
                    }
                }]);
                
                contentBuilderFunc.call(self, contentContainer);
                
                new SizeToChildren(contentContainer, {axis:'both'});
                
                self.show();
                
                closeBtn.setVisible(true);
                closeBtn.focus();
                
                if (opts.titleText) {
                    self.setupTitle(content, opts.titleText);
                    contentContainer.setY(self.header.height + 1);
                }
                
                // Set initial focus
                if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
                
                if (afterSetupFunc) afterSetupFunc(self);
            },
            
            showConfirm: function(msg, callbackFunction, opts) {
                const self = this;
                
                opts = objectAssign({}, Dialog.CONFIRM_DEFAULTS, opts);
                
                self.showMessage(msg, callbackFunction, opts);
                self.setupFooterButtons(self.content.msg, opts);
            },
            
            showContentConfirm: function(contentBuilderFunc, callbackFunction, opts, afterSetupFunc) {
                opts = objectAssign({}, Dialog.CONFIRM_DEFAULTS, opts);
                
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn,
                    maxHeight = opts.maxContainerHeight;
                
                self.destroyContent();
                
                content.sizeToChildren.setPaddingX(1);
                self.setCallbackFunction(callbackFunction);
                
                // Setup form
                const contentContainer = new View(content, {
                    name:'contentContainer', x:1, y:25, overflow:'auto'
                }, [{
                    setHeight: function(v) {
                        this.callSuper(v > maxHeight ? maxHeight : v);
                    }
                }]);
                
                contentBuilderFunc.call(self, contentContainer);
                
                new SizeToChildren(contentContainer, {axis:'both'});
                
                self.show();
                
                closeBtn.setVisible(true);
                closeBtn.focus();
                
                self.setupTitle(content, opts.titleText);
                contentContainer.setY(self.header.height + 1);
                self.setupFooterButtons(contentContainer, opts);
                
                // Set initial focus
                if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
                
                if (afterSetupFunc) afterSetupFunc(self);
            },
            
            /** Shows a dialog with a spinner and a message and no standard cancel button.
                @param {string} msg - the message to show.
                @param {?Objecft} opts - Options that modify how the message is displayed. 
                    Supports: fontWeight, whiteSpace, wordWrap and width.
                @returns {undefined} */
            showSpinner: function(msg, opts) {
                const self = this,
                    content = self.content;
                
                opts = objectAssign({}, Dialog.NO_WRAP_TEXT_DEFAULTS, opts);
                
                self.destroyContent();
                
                const spinner = self.spinner = new pkg.Spinner(content, {
                    align:'center', visible:true,
                    borderColor:'#ccc',
                    size:50, y:opts.msgY == null ? ModalPanel.PADDING_Y : opts.msgY,
                });
                if (msg) {
                    new Text(content, {
                        text:msg,
                        whiteSpace:opts.whiteSpace,
                        wordWrap:opts.wordWrap,
                        fontWeight:opts.fontWeight,
                        x:opts.msgX == null ? ModalPanel.PADDING_X : opts.msgX,
                        y:spinner.y + spinner.size + ModalPanel.PADDING_Y,
                        width:opts.width
                    });
                }
                
                self.show();
                
                content.closeBtn.setVisible(false);
                
                // Focus on the dimmer itself to prevent user interaction.
                self.focus();
            },
            
            showColorPicker: function(callbackFunction, opts) {
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn;
                opts = objectAssign({}, Dialog.COLOR_PICKER_DEFAULTS, opts);
                self.destroyContent();
                
                // Set the callback function to one wrapped to handle each button type.
                self.setCallbackFunction(action => {
                    switch (action) {
                        case 'closeBtn':
                        case 'cancelBtn':
                            callbackFunction.call(self, action);
                            break;
                        case 'confirmBtn':
                            const colorAsHex = colorPickerView.getColor();
                            colorPickerView.addToPalette(colorAsHex);
                            callbackFunction.call(self, action, colorAsHex);
                            break;
                    }
                    colorPickerView.destroy();
                });
                
                // Build Picker
                const colorPickerView = new ColorPicker(content, {
                    x:ModalPanel.PADDING_X,
                    y:ModalPanel.PADDING_Y + 24,
                    width:337,
                    height:177 + (opts.alphaChannel ? 23 : 0),
                    color:opts.color,
                    alphaChannel:opts.alphaChannel,
                    palette:['#000000','#111111','#222222','#333333','#444444','#555555','#666666','#777777','#888888','#999999','#aaaaaa','#bbbbbb','#cccccc','#dddddd','#eeeeee','#ffffff']
                });
                self.show();
                closeBtn.setVisible(true);
                closeBtn.focus();
                self.setupFooterButtons(colorPickerView, opts);
                self.setupTitle(content, opts.titleText);
            },
            
            showDatePicker: function(callbackFunction, opts) {
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn;
                opts = objectAssign({}, Dialog.DATE_PICKER_DEFAULTS, opts);
                self.destroyContent();
                
                // Set the callback function to one wrapped to handle each button type.
                self.setCallbackFunction(action => {
                    switch (action) {
                        case 'closeBtn':
                        case 'cancelBtn':
                            callbackFunction.call(self, action);
                            break;
                        case 'confirmBtn':
                            callbackFunction.call(self, action, datePickerView.getPickedDate());
                            break;
                    }
                    datePickerView.destroy();
                });
                
                // Build Picker
                const datePickerView = new DatePicker(content, {
                    x:ModalPanel.PADDING_X,
                    y:ModalPanel.PADDING_Y + 24,
                    height:195,
                    opt: {
                        current:new Date(opts.initialDate ?? Date.now()),
                        dateOnly:opts.dateOnly || false,
                        timeOnly:opts.timeOnly || false,
                        locales:opts.locales,
                        locale:opts.locale
                    }
                });
                self.show();
                closeBtn.setVisible(true);
                closeBtn.focus();
                self.setupFooterButtons(datePickerView, opts);
                self.setupTitle(content, opts.timeOnly ? opts.timeOnlyTitleText : opts.titleText);
            },
            
            setupTitle: function(content, titleTxt) {
                const radius = Dialog.RADIUS;
                (this.header = new View(content, {
                    ignoreLayout:true,
                    width:content.width,
                    height:24,
                    bgColor:'#eee',
                    roundedTopLeftCorner:radius,
                    roundedTopRightCorner:radius
                })).sendToBack();
                new Text(content, {name:'title', x:radius, y:4, text:titleTxt, fontWeight:'bold'});
            },
            
            /** @private 
                @param {!Object} mainView
                @param {!Object} opts
                @returns {undefined} */
            setupFooterButtons: function(mainView, opts) {
                const self = this,
                    content = self.content, 
                    DPY = ModalPanel.PADDING_Y,
                    HALF_DPY = DPY / 2,
                    btnContainer = new View(content, {name:'btnContainer', y:mainView.y + mainView.height + DPY, align:'center'}),
                    btnConfigKeys = ['active','hover','ready','text'];
                
                // Cancel Button
                let attrs = opts.cancelAttrs ?? {};
                attrs.name ??= 'cancelBtn';
                attrs.text ??= opts.cancelTxt;
                btnConfigKeys.forEach(key => {
                    key += 'Color';
                    if (opts[key] != null) attrs[key] = opts[key];
                });
                const cancelBtn = self.makeButton(btnContainer, attrs);
                
                // Confirm Button
                attrs = opts.confirmAttrs ?? {};
                attrs.name ??= 'confirmBtn';
                attrs.text ??= opts.confirmTxt;
                btnConfigKeys.forEach(key => {
                    key += 'Color';
                    const optsKey = key + 'Confirm';
                    if (opts[optsKey] != null) attrs[key] = opts[optsKey];
                });
                self.makeButton(btnContainer, attrs);
                
                // Additional Buttons
                (opts.buttons ?? []).forEach(buttonAttrs => {self.makeButton(btnContainer, buttonAttrs);});
                
                new SizeToChildren(btnContainer, {axis:'y'});
                new SpacedLayout(btnContainer, {spacing:4, collapseParent:true});
                
                content.sizeToChildren.setPaddingY(HALF_DPY);
                
                const radius = Dialog.RADIUS,
                    bgY = btnContainer.y - HALF_DPY;
                (new View(content, {
                    ignoreLayout:true,
                    y:bgY,
                    width:content.width,
                    height:content.height - bgY,
                    bgColor:'#eee',
                    roundedBottomLeftCorner:radius,
                    roundedBottomRightCorner:radius
                })).sendToBack();
                
                if (opts.showClose === false) cancelBtn.focus();
            }
        });
})(myt);
