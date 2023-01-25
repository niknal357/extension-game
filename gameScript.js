var mainCanvas;
var ctx;
var canvas_width;
var canvas_height;

var holdingitem = false;
var itemHeld = null;

var holdingTool = false;
var toolHeld = null;

var holePositions = [];

var camera_x = 0;
var camera_y = 0;

var camera_approach_x = 0;
var camera_approach_y = 0;

hole_size = 100;
gnome_size = 100;
coin_size = 40;
wind = 0;
gravitationalConstant = 0.4;

var canvas_width = 750;
var canvas_height = 550;

COIN_LIMIT = 2000;

coinDropInterval = 60000;
inHoleCoinBoost = 3;
enchantedCoinBoost = 3;

ghostHoles = [];
debugMessages = [];

function resetProgress() {
    for (let i = 0; i < data.datapoints.length; i++) {
        data.set(data.datapoints[i], data.defaults[i]);
    }
    data.save();
}

var isDown = false;
var isMoving = false;
var holdingitem = false;
var itemHeld = null;
var mouse_pos = { x: 0, y: 0 };
var grab_offset = { x: 0, y: 0 };
var rooms = [
    ["trader", "main"]
]
var current_room = "main";

var tot_room_width = rooms[0].length * canvas_width;
var tot_room_height = rooms.length * canvas_height;

function getOffset(room){
    for (let y = 0; y < rooms.length; y++) {
        for (let x = 0; x < rooms[y].length; x++) {
            console.log(rooms[y][x])
            if (rooms[y][x] == room){
                return {x: x*canvas_width, y: y*canvas_height}
            }
        }
    }
}

var starting_room = "main";

function ready() {
    mainCanvas = document.getElementById("mainCanvas");
    ctx = mainCanvas.getContext("2d");
    generateHoles();
    document
        .getElementById("mainCanvas")
        .addEventListener("click", handleClick);
    document
        .getElementById("mainCanvas")
        .addEventListener("mousemove", handleMouseMove);
    
    document.getElementById('toolbar-button-1').addEventListener('click', toggleHoldingShovel);
    
    document.body.addEventListener("keypress", handleKeyPress);
    camera_approach_x = getOffset(current_room).x;
    camera_approach_y = getOffset(current_room).y;
    camera_x = camera_approach_x;
    camera_y = camera_approach_y;
    setTimeout(() => {
        setInterval(draw, 1000 / 60);
    }, 10);
    // console.log(holePositions);

    var loaded_detector = setInterval(() => {
        if (data.loaded) {
            clearInterval(loaded_detector);
            generateUI();
        }
    }, 10);

    debugMessage("Version 0.0.1 loaded.");
    debugMessage(Date.now());

    //detect click and drag on the canvas if the mouse if over a gnome
    document.addEventListener("mousedown", function (e) {
        if (e.target == mainCanvas) {
            isDown = true;
        }
    });
    document.addEventListener("mouseup", function (e) {
        if (e.target == mainCanvas) {
            isDown = false;
        }
    });
    document.addEventListener("mousemove", function (e) {
        if (e.target == mainCanvas) {
            isMoving = true;
            mouse_pos = getMousePos(mainCanvas, e);
        }
    });
    document.addEventListener("mouseout", function (e) {
        if (e.target == mainCanvas) {
            isMoving = false;
        }
    });

    document.getElementById("traderSign").addEventListener("click", () =>{
        set_room("trader");
    });
    

    setInterval(() => {
        if (!data.loaded) {
            return;
        }
        if (start_chase != 0) {
            return;
        }
        let gnomes = data.get("gnomes");
        let gnome_collection = [];
        let holes = data.get("holes");
        for (let i = 0; i < holes.length; i++) {
            if (holes[i].contents != null) {
                gnome_collection.push(holes[i].contents);
            }
        }
        for (let i = 0; i < gnomes.length; i++) {
            gnome_collection.push(gnomes[i]);
        }
        // console.log(holes);
        if (isDown && isMoving) {
            if (!holdingitem) {
                for (let i = gnome_collection.length-1; i >= 0; i--) {
                    if (
                        mouse_pos.x > gnome_collection[i].x &&
                        mouse_pos.x < gnome_collection[i].x + gnome_size &&
                        mouse_pos.y < gnome_collection[i].y &&
                        mouse_pos.y > gnome_collection[i].y - gnome_size
                    ) {
                        holdingitem = true;
                        itemHeld = gnome_collection[i];
                        itemHeld.customData.ai_mode = "disabled";
                        // if gnome is in hole, remove it from hole and add it to gnomes
                        if (itemHeld.customData.inHole) {
                            gnomes.push(itemHeld);
                            for (j = 0; j < holes.length; j++) {
                                if (holes[j].contents == itemHeld) {
                                    holes[j].contents = null;
                                }
                            }
                            // holes[holes.indexOf(itemHeld)].contents = null;
                            itemHeld.customData.inHole = false;
                        } else {
                            gnomes.splice(gnomes.indexOf(itemHeld), 1);
                            gnomes.push(itemHeld);
                        }
                        data.set("gnomes", gnomes);
                        data.set("holes", holes);
                        grab_offset = {
                            x: mouse_pos.x - itemHeld.x,
                            y: mouse_pos.y - itemHeld.y,
                        };
                        break;
                    }
                }
            } else {
                itemHeld.x = mouse_pos.x - grab_offset.x;
                itemHeld.y = mouse_pos.y - grab_offset.y;
                data.set("gnomes", gnomes);
            }
        } else {
            if (holdingitem) {
                itemHeld.customData.ai_mode = "wander";
                data.set("gnomes", gnomes);
            }
            holdingitem = false;
            itemHeld = null;
        }
    }, 1000 / 60);
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left + camera_x,
        y: event.clientY - rect.top + camera_y,
    };
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
    inventoryButton.addEventListener("click", toggleInventory); 

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
                xPos: left_offset + column * (x_spacing + hole_size)+getOffset("main").x,
                yPos: top_offset + row * (y_spacing + hole_size)+getOffset("main").y,
                x: column,
                y: row,
            });
        }
    }
    holePositions = newHoles;
}

