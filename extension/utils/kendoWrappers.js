/******************************************************************************************************/
/** Kendo Wrappers > add the jQuery val() API support to custom components*/
/** NOTE: By default, the test can not access any JS which belongs to the app. */
/** This implies that we cannot access any Kendo classes initialized by the app. */
/** To do so, we must explicitly ask the script run in the app space (See: runScriptInHostPage) */
/******************************************************************************************************/

function KendoGrid(selector) {
    this.selector = selector;

    this.doubleClickRow = function (selection) {
        var kendoRef = "$('" + selector + "').data('kendoGrid')";

        // 1. Use the Kendo API to select the given row
        // 2. Fire a dblclick event on the grid (Kendo doesn't have a dblclick fn on its grid API)
        runScriptInHostPage("function(){"
                + "var g = " + kendoRef + ";"
                + "g.select($('tr:contains(\"" + selection + "\")'));"
                + "var ev = jQuery.Event('dblclick', { originalEvent: {toElement: 'table'} });"
                + "var tableSelector = \"" + selector + " table[role='grid']\";"
                + "$(tableSelector).trigger(ev);}"
        )
    }
}

function KendoMenu(selector) {
    this.selector = selector;

    this.val = function (text) {
        var itemSelector = selector + ' li span:contains(' + text + ')';
        $(itemSelector).trigger('click')
    }
}

function kendoComboBox(selector) {
    this.selector = selector;

    this.val = function (selection) {
        if (isValidDOMInput(selection)) {
            var kendoRef = "$('" + this.selector + "').getKendoComboBox()";
            runScriptInHostPage("function(){"
                    + kendoRef + ".open();"
                    + kendoRef + ".text('" + selection + "');"
                    + kendoRef + ".close();"
                    + kendoRef + "._change();}"
            );
        } else {
            var display = $(selector).parent().find('.k-input');
            return display.val();
        }
    }
}

function kendoDropDownList(selector) {
    this.selector = selector;

    this.val = function (selection) {
        if (isValidDOMInput(selection)) {
            var kendoRef = "$('" + this.selector + "').data('kendoDropDownList')"
            runScriptInHostPage("function(){"
                    + kendoRef + ".open();"
                    + kendoRef + ".text('" + selection + "');"
                    + kendoRef + ".close();"
                    + kendoRef + "._change();}"
            );
        } else {
            var display = $(selector).parent().find('.k-input');
            return innerText(display)[0];
        }
    }

    this.isVisible = function () {
        return isNodeVisible($(this.selector).parent());
    }
}

function kendoNumericTextBox(selector) {
    var that = this;
    this.selector = selector;

    this.val = function (text) {
        if (isValidDOMInput(text)) {
            runScriptInHostPage("function(){"
                    + "$('" + that.selector + "').data('kendoNumericTextBox')._change(" + text + ");}"
            )
        } else {
            return $(selector).val();
        }
    }
    this.isVisible = function () {
        return isNodeVisible($(this.selector).parent());
    }
}

function kendoDatePicker(selector) {
    this.selector = selector;
    this.dateExtractRe = /Date\((\d*)\)/;

    this.val = function (text) {
        if (isValidDOMInput(text)) {
            runScriptInHostPage("function(){"
                    + "$('" + this.selector + "').data('kendoDatePicker')._change('" + text + "');}"
            );
        } else {
            return $(selector).val();
        }
    }
}

function kendoAutoComplete(selector) {
    this.selector = selector;

    this.val = function (text) {
        var that = this;

        if (isValidDOMInput(text)) {
            lookup(text);
        } else {
            return $(selector).val();
        }

        function lookup(text) {
            var kendoRef = "$('" + that.selector + "').data('kendoAutoComplete')"

            runScriptInHostPage("function(){"
                    + kendoRef + ".search('" + text + "');}"
            );
            waitUntil(function () {
                return isSelectorVisible(that.selector + "_listbox");
            }).then(function () {
                var locator = that.selector + "_listbox li:contains('" + text + "')";
                $(locator).click();
            });
        }
    }
}