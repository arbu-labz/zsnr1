const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const keys = {};
const HUD_HEIGHT = 56;
window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    if (key === "e" && !ePressed) {
        ePressed = true;
        interact();
    }

    if (key === "r" && !rPressed) {
        rPressed = true;
        repairBoxAction();
    }
});

window.addEventListener("keyup", e => {
    const key = e.key.toLowerCase();
    keys[key] = false;

    if (key === "e") {
        ePressed = false;
    }

    if (key === "r") {
        rPressed = false;
    }
});

const world = {
    width: 2600,
    height: 1800,
    tile: 100
};

const lab = {
    x: 850,
    y: 420,
    w: 780,
    h: 560,
    wall: 42,
    doorW: 150
};

const repairBox = {
    x: 900,
    y: 465,
    w: 190,
    h: 120,
    label: "Box naprawczy"
};

const terminalDesk = {
    x: 1090,
    y: 470,
    w: 210,
    h: 115,
    label: "Terminal diagnostyczny"
};

const damagedCore = {
    x: 640,
    y: 760,
    w: 36,
    h: 36,
    label: "Uszkodzony rdzeń"
};

const camera = {
    x: 0,
    y: 0
};

const player = {
    x: 500,
    y: 500,
    w: 46,
    h: 64,
    speed: 4,
    moving: false,
    walkTime: 0,
    dirX: 0,
    dirY: 1
};

let message = "Laboratorium Anomalii — test mapy i ruchu";

let carriedObject = null;
let ePressed = false;
let rPressed = false;
let coreInRepairBox = false;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function update() {
    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;

    player.moving = dx !== 0 || dy !== 0;

    if (player.moving) {
        const length = Math.hypot(dx, dy);
        dx /= length;
        dy /= length;

        player.dirX = dx;
        player.dirY = dy;
        player.walkTime += 0.18;
    } else {
        player.walkTime = 0;
    }

    movePlayer(dx * player.speed, dy * player.speed);

    if (carriedObject) {
        const carriedScale = 0.5;

        carriedObject.x = player.x + player.w / 2 - (carriedObject.w * carriedScale) / 2;
        carriedObject.y = player.y - carriedObject.h * carriedScale - 10;
    }

    camera.x = player.x + player.w / 2 - canvas.width / 2;
    camera.y = player.y + player.h / 2 - canvas.height / 2;

    camera.x = clamp(camera.x, 0, Math.max(0, world.width - canvas.width));
    camera.y = clamp(camera.y, 0, Math.max(0, world.height - canvas.height));

    updateMessage();
}

function updateMessage() {
    if (carriedObject && isPlayerNearRect(repairBox, 110)) {
        message = "Box naprawczy — R: włóż rdzeń do boxu. E: upuść.";
        return;
    }

    if (!carriedObject && coreInRepairBox && isPlayerNearRect(repairBox, 110)) {
        message = "Box naprawczy — rdzeń w komorze. R: wyjmij.";
        return;
    }

    if (carriedObject) {
        message = "Niesiesz uszkodzony rdzeń. E — upuść.";
        return;
    }

    if (!coreInRepairBox && isPlayerNearRect(damagedCore, 70)) {
        message = "Uszkodzony rdzeń — E: podnieś.";
        return;
    }

    if (isPlayerNearRect(repairBox, 90)) {
        message = "Box naprawczy — tu umieścisz uszkodzony obiekt.";
        return;
    }

    if (isPlayerNearRect(terminalDesk, 110)) {
        if (coreInRepairBox) {
            message = "Terminal — wykryto rdzeń w boxie. Diagnostyka będzie kolejnym krokiem.";
        } else {
            message = "Terminal — brak obiektu w boxie naprawczym.";
        }
        return;
    }

    if (isPlayerInsideLab()) {
        message = "Jesteś w laboratorium — box i terminal czekają na pierwszy obiekt.";
        return;
    }

    if (isPlayerNearLabDoor()) {
        message = "Wejście do laboratorium — przejdź przez drzwi.";
        return;
    }

    message = "Teren zewnętrzny — laboratorium jest bezpieczną bazą.";
}