function generateGnomeDex(gnomeDescData) {
    // get rid of new lines in data
    document.getElementById("gnome-dex").innerHTML = '<h1 id="gd-title">GNOME-DEX</h1>';
    gnomeDescData = gnomeDescData.replace(/(\r\n|\n|\r)/gm, "");

    let lines = gnomeDescData.split(";");
    const linesPerGnomeEntry = 3;
    let numGnomes = Math.floor(lines.length / linesPerGnomeEntry);

    let highestGnomeDiscovered = data.get("highestGnomeDiscovered");
    console.log("asdhad872788  " + highestGnomeDiscovered);

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

const checker = setInterval(() => {
    // console.log(document.getElementById("mainCanvas"));
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
        this.datapoints = [
            "logoffTime",
            "gnomes",
            "holes",
            "inventory",
            "coinEntities",
            "coinsInCurrentRun",
            "totalCoins",
            "totalResets",
            "highestGnomeDiscovered",
            "msUntillForGnomeSpawnMin",
            "msUntillForGnomeSpawnMax",
            "timeOfNextGnomeSpawn",
        ];
        let restartOffset = 0;
        this.defaults = [
            Date.now() - restartOffset * 1000,
            [],
            [
                {
                    x: 1,
                    y: 1,
                    contents: null,
                },
            ],
            [
                {
                    name: "Seed 1",
                    amount: 1,
                    discovered: true,
                },
                {
                    name: "Seed 2",
                    amount: 148,
                    discovered: true,
                },
                {
                    name: "Seed 3",
                    amount: 0,
                    discovered: false,
                },
            ],
            [],
            0,
            0,
            0,
            1,
            7000,
            10000,
            Date.now() - restartOffset * 1000,
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
                // comment this out to enable saving
                // dat.set(key, defau[i]);
            }
            dat.loaded = true;
        });
    }

    get(key) {
        return this.data[key];
    }
}

