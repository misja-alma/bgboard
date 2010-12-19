"use strict";

function Item(){
    var area;
    var side;
    var index;
    var height;
}

Item.prototype.clone = function(){
    var newItem = new Item();
    newItem.area = this.area;
    newItem.side = this.side;
    newItem.index = this.index;
    newItem.height = this.height;
    
    return newItem;
};

function Area(){
    var x;
    var y;
    var width;
    var height;
}

Area.prototype.contains = function(x, y){
    if (x >= this.x && x < this.x + this.width) {
        if (y >= this.y && y < this.y + this.height) {
            return true;
        }
    }
    return false;
}

Area.prototype.clone = function(){
    var newArea = new Area();
    newArea.x = this.x;
    newArea.y = this.y;
    newArea.width = this.width;
    newArea.height = this.height;
    
    return newArea;
};

var AREA_BAR = "BAR";
var AREA_TURN = "TURN";
var AREA_CHECKER = "CHECKER";
var AREA_DICE = "DICE";
var AREA_CUBE = "CUBE";
var AREA_BEAROFF = "BEAROFF";

// There are 2 kinds of area's: the area's where an item Could be drawn, and the area where it Is drawn.
//      The BoardMap defines the wider area's; the implementations can use insets to define real outlines.
//      However for reverse mapping, i.e. when the mouse has been clicked, the wider area's will be used.
//      Use area objects for all of the area's.
//      Finally: Some 'meta area's' exist, like the 'bear off area'. This is still subdivided into little
//      area's for every born off checker, however these have to be calculated on the fly; one reason is 
//      that multiple checkers could occupy the same place.
// BoardMap always assumes that 'me' is playing at the bottom and 'opp' at the top.
function BoardMap(x, y, width, height, isHomeBoardLeft){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.isHomeBoardLeft = isHomeBoardLeft;
    this.pointNumberHeight = height / 14;
    this.bearOffMarginWidth = width / 14;
	this.cubeMarginWidth = width / 8;
    
    this.board = new Area();
	if (isHomeBoardLeft) {
		this.board.x = x + this.bearOffMarginWidth;
	} else {
		this.board.x = x + this.cubeMarginWidth;
	}
    this.board.y = y + this.pointNumberHeight;
    this.board.width = width - this.bearOffMarginWidth - this.cubeMarginWidth;
    this.board.height = height - 2 * this.pointNumberHeight;
    
    this.bar = new Area();
    this.bar.width = this.getBarWidth(this.board.width);
    this.bar.height = this.board.height;
    this.bar.x = this.board.x + this.board.width / 2 - this.bar.width / 2;
    this.bar.y = this.board.y;
    
    this.pointWidth = this.getPointWidth(this.board.width);
    this.checkerRadius = this.pointWidth / 2.2;
    this.pointHeight = this.checkerRadius * 10;
    
    this.arrowMyTurn = new Area();
    this.arrowOppTurn = new Area();
    
    var arrowWidth = this.cubeMarginWidth - 2;
    var arrowHeight = this.board.height / 5;
    var arrowX = isHomeBoardLeft ? this.board.x + this.board.width + 1 : this.x + 1;
    
    this.arrowMyTurn.x = arrowX;
    this.arrowMyTurn.y = this.board.y + this.board.height * 3/5;
    this.arrowMyTurn.width = arrowWidth;
    this.arrowMyTurn.height = arrowHeight;
    
    this.arrowOppTurn.x = arrowX;
    this.arrowOppTurn.y = this.board.y + this.board.height / 5;
    this.arrowOppTurn.width = arrowWidth;
    this.arrowOppTurn.height = arrowHeight;
    
    this.zeroPointMe = new Area();
    this.zeroPointOpp = new Area();
    
    var zeroPointX = isHomeBoardLeft ? x : this.board.x + this.board.width + 1;
    this.zeroPointCheckerHeight = this.checkerRadius / 2;
    
    this.zeroPointOpp.y = this.board.y;
    this.zeroPointOpp.x = zeroPointX;
    this.zeroPointOpp.width = this.pointWidth;
    this.zeroPointOpp.height = this.pointHeight;
    
    this.zeroPointMe.y = this.board.y + this.board.height - this.checkerRadius * 2;
    this.zeroPointMe.x = zeroPointX;
    this.zeroPointMe.width = this.pointWidth;
    this.zeroPointMe.height = this.pointHeight;
    
    var barCheckerX = this.bar.x + 1;
    
    this.barMe = new Area();
    this.barOpp = new Area();
    
    this.barMe.x = barCheckerX;
    this.barMe.y = this.board.y + this.board.height - this.checkerRadius * 10;
    this.barMe.width = this.bar.width - 2;
    this.barMe.height = this.pointHeight;
    
    this.barOpp.x = barCheckerX;
    this.barOpp.y = this.board.y + this.checkerRadius * 8;
    this.barOpp.width = this.bar.width - 2;
    this.barOpp.height = this.pointHeight;
    
    this.diceMe = new Area();
    this.diceOpp = new Area();
    var diceY = this.board.y + this.pointHeight;
    var diceWidth = 6 * this.pointWidth;
    var diceHeight = this.board.height - 2 * this.pointHeight;
    
	// Dice and cube don't care about isHomeBoardLeft ..
	this.diceMe.x = this.bar.x + this.bar.width;
	this.diceOpp.x = this.board.x;	
	this.diceMe.y = diceY;
	this.diceMe.width = diceWidth;
	this.diceMe.height = diceHeight;
    this.diceOpp.y = diceY;
	this.diceOpp.width = diceWidth;
	this.diceOpp.height = diceHeight; 
	// what about first and second die?  
	
	this.cubeMe = new Area();
    this.cubeOpp = new Area();
	this.cubeMiddle = new Area(); 
	this.cubeOfferedByMe = new Area();
    this.cubeOfferedByOpp = new Area();
	
	var cubeHeight = this.cubeMarginWidth; 
	var cubeX = isHomeBoardLeft ? this.board.x + this.board.width + 1: this.x + 1; 
	this.cubeMe.width = cubeHeight;
	this.cubeMe.height = cubeHeight;
	this.cubeMe.x = cubeX;
	this.cubeMe.y = this.board.y + this.board.height - cubeHeight;
	
	this.cubeOpp.width = cubeHeight;
	this.cubeOpp.height = cubeHeight;
	this.cubeOpp.x = cubeX;
	this.cubeOpp.y = this.board.y;
	
	this.cubeMiddle.width = cubeHeight;
	this.cubeMiddle.height = cubeHeight;
	this.cubeMiddle.x = cubeX;
	this.cubeMiddle.y = this.board.y + this.pointHeight;
	
	this.cubeOfferedByMe.width = cubeHeight;
	this.cubeOfferedByMe.height = cubeHeight;
	this.cubeOfferedByMe.x = this.bar.x + this.bar.width + 2 * this.pointWidth;
	this.cubeOfferedByMe.y = this.board.y + this.pointHeight;
	
	this.cubeOfferedByOpp.width = cubeHeight;
	this.cubeOfferedByOpp.height = cubeHeight;
	this.cubeOfferedByOpp.x = this.board.x + 2 * this.pointWidth;
	this.cubeOfferedByOpp.y = this.board.y + this.pointHeight;
}

