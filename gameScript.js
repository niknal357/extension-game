// setTimeout(ready, 100);


var mainCanvas;
var ctx;
var canvas_width;
var canvas_height;

var holdingitem = false;
var itemHeld = null;

var holePositions = [];

hole_size = 100;
gnome_size = 100;
wind = 0;

function ready() {
    mainCanvas = document.getElementById("mainCanvas");
    ctx = mainCanvas.getContext("2d");
    canvas_width = mainCanvas.clientWidth;
    canvas_height = mainCanvas.clientHeight;
    document.getElementById('mainCanvas').addEventListener('click', handleClick);

    generateHoles();
    console.log(holePositions);
    
    

    generateUI();
    
}

function generateUI() {
    let gnomeButton = document.getElementById("gnome-dex-button");

    gnomeButton.addEventListener("click", function () {
        document
            .getElementById("gnome-dex")
            .classList.toggle("gnome-dex-hidden");
        document
            .getElementById("gnome-dex-button")
            .classList.toggle("gnome-dex-button-toggled");
    });

    let inventoryButton = document.getElementById("toolbar-button-5");
    inventoryButton.addEventListener("click", function () {
        document.getElementById('inventory').classList.toggle('inventory-hidden');
        inventoryButton.getElementsByClassName('button-icon')[0].classList.toggle('inventory-icon-toggled');
    });

    fetch("gnomes.txt")
        .then((response) => response.text())
        .then((text) => generateGnomeDex(text));
}

function generateHoles(numHoleRows = 3, numHoleCols = 3, x_spacing = 140, y_spacing = 20) {
    // the above set defaults if no value is passed
    let newHoles = []

    let holeBoundingBoxWidth = numHoleCols * hole_size + (numHoleCols - 1) * x_spacing;
    let holeBoundingBoxHeight = numHoleRows * hole_size + (numHoleRows - 1) * y_spacing;
    let top_left_x = (canvas_width - holeBoundingBoxWidth) / 2;
    let top_left_y = (canvas_height - holeBoundingBoxHeight) / 2;

    console.log(numHoleRows + '  ' + numHoleCols + '  ' + x_spacing + '  ' + y_spacing);
    console.log(canvas_width + '  ' + canvas_height);
    console.log(top_left_x + '  ' + top_left_y);
    console.log('width: ' + holeBoundingBoxWidth + '  ' + 'height: ' + holeBoundingBoxHeight);

    let vertical_offset = canvas_height * -0.045;
    for (let row = 0; row < numHoleRows; row++) {
        for (let column = 0; column < numHoleCols; column++) {
            newHoles.push({
                'xPos': top_left_x + row * (x_spacing + hole_size),
                'yPos': top_left_y + column * (y_spacing + hole_size) + vertical_offset,
                'x': row,
                'y': column,
            });
        }
    }
    console.log(newHoles);
    holePositions = newHoles;

    // setTimeout(generateHoles, 5000, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 100), Math.floor(Math.random() * 100));
}

function generateGnomeDex(data) {
    // get rid of new lines in data
    data = data.replace(/(\r\n|\n|\r)/gm, "");

    let lines = data.split(";");
    const linesPerGnomeEntry = 3;
    let numGnomes = Math.floor(lines.length / linesPerGnomeEntry);

    let highestGnomeDiscovered = 3;  //TODO: this should pull from save.json file

    for (let i = 0; i < numGnomes; i++) {
        let gnome = document.createElement("div");
        gnome.classList.add("gnome");

        let gnomeImage = document.createElement("img");
        gnomeImage.classList.add("gnome-image");
        gnomeImage.src = "./gnomes/Level " + (i + 1) + ".png";

        let gnomeNameDescriptionContainer = document.createElement("div");
        gnomeNameDescriptionContainer.classList.add(
            "gnome-description-container"
        );

        let gnomeName = document.createElement("h2");
        gnomeName.classList.add("gnome-name");
        gnomeName.innerHTML = lines[i * linesPerGnomeEntry + 1];

        let gnomeDescription = document.createElement("h3");
        gnomeDescription.classList.add("gnome-description");
        gnomeDescription.innerHTML = lines[i * linesPerGnomeEntry + 2];

        if(highestGnomeDiscovered <= i){
            gnomeImage.classList.add("undiscovered");
            gnomeName.innerHTML = "???";
            gnomeDescription.innerHTML = "???";
        }

        gnome.appendChild(gnomeImage);
        gnomeNameDescriptionContainer.appendChild(gnomeName);
        gnomeNameDescriptionContainer.appendChild(gnomeDescription);
        gnome.appendChild(gnomeNameDescriptionContainer);
        document.getElementById("gnome-dex").appendChild(gnome);
    }
}


const checker = setInterval(() => {
    console.log(document.getElementById("mainCanvas"));
    if (document.getElementById("mainCanvas") != null) {
        ready();
        console.log("starting");
        setInterval(draw, 1000 / 60);
        clearInterval(checker);
    }
}, 10);

// setTimeout(ready, 200);

grass_blades = [];

