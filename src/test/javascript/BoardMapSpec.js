describe("BoardMap.locateChecker", function(){
    var boardMap;
    var item;
    
    beforeEach(function(){
        boardMap = new BoardMap(0, 0, 200, 200, true);
        item = new Item();
    });
    
    it("should map location on point 1 to proper area, index and height", function(){
        boardMap.locateChecker(item, boardMap.board.x + 1, boardMap.board.y + boardMap.board.height - 1);
        
        expect(item.area).toEqual(AREA_CHECKER);
        expect(item.side).toEqual(0);
		expect(item.index).toEqual(1);
        expect(item.height).toEqual(1);
    });
	
	 it("should map location of second checker on point 1 to proper area, index and height", function(){
        boardMap.locateChecker(item, boardMap.board.x + 1, boardMap.board.y + boardMap.board.height - boardMap.checkerRadius * 2 - 1);
        
        expect(item.area).toEqual(AREA_CHECKER);
        expect(item.side).toEqual(0);
		expect(item.index).toEqual(1);
        expect(item.height).toEqual(2);
    });
    
    it("should map location on point 7 to proper area, index and height", function(){
        boardMap.locateChecker(item, boardMap.bar.x + boardMap.bar.width + 1, boardMap.board.y + boardMap.board.height - 1);
        
        expect(item.area).toEqual(AREA_CHECKER);
        expect(item.side).toEqual(0);
		expect(item.index).toEqual(7);
        expect(item.height).toEqual(1);
    });
    
    it("should map location of second checker on point 13 to proper area, index and height", function(){
        boardMap.locateChecker(item, boardMap.board.x + boardMap.board.width - 1, boardMap.board.y + boardMap.checkerRadius * 2 + 1);
        
        expect(item.area).toEqual(AREA_CHECKER);
        expect(item.side).toEqual(0);
		expect(item.index).toEqual(13);
        expect(item.height).toEqual(2);
    });
    
    it("should map location on point 19 to proper area, index and height", function(){
        boardMap.locateChecker(item, boardMap.bar.x - 1, boardMap.board.y + 1);
        
        expect(item.area).toEqual(AREA_CHECKER);
        expect(item.side).toEqual(0);
		expect(item.index).toEqual(19);
        expect(item.height).toEqual(1);
    });
});

describe("BoardMap.locateBar", function(){
    var boardMap;
    var item;
    
    beforeEach(function(){
        boardMap = new BoardMap(0, 0, 200, 200, true);
        item = new Item();
    });
    
    it("should map location in top of own bar area to proper area and height", function(){
        boardMap.locateBar(item, boardMap.barMe.x + 1, boardMap.barMe.y);
        
        expect(item.area).toEqual(AREA_BAR);
        expect(item.side).toEqual(0);
        expect(item.height).toEqual(1);
    });
    
    it("should map location in top of opponent's bar area to proper area and height", function(){
        boardMap.locateBar(item, boardMap.barOpp.x + 1, boardMap.barOpp.y + boardMap.barOpp.height - 1);
        
        expect(item.area).toEqual(AREA_BAR);
        expect(item.side).toEqual(1);
        expect(item.height).toEqual(1);
    });
    
    it("should map location in third checker of own bar area to proper area and height", function(){
        boardMap.locateBar(item, boardMap.barMe.x + 1, boardMap.barMe.y + boardMap.checkerRadius * 3 - 1);
        
        expect(item.area).toEqual(AREA_BAR);
        expect(item.side).toEqual(0);
        expect(item.height).toEqual(3);
    });
    
    it("should map location in third checker of opponent's bar area to proper area and height", function(){
        boardMap.locateBar(item, boardMap.barOpp.x + 1, boardMap.barOpp.y + boardMap.barOpp.height + 1 - boardMap.checkerRadius * 3);
        
        expect(item.area).toEqual(AREA_BAR);
        expect(item.side).toEqual(1);
        expect(item.height).toEqual(3);
    });
});

