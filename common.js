TracExtension = {};
TracExtension.navShowing = function () {
    var st = TracExtension.globalState;
    switch (st.showPolicy) {
    case "no-controls":
        return !st.panelShowing;
    case "never":
        return false;
    case "always":
        return true;
    default:
        // should not get here
        return true;
    }
};
TracExtension.currentState = function () {
    return {
        navShowing: TracExtension.navShowing(),
        panelShowing: TracExtension.globalState.panelShowing
    };
};
TracExtension.cleanState = function (st) {
    var cleanState = {
        panelShowing: st.panelShowing ? true : false,
    };
    switch (st.showPolicy) {
    case "no-controls":
    case "never":
    case "always":
        cleanState.showPolicy = st.showPolicy;
        break;
    default:
        cleanState.showPolicy = "no-controls";
    };
    return cleanState;
}
TracExtension.saveState = function () {
    localStorage.globalState =
        JSON.stringify(TracExtension.cleanState(TracExtension.globalState));
};
TracExtension.modifyState = function (f) {
    f(TracExtension.globalState);
    TracExtension.saveState();
    TracExtension.updateOpenPages();
};
TracExtension.modifier = function (f) {
    return (function () {TracExtension.modifyState(f);});
};
TracExtension.togglePanel = TracExtension.modifier(
    function (s) {s.panelShowing = !s.panelShowing;}
);
TracExtension.updateOpenPages = function () {
    chrome.windows.getAll({populate:true}, function(ws) {
        var st = TracExtension.currentState();
        for (var i = 0; i < ws.length; i++) {
            var w = ws[i];
            for (var j = 0; j < w.tabs.length; j++) {
                var tij = w.tabs[j];
                chrome.tabs.sendRequest(tij.id, st, function (response) {});
            }
        }
    });
};
TracExtension.setChromePolicy = function (v) {
    TracExtension.modifyState(
        function (s) { s.showPolicy = v; }
    );
};
TracExtension.loadState = function () {
    try {
        TracExtension.globalState =
            TracExtension.cleanState(JSON.parse(localStorage.globalState));
    } catch (e) {
        TracExtension.globalState = {
            panelShowing: true,
            showPolicy: "no-controls"
        };
    }
};
TracExtension.loadState();