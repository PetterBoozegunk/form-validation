/*jslint browser: true */

(function (window) {
    "use strict";

    var $ = window.jQuery,

        persnr = {
            strToNumber: function (str) {
                return parseFloat(str);
            },
            getCentury: function (persnrStr) {
                var nowYear = persnr.strToNumber(persnr.year.toString().substring(2, 4)),
                    century = (persnr.strToNumber(persnrStr.substring(0, 2)) < nowYear) ? "20" : "19";

                return century + persnrStr;
            },
            setCentury: function (persnrStr) {
                var firstTwo19Or20 = /^(19|20)/.test(persnrStr);

                if (persnrStr.length === 10 && !firstTwo19Or20) {
                    persnrStr = persnr.getCentury(persnrStr);
                }

                return persnrStr;
            },
            setTwelveDigits: function (e, orgE) {
                var persnrStr = this.value,
                    twelveDigitsPersnr = persnr.setCentury(persnrStr.replace(/\D/g, "").substring(0, 12));

                if (e && (!orgE || orgE.keyCode !== 8)) {
                    this.value = twelveDigitsPersnr;
                }

                return twelveDigitsPersnr;
            },
            getValidYear: function (yearStr) {
                var yearNbr = persnr.strToNumber(yearStr),
                    validYear = /^(19|20)/.test(yearStr);

                return validYear ? yearNbr : false;
            },
            getValidMonth: function (monthNbr) {
                return (monthNbr > -1 && monthNbr < 12) ? monthNbr : false;
            },
            getValidDate: function (yearNbr, monthNbr, dayStr) {
                var dayNbr = persnr.strToNumber(dayStr),
                    testDate = new Date(yearNbr, monthNbr, dayNbr),
                    testDay = testDate.getDate();

                return (testDay === dayNbr) ? dayNbr : false;
            },
            checkDateIsInThePast: function (dateIsValid) {
                var now = persnr.now;

                return dateIsValid ? (dateIsValid < now) : false;
            },
            checkDateIsValid: function (pnrStr) {
                var dateStr = pnrStr.replace(/\d{4}$/, ""),

                    year = persnr.getValidYear(dateStr.substring(0, 4)),
                    month = persnr.getValidMonth(persnr.strToNumber(dateStr.substring(4, 6)) - 1),
                    day = persnr.getValidDate(year, month, dateStr.substring(6, 8)),

                    dateIsValid = (year && (typeof month === "number") && day) ? new Date(year, month, day) : false;

                return persnr.checkDateIsInThePast(dateIsValid);
            },
            checkLastDigits: function (pnrStr) {
                var checkStr = pnrStr.toString().substring(2, 12).split(""),
                    multiplicator = 2,
                    temp,
                    sum = 0,
                    i,
                    l = checkStr.length;

                for (i = 0; i < l; i += 1) {
                    temp = checkStr[i] * multiplicator;

                    if (temp > 9) {
                        temp -= 9;
                    }

                    sum += temp;

                    multiplicator = (multiplicator === 1 ? 2 : 1);
                }

                return (sum % 10) === 0;
            },
            check: function (e, orgE) {
                var pnrStr = persnr.setTwelveDigits.call(this, e, orgE),
                    dateIsValid = persnr.checkDateIsValid(pnrStr),
                    lastDigits = persnr.checkLastDigits(pnrStr),
                    isValid = dateIsValid ? lastDigits : false;

                $(this).data("isValid", isValid);

                return isValid;
            },
            formatDateProp: function (dateProp) {
                return dateProp.replace(/(^get|Full)/g, "").toLowerCase();
            },
            setNow: function () {
                var now = new Date(),
                    setDateProps = ["getFullYear", "getMonth", "getDate"];

                setDateProps.forEach(function (dateProp) {
                    persnr[persnr.formatDateProp(dateProp)] = now[dateProp]();
                });

                persnr.now = now;
            },

            bindEvents: function () {
                $("body").on("personnummer:check", "input", persnr.check);
            },
            init: function () {
                persnr.setNow();
                persnr.bindEvents();
            }
        };

    persnr.init();

}(window));