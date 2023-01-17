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

hole_img = document.createElement("img")
hole_img.src = "gnomes/Hole.png"

hole_front_img = document.createElement("img")
hole_front_img.src = "gnomes/Hole Front.png"


gnome_imgs = [];
for (i = 1; i <= 16; i++) {
    gnome_imgs.push(document.createElement("img"))
    gnome_imgs[i-1].src = "gnomes/Level " + i + ".png"
}
console.log(gnome_imgs)

class DataStorage {
    constructor() {
        this.data = {}
    }

    set(key, value) {
        this.data[key] = value
    }

    get(key) {
        return this.data[key]
    }
}

fetch("save.json")
.then((response) => response.json())
.then((json) => {
    data = new DataStorage()
    data.set("gnomes", json.gnomes)
    simulation_time = json.logoffTime
    simulation_time = Date.now()
})

function run_tick(){
    let gnomes = data.get("gnomes")
    for (i = 0; i < gnomes.length; i++) {
        let gnome = gnomes[i]
        let vx = Math.cos(gnome.heading)*0.5
        let vy = Math.sin(gnome.heading)*0.5
        gnome.x += vx
        gnome.y += vy
    }
}

setInterval(() => {
    while(Date.now() - simulation_time > 8) {
        run_tick()
        simulation_time += 8
    }
}, 16)

hole_size = 100
gnome_size = 100

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
    x_spacing = canvas_width*0.235
    y_spacing = canvas_height*0.235
    vertical_offset = canvas_height*-0.045
    for (x = -1; x < 2; x++) {
        for (y = -1; y < 2; y++) {
            ctx.drawImage(hole_img, x_spacing*x + canvas_width/2 - hole_size/2, y_spacing*y + canvas_height/2 - hole_size/2 + vertical_offset, hole_size, hole_size)
        }
    }
    let gnomes = data.get("gnomes")
    for (i = 0; i < gnomes.length; i++){
        let gnome = gnomes[i]
        t = Date.now()*0.01+gnome.waddleOffset;
        u_d = -Math.abs(Math.sin(t))*15
        l_r = Math.cos(t)*(1-Math.abs(Math.cos(gnome.heading)))*8
        g = 1+Math.min(0, Math.abs(Math.sin(t))-0.5)*0.25
        ctx.drawImage(gnome_imgs[gnome.num-1], gnome.x+l_r, gnome.y+u_d-gnome_size*g, gnome_size, gnome_size*g)
    }
}