var mainCanvas;
var ctx;
var canvas_width;
var canvas_height;

var holdingitem = false;
var itemHeld = null;

var holePositions = [];

hole_size = 100;
gnome_size = 100;
coin_size = 40;
wind = 0;
gravitationalConstant = 0.4;


coinDropInterval = 10000;
inHoleCoinBoost = 3;
enchantedCoinBoost = 3;

function resetProgress() {
    for (let i = 0; i < data.datapoints.length; i++) {
        data.set(data.datapoints[i], data.defaults[i]);
    }
    data.save();
}

function ready() {
    mainCanvas = document.getElementById("mainCanvas");
    ctx = mainCanvas.getContext("2d");
    canvas_width = mainCanvas.clientWidth;
    canvas_height = mainCanvas.clientHeight;
    document
        .getElementById("mainCanvas")
        .addEventListener("click", handleClick);
    document
        .getElementById("mainCanvas")
        .addEventListener("mousemove", handleMouseMove);

    generateHoles();
    setInterval(draw, 1000 / 60);
    console.log(holePositions);

    generateUI();
}

function generateUI() {
    let buttons = document.getElementsByClassName("toolbar_button");
    for (let i = 0; i < buttons.length; i++) {
        rot_value = Math.random() * 360;
        let css =
            ".toolbar_button_" + i + "::after {rotate: " + rot_value + "deg;}";
        let style = document.createElement("style");
        style.innerHTML = css;
        document.getElementsByTagName("head")[0].appendChild(style);
        buttons[i].classList.add("toolbar_button_" + i);
    }

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
        document
            .getElementById("inventory")
            .classList.toggle("inventory-hidden");
        inventoryButton
            .getElementsByClassName("button-icon")[0]
            .classList.toggle("inventory-icon-toggled");
    });

    fetch("gnomes.txt")
        .then((response) => response.text())
        .then((text) => generateGnomeDex(text));
}

function generateHoles(
    numHoleRows = 3,
    numHoleCols = 3,
    x_spacing = 140,
    y_spacing = 20
) {
    // the above set defaults if no value is passed
    let newHoles = [];

    let total_width = numHoleCols * hole_size + (numHoleCols - 1) * x_spacing;
    let total_height = numHoleRows * hole_size + (numHoleRows - 1) * y_spacing;
    let left_offset = (canvas_width - total_width) / 2;
    let top_offset = (canvas_height - total_height) / 2 - canvas_height * 0.045;

    for (let row = 0; row < numHoleRows; row++) {
        for (let column = 0; column < numHoleCols; column++) {
            newHoles.push({
                xPos: left_offset + column * (x_spacing + hole_size),
                yPos: top_offset + row * (y_spacing + hole_size),
                x: column,
                y: row,
            });
        }
    }
    console.log(newHoles);
    holePositions = newHoles;

}

