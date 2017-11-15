function MyDiv(selector) {
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
