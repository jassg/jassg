
var fs = require('fs');


function checkFileExtension(ext) {
	return ext=='md';
}

function Markdown() {
}
Markdown.prototype.getType = function() {
	return 'MARKDOWN';
};
Markdown.prototype.parse = function(node, callback) {
	fs.readFile(node.path+node.name, 'UTF-8', function (err, data) {
		if(err) {
			callback(err, null);
			return;
		}
		
		var metaBegin = data.indexOf('---'+"\n");
		var metaEnd = data.indexOf('---'+"\n", metaBegin+4);
		if(metaBegin != -1 && metaEnd != -1) {
			var meta = data.substr(metaBegin+4, metaEnd-5);
			var metaLines = meta.split("\n");
			
			for (var i in metaLines) {
				var pos = metaLines[i].indexOf(':');
				var key = metaLines[i].substr(0, pos).trim();
				var value = metaLines[i].substr(pos+1).trim();
				if(value.substr(0, 1) == '[') {
					value = this.parseArray(value);
				}
				
				if(key=='url') {
					node.setURL(value);
				}
				else if(key=='template') {
					node.template = value;
				}
				else {
					node.meta[key] = value;
				}
				
			}
			data = data.substr(metaEnd+5);
		}
		node.raw = data;
		callback(false, null);
	});
};
Markdown.prototype.parseArray = function(value) {
	value = value.substr(1, value.length-2);
	
	var ret = [];
	var isEscape = false;
	var isSingelQuote = true;
	var isDoubleQuote = true;
	
	var tmpVal = '';
	for(var i=0; i<value.length; i++) {
		if(tmpVal.trim().length==0) {
			if(value.charAt(i) == '"') {
				isDoubleQuote = true;
				continue;
			}
			else if(value.charAt(i) == "'") {
				isSingelQuote = true;
				continue;
			}
		}
		
		if(isEscape == true && ((value.charAt(i) == '"' && isDoubleQuote) || (value.charAt(i) == "'" && isSingelQuote))) {
			isDoubleQuote = false;
			isSingelQuote = false;
		}
		else if(isEscape == false && value.charAt(i) == '\\') {
			isEscape = true;
		}
		else if(isEscape == true) {
			isEscape = false;
			tmpVal = tmpVal.substr(0, tmpVal.length-1)+value.charAt(i);
			continue;
		}
		else if(value.charAt(i) == ',' && !isSingelQuote && !isDoubleQuote) {
			ret.push(tmpVal.trim());
		}
		else {
			tmpVal += value.charAt(i);
		}
	}
	if(tmpVal.trim().length>0) {
		ret.push(tmpVal.trim());
	}
	
	return ret;
};


module.exports.checkFileExtension = checkFileExtension;
module.exports.Format = Markdown;
