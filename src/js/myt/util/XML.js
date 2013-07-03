/** XML utility functions. */
myt.XML = {
    // Attributes //////////////////////////////////////////////////////////////
    MSXML: [
        "Microsoft.XMLDOM",
        "Msxml2.DOMDocument.3.0",
        "Msxml2.DOMDocument.6.0"
    ],
    
    XML_ESCAPES: {
        '<':'&lt;',
        '>':'&gt;',
        '&':'&amp;',
        '"':'&quot;',
        "'":'&apos;'
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    xmlEscape: function(text) {
        var XML_ESCAPES = this.XML_ESCAPES;
        return s.replace(/[<>&"']/g, function (ch) {
            return XML_TEXT_ESCAPES[ch];
        });
    },
    
    newDoc: function() {
        if (document.implementation && document.implementation.createDocument) {
            return document.implementation.createDocument('', '', null);
        } else if (window.ActiveXObject) {
            var msxml = this.MSXML, i = msxml.length;
            while (i) {
                try {
                    return new ActiveXObject(msxml[--i]);
                } catch (err) {
                    console.error(err.stack || err.stacktrace);
                }
            }
        }
        return null;
    },
    
    parse: function(text) {
        if (!text || typeof text !== "string") return null;
        
        try {
            if (window.DOMParser) {
                var parser = new DOMParser();
                return parser.parseFromString(text , "text/xml");
            } else {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(text);
                return xmlDoc;
            }
        } catch(e) {
            return null;
        }
    },
    
    serialize: function(xmlNode) {
        if (xmlNode) {
            if (window.XMLSerializer) {
                return (new XMLSerializer()).serializeToString(xmlNode);
            } else if (xmlNode.xml) {
                return xmlNode.xml;
            }
        }
        return "";
    },
    
    createElement: function(xmlDoc, name, attrs, children) {
        var elem = xmlDoc.createElement(name);
        if (attrs) {
            for (var k in attrs) elem.setAttribute(k, attrs[k]);
        }
        if (children) {
            for (var i = 0, len = children.length; len > i; ++i) {
                elem.appendChild(children[i]);
            }
        }
        return elem;
    },
    
    createTextNode: function(xmlDoc, text) {
        return xmlDoc.createTextNode(text);
    },
    
    removeAllChildren: function(elem) {
        var fc = elem.firstChild;
        while (fc) {
            elem.removeChild(fc);
            fc = elem.firstChild;
        }
    },
    
    setChildNodes: function(elem, children) {
        this.removeAllChildren(elem);
        if (children) {
            for (var i = 0, len = children.length; len > i; ++i) {
                elem.appendChild(children[i]);
            }
        }
    }
};
