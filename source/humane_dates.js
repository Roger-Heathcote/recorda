/*
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 *
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 * Further messed around with by Roger Heathcote (technicalbloke.com)
 * Largely to make linter warnings go away
 * Licensed under the MIT license.
 */


// jshint ignore: start
// TODO ditch this, write own or get better module from npm
// Don't need compare to
// Don't need plurals
// Hate formatting
// Hate use of tertiary operator
// Especially over multiple lines
// Acknowldge that I suffer from "not written here syndrome"

let humaneDate = pureHumaneDate.bind(null, Date);

function pureHumaneDate(DateConstructor, inputDate, inputCompareTo){

    if(!inputDate) { throw Error("humaneDate requires an inputDate"); }

    let lang = {
            ago: 'ago',
            from: '',
            now: '<1m ago',
            minute: 'm',
            minutes: 'm',
            hour: 'hr',
            hours: 'hrs',
            day: 'day',
            days: 'days',
            week: 'wk',
            weeks: 'wks',
            month: 'mn',
            months: 'mn',
            year: 'yr',
            years: 'yr'
    };
    let formats = [
            [60, lang.now],
            [3600, lang.minute, lang.minutes, 60], // 60 minutes, 1 minute
            [86400, lang.hour, lang.hours, 3600], // 24 hours, 1 hour
            [604800, lang.day, lang.days, 86400], // 7 days, 1 day
            [2628000, lang.week, lang.weeks, 604800], // ~1 month, 1 week
            [31536000, lang.month, lang.months, 2628000], // 1 year, ~1 month
            [Infinity, lang.year, lang.years, 31536000] // Infinity, 1 year
    ];
    let isString = typeof inputDate == 'string';
    let date = isString ?
        new DateConstructor(('' + inputDate).replace(/-/g,"/").replace(/[TZ]/g," ")) : inputDate;
    let compareTo = inputCompareTo || new DateConstructor();
    let seconds = (compareTo - date + (compareTo.getTimezoneOffset() -
        // if we received a GMT time from a string, doesn't include time zone bias
        // if we got a date object, the time zone is built in, we need to remove it.

        (isString ? 0 : date.getTimezoneOffset())
        ) * 60000
    ) / 1000;
    let token;

    // TODO: bugs!!!!!
    // console.log("Date now is:       ", date);
    // console.log("Date to compare is:", compareTo);
    // console.log("Difference in s is:", seconds);
    // console.log("Difference in m is:", seconds/60);
    // console.log("Difference in h is:", seconds/60/60);

    if(seconds < 0) {
        seconds = Math.abs(seconds);
        token = lang.from ? ' ' + lang.from : '';
    } else {
        token = lang.ago ? ' ' + lang.ago : '';
    }

    function normalize(val, single)
    {
        let margin = 1;
        if(val >= single && val <= single * (1+margin)) {
            return single;
        }
        return val;
    }

    for(let i = 0, format = formats[0]; formats[i]; format = formats[++i]) {

        if(seconds < format[0]) {

            if(i === 0) {
                // Now
                return format[1];
            }

            let val = Math.ceil(normalize(seconds, format[3]) / (format[3]));

            return val +
                    (val != 1 ? format[2] : format[1]) +
                    (i > 0 ? token : '');
        }
    }
};

if(typeof jQuery != 'undefined') {
    jQuery.fn.humaneDates = function jQueryFnHumaneDates(options)
    {
        let settings = jQuery.extend({
            'lowercase': false
        }, options);

        return this.each(function eachInThisJQueryFnHumaneDates()
        {
            let $t = jQuery(this),
                date = $t.attr('datetime') || $t.attr('title');

            date = humaneDate(date);

            if(date && settings.lowercase) {
                date = date.toLowerCase();
            }

            if(date && $t.html() != date) {
                // don't modify the dom if we don't have to
                $t.html(date);
            }
        });
    };
}
module.exports = {
  humaneDate,
  pureHumaneDate
};
