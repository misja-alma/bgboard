"use strict";

CENTERED_CUBE = 3;

GAMESTATE_NOGAMESTARTED = 0;
GAMESTATE_PLAYING = 1;
GAMESTATE_GAMEOVER = 2;
GAMESTATE_RESIGNED = 3;
GAMESTATE_ENDBYCUBEDROP = 4;

RESIGNATION_NONE = 0;
RESIGNATION_SINGLE = 1;
RESIGNATION_GAMMON = 2;
RESIGNATION_BACKGAMMON = 3;

DIE_NONE = 0;

// tables used by match- and positionId code
base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
positions = new Array(2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 0, 1, 22, 23, 8, 9, 10, 11, 16, 17, 18, 19, 20, 21);

createInitialPosition = function(){
    var position = new PositionRecord();
    position.setNrCheckersOnPoint(0, 6, 5);
    position.setNrCheckersOnPoint(0, 8, 3);
    position.setNrCheckersOnPoint(0, 13, 5);
    position.setNrCheckersOnPoint(0, 24, 2);
    
    position.setNrCheckersOnPoint(1, 6, 5);
    position.setNrCheckersOnPoint(1, 8, 3);
    position.setNrCheckersOnPoint(1, 13, 5);
    position.setNrCheckersOnPoint(1, 24, 2);
    
    position.matchScore = [0, 0];
    position.cubeOwner = 3;
    position.playerOnRoll = 1;
    position.cubeValue = 1;
	position.gameState = GAMESTATE_NOGAMESTARTED;
    return position;
}

/**
 * Returns a position with all checkers off for both players
 *
 * @return a valid PositionRecord
 */
createFinalPosition = function(){
    var position = new PositionRecord();
    position.setNrCheckersOnPoint(0, 0, 15);
    position.setNrCheckersOnPoint(1, 0, 15);
    position.matchScore = [0, 0];
    position.cubeOwner = 3;
    position.playerOnRoll = 1;
    position.cubeValue = 1;
    return position;
}


/**
 * Utility method
 * Note: bitString[0] is the least important bit.
 *
 * @param bitString[]
 * @param start the position at which the substring starts
 * @param end the first bit that is not part of the substring anymore; end > start
 * @return the accumulated value of the bitRange
 */
bitSubString = function(bitString, start, end){
    var result = bitString[--end];
    while (start < end) {
        result = 2 * result + bitString[--end];
    }
    return result;
}

putIntoBitString = function(bitString, value, start, end){
    var pos = start;
    var mask = 1;
    while (pos <= (end - 1)) {
        bitString[pos] = (value & mask) / mask;
        mask = mask * 2;
        pos++;
    }
}

function PositionRecord(){
    this.checkers; // [][] index 0 is the player: 0 or 1. Index 1 counts the points
    this.playerOnRoll; // or the player that did roll
    this.cubeValue;
    this.cubeOwner; // 3 = centered cube
    this.crawford;
    this.gameState; //0=no game started; 1 = playing a game; 2 = game over; 3 = resigned; 4 = end by cube drop
    this.decisionTurn; // matters when cube is offered
    this.cubeOffered;
    this.resignation; // 0 = no resignation; 1 = resign single; 2= resign gammon; 3 = resign bg
    this.die1; // 0 means no dice was rolled; 7 can be used for this as well.
    this.die2;
    this.matchLength;
    this.matchScore; // []
    // the following fields are the only ones which are not present in the match/posId
    this.player1Name;
    this.player2Name;
	
	this.setDefaultValues();
}

PositionRecord.prototype.decodeChar = function(character){
    var info = new Object();
    if (character == "-") {
        info.player = -1;
        info.nrCheckers = 0;
		return info;
    }
    var ch = base64.indexOf(character);
    
    if (ch >= 26) {
        info.player = 1;
        info.nrCheckers = ch - 26 + 1;
    }
    else {
        info.player = 0;
        info.nrCheckers = ch + 1;
    }
    return info;
}

PositionRecord.prototype.setDefaultValues = function() {
	this.checkers = []; // 2, 26
    this.checkers[0] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.checkers[1] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.matchScore = [0,0];
    this.playerOnRoll; // or the player that did roll
    this.cubeValue = 1;
    this.cubeOwner = CENTERED_CUBE; 
    this.crawford = false;
    this.gameState = GAMESTATE_PLAYING; 
    this.decisionTurn; // matters when cube is offered
    this.cubeOffered = false;
    this.resignation = RESIGNATION_NONE; 
    this.die1 = DIE_NONE;
    this.die2 = DIE_NONE;
    this.matchLength = 0;
    this.matchScore = [0,0]; 
    this.player1Name;
    this.player2Name;
}

