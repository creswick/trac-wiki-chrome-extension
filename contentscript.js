/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

function isTracWikiPage() {
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
        var x = links.item(i);
        if (x.type == "text/x-trac-wiki") {
            return true;
        }
    }
    return false;
}

if (isTracWikiPage()) {
    chrome.extension.sendRequest({}, function(response) {});
}
