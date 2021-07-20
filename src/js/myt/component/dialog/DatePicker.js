((pkg) => {
    let localeData,
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
        TextButton = pkg.TextButton,
        SelectionManager = pkg.SelectionManager,
        
        makeTag = pkg.FontAwesome.makeTag,
        
        math = Math,
        mathMin = math.min,
        mathMax = math.max,
        
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
        
        DayBtn = new JSClass('DayBtn', SelectableBtn, {
            initNode: function(parent, attrs) {
                attrs.width = 23;
                attrs.border = [1, 'solid', '#fff'];
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
            const timeListScrollTop = timeListView.getOuterDomElement().scrollTop,
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
                
                let hours = minTime[0],
                    minutes = minTime[1];
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
        };
    
    pkg.DatePicker = new JSClass('DatePicker', View, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            const opt = Object.assign({
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
            
            localeData = opt.locales[opt.locale || 'en'];
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
            new pkg.SpacedLayout(timeListView, {axis:'y', inset:1, spacing:3});
            
            this.setWidth(timeListView.visible ? timeListView.x + timeListView.width : calendarView.width);
            
            drawForDate(opt.current || new Date());
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        getPickedDate: () => pickedDate
    });
})(myt);