PositionRecord.prototype.initializeFromXGId = function(xgId){
	xgId = trim(xgId);
    this.setDefaultValues();
    
    this.checkers[1][25] = this.decodeChar(xgId.charAt(0)).nrCheckers;
    
    for (var i = 1; i < 25; i++) {
        var checkersAtPoint = this.decodeChar(xgId.charAt(i));
        if (checkersAtPoint.player != -1) {       
            var adjustedPoint = checkersAtPoint.player == 1 ? 25 - i : i;
            this.checkers[checkersAtPoint.player][adjustedPoint] = checkersAtPoint.nrCheckers;
        }
    }
    this.checkers[0][25] = this.decodeChar(xgId.charAt(25)).nrCheckers;
    
    var charPos = 27;
    var nextAttributePos = charPos;
    while (xgId.charAt(nextAttributePos) != ":") {
        nextAttributePos++;
    }
    var cubeLevel = xgId.substring(charPos, nextAttributePos);
    this.cubeValue = Math.pow(2, cubeLevel);
    
    charPos = nextAttributePos + 1;
    nextAttributePos = charPos;
    while (xgId.charAt(nextAttributePos) != ":") {
        nextAttributePos++;
    }
    var rawCubeOwner = xgId.substring(charPos, nextAttributePos);
	if (rawCubeOwner == 0) {
		this.cubeOwner = CENTERED_CUBE;
	}
	else {
		this.cubeOwner = rawCubeOwner == 1 ? 0 : 1;
	}
    
    charPos = nextAttributePos + 1;
    nextAttributePos = charPos;
    while (xgId.charAt(nextAttributePos) != ":") {
        nextAttributePos++;
    }
    var rawPlayerOnRoll = xgId.substring(charPos, nextAttributePos);
	this.playerOnRoll = rawPlayerOnRoll == 1? 0: 1;
    
	charPos = nextAttributePos + 1;
    nextAttributePos = charPos;
    while (xgId.charAt(nextAttributePos) != ":") {
        nextAttributePos++;
    }
	var rawDice = xgId.substring(charPos, nextAttributePos);
	if(rawDice == "00") {
		this.die1 = DIE_NONE;
		this.die2 = DIE_NONE;	
		this.decisionTurn = this.playerOnRoll;		
	} else if(rawDice == "D") {
		this.die1 = DIE_NONE;
		this.die2 = DIE_NONE;	
		this.decisionTurn = this.playerOnRoll == 0? 1: 0;
		this.cubeOffered = true;
	} // No option yet for double/ beaver/ raccoon (B, R)
	else {
		this.die1 = parseInt(rawDice[0]);
		this.die2 = parseInt(rawDice[1]);	
		this.decisionTurn = this.playerOnRoll;		
	}
    
	charPos = nextAttributePos + 1;
    nextAttributePos = charPos;
    while (xgId.charAt(nextAttributePos) != ":") {
        nextAttributePos++;
    }
	var rawScore = xgId.substring(charPos, nextAttributePos);
	this.matchScore[0] = parseInt(rawScore);
		
	charPos = nextAttributePos + 1;
    nextAttributePos = charPos;
    while (xgId.charAt(nextAttributePos) != ":") {
        nextAttributePos++;
    }
	rawScore = xgId.substring(charPos, nextAttributePos);
	this.matchScore[1] = parseInt(rawScore);
		
	charPos = nextAttributePos + 1;
    nextAttributePos = charPos;
    while (xgId.charAt(nextAttributePos) != ":") {
        nextAttributePos++;
    }
	var rawGameRules = xgId.substring(charPos, nextAttributePos);
	// TODO jacoby, beaver
	this.crawford = rawGameRules == 1;
	
	charPos = nextAttributePos + 1;
    nextAttributePos = charPos;
    while (xgId.charAt(nextAttributePos) != ":") {
        nextAttributePos++;
    }
	this.matchLength = parseInt(xgId.substring(charPos, nextAttributePos));
	if(this.matchLength == 0) {
		this.crawFord = false;
	}
	// maxcube is not used
}

/**
 * Intitializes the position record with the data stored in the both id's.
 *
 * @param posId the gnu position id
 * @param matchId the gnu match id
 */
