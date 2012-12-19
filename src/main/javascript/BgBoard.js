
function BgBoard() {
	this.pointPattern = new Image(); 
	this.pointPattern.src = "images/wood.jpg"; 
	this.myCheckerColor = "#FFFF00";
	this.oppCheckerColor = "#00FFFF";	
}

BgBoard.prototype.setPointPatternImage = function(pointPatternImage) {
	this.pointPattern = pointPatternImage;
};

BgBoard.prototype.setMyCheckerColor = function(color) {
	this.myCheckerColor = color;
};

BgBoard.prototype.setOppCheckerColor = function(color) {
	this.oppCheckerColor = color;
};

// myCheckers and oppCheckers contain the nr's of checkers for each player on each point on the board. Points are numbered from the player's own orientation
BgBoard.prototype.drawPosition = function(context, position, isHomeBoardLeft, x, y, boardWidth, boardHeight){
    var boardMap = new BoardMap(x, y, boardWidth, boardHeight, isHomeBoardLeft);
    
    this.drawBoard(context, boardMap);
    
    var myCheckers = position.checkers[0];
    var oppCheckers = position.checkers[1];
    var isItMyTurn = position.decisionTurn == 0;
    
    for (i = 0; i < myCheckers.length; i++) {
        var myDrawNr = myCheckers[i];
        var myDrawNrAsText = false;
        if (myDrawNr > 5 && i != 0 && i != 25) {
            myDrawNr = 5;
            myDrawNrAsText = true;
        }
        for (j = 0; j < myDrawNr; j++) {
            this.drawChecker(context, i, j + 1, false, boardMap, this.myCheckerColor);
        }
        if (myDrawNrAsText) {
            this.drawCheckerTotal(context, i, myCheckers[i], false, boardMap);
        }
    }
    for (i = 0; i < oppCheckers.length; i++) {
        var myDrawNr = myCheckers[i];
        var myDrawNrAsText = false;
        if (myDrawNr > 5 && i != 0 && i != 25) {
            myDrawNr = 5;
            myDrawNrAsText = true;
        }
        for (j = 0; j < oppCheckers[i]; j++) {
            this.drawChecker(context, i, j + 1, true, boardMap, this.oppCheckerColor);
        }
        if (myDrawNrAsText) {
            this.drawCheckerTotal(context, i, myCheckers[i], true, boardMap);
        }
    }
    
    var arrow;
    var color;
    if (isItMyTurn) {
        arrowX = boardMap.arrowMyTurn;
        color = this.myCheckerColor;
    }
    else {
        arrowX = boardMap.arrowOppTurn;
        color = this.oppCheckerColor;
    }
    this.drawArrow(context, arrowX, isHomeBoardLeft, color);
	
	var diceArea;
	if(isItMyTurn) {
		diceArea = boardMap.diceMe;
	} else {
		diceArea = boardMap.diceOpp;
	}
	this.drawDie(context, diceArea, 1, position.die1);
	this.drawDie(context, diceArea, 2, position.die2);
	
	var cubeArea;
	// TODO find out/handle the case when cube is offered!
	if(position.cubeOwner = CENTERED_CUBE) {
		cubeArea = boardMap.cubeMiddle;
	} else
	if(position.cubeOwner = 1) {
		cubeArea = boardMap.cubeMe;
	} else {
		cubeArea = boardMap.cubeOpp;
	}
	this.drawCube(context, cubeArea, position.cubeValue);
    
    return boardMap;
};

