

document.addEventListener('DOMContentLoaded', SetupCanvas);

function SetupCanvas() {
    canvas = document.getElementById('my-canvas');
    let canvas_size = 1000;
    ctx = canvas.getContext('2d');
    canvas.width = canvas_size;
    canvas.height = canvas_size;
    let square_size = 5;
    ctx.scale(2, 2);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < canvas_size; i+=square_size) {
        for (let j = 0; j < canvas_size; j+=square_size) {
            ctx.fillStyle = getRandomColor();
            ctx.fillRect(i, j, square_size, square_size);
        }
    }
}



function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }