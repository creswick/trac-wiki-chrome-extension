var TracExtension = {};

TracExtension.parseClasses = function(s) {
  return s.split(/\s+/);
};

TracExtension.hasClass = function(n, c) {
  var classes = TracExtension.parseClasses(n.className);
  for (var i = 0; i < classes.length; i++) {
    if (classes[i] == c) {
      return true;
    }
  }
  return false;
};

TracExtension.findFirstLink = function(p) {
  var links = document.getElementsByTagName('link');
  for (var i = 0; i < links.length; i++) {
    var x = links.item(i);
    if (p(x)) {
      return x;
    }
  }
  return null;
};

TracExtension.isWikiPage = function() {
  var l = TracExtension.findFirstLink(
      function(x) {return x.type == 'text/x-trac-wiki';}
      );
  return l !== null;
};

TracExtension.getStartLink = function() {
  var l = TracExtension.findFirstLink(
      function(x) {return x.rel == 'start';}
      );
  return (l !== null) ? l.href : null;
};

TracExtension.isWikiEditPage = function() {
  var el = document.getElementById('edit');
  var el1;
  if ((el !== null) && (el.tagName == 'FORM')) {
    el1 = document.getElementById('text');
    if ((el1 !== null) &&
            (el1.tagName == 'TEXTAREA') &&
            TracExtension.hasClass(el1, 'wikitext')) {
      return (el1 == el['text']);
    }
  }
  return false;
};

TracExtension.setNavDisplay = function(d) {
  var ids = ['topbar', 'mainnav', 'banner'];
  for (var i = 0; i < ids.length; i++) {
    var elt = document.getElementById(ids[i]);
    if (elt) {
      elt.style.display = d;
    }
  }
};

TracExtension._buttonPanel = null;
TracExtension.createButtonPanel = function(buttons) {
  // Already initialized
  if (TracExtension._buttonPanel !== null) {
    return TracExtension._buttonPanel;
  }
  var start = TracExtension.getStartLink();
  var buttonDiv = document.createElement('div');
  var container = document.createElement('div');
  TracExtension._buttonPanel = container;
  container.appendChild(buttonDiv);
  var startLink = document.createElement('a');
  var tracIcon = document.createElement('img');
  tracIcon.src = chrome.extension.getURL('trac_icon_16x16.png');
  tracIcon.style.paddingRight = '0.25em';
  tracIcon.style.verticalAlign = 'middle';
  startLink.appendChild(tracIcon);
  startLink.appendChild(document.createTextNode('Trac Wiki'));
  if (start) {
    startLink.href = start;
  }
  buttonDiv.appendChild(startLink);
  buttonDiv.style.position = 'relative';
  buttonDiv.style.right = '0';
  buttonSpan = document.createElement('span');
  buttonSpan.id = 'trac-extension-button-panel';
  buttonSpan.style.paddingLeft = '0.5em';
  buttonDiv.appendChild(buttonSpan);
  function mkButton(b) {
    var theButton = document.createElement('button');
    var theIcon = document.createElement('img');
    theIcon.src = chrome.extension.getURL(b.icon);
    theIcon.style.paddingRight = '0.25em';
    theIcon.style.verticalAlign = 'middle';
    theButton.appendChild(theIcon);
    theButton.appendChild(document.createTextNode(b.label));
    theButton.onclick = b.action;
    buttonSpan.appendChild(theButton);
  };
  for (var i = 0; i < buttons.length; i++) {
    mkButton(buttons[i]);
  }
  var sty = container.style;
  sty.position = 'fixed';
  sty.right = '10px';
  sty.top = '0';
  sty.padding = '2px;';
  sty.border = '1px solid #ccc';
  sty.background = 'white';
  document.body.appendChild(container);
  return container;
};

TracExtension.clickEditButton = function(name) {
  return (function() {
    var e = document.getElementById('edit');
    e[name].click();
  });
};

TracExtension.goToEditPage = function() {
  var new_url = document.location.href.replace(/[?#].*/, '') + '?action=edit';
  document.location.href = new_url;
};

TracExtension.findTOC = function() {
  var tocs = document.getElementsByTagName('div');
  for (var i = 0; i < tocs.length; i++) {
    if (TracExtension.hasClass(tocs[i], 'wiki-toc')) {
      return tocs[i];
    }
  }
  return null;
};

TracExtension.goToViewPage = function() {
  var new_url = document.location.href.replace(/[?#].*/, '');
  document.location.href = new_url;
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
    action: TracExtension.goToEditPage,
    init: function() {
      var buttons = [
        { action: TracExtension.goToEditPage,
          label: 'Edit',
          icon: 'page_white_edit.png'
        }
      ];
      if (document.location.href.match(/\bversion=\d/)) {
        buttons.push(
            { action: TracExtension.goToViewPage,
              label: 'Current Version',
              icon: 'page_white.png'
            }
        );
      }
      var p = TracExtension.createButtonPanel(buttons);
      var toc = TracExtension.findTOC();
      if (toc) {
        toc.parentNode.removeChild(toc);
        p.appendChild(toc);
      }
    }
  },
  {
    name: 'edit',
    title: 'Submit changes',
    detect: TracExtension.isWikiEditPage,
    action: TracExtension.clickEditButton('save'),
    init: function() {
      var b = function(name, label, icon) {
                return { action: TracExtension.clickEditButton(name),
                         label: label,
                         icon: icon
                       };
      };
      TracExtension.createButtonPanel([
        b('save', 'Save', 'page_save.png'),
        b('preview', 'Preview', 'page_white_magnify.png'),
        b('cancel', 'Cancel', 'cancel.png')
      ]);
    }
  }
];

TracExtension.getPageType = function() {
  for (var i = 0; i < TracExtension.pageTypes.length; i++) {
    var act = TracExtension.pageTypes[i];
    if (act.detect()) {
      return act;
    }
  }
  return null;
};

TracExtension.pageType = TracExtension.getPageType();

TracExtension.setButtonPanelShowing = function(t) {
  var p = TracExtension._buttonPanel;
  if (p !== null) {
    p.style.display = t ? '' : 'none';
  }
};

TracExtension.switchMode = function(t) {
  TracExtension.setButtonPanelShowing(t.panelShowing);
  TracExtension.setNavDisplay(t.navShowing ? '' : 'none');
};

(function() {
  if (TracExtension.pageType !== null) {
    TracExtension.pageType.init();

    // Alert the background page when the page action icon should be shown
    chrome.extension.sendRequest({}, TracExtension.switchMode);

    // Perform the action when the page action icon is clicked
    chrome.extension.onRequest.addListener(function(req) {
      TracExtension.switchMode(req);
    });
  }
})();