PositionRecord.prototype.initializeFromId = function(posId, matchId){
	posId = trim(posId);
	matchId = trim(matchId);
	
	this.setDefaultValues();
	
    // first we need to know if player zero or player one is on roll. So dissect the matchId first
    this.dissectMatchId(matchId);
    
    // dissect the position id
    var bytes = stringToBytes(posId);
    var nrPlayersCounted = 0;
    var player = this.playerOnRoll;
    var point = 1;
    var nrOnPoint = 0;
    var ready = false;
    // create a normalized bitstring first
    var bits = base64ToBits(posId, 160);
    
    for (var c = 0; c < bits.length && !ready; c++) {
        if (bits[c] != 1) {
            // a zero marks the end of a point
            this.checkers[player][point] = nrOnPoint;
            nrOnPoint = 0;
            
            if (point >= 25) {
                nrPlayersCounted++;
                // calculate nr of checkers on point 0;
                var nrOff = 15;
                for (var i = 1; i < 26; i++) {
                    nrOff -= this.checkers[player][i];
                }
                this.checkers[player][0] = nrOff;
                
                if (nrPlayersCounted == 2) {
                    ready = true;
                }
                else {
                    player = (~ player) & 1; // player := not player
                    point = 1;
                }
            }
            else {
                point++;
            }
        }
        else {
            nrOnPoint++;
        }
    }
}

/**
 * Convenience method.
 *
 * @param onlyMeaningfulDoubles If true, doubles semi DMP scores are not counted as possible
 * @return true if the player with the decisionturn had the cube and the matchscore made doubling possible
 */
PositionRecord.prototype.isDoublePossible = function(onlyMeaningfulDoubles){
    if (this.gameState != GAMESTATE_PLAYING) {
        return false;
    }
    if (this.decisionTurn != this.playerOnRoll) {
        return false;
    }
    if (this.cubeOwner != CENTERED_CUBE && this.cubeOwner != this.playerOnRoll) {
        return false;
    }
    if (this.isCrawford()) {
        return false;
    }
    
    if (!this.onlyMeaningfulDoubles) {
        return true;
    }
    else {
        if (this.matchScore[0] + this.cubeValue >= this.matchLength || this.matchScore[1] + this.cubeValue >= this.matchLength) {
            return false;
        }
        else {
            return true;
        }
    }
}

/**
 * Convenience method.
 *
 * @return true if at least 1 die has a value
 */
PositionRecord.prototype.haveDiceBeenRolled = function(){
    if ((this.die1 != 0) && (this.die1 != 7)) 
        return true;
    if ((this.die2 != 0) && (this.die2 != 7)) 
        return true;
    return false;
}

/**
 * Parses the checkerplay string and move the checkers as specified in the move
 * checkerplays are supposed to look like '4/2 2/off 2/off 2/off' (for a 22)
 *
 * @param checkerPlay
 */
PositionRecord.prototype.moveCheckers = function(playerToMove, checkerPlay){
    checkerPlay = trim(checkerPlay);
    
    if (checkerPlay.length() == 0) {
        return; // no move
    }
    
    var pos = 0;
    while (pos < checkerPlay.length()) {
        var nextSpace = checkerPlay.indexOf(' ', pos);
        if (nextSpace == -1) {
            // last move
            moveOneChecker(playerToMove, checkerPlay.substring(pos));
            break;
        }
        else {
            moveOneChecker(playerToMove, checkerPlay.substring(pos, nextSpace));
            pos = nextSpace + 1;
        }
    }
}

PositionRecord.prototype.moveOneChecker = function(playerToMove, checkerPlay){
    var slash = checkerPlay.indexOf('/');
    var startPointString = checkerPlay.substring(0, slash);
    var endPointString = checkerPlay.substring(slash + 1);
    
    var startPoint = parsePoint(startPointString);
    
    var endPoint;
    if (endPointString.endsWith("*")) {
        endPoint = parsePoint(endPointString.substring(0, endPointString.length() - 1));
    }
    else {
        endPoint = parsePoint(endPointString);
    }
    
    if (checkers[playerToMove][startPoint] == 0) {
        throw("Illegal startpoint: " + startPoint + " in single checker play: " + checkerPlay + "; no checkers are there.");
    }
    var playerNotOnRoll = (~ playerToMove) & 1;
    
    var nrOfOppOnEndPoint;
    if (endPoint != 0 && endPoint != 25) {
        nrOfOppOnEndPoint = checkers[playerNotOnRoll][25 - endPoint];
    }
    else {
        nrOfOppOnEndPoint = 0;
    }
    if (nrOfOppOnEndPoint > 1) {
        throw("Illegal endpoint: " + endPoint + " in single checker play: " + checkerPlay + "; opponent has more than 1 checker there");
    }
    
    checkers[playerToMove][startPoint]--;
    checkers[playerToMove][endPoint]++;
    if (nrOfOppOnEndPoint == 1) {
        checkers[playerNotOnRoll][25 - endPoint]--;
        checkers[playerNotOnRoll][25]++;
    }
}

