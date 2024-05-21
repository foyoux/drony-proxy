function getProxyTypeFromUrl(url, host){
    wpadLog("calling getProxyTypeFromUrl with " + url + " " + host);
    try{
        var response1 = FindProxyForURL(url, host);
        wpadLog("calling getProxyTypeFromUrl result " + response1);
        return response1;
    }catch(e){
        wpadLog("calling getProxyTypeFromUrl error " + e);
    }
    try{
        var response2 = FindProxyForURL(url);
        wpadLog("calling getProxyTypeFromUrl result " + response2);
        return response2;
    }catch(e){
        return "ERRROR " + e;
    }
}

// This function will return true if the hostname contains no dots, e.g. http://intranet
// Useful when applying exceptions for internal websites, e.g. 
// may not require resolution of a hostname to IP address to determine if local.
function isPlainHostName(host) {
    wpadLog("calling isPlainHostName with " + host);
    var test = host.indexOf('.') == -1;
    wpadLog("calling isPlainHostName result " + test);
    return test;
}

// Evaluates hostnames and returns true if hostnames match. 
// Used mainly to match and exception individual hostnames.

function dnsDomainIs(host, domain) {
    wpadLog("calling dnsDomainIs with " + host + " " + domain);
    var test = host.length >= domain.length && host.substring(host.length - domain.length) == domain;
    wpadLog("calling dnsDomainIs result " + test);
    return test;
}


// This function evaluates the IP address of a hostname, 
// and if within a specified subnet returns true. 
// If a hostname is passed the function will resolve the hostname to an IP address.
function isInNet(ipaddr, pattern, maskstr) {
    wpadLog("calling isInNet with " + ipaddr + " " + pattern + " " + maskstr);
    var test = /^(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})$/.exec(ipaddr);
    if (test == null) {
        ipaddr = dnsResolve(ipaddr);
        if (ipaddr == null)
            return false;
    } else if (test[1] > 255 || test[2] > 255 || 
               test[3] > 255 || test[4] > 255) {
        return false;    // not an IP address
    }
    var host = convert_addr(ipaddr);
    var pat  = convert_addr(pattern);
    var mask = convert_addr(maskstr);
    return ((host & mask) == (pat & mask));
}


// Returns the IP address of the host machine.
function myIpAddress(){
    wpadLog("calling myIpAddress");
    return "" + myIpAddressNative();
}

//Returns the IP address of the host machine.
function myIpAddressEx(){
    wpadLog("calling myIpAddressEx");
    return "" + myIpAddressExNative();
}

// Resolves hostnames to an IP address
function dnsResolve(host){
    wpadLog("calling dnsResolve with " + host);
    return "" + dnsResolveNative(host);
}

//Resolves hostnames to an IP address
function dnsResolveEx(host){
    wpadLog("calling dnsResolveEx with " + host);
    return "" + dnsResolveExNative(host);
}

function localHostOrDomainIs(host, hostdom) {
    wpadLog("calling localHostOrDomainIs with " + host + " " + hostdom);
    return (host == hostdom) ||
           (hostdom.lastIndexOf(host + '.', 0) == 0);
}

// Attempts to resolve a hostname to an IP address and returns true if successful. 
// WARNING – This may cause a browser to temporarily hang if a domain isn’t resolvable.
function isResolvable(host) {
    wpadLog("calling isResolvable with " + host);
    var ip = dnsResolve(host);
    return (ip != null);
}

// This function returns the number of DNS domain levels (number of dots) in the hostname. 
// Can be used to exception internal websites which use short DNS names, e.g. http://intranet
function dnsDomainLevels(host) {
    wpadLog("calling dnsDomainLevels with " + host);
    return host.split('.').length-1;
}

function convert_addr(ipchars) {
  wpadLog("calling convert_addr with " + ipchars);
  var bytes = ipchars.split('.');
  var result = ((bytes[0] & 0xff) << 24) |
               ((bytes[1] & 0xff) << 16) |
               ((bytes[2] & 0xff) <<  8) |
                (bytes[3] & 0xff);
  return result;
}

var wdays = {SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6};

var months = {JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11};

