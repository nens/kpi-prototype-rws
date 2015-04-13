/**
 * @jsx React.DOM
 */

Utils = {};


Utils.quantize = function(d) {
	var d = Number(d);
	if(d === 0) {
		return 'grey';
	} else
	if(d >= 0.1 && d <= 0.2) {
		return '#d73027';	
	} else 
	if(d >= 0.2 && d <= 0.3) {
		return '#f46d43';
	} else 
	if(d >= 0.3 && d <= 0.4) {
		return '#fdae61';
	} else 
	if(d >= 0.4 && d <= 0.5) {
		return '#fee08b';
	} else
	if(d >= 0.5 && d <= 0.6) {
		return '#ffffbf';
	} else
	if(d >= 0.6 && d <= 0.7) {
		return '#d9ef8b';
	} else
	if(d >= 0.7 && d <= 0.8) {
		return '#a6d96a';
	} else
	if(d >= 0.8 && d <= 0.9) {
		return '#66bd63';
	} else {
		return '#1a9850';
	}
};


Utils.truncate = function (fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr;
    
    separator = separator || '...';
    
    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);
    
    return fullStr.substr(0, frontChars) + 
           separator + 
           fullStr.substr(fullStr.length - backChars);
};


module.exports = Utils;