function coinXYZtoScreen(x, y, z) {
    let screenX = x - camera_x;
    let screenY = y - camera_y - z * 0;
    return [screenX, screenY];
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

function run_tick(gameTime, deltaT, advanced) {
    updateHoles(gameTime, deltaT, advanced);
    updateGnomes(gameTime, deltaT, advanced);
    updateCoins(gameTime, deltaT, advanced);
}

var start_chase = 0;

setTimeout(() => {
    setInterval(() => {
        if (!data.loaded) {
            return;
        }
        let tickrate = 16;
        let p_bar = document.getElementById("catchup-bar");
        if (Date.now() - data.get("logoffTime") > 60) {
            start_chase = data.get("logoffTime");
            p_bar.classList.remove("hidden");
        } else {
            start_chase = 0;
            p_bar.classList.add("hidden");
        }
        // console.log(Date.now() - data.get("logoffTime"));
        let iterations = 0;
        if (Date.now() - data.get("logoffTime") > 60 * 60) {
            tickrate = 1000;
        }
        while (Date.now() - data.get("logoffTime") > tickrate / 2) {
            p_bar.value =
                (data.get("logoffTime") - start_chase) /
                (Date.now() - start_chase);
            run_tick(data.get("logoffTime"), tickrate, start_chase == 0);
            data.set("logoffTime", data.get("logoffTime") + tickrate);
            if (iterations > 10000) {
                break;
            }
            iterations++;
        }
    }, 3);
}, 300);

function updateHoles(gameTime, deltaT, advanced) {
    // Hole Suction
    let holes = data.get("holes");
    let gnomes = data.get("gnomes");

    for (i = 0; i < holes.length; i++) {
        let hole = holes[i];
        for (j = 0; j < holePositions.length; j++) {
            let pos = holePositions[j];
            if (pos.x == hole.x && pos.y == hole.y) {
                scr_x = pos.xPos;
                scr_y = pos.yPos;
            }
        }
        if (hole.contents != null) {
            continue;
        }
        let closestGnome = null;
        let closestGnomeDist = 10000;
        for (j = 0; j < gnomes.length; j++) {
            let gnome = gnomes[j];
            if (gnome.customData.ai_mode == "disabled") {
                continue;
            }
            let dist = Math.sqrt(
                Math.pow(gnome.x - gnome_size / 2 - scr_x + hole_size / 2, 2) +
                    Math.pow(
                        gnome.y - gnome_size / 2 - scr_y - hole_size / 2,
                        2
                    )
            );
            if (dist < closestGnomeDist) {
                closestGnome = gnome;
                closestGnomeDist = dist;
            }
        }
        if (closestGnome == null) {
            continue;
        }
        if (closestGnomeDist > gnome_size * 0.7) {
            continue;
        }
        closestGnome.x = scr_x;
        closestGnome.y = scr_y;
        closestGnome.customData.nextCoinTime = Math.min(closestGnome.customData.nextCoinTime, gameTime+coinDropInterval)
        closestGnome.customData.ai_mode = "idle";
        closestGnome.customData.inHole = true;
        hole.contents = closestGnome;
        gnomes.splice(gnomes.indexOf(closestGnome), 1);
        break;
    }
}
function updateGnomes(gameTime, deltaT, advanced) {
    // Handle Gnome Move
    let holes = data.get("holes");
    let gs = data.get("gnomes");
    let gnomes = [];
    for (i = 0; i < gs.length; i++) {
        let gnome = gs[i];
        gnome.coinBoost = 1;
        gnomes.push(gnome);
    }

    for (i = 0; i < holes.length; i++) {
        if (holes[i].contents != null) {
            let gnome = holes[i].contents;
            for (j = 0; j < holePositions.length; j++) {
                if (
                    holePositions[j].x == holes[i].x &&
                    holePositions[j].y == holes[i].y
                ) {
                    gnome.x = holePositions[j].xPos;
                    gnome.y = holePositions[j].yPos + gnome_size - 5;
                    gnome.coinBoost = inHoleCoinBoost;
                    gnomes.push(gnome);
                }
            }
        }
    }
    for (i = 0; i < gnomes.length; i++) {
        let gnome = gnomes[i];
        while (gnome.customData.nextCoinTime < gameTime) {
            let v = Math.pow(1.02016, 31.6206 * gnome.num - 14.0401) - 0.420455;
            let f = Math.round(v);
            gnome.customData.nextCoinTime +=
                ((coinDropInterval / gnome.coinBoost) * f) / v;
            console.log("dropping coin with valuie " + f);
            dropCoin(
                f,
                gnome.x + gnome_size / 2 - coin_size / 2,
                gnome.y - gnome_size * 0.8 - coin_size / 2
            );
        }
        let ai_mode = gnome.customData.ai_mode;
        if (ai_mode == "wander") {
            let vx = Math.cos(gnome.customData.heading) * 0.03125;
            let vy = Math.sin(gnome.customData.heading) * 0.03125;
            gnome.x += vx * deltaT;
            gnome.y += vy * deltaT;
        }
    }

    // Merge Gnomes
    let found = false;
    var i, j, gnome1, gnome2;
    gnomes = data.get("gnomes");
    all_gnomes = [];
    for (i = 0; i < gnomes.length; i++) {
        all_gnomes.push(gnomes[i]);
    }
    for (i = 0; i < holes.length; i++) {
        if (holes[i].contents != null) {
            all_gnomes.push(holes[i].contents);
        }
    }
    for (i = 0; i < all_gnomes.length; i++) {
        gnome1 = all_gnomes[i];
        if (gnome1.customData.ai_mode == "disabled") {
            continue;
        }
        for (j = 0; j < gnomes.length; j++) {
            gnome2 = gnomes[j];
            if (gnome2.customData.ai_mode == "disabled") {
                continue;
            }
            if (gnome1 == gnome2) {
                continue;
            }
            if (gnome1.num != gnome2.num) {
                continue;
            }
            if (
                Math.abs(gnome1.x - gnome2.x) < gnome_size / 2 &&
                Math.abs(gnome1.y - gnome2.y) < gnome_size / 2
            ) {
                found = true;
                break;
            }
        }
        if (found) {
            break;
        }
    }
    if (found) {
        //remove j-th gnome
        gnome1.num += 1;
        if (data.get("highestGnomeDiscovered") < gnome1.num) {
            data.set("highestGnomeDiscovered", gnome1.num);
            fetch("gnomes.txt")
                .then((response) => response.text())
                .then((text) => generateGnomeDex(text));
        }
        gnome1.customData.nextCoinTime = Math.min(
            gnome1.customData.nextCoinTime,
            gnome2.customData.nextCoinTime
        );
        gnome1.x = (gnome1.x + gnome2.x) / 2;
        gnome1.y = (gnome1.y + gnome2.y) / 2;
        vx1 = Math.cos(gnome1.customData.heading);
        vy1 = Math.sin(gnome1.customData.heading);
        vx2 = Math.cos(gnome2.customData.heading);
        vy2 = Math.sin(gnome2.customData.heading);
        if (vx1 == vx2 && vy1 == vy2) {
            gnome1.customData.heading = Math.random() * 2 * Math.PI;
        } else {
            gnome1.customData.heading = Math.atan2(vy1 + vy2, vx1 + vx2);
        }
        gnomes.splice(j, 1);
    }
    data.set("gnomes", gnomes);

    // Spawning Gnomes
    let timeOfNextGnomeSpawn = data.get("timeOfNextGnomeSpawn");
    if (timeOfNextGnomeSpawn < gameTime) {
        let level = 1;
        let x = 0;
        let y = 0;
        spawnGnome(level, gameTime, x, y);
        let msUntillForGnomeSpawnMax = data.get("msUntillForGnomeSpawnMax");
        let msUntillForGnomeSpawnMin = data.get("msUntillForGnomeSpawnMin");
        let gnomeSpawnInterval =
            Math.floor(Math.random()) *
                (msUntillForGnomeSpawnMax - msUntillForGnomeSpawnMin) +
            msUntillForGnomeSpawnMin;
        data.set("timeOfNextGnomeSpawn", gameTime + gnomeSpawnInterval);
    }

    // despawn gnomes if they are too far away

    let breathingRoom = 100;
    let minXPos = 0 - gnome_size - breathingRoom+getOffset("main").x;
    let maxXPos = tot_room_width + gnome_size + breathingRoom+getOffset("main").x;
    let minYPos = 0 - gnome_size - breathingRoom+getOffset("main").y;
    let maxYPos = tot_room_height + gnome_size + breathingRoom+getOffset("main").y;

    for (i = 0; i < gnomes.length; i++) {
        gnome = gnomes[i];
        if (
            gnome.x < minXPos ||
            gnome.x > maxXPos ||
            gnome.y < minYPos ||
            gnome.y > maxYPos
        ) {
            gnomes.splice(i, 1);
            i--;
        }
    }
}

function updateCoins(gameTime, deltaT, advanced) {
    let cE = data.get("coinEntities");
    if (advanced || cE.length < 1000) {
        for (i = 0; i < cE.length; i++) {
            let coin = cE[i];
            if (
                coin.x + coin_size < 0 ||
                coin.x > mainCanvas.width ||
                coin.y + coin_size < 0 ||
                coin.y > mainCanvas.height
            ) {
                cE.splice(i, 1);
                i--;
                continue;
            }
            coin.xvel = coin.xvel * 0.99;
            coin.yvel = coin.yvel * 0.99;
            coin.zvel = coin.zvel * 0.99;
            coin.zvel -= 0.3;
            coin.x += coin.xvel;
            coin.y += coin.yvel;
            coin.z += coin.zvel;
            if (coin.z < 0) {
                coin.xvel = coin.xvel * 0.7;
                coin.yvel = coin.yvel * 0.7;
                coin.z = 0;
                coin.zvel = coin.zvel * -0.4;
            }

            let s_pos = coinXYZtoScreen(coin.x, coin.y, coin.z);
            let screenX = s_pos[0];
            let screenY = s_pos[1];
            if (screenX < 0) {
                coin.xvel += 0.5;
            }
            if (screenX + coin_size > mainCanvas.width) {
                coin.xvel -= 0.5;
            }
            if (screenY < 0) {
                coin.yvel += 0.5;
            }
            if (screenY + coin_size > mainCanvas.height) {
                coin.yvel -= 0.5;
            }
        }
        data.set("coinEntities", cE);
    }
}

function spawnGnome(
    level,
    gameTime,
    xPos,
    yPos,
    spawnHeading,
    ai_mode = "wander"
) {
    // console.log(
    //     "Spawning Gnome with level: " +
    //         level +
    //         " at x: " +
    //         xPos +
    //         " y: " +
    //         yPos +
    //         " heading: " +
    //         spawnHeading
    // );
    let gnomes = data.get("gnomes");

    if (level == undefined) {
        console.log("level is undefined");
        return;
    } else {
        // check if level is higher than highest gnome found
        if (level > data.get("highestGnomeDiscovered")) {
            data.set("highestGnomeDiscovered", level);
        }
    }

    let newId = Math.random() * 100;
    for (i = 0; i < gnomes.length; i++) {
        if (gnomes[i].id == newId) {
            newId = Math.random() * 100;
            i = 0;
        }
    }

    if (xPos == undefined || yPos == undefined || spawnHeading == undefined) {
        let minXPos = getOffset(current_room).x - gnome_size;
        let maxXPos = getOffset(current_room).x + canvas_width + gnome_size;
        let minYPos = getOffset(current_room).y - gnome_size;
        let maxYPos = getOffset(current_room).y + canvas_height + gnome_size;

        // if 1 in 2 chance
        if (Math.random() > 0.5) {
            // spawn on top or bottom
            yPos = maxYPos;
        } else {
            yPos = minYPos;
        }

        // make x pos random between min and max
        xPos = Math.random() * (maxXPos - minXPos) + minXPos;

        // make the heading towards the center of the screen with some randomness in radians
        spawnHeading =
            Math.atan2(
                mainCanvas.height / 2 - yPos,
                mainCanvas.width / 2 - xPos
            ) +
            ((Math.random() - 0.5) * Math.PI) / 4;
    }

    let newGnome = {
        x: xPos,
        y: yPos,
        num: level,
        id: newId,
        customData: {
            ai_mode: "wander",
            targets: [],
            heading: spawnHeading,
            nextCoinTime: Date.now() + 4000,
        },
    };
    gnomes.push(newGnome);
    data.set("gnomes", gnomes);
}

function render_gnomes(gnomes) {
    for (i = 0; i < gnomes.length; i++) {
        let gnome = gnomes[i];
        t = Date.now() * 0.01 + gnome.id;
        let cycle = -Math.abs(Math.sin(t))*20+5
        u_d_s = -Math.max(0, cycle)
        if (
            gnome.customData.ai_mode == "wander" ||
            gnome.customData.ai_mode == "pathfind"
        ) {
            u_d = Math.min(0, cycle)
            l_r =
                Math.cos(t) *
                (1 - Math.abs(Math.cos(gnome.customData.heading))) *
                8;
            s_d = 0
        } else {
            u_d = 0;
            l_r = 0;
            s_d = 0;
        }
        if (gnome.customData.ai_mode == "disabled") {
            g = 1;
            s_d = 0
        } else {
            g = 1 + u_d_s * 0.03;
            s_d = u_d_s * -6;
        }
        ctx.drawImage(
            gnome_imgs[gnome.num - 1],
            gnome.x + l_r - camera_x - s_d/2,
            gnome.y + u_d - gnome_size * g - camera_y,
            gnome_size + s_d,
            gnome_size * g
        );
    }
}

function set_room(room){
    current_room = room;
}

function draw() {
    camera_approach_x = getOffset(current_room).x;
    camera_approach_y = getOffset(current_room).y;
    if (!data.loaded) {
        return;
    }
    let evaluation = data.get("coinsInCurrentRun");
    for (let i = 0; i < moving_coins.length; i++) {
        evaluation -= moving_coins[i].amount;
    }

    document.getElementById("coin-count").innerText = evaluation;
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
    mainCanvas.width = canvas_width;
    mainCanvas.height = canvas_height;

    if (grass_blades.length == 0) {
        let offsets = [getOffset("main"), getOffset("trader")];
        for (let j = 0; j < offsets.length; j++) {
            let offset = offsets[j];
            var noisefn = fn === "simplex" ? noise.simplex2 : noise.perlin2;
            for (i = 0; i < 3000; i++) {
                let x = Math.random() * canvas_width+offset.x;
                let y = Math.random() * canvas_height+offset.y;
                grass_blades.push({
                    x: x,
                    y: y,
                    offset: noisefn(x / 350, y / 350) * Math.PI + Math.PI,
                });
            }
        }
    }
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, canvas_width, canvas_height);
    // draw the grass blades
    for (i = 0; i < grass_blades.length; i++) {
        ctx.beginPath();
        ctx.moveTo(grass_blades[i].x - camera_x, grass_blades[i].y - camera_y);
        rotation =
            Math.sin(Date.now() * 0.0005 + grass_blades[i].offset) * 0.3 -
            Math.PI / 2 +
            wind;
        ctx.lineTo(
            grass_blades[i].x + Math.cos(rotation) * 20 - camera_x,
            grass_blades[i].y + Math.sin(rotation) * 20 - camera_y
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
            if (
                holes[i].x == holePositions[hole].x &&
                holes[i].y == holePositions[hole].y
            ) {
                ctx.drawImage(
                    hole_img,
                    holePositions[hole].xPos - camera_x,
                    holePositions[hole].yPos - camera_y,
                    hole_size,
                    hole_size
                );
            }
        }
    }

    for (let i = 0; i < moving_coins.length; i++) {
        let coin = moving_coins[i];
        //move coin towards coin icon in the top left
        let coin_icon_x = 10;
        let coin_icon_y = 10;
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
            ``;
            i--;
        }
    }

    let gs = data.get("gnomes");
    let gnomes = [];
    for (i = 0; i < holes.length; i++) {
        if (holes[i].contents != null) {
            let gnome = holes[i].contents;
            for (j = 0; j < holePositions.length; j++) {
                if (
                    holePositions[j].x == holes[i].x &&
                    holePositions[j].y == holes[i].y
                ) {
                    gnome.x = holePositions[j].xPos;
                    gnome.y = holePositions[j].yPos + gnome_size - 5;
                    gnomes.push(gnome);
                }
            }
        }
    }
    render_gnomes(gnomes);

    for (i = 0; i < holes.length; i++) {
        if (holes[i].contents != null) {
            for (j = 0; j < holePositions.length; j++) {
                if (
                    holePositions[j].x == holes[i].x &&
                    holePositions[j].y == holes[i].y
                ) {
                    ctx.drawImage(
                        hole_front_img,
                        holePositions[j].xPos - camera_x,
                        holePositions[j].yPos - camera_y,
                        hole_size,
                        hole_size
                    );
                }
            }
        }
    }
    gnomes = [];
    for (i = 0; i < gs.length; i++) {
        let gnome = gs[i];
        gnomes.push(gnome);
    }
    render_gnomes(gnomes);
    let coins_to_draw = [];
    let coinEntities = data.get("coinEntities");
    for (let i = 0; i < coinEntities.length; i++) {
        coins_to_draw.push({
            x: coinEntities[i].x - camera_x,
            y: coinEntities[i].y - camera_y - coinEntities[i].z,
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
        ctx.drawImage(coin_img, coin.x, coin.y, coin_size, coin_size);
    }
    //draw square 200x200 at 0 0 for testing
    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, 200, 200);
}

