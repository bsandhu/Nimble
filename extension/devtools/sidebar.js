// NOTE
// Console logging doesn't seem to work for Sidebar panel. alert() does.
// As an alternate, you can isolate and test the page separately by directly loading sidebar.html in the browser
// See:

/**
 * DOM Ids
 */
const SIDEBAR_CLEAR_ELEM = '#sidebar-clear';
const SIDEBAR_APPEND_ELEM = '#sidebar-append';
const SIDEBAR_NESTED_ELEM = '#sidebar-nested';
const SIDEBAR_TXT_AREA_ELEM = '#sidebar-textArea';
const SIDEBAR_HIGHLIGHT_CLASS = 'toolbarItemHighlight';
var appendMode = false;
var nestedMode = false;

/**
 * Fire the page obj generator when an object is slected in the Elements panel
 */
chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
    console.log('Generating page object');
    try {
        var genFn = '(' + activePageObjStrategy.toString() + ')(' + nestedMode + ')';

        // Run in context of the Inspected page
        chrome.devtools.inspectedWindow.eval(
            genFn,
            function onScriptEval(res, exceptionInfo) {
                if (exceptionInfo){
                    $(SIDEBAR_TXT_AREA_ELEM).val(JSON.stringify(exceptionInfo));
                } else {
                    if (appendMode) {
                        $(SIDEBAR_TXT_AREA_ELEM).val($(SIDEBAR_TXT_AREA_ELEM).val() + '\n' + res);
                    } else {
                        $(SIDEBAR_TXT_AREA_ELEM).val(res);
                    }
                }
            });
    } catch (e) {
        alert(e);
        console.error(e);
    }
});

/**
 * Track currently active page generation strategy
 */
var activePageObjStrategy = Nimble.pageObjGenerators[0].generator;
var selectElem = document.getElementById('sidebar-strategySelection');

function updateActiveStrategy() {
    activePageObjStrategy = selectElem.options[selectElem.selectedIndex].value;
}

/**
 * Gather the registered strategies and populate the <select>
 */
function initGeneratorsSelection() {
    selectElem.onchange = updateActiveStrategy;

    $.each(Nimble.pageObjGenerators, function (index, generator) {
        var optionElem = document.createElement('option');
        optionElem.value = generator.generator;
        optionElem.text = generator.label;
        selectElem.add(optionElem);
    });
}

/**
 * Event handlers for the toolbar buttons
 */
$(SIDEBAR_CLEAR_ELEM).click(function(){
    $(SIDEBAR_TXT_AREA_ELEM).val('');
})

$(SIDEBAR_APPEND_ELEM).click(function () {
    $(SIDEBAR_APPEND_ELEM).toggleClass(SIDEBAR_HIGHLIGHT_CLASS);
    appendMode = !appendMode;
});

$(SIDEBAR_NESTED_ELEM).click(function(){
    $(SIDEBAR_NESTED_ELEM).toggleClass(SIDEBAR_HIGHLIGHT_CLASS);
    nestedMode = !nestedMode;
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
initGeneratorsSelection();
