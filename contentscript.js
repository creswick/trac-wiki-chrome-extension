var TracExtension = {};

TracExtension.isWikiPage = function() {
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
        var x = links.item(i);
        if (x.type == "text/x-trac-wiki") {
            return true;
        }
    }
    return false;
};

TracExtension.isWikiEditPage = function() {
    var el = document.getElementById('edit');
    var el1;
    if ((el !== null) && (el.tagName == 'FORM')) {
        el1 = document.getElementById('text');
        if ((el1 !== null) &&
            (el1.tagName == 'TEXTAREA') &&
            (el1.className == 'wikitext')) {
            return (el1 == el['text']);
        }
    }
    return false;
};

// The actions that can be performed on each kind of Trac page
//
// XXX: this only allows one action per page type, when there might
// reasonably be more than one, such as preview/submit/cancel on the
// wiki edit page.
TracExtension.pageTypes = [
    {
        name: 'view',
        title: 'Edit wiki page',
        detect: TracExtension.isWikiPage,
        action: function () {
            var new_url = document.location.href.replace(/[?#].*/, '') + '?action=edit';
            document.location.href = new_url;
        },
        init: function () {
        }
    },
    {
        name: 'edit',
        title: 'Submit changes',
        detect: TracExtension.isWikiEditPage,
        action: function () {
            var el = document.getElementById('edit');
            el.submit();
        },
        init: function () {
            var buttonDiv = document.createElement('div');
            var tracIcon = document.createElement("img");
            tracIcon.src = chrome.extension.getURL("trac_icon_16x16.png");
            tracIcon.style.paddingRight = "0.25em";
            tracIcon.style.verticalAlign = "middle";
            buttonDiv.appendChild(tracIcon);
            buttonDiv.appendChild(document.createTextNode("Trac Edit"));
            buttonSpan = document.createElement("span");
            buttonSpan.paddingLeft = "5em";
            buttonDiv.appendChild(buttonSpan);
            function mkButton(name, label, icon) {
                var theButton = document.createElement('button');
                var theIcon = document.createElement('img');
                theIcon.src = chrome.extension.getURL(icon);
                theIcon.style.paddingRight = "0.25em";
                theIcon.style.verticalAlign = "middle";
                theButton.appendChild(theIcon);
                theButton.appendChild(document.createTextNode(label));
                theButton.onclick = function() {
                    var editForm = document.getElementById('edit');
                    editForm[name].click();
                };
                buttonSpan.appendChild(theButton);
            };
            mkButton('save', "Save", "page_save.png");
            mkButton('preview', "Preview", "page_white_magnify.png");
            mkButton('cancel', "Cancel", "cancel.png");

            var sty = buttonDiv.style;
            sty.position = "fixed";
            sty.right = "10px";
            sty.top = "0";
            sty.padding = "2px;";
            sty.border = "1px solid #ccc";
            sty.background = "white";
            document.body.appendChild(buttonDiv);
        }
    }
];

TracExtension.getPageType = function () {
    for (var i = 0; i < TracExtension.pageTypes.length; i++) {
        var act = TracExtension.pageTypes[i];
        if (act.detect()) {
            return act;
        }
    }
    return null;
};

TracExtension.pageType = TracExtension.getPageType();

(function () {
    if (TracExtension.pageType !== null) {
        // Alert the background page when the page action icon should be shown
        chrome.extension.sendRequest({}, function(response) {});

        TracExtension.pageType.init();

        // Perform the action when the page action icon is clicked
        chrome.extension.onRequest.addListener(TracExtension.pageType.action);
    }
})();