function handleClick(e) {
    let posX = e.clientX+camera_x;
    let posY = e.clientY+camera_y;
    // if holding tool or item
    if (holdingitem) {
        if (itemHeld == "Shovel") {
            // if clicked on hole
            // dig hole && purchase hole
        }
    }
    // if clicked on a gnome / enemy / mob
}

function dropCoin(amount, xPos, yPos) {
    let coinEntities = data.get("coinEntities");
    if (coinEntities.length >= COIN_LIMIT) {
        return;
    }
    let heading = Math.random() * 2 * Math.PI;
    let lateralVel = Math.random() * 1.5 + 2;
    let verticalVel = Math.random() * 5.5 + 5;
    // console.log(xPos, yPos)
    coinEntities.push({
        x: xPos,
        y: yPos,
        z: 0,
        amount: amount,
        id: Math.random(),
        xvel: Math.cos(heading) * lateralVel,
        yvel: Math.sin(heading) * lateralVel,
        zvel: verticalVel,
    });
    data.set("coinEntities", coinEntities);
}

var prev_mouse_move_pos = null;

function line_line_intersection(
    start_x_1,
    start_y_1,
    end_x_1,
    end_y_1,
    start_x_2,
    start_y_2,
    end_x_2,
    end_y_2
) {
    let uA =
        ((end_x_2 - start_x_2) * (start_y_1 - start_y_2) -
            (end_y_2 - start_y_2) * (start_x_1 - start_x_2)) /
        ((end_y_2 - start_y_2) * (end_x_1 - start_x_1) -
            (end_x_2 - start_x_2) * (end_y_1 - start_y_1));
    let uB =
        ((end_x_1 - start_x_1) * (start_y_1 - start_y_2) -
            (end_y_1 - start_y_1) * (start_x_1 - start_x_2)) /
        ((end_y_2 - start_y_2) * (end_x_1 - start_x_1) -
            (end_x_2 - start_x_2) * (end_y_1 - start_y_1));
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return true;
    }
    return false;
}

