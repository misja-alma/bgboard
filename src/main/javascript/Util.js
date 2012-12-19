function trim(s) {
	var l=0; var r=s.length -1;
	while(l < s.length && s[l] == ' ')
	{	l++; }
	while(r > l && s[r] == ' ')
	{	r-=1;	}
	return s.substring(l, r+1);
}


var indexOf = function(ar, p){
    for (var i = 0; i < ar.length; i++) {
        if (ar[i] == p) 
            return i;
    }
    return -1;
};

var stringToBytes = function(str){
    var ch, st, re = [];
    for (var i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i); // get char 
        st = []; // set up "stack"
        do {
            st.push(ch & 0xFF); // push byte to stack
            ch = ch >> 8; // shift value down by 1 byte
        }
        while (ch);
        // add stack contents to result
        // done because chars have "wrong" endianness
        re = re.concat(st.reverse());
    }
    // return an array of bytes
    return re;
};