function weekdayRange() {
    wpadLog("calling weekdayRange");
    function getDay(weekday) { 
        if (weekday in wdays) { 
            return wdays[weekday]; 
        } 
        return -1; 
    } 
    var date = new Date(); 
    var argc = arguments.length; 
    var wday; 
    if (argc < 1) 
        return false; 
    if (arguments[argc - 1] == 'GMT') { 
        argc--; 
        wday = date.getUTCDay(); 
    } else { 
        wday = date.getDay(); 
    } 
    var wd1 = getDay(arguments[0]); 
    var wd2 = (argc == 2) ? getDay(arguments[1]) : wd1; 
    return (wd1 == -1 || wd2 == -1) ? false 
                                    : (wd1 <= wday && wday <= wd2); 
} 
 
function dateRange() {
    wpadLog("calling dateRange");
    function getMonth(name) { 
        if (name in months) { 
            return months[name]; 
        } 
        return -1; 
    } 
    var date = new Date(); 
    var argc = arguments.length; 
    if (argc < 1) { 
        return false; 
    } 
    var isGMT = (arguments[argc - 1] == 'GMT'); 
 
    if (isGMT) { 
        argc--; 
    } 
    // function will work even without explict handling of this case 
    if (argc == 1) { 
        var tmp = parseInt(arguments[0]); 
        if (isNaN(tmp)) { 
            return ((isGMT ? date.getUTCMonth() : date.getMonth()) == getMonth(arguments[0])); 
        } else if (tmp < 32) { 
            return ((isGMT ? date.getUTCDate() : date.getDate()) == tmp); 
        } else {  
            return ((isGMT ? date.getUTCFullYear() : date.getFullYear()) == tmp); 
        } 
    } 
    var year = date.getFullYear(); 
    var date1, date2; 
    date1 = new Date(year,  0,  1,  0,  0,  0); 
    date2 = new Date(year, 11, 31, 23, 59, 59); 
    var adjustMonth = false; 
    for (var i = 0; i < (argc >> 1); i++) { 
        var tmp = parseInt(arguments[i]); 
        if (isNaN(tmp)) { 
            var mon = getMonth(arguments[i]); 
            date1.setMonth(mon); 
        } else if (tmp < 32) { 
            adjustMonth = (argc <= 2); 
            date1.setDate(tmp); 
        } else { 
            date1.setFullYear(tmp); 
        } 
    } 
    for (var i = (argc >> 1); i < argc; i++) { 
        var tmp = parseInt(arguments[i]); 
        if (isNaN(tmp)) { 
            var mon = getMonth(arguments[i]); 
            date2.setMonth(mon); 
        } else if (tmp < 32) { 
            date2.setDate(tmp); 
        } else { 
            date2.setFullYear(tmp); 
        } 
    } 
    if (adjustMonth) { 
        date1.setMonth(date.getMonth()); 
        date2.setMonth(date.getMonth()); 
    } 
    if (isGMT) { 
    var tmp = date; 
        tmp.setFullYear(date.getUTCFullYear()); 
        tmp.setMonth(date.getUTCMonth()); 
        tmp.setDate(date.getUTCDate()); 
        tmp.setHours(date.getUTCHours()); 
        tmp.setMinutes(date.getUTCMinutes()); 
        tmp.setSeconds(date.getUTCSeconds()); 
        date = tmp; 
    } 
    return ((date1 <= date) && (date <= date2)); 
} 
 
function timeRange() {
    wpadLog("calling timeRange");
    var argc = arguments.length; 
    var date = new Date(); 
    var isGMT= false; 
 
    if (argc < 1) { 
        return false; 
    } 
    if (arguments[argc - 1] == 'GMT') { 
        isGMT = true; 
        argc--; 
    } 
 
    var hour = isGMT ? date.getUTCHours() : date.getHours(); 
    var date1, date2; 
    date1 = new Date(); 
    date2 = new Date(); 
 
    if (argc == 1) { 
        return (hour == arguments[0]); 
    } else if (argc == 2) { 
        return ((arguments[0] <= hour) && (hour <= arguments[1])); 
    } else { 
        switch (argc) { 
        case 6: 
            date1.setSeconds(arguments[2]); 
            date2.setSeconds(arguments[5]); 
        case 4: 
            var middle = argc >> 1; 
            date1.setHours(arguments[0]); 
            date1.setMinutes(arguments[1]); 
            date2.setHours(arguments[middle]); 
            date2.setMinutes(arguments[middle + 1]); 
            if (middle == 2) { 
                date2.setSeconds(59); 
            } 
            break; 
        default: 
          throw 'timeRange: bad number of arguments' 
        } 
    } 
 
    if (isGMT) { 
        date.setFullYear(date.getUTCFullYear()); 
        date.setMonth(date.getUTCMonth()); 
        date.setDate(date.getUTCDate()); 
        date.setHours(date.getUTCHours()); 
        date.setMinutes(date.getUTCMinutes()); 
        date.setSeconds(date.getUTCSeconds()); 
    } 
    return ((date1 <= date) && (date <= date2)); 
}

