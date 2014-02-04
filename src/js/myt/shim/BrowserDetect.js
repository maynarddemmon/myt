/** Based on browser detection from: http://www.quirksmode.org/js/detect.html
    
    Events:
        none
    
    Attributes:
        browser:string The browser name.
        version:number The browser version number.
        os:string The operating system.
*/
BrowserDetect = (function() {
    var versionSearchString,
        
        searchString = function(data) {
            var dataItem, i = data.length;
            while (i) {
                dataItem = data[--i];
                versionSearchString = dataItem.ver || dataItem.id;
                if ((dataItem.str && dataItem.str.indexOf(dataItem.sub) >= 0) || dataItem.prop) return dataItem.id;
            }
        },
        
        searchVersion = function(dataString) {
            var index = dataString.indexOf(versionSearchString);
            if (index >= 0) return parseFloat(dataString.substring(index + versionSearchString.length + 1));
        },
        
        userAgent = navigator.userAgent, 
        platform = navigator.platform, 
        unknown = 'UNKNOWN';
    
    return {
        browser:searchString([
            {str:userAgent,        sub:"OmniWeb", id:"OmniWeb",  ver:"OmniWeb/"},
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
        ]) || unknown,
    };
})();