/**
 * Parses a string representation of a point into an index within the checkers arrays
 *
 * @param point
 * @return
 */
PositionRecord.prototype.parsePoint = function(point){
    if ("bar".equalsIgnoreCase(point)) {
        return 25;
    }
    if ("off".equalsIgnoreCase(point)) {
        return 0;
    }
    else {
        return Integer.parseInt(point);
    }
}

base64ToBits = function(s, length){
    // first transform the match id into a bit array
    var bits = new Array();
    var bytes = stringToBytes(s);
    
    for (var c = 0; c < (s.length / 4 + 1); c++) { // take 4 characters at a time; they will become 3 bytes
        for (var b = 0; b < 4; b++) {
            var index = c * 4 + b;
            if (index >= bytes.length) 
                break;
            
            var ch = base64.indexOf(String.fromCharCode(bytes[index])); // remove 'base 64' encoding 
            var mask = 1;
            // every character represents 6 bits.      
            for (var bit = 0; (bit < 6); bit++) {
                // find the position at which this bit will be located
                var pos = c * 24 + positions[b * 6 + bit];
                bits[pos] = (ch & mask) / mask;
                mask = mask * 2; // ready for the next bit
            }
        }
    }
    return bits;
}

PositionRecord.prototype.dissectMatchId = function(matchId){
    // the matchId string looks as follows:
    // every character contains six bits; the bits 5..0 are used.
    // The first character in the string holds bit 2..7; the second bit 0..1 and 12..15; etc.
    
    // first transform the match id into a bit array
    var bits = base64ToBits(matchId, 72);
    
    this.cubeValue = Math.pow(2, bitSubString(bits, 0, 4));
    this.cubeOwner = bitSubString(bits, 4, 6);
    this.playerOnRoll = bitSubString(bits, 6, 7);
    this.crawford = bitSubString(bits, 7, 8) == 1;
    this.gameState = bitSubString(bits, 8, 11);
    this.decisionTurn = bitSubString(bits, 11, 12);
    this.cubeOffered = bitSubString(bits, 12, 13) == 1;
    this.resignation = bitSubString(bits, 13, 15);
    this.die1 = bitSubString(bits, 15, 18);
	if(this.die1 == 7) {
		this.die1 = DIE_NONE;
	}
    this.die2 = bitSubString(bits, 18, 21);
	if(this.die2 == 7) {
		this.die2 = DIE_NONE;
	}
    this.matchLength = bitSubString(bits, 21, 36);
    this.matchScore = new Array();
    this.matchScore[0] = bitSubString(bits, 36, 51);
    this.matchScore[1] = bitSubString(bits, 51, 66);
}

/**
 *
 * @return the gnu position id
 */
PositionRecord.prototype.getPositionId = function(){
    var bits = [];
    // make a long bit string
    var player = this.playerOnRoll;
	if(!player) {
		player = 0;
	}	
    var pos = 0;
    for (var nrPlayers = 0; nrPlayers < 2; nrPlayers++) {
        var nrCheckersSoFar = 0;
        for (var point = 1; point < 26; point++) {
            var nr = this.checkers[player][point];
            for (var t = 0; t < nr; t++) {
                nrCheckersSoFar++;
                if (nrCheckersSoFar > 15) 
                    throw("Player " + nrPlayers + " has more than 15 checkers");
                bits[pos++] = 1;
            }
            bits[pos++] = 0;
        }
        player = (~ player) & 1; // player := not player
    }
    // turn it into characters
    return makeBase64String(bits, 14);
}

/**
 * @return the 2-log of the cube
 */
PositionRecord.prototype.getTwoLogOfCube = function(){
    var twoLog = 0;
    var power = 1;
    while (power < this.cubeValue) {
        power = power * 2;
        twoLog++;
    }
    return twoLog;
}

/**
 * @return the gnu match id
 */
PositionRecord.prototype.getMatchId = function(){
    var bits = [];
    
    putIntoBitString(bits, this.getTwoLogOfCube(), 0, 4);
    putIntoBitString(bits, this.cubeOwner, 4, 6);
    putIntoBitString(bits, this.playerOnRoll, 6, 7);
    putIntoBitString(bits, this.crawford ? 1 : 0, 7, 8);
    putIntoBitString(bits, this.gameState, 8, 11);
    putIntoBitString(bits, this.decisionTurn, 11, 12);
    putIntoBitString(bits, this.cubeOffered ? 1 : 0, 12, 13);
    putIntoBitString(bits, this.resignation, 13, 15);
    putIntoBitString(bits, this.die1 == 0? 7 : this.die1, 15, 18);
    putIntoBitString(bits, this.die2 == 0? 7 : this.die2, 18, 21);
    putIntoBitString(bits, this.matchLength, 21, 36);
    putIntoBitString(bits, this.matchScore[0], 36, 51);
    putIntoBitString(bits, this.matchScore[1], 51, 66);
    
    return makeBase64String(bits, 12);
}

