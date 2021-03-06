var sbPrefWindow = {

    changed: false,

    init: function() {
        // init buttons
        document.documentElement.getButton("extra2").setAttribute("popup", "sbPrefPopup");
        
        // init highlight UI
        this.hlUpdateUI();

        // init keys UI and event handlers
        Array.prototype.forEach.call(document.getElementById("keysPane").getElementsByTagName("textbox"), function(elem){
            var shortcut = sbShortcut.fromString(elem.value);
            if (elem.getAttribute("preference") === "extensions.scrapbook.key.menubar") {
                if (shortcut.isPrintable) {
                    elem.value = shortcut.keyName;
                } else {
                    elem.value = "";
                }
            } else {
                if (shortcut.isComplete) {
                    elem.value = shortcut.getUIString();
                } else {
                    elem.value = "";
                }
            }
            elem.defaultValue = elem.value;
            var imgReset = document.createElement("image");
            imgReset.className = "shortcut reset";
            imgReset.addEventListener("click", sbPrefWindow.resetShortcut, true);
            elem.appendChild(imgReset);
            var imgDelete = document.createElement("image");
            imgDelete.addEventListener("click", sbPrefWindow.deleteShortcut, true);
            imgDelete.className = "shortcut delete";
            elem.appendChild(imgDelete);
            elem.addEventListener("keydown", sbPrefWindow.setShortcut, true);
        });
    },

    done: function() {
        if (!this.changed)
            return;
        sbDataSource.checkRefresh();
    },

    updateGroupedUI: function(aPrefName, aGroupName) {
        var enable = document.getElementById(aPrefName).value;
        var elts = document.getElementsByAttribute("group", aGroupName);
        Array.forEach(elts, function(elt) {
            elt.disabled = !enable;
        });
    },

    hlUpdateUI: function() {
        for (var num = 8; num > 0; num--) {
            var prefVal = sbCommonUtils.getPref("highlighter.style." + num, sbHighlighter.PRESET_STYLES[num]);
            sbHighlighter.decorateElement(document.getElementById("hlPrefLabel" + num), prefVal);
        }
    },

    hlCustomize: function(aNumber) {
        var ret = {index: aNumber};
        document.documentElement.openSubDialog(
            "chrome://scrapbook/content/hlCustom.xul", "modal,centerscreen,chrome", ret
        );
        if (ret.result == 1) this.changed = true;
        this.hlUpdateUI();
    },

    // for an element linked to preference
    // we need to set the preference element's value to get it stored to preference
    // modifying the element's value only changes the display effect
    setShortcut: function(event) {
        var elem = event.target;
        var shortcut = sbShortcut.fromEvent(event);
        var pref = elem.getAttribute("preference");
        var prefElem = document.getElementById(pref);
        if (pref === "extensions.scrapbook.key.menubar") {
            if (shortcut.isPrintable) {
                prefElem.value = shortcut.keyName;
            } else if (shortcut.isComplete) {
                prefElem.value = "";
            }
        } else {
            if (shortcut.isComplete) {
                prefElem.value = shortcut.toString();
                elem.value = shortcut.getUIString();
            }
        }
        event.preventDefault();
        event.stopPropagation();
    },

    resetShortcut: function(event) {
        var elem = event.target.parentNode;
        var pref = elem.getAttribute("preference");
        var prefElem = document.getElementById(pref);
        prefElem.value = elem.defaultValue;
    },

    deleteShortcut: function(event) {
        var elem = event.target.parentNode;
        var pref = elem.getAttribute("preference");
        var prefElem = document.getElementById(pref);
        prefElem.value = "";
    },

    exportPrefs: function() {
        var pickedFile = sbCommonUtils.showFilePicker({
            window: window,
            title: document.getElementById("sbPrefPopupExport").label,
            mode: 1, // modeSave
            filename: "scrapbook.prefs." + sbCommonUtils.getTimeStamp().substring(0, 8) + ".json",
            ext: "json",
            filters: [
                ["JSON files", "*.json"],
                0x1, // nsIFilePicker.filterAll
            ]
        });
        if (pickedFile) {
            var list = sbCommonUtils.getPrefKeys();
            var result = {};
            for (var i=0, I=list.length; i<I; ++i) {
                result[list[i]] = sbCommonUtils.getPref(list[i]);
            }
            sbCommonUtils.writeFile(pickedFile, JSON.stringify(result));
            return true;
        }
        return false;
    },
    
    importPrefs: function() {
        var pickedFile = sbCommonUtils.showFilePicker({
            window: window,
            title: document.getElementById("sbPrefPopupImport").label,
            mode: 0, // modeOpen
            ext: "json",
            filters: [
                ["JSON files", "*.json"],
                0x001, // nsIFilePicker.filterAll
            ]
        });
        if (pickedFile) {
            try {
                var data = sbCommonUtils.readFile(pickedFile, "UTF-8");
                var prefs = JSON.parse(data);
                for (var i in prefs) {
                    sbCommonUtils.setPref(i, prefs[i]);
                }
                sbCommonUtils.alert(sbCommonUtils.lang("MSG_UPDATE_PREFS"));
                return true;
            } catch(ex) {
                sbCommonUtils.alert(sbCommonUtils.lang("ERR_UPDATE_PREFS", ex));
                return false;
            }
        }
        return false;
    },
    
    resetPrefs: function() {
        try {
            sbCommonUtils.resetPrefs();
            sbCommonUtils.alert(sbCommonUtils.lang("MSG_UPDATE_PREFS"));
            return true;
        } catch(ex) {
            sbCommonUtils.alert(sbCommonUtils.lang("ERR_UPDATE_PREFS", ex));
            return false;
        }
    }
};