function interact() {
    if (carriedObject) {
        dropCarriedObject();
        return;
    }

    if (!coreInRepairBox && isPlayerNearRect(damagedCore, 70)) {
        carriedObject = damagedCore;
        message = "Podniesiono uszkodzony rdzeń.";
    }
}

function repairBoxAction() {
    if (!isPlayerNearRect(repairBox, 110)) {
        return;
    }

    if (carriedObject === damagedCore && !coreInRepairBox) {
        putCoreIntoRepairBox();
        return;
    }

    if (!carriedObject && coreInRepairBox) {
        takeCoreFromRepairBox();
        return;
    }
}

function dropCarriedObject() {
    carriedObject.x = player.x + player.w / 2 - carriedObject.w / 2;
    carriedObject.y = player.y + player.h + 6;

    message = "Odłożono uszkodzony rdzeń.";
    carriedObject = null;
}

function putCoreIntoRepairBox() {
    coreInRepairBox = true;
    carriedObject = null;

    message = "Rdzeń umieszczony w boxie naprawczym.";
}

function takeCoreFromRepairBox() {
    coreInRepairBox = false;
    carriedObject = damagedCore;

    damagedCore.x = player.x + player.w / 2 - damagedCore.w * 0.5 / 2;
    damagedCore.y = player.y - damagedCore.h * 0.5 - 10;

    message = "Wyjęto rdzeń z boxu naprawczego.";
}

function isPlayerInsideLab() {
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;

    return (
        px > lab.x + lab.wall &&
        px < lab.x + lab.w - lab.wall &&
        py > lab.y + lab.wall &&
        py < lab.y + lab.h - lab.wall
    );
}

function isPlayerNearLabDoor() {
    const doorX = lab.x + lab.w / 2 - lab.doorW / 2;
    const doorY = lab.y + lab.h - lab.wall;

    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;

    return (
        px > doorX - 30 &&
        px < doorX + lab.doorW + 30 &&
        py > doorY - 60 &&
        py < doorY + 80
    );
}

function isPlayerNearRect(rect, range) {
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;

    const rx = rect.x + rect.w / 2;
    const ry = rect.y + rect.h / 2;

    return Math.hypot(px - rx, py - ry) < range;
}

function movePlayer(moveX, moveY) {
    player.x += moveX;

    if (collidesWithLab(player) || collidesWithLabObject(player)) {
        player.x -= moveX;
    }

    player.y += moveY;

    if (collidesWithLab(player) || collidesWithLabObject(player)) {
        player.y -= moveY;
    }

    player.x = clamp(player.x, 0, world.width - player.w);
    player.y = clamp(player.y, HUD_HEIGHT + 10, world.height - player.h);
}

function collidesWithLab(rect) {
    const walls = getLabWalls();

    for (const wall of walls) {
        if (rectsOverlap(rect, wall)) {
            return true;
        }
    }

    return false;
}

function collidesWithLabObject(rect) {
    const objects = [repairBox, terminalDesk];

    if (!coreInRepairBox && carriedObject !== damagedCore) {
        objects.push(damagedCore);
    }

    for (const obj of objects) {
        if (rectsOverlap(rect, obj)) {
            return true;
        }
    }

    return false;
}

function getLabWalls() {
    const doorX = lab.x + lab.w / 2 - lab.doorW / 2;

    return [
        // górna ściana
        {
            x: lab.x,
            y: lab.y,
            w: lab.w,
            h: lab.wall
        },

        // lewa ściana
        {
            x: lab.x,
            y: lab.y,
            w: lab.wall,
            h: lab.h
        },

        // prawa ściana
        {
            x: lab.x + lab.w - lab.wall,
            y: lab.y,
            w: lab.wall,
            h: lab.h
        },

        // dolna ściana — lewa część
        {
            x: lab.x,
            y: lab.y + lab.h - lab.wall,
            w: doorX - lab.x,
            h: lab.wall
        },

        // dolna ściana — prawa część
        {
            x: doorX + lab.doorW,
            y: lab.y + lab.h - lab.wall,
            w: lab.x + lab.w - (doorX + lab.doorW),
            h: lab.wall
        }
    ];
}

