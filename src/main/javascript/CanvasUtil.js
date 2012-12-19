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
}

function fillRoundedRect(context, area, cornerRadius, color){
	var adjustedArea = area; 
    context.beginPath();
    context.moveTo(adjustedArea.x + cornerRadius, adjustedArea.y);
    context.lineTo(adjustedArea.x + adjustedArea.width - cornerRadius, adjustedArea.y);
    context.quadraticCurveTo(adjustedArea.x + adjustedArea.width, adjustedArea.y, adjustedArea.x + adjustedArea.width, adjustedArea.y + cornerRadius);
    context.lineTo(adjustedArea.x + adjustedArea.width, adjustedArea.y + adjustedArea.height - cornerRadius);
    context.quadraticCurveTo(adjustedArea.x + adjustedArea.width, adjustedArea.y + adjustedArea.height, adjustedArea.x + adjustedArea.width - cornerRadius, adjustedArea.y + adjustedArea.height);
    context.lineTo(adjustedArea.x + cornerRadius, adjustedArea.y + adjustedArea.height);
    context.quadraticCurveTo(adjustedArea.x, adjustedArea.y + adjustedArea.height, adjustedArea.x, adjustedArea.y + adjustedArea.height - cornerRadius);
    context.lineTo(adjustedArea.x, adjustedArea.y + cornerRadius);
    context.quadraticCurveTo(adjustedArea.x, adjustedArea.y, adjustedArea.x + cornerRadius, adjustedArea.y);
    context.closePath();
    context.fillStyle = color;
    context.stroke();
    context.fill();
}


function drawRect(context, area){
    context.moveTo(area.x, area.y);
    context.lineTo(area.x + area.width, area.y);
    context.lineTo(area.x + area.width, area.y + area.height);
    context.lineTo(area.x, area.y + area.height);
    context.lineTo(area.x, area.y);
}