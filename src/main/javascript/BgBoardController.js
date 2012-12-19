// TODO make a map of controllers where key is the boardname
var theController;

function getBoard(boardName){
    if (!theController) {
        theController = new BgBoardController(boardName);
    }
    return theController;
}

function BgBoardController(boardName){
    this.bgBoard = new BgBoard();
    this.isHomeBoardLeft = true;
    this.boardElementName = boardName;
    this.board = document.getElementById(boardName);
    this.board.addEventListener("click", boardClicked, false);
}

BgBoardController.prototype.setDirection = function(shouldHomeBoardBeLeft){
    this.isHomeBoardLeft = shouldHomeBoardBeLeft;
};

BgBoardController.prototype.switchTurn = function(){
    this.currentPosition.switchTurn();
};

BgBoardController.prototype.getBoard = function(){
    return this.bgBoard;
};

BgBoardController.prototype.handleClick = function(x, y){
    var item = this.boardMap.locateItem(x, y);
    if (item.area == AREA_TURN) {
        this.switchTurn();
        this.draw(this.currentPosition);
    }
};

function boardClicked(event){
    var x;
    var y;
    if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
    }
    else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    var boardController = getBoard(event.target.id);
    var absPosition = getAbsPosition(boardController.board);
    x -= absPosition.x;
    y -= absPosition.y;
    boardController.handleClick(x, y);
}

BgBoardController.prototype.draw = function(position){
    this.currentPosition = position;
    var context = this.board.getContext("2d");
    this.boardMap = this.bgBoard.drawPosition(context, position, this.isHomeBoardLeft, 0, 0, 500, 400);
};

function parseBgId(id){
    var position = new PositionRecord();
    var posId = parsePositionId(id);
    if (!posId) {
        var xgId = parseXGId(id);
        position.initializeFromXGId(xgId);
    }
    else {
        var matchId = parseMatchId(id);
        position.initializeFromId(posId, matchId);
    }
    return position;
}

function parseXGId(xgId){
    var index = xgId.indexOf("XGID=");
    if (index >= 0) {
        return xgId.substring(index + 5);
    }
}

function parsePositionId(gnuId){
    var index = gnuId.indexOf("Position ID: ");
    if (index >= 0) {
        return gnuId.substring(index + 13);
    }
}

function parseMatchId(gnuId){
    var index = gnuId.indexOf("Match ID: ");
    if (index >= 0) {
        return gnuId.substring(index + 9);
    }
}

function getGnuId(position){
    return "Position ID: " + position.getPositionId() + " Match ID: " + position.getMatchId();
}

// Calculates the object's absolute position
function getAbsPosition(object){
    var position = new Object();
    position.x = 0;
    position.y = 0;
    
    if (object) {
        position.x = object.offsetLeft;
        position.y = object.offsetTop;
        
        if (object.offsetParent) {
            var parentpos = getAbsPosition(object.offsetParent);
            position.x += parentpos.x;
            position.y += parentpos.y;
        }
    }
    
    return position;
}