// index is the bg pointnumber, indexOnPoint starts with 1
BgBoard.prototype.drawChecker = function(context, index, indexOnPoint, isHomeBoardUp, boardMap, color){
    var pointWidth = boardMap.pointWidth;
    var radius = boardMap.checkerRadius;
    var inset = (pointWidth - radius * 2) / 2;
    var coordinates = boardMap.getCheckerRectangle(index, indexOnPoint, isHomeBoardUp);
    
    context.strokeStyle = "#000";
    context.fillStyle = color;
    context.beginPath();
    context.arc(coordinates.x + radius + inset, coordinates.y + radius, radius, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
    context.fill();
};

BgBoard.prototype.drawCheckerTotal = function(context, index, total, isHomeBoardUp, boardMap, color){
    var pointWidth = boardMap.pointWidth;
    var coordinates = boardMap.getCheckerRectangle(index, 6, isHomeBoardUp);
    
    context.fillStyle = "#000";
    var textWidth = context.measureText(total).width;
    var textInset = (pointWidth - textWidth) / 2;
    context.fillText(total, coordinates.x + textInset, coordinates.y + boardMap.checkerRadius * 1.4);
};

BgBoard.prototype.drawBoard = function(context, boardMap){
    context.fillStyle = "#FFFFFF";
    context.fillRect(boardMap.x, boardMap.y, boardMap.width, boardMap.height);
    
    context.fillStyle = "#000000";
    this.drawPointNumbers(context, boardMap);
    
    context.beginPath();
    drawRect(context, boardMap.board);
    this.drawBar(context, boardMap);
	context.closePath();
	context.strokeStyle = "#000";
    context.stroke();
    
	context.beginPath();
    var pointWidth = boardMap.pointWidth;
    for (i = 0; i < 6; i++) {
        this.drawPoint(context, true, boardMap.board.x, i, boardMap);
    }
    for (i = 0; i < 6; i++) {
        this.drawPoint(context, true, boardMap.board.x + boardMap.board.width / 2 + boardMap.bar.width / 2, i, boardMap);
    }
    for (i = 0; i < 6; i++) {
        this.drawPoint(context, false, boardMap.board.x, i, boardMap);
    }
    for (i = 0; i < 6; i++) {
        this.drawPoint(context, false, boardMap.board.x + boardMap.board.width / 2 + boardMap.bar.width / 2, i, boardMap);
    }
    
    context.closePath();
    context.fillStyle = context.createPattern(this.pointPattern, 'repeat');
	context.strokeStyle = "#000";
    context.stroke();
	context.fill();
};

BgBoard.prototype.drawPointNumbers = function(context, boardMap){
    var fontHeight = boardMap.pointNumberHeight * 0.5;
    context.font = "bold " + fontHeight + "px sans-serif";
    
    var pointNumber;
    var increment;
    if (boardMap.isHomeBoardLeft) {
        pointNumber = 1;
        increment = 1;
    }
    else {
        pointNumber = 12;
        increment = -1;
    }
    var baseLine = boardMap.board.y + boardMap.board.height + boardMap.pointNumberHeight * 0.6;
    var startX = boardMap.board.x;
    this.draw6PointNumbers(context, pointNumber, increment, startX, baseLine, boardMap.pointWidth, true);
    pointNumber += 6 * increment;
    
    startX = boardMap.board.x + boardMap.board.width / 2 + boardMap.bar.width / 2;
    this.draw6PointNumbers(context, pointNumber, increment, startX, baseLine, boardMap.pointWidth, true);
    
    if (boardMap.isHomeBoardLeft) {
        pointNumber = 13;
    }
    else {
        pointNumber = 24;
    }
    
    baseLine = boardMap.board.y - boardMap.pointNumberHeight * 0.25;
    this.draw6PointNumbers(context, pointNumber, increment, startX, baseLine, boardMap.pointWidth, false);
    pointNumber += 6 * increment;
    
    var startX = boardMap.board.x;
    this.draw6PointNumbers(context, pointNumber, increment, startX, baseLine, boardMap.pointWidth, false);
};

BgBoard.prototype.draw6PointNumbers = function(context, pointNumber, pointNumberIncrement, startX, baseLine, pointWidth, fromLeftToRight){
    var start;
    var increment;
    if (fromLeftToRight) {
        start = 0;
        end = 5;
        increment = 1;
    }
    else {
        start = 5;
        end = 0;
        increment = -1;
    }
    for (i = start; i != (end + increment); i += increment) {
        var textWidth = context.measureText(pointNumber).width;
        var textInset = (pointWidth - textWidth) / 2;
        context.fillText(pointNumber, startX + i * pointWidth + textInset, baseLine);
        pointNumber += pointNumberIncrement;
    }
};

BgBoard.prototype.drawBar = function(context, boardMap){
    context.moveTo(boardMap.bar.x, boardMap.bar.y);
    context.lineTo(boardMap.bar.x, boardMap.bar.y + boardMap.bar.height);
    context.moveTo(boardMap.bar.x + boardMap.bar.width, boardMap.bar.y);
    context.lineTo(boardMap.bar.x + boardMap.bar.width, boardMap.bar.y + boardMap.bar.height);
};

BgBoard.prototype.drawPoint = function(context, upwards, startX, index, boardMap){
    var x = startX + index * boardMap.pointWidth;
    if (upwards) {
        context.moveTo(x, boardMap.board.y);
        context.lineTo(x + boardMap.pointWidth / 2, boardMap.board.y + boardMap.pointHeight);
        context.lineTo(x + boardMap.pointWidth, boardMap.board.y);
    }
    else {
        context.moveTo(x, boardMap.board.y + boardMap.board.height);
        context.lineTo(x + boardMap.pointWidth / 2, boardMap.board.y + boardMap.board.height - boardMap.pointHeight);
        context.lineTo(x + boardMap.pointWidth, boardMap.board.y + boardMap.board.height);
    }
};

// the x and y point to the left top corner of the drawing box
BgBoard.prototype.drawArrow = function(context, arrowArea, leftWards, color){
    var direction = leftWards ? 1 : -1;
    
    var x = arrowArea.x + arrowArea.width * 0.1;
    var y = arrowArea.y + arrowArea.height * 0.25;
    var width = arrowArea.width * 0.8;
    var height = arrowArea.height * 0.5;
    
    y += height / 2;
    if (!leftWards) {
        x += width;
    }
    
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + direction * width / 2, y + height / 2);
    context.lineTo(x + direction * width / 2, y + height / 3);
    context.lineTo(x + direction * width, y + height / 3);
    context.lineTo(x + direction * width, y - height / 3);
    context.lineTo(x + direction * width / 2, y - height / 3);
    context.lineTo(x + direction * width / 2, y - height / 2);
    context.lineTo(x, y);
    context.closePath();
    context.fillStyle = color;
    context.stroke();
    context.fill();
};

