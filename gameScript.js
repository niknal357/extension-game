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
        for (i = 0; i < 700; i++) {
            grass_blades.push({
                x: Math.random() * canvas_width,
                y: Math.random() * canvas_height,
                offset: Math.random() * Math.PI * 2,
            })
        }
    }
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, canvas_width, canvas_height);
    //draw the grass blades
    for (i = 0; i < grass_blades.length; i++) {
        ctx.beginPath();
        ctx.moveTo(grass_blades[i].x, grass_blades[i].y)
        rotation = Math.sin(Date.now()*0.001+grass_blades[i].offset)*0.3-Math.PI/2
        ctx.lineTo(grass_blades[i].x + Math.cos(rotation) * 20, grass_blades[i].y + Math.sin(rotation) * 20);
        ctx.lineWidth = 2;
        ctx.strokeStyle = GRASS_BLADE;
        ctx.stroke();
    }
}