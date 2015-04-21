/**
 * @jsx React.DOM
 */

Utils = {};


Utils.quantize = function(d) {
	var d = Number(d);

	if(d >= 0 && d <= 0.2) {
		return {
			color: '#ff0000',
			label: 'Voldoet niet / slecht'
		}
	} else 
	if(d >= 0.2 && d <= 0.4) {
		return {
			color: '#FF9900',
			label: 'Ontoereikend'
		}
	} else 
	if(d >= 0.3 && d <= 0.6) {
		return {
			color: '#FFFF00',
			label: 'Matig / geel'			
		}
	} else 
	if(d >= 0.6 && d <= 0.8) {
		return {
			color: '#00CC00',
			label: 'Goed'
		}
	} else
	if(d >= 0.8 && d <= 1) {
		return {
			color: '#0000FF',
			label: 'Voldoet / zeer goed'
		}
	} else {
		return {
			color: '#ccc',
			label: '...'
		}
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