function handleMouseMove(e) {
    if (!data.loaded) {
        return;
    }
    let posX = e.clientX + camera_x;
    let posY = e.clientY + camera_y;
    if (prev_mouse_move_pos == null) {
        prev_mouse_move_pos = [posX, posY];
        return;
    }
    if (start_chase != 0) {
        return;
    }
    // check if mouse is over coin:
    let coinEntities = data.get("coinEntities");
    for (let i = 0; i < coinEntities.length; i++) {
        let coin = coinEntities[i];
        let pos = coinXYZtoScreen(coin.x, coin.y, coin.z);
        let coin_screen_x = pos[0];
        let coin_screen_y = pos[1];
        start_x = prev_mouse_move_pos[0];
        start_y = prev_mouse_move_pos[1];
        end_x = posX;
        end_y = posY;
        coin_start_x = coin_screen_x;
        coin_start_y = coin_screen_y;
        coin_width = coin_size;
        coin_height = coin_size;
        // check for line/rect intersection
        if (
            line_line_intersection(
                start_x,
                start_y,
                end_x,
                end_y,
                coin_start_x,
                coin_start_y,
                coin_start_x,
                coin_start_y + coin_height
            ) ||
            line_line_intersection(
                start_x,
                start_y,
                end_x,
                end_y,
                coin_start_x,
                coin_start_y,
                coin_start_x + coin_width,
                coin_start_y
            ) ||
            line_line_intersection(
                start_x,
                start_y,
                end_x,
                end_y,
                coin_start_x + coin_width,
                coin_start_y,
                coin_start_x + coin_width,
                coin_start_y + coin_height
            ) ||
            line_line_intersection(
                start_x,
                start_y,
                end_x,
                end_y,
                coin_start_x,
                coin_start_y + coin_height,
                coin_start_x + coin_width,
                coin_start_y + coin_height
            )
        ) {
            coinEntities.splice(i, 1);
            // console.log(coin.amount);
            data.set(
                "coinsInCurrentRun",
                data.get("coinsInCurrentRun") + coin.amount
            );
            moving_coins.push({
                scr_x: coin_screen_x,
                scr_y: coin_screen_y,
                amount: coin.amount,
            });
        }
    }
    prev_mouse_move_pos = [posX, posY];
}

