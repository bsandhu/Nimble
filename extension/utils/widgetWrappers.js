var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isValidDOMInput(text) {
    return text !== null && text !== undefined && String(text) !== "";
}

function Input(selector) {
    var that = this;
    this.selector = selector;

    this.val = function (text) {
        if (isValidDOMInput(text)) {
            $(that.selector).val(text);
            // KO bindings need a change event to respond to DOM
            runScriptInHostPage("function(){" +
                "$('" + that.selector + "').change();}"
            );
        } else {
            return $(this.selector).val();
        }
    }
    this.isVisible = function () {
        return isNodeVisible($(this.selector));
    }
}

function Button(selector) {
    this.selector = selector;

    this.click = function () {
        $(selector).trigger('click');
    }
}

/**
 * Note: jQuery's click trigger function does not trigger a non-jQuery DOM click listener
 * @see http://stackoverflow.com/questions/17819344/triggering-a-click-event-from-content-script-chrome-extension
 */
function Anchor(selector) {
    this.selector = selector;

    this.click = function () {
        $(selector)[0].click();
    }
}

function CheckBox(selector) {
    var that = this;
    this.selector = selector;

    /**
     * Flag value of true --> Checked
     * Flag value of false --> Unchecked
     */
    this.val = function (flag) {
        var value = $(selector).prop('checked');
        if (isValidDOMInput(flag) && value != flag) {
            that.click();
        } else {
            return value;
        }
    }

    this.click = function () {
        $(selector).trigger('click');
    }
}

// DIV
// SPAN