// Will attempt to match hostname or URL 
// to a specified shell expression, and returns true if matched.
function shExpMatch(url_input, pattern) {
    wpadLog("calling shExpMatch with " + url_input + " " + pattern);
    var url = url_input + "";
    var pCharCode;
    var isAggressive = false;
    var pIndex;
    var urlIndex = 0;
    var lastIndex;
    var patternLength = pattern.length;
    var urlLength = url.length;
    for (pIndex = 0; pIndex < patternLength; pIndex += 1) {
        pCharCode = pattern.charCodeAt(pIndex); // use charCodeAt for performance, see http://jsperf.com/charat-charcodeat-brackets
        if (pCharCode === 63) { // use if instead of switch for performance, see http://jsperf.com/switch-if
            if (isAggressive) {
                urlIndex += 1;
            }
            isAggressive = false;
            urlIndex += 1;
        }
        else if (pCharCode === 42) {
            if (pIndex === patternLength - 1) {
                var test = urlIndex <= urlLength;
                wpadLog("calling shExpMatch with result " + test);
                return test;
            }
            else {
                isAggressive = true;
            }
        }
        else {
            if (isAggressive) {
                lastIndex = urlIndex;
                urlIndex = url.indexOf(String.fromCharCode(pCharCode), lastIndex + 1);
                if (urlIndex < 0) {
                    if (url.charCodeAt(lastIndex) !== pCharCode) {
                        wpadLog("calling shExpMatch with result false");
                        return false;
                    }
                    urlIndex = lastIndex;
                }
                isAggressive = false;
            }
            else {
                if (urlIndex >= urlLength || url.charCodeAt(urlIndex) !== pCharCode) {
                    wpadLog("calling shExpMatch with result false");
                    return false;
                }
            }
            urlIndex += 1;
        }
    }
    var test = urlIndex === urlLength;
    wpadLog("calling shExpMatch with result " + test);
    return test;
}

/*
    This API sorts a list of IP addresses
    IpAddressList - semi-colon delimited string containing IP addresses. 
    Returns a list of sorted semi-colon delimited IP addresses or an empty string if unable to sort the IP Address list.
    FindProxyforURLEx implementers should add code that breaks the string of semi-colon delimited IP addresses into separate addresses. 
 */
function sortIpAddressList(){
    wpadLog("calling sortIpAddressList");
    return window.JSInterface.sortIpAddressList();
}
/*
    Determines if an IP address is in a specific subnet.
    IPaddress – string containing IPv6/IPv4 addresses
    IPprefix – string containing colon delimited IP prefix with top n bits specified in the bit field (i.e. 3ffe:8311:ffff::/48 or 123.112.0.0/16). 
    Returns TRUE if the host is in the same subnet and FALSE otherwise.
    Also returns FALSE if prefix is not in the correct format or if addresses and prefixes of different types are used in the comparison (i.e. IPv4 prefix and an IPv6 address).
    Examples:
    isInNetEx(host, "198.95.249.79/32")
        is true iff the IP address of host matches exactly 198.95.249.79. 
    isInNetEx(host, "198.95.0.0/16")
        is true iff the IP address of the host matches 198.95.*.*. 
    isInNetEx(host, "3ffe:8311:ffff/48")
        is true iff the IP address of the host matches 3ffe:8311:fff:*:*:*:*:*  
*/
function isInNetEx(ipaddr, pattern){
    wpadLog("calling isInNetEx with " + ipaddr + " " + pattern);
    return window.JSInterface.isInNetEx();
}

function getClientVersion(){
    return "1.1";
}