function handleKeyPress(e){
    if (e.key == "0"){
        if (holdingitem){
            holdingitem = false;
            if(itemHeld == 'Shovel'){
                toggleHoldingShovel();
            }
        }
    } else if (e.key == "1"){
        toggleHoldingShovel();
    }
    else if (e.key == "5"){
        toggleInventory();
    }

}

function toggleHoldingShovel(){
    if (holdingTool && toolHeld == "Shovel"){
        holdingTool = false;
        toolHeld = null;
        ghostHoles = [];
        debugMessage("Put Away Shovel");
        document.getElementById('toolbar-button-1').getElementsByClassName('button-icon')[0].classList.remove('toolbar-button-selected');
        document.body.style.cursor = "url('./gnomes/Shovel.png'), auto"; // TODO: why this not work?
    } else {
        holdingTool = true;
        toolHeld = "Shovel";
        debugMessage("Holding Shovel");
        document.getElementById('toolbar-button-1').getElementsByClassName('button-icon')[0].classList.add('toolbar-button-selected');

        let holes = data.get("holes");
        let ghostHolePositions = [];
        for (let i = 0; i < holePositions.length; i++){
            let hole = holePositions[i];
            ghostHolePositions.push(hole);
        }
        // for hole in holePositions
        for (let i = 0; i < ghostHolePositions.length; i++){
            // get rid of all the holes that are already dug
            for (let j = 0; j < holes.length; j++){
                if (holes[j].x == ghostHolePositions[i].x && holes[j].y == ghostHolePositions[i].y){
                    ghostHolePositions.splice(i, 1);
                }
            }
        }
        console.log(ghostHolePositions);
    }
}

