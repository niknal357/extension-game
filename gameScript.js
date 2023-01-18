setTimeout(ready, 100);

function ready() {
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

function generateGnomeDex(data) {
    // get rid of new lines in data
    data = data.replace(/(\r\n|\n|\r)/gm, "");
    console.log(data);

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

var to_store = [];

setInterval(() => {
    let clearing = to_store.length;
    console.log(to_store)
    if (clearing == 0) {
        return;
    }
    let datar = to_store.pop();
    console.log(datar);
    let key = datar["key"];
    let data = datar["data"];
    console.log(key, data)
    console.log(JSON.stringify(data))
    let val = {}
    val[key] = JSON.stringify(data);
    chrome.storage.sync.set(val, () => {
        console.log("Stored "+JSON.stringify(data)+ " in "+key)
    })
}, 100);

class DataStorage {
    constructor() {
        this.data = {};
        this.lastSave = Date.now()+1000000000;
        this.datapoints = ["gnomes", "holes", "inventory", "logoffTime", "inventory"];
        this.defaults = [
            [
                {
                    x: 60,
                    y: 60,
                    heading: 1,
                    num: 1,
                    waddleOffset: 4,
                    customData: {}
                }
            ],
            [],
            [],
            [],
            Date.now()
        ];
        this.loaded = false;
    }

    set(key, value) {
        this.data[key] = value;
        if (this.lastSave + 1000 < Date.now()) {
            this.save();
        }
    }

    save() {
        this.lastSave = Date.now();
        var dat = this
        for (i = 0; i < dat.datapoints.length; i++) {
            let key = dat.datapoints[i];
            console.log(key, dat.get(key))
            to_store.push({"key": key, "data": dat.get(key)})
        }
    }

    load() {
        var dp = this.datapoints
        var defau = this.defaults
        var dat = this
        chrome.storage.sync.get(this.datapoints, function(items){
            for (i = 0; i < dp.length; i++) {
                let key = dp[i];
                console.log(key)
                if (key in items) {
                    console.log('taking from storage')
                    dat.set(key, JSON.parse(items[key]));
                } else {
                    console.log('taking from default')
                    dat.set(key, defau[i]);
                }
                // dat.set(key, defau[i]);
            }
            simulation_time = dat.get("logoffTime");
            dat.loaded = true;
        })
    }

    get(key) {
        return this.data[key];
    }
}

var data = new DataStorage();
console.log(data.datapoints)
setTimeout(() => {
    data.load()
    setTimeout(() => {
        data.save()
    }, 200)
}, 200);

var resetting = false

var simulation_time = 0;



// fetch("save.json")
//     .then((response) => response.json())
//     .then((json) => {
//         data = new DataStorage();
//         data.set("gnomes", json.gnomes);
//         simulation_time = json.logoffTime;
//         simulation_time = Date.now();
//     });

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
        if (Date.now() - simulation_time > 8) {
            run_tick();
            simulation_time += 8;
            data.set("logoffTime", simulation_time);
            // console.log(Date.now()-simulation_time)
        }
    }, 3);
}, 1000);

hole_size = 100;
gnome_size = 100;
wind = 0;

function draw() {
    wind = wind + (Math.random() - 0.5) * 0.01;
    wind = wind * 0.999;
    // console.log(wind);
    mainCanvas = document.getElementById("mainCanvas");
    ctx = mainCanvas.getContext("2d");
    //draw the background
    GRASS = "#82d479";
    GRASS_BLADE_1 = "#519645";
    GRASS_BLADE_2 = "#419633";
    mainCanvas.width = mainCanvas.clientWidth;
    mainCanvas.height = mainCanvas.clientHeight;

    canvas_width = mainCanvas.clientWidth;
    canvas_height = mainCanvas.clientHeight;

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
    //draw the grass blades
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
    if (!data.loaded){
        return
    }
    x_spacing = canvas_width * 0.235;
    y_spacing = canvas_height * 0.235;
    vertical_offset = canvas_height * -0.045;
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