describe("BoardMap.locateBearOff", function(){
    var boardMap;
    var item;
    
    beforeEach(function(){
        boardMap = new BoardMap(0, 0, 200, 200, true);
        item = new Item();
    });
    
    it("should map location in bottom of own bearoff area to proper area and height", function(){
        boardMap.locateBearOff(item, boardMap.zeroPointMe.x + 1, boardMap.zeroPointMe.y + boardMap.zeroPointMe.height - 1);
        
        expect(item.area).toEqual(AREA_BEAROFF);
        expect(item.side).toEqual(0);
        expect(item.height).toEqual(1);
    });
    
    it("should map location in bottom of opponent's bearoff area to proper area and height", function(){
        boardMap.locateBearOff(item, boardMap.zeroPointOpp.x + 1, boardMap.zeroPointOpp.y);
        
        expect(item.area).toEqual(AREA_BEAROFF);
        expect(item.side).toEqual(1);
        expect(item.height).toEqual(1);
    });
    
    it("should map location in third checker of own bearoff area to proper area and height", function(){
        boardMap.locateBearOff(item, 
			boardMap.zeroPointMe.x + 1, 
			boardMap.zeroPointMe.y + boardMap.zeroPointMe.height - 1 - boardMap.zeroPointCheckerHeight * 2);
        
        expect(item.area).toEqual(AREA_BEAROFF);
        expect(item.side).toEqual(0);
        expect(item.height).toEqual(3);
    });
    
    it("should map location in third checker of opponent's bearoff area to proper area and height", function(){
        boardMap.locateBearOff(item, 
			boardMap.zeroPointOpp.x + 1, 
			boardMap.zeroPointOpp.y + boardMap.zeroPointCheckerHeight * 2 + 1);
        
        expect(item.area).toEqual(AREA_BEAROFF);
        expect(item.side).toEqual(1);
        expect(item.height).toEqual(3);
    });
});

