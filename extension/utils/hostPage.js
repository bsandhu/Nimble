/**
 * Run JS function on the App under test.
 * Note: Normally the extension does not have access to JS executing in the App under test.
 * @see: http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script
 */
function runScriptInHostPage(codeToRun) {
    try {
        var script = document.createElement('script');
        script.textContent = '(' + codeToRun + ')();';
        Nimble.log('Executing script on Page under test: ' + script.textContent);
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    } catch (ex) {
        alert('Failed to execute script: ' + ex);
    }
}