BgBoard.prototype.drawCube = function(context, cubeArea, cubeValue) {
	var cubeWidth = cubeArea.width * 0.75;
	var cubeInset = (cubeArea.width - cubeWidth) / 2;
	var realCubeArea = new Area();
	realCubeArea.x = cubeArea.x + cubeInset;
	realCubeArea.y = cubeArea.y + cubeInset;
	realCubeArea.width = cubeWidth;
	realCubeArea.height = cubeWidth;
	fillRoundedRect(context, realCubeArea, cubeWidth/8, "#FFFFFF");
	
	var fontHeight;
	if(cubeValue < 10) {
	 	fontHeight = cubeWidth * 0.5;
	} else 
	if(cubeValue < 100) {
	 	fontHeight = cubeWidth * 0.35;
	} else {
		fontHeight = cubeWidth * 0.25;
	}
    context.font = "bold " + fontHeight + "px sans-serif";
	
	var textWidth = context.measureText(cubeValue).width;
    var horizontalTextInset = (cubeWidth - textWidth) / 2;
	var verticalTextInset = cubeWidth/2 + fontHeight/4;
	context.fillStyle = "#000000";
    context.fillText(cubeValue, realCubeArea.x + horizontalTextInset, realCubeArea.y + verticalTextInset);
};

// TODO make Die a class of its own?
BgBoard.prototype.getDieArea = function(diceArea, dieIndex) {
	var dieWidth = diceArea.height * 0.6;
	var spaceBetweenDice = dieWidth / 4;
	var dieXInset = (diceArea.width - 2 * dieWidth - spaceBetweenDice) / 2;
	var dieArea = new Area();
	dieArea.x = diceArea.x + dieXInset;
	if(dieIndex == 2) {
		dieArea.x += dieWidth + spaceBetweenDice;
	}
	dieArea.y = diceArea.y + (diceArea.height - dieWidth) / 2;
	dieArea.width = dieWidth;
	dieArea.height = dieWidth;
	return dieArea;
};

var pipCoordinates = [
[[50, 50]],
[[25, 25],[75, 75]],
[[25, 25],[50,50],[75,75]],
[[25, 25],[75,25],[75,75],[25,75]],
[[25, 25],[75,25],[75,75],[25,75],[50,50]],
[[25, 25],[75,25],[75,75],[25,75],[25,50],[75,50]]
];

BgBoard.prototype.drawDie = function(context, diceArea, dieIndex, pips) {
	if(pips == DIE_NONE) {
		return;
	}
	var dieArea = this.getDieArea(diceArea, dieIndex);
	fillRoundedRect(context, dieArea, dieArea.width / 8, "#FFFFFF");
	
	var radius = dieArea.width / 24;
	var coordinatesForPips = pipCoordinates[pips-1];
	for(var i=0; i<coordinatesForPips.length; i++) {
		var xy = coordinatesForPips[i];
		var x = xy[0] * dieArea.width / 100 + dieArea.x;
		var y = xy[1] * dieArea.height / 100 + dieArea.y;
		this.drawPip(context, x, y, radius, "#000000");
	}
};

BgBoard.prototype.drawPip = function(context, x,  y, radius, color) {
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2, false);
	context.closePath();
    context.fillStyle = color;
    context.stroke();
    context.fill();
};
