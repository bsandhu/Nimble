addGenerator({
    'label': 'Custom',
    'generator': function (includeNested) {

        try {
            includeNested = includeNested || false;

            return $($0).find('div')
                .filter(function () {
                    return $(this).attr('Id') !== undefined;
                })
                .map(function (index, elem) {
                    jqElem = $(elem);
                    var tag = jqElem[0]['tagName'];
                    return "this." + tag + index + " = new MyDiv('#" + jqElem.attr('Id') + "');"
                })
                .get()
                .join('\n');
        } catch (e) {
            alert(e);
            console.error(e);
        }
    }
});