var fn = "simplex";

hole_img = document.createElement("img");
hole_img.src = "gnomes/Hole.png";

hole_front_img = document.createElement("img");
hole_front_img.src = "gnomes/Hole Front.png";

gnome_imgs = [];
for (i = 1; i <= 16; i++) {
    gnome_imgs.push(document.createElement("img"));
    gnome_imgs[i - 1].src = "gnomes/Level " + i + ".png";
}
console.log(gnome_imgs);

class DataStorage {
    constructor() {
        this.data = {};
    }

    set(key, value) {
        this.data[key] = value;
    }

    get(key) {
        return this.data[key];
    }
}

chrome.storage.local.set({ logoffTime: 1673908787000 }).then(() => {
    console.log("Value is set to ");
});

fetch("save.json")
    .then((response) => response.json())
    .then((json) => {
        data = new DataStorage();
        data.set("gnomes", json.gnomes);
        simulation_time = json.logoffTime;
        simulation_time = Date.now();
    });

function run_tick() {
    let gnomes = data.get("gnomes");
    for (i = 0; i < gnomes.length; i++) {
        let gnome = gnomes[i];
        let vx = Math.cos(gnome.heading) * 0.5;
        let vy = Math.sin(gnome.heading) * 0.5;
        gnome.x += vx;
        gnome.y += vy;
    }
}

setTimeout(() => {
    setInterval(() => {
        while (Date.now() - simulation_time > 8) {
            run_tick();
            simulation_time += 8;
        }
    }, 16);
}, 100);


function draw() {

    // wind = wind + (Math.random() - 0.5) * 0.01;
    wind = wind * 0.999;
    //draw the background
    GRASS = "#82d479";
    GRASS_BLADE_1 = "#519645";
    GRASS_BLADE_2 = "#419633";
    mainCanvas.width = mainCanvas.clientWidth;
    mainCanvas.height = mainCanvas.clientHeight;


    if (grass_blades.length == 0) {
        var noisefn = fn === "simplex" ? noise.simplex2 : noise.perlin2;
        for (i = 0; i < 3000; i++) {
            let x = Math.random() * canvas_width;
            let y = Math.random() * canvas_height;
            grass_blades.push({
                x: x,
                y: y,
                offset: noisefn(x / 350, y / 350) * Math.PI + Math.PI,
            });
        }
    }
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, canvas_width, canvas_height);
    // draw the grass blades
    for (i = 0; i < grass_blades.length; i++) {
        ctx.beginPath();
        ctx.moveTo(grass_blades[i].x, grass_blades[i].y);
        rotation =
            Math.sin(Date.now() * 0.0005 + grass_blades[i].offset) * 0.3 -
            Math.PI / 2 +
            wind;
        ctx.lineTo(
            grass_blades[i].x + Math.cos(rotation) * 20,
            grass_blades[i].y + Math.sin(rotation) * 20
        );
        ctx.lineWidth = 2;
        if (grass_blades[i].y % 100 < 50) {
            ctx.strokeStyle = GRASS_BLADE_1;
        } else {
            ctx.strokeStyle = GRASS_BLADE_2;
        }
        ctx.stroke();
    }

    // draw the holes
    /*let x_spacing = canvas_width * 0.235;
    let y_spacing = canvas_height * 0.235;
    let vertical_offset = canvas_height * -0.045;
    for (x = -1; x < 2; x++) {
        for (y = -1; y < 2; y++) {
            ctx.drawImage(
                hole_img,
                x_spacing * x + canvas_width / 2 - hole_size / 2,
                y_spacing * y +
                    canvas_height / 2 -
                    hole_size / 2 +
                    vertical_offset,
                hole_size,
                hole_size
            );
        }
    }*/

    for(let hole = 0; hole < holePositions.length; hole++){
        // call ctx.drawImage() for each position, and pass in the value for the keys 'xPox', 'yPos', 'width', and 'height'
        ctx.drawImage(
            hole_img,
            holePositions[hole].xPos,
            holePositions[hole].yPos,
            hole_size,
            hole_size
            );
    }

    let gnomes = data.get("gnomes");
    for (i = 0; i < gnomes.length; i++) {
        let gnome = gnomes[i];
        t = Date.now() * 0.01 + gnome.waddleOffset;
        u_d = -Math.abs(Math.sin(t)) * 15;
        l_r = Math.cos(t) * (1 - Math.abs(Math.cos(gnome.heading))) * 8;
        g = 1 + Math.min(0, Math.abs(Math.sin(t)) - 0.5) * 0.25;
        ctx.drawImage(
            gnome_imgs[gnome.num - 1],
            gnome.x + l_r,
            gnome.y + u_d - gnome_size * g,
            gnome_size,
            gnome_size * g
        );
    }
}


function handleClick(e){
    let posX = e.clientX;
    let posY = e.clientY;
    // if holding tool or item
    if(holdingitem){
        if(itemHeld == 'Shovel'){
            // if clicked on hole
            



            // dig hole && purchase hole

        }
    }
    // if clicked on gnome / enemy / mob
}