// Locates the checker from player 'me'-'s perspective
BoardMap.prototype.locateChecker = function(item, x, y){
    for (var index = 1; index <= 24; index++) {
        var point = this.getPointArea(index, false);
        if (point.contains(x, y)) {
            item.area = AREA_CHECKER;
            item.side = 0;
            item.index = index;
            if (index <= 12) {
                item.height = Math.floor((point.y + point.height - y) / (2 * this.checkerRadius)) + 1;
            }
            else {
                item.height = Math.floor((y - point.y) / (2 * this.checkerRadius)) + 1;
            }
            return true;
        }
    }
    return false;
}

var CUBELOCATION_OWNED = "CUBE_OWNED";
var CUBELOCATION_MIDDLE = "CUBE_MIDDLE";
var CUBELOCATION_OFFERED = "CUBE_OFFERED";

BoardMap.prototype.locateCube = function(item, x, y){
	if(this.cubeMe.contains(x, y)) {
		item.area = AREA_CUBE;
		item.side = 0;
		item.location = CUBELOCATION_OWNED;
		return true;
	}
	if(this.cubeMiddle.contains(x, y)) {
		item.area = AREA_CUBE;
		item.location = CUBELOCATION_MIDDLE;
		return true;
	}
	if(this.cubeOpp.contains(x, y)) {
		item.area = AREA_CUBE;
		item.side = 1;
		item.location = CUBELOCATION_OWNED;
		return true;
	}
	if(this.cubeOfferedByMe.contains(x, y)) {
		item.area = AREA_CUBE;
		item.side = 0;
		item.location = CUBELOCATION_OFFERED;
		return true;
	}
	if(this.cubeOfferedByOpp.contains(x, y)) {
		item.area = AREA_CUBE;
		item.side = 1;
		item.location = CUBELOCATION_OFFERED;
		return true;
	}
	return false;
}

BoardMap.prototype.locateDice = function(item, x, y){
    if (this.diceMe.contains(x, y)) {
        item.area = AREA_DICE;
        item.side = 0;
        return true;
    }
    if (this.diceOpp.contains(x, y)) {
        item.area = AREA_DICE;
        item.side = 1;
        return true;
    }
    return false;
}

BoardMap.prototype.locateBearOff = function(item, x, y){
    if (this.zeroPointMe.contains(x, y)) {
        item.area = AREA_BEAROFF;
        item.side = 0;
        var bearOffMeTop = this.zeroPointMe.y + this.zeroPointMe.height;
        item.height = Math.floor((bearOffMeTop - y) / this.zeroPointCheckerHeight) + 1;
        return true;
    }
    if (this.zeroPointOpp.contains(x, y)) {
        item.area = AREA_BEAROFF;
        item.side = 1;
        item.height = Math.floor((y - this.zeroPointOpp.y) / this.zeroPointCheckerHeight) + 1;
        return true;
    }
    return false;
}