function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(-camera.x, -camera.y);

    drawMap();

    if (!carriedObject && !coreInRepairBox) {
        drawDamagedCore(1);
    }

    drawPlayer();

    if (carriedObject) {
        drawDamagedCore(0.5);
    }

    if (coreInRepairBox) {
        drawCoreInRepairBox();
    }

    drawUI();
}

function drawMap() {
    drawBackground();
    drawGroundTiles();
    drawLab();
    drawLabEquipment();
    drawSoftDetails();
    drawMapBorder();
}

function drawLab() {
    const doorX = lab.x + lab.w / 2 - lab.doorW / 2;
    const doorY = lab.y + lab.h - lab.wall;

    // cień budynku
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(
        lab.x + lab.w / 2,
        lab.y + lab.h + 18,
        lab.w * 0.48,
        35,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // podłoga wewnątrz laboratorium
    ctx.fillStyle = "#172033";
    ctx.fillRect(
        lab.x + lab.wall,
        lab.y + lab.wall,
        lab.w - lab.wall * 2,
        lab.h - lab.wall * 2
    );

    // kafle wewnętrzne
    ctx.strokeStyle = "rgba(121, 255, 225, 0.07)";
    ctx.lineWidth = 1;

    for (let x = lab.x + lab.wall; x < lab.x + lab.w - lab.wall; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, lab.y + lab.wall);
        ctx.lineTo(x, lab.y + lab.h - lab.wall);
        ctx.stroke();
    }

    for (let y = lab.y + lab.wall; y < lab.y + lab.h - lab.wall; y += 70) {
        ctx.beginPath();
        ctx.moveTo(lab.x + lab.wall, y);
        ctx.lineTo(lab.x + lab.w - lab.wall, y);
        ctx.stroke();
    }

    // fake 3D — zewnętrzna ciemna baza ścian
    ctx.fillStyle = "#111827";

    // góra
    ctx.fillRect(lab.x, lab.y, lab.w, lab.wall);

    // lewa
    ctx.fillRect(lab.x, lab.y, lab.wall, lab.h);

    // prawa
    ctx.fillRect(lab.x + lab.w - lab.wall, lab.y, lab.wall, lab.h);

    // dół lewy
    ctx.fillRect(lab.x, doorY, doorX - lab.x, lab.wall);

    // dół prawy
    ctx.fillRect(
        doorX + lab.doorW,
        doorY,
        lab.x + lab.w - (doorX + lab.doorW),
        lab.wall
    );

    // górne jaśniejsze krawędzie ścian
    ctx.fillStyle = "#27364f";
    ctx.fillRect(lab.x, lab.y, lab.w, 14);
    ctx.fillRect(lab.x, lab.y, 14, lab.h);
    ctx.fillRect(lab.x + lab.w - 14, lab.y, 14, lab.h);

    // dolna ściana z przerwą na drzwi
    ctx.fillRect(lab.x, doorY, doorX - lab.x, 14);
    ctx.fillRect(
        doorX + lab.doorW,
        doorY,
        lab.x + lab.w - (doorX + lab.doorW),
        14
    );

    // obrys neonowy
    ctx.strokeStyle = "#79ffe1";
    ctx.lineWidth = 4;

    ctx.strokeRect(lab.x, lab.y, lab.w, lab.h);

    // maskujemy obrys w miejscu drzwi
    ctx.fillStyle = "#132238";
    ctx.fillRect(doorX - 6, doorY - 4, lab.doorW + 12, lab.wall + 12);

    // próg drzwi
    ctx.fillStyle = "#58f0d2";
    roundRect(doorX, doorY + 8, lab.doorW, 24, 8);
    ctx.fill();

    ctx.fillStyle = "#c8fff4";
    ctx.font = "26px Arial";
    ctx.fillText("LABORATORIUM", lab.x + 250, lab.y + 32);

    // delikatne oznaczenie wejścia
    ctx.fillStyle = "#0f172a";
    ctx.font = "15px Arial";
    ctx.fillText("WEJŚCIE", doorX + 45, doorY + 26);
}

