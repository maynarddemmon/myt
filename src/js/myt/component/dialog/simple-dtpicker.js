/**
 * jquery-simple-datetimepicker (jquery.simple-dtpicker.js)
 * v1.12.0
 * (c) Masanori Ohgita - 2014.
 * https://github.com/mugifly/jquery-simple-datetimepicker
 */
(function (window, $, undefined) {
	"use strict";
	var lang = {
		en: {
			days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			months: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
			sep: '-',
			prevMonth: 'Previous month',
			nextMonth: 'Next month',
			today: 'Today'
		},
		ro:{
			days: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
			months: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			sep: '.',
			prevMonth: 'Luna precedentă',
			nextMonth: 'Luna următoare',
			today: 'Azi'
		},
		ja: {
			days: ['日', '月', '火', '水', '木', '金', '土'],
			months: [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" ],
			sep: '/'
		},
		ru: {
			days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
			months: [ "Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек" ]
		},
		br: {
			days: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
			months: [ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ]
		},
		pt: {
			days: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
			months: [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ]
		},
		cn: {
			days: ['日', '一', '二', '三', '四', '五', '六'],
			months: [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ]
		},
		de: {
			days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
			months: [ "Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sept", "Okt", "Nov", "Dez" ]
		},
		sv: {
			days: ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
			months: [ "Jan", "Feb", "Mar", "Apr", "Maj", "Juni", "Juli", "Aug", "Sept", "Okt", "Nov", "Dec" ]
		},
		id: {
			days: ['Min','Sen','Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
			months: [ "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des" ]
		},
		it: {
			days: ['Dom','Lun','Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
			months: [ "Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic" ]
		},
		tr: {
			days: ['Pz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cu', 'Cts'],
			months: [ "Ock", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Ekm", "Kas", "Arlk" ]
		},
		es: {
			days: ['dom', 'lun', 'mar', 'miér', 'jue', 'vié', 'sáb'],
			months: [ "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic" ]
		},
		ko: {
			days: ['일', '월', '화', '수', '목', '금', '토'],
			months: [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ]
		},
		nl: {
			days: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
			months: [ "jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec" ],
		},
		cz: {
			days: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
			months: [ "Led", "Úno", "Bře", "Dub", "Kvě", "Čer", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro" ]
		},
		fr: {
			days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
			months: [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ]
		},
		pl: {
			days: ['N', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
			months: [ "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień" ],
			prevMonth: 'Poprzedni miesiąc',
			nextMonth: 'Następny miesiąc',
			today: 'Dzisiaj'
		},
		gr: {
			days: ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα'],
			months: [ "Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαϊ", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ" ],
			prevMonth: 'Προηγ. μήνας',
			nextMonth: 'Επόμ. μήνας',
			today: 'Σήμερα'
		}
	};

	var getParentPickerObject = function(obj) {
		return $(obj).closest('.datepicker');
	};

	var beforeMonth = function($obj) {
		var $picker = getParentPickerObject($obj);

		if ($picker.data('stateAllowBeforeMonth') === false) return;

		var date = getPickedDate($picker);
		var targetMonth_lastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
		if (targetMonth_lastDay < date.getDate()) date.setDate(targetMonth_lastDay);
		draw($picker, date.getFullYear(), date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes());

		var todayDate = new Date();
		var isCurrentYear = todayDate.getFullYear() == date.getFullYear();
		var isCurrentMonth = isCurrentYear && todayDate.getMonth() == date.getMonth();
		
		if (!isCurrentMonth || !$picker.data("futureOnly")) {
			if (targetMonth_lastDay < date.getDate()) date.setDate(targetMonth_lastDay);
			draw($picker, date.getFullYear(), date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes());
		}
	};

	var nextMonth = function($obj) {
		var $picker = getParentPickerObject($obj);
		var date = getPickedDate($picker);
		var targetMonth_lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		if (targetMonth_lastDay < date.getDate()) date.setDate(targetMonth_lastDay);

		// Check a last date of a next month
		var lastDate = (new Date(date.getFullYear(), date.getMonth() + 2, 0)).getDate();
		if (lastDate < date.getDate()) date.setDate(lastDate);

		draw($picker, date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
	};
	
	var beforeDay = function($obj) {
		var $picker = getParentPickerObject($obj);
		var date = getPickedDate($picker);
		date.setDate(date.getDate() - 1);
		draw($picker, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};
	
	var afterDay = function($obj) {
		var $picker = getParentPickerObject($obj);
		var date = getPickedDate($picker);
		date.setDate(date.getDate() + 1);
		draw($picker, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};

	var getPickedDate = function($obj) {
		return getParentPickerObject($obj).data("pickedDate");
	};

	var zpadding = function(num) {
		return ("0" + num).slice(-2);
	};

	var translate = function(locale, s) {
		if (typeof lang[locale][s] !== "undefined") return lang[locale][s];
		return lang.en[s];
	};

	var draw = function($picker, year, month, day, hour, min) {
		var date;
		if (hour != null) {
			date = new Date(year, month, day, hour, min, 0);
		} else if (year != null) {
			date = new Date(year, month, day);
		} else {
			date = new Date();
		}

		var isTodayButton = $picker.data("todayButton");
		var isFutureOnly = $picker.data("futureOnly");
		var minDate = $picker.data("minDate");
		var maxDate = $picker.data("maxDate");

		var minuteInterval = $picker.data("minuteInterval");
		var firstDayOfWeek = $picker.data("firstDayOfWeek");

		var allowWdays = $picker.data("allowWdays");
		if (allowWdays == null || Array.isArray(allowWdays) === false || allowWdays.length <= 0) allowWdays = null;
		
		var minTime = $picker.data("minTime");
		var maxTime = $picker.data("maxTime");

		/* Check a specified date */
		var todayDate = new Date();
		if (isFutureOnly) {
			if (date.getTime() < todayDate.getTime()) { // Already passed
				date.setTime(todayDate.getTime());
			}
		}
		if(allowWdays != null && allowWdays.length <= 6) {
			while (true) {
				if ($.inArray(date.getDay(), allowWdays) == -1) { // Unallowed wday
					// Slide a date
					date.setDate(date.getDate() + 1);
				} else {
					break;
				}
			}
		}

		/* Read locale option */
		var locale = $picker.data("locale");
		if (!lang.hasOwnProperty(locale)) locale = 'en';

		/* Calculate dates */
		var firstWday = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - firstDayOfWeek;
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		var beforeMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
		var dateBeforeMonth = new Date(date.getFullYear(), date.getMonth(), 0);
		var dateNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
		var isCurrentYear = todayDate.getFullYear() == date.getFullYear();
		var isCurrentMonth = isCurrentYear && todayDate.getMonth() == date.getMonth();
		var isCurrentDay = isCurrentMonth && todayDate.getDate() == date.getDate();
		var isPastMonth = false;
		if (date.getFullYear() < todayDate.getFullYear() || (isCurrentYear && date.getMonth() < todayDate.getMonth())) {
			isPastMonth = true;
		}

		/* Collect each part */
		var $header = $picker.children('.datepicker_header');
		var $inner = $picker.children('.datepicker_inner_container');
		var $calendar = $picker.children('.datepicker_inner_container').children('.datepicker_calendar');
		var $table = $calendar.children('.datepicker_table');
		var $timelist = $picker.children('.datepicker_inner_container').children('.datepicker_timelist');

		/* Grasp a point that will be changed */
		var changePoint = "";
		var oldDate = getPickedDate($picker);
		if(oldDate != null){
			if(oldDate.getMonth() != date.getMonth() || oldDate.getDate() != date.getDate()){
				changePoint = "calendar";
			} else if (oldDate.getHours() != date.getHours() || oldDate.getMinutes() != date.getMinutes()){
				if(date.getMinutes() === 0 || date.getMinutes() % minuteInterval === 0){
					changePoint = "timelist";
				}
			}
		}

		/* Save new date to Picker data */
		$($picker).data("pickedDate", date);
		$.fn.dtpicker.dialog._dtpickerCallback(date);

		/* Remind timelist scroll state */
		var drawBefore_timeList_scrollTop = $timelist.scrollTop();

		/* New timelist  */
		var timelist_activeTimeCell_offsetTop = -1;

		/* Header ----- */
		$header.children().remove();

		var cDate = new Date(date.getTime());
		cDate.setMinutes(59);
		cDate.setHours(23);
		cDate.setSeconds(59);
		cDate.setDate(0); // last day of previous month

		var $link_before_month = null;
		if ((!isFutureOnly || !isCurrentMonth) && ((minDate == null) || (minDate < cDate.getTime()))) {
			$link_before_month = $('<a>');
			$link_before_month.text('<');
			$link_before_month.prop('alt', translate(locale,'prevMonth'));
			$link_before_month.prop('title', translate(locale,'prevMonth') );
			$link_before_month.click(function() {
				beforeMonth($picker);
			});
			$picker.data('stateAllowBeforeMonth', true);
		} else {
			$picker.data('stateAllowBeforeMonth', false);
		}

		cDate.setMinutes(0);
		cDate.setHours(0);
		cDate.setSeconds(0);
		cDate.setDate(1); // First day of next month
		cDate.setMonth(date.getMonth() + 1);

		var $now_month = $('<span>');
		$now_month.text(date.getFullYear() + " " + translate(locale, 'sep') + " " + translate(locale, 'months')[date.getMonth()]);

		var $link_next_month = null;
		if ((maxDate == null) || (maxDate > cDate.getTime())) {
			$link_next_month = $('<a>');
			$link_next_month.text('>');
			$link_next_month.prop('alt', translate(locale,'nextMonth'));
			$link_next_month.prop('title', translate(locale,'nextMonth'));
			$link_next_month.click(function() {
				nextMonth($picker);
			});
		}

		if (isTodayButton) {
			var $link_today = $('<a/>');
			/* This icon resource from a part of "FontAwesome" by Dave Gandy - http://fontawesome.io".
				http://fortawesome.github.io/Font-Awesome/license/
				Thankyou. */
			$link_today.html(decodeURIComponent('%3c%3fxml%20version%3d%221%2e0%22%20encoding%3d%22UTF%2d8%22%20standalone%3d%22no%22%3f%3e%3csvg%20%20xmlns%3adc%3d%22http%3a%2f%2fpurl%2eorg%2fdc%2felements%2f1%2e1%2f%22%20%20xmlns%3acc%3d%22http%3a%2f%2fcreativecommons%2eorg%2fns%23%22%20xmlns%3ardf%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f1999%2f02%2f22%2drdf%2dsyntax%2dns%23%22%20%20xmlns%3asvg%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f2000%2fsvg%22%20xmlns%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f2000%2fsvg%22%20%20version%3d%221%2e1%22%20%20width%3d%22100%25%22%20%20height%3d%22100%25%22%20viewBox%3d%220%200%2010%2010%22%3e%3cg%20transform%3d%22translate%28%2d5%2e5772299%2c%2d26%2e54581%29%22%3e%3cpath%20d%3d%22m%2014%2e149807%2c31%2e130932%20c%200%2c%2d0%2e01241%200%2c%2d0%2e02481%20%2d0%2e0062%2c%2d0%2e03721%20L%2010%2e57723%2c28%2e153784%207%2e0108528%2c31%2e093719%20c%200%2c0%2e01241%20%2d0%2e0062%2c0%2e02481%20%2d0%2e0062%2c0%2e03721%20l%200%2c2%2e97715%20c%200%2c0%2e217084%200%2e1798696%2c0%2e396953%200%2e3969534%2c0%2e396953%20l%202%2e3817196%2c0%200%2c%2d2%2e38172%201%2e5878132%2c0%200%2c2%2e38172%202%2e381719%2c0%20c%200%2e217084%2c0%200%2e396953%2c%2d0%2e179869%200%2e396953%2c%2d0%2e396953%20l%200%2c%2d2%2e97715%20m%201%2e383134%2c%2d0%2e427964%20c%200%2e06823%2c%2d0%2e08063%200%2e05582%2c%2d0%2e210882%20%2d0%2e02481%2c%2d0%2e279108%20l%20%2d1%2e358324%2c%2d1%2e128837%200%2c%2d2%2e530576%20c%200%2c%2d0%2e111643%20%2d0%2e08683%2c%2d0%2e198477%20%2d0%2e198477%2c%2d0%2e198477%20l%20%2d1%2e190859%2c0%20c%20%2d0%2e111643%2c0%20%2d0%2e198477%2c0%2e08683%20%2d0%2e198477%2c0%2e198477%20l%200%2c1%2e209467%20%2d1%2e513384%2c%2d1%2e265289%20c%20%2d0%2e2605%2c%2d0%2e217083%20%2d0%2e682264%2c%2d0%2e217083%20%2d0%2e942764%2c0%20L%205%2e6463253%2c30%2e42386%20c%20%2d0%2e080631%2c0%2e06823%20%2d0%2e093036%2c0%2e198476%20%2d0%2e024809%2c0%2e279108%20l%200%2e3845485%2c0%2e458976%20c%200%2e031012%2c0%2e03721%200%2e080631%2c0%2e06203%200%2e1302503%2c0%2e06823%200%2e055821%2c0%2e0062%200%2e1054407%2c%2d0%2e01241%200%2e1488574%2c%2d0%2e04342%20l%204%2e2920565%2c%2d3%2e578782%204%2e292058%2c3%2e578782%20c%200%2e03721%2c0%2e03101%200%2e08063%2c0%2e04342%200%2e13025%2c0%2e04342%200%2e0062%2c0%200%2e01241%2c0%200%2e01861%2c0%200%2e04962%2c%2d0%2e0062%200%2e09924%2c%2d0%2e03101%200%2e130251%2c%2d0%2e06823%20l%200%2e384549%2c%2d0%2e458976%22%20%2f%3e%3c%2fg%3e%3c%2fsvg%3e') );
			$link_today.addClass('icon-home');
			$link_today.prop('alt', translate(locale,'today'));
			$link_today.prop('title', translate(locale,'today'));
			$link_today.click(function() {
				var date = new Date();
				draw(getParentPickerObject($picker), date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
			});
			$header.append($link_today);
		}

		if ($link_before_month != null) $header.append($link_before_month);
		$header.append($now_month);
		if ($link_next_month != null) $header.append($link_next_month);

		/* Calendar > Table ----- */
		$table.children().remove();
		var $tr = $('<tr>');
		$table.append($tr);

		/* Output wday cells */
		var firstDayDiff = 7 + firstDayOfWeek;
		var daysOfWeek = translate(locale,'days');
		var $td;
		for (var i = 0; i < 7; i++) {
			$td = $('<th>');
			$td.text(daysOfWeek[((i + firstDayDiff) % 7)]);
			$tr.append($td);
		}

		/* Output day cells */
		var cellNum = Math.ceil((firstWday + lastDay) / 7) * 7;
		i = 0;
		if (firstWday < 0) i = -7;
		
		var realDayObj =  new Date(date.getTime());
		realDayObj.setHours(0);
		realDayObj.setMinutes(0);
		realDayObj.setSeconds(0);
		for (var zz = 0; i < cellNum; i++) {
			var realDay = i + 1 - firstWday;

			var isPast = isPastMonth || (isCurrentMonth && realDay < todayDate.getDate());

			if (i % 7 === 0) {
				$tr = $('<tr>');
				$table.append($tr);
			}

			$td = $('<td>');
			$td.data("day", realDay);

			$tr.append($td);

			if (firstWday > i) {/* Before months day */
				$td.text(beforeMonthLastDay + realDay);
				$td.addClass('day_another_month');
				$td.data("dateStr", dateBeforeMonth.getFullYear() + "/" + (dateBeforeMonth.getMonth() + 1) + "/" + (beforeMonthLastDay + realDay));
				realDayObj.setDate(beforeMonthLastDay + realDay);
				realDayObj.setMonth(dateBeforeMonth.getMonth());
				realDayObj.setYear(dateBeforeMonth.getFullYear());
			} else if (i < firstWday + lastDay) {/* Now months day */
				$td.text(realDay);
				$td.data("dateStr", (date.getFullYear()) + "/" + (date.getMonth() + 1) + "/" + realDay);
				realDayObj.setDate(realDay);
				realDayObj.setMonth(date.getMonth());
				realDayObj.setYear(date.getFullYear());
			} else {/* Next months day */
				$td.text(realDay - lastDay);
				$td.addClass('day_another_month');
				$td.data("dateStr", dateNextMonth.getFullYear() + "/" + (dateNextMonth.getMonth() + 1) + "/" + (realDay - lastDay));
				realDayObj.setDate(realDay - lastDay);
				realDayObj.setMonth(dateNextMonth.getMonth());
				realDayObj.setYear(dateNextMonth.getFullYear());
			}

			/* Check a wday */
			var wday = ((i + firstDayDiff) % 7);
			if(allowWdays != null) {
				if ($.inArray(wday, allowWdays) == -1) {
					$td.addClass('day_in_unallowed');
					continue; // Skip
				}
			} else if (wday === 0) {/* Sunday */
				$td.addClass('wday_sun');
			} else if (wday == 6) {/* Saturday */
				$td.addClass('wday_sat');
			}

			/* Set a special mark class */
			if (realDay == date.getDate()) $td.addClass('active');

			if (isCurrentMonth && realDay == todayDate.getDate()) $td.addClass('today');

			var realDayObjMN =  new Date(realDayObj.getTime());
			realDayObjMN.setHours(23);
			realDayObjMN.setMinutes(59);
			realDayObjMN.setSeconds(59);

			if (
				// compare to 23:59:59 on the current day (if MIN is 1pm, then we still need to show this day
				((minDate != null) && (minDate > realDayObjMN.getTime())) || ((maxDate != null) && (maxDate < realDayObj.getTime())) // compare to 00:00:00
			) { // Out of range day
				$td.addClass('out_of_range');
			} else if (isFutureOnly && isPast) { // Past day
				$td.addClass('day_in_past');
			} else {
				/* Set event-handler to day cell */
				$td.click(function() {
					if ($(this).hasClass('hover')) {
						$(this).removeClass('hover');
					}
					$(this).addClass('active');

					var $picker = getParentPickerObject($(this));
					var targetDate = new Date($(this).data("dateStr"));
					var selectedDate = getPickedDate($picker);
					draw($picker, targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), selectedDate.getHours(), selectedDate.getMinutes());
				});

				$td.hover(function() {
					if (! $(this).hasClass('active')) {
						$(this).addClass('hover');
					}
				}, function() {
					if ($(this).hasClass('hover')) {
						$(this).removeClass('hover');
					}
				});
			}
		}
		
		if ($picker.data("dateOnly") === true) {
			/* dateOnly mode */
			$timelist.css("display", "none");
		} else {
			/* Timelist ----- */
			$timelist.children().remove();

			realDayObj =  new Date(date.getTime());
			$timelist.css("height", '175px');

			/* Output time cells */
			var hour_ = minTime[0];
			var min_ = minTime[1];

			while( hour_*100+min_ < maxTime[0]*100+maxTime[1] ){
				var $o = $('<div>');
				var is_past_time = hour_ < todayDate.getHours() || (hour_ == todayDate.getHours() && min_ < todayDate.getMinutes());
				var is_past = isCurrentDay && is_past_time;
				
				$o.addClass('timelist_item');
				$o.text(zpadding(hour_) + ":" + zpadding(min_));

				$o.data("hour", hour_);
				$o.data("min", min_);

				$timelist.append($o);

				realDayObj.setHours(hour_);
				realDayObj.setMinutes(min_);

				if (
					((minDate != null) && (minDate > realDayObj.getTime())) || ((maxDate != null) && (maxDate < realDayObj.getTime()))
				) { // Out of range cell
					$o.addClass('out_of_range');
				} else if (isFutureOnly && is_past) { // Past cell
					$o.addClass('time_in_past');
				} else { // Normal cell
					/* Set event handler to time cell */
					$o.click(function() {
						if ($(this).hasClass('hover')) {
							$(this).removeClass('hover');
						}
						$(this).addClass('active');

						var $picker = getParentPickerObject($(this));
						var date = getPickedDate($picker);
						var hour = $(this).data("hour");
						var min = $(this).data("min");
						draw($picker, date.getFullYear(), date.getMonth(), date.getDate(), hour, min);
					});

					$o.hover(function() {
						if (!$(this).hasClass('active')) $(this).addClass('hover');
					}, function() {
						if ($(this).hasClass('hover')) $(this).removeClass('hover');
					});
				}
				
				if (hour_ == date.getHours() && min_ == date.getMinutes()) { /* selected time */
					$o.addClass('active');
					timelist_activeTimeCell_offsetTop = $o.offset().top;
				}

				min_ += minuteInterval;
				if (min_ >= 60){
					min_ -= 60;
					hour_++;
				}
			}

			/* Scroll the timelist */
			$timelist.scrollTop(drawBefore_timeList_scrollTop);
		}
	};

	/** Initialize dtpicker */
	$.fn.dtpicker = function(config) {
		var dialog = config.dialog;
		
		var opt = $.extend({
			"current": null,
			"locale": "en",
			"minuteInterval": 30,
			"firstDayOfWeek": 0,
			"todayButton": true,
			"dateOnly": false,
			"futureOnly": false,
			"minDate" : null,
			"maxDate" : null,
			"minTime":"00:00",
			"maxTime":"23:59",
			"allowWdays": null
		}, config);
		
		/* Container */
		var $picker = $('<div>');

		$picker.addClass('datepicker');
		$(this).append($picker);

		/* Set current date */
		if (!opt.current) opt.current = new Date();

		/* Set options data to container object  */
		$picker.data("dateOnly", opt.dateOnly);
		$picker.data("locale", opt.locale);
		$picker.data("firstDayOfWeek", opt.firstDayOfWeek);
		$picker.data("todayButton", opt.todayButton);
		$picker.data('futureOnly', opt.futureOnly);
		$picker.data('allowWdays', opt.allowWdays);

		var minDate = Date.parse(opt.minDate);
		$picker.data('minDate', isNaN(minDate) ? null : minDate);
		var maxDate = Date.parse(opt.maxDate);
		$picker.data('maxDate', isNaN(maxDate) ? null : maxDate);
		
		$picker.data("state", 0);

		if(5 <= opt.minuteInterval && opt.minuteInterval <= 30){
			$picker.data("minuteInterval", opt.minuteInterval);
		} else {
			$picker.data("minuteInterval", 30);
		}
		opt.minTime = opt.minTime.split(':');
		opt.maxTime = opt.maxTime.split(':');

		if(!((opt.minTime[0] >= 0 ) && (opt.minTime[0] <24 ))) opt.minTime[0]="00";
		if(!((opt.maxTime[0] >= 0 ) && (opt.maxTime[0] <24 ))) opt.maxTime[0]="23";
		if(!((opt.minTime[1] >= 0 ) && (opt.minTime[1] <60 ))) opt.minTime[1]="00";
		if(!((opt.maxTime[1] >= 0 ) && (opt.maxTime[1] <24 ))) opt.maxTime[1]="59";
		opt.minTime[0]=parseInt(opt.minTime[0]);
		opt.minTime[1]=parseInt(opt.minTime[1]);
		opt.maxTime[0]=parseInt(opt.maxTime[0]);
		opt.maxTime[1]=parseInt(opt.maxTime[1]);
		$picker.data('minTime', opt.minTime);
		$picker.data('maxTime', opt.maxTime);
		
		/* Header */
		var $header = $('<div>');
		$header.addClass('datepicker_header');
		$picker.append($header);
		
		/* InnerContainer*/
		var $inner = $('<div>');
		$inner.addClass('datepicker_inner_container');
		$picker.append($inner);
		
		/* Calendar */
		var $calendar = $('<div>');
		$calendar.addClass('datepicker_calendar');
		$calendar.css("height", '175px');
		var $table = $('<table>');
		$table.addClass('datepicker_table');
		$calendar.append($table);
		$inner.append($calendar);
		
		/* Timelist */
		var $timelist = $('<div>');
		$timelist.addClass('datepicker_timelist');
		$inner.append($timelist);

		/* Set event-handler to calendar */
		if (window.sidebar) { // Mozilla Firefox
			$calendar.bind('DOMMouseScroll', function(e){
				var $picker = getParentPickerObject($(this));
				
				// up,left [delta < 0] down,right [delta > 0]
				var delta = e.originalEvent.detail;
				if(delta > 0) {
					afterDay($picker);
				} else {
					beforeDay($picker);
				}
				return false;
			});
		} else { // Other browsers
			$calendar.bind('mousewheel', function(e){
				var $picker = getParentPickerObject($(this));
				// up [delta > 0] down [delta < 0]
				var threshold = 75, dtpicker = $.fn.dtpicker;
				if (dtpicker._delta == null) dtpicker._delta = 0;
				var delta = dtpicker._delta += e.originalEvent.wheelDeltaY;
				if(delta > threshold) {
					dtpicker._delta -= threshold;
					beforeDay($picker);
				} else if (delta < -threshold) {
					dtpicker._delta += threshold;
					afterDay($picker);
				}
				return false;
			});
		}
		
		$.fn.dtpicker.dialog = dialog;
		
		var date = opt.current;
		draw($picker, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};
})(window, jQuery);