BoardMap.prototype.locateBar = function(item, x, y){
    // Counting of the height starts from the middle of the bar
    if (this.barMe.contains(x, y)) {
        item.area = AREA_BAR;
        item.side = 0;
        item.height = Math.floor((y - this.barMe.y) / this.checkerRadius) + 1;
        return true;
    }
    if (this.barOpp.contains(x, y)) {
        item.area = AREA_BAR;
        item.side = 1;
        var barOppTop = this.barOpp.y + this.barOpp.height - 1;
        item.height = Math.floor((barOppTop - y) / this.checkerRadius) + 1;
        return true;
    }
    return false;
}

BoardMap.prototype.locateTurn = function(item, x, y){
    if (this.arrowMyTurn.contains(x, y)) {
        item.area = AREA_TURN;
        item.side = 0;
        return true;
    }
    if (this.arrowOppTurn.contains(x, y)) {
        item.area = AREA_TURN;
        item.side = 1;
        return true;
    }
    return false;
}

// Returns the outer-rectangle starting at the topleftcorner of the checker; includes the checker + its insets
BoardMap.prototype.getCheckerRectangle = function(index, indexOnPoint, isHomeBoardUp){
    var rec = this.getPointArea(index, isHomeBoardUp);
    rec.height = this.checkerRadius * 2;
    
    if (index == 0) {
        if (isHomeBoardUp) {
            rec.y = rec.y + this.zeroPointCheckerHeight * (indexOnPoint - 1);
        }
        else {
            rec.y = rec.y - this.zeroPointCheckerHeight * (indexOnPoint - 1);
        }
        return rec;
    }
    
    var cappedPointIndex = indexOnPoint > 5 ? 5 : indexOnPoint;
    
    if (index == 25) {
        if (isHomeBoardUp) {
            rec.y = rec.y - 2 * this.checkerRadius * (cappedPointIndex - 1);
        }
        else {
            rec.y = rec.y + 2 * this.checkerRadius * (cappedPointIndex - 1);
        }
        return rec;
    }
    
    var heightOnPoint = (cappedPointIndex - 1) * rec.height;
    if (isHomeBoardUp) {
        if (index <= 12) {
            rec.y = rec.y + heightOnPoint;
        }
        else {
            rec.y = rec.y + this.pointHeight - heightOnPoint - rec.height;
        }
    }
    else {
        if (index <= 12) {
            rec.y = rec.y + this.pointHeight - heightOnPoint - rec.height;
        }
        else {
            rec.y = rec.y + heightOnPoint;
        }
    }
    return rec;
}

BoardMap.prototype.getPointArea = function(index, isHomeBoardUp){
    var rec;
    
    if (index == 0) {
        if (isHomeBoardUp) {
            rec = this.zeroPointOpp.clone();
        }
        else {
            rec = this.zeroPointMe.clone();
        }
        return rec;
    }
    
    if (index == 25) {
        if (isHomeBoardUp) {
            rec = this.barOpp.clone();
        }
        else {
            rec = this.barMe.clone();
        }
        return rec;
    }
    
    rec = new Area();
    rec.width = this.pointWidth;
    rec.height = this.pointHeight;
    var pointsFromLeft;
    if (this.isHomeBoardLeft) {
        if (index <= 12) {
            pointsFromLeft = index - 1;
        }
        else {
            pointsFromLeft = (24 - index);
        }
    }
    else {
        if (index <= 12) {
            pointsFromLeft = 12 - index;
        }
        else {
            pointsFromLeft = index - 13;
        }
    }
    rec.x = this.board.x + pointsFromLeft * rec.width;
    if (pointsFromLeft > 5) {
        rec.x += this.bar.width;
    }
    // determine y coordinate
    rec.y = this.board.y;
    if (isHomeBoardUp) {
        if (index > 12) {
            rec.y += this.board.height - this.pointHeight;
        }
    }
    else {
        if (index <= 12) {
            rec.y += this.board.height - this.pointHeight;
        }
    }
    
    return rec;
}

BoardMap.prototype.getPointWidth = function(boardWidth){
    var barWidth = this.getBarWidth(boardWidth);
    var pointWidth = (boardWidth - barWidth) / 12;
    return pointWidth;
}

BoardMap.prototype.getBarWidth = function(boardWidth){
    var barWidth = boardWidth / 12;
    return barWidth;
}

BoardMap.prototype.locateItem = function(x, y){
    var item = new Item();
    item.x = x;
    item.y = y;
    
    if (this.locateChecker(item, x, y)) {
        return item;
    }
    
    if (this.locateCube(item, x, y)) {
        return item;
    }
    
    if (this.locateDice(item, x, y)) {
        return item;
    }
    
    if (this.locateBearOff(item, x, y)) {
        return item;
    }
    
    if (this.locateBar(item, x, y)) {
        return item;
    }
    
    if (this.locateTurn(item, x, y)) {
        return item;
    }
    return item;
}