function drawLabEquipment() {
    drawRepairBox();
    drawTerminalDesk();
}

function drawRepairBox() {
    const x = repairBox.x;
    const y = repairBox.y;
    const w = repairBox.w;
    const h = repairBox.h;

    // cień
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 10, w * 0.42, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // podstawa
    ctx.fillStyle = "#1f2937";
    roundRect(x, y + 30, w, h - 30, 18);
    ctx.fill();

    // górna część fake 3D
    ctx.fillStyle = "#334155";
    roundRect(x + 15, y, w - 30, 55, 16);
    ctx.fill();

    // wnętrze boxu
    ctx.fillStyle = "#0f172a";
    roundRect(x + 35, y + 25, w - 70, 55, 14);
    ctx.fill();

    // neonowy obrys komory
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    roundRect(x + 35, y + 25, w - 70, 55, 14);
    ctx.stroke();

    // światło statusu
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(x + w - 28, y + 25, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c8fff4";
    ctx.font = "16px Arial";
    ctx.fillText("REPAIR BOX", x + 48, y + h - 20);
}

function drawTerminalDesk() {
    const x = terminalDesk.x;
    const y = terminalDesk.y;
    const w = terminalDesk.w;
    const h = terminalDesk.h;

    // cień
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 10, w * 0.42, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // biurko
    ctx.fillStyle = "#3f2f25";
    roundRect(x, y + 45, w, h - 45, 16);
    ctx.fill();

    // blat
    ctx.fillStyle = "#6b4f3a";
    roundRect(x + 10, y + 28, w - 20, 42, 14);
    ctx.fill();

    // monitor
    ctx.fillStyle = "#0b1120";
    roundRect(x + 65, y, 80, 55, 10);
    ctx.fill();

    ctx.strokeStyle = "#65ffb7";
    ctx.lineWidth = 3;
    ctx.stroke();

    // ekran
    ctx.fillStyle = "#65ffb7";
    ctx.fillRect(x + 78, y + 13, 54, 24);

    // nóżka monitora
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x + 99, y + 55, 12, 18);

    ctx.fillStyle = "#c8fff4";
    ctx.font = "15px Arial";
    ctx.fillText("TERMINAL", x + 70, y + h - 18);
}

function drawDamagedCore(scale = 1) {
    const x = damagedCore.x;
    const y = damagedCore.y;
    const w = damagedCore.w * scale;
    const h = damagedCore.h * scale;

    // cień
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 5, 24 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // obudowa
    ctx.fillStyle = "#2e1065";
    roundRect(x, y, w, h, 8 * scale);
    ctx.fill();

    ctx.strokeStyle = "#ff4fd8";
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // pęknięcie
    ctx.strokeStyle = "#fef3c7";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 18 * scale, y + 5 * scale);
    ctx.lineTo(x + 13 * scale, y + 17 * scale);
    ctx.lineTo(x + 22 * scale, y + 22 * scale);
    ctx.lineTo(x + 17 * scale, y + 32 * scale);
    ctx.stroke();

    // świecący punkt
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(x + 27 * scale, y + 10 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
}

function drawCoreInRepairBox() {
    const x = repairBox.x + repairBox.w / 2 - 12;
    const y = repairBox.y + 42;

    ctx.fillStyle = "#2e1065";
    roundRect(x, y, 24, 24, 6);
    ctx.fill();

    ctx.strokeStyle = "#ff4fd8";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = "#fef3c7";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 4);
    ctx.lineTo(x + 8, y + 12);
    ctx.lineTo(x + 15, y + 15);
    ctx.lineTo(x + 11, y + 21);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(x + 18, y + 7, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawBackground() {
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, world.width, world.height);
}

