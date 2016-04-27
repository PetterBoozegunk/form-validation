/*jslint browser: true */
(function (window) {
    "use strict";

    var $ = window.jQuery,

        util = window.util,

        validation = {
            required: {
                "input": {
                    "checkbox": function () {
                        var isRequired = this.hasAttribute("required"),
                            t = $(this),
                            isValid = isRequired ? t.prop("checked") : true;

                        return isValid;
                    }
                },
                "default": function () {
                    var isRequired = this.hasAttribute("required"),
                        val = $(this).val(),
                        isValid = isRequired ? (val !== "") : true;

                    return isValid;
                },
                checkTagType: function (tagName, type) {
                    return (type && validation.required[tagName] && validation.required[tagName][type]);
                },
                getValidationFunc: function (tagName, type) {
                    return validation.required.checkTagType(tagName, type) ? validation.required[tagName][type] : validation.required["default"];
                },
                getType: function () {
                    var tagName = this.tagName.toLowerCase(),
                        type = this.type,
                        validationFunc = validation.required.getValidationFunc(tagName, type);

                    return validationFunc;
                }
            },
            types: {
                "required": function () {
                    var requiredValidationFunc = validation.required.getType.call(this),
                        isValid = requiredValidationFunc.call(this);

                    return isValid;
                },
                "email": function () {
                    // regexp found here: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
                    var isEmailInput = (this.type && this.type.toLowerCase() === "email"),
                        val = util.returnString($(this).val()),
                        looksLikeEmail = val.match(/[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?/),
                        isValid = (isEmailInput && val) ? looksLikeEmail : true;

                    return isValid;
                },
                "pattern": function () {
                    //  text, search, tel, url, email or password
                    var type = util.returnString(this.type).toLowerCase(),
                        canHavePattern = /^(text|search|tel|url|email|password)$/.test(type),
                        pattern = this.getAttribute("pattern"),
                        val = $(this).val(),
                        isValid = (canHavePattern && pattern && val) ? (new RegExp("^" + pattern + "$")).test(val) : true;

                    return isValid;
                },
                "personnummer": function () {
                    var t = $(this),
                        isPersonnummer = t.attr("data-type") === "personnummer",
                        isValid = isPersonnummer ? t.trigger("personnummer:check").data("isValid") : true;

                    return isValid;
                }
            },
            getFilterFunc: function (type, validOrNot) {
                return function () {
                    var validity = (validOrNot === "valid") ? validation.types[type].call(this) : !validation.types[type].call(this);

                    return validity;
                };
            },
            getChangeType: function (previousValidityState) {
                return (!previousValidityState) ? "set" : "change";
            },
            triggerValidityEvent: function (t, previousValidityState, validityState) {
                var changeTyp = validation.getChangeType(previousValidityState);

                t.data("validity", validityState);

                if (validityState !== previousValidityState) {
                    t.trigger("validity:" + changeTyp);
                    t.trigger("validity:" + validityState);
                }
            },
            setValidityState: function (validityState) {
                var t = $(this),
                    previousValidityState = t.data("validity");

                validation.triggerValidityEvent(t, previousValidityState, validityState);
            },
            isDuplicate: function (elem, elems) {
                var isDuplicate = false;

                elems.each(function () {
                    if (this === elem) {
                        isDuplicate = true;
                    }
                });

                return isDuplicate;
            },
            removeDuplicates: function (elems1, elems2, elemTemp) {
                elems1.each(function () {
                    var isDuplicate = validation.isDuplicate(this, elems2);

                    if (!isDuplicate) {
                        elemTemp.push(this);
                    }
                });

                return $(elemTemp);
            },
            removeDuplicatesFromArray: function (arr, newArray) {
                arr.forEach(function (item) {
                    if ($.inArray(item, newArray) === -1) {
                        newArray.push(item);
                    }
                });

                return newArray;
            },
            getElems: function (elems, elemsArray, validOrNot) {
                Object.keys(validation.types).forEach(function (type) {
                    var filterFunc = validation.getFilterFunc.call(this, type, validOrNot);

                    elemsArray = elemsArray.concat(elems.filter(filterFunc).toArray());
                });

                return $(validation.removeDuplicatesFromArray(elemsArray, []));
            },
            setSubmitButtonState: function (form, inValidElems) {
                var disableSubmitButton = (inValidElems.length > 0),
                    submitButton = form.find("[type=submit], [data-type=submit]"),
                    removeAddAttr = disableSubmitButton ? "attr" : "removeAttr";

                submitButton.prop("disabled", disableSubmitButton);
                submitButton[removeAddAttr]("disabled", "disabled");
            },
            setValidityStates: function (form, validElems, inValidElems) {
                validElems.each(validation.setValidityState, ["valid"]);
                inValidElems.each(validation.setValidityState, ["notValid"]);

                validation.setSubmitButtonState(form, inValidElems);
            },
            checkForm: function () {
                var form = $(this),
                    elems = form.find("input, textarea, select"),
                    validElems = validation.getElems(elems, [], "valid"),
                    inValidElems = validation.getElems(elems, [], "notValid");

                validElems = validation.removeDuplicates(validElems, inValidElems, []);

                validation.setValidityStates(form, validElems, inValidElems);
            },
            setError: function () {
                var t = $(this),
                    label = t.closest("label"),
                    addRemove = (t.data("validity") === "valid") ? "remove" : "add";

                label[addRemove + "Class"]("error");
            },
            bindEvents: function () {
                var body = $("body");

                body.on("validity:valid", "form[data-validation=on] input, form[data-validation=on] textarea, form[data-validation=on] select", validation.setError);

                body.on("submit click keyup change input blur validation:checkForm", "form[data-validation=on]", validation.checkForm);

                body.on("blur", "form[data-validation=on] input, form[data-validation=on] textarea", validation.setError);
                body.on("change validity:change", "form[data-validation=on] select", validation.setError);
            }
        };

    validation.bindEvents();

}(window));