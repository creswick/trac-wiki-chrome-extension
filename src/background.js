var run = function() {
  chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
      switch (request) {
      case 'reload':
        TracExtension.loadState();
        sendResponse(TracExtension.globalState);
        break;
      default:
        chrome.pageAction.show(sender.tab.id);
        sendResponse(TracExtension.currentState());
      }
    }
  );
  chrome.pageAction.onClicked.addListener(
    function(t) {
      TracExtension.togglePanel();
    });
};



// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded',
                          function () {
                            run();
                          });