function drawGroundTiles() {
    for (let y = 0; y < world.height; y += world.tile) {
        for (let x = 0; x < world.width; x += world.tile) {
            const even = (x / world.tile + y / world.tile) % 2 === 0;

            ctx.fillStyle = even ? "#111c2e" : "#132238";
            ctx.fillRect(x, y, world.tile, world.tile);

            ctx.strokeStyle = "rgba(110, 255, 225, 0.06)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, world.tile, world.tile);
        }
    }
}

function drawSoftDetails() {
    const gradient = ctx.createRadialGradient(
        world.width / 2,
        world.height / 2,
        200,
        world.width / 2,
        world.height / 2,
        1200
    );

    gradient.addColorStop(0, "rgba(80, 220, 200, 0.035)");
    gradient.addColorStop(1, "rgba(80, 220, 200, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, world.width, world.height);
}

function drawMapBorder() {
    ctx.strokeStyle = "rgba(121, 255, 225, 0.35)";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, world.width - 6, world.height - 6);
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;

    drawPlayerShadow(x, y);
    drawPlayerBody(x, y);
}

function drawPlayerShadow(x, y) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(
        x + player.w / 2,
        y + player.h - 2,
        24,
        10,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawPlayerBody(x, y) {
    const step = Math.sin(player.walkTime) * 4;
    const bounce = player.moving ? Math.abs(Math.sin(player.walkTime)) * 2 : 0;

    y -= bounce;

    // nogi
    ctx.fillStyle = "#0f766e";

    roundRect(x + 8, y + 42 + step, 10, 20, 4);
    ctx.fill();

    roundRect(x + 28, y + 42 - step, 10, 20, 4);
    ctx.fill();

    // ręce
    ctx.fillStyle = "#14b8a6";

    roundRect(x + 1, y + 30 - step, 8, 22, 4);
    ctx.fill();

    roundRect(x + 37, y + 30 + step, 8, 22, 4);
    ctx.fill();

    // tułów
    ctx.fillStyle = "#2dd4bf";
    roundRect(x + 6, y + 24, 34, 30, 8);
    ctx.fill();

    ctx.strokeStyle = "#ccfbf1";
    ctx.lineWidth = 3;
    ctx.stroke();

    // głowa / hełm
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(x + 23, y + 14, 15, 0, Math.PI * 2);
    ctx.fill();

    // wizjer zależny od kierunku
    ctx.fillStyle = "#0f172a";

    let visorOffsetX = 0;
    let visorOffsetY = 0;

    if (player.dirX > 0.3) visorOffsetX = 4;
    if (player.dirX < -0.3) visorOffsetX = -4;
    if (player.dirY < -0.3) visorOffsetY = -3;
    if (player.dirY > 0.3) visorOffsetY = 2;

    roundRect(x + 12 + visorOffsetX, y + 9 + visorOffsetY, 22, 8, 4);
    ctx.fill();

    // plecak technika
    ctx.fillStyle = "#164e63";
    roundRect(x - 2, y + 30, 9, 20, 4);
    ctx.fill();
}

function drawUI() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "rgba(4, 8, 16, 0.82)";
    ctx.fillRect(0, 0, canvas.width, 56);

    ctx.fillStyle = "#79ffe1";
    ctx.font = "18px Arial";
    ctx.fillText(message, 24, 35);

    ctx.fillStyle = "rgba(4, 8, 16, 0.72)";
    ctx.fillRect(20, canvas.height - 54, 260, 34);

    ctx.fillStyle = "#c8fff4";
    ctx.font = "15px Arial";
    ctx.fillText("WASD / strzałki — ruch", 36, canvas.height - 32);
}

function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();