makeBase64String = function(bitString, length){
    var result = [];
	for(var i=0; i<length; i++) {
		result[i] = 0;
	}
    
    //  move every bit to its place
    var pos = 0;
    for (var c = 0; c < 4; c++) {
        for (var d = 0; d < 24; d++) {
            var bitIndex = 24 * c + d;
            if (bitIndex < bitString.length) { // we can have more bytes than there are bits.             
                var bit = bitString[bitIndex];
                var bitPos = indexOf(positions, d);
                var bytePos = Math.floor(bitPos / 6);
                this.setBit(result, c * 4 + bytePos, bitPos % 6, bit);
            }
        }
    }
    
    // base 64 encoding
    var res = [];
    for (var i = 0; i < result.length; i++) {
        res[i] = base64.charAt(result[i]);
    }
    return res.join("");
}

setBit = function(byteStr, index, bitPos, value){
    var mask = Math.pow(2, bitPos);
    if (value == 1) {
        byteStr[index] = (byteStr[index] | mask);
    }
    else {
        byteStr[index] = (byteStr[index] & (~ mask));
    }
}

/**
 * If matchLength <> 0 and a score >= matchLength, this score will be reset to zero
 */
PositionRecord.prototype.validateScores = function(){
    if (this.matchLength != 0) {
        if (this.matchScore[0] >= this.matchLength) 
            this.matchScore[0] = 0;
        if (this.matchScore[1] >= this.matchLength) 
            this.matchScore[1] = 0;
    }
}

/**
 *
 * @return true if crawford could be possible
 */
PositionRecord.prototype.isCrawfordPossible = function(){
    if ((this.matchScore[0] != this.matchLength - 1) && (this.matchScore[1] != this.matchLength - 1)) {
        return false;
    }
    else {
        return true;
    }
}

/**
 * If crawford is true, this method will reset it if crawford is not applicable to this matchscore
 */
PositionRecord.prototype.validateCrawford = function(){
    if (this.crawford) {
        if (!this.isCrawfordPossible()) {
            this.crawford = false;
        }
    }
}

/**
 *
 * @param player can be 0 or 1
 * @param point can be 0 (nr of checkers off), 1..24 ( the points numbered for the specified player) or 25 (the bar).
 * @return the number of checkers of the player on the point specified
 */
PositionRecord.prototype.getNrCheckersOnPoint = function(player, point){
    return this.checkers[player][point];
}

PositionRecord.prototype.setNrCheckersOnPoint = function(player, point, nr){
    this.checkers[player][point] = nr;
}

PositionRecord.prototype.switchTurn = function() {
	this.decisionTurn = this.decisionTurn == 0? 1: 0;
	if (!this.cubeOffered) {
		this.playerOnRoll = this.playerOnRoll == 0 ? 1 : 0; 
	}
}

PositionRecord.prototype.clone = function(){
    var p2 = new PositionRecord();
    p2.checkers = [];
    p2.checkers[0] = [];
    p2.checkers[1] = [];
    for (var i = 0; i < 2; i++) {
        this.arrayCopy(this.checkers[i], 0, p2.checkers[i], 0, 26);
    }
    p2.matchScore = [];
    p2.matchScore[0] = this.matchScore[0];
    p2.matchScore[1] = this.matchScore[1];
    p2.crawford = this.crawford;
    p2.cubeOffered = this.cubeOffered;
    p2.cubeOwner = this.cubeOwner;
    p2.cubeValue = this.cubeValue;
    p2.decisionTurn = this.decisionTurn;
    p2.die1 = this.die1;
    p2.die2 = this.die2;
    p2.gameState = this.gameState;
    p2.matchLength = this.matchLength;
    p2.player1Name = this.player1Name;
    p2.player2Name = this.player2Name;
    p2.playerOnRoll = this.playerOnRoll;
    p2.resignation = this.resignation;
    
    return p2;
}

PositionRecord.prototype.arrayCopy = function(ar1, start1, ar2, start2, length){
    for (var i = 0; i < length; i++) {
        ar2[start2++] = ar1[start1++];
    }
}