function generateGnomeDex(data) {
    // get rid of new lines in data
    data = data.replace(/(\r\n|\n|\r)/gm, "");

    let lines = data.split(";");
    const linesPerGnomeEntry = 3;
    let numGnomes = Math.floor(lines.length / linesPerGnomeEntry);

    let highestGnomeDiscovered = 3; //TODO: this should pull from save.json file

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

        if (highestGnomeDiscovered <= i) {
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

var camera_x = 0
var camera_y = 0

var camera_approach_x = 0
var camera_approach_y = 0

const checker = setInterval(() => {
    console.log(document.getElementById("mainCanvas"));
    if (document.getElementById("mainCanvas") != null) {
        setTimeout(ready, 50);
        // ready();
        console.log("starting");

        clearInterval(checker);
    }
}, 10);


grass_blades = [];

var fn = "simplex";

hole_img = document.createElement("img");
hole_img.src = "gnomes/Hole.png";

hole_front_img = document.createElement("img");
hole_front_img.src = "gnomes/Hole Front.png";

coin_img = document.createElement("img");
coin_img.src = "gnomes/Coin.png";

gnome_imgs = [];
for (i = 1; i <= 16; i++) {
    gnome_imgs.push(document.createElement("img"));
    gnome_imgs[i - 1].src = "gnomes/Level " + i + ".png";
}
console.log(gnome_imgs);

moving_coins = [];

class DataStorage {
    constructor() {
        this.data = {};
        this.lastSave = Date.now() + 1000000000;
        this.datapoints = ["logoffTime", "gnomes", "holes", "inventory", "coinEntities", "coinsInCurrentRun", "totalCoins", "totalResets"];
        this.defaults = [
            Date.now(),
            [
                {
                    x: 300,
                    y: 200,
                    num: 1,
                    id: 4,
                    customData: {
                        "ai_mode": "idle", // idle, pathfind, wander, disabled
                        "targets": [],
                        "heading": 1,
                        "nextCoinTime": Date.now()
                    },
                },
            ],
            [
                {
                    "x": 0,
                    "y": 0,
                    "contents": null
                },
                {
                    "x": 1,
                    "y": 2,
                    "contents": {
                        "num": 3,
                        "id": 9,
                        "customData": {
                            "ai_mode": "idle",
                            "targets": [],
                            "heading": 0,
                            "nextCoinTime": Date.now()
                        }
                    }
                }
            ],
            [
                {
                    "name": "Seed 1",
                    "amount": 1,
                    "discovered": true
                },
                {
                    "name": "Seed 2",
                    "amount": 148,
                    "discovered": true
                },
                {
                    "name": "Seed 3",
                    "amount": 0,
                    "discovered": false
                }
            ],
            [],
            0,
            0,
            0
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
        let val = {};
        for (let i = 0; i < data.datapoints.length; i++) {
            val[data.datapoints[i]] = JSON.stringify(
                data.data[data.datapoints[i]]
            );
        }
        chrome.storage.local.set(val, () => {
            console.log("Stored");
        });
    }

    load() {
        var dp = this.datapoints;
        var defau = this.defaults;
        var dat = this;
        chrome.storage.local.get(this.datapoints, function (items) {
            for (i = 0; i < dp.length; i++) {
                let key = dp[i];
                console.log(key);
                if (key in items) {
                    console.log("taking from storage");
                    dat.set(key, JSON.parse(items[key]));
                } else {
                    console.log("taking from default");
                    dat.set(key, defau[i]);
                }
                dat.set(key, defau[i]);
            }
            dat.loaded = true;
        });
    }

    get(key) {
        return this.data[key];
    }
}

var data = new DataStorage();
console.log(data.datapoints);
setTimeout(() => {
    data.load();
    setTimeout(() => {
        data.save();
    }, 200);
}, 200);

var resetting = false;


function run_tick(gameTime) {
    let holes = data.get("holes");
    let gs = data.get("gnomes");
    let gnomes = [];
    for (i = 0; i < gs.length; i++) {
        let gnome = gs[i];
        gnome.coinBoost = 1;
        gnomes.push(gnome);
    }
    for (i = 0; i < holes.length; i++){
        if (holes[i].contents != null){
            let gnome = holes[i].contents;
            for (j = 0; j < holePositions.length; j++){
                if (holePositions[j].x == holes[i].x && holePositions[j].y == holes[i].y){
                    gnome.x = holePositions[j].xPos;
                    gnome.y = holePositions[j].yPos+gnome_size-5;
                    gnome.coinBoost = inHoleCoinBoost;
                    // console.log(gnome)
                    gnomes.push(gnome);
                }
            }
        }
    }
    // console.log(gnomes)
    for (i = 0; i < gnomes.length; i++) {   
        let gnome = gnomes[i];
        let coinTime = gnome.customData.nextCoinTime;
        if(coinTime < gameTime) {
            gnome.customData.nextCoinTime = gameTime + coinDropInterval/gnome.coinBoost;
            dropCoin(1, gnome.x + gnome_size/2, gnome.y - gnome_size*0.8);
        }
        let ai_mode = gnome.customData.ai_mode;
        if (ai_mode == "wander") {
            let vx = Math.cos(gnome.customData.heading) * 0.5;
            let vy = Math.sin(gnome.customData.heading) * 0.5;
            gnome.x += vx;
            gnome.y += vy;
        }
    }
    let coinEntities = data.get("coinEntities");
    for (i = 0; i < coinEntities.length; i++) {
        let coin = coinEntities[i];
        let yeetStrengthYOffset = 0;
        if(coin.z > 0){
            yeetStrengthYOffset = 0.7;
        }

        coin.x += coin.yeetStrength * Math.cos(coin.heading);
        coin.y -= (coin.yeetStrength - yeetStrengthYOffset) * Math.sin(coin.heading)  + coin.yeetStrengthZ;
        coin.z += coin.yeetStrengthZ;
        coin.yeetStrengthZ -= gravitationalConstant;
        if (coin.z <= 0) {
            coin.yeetStrength = 0;
            coin.yeetStrengthZ = 0;
        }
        // console.log(Math.cos(coin.heading));
        // console.log(coin.heading);
    }
}

setTimeout(() => {
    setInterval(() => {
        if (!data.loaded) {
            return;
        }
        if (Date.now() - data.get("logoffTime") > 8) {
            run_tick(data.get("logoffTime"));
            data.set("logoffTime", data.get("logoffTime") + 8);
        }
    }, 3);
}, 100);

function draw() {
    let evaluation = data.get('coinsInCurrentRun');
    for (let i = 0; i < moving_coins.length; i++) {
        evaluation -= moving_coins[i].amount;
    }
    document.getElementById('coin-count').innerText = evaluation;
    camera_x = camera_x * 0.9 + camera_approach_x * 0.1;
    camera_y = camera_y * 0.9 + camera_approach_y * 0.1;
    wind = wind + (Math.random() - 0.5) * 0.01;
    wind = wind * 0.999;
    mainCanvas = document.getElementById("mainCanvas");
    ctx = mainCanvas.getContext("2d");
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
        ctx.moveTo(grass_blades[i].x-camera_x, grass_blades[i].y-camera_y);
        rotation =
            Math.sin(Date.now() * 0.0005 + grass_blades[i].offset) * 0.3 -
            Math.PI / 2 +
            wind;
        ctx.lineTo(
            grass_blades[i].x + Math.cos(rotation) * 20-camera_x,
            grass_blades[i].y + Math.sin(rotation) * 20-camera_y
        );
        ctx.lineWidth = 2;
        if (grass_blades[i].y % 100 < 50) {
            ctx.strokeStyle = GRASS_BLADE_1;
        } else {
            ctx.strokeStyle = GRASS_BLADE_2;
        }
        ctx.stroke();
    }
    if (!data.loaded) {
        return;
    }


    let holes = data.get("holes");
    for (let hole = 0; hole < holePositions.length; hole++) {
        for (let i = 0; i < holes.length; i++) {
            if (holes[i].x == holePositions[hole].x && holes[i].y == holePositions[hole].y) {
                ctx.drawImage(
                    hole_img,
                    holePositions[hole].xPos-camera_x,
                    holePositions[hole].yPos-camera_y,
                    hole_size,
                    hole_size
                );
            }
        }
    }

    for (let i = 0; i < moving_coins.length; i++) {
        let coin = moving_coins[i];
        //move coin towards coin icon in the top left
        let coin_icon_x = 25;
        let coin_icon_y = 25;
        let coin_icon_size = 50;
        let coin_icon_center_x = coin_icon_x + coin_icon_size / 2;
        let coin_icon_center_y = coin_icon_y + coin_icon_size / 2;
        let coin_center_x = coin.scr_x + coin_size / 2;
        let coin_center_y = coin.scr_y + coin_size / 2;
        let coin_to_icon_x = coin_icon_center_x - coin_center_x;
        let coin_to_icon_y = coin_icon_center_y - coin_center_y;
        let coin_to_icon_distance = Math.sqrt(
            coin_to_icon_x * coin_to_icon_x + coin_to_icon_y * coin_to_icon_y
        );
        let coin_to_icon_x_normalized = coin_to_icon_x / coin_to_icon_distance;
        let coin_to_icon_y_normalized = coin_to_icon_y / coin_to_icon_distance;
        let coin_to_icon_speed = 60;
        if (coin_to_icon_distance < coin_to_icon_speed) {
            coin_to_icon_speed = coin_to_icon_distance;
        }
        coin.scr_x += coin_to_icon_x_normalized * coin_to_icon_speed;
        coin.scr_y += coin_to_icon_y_normalized * coin_to_icon_speed;
        if (coin_to_icon_distance < 10) {
            moving_coins.splice(i, 1);
            i--;
        }
    }
    let coins_to_draw = [];
    let coinEntities = data.get("coinEntities");
    for (let i = 0; i < coinEntities.length; i++) {
        coins_to_draw.push({
            x: coinEntities[i].x-camera_x,
            y: coinEntities[i].y-camera_y,
        });
    }
    for (let i = 0; i < moving_coins.length; i++) {
        coins_to_draw.push({
            x: moving_coins[i].scr_x,
            y: moving_coins[i].scr_y,
        });
    }
    for (let i = 0; i < coins_to_draw.length; i++) {
        let coin = coins_to_draw[i];
        ctx.drawImage(
            coin_img,
            coin.x,
            coin.y,
            coin_size,
            coin_size
        );
    }

    let gs = data.get("gnomes");
    let gnomes = [];
    for (i = 0; i < gs.length; i++) {
        let gnome = gs[i];
        gnomes.push(gnome);
    }
    for (i = 0; i < holes.length; i++){
        if (holes[i].contents != null){
            let gnome = holes[i].contents;
            for (j = 0; j < holePositions.length; j++){
                if (holePositions[j].x == holes[i].x && holePositions[j].y == holes[i].y){
                    gnome.x = holePositions[j].xPos;
                    gnome.y = holePositions[j].yPos+gnome_size-5;
                    gnomes.push(gnome);
                }
            }
        }
    }
    for (i = 0; i < gnomes.length; i++) {
        let gnome = gnomes[i];
        t = Date.now() * 0.01 + gnome.id;
        if (gnome.customData.ai_mode == "wander" || gnome.customData.ai_mode == "pathfind") {
            u_d = -Math.abs(Math.sin(t)) * 15;
            l_r = Math.cos(t) * (1 - Math.abs(Math.cos(gnome.customData.heading))) * 8;
        } else {
            u_d = 0;
            l_r = 0;
        }
        if (gnome.customData.ai_mode == "disabled") {
            g = 0
        } else {
            g = 1 + Math.min(0, Math.abs(Math.sin(t)) - 0.5) * 0.25;
        }
        ctx.drawImage(
            gnome_imgs[gnome.num - 1],
            gnome.x + l_r-camera_x,
            gnome.y + u_d - gnome_size * g-camera_y,
            gnome_size,
            gnome_size * g
        );
    }
    
    for (i = 0; i < holes.length; i++){
        if (holes[i].contents != null){
            for (j = 0; j < holePositions.length; j++){
                if (holePositions[j].x == holes[i].x && holePositions[j].y == holes[i].y){
                    ctx.drawImage(
                        hole_front_img,
                        holePositions[j].xPos-camera_x,
                        holePositions[j].yPos-camera_y,
                        hole_size,
                        hole_size
                    );
                }
            }
        }
    }

}

function handleClick(e) {
    let posX = e.clientX;
    let posY = e.clientY;
    // if holding tool or item
    if (holdingitem) {
        if (itemHeld == "Shovel") {
            // if clicked on hole
            // dig hole && purchase hole
        }
    }
    // if clicked on a gnome / enemy / mob
}

function dropCoin(amount, xPos, yPos){
    console.log("dropping coin");
    let coinEntities = data.get("coinEntities");
    coinEntities.push({
        x: xPos,
        y: yPos,
        z: 0,
        amount: amount,
        id: Math.random(),
        initialYPos: yPos,
        heading: Math.random() * 2 * Math.PI,
        yeetStrength: Math.random() * 1.5 + 2,
        yeetStrengthZ: Math.random() * 5.5 + 5,
    });
    data.set("coinEntities", coinEntities);
}

function handleMouseMove(e){
    let posX = e.clientX+camera_x;
    let posY = e.clientY+camera_y;
    // check if mouse is over coin:
    let coinEntities = data.get("coinEntities");
    for (let i = 0; i < coinEntities.length; i++) {
        let coin = coinEntities[i];
        if (posX > coin.x && posX < coin.x + coin_size && posY > coin.y && posY < coin.y + coin_size) {
            coinEntities.splice(i, 1);
            data.set("coinsInCurrentRun", data.get("coinsInCurrentRun") + coin.amount);
            moving_coins.push({
                scr_x: coin.x-camera_x,
                scr_y: coin.y-camera_y,
                amount: coin.amount
            });
        }
    }
}