function toggleInventory(){
    let inventoryOpen = !(document.getElementById('inventory').classList.contains('inventory-hidden'));
    if (inventoryOpen){
        debugMessage('close inventory');
        document
            .getElementById("inventory")
            .classList.add("inventory-hidden");
        let inventoryButton = document.getElementById("toolbar-button-5");
        inventoryButton
            .getElementsByClassName("button-icon")[0]
            .classList.remove("inventory-icon-toggled");
        
    } else {
        
        debugMessage('open inventory');
        document
            .getElementById("inventory")
            .classList.remove("inventory-hidden");
        let inventoryButton = document.getElementById("toolbar-button-5");
        inventoryButton
            .getElementsByClassName("button-icon")[0]
            .classList.add("inventory-icon-toggled");
    }
}

function debugMessage(message){
    messageDiv = document.createElement('div');
    messageDiv.innerHTML = message;
    messageDiv.classList.add('debugMessage');
    let messageId = Math.random();
    messageDiv.setAttribute('debugId', messageId);
    document.getElementById('debug').prepend(messageDiv);
    debugMessages.push(messageDiv);
    // remove the message after 5 seconds
    setTimeout(function(){
        // remove the message from the array
        for(let i = 0; i < document.querySelectorAll('.debugMessage').length; i++){
            if (document.querySelectorAll('.debugMessage')[i].getAttribute('debugId') == messageId){
                document.querySelectorAll('.debugMessage')[i].remove();
            }
        }
    }, 5000);
}