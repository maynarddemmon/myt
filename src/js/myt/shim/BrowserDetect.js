/** Based on browser detection from: http://www.quirksmode.org/js/detect.html
    
    Events:
        none
    
    Attributes:
        browser:string The browser name.
        version:number The browser version number.
        os:string The operating system.
*/
((pkg) => {
    var versionSearchString,
        
        searchString = (data) => {
            var dataItem, i = data.length;
            while (i) {
                dataItem = data[--i];
                versionSearchString = dataItem.ver || dataItem.id;
                if ((dataItem.str && dataItem.str.indexOf(dataItem.sub) >= 0) || dataItem.prop) return dataItem.id;
            }
        },
        
        searchVersion = (dataString) => {
            var index = dataString.indexOf(versionSearchString);
            if (index >= 0) return parseFloat(dataString.substring(index + versionSearchString.length + 1));
        },
        
        userAgent = navigator.userAgent, 
        platform = navigator.platform, 
        unknown = 'UNKNOWN',
        
        BrowserDetect = pkg.BrowserDetect = {
            browser:searchString([
                {prop:window.opera,                   id:"Opera",    ver:"Version"},
                {str:navigator.vendor, sub:"Apple",   id:"Safari",   ver:"Version"},
                {str:userAgent,        sub:"Firefox", id:"Firefox"},
                {str:userAgent,        sub:"Chrome",  id:"Chrome"},
                {str:userAgent,        sub:"MSIE",    id:"Explorer", ver:"MSIE"}
            ]) || unknown,
            
            version:searchVersion(userAgent) || searchVersion(navigator.appVersion) || unknown,
            
            os:searchString([
                {str:userAgent, sub:"iPhone", id:"iPhone/iPod"},
                {str:platform,  sub:"Linux",  id:"Linux"},
                {str:platform,  sub:"Mac",    id:"Mac"},
                {str:platform,  sub:"Win",    id:"Windows"}
            ]) || unknown
        },
        dom,
        pre;
    
    switch (BrowserDetect.browser) {
        case 'Chrome': case 'Safari': dom = 'WebKit'; break;
        case 'Explorer': dom = 'MS'; break;
        case 'Firefox': dom = 'Moz'; break;
        case 'Opera': dom = 'O'; break;
        default: dom = unknown; break;
    }
    pre = dom.toLowerCase();
    
    BrowserDetect.prefix = {
        dom:dom,
        lowercase:pre,
        css:'-' + pre + '-',
        js:pre[0].toUpperCase() + pre.substr(1)
    };
})(global);
