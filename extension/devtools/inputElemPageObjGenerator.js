var Nimble = Nimble || {};

var Generator = function(){
    /**
     * Label to be displayed on the sidepanel
     * @type {String}
     */
    this.label = null;

    /**
     * Generate the page object code for the currently selected node ($0)
     * @type {Function}
     */
    this.generator = null;
}

/**
 * Registers a generator object with Nimble. This will be added to page object generator side panel.
 * @param obj Instance of Generator object.
 */
function addGenerator(obj) {
    // TODO Generator instance check here
    var errMsg = 'Page obg generation strategy must be an object like: {"lable": "My Gen.", "generator" : function(){}}';
    if (!$.isPlainObject(obj) || !obj.hasOwnProperty('label') || !obj.hasOwnProperty('generator')) {
        alert(errMsg);
        return;
    }
    Nimble.pageObjGenerators = Nimble.pageObjGenerators || [];
    Nimble.pageObjGenerators.push(obj);
}

function initInputElementGenerator() {
    console.log('Init Input element generator');

    addGenerator({
        'label': 'Default',

        /**
         * Walk through the children on the selected DOM node and generate PageObject selectors
         * Note: The function below is executed in the context of the inspected page.
         */
        'generator':
            function (includeNested) {
                includeNested = includeNested || false;

                /*******************************************************************/
                /* Super Selector */
                /* https://github.com/caplin/SuperSelector */
                /* Why is this inline? */
                /* This function has to be evaluated in context of the 'inspectedWindow' */
                /* It can't access any code on the page or external libs */
                /* Need to figure out a way to do this better */
                /*******************************************************************/

                function SuperSelector() {
                    if (!document.getElementById("superselect")) {
                        this.message = "Ctrl + click an element on the page to generate a selector";
                        this.pConfigOptions = ["Ignore all config"];
                        this.config = this.pConfigOptions;

                        this.ignoreClasses = "hover, mouseOver";
                        this.ignoreIdPrefixes = "generic_";

                        this.prevElement = null;
                        this.prevElementBorder = null;
                    }

                    this.Config = function (ignoreClasses, ignoreIdPrefixes, disableConfig) {
                        this.disableConfig = disableConfig;
                        this.ignoreClasses = ignoreClasses.replace(/\s+/g, '').split(/\s*,\s*/);
                        this.ignoreIdPrefixes = ignoreIdPrefixes.replace(/\s+/g, '').split(/\s*,\s*/);
                    };

                    this.Target = function (eElement, oConfig) {
                        this.targetElement = eElement;
                        this.currentElement = eElement;
                        this.completed = false;
                        this.selectors = [];
                        this.disableConfig = oConfig.disableConfig;
                        this.ignoreIdPrefixes = oConfig.ignoreIdPrefixes;
                        this.ignoreClasses = oConfig.ignoreClasses;
                    };

                    this.Target.prototype.calculateSelector = function () {
                        var prefix = "'";
                        var suffix = "'";
                        this.traverseAndCalc(this.targetElement);
                        return prefix + this.generateSelectorString() + suffix;
                    };

                    this.Target.prototype.generateSelectorString = function () {
                        var selectorString = "";
                        for (var i = this.selectors.length - 1; i >= 0; i--) {
                            selectorString += this.selectors[i];
                            if (i != 0) {
                                selectorString += " ";
                            }
                        }
                        return selectorString;
                    };

                    this.Target.prototype.traverseAndCalc = function (eElement) {
                        var sId = eElement.getAttribute("id");
                        var sClass = eElement.getAttribute("class");

                        while (this.completed == false && this.currentElement != null) {
                            sId = this.currentElement.getAttribute("id");
                            sClass = this.currentElement.getAttribute("class");

                            if (sId != null && this.isAllowedId(sId))            /* ID CODE PATH */
                            {
                                this.calculateIdSelector(sId);
                            }
                            else if (sClass != null && sClass != "")            /* CLASS CODE PATH */
                            {
                                this.calculateClassSelector(sClass);
                            }
                            else {
                                this.calculateTagSelector();
                                /* TAGNAME CODE PATH */
                            }

                            this.currentElement = this.currentElement.parentElement;
                        }
                        return this.selectors;
                    };

                    this.Target.prototype.calculateIdSelector = function (sElementId) {
                        if (document.getElementById(sElementId) != null) {
                            this.selectors.push("#" + sElementId);
                            this.completed = true;
                        }
                    };

                    this.Target.prototype.calculateClassSelector = function (sClass) {
                        var selectorForClass = this._generateSelectorClassesString(sClass);
                        /* remove dupe */
                        if (selectorForClass != "") {
                            this.selectors.push("." + selectorForClass);

                            var foundElementsInDom = document.getElementsByClassName(selectorForClass);
                            if (foundElementsInDom.length == 1) {
                                this.completed = true;
                            }
                        }
                        else {
                            this.calculateTagSelector();
                        }
                    };

                    this.Target.prototype.calculateTagSelector = function () {
                        var sTagName = this.currentElement.tagName;
                        var eParent = this.currentElement.parentElement;
                        var pChildElementsToConsider = (eParent == null ? [] : eParent.children);
                        var pTagElementsToConsider = (eParent == null ? [] : eParent.getElementsByTagName(sTagName));

                        if (sTagName.toLowerCase() == "body") {
                            this.selectors.push(sTagName.toLowerCase());
                        }

                        else if (pTagElementsToConsider.length == 1) {
                            this.selectors.push(sTagName.toLowerCase());
                        }

                        else {
                            for (var i = 0; i < pChildElementsToConsider.length; i++) {
                                if (pChildElementsToConsider[i] == this.currentElement) {
                                    this.selectors.push(sTagName.toLowerCase() + ":nth-child(" + (i + 1) + ")");
                                }
                            }
                        }
                    };

                    this.Target.prototype.isAllowedId = function (sIdName) {
                        if (this.disableConfig) {
                            return true;
                        }
                        for (var i = 0; i < this.ignoreIdPrefixes.length; i++) {
                            if (sIdName.toLowerCase().indexOf(this.ignoreIdPrefixes[i].toLowerCase()) == 0 &&
                                this.ignoreIdPrefixes[i] != "") {
                                return false;
                            }
                        }
                        return true;
                    };

                    this.Target.prototype.isAllowedClass = function (sName) {
                        if (this.disableConfig) {
                            return true;
                        }
                        for (var i = 0; i < this.ignoreClasses.length; i++) {
                            if (this.ignoreClasses[i].toLowerCase() == sName.toLowerCase()) {
                                return false;
                            }
                        }
                        return true;
                    };

                    this.Target.prototype._generateSelectorClassesString = function (sClassName) {
                        var pValidClasses = this._returnValidClasses(sClassName);
                        var eParent = this.currentElement.parentElement;

                        /* See if we can get a class selector within the current element's parent which is unique */
                        for (var i = 0; i < pValidClasses.length; i++) {
                            if (eParent.getElementsByClassName(pValidClasses[i]).length == 1 &&
                                eParent.getElementsByClassName(pValidClasses[i])[0] == this.currentElement) {
                                return pValidClasses[i];
                            }
                        }

                        /* See if we can get a class + eq(X) selector inside the current element's parent */
                        var className = pValidClasses[0];
                        var foundElements = eParent.getElementsByClassName(className);
                        for (var i = 0; i < foundElements.length; i++) {
                            if (foundElements[i] == this.currentElement) {
                                return className + ":nth-child(" + (i + 1) + ")";
                            }
                        }

                        return pValidClasses.join(", ");
                    };

                    /* Filter classes against the ignore classes list */
                    this.Target.prototype._returnValidClasses = function (className) {
                        var classes = className.split(" ");
                        var pClassesToReturn = [];

                        for (var i = 0; i < classes.length; i++) {
                            if (this.isAllowedClass(classes[i])) {
                                if (this._classDoesNotAlreadyExistInArray(classes[i], pClassesToReturn)) {
                                    pClassesToReturn.push(classes[i]);
                                }
                            }
                        }
                        return pClassesToReturn;
                    };

                    /* Assert that sClass does not exist in pClassArray */
                    this.Target.prototype._classDoesNotAlreadyExistInArray = function (sClass, pClassArray) {
                        for (var x = 0; x < pClassArray.length; x++) {
                            if (sClass.toLowerCase() == pClassArray[x].toLowerCase()) {
                                return false;
                            }
                        }
                        return true;
                    };
                }

                /*******************************************************************/
                /* End of Super Selector */
                /*******************************************************************/

                var ss = new SuperSelector();
                var tagsToFind = ['input', 'button', 'select', 'textarea'];

                return (includeNested)
                    ? $($0).find(tagsToFind.join(','))
                        .map(generateWrapper)
                        .get()
                        .join('\n')
                    : generateWrapper(0, $0) + '\n';

                function generateWrapper(index, elem) {
                    try {
                        jqElem = $(elem);
                        var tag = toCamelCase(jqElem[0]['tagName']);
                        var type = toCamelCase(jqElem.attr('type'));

                        if ($.inArray(tag.toLowerCase(), tagsToFind) < 0  || type == 'Hidden') {
                            return null;
                        }

                        // Generate Nimble widget wrapper
                        var wrapper = tag === 'Input'
                            ? resolveInputWrapper(type)
                            : tag;

                        // Generate selector
                        alert(elem);
                        var target = new ss.Target(elem, {ignoreClasses: []});
                        target.disableConfig = true;
                        var selector = "(" + target.calculateSelector() + ")";

                        return 'this.' + wrapper + index + ' = new ' + wrapper + selector + ';';
                    } catch (ex) {
                        return 'Error while generating selector for ' + jqElem.html() + '. ' + ex + '\nStack:\n' + new Error().stack;
                    }
                }

                function toCamelCase(tag) {
                    return tag
                        ? tag.substring(0, 1).toUpperCase() + tag.substring(1, tag.length).toLowerCase()
                        : tag;
                }

                function resolveInputWrapper(typeAttr) {
                    var domToWrappers = {
                        'Button': 'Button',
                        'Submit': 'Button',
                        'Checkbox': 'Checkbox',
                        'Number': 'Input',
                        'Text': 'Input',
                        'Email': 'Input'
                    };
                    return domToWrappers[typeAttr] || 'Input';
                }
            }
    });
}

initInputElementGenerator();