describe("BoardMap.getCheckerRectangle", function(){

    describe("BoardMap.getCheckerRectangle, clockwise board", function(){
        var boardMap;
        
        beforeEach(function(){
            boardMap = new BoardMap(0, 0, 200, 200, true);
        });
        
        it("should calculate coordinates of own checker on 1 point to be somewhere in left bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(1, 1, false);
            
            expect(rec.x).toBeLessThan(100);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of second own checker on 1 point to be one checker height higher than first checker", function(){
            var recFirst = boardMap.getCheckerRectangle(1, 1, false);
            var recSecond = boardMap.getCheckerRectangle(1, 2, false);
            
            expect(recSecond.x).toEqual(recFirst.x);
            expect(recSecond.y).toEqual(recFirst.y - recFirst.height);
        });
        
        it("should calculate coordinates of own checker on 7 point to be somewhere in right bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(7, 1, false);
            
            expect(rec.x).toBeGreaterThan(100);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of own checker on 13 point to be somewhere in right top corner", function(){
            var rec = boardMap.getCheckerRectangle(13, 1, false);
            
            expect(rec.x).toBeGreaterThan(100);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of own checker on 19 point to be somewhere in left top corner", function(){
            var rec = boardMap.getCheckerRectangle(19, 1, false);
            
            expect(rec.x).toBeLessThan(100);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of own checker on 0 point (born off) to be in the very left bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(0, 1, false);
            
            expect(rec.x).toBeLessThan(50);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of own checker on 25 point (bar) to be somewhere below in the middle", function(){
            var rec = boardMap.getCheckerRectangle(25, 1, false);
            
            expect(rec.x).toBeGreaterThan(75);
            expect(rec.x).toBeLessThan(125);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of second own checker on 25 point (bar) to be one diameter below the first", function(){
            var rec1 = boardMap.getCheckerRectangle(25, 1, false);
            var rec2 = boardMap.getCheckerRectangle(25, 2, false);
            
            expect(rec1.x).toEqual(rec2.x);
            expect(rec1.y).toEqual(rec2.y - 2 * boardMap.checkerRadius);
        });
        
        it("should calculate coordinates of opponent's checker on 1 point to be somewhere in left top corner", function(){
            var rec = boardMap.getCheckerRectangle(1, 1, true);
            
            expect(rec.x).toBeLessThan(100);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of second opponent's checker on 1 point to be one checker height higher than first checker", function(){
            var recFirst = boardMap.getCheckerRectangle(1, 1, true);
            var recSecond = boardMap.getCheckerRectangle(1, 2, true);
            
            expect(recSecond.x).toEqual(recFirst.x);
            expect(recSecond.y).toEqual(recFirst.y + recFirst.height);
        });
        
        it("should calculate coordinates of opponent's checker on 7 point to be somewhere in right top corner", function(){
            var rec = boardMap.getCheckerRectangle(7, 1, true);
            
            expect(rec.x).toBeGreaterThan(100);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of opponent's checker on 13 point to be somewhere in right bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(13, 1, true);
            
            expect(rec.x).toBeGreaterThan(100);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of opponent's checker on 19 point to be somewhere in left bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(19, 1, true);
            
            expect(rec.x).toBeLessThan(100);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of opponent's checker on 0 point (born off) to be int the very left top corner", function(){
            var rec = boardMap.getCheckerRectangle(0, 1, true);
            
            expect(rec.x).toBeLessThan(50);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of opponent's checker on 25 point (bar) to be somewhere up in the middle", function(){
            var rec = boardMap.getCheckerRectangle(25, 1, true);
            
            expect(rec.x).toBeGreaterThan(75);
            expect(rec.x).toBeLessThan(125);
            expect(rec.y).toBeLessThan(100);
        });
		
		it("should calculate coordinates of second opponent's checker on 25 point (bar) to be one diameter above the first", function(){
            var rec1 = boardMap.getCheckerRectangle(25, 1, true);
            var rec2 = boardMap.getCheckerRectangle(25, 2, true);
            
            expect(rec1.x).toEqual(rec2.x);
            expect(rec1.y).toEqual(rec2.y + 2 * boardMap.checkerRadius);
        });
        
    });
    describe("BoardMap.getCheckerRectangle, counterclockwise board", function(){
        var boardMap;
        
        beforeEach(function(){
            boardMap = new BoardMap(0, 0, 200, 200, false);
        });
        
        it("should calculate coordinates of own checker on 1 point to be somewhere in right bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(1, 1, false);
            
            expect(rec.x).toBeGreaterThan(100);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of own checker on 7 point to be somewhere in left bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(7, 1, false);
            
            expect(rec.x).toBeLessThan(100);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of own checker on 13 point to be somewhere in left top corner", function(){
            var rec = boardMap.getCheckerRectangle(13, 1, false);
            
            expect(rec.x).toBeLessThan(100);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of own checker on 19 point to be somewhere in right top corner", function(){
            var rec = boardMap.getCheckerRectangle(19, 1, false);
            
            expect(rec.x).toBeGreaterThan(100);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of own checker on 0 point (born off) to be int the very right bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(0, 1, false);
            
            expect(rec.x).toBeGreaterThan(150);
            expect(rec.y).toBeGreaterThan(150);
        });
        
        it("should calculate coordinates of opponent's checker on 1 point to be somewhere in right top corner", function(){
            var rec = boardMap.getCheckerRectangle(1, 1, true);
            
            expect(rec.x).toBeGreaterThan(100);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of opponent's checker on 7 point to be somewhere in left top corner", function(){
            var rec = boardMap.getCheckerRectangle(7, 1, true);
            
            expect(rec.x).toBeLessThan(100);
            expect(rec.y).toBeLessThan(100);
        });
        
        it("should calculate coordinates of opponent's checker on 13 point to be somewhere in left bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(13, 1, boardMap, true);
            
            expect(rec.x).toBeLessThan(100);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of opponent's checker on 19 point to be somewhere in right bottom corner", function(){
            var rec = boardMap.getCheckerRectangle(19, 1, true);
            
            expect(rec.x).toBeGreaterThan(100);
            expect(rec.y).toBeGreaterThan(100);
        });
        
        it("should calculate coordinates of opponent's checker on 0 point (born off) to be int the very right top corner", function(){
            var rec = boardMap.getCheckerRectangle(0, 1, true);
            
            expect(rec.x).toBeGreaterThan(150);
            expect(rec.y).toBeLessThan(100);
        });
        
    });
});
