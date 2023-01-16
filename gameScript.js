const checker = setInterval(() => {
    console.log(document.getElementById("mainCanvas"))
    if (document.getElementById("mainCanvas") != null) {
        console.log('starting')
        setInterval(draw, 1000/60)
        clearInterval(checker)
    }
}, 10)

// setTimeout(ready, 200);

grass_blades = []

var fn = 'simplex';

function draw() {
    mainCanvas = document.getElementById("mainCanvas");
    ctx = mainCanvas.getContext("2d");
    //draw the background
    GRASS = "#82d479";
    GRASS_BLADE = "#5f9f3a";
    mainCanvas.width = mainCanvas.clientWidth;
    mainCanvas.height = mainCanvas.clientHeight;

    canvas_width = mainCanvas.clientWidth;
    canvas_height = mainCanvas.clientHeight;
    if (grass_blades.length == 0) {
        var noisefn = fn === 'simplex' ? noise.simplex2 : noise.perlin2;
        for (i = 0; i < 1000; i++) {
            let x = Math.random() * canvas_width;
            let y = Math.random() * canvas_height;
            grass_blades.push({
                x: x,
                y: y,
                offset: noisefn(x/100, y/100)*Math.PI+Math.PI
            })
        }
    }
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, canvas_width, canvas_height);
    //draw the grass blades
    for (i = 0; i < grass_blades.length; i++) {
        ctx.beginPath();
        ctx.moveTo(grass_blades[i].x, grass_blades[i].y)
        rotation = Math.sin(Date.now()*0.001+grass_blades[i].offset)*0.5-Math.PI/2
        ctx.lineTo(grass_blades[i].x + Math.cos(rotation) * 20, grass_blades[i].y + Math.sin(rotation) * 20);
        ctx.lineWidth = 2;
        ctx.strokeStyle = GRASS_BLADE;
        ctx.stroke();
    }
}