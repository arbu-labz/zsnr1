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

    if (gameOver || levelCompleted) {
        return;
    }

    if (key === "e" && !ePressed) {
        ePressed = true;
        interact();
    }

    if (key === "r" && !rPressed) {
        rPressed = true;

        if (isPlayerNearRect(handScanner, 90)) {
            scannerSlotAction();
        } else {
            repairBoxAction();
        }
    }

    if (key === "g" && !dPressed) {
        dPressed = true;

        if (isPlayerNearRect(handScanner, 90)) {
            scanScannerSlot();
        } else {
            diagnosticAction();
        }
    }

    if (key === "k") {
        if (isPlayerNearKnowledgeTerminal()) {
            knowledgeTerminalOpen = true;
        }
    }

    if (key === "1") {
        takeObjectFromRepairBox(0);
    }

    if (key === "2") {
        takeObjectFromRepairBox(1);
    }

    if (key === "3") {
        takeObjectFromRepairBox(2);
    }

    if (key === "escape") {
        diagnosticOpen = false;
        instructionOpen = false;
        knowledgeTerminalOpen = false;
    }

    if (key === "l" && !lPressed) {
        lPressed = true;
        linkAction();
    }

    if (key === " " && !spacePressed) {
        e.preventDefault();
        spacePressed = true;
        //throwCarriedObject();
    }
    if (key === "i" && !iPressed) {
        iPressed = true;
        instructionOpen = true;
        diagnosticOpen = false;
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

    if (key === "g") {
        dPressed = false;
    }

    if (key === "l") {
        lPressed = false;
    }

    if (key === "i") {
        iPressed = false;
    }

    if (key === " ") {
        spacePressed = false;
    }
});

window.addEventListener("click", e => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (
        mouseX >= canvas.width - 640 &&
        mouseX <= canvas.width - 640 + 170 &&
        mouseY >= 11 &&
        mouseY <= 11 + 34
    ) {
        window.open("generator.html", "_blank");
        return;
    }

    if (
        mouseX >= canvas.width - 455 &&
        mouseX <= canvas.width - 455 + 125 &&
        mouseY >= 11 &&
        mouseY <= 11 + 34
    ) {
        databaseWindowOpen = true;
        return;
    }

    if (databaseWindowOpen) {
        const w = 640;
        const h = 260;
        const x = canvas.width / 2 - w / 2;
        const y = canvas.height / 2 - h / 2;

        const chooseX = x + 55;
        const chooseY = y + 150;
        const chooseW = 160;
        const chooseH = 42;

        if (
            mouseX >= chooseX &&
            mouseX <= chooseX + chooseW &&
            mouseY >= chooseY &&
            mouseY <= chooseY + chooseH
        ) {
            databaseFileInput.value = "";
            databaseFileInput.click();
            return;
        }

        const loadX = x + 240;
        const loadY = y + 150;
        const loadW = 160;
        const loadH = 42;

        if (
            mouseX >= loadX &&
            mouseX <= loadX + loadW &&
            mouseY >= loadY &&
            mouseY <= loadY + loadH
        ) {
            readSelectedDatabaseFile();
            return;
        }

        const cancelX = x + 425;
        const cancelY = y + 150;
        const cancelW = 160;
        const cancelH = 42;

        if (
            mouseX >= cancelX &&
            mouseX <= cancelX + cancelW &&
            mouseY >= cancelY &&
            mouseY <= cancelY + cancelH
        ) {
            databaseWindowOpen = false;
        }
    }

    if (startInfoWindowOpen) {
        const w = 620;
        const h = 360;
        const x = canvas.width / 2 - w / 2;
        const y = canvas.height / 2 - h / 2;

        const startX = x + w / 2 - 90;
        const startY = y + h - 70;
        const startW = 180;
        const startH = 42;

        if (
            mouseX >= startX &&
            mouseX <= startX + startW &&
            mouseY >= startY &&
            mouseY <= startY + startH
        ) {
            startInfoWindowOpen = false;
            showTemporaryMessage("Rozpoczęto poziom. Napraw wszystkie rdzenie.", 140);
            return;
        }

        return;
    }

    if (knowledgeTerminalOpen) {
        const w = 640;
        const h = 420;
        const x = canvas.width / 2 - w / 2;
        const y = canvas.height / 2 - h / 2;

        const closeX = x + w / 2 - 90;
        const closeY = y + h - 65;
        const closeW = 180;
        const closeH = 42;

        if (
            mouseX >= closeX &&
            mouseX <= closeX + closeW &&
            mouseY >= closeY &&
            mouseY <= closeY + closeH
        ) {
            knowledgeTerminalOpen = false;
            return;
        }

        return;
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

const library = {
    x: 2050,
    y: 260,
    w: 420,
    h: 320,
    wall: 32,
    doorW: 110
};

const knowledgeTerminal = {
    x: library.x + 38,
    y: library.y + 48,
    width: 96,
    height: 88
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

const coreStorage = {
    x: 1420,
    y: 600,
    w: 170,
    h: 310,
    label: "Magazyn rdzeni"
};

const handScanner = {
    x: 1330,
    y: 500,
    w: 70,
    h: 52,
    label: "Ręczny skaner",
    kind: "scanner"
};

let scannerSlot = null;
let scanPopupText = "";
let scanPopupTimer = 0;
let databaseWindowOpen = true;
let startInfoWindowOpen = false;
let knowledgeTerminalOpen = false;

let databaseFileInput = null;
let selectedDatabaseFile = null;
let selectedDatabaseFileName = "Nie wybrano pliku";
let databaseStatusText = "";

function createPrankRobot(x, y) {
    return {
        x: x,
        y: y,
        w: 48,
        h: 42,
        speed: 1.8,
        target: null,
        pushDirX: 0,
        pushDirY: 0,
        pushTimer: 0,
        waitTimer: 0,
        skippedTarget: null,
        skipTimer: 0,
        escapeTimer: 0,
        escapeDirX: 0,
        escapeDirY: 0
    };
}

const prankRobots = [
    createPrankRobot(1750, 760),
    createPrankRobot(2050, 1050),
    createPrankRobot(2350, 1360)
];

function getLabCenter() {
    return {
        x: lab.x + lab.w / 2,
        y: lab.y + lab.h / 2
    };
}

function getObjectCenter(obj) {
    return {
        x: obj.x + obj.w / 2,
        y: obj.y + obj.h / 2
    };
}

function normalizeVector(x, y) {
    const len = Math.hypot(x, y);

    if (len === 0) {
        return { x: 1, y: 0 };
    }

    return {
        x: x / len,
        y: y / len
    };
}

function getPushDirectionToNearestEdge(obj) {
    const directions = [
        { dirX: -1, dirY: 0 }, // lewo
        { dirX: 1, dirY: 0 },  // prawo
        { dirX: 0, dirY: -1 }, // góra
        { dirX: 0, dirY: 1 }   // dół
    ];

    // mieszamy kierunki, żeby robot nie pchał zawsze w tę samą stronę
    directions.sort(() => Math.random() - 0.5);

    for (const dir of directions) {
        if (canMoveObject(obj, dir.dirX * 20, dir.dirY * 20)) {
            return dir;
        }
    }

    // awaryjnie, gdy nic nie pasuje
    return { dirX: 0, dirY: 1 };
}

function getPrankRobotTargetCandidates() {
    return getPhysicalObjects().filter(obj => {
        const rect = getCollisionRect(obj);

        return (
            !isRectInsideLab(rect) &&
            !isRectInsideLibrary(rect) &&
            !isThrown(obj)
        );
    });
}

function choosePrankRobotTarget(robot) {
    let candidates = getPrankRobotTargetCandidates();

    if (robot.skippedTarget && robot.skipTimer > 0) {
        candidates = candidates.filter(obj => obj !== robot.skippedTarget);
    }

    if (candidates.length === 0) {
        robot.target = null;
        robot.waitTimer = 30;
        return;
    }

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const pushDir = getPushDirectionToNearestEdge(target);

    robot.target = target;
    robot.pushDirX = pushDir.dirX;
    robot.pushDirY = pushDir.dirY;
    robot.pushTimer = 0;
}

const CORE_SIZE = 36;
const WORD_SIZE = 34;

const CORE_START_X = 280;
const WORD_START_X = 380;

const OBJECT_START_Y = 300;
const OBJECT_GAP_Y = 70;

let cores = [];

function shuffledIndexes(count) {
    const indexes = [];

    for (let i = 0; i < count; i++) {
        indexes.push(i);
    }

    for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }

    return indexes;
}

function buildObjectsFromTasks(tasks) {
    cores = tasks.map((task, index) => ({
        id: "core_" + task.id,
        code: task.code,
        correctWord: task.answer,
        label: "Rdzeń",
        x: CORE_START_X,
        y: OBJECT_START_Y + index * OBJECT_GAP_Y,
        w: CORE_SIZE,
        h: CORE_SIZE,
        kind: "core",
        repaired: false,
        removed: false
    }));

    const wordDisplayOrder = shuffledIndexes(tasks.length);

    wordObjects = tasks.map((task, index) => {
        const displayIndex = wordDisplayOrder[index];

        return {
            id: "word_" + task.id,
            hiddenWord: task.answer,
            label: "Moduł",
            x: WORD_START_X,
            y: OBJECT_START_Y + displayIndex * OBJECT_GAP_Y,
            w: WORD_SIZE,
            h: WORD_SIZE,
            kind: "word"
        };
    });
}

let wordObjects = [];

// buildObjectsFromTasks(GAME_CONTENT.tasks);

const repairedCores = [];

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
const REPAIR_BOX_MAX = 3;
let repairBoxSlots = [];
let storedRepairedCores = [];
let removedObjects = [];
let diagnosticOpen = false;
let dPressed = false;
let lPressed = false;
let linkErrorFlash = 0;
let temporaryMessage = null;
let temporaryMessageTimer = 0;
let thrownObjects = [];
let spacePressed = false;
let instructionOpen = false;
let iPressed = false;
let wrongLinks = 0;
const WRONG_LINK_LIMIT = 3;
let gameOver = false;
let levelCompleted = false;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function showTemporaryMessage(text, time = 90) {
    temporaryMessage = text;
    temporaryMessageTimer = time;
}

function update() {
    if (databaseWindowOpen) {
        message = "Wybierz bazę zadań, aby rozpocząć grę.";
        return;
    }

    if (startInfoWindowOpen) {
        message = "Przeczytaj instrukcję startową i rozpocznij grę.";
        return;
    }

    if (knowledgeTerminalOpen) {
        message = "Terminal wiedzy jest otwarty.";
        return;
    }

    if (gameOver) {
        message = "GAME OVER — popełniono 3 błędne połączenia.";
        return;
    }

    if (levelCompleted) {
        message = "LEVEL 1 UKOŃCZONY — certyfikat Junior Programisty przyznany.";
        return;
    }

    if (instructionOpen) {
        message = "Instrukcja gry — ESC: zamknij.";
        return;
    }

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
    updateThrownObjects();
    for (const robot of prankRobots) {
        updatePrankRobot(robot);
    }

    if (carriedObject) {
        const carriedScale = 0.5;

        carriedObject.x = player.x + player.w / 2 - (carriedObject.w * carriedScale) / 2;
        carriedObject.y = player.y - carriedObject.h * carriedScale - 10;
    }

    camera.x = player.x + player.w / 2 - canvas.width / 2;
    camera.y = player.y + player.h / 2 - canvas.height / 2;

    camera.x = clamp(camera.x, 0, Math.max(0, world.width - canvas.width));
    camera.y = clamp(camera.y, 0, Math.max(0, world.height - canvas.height));

    if (linkErrorFlash > 0) {
        linkErrorFlash--;
    }

    if (temporaryMessageTimer > 0) {
        temporaryMessageTimer--;
    }

    if (scanPopupTimer > 0) {
        scanPopupTimer--;
    }

    updateMessage();
}

function updateMessage() {
    if (temporaryMessageTimer > 0 && temporaryMessage) {
        message = temporaryMessage;
        return;
    }

    if (carriedObject && isPlayerNearRect(repairBox, 110)) {
        message = `Box naprawczy — R: włóż ${carriedObject.label}. E: upuść.`;
        return;
    }

    if (!carriedObject && isPlayerNearRect(repairBox, 110)) {
        if (repairBoxSlots.length > 0) {
            message = "Box naprawczy — 1 / 2 / 3: wyjmij obiekt ze slotu.";
        } else {
            message = "Box naprawczy — pusty.";
        }
        return;
    }

    if (carriedObject) {
        message = `Niesiesz: ${carriedObject.label}. E — upuść.`;
        return;
    }

    const nearestCore = getNearestCore();

    if (nearestCore) {
        message = `${nearestCore.label} — E: podnieś.`;
        return;
    }

    const nearestWord = getNearestWordObject();

    if (nearestWord) {
        message = `${nearestWord.label} — E: podnieś.`;
        return;
    }

    if (isPlayerNearRect(coreStorage, 110)) {
        if (carriedObject && carriedObject.kind === "repairedCore") {
            message = "Magazyn rdzeni — R: zdeponuj naprawiony rdzeń.";
        } else {
            message = `Magazyn rdzeni — postęp: ${storedRepairedCores.length} / ${cores.length}.`;
        }
        return;
    }

    if (isPlayerNearRect(terminalDesk, 110)) {
        if (repairBoxSlots.length > 0) {
            message = `Terminal — wykryto obiekty: ${repairBoxSlots.length}. G: diagnostyka, L: link.`;
        } else {
            message = "Terminal — box jest pusty.";
        }
        return;
    }

    if (isPlayerInsideLab()) {
        message = "Jesteś w laboratorium — box i terminal czekają na obiekty.";
        return;
    }

    if (isPlayerNearLabDoor()) {
        message = "Wejście do laboratorium — przejdź przez drzwi.";
        return;
    }

    if (isPlayerNearKnowledgeTerminal()) {
        message = "Naciśnij K, aby otworzyć terminal wiedzy.";
        return;
    }

    if (isPlayerNearRect(handScanner, 90)) {
        if (scannerSlot) {
            message = "Ręczny skaner — R: wyjmij obiekt, G: skanuj.";
        } else {
            message = "Ręczny skaner — R: włóż obiekt, E: podnieś.";
        }
        return;
    }

    message = "Teren zewnętrzny";
}

function interact() {
    if (carriedObject) {
        dropCarriedObject();
        return;
    }

    if (
        carriedObject !== handScanner &&
        scannerSlot !== handScanner &&
        isPlayerNearRect(handScanner, 70)
    ) {
        carriedObject = handScanner;
        message = "Podniesiono: ręczny skaner.";
        return;
    }

    const nearestCore = getNearestCore();

    const nearestRepaired = getNearestRepairedCore();

    if (nearestRepaired) {
        carriedObject = nearestRepaired;
        message = `Podniesiono: ${nearestRepaired.label}.`;
        return;
    }

    if (nearestCore) {
        carriedObject = nearestCore;
        message = `Podniesiono: ${nearestCore.label}.`;
        return;
    }

    const nearestWord = getNearestWordObject();

    if (nearestWord) {
        carriedObject = nearestWord;
        message = `Podniesiono: ${nearestWord.label}.`;
        return;
    }
}

function repairBoxAction() {
    if (isPlayerNearRect(coreStorage, 110)) {
        storageAction();
        return;
    }

    if (!isPlayerNearRect(repairBox, 110)) {
        return;
    }

    if (!carriedObject) {
        message = "Box naprawczy — wybierz slot 1 / 2 / 3, aby wyjąć obiekt.";
        return;
    }

    if (carriedObject.kind === "core") {
        putObjectIntoRepairBox(carriedObject);
        return;
    }

    if (carriedObject.kind === "word") {
        putObjectIntoRepairBox(carriedObject);
        return;
    }

    if (carriedObject.kind === "repairedCore") {
        putObjectIntoRepairBox(carriedObject);
        return;
    }
}

function storageAction() {
    if (!carriedObject) {
        message = `Magazyn rdzeni — zdeponowano ${storedRepairedCores.length} / ${cores.length}.`;
        return;
    }

    if (carriedObject.kind !== "repairedCore") {
        showTemporaryMessage("Magazyn przyjmuje tylko naprawione rdzenie.", 100);
        return;
    }

    storedRepairedCores.push(carriedObject);

    const index = repairedCores.indexOf(carriedObject);
    if (index !== -1) {
        repairedCores.splice(index, 1);
    }

    carriedObject = null;

    if (storedRepairedCores.length >= cores.length) {
        levelCompleted = true;
        diagnosticOpen = false;
        instructionOpen = false;
        showTemporaryMessage("LEVEL 1 UKOŃCZONY — certyfikat przyznany.", 9999);
    } else {
        showTemporaryMessage(`Rdzeń zdeponowany. Postęp: ${storedRepairedCores.length} / ${cores.length}.`, 120);
    }
}

function isInRepairBox(obj) {
    return repairBoxSlots.includes(obj);
}

function isInScanner(obj) {
    return scannerSlot === obj;
}

function isRemoved(obj) {
    return removedObjects.includes(obj);
}

function isThrown(obj) {
    return thrownObjects.some(t => t.obj === obj);
}

function getNearestWordObject(range = 70) {
    for (const obj of wordObjects) {
        if (
            !isThrown(obj) &&
            !isRemoved(obj) &&
            !isInRepairBox(obj) &&
            !isInScanner(obj) &&
            carriedObject !== obj &&
            isPlayerNearRect(obj, range)
        ) {
            return obj;
        }
    }

    return null;
}

function getNearestCore(range = 70) {
    for (const core of cores) {
        if (
            !isThrown(core) &&
            !isRemoved(core) &&
            !isInRepairBox(core) &&
            !isInScanner(core) &&
            carriedObject !== core &&
            isPlayerNearRect(core, range)
        ) {
            return core;
        }
    }

    return null;
}

function getWordObjectInRepairBox() {
    return repairBoxSlots.find(obj => obj.kind === "word");
}

function getWordObjectsInRepairBox() {
    return repairBoxSlots.filter(obj => obj.kind === "word");
}

function getCoreObjectInRepairBox() {
    return repairBoxSlots.find(obj => obj.kind === "core");
}

function getCoreObjectsInRepairBox() {
    return repairBoxSlots.filter(obj => obj.kind === "core");
}

function getRepairedCoreObjectsInRepairBox() {
    return repairBoxSlots.filter(obj => obj.kind === "repairedCore");
}

function getNearestRepairedCore(range = 70) {
    for (const obj of repairedCores) {
        if (
            !isThrown(obj) &&
            !isInRepairBox(obj) &&
            !isInScanner(obj) &&
            carriedObject !== obj &&
            isPlayerNearRect(obj, range)
        ) {
            return obj;
        }
    }

    return null;
}

function getPhysicalObjects(excludedObject = null) {
    const objects = [];

    for (const core of cores) {
        if (
            core !== excludedObject &&
            !isRemoved(core) &&
            !isInRepairBox(core) &&
            !isInScanner(core) &&
            carriedObject !== core
        ) {
            objects.push(core);
        }
    }

    for (const wordObj of wordObjects) {
        if (
            wordObj !== excludedObject &&
            !isRemoved(wordObj) &&
            !isInRepairBox(wordObj) &&
            !isInScanner(wordObj) &&
            carriedObject !== wordObj
        ) {
            objects.push(wordObj);
        }
    }

    for (const core of repairedCores) {
        if (
            core !== excludedObject &&
            !isInRepairBox(core) &&
            !isInScanner(core) &&
            carriedObject !== core
        ) {
            objects.push(core);
        }
    }

    if (
        handScanner !== excludedObject &&
        carriedObject !== handScanner
    ) {
        objects.push(handScanner);
    }

    return objects;
}

function getBlockingObjects(excludedObject = null) {
    return [
        repairBox,
        terminalDesk,
        coreStorage,
        knowledgeTerminal,
        ...getPhysicalObjects(excludedObject)
    ];
}

function getPhysicalObjectCollidingWithRect(rect) {
    for (const obj of getPhysicalObjects()) {
        const collisionRect = getCollisionRect(obj);

        if (rectsOverlap(rect, collisionRect)) {
            return obj;
        }
    }

    return null;
}

function getStaticObjectCollidingWithRect(rect) {
    const staticObjects = [repairBox, terminalDesk, coreStorage];

    for (const obj of staticObjects) {
        const collisionRect = getCollisionRect(obj);

        if (rectsOverlap(rect, collisionRect)) {
            return obj;
        }
    }

    return null;
}

function canMoveObject(obj, moveX, moveY) {
    const testRect = {
        x: obj.x + moveX,
        y: obj.y + moveY,
        w: obj.w,
        h: obj.h
    };

    // granice świata
    if (
        testRect.x < 0 ||
        testRect.y < HUD_HEIGHT + 10 ||
        testRect.x + testRect.w > world.width ||
        testRect.y + testRect.h > world.height
    ) {
        return false;
    }

    // ściany laboratorium
    if (collidesWithLab(testRect) || collidesWithLibrary(testRect)) {
        return false;
    }

    // inne przeszkody
    for (const blocker of getBlockingObjects(obj)) {
        const collisionRect = getCollisionRect(blocker);

        if (rectsOverlap(testRect, collisionRect)) {
            return false;
        }
    }

    return true;
}

function movePhysicalObject(obj, moveX, moveY) {
    obj.x += moveX;
    obj.y += moveY;
}

function separatePlayerFromObjects() {
    for (const obj of getPhysicalObjects()) {
        const rect = getCollisionRect(obj);

        if (!rectsOverlap(player, rect)) continue;

        const playerCenterX = player.x + player.w / 2;
        const playerCenterY = player.y + player.h / 2;
        const objCenterX = rect.x + rect.w / 2;
        const objCenterY = rect.y + rect.h / 2;

        const overlapLeft = player.x + player.w - rect.x;
        const overlapRight = rect.x + rect.w - player.x;
        const overlapTop = player.y + player.h - rect.y;
        const overlapBottom = rect.y + rect.h - player.y;

        const minOverlap = Math.min(
            overlapLeft,
            overlapRight,
            overlapTop,
            overlapBottom
        );

        if (minOverlap === overlapLeft && playerCenterX < objCenterX) {
            player.x -= overlapLeft;
        } else if (minOverlap === overlapRight && playerCenterX > objCenterX) {
            player.x += overlapRight;
        } else if (minOverlap === overlapTop && playerCenterY < objCenterY) {
            player.y -= overlapTop;
        } else if (minOverlap === overlapBottom && playerCenterY > objCenterY) {
            player.y += overlapBottom;
        }
    }
}

function putObjectIntoRepairBox(obj) {
    if (repairBoxSlots.length >= REPAIR_BOX_MAX) {
        message = "Box naprawczy jest pełny.";
        return;
    }

    repairBoxSlots.push(obj);
    carriedObject = null;

    message = `${obj.label} umieszczono w boxie.`;
}

function takeObjectFromRepairBox(slotIndex) {
    if (!isPlayerNearRect(repairBox, 110)) return;

    const obj = repairBoxSlots[slotIndex];

    if (!obj) {
        message = "Ten slot boxu jest pusty.";
        return;
    }

    repairBoxSlots.splice(slotIndex, 1);
    carriedObject = obj;

    obj.x = player.x + player.w / 2 - obj.w * 0.5 / 2;
    obj.y = player.y - obj.h * 0.5 - 10;

    message = `Wyjęto z boxu: ${obj.label}.`;
}

function scannerSlotAction() {
    if (carriedObject && carriedObject === handScanner) {
        message = "Najpierw odłóż skaner, aby użyć jego okienka.";
        return;
    }

    if (carriedObject && carriedObject.kind !== "scanner") {
        if (scannerSlot) {
            message = "Skaner jest zajęty. Najpierw wyjmij obiekt.";
            return;
        }

        scannerSlot = carriedObject;
        carriedObject = null;
        message = `Włożono do skanera: ${scannerSlot.label}.`;
        return;
    }

    if (!carriedObject && scannerSlot) {
        carriedObject = scannerSlot;
        scannerSlot = null;

        carriedObject.x = player.x + player.w / 2 - carriedObject.w * 0.5 / 2;
        carriedObject.y = player.y - carriedObject.h * 0.5 - 10;

        message = `Wyjęto ze skanera: ${carriedObject.label}.`;
        return;
    }

    message = "Skaner — R: włóż / wyjmij obiekt, G: skanuj.";
}

function scanScannerSlot() {
    if (!scannerSlot) {
        scanPopupText = "Skaner pusty.";
        scanPopupTimer = 60;
        return;
    }

    if (scannerSlot.kind === "word") {
        scanPopupText = `Moduł zawiera: ${scannerSlot.hiddenWord}`;
        scanPopupTimer = 60;
        return;
    }

    if (scannerSlot.kind === "core") {
        scanPopupText = `Kod rdzenia: ${scannerSlot.code}`;
        scanPopupTimer = 60;
        return;
    }

    if (scannerSlot.kind === "repairedCore") {
        scanPopupText = `Rdzeń naprawiony: ${scannerSlot.correctWord}`;
        scanPopupTimer = 60;
        return;
    }

    scanPopupText = "Nieznany obiekt.";
    scanPopupTimer = 60;
}

function diagnosticAction() {
    if (!isPlayerNearRect(terminalDesk, 110)) {
        return;
    }

    if (repairBoxSlots.length === 0) {
        message = "Terminal — box jest pusty. Diagnostyka niemożliwa.";
        return;
    }

    diagnosticOpen = true;
    message = "Diagnostyka boxu uruchomiona.";
}

function linkAction() {
    if (!isPlayerNearRect(terminalDesk, 110)) {
        return;
    }

    const coresInBox = getCoreObjectsInRepairBox();
    const wordsInBox = getWordObjectsInRepairBox();

    if (coresInBox.length === 0 || wordsInBox.length === 0) {
        linkErrorFlash = 45;
        showTemporaryMessage("Link nieudany — potrzebny jest rdzeń i obiekt ze słowem.", 120);
        return;
    }

    let coreToRepair = null;
    let matchingWord = null;

    for (const core of coresInBox) {
        matchingWord = wordsInBox.find(word => word.hiddenWord === core.correctWord);

        if (matchingWord) {
            coreToRepair = core;
            break;
        }
    }

    if (!coreToRepair || !matchingWord) {
        registerWrongLink();
        return;
    }

    const newRepairedCore = {
        id: coreToRepair.id + "_repaired_" + Date.now(),
        label: "Naprawiony " + coreToRepair.label,
        x: 0,
        y: 0,
        w: coreToRepair.w,
        h: coreToRepair.h,
        kind: "repairedCore",
        code: coreToRepair.code,
        correctWord: coreToRepair.correctWord
    };

    repairedCores.push(newRepairedCore);

    removedObjects.push(coreToRepair);
    removedObjects.push(matchingWord);

    repairBoxSlots = repairBoxSlots.filter(
        obj => obj !== coreToRepair && obj !== matchingWord
    );

    repairBoxSlots.push(newRepairedCore);

    diagnosticOpen = false;

    showTemporaryMessage("Link poprawny — rdzeń został naprawiony.", 140);
}

function registerWrongLink() {
    wrongLinks++;
    linkErrorFlash = 45;

    if (wrongLinks >= WRONG_LINK_LIMIT) {
        gameOver = true;
        diagnosticOpen = false;
        instructionOpen = false;
        showTemporaryMessage("GAME OVER — 3 błędne połączenia.", 9999);
        return;
    }

    const left = WRONG_LINK_LIMIT - wrongLinks;

    if (left === 1) {
        showTemporaryMessage("Błędny link! Ostatnia szansa — kolejny błąd kończy grę.", 180);
    } else {
        showTemporaryMessage(`Błędny link! Pozostałe próby: ${left}.`, 150);
    }
}

function dropCarriedObject() {
    const obj = carriedObject;

    const startX = player.x + player.w / 2 - obj.w / 2;
    const startY = player.y + player.h + 6;

    const freePos = findFreeDropPosition(obj, startX, startY);

    if (!freePos) {
        showTemporaryMessage("Nie można tutaj odłożyć obiektu.", 90);
        return;
    }

    obj.x = freePos.x;
    obj.y = freePos.y;

    message = `Odłożono: ${obj.label}.`;
    carriedObject = null;
}

function throwCarriedObject() {
    if (!carriedObject) return;

    const obj = carriedObject;

    let dirX = player.dirX;
    let dirY = player.dirY;

    if (Math.abs(dirX) < 0.1 && Math.abs(dirY) < 0.1) {
        dirX = 0;
        dirY = 1;
    }

    const len = Math.hypot(dirX, dirY);
    dirX /= len;
    dirY /= len;

    const throwSpeed = 9;
    const throwDistance = obj.w * 7;

    thrownObjects.push({
        obj: obj,
        vx: dirX * throwSpeed,
        vy: dirY * throwSpeed,
        remaining: throwDistance
    });

    carriedObject = null;

    showTemporaryMessage(`Rzut: ${obj.label}.`, 60);
}

function updateThrownObjects() {
    for (let i = thrownObjects.length - 1; i >= 0; i--) {
        const thrown = thrownObjects[i];
        const obj = thrown.obj;

        if (thrown.remaining <= 0) {
            thrownObjects.splice(i, 1);
            continue;
        }

        if (canMoveObject(obj, thrown.vx, thrown.vy)) {
            movePhysicalObject(obj, thrown.vx, thrown.vy);
            thrown.remaining -= Math.hypot(thrown.vx, thrown.vy);
        } else {
            thrownObjects.splice(i, 1);
        }
    }
}

function updatePrankRobot(robot) {
    if (robot.escapeTimer > 0) {
        const moved = movePrankRobot(
            robot,
            robot.escapeDirX * robot.speed,
            robot.escapeDirY * robot.speed
        );

        robot.escapeTimer--;

        if (!moved) {
            robot.escapeTimer = 0;
        }

        return;
    }
    if (robot.skipTimer > 0) {
        robot.skipTimer--;

        if (robot.skipTimer <= 0) {
            robot.skippedTarget = null;
        }
    }

    if (robot.waitTimer > 0) {
        robot.waitTimer--;
        return;
    }

    if (
        !robot.target ||
        isInRepairBox(robot.target) ||
        isRemoved(robot.target) ||
        isThrown(robot.target) ||
        isRectInsideLab(getCollisionRect(robot.target)) ||
        isRectInsideLibrary(getCollisionRect(robot.target))
    ) {
        choosePrankRobotTarget(robot);
        return;
    }

    const target = robot.target;
    const targetCenter = getObjectCenter(target);

    // robot ustawia się po przeciwnej stronie do kierunku pchania
    const desiredX = targetCenter.x - robot.pushDirX * 58 - robot.w / 2;
    const desiredY = targetCenter.y - robot.pushDirY * 58 - robot.h / 2;

    const robotCenter = getObjectCenter(robot);
    const dist = Math.hypot(
        desiredX + robot.w / 2 - robotCenter.x,
        desiredY + robot.h / 2 - robotCenter.y
    );

    if (dist > 12) {
        const moveDir = normalizeVector(
            desiredX + robot.w / 2 - robotCenter.x,
            desiredY + robot.h / 2 - robotCenter.y
        );

        const moved = movePrankRobot(
            robot,
            moveDir.x * robot.speed,
            moveDir.y * robot.speed
        );

        if (!moved) {
            startRobotEscape(robot);
        }

        return;
    }

    // pchanie w stronę granicy mapy
    const moveX = robot.pushDirX * robot.speed;
    const moveY = robot.pushDirY * robot.speed;

    const targetTestRect = {
        x: target.x + moveX,
        y: target.y + moveY,
        w: target.w,
        h: target.h
    };

    if (
        canMoveObject(target, moveX, moveY) &&
        !isRectInsideLab(targetTestRect)
    ) {
        movePhysicalObject(target, moveX, moveY);
        movePrankRobot(robot, moveX, moveY);

        robot.pushTimer++;

        if (robot.pushTimer > 200) {
            robot.target = null;
            robot.waitTimer = 15;
        }
    } else {
        startRobotEscape(robot);
    }
}

function movePrankRobot(robot, moveX, moveY) {
    const testRect = {
        x: robot.x + moveX,
        y: robot.y + moveY,
        w: robot.w,
        h: robot.h
    };

    if (
        testRect.x < 0 ||
        testRect.y < HUD_HEIGHT + 10 ||
        testRect.x + testRect.w > world.width ||
        testRect.y + testRect.h > world.height ||
        collidesWithLab(testRect) ||
        isRectInsideLab(testRect) ||
        collidesWithLibrary(testRect) ||
        isRectInsideLibrary(testRect)
    ) {
        return false;
    }

    robot.x += moveX;
    robot.y += moveY;

    return true;
}

function isRectInsideLibrary(rect) {
    return (
        rect.x >= library.x &&
        rect.y >= library.y &&
        rect.x + rect.w <= library.x + library.w &&
        rect.y + rect.h <= library.y + library.h
    );
}

function startRobotEscape(robot) {
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: -1, y: -1 }
    ];

    directions.sort(() => Math.random() - 0.5);

    for (const dir of directions) {
        const normalized = normalizeVector(dir.x, dir.y);

        if (movePrankRobot(robot, normalized.x * robot.speed, normalized.y * robot.speed)) {
            robot.escapeDirX = normalized.x;
            robot.escapeDirY = normalized.y;
            robot.escapeTimer = 45;
            robot.target = null;
            robot.waitTimer = 0;
            return;
        }
    }

    robot.target = null;
    robot.waitTimer = 30;
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

function isRectInsideLab(rect) {
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;

    return (
        cx > lab.x + lab.wall &&
        cx < lab.x + lab.w - lab.wall &&
        cy > lab.y + lab.wall &&
        cy < lab.y + lab.h - lab.wall
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

function isPlayerNearKnowledgeTerminal() {
    const playerCenterX = player.x + player.w / 2;
    const playerCenterY = player.y + player.h / 2;

    const terminalCenterX = knowledgeTerminal.x + knowledgeTerminal.width / 2;
    const terminalCenterY = knowledgeTerminal.y + knowledgeTerminal.height / 2;

    const dx = playerCenterX - terminalCenterX;
    const dy = playerCenterY - terminalCenterY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < 110;
}

function movePlayer(moveX, moveY) {
    // RUCH W OSI X
    player.x += moveX;

    if (
        collidesWithLab(player) ||
        collidesWithLibrary(player) ||
        collidesWithKnowledgeTerminal(player) ||
        getStaticObjectCollidingWithRect(player)
    ) {
        player.x -= moveX;
    } else {
        const pushedObject = getPhysicalObjectCollidingWithRect(player);

        if (pushedObject) {
            if (canMoveObject(pushedObject, moveX, 0)) {
                movePhysicalObject(pushedObject, moveX, 0);
            } else {
                player.x -= moveX;
            }
        }
    }

    // RUCH W OSI Y
    player.y += moveY;

    if (
        collidesWithLab(player) ||
        collidesWithLibrary(player) ||
        collidesWithKnowledgeTerminal(player) ||
        getStaticObjectCollidingWithRect(player)
    ) {
        player.y -= moveY;
    } else {
        const pushedObject = getPhysicalObjectCollidingWithRect(player);

        if (pushedObject) {
            if (canMoveObject(pushedObject, 0, moveY)) {
                movePhysicalObject(pushedObject, 0, moveY);
            } else {
                player.y -= moveY;
            }
        }
    }

    separatePlayerFromObjects();
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

function collidesWithLibrary(rect) {
    const walls = getLibraryWalls();

    for (const wall of walls) {
        if (rectsOverlap(rect, wall)) {
            return true;
        }
    }

    return false;
}

function getCollisionRect(obj) {
    if (obj === repairBox) {
        return {
            x: obj.x + 8,
            y: obj.y + 45,
            w: obj.w - 16,
            h: obj.h - 45
        };
    }

    if (obj === terminalDesk) {
        return {
            x: obj.x + 8,
            y: obj.y + 38,
            w: obj.w - 16,
            h: obj.h - 38
        };
    }

    if (obj === coreStorage) {
        return {
            x: obj.x + 8,
            y: obj.y + 20,
            w: obj.w - 16,
            h: obj.h - 20
        };
    }

    return obj;
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

function getLibraryWalls() {
    const doorX = library.x + library.w / 2 - library.doorW / 2;

    return [
        {
            x: library.x,
            y: library.y,
            w: library.w,
            h: library.wall
        },
        {
            x: library.x,
            y: library.y,
            w: library.wall,
            h: library.h
        },
        {
            x: library.x + library.w - library.wall,
            y: library.y,
            w: library.wall,
            h: library.h
        },
        {
            x: library.x,
            y: library.y + library.h - library.wall,
            w: doorX - library.x,
            h: library.wall
        },
        {
            x: doorX + library.doorW,
            y: library.y + library.h - library.wall,
            w: library.x + library.w - (doorX + library.doorW),
            h: library.wall
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

function rectsOverlapWithPadding(a, b, padding = 10) {
    return (
        a.x - padding < b.x + b.w + padding &&
        a.x + a.w + padding > b.x - padding &&
        a.y - padding < b.y + b.h + padding &&
        a.y + a.h + padding > b.y - padding
    );
}

function getDropBlockingObjects(excludedObject) {
    const objects = [repairBox, terminalDesk, coreStorage, knowledgeTerminal];

    for (const core of cores) {
        if (
            core !== excludedObject &&
            !isRemoved(core) &&
            !isInRepairBox(core)
        ) {
            objects.push(core);
        }
    }

    for (const wordObj of wordObjects) {
        if (
            wordObj !== excludedObject &&
            !isRemoved(wordObj) &&
            !isInRepairBox(wordObj)
        ) {
            objects.push(wordObj);
        }
    }

    for (const core of repairedCores) {
        if (
            core !== excludedObject &&
            !isInRepairBox(core)
        ) {
            objects.push(core);
        }
    }

    return objects;
}

function findFreeDropPosition(obj, startX, startY) {
    const playerWasInsideLab = isPlayerInsideLab();

    const positions = [
        { x: startX, y: startY },
        { x: startX + 45, y: startY },
        { x: startX - 45, y: startY },
        { x: startX, y: startY + 45 },
        { x: startX, y: startY - 45 },
        { x: startX + 45, y: startY + 45 },
        { x: startX - 45, y: startY + 45 },
        { x: startX + 45, y: startY - 45 },
        { x: startX - 45, y: startY - 45 },
        { x: startX + 90, y: startY },
        { x: startX - 90, y: startY },
        { x: startX, y: startY + 90 },
        { x: startX, y: startY - 90 }
    ];

    for (const pos of positions) {
        const testRect = {
            x: pos.x,
            y: pos.y,
            w: obj.w,
            h: obj.h
        };

        if (!isValidDropRect(testRect, obj, playerWasInsideLab)) {
            continue;
        }

        return pos;
    }

    return null;
}

function isValidDropRect(testRect, droppedObject, playerWasInsideLab) {
    // 1. Granice planszy
    if (
        testRect.x < 0 ||
        testRect.y < HUD_HEIGHT + 10 ||
        testRect.x + testRect.w > world.width ||
        testRect.y + testRect.h > world.height
    ) {
        return false;
    }

    // 2. Jeśli gracz jest w laboratorium, obiekt też musi zostać w laboratorium
    if (playerWasInsideLab && !isRectInsideLab(testRect)) {
        return false;
    }

    // 3. Jeśli gracz jest poza laboratorium, nie odkładamy obiektu do środka przez ścianę
    if (!playerWasInsideLab && isRectInsideLab(testRect)) {
        return false;
    }

    // 4. Obiekt nie może nachodzić na ściany laboratorium
    if (collidesWithLab(testRect) || collidesWithLibrary(testRect)) {
        return false;
    }

    // 5. Obiekt nie może nachodzić na box, terminal, magazyn ani inne obiekty
    for (const other of getDropBlockingObjects(droppedObject)) {
        const collisionRect = getCollisionRect(other);

        if (rectsOverlapWithPadding(testRect, collisionRect, 12)) {
            return false;
        }
    }

    // 6. Obiekt nie może zostać położony na graczu
    if (rectsOverlapWithPadding(testRect, player, 8)) {
        return false;
    }

    return true;
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(-camera.x, -camera.y);

    drawMap();

    if (carriedObject !== handScanner) {
        drawHandScanner();
    }

    for (const core of cores) {
        if (
            !isRemoved(core) &&
            carriedObject !== core &&
            !isInRepairBox(core) &&
            !isInScanner(core)
        ) {
            drawDamagedCore(core, 1);
        }
    }

    for (const wordObj of wordObjects) {
        if (
            !isRemoved(wordObj) &&
            carriedObject !== wordObj &&
            !isInRepairBox(wordObj) &&
            !isInScanner(wordObj)
        ) {
            drawWordModule(wordObj, 1);
        }
    }

    for (const core of repairedCores) {
        if (
            carriedObject !== core &&
            !isInRepairBox(core) &&
            !isInScanner(core)
        ) {
            drawRepairedCore(core, 1);
        }
    }

    for (const robot of prankRobots) {
        drawPrankRobot(robot);
    }
    drawPlayer();

    if (carriedObject && carriedObject.kind === "core") {
        drawDamagedCore(carriedObject, 0.5);
    }

    if (carriedObject && carriedObject.kind === "word") {
        drawWordModule(carriedObject, 0.5);
    }

    if (carriedObject && carriedObject.kind === "repairedCore") {
        drawRepairedCore(carriedObject, 0.5);
    }

    if (carriedObject === handScanner) {
        drawHandScanner(0.65);
    }

    drawRepairBoxSlots();

    drawUI();

    if (diagnosticOpen) {
        drawDiagnosticWindow();
    }

    if (databaseWindowOpen) {
        drawDatabaseWindow();
    }

    if (startInfoWindowOpen) {
        drawStartInfoWindow();
    }

    if (knowledgeTerminalOpen) {
        drawKnowledgeTerminalWindow();
    }

    if (instructionOpen) {
        drawInstructionWindow();
    }

    if (gameOver) {
        drawGameOverWindow();
    }

    if (levelCompleted) {
        drawLevelCompleteWindow();
    }

    if (scanPopupTimer > 0) {
        drawScanPopup();
    }
}

function drawLevelCompleteWindow() {
    const w = 720;
    const h = 430;
    const x = canvas.width / 2 - w / 2;
    const y = canvas.height / 2 - h / 2;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // przyciemnienie tła
    ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // karta certyfikatu
    ctx.fillStyle = "#08111f";
    roundRect(x, y, w, h, 22);
    ctx.fill();

    ctx.strokeStyle = "#b6ff6b";
    ctx.lineWidth = 4;
    ctx.stroke();

    // mała ramka wewnętrzna
    ctx.strokeStyle = "rgba(121, 255, 225, 0.45)";
    ctx.lineWidth = 2;
    roundRect(x + 22, y + 22, w - 44, h - 44, 16);
    ctx.stroke();

    ctx.fillStyle = "#b6ff6b";
    ctx.font = "34px Arial";
    ctx.fillText("LEVEL 1 UKOŃCZONY", x + 205, y + 72);

    ctx.fillStyle = "#79ffe1";
    ctx.font = "22px Arial";
    ctx.fillText("Certyfikat ukończenia etapu", x + 220, y + 118);

    // główny tekst certyfikatu
    ctx.fillStyle = "#c8fff4";
    ctx.font = "18px Arial";
    ctx.fillText("Uczeń pomyślnie naprawił wszystkie rdzenie systemowe,", x + 105, y + 170);
    ctx.fillText("dopasował moduły kodu i zabezpieczył laboratorium.", x + 135, y + 200);

    ctx.fillStyle = "#fef3c7";
    ctx.font = "28px Arial";
    ctx.fillText("JUNIOR PROGRAMISTA MAUI", x + 175, y + 265);

    // ozdobny znaczek
    ctx.fillStyle = "#14532d";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 330, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#b6ff6b";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#b6ff6b";
    ctx.font = "36px Arial";
    ctx.fillText("✓", x + w / 2 - 12, y + 343);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "15px Arial";
    ctx.fillText("Odśwież stronę, aby rozpocząć ponownie.", x + 238, y + h - 32);
}

function drawGameOverWindow() {
    const w = 620;
    const h = 250;
    const x = canvas.width / 2 - w / 2;
    const y = canvas.height / 2 - h / 2;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#111827";
    roundRect(x, y, w, h, 18);
    ctx.fill();

    ctx.strokeStyle = "#ff8080";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#ff8080";
    ctx.font = "42px Arial";
    ctx.fillText("GAME OVER", x + 185, y + 78);

    ctx.fillStyle = "#c8fff4";
    ctx.font = "19px Arial";
    ctx.fillText("System wykrył 3 błędne połączenia rdzeni z modułami.", x + 55, y + 130);

    ctx.fillStyle = "#fef3c7";
    ctx.font = "17px Arial";
    ctx.fillText("Odśwież stronę, aby rozpocząć ponownie.", x + 165, y + 178);
}

function drawDiagnosticWindow() {
    const w = 680;
    const h = 520;
    const x = canvas.width / 2 - w / 2;
    const y = canvas.height / 2 - h / 2;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#08111f";
    roundRect(x, y, w, h, 18);
    ctx.fill();

    ctx.strokeStyle = "#79ffe1";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#79ffe1";
    ctx.font = "24px Arial";
    ctx.fillText("DIAGNOSTYKA BOXU", x + 30, y + 45);

    let lineY = y + 82;

    const wordsInBox = getWordObjectsInRepairBox();
    const coresInBox = getCoreObjectsInRepairBox();
    const repairedInBox = getRepairedCoreObjectsInRepairBox();

    for (const core of repairedInBox) {
        ctx.fillStyle = "#c8fff4";
        ctx.font = "16px Arial";
        ctx.fillText(`${core.label}: sprawny`, x + 30, lineY);
        lineY += 24;

        ctx.fillStyle = "#111827";
        roundRect(x + 30, lineY, w - 60, 52, 10);
        ctx.fill();

        ctx.fillStyle = "#b6ff6b";
        ctx.font = "20px Consolas, monospace";
        ctx.fillText(core.code.replace("___", core.correctWord), x + 55, lineY + 34);

        lineY += 75;
    }

    for (const core of coresInBox) {
        ctx.fillStyle = "#c8fff4";
        ctx.font = "16px Arial";
        ctx.fillText(`${core.label}: uszkodzony`, x + 30, lineY);
        lineY += 24;

        ctx.fillStyle = "#111827";
        roundRect(x + 30, lineY, w - 60, 52, 10);
        ctx.fill();

        ctx.fillStyle = "#fef3c7";
        ctx.font = "20px Consolas, monospace";
        ctx.fillText(core.code, x + 55, lineY + 34);

        lineY += 75;
    }

    for (const wordObj of wordsInBox) {
        ctx.fillStyle = "#c8fff4";
        ctx.font = "15px Arial";
        ctx.fillText(`${wordObj.label}: ukryte słowo`, x + 30, lineY);
        lineY += 22;

        ctx.fillStyle = "#111827";
        roundRect(x + 30, lineY, w - 60, 46, 10);
        ctx.fill();

        ctx.fillStyle = "#b6ff6b";
        ctx.font = "22px Consolas, monospace";
        ctx.fillText(wordObj.hiddenWord, x + 55, lineY + 31);

        lineY += 64;
    }

    ctx.fillStyle = "#79ffe1";
    ctx.font = "15px Arial";
    ctx.fillText("ESC — zamknij", x + 30, y + h - 22);
}

function drawWordModule(obj, scale = 1) {
    const x = obj.x;
    const y = obj.y;
    const w = obj.w * scale;
    const h = obj.h * scale;

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 5, 22 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#064e3b";
    roundRect(x, y, w, h, 7 * scale);
    ctx.fill();

    ctx.strokeStyle = "#b6ff6b";
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    ctx.fillStyle = "#b6ff6b";
    ctx.font = `${16 * scale}px Consolas`;
    ctx.fillText("?", x + 12 * scale, y + 23 * scale);
}

function drawRepairBoxSlots() {
    const count = repairBoxSlots.length;
    if (count === 0) return;

    const slotSize = 24;
    const gap = 10;

    const totalWidth = count * slotSize + (count - 1) * gap;

    let startX = repairBox.x + repairBox.w / 2 - totalWidth / 2;
    const y = repairBox.y + 42;

    for (let i = 0; i < repairBoxSlots.length; i++) {
        const obj = repairBoxSlots[i];
        const x = startX + i * (slotSize + gap);

        if (obj.kind === "core") {
            drawMiniCore(x, y);
        }

        if (obj.kind === "word") {
            drawMiniWordModule(x, y);
        }

        if (obj.kind === "repairedCore") {
            drawMiniRepairedCore(x, y);
        }

        ctx.fillStyle = "#c8fff4";
        ctx.font = "10px Arial";
        ctx.fillText(String(i + 1), x + 8, y + 36);
    }
}

function drawMiniCore(x, y) {
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

function drawMiniRepairedCore(x, y) {
    ctx.fillStyle = "#2e1065";
    roundRect(x, y, 24, 24, 6);
    ctx.fill();

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "#ff4fd8";
    ctx.lineWidth = 1.5;
    roundRect(x + 4, y + 4, 16, 16, 4);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(x + 18, y + 7, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawMiniWordModule(x, y) {
    ctx.fillStyle = "#064e3b";
    roundRect(x, y, 24, 24, 6);
    ctx.fill();

    ctx.strokeStyle = "#b6ff6b";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#b6ff6b";
    ctx.font = "16px Consolas";
    ctx.fillText("?", x + 8, y + 18);
}

function drawHandScanner(scale = 1) {
    const x = handScanner.x;
    const y = handScanner.y;

    const w = handScanner.w * scale;
    const h = handScanner.h * scale;

    // mały cień
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(
        x + w / 2,
        y + h + 4 * scale,
        w * 0.26,
        4 * scale,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // dolna podstawa urządzenia
    ctx.fillStyle = "#0f172a";
    roundRect(x, y + 18 * scale, w, h - 12 * scale, 12 * scale);
    ctx.fill();

    // górne przezroczyste szkiełko
    ctx.fillStyle = "rgba(125, 255, 230, 0.13)";
    roundRect(
        x + 8 * scale,
        y,
        w - 16 * scale,
        h * 0.62,
        12 * scale
    );
    ctx.fill();

    ctx.strokeStyle = scannerSlot ? "#b6ff6b" : "#79ffe1";
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // delikatny połysk szkła
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 18 * scale, y + 9 * scale);
    ctx.lineTo(x + w - 20 * scale, y + 9 * scale);
    ctx.stroke();

    // panel statusu na podstawie
    ctx.fillStyle = scannerSlot ? "#14532d" : "#1e293b";
    roundRect(
        x + 16 * scale,
        y + h - 18 * scale,
        w - 32 * scale,
        10 * scale,
        5 * scale
    );
    ctx.fill();

    // zawartość skanera
    if (scannerSlot) {
        drawObjectInsideScanner(x, y, w, h, scale);
    } else {
        ctx.fillStyle = "#94a3b8";
        ctx.font = `${11 * scale}px Consolas`;
        ctx.fillText("PUSTY", x + 20 * scale, y + 31 * scale);
    }
}

function drawObjectInsideScanner(scannerX, scannerY, scannerW, scannerH, scale = 1) {
    const size = 20 * scale;

    // centrum szkiełka, nie całego skanera
    const glassCenterX = scannerX + scannerW / 2;
    const glassCenterY = scannerY + scannerH * 0.31;

    const x = glassCenterX - size / 2;
    const y = glassCenterY - size / 2;

    if (scannerSlot.kind === "core") {
        ctx.fillStyle = "#2e1065";
        roundRect(x, y, size, size, 5 * scale);
        ctx.fill();

        ctx.strokeStyle = "#ff4fd8";
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        ctx.strokeStyle = "#fef3c7";
        ctx.lineWidth = 1.4 * scale;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.52, y + size * 0.12);
        ctx.lineTo(x + size * 0.35, y + size * 0.48);
        ctx.lineTo(x + size * 0.62, y + size * 0.60);
        ctx.lineTo(x + size * 0.44, y + size * 0.88);
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(x + size * 0.72, y + size * 0.25, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();

        return;
    }

    if (scannerSlot.kind === "word") {
        ctx.fillStyle = "#064e3b";
        roundRect(x, y, size, size, 5 * scale);
        ctx.fill();

        ctx.strokeStyle = "#b6ff6b";
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        ctx.fillStyle = "#b6ff6b";
        ctx.font = `${14 * scale}px Consolas`;
        ctx.fillText("?", x + 6.5 * scale, y + 15.5 * scale);

        return;
    }

    if (scannerSlot.kind === "repairedCore") {
        ctx.fillStyle = "#2e1065";
        roundRect(x, y, size, size, 5 * scale);
        ctx.fill();

        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3 * scale;
        ctx.stroke();

        ctx.strokeStyle = "#ff4fd8";
        ctx.lineWidth = 1.3 * scale;
        roundRect(
            x + 4 * scale,
            y + 4 * scale,
            size - 8 * scale,
            size - 8 * scale,
            4 * scale
        );
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(x + size * 0.72, y + size * 0.25, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawScanPopup() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.font = "18px Consolas, monospace";

    const paddingX = 24;
    const textWidth = ctx.measureText(scanPopupText).width;

    let w = 420;
    let h = 90;
    let useWrappedText = false;

    if (textWidth > w - paddingX * 2) {
        w = 620;
        h = 120;
        useWrappedText = true;
    }

    const x = canvas.width / 2 - w / 2;
    const y = 82;

    ctx.fillStyle = "rgba(8, 17, 31, 0.94)";
    roundRect(x, y, w, h, 14);
    ctx.fill();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#79ffe1";
    ctx.font = "18px Arial";
    ctx.fillText("SKANER", x + 24, y + 32);

    ctx.fillStyle = "#c8fff4";
    ctx.font = "18px Consolas, monospace";

    if (useWrappedText) {
        drawWrappedScanText(scanPopupText, x + 24, y + 68, w - 48, 24);
    } else {
        ctx.fillText(scanPopupText, x + 24, y + 65);
    }
}

function drawWrappedScanText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let lineNumber = 0;

    for (const word of words) {
        const testLine = line === "" ? word : line + " " + word;

        if (ctx.measureText(testLine).width <= maxWidth) {
            line = testLine;
        } else {
            ctx.fillText(line, x, y + lineNumber * lineHeight);
            lineNumber++;
            line = word;
        }
    }

    if (line !== "") {
        ctx.fillText(line, x, y + lineNumber * lineHeight);
    }
}

function drawMap() {
    drawBackground();
    drawGroundTiles();

    drawLab();
    drawLibrary();

    drawLabEquipment();
    drawKnowledgeTerminal();

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
    ctx.fillStyle = "#e5f7ff";
    ctx.font = "26px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LABORATORIUM", lab.x + lab.w / 2, lab.y + 34);
    ctx.textAlign = "left";

    // delikatne oznaczenie wejścia
    ctx.fillStyle = "#0f172a";
    ctx.font = "15px Arial";
    ctx.fillText("WEJŚCIE", doorX + 45, doorY + 26);
}

function drawKnowledgeTerminal() {
    const x = knowledgeTerminal.x;
    const y = knowledgeTerminal.y;
    const w = knowledgeTerminal.width;
    const h = knowledgeTerminal.height;

    // cień
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 7, w * 0.42, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // podstawa
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(x + w / 2 - 9, y + h - 6, 18, 10);

    ctx.fillStyle = "#9ca3af";
    roundRect(x + w / 2 - 24, y + h + 2, 48, 6, 3);
    ctx.fill();

    // główna tablica / obudowa
    ctx.fillStyle = "#23405a";
    roundRect(x, y, w, h - 10, 10);
    ctx.fill();

    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 2;
    ctx.stroke();

    // górny napis
    ctx.fillStyle = "#e0f2fe";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TERMINAL", x + w / 2, y + 16);

    // "książka" / panel wiedzy
    const bx = x + 16;
    const by = y + 26;
    const bw = w - 32;
    const bh = 34;

    ctx.fillStyle = "#2563eb";
    roundRect(bx, by, bw, bh, 6);
    ctx.fill();

    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 1;
    ctx.stroke();

    // podział książki
    ctx.strokeStyle = "#dbeafe";
    ctx.beginPath();
    ctx.moveTo(x + w / 2, by + 4);
    ctx.lineTo(x + w / 2, by + bh - 4);
    ctx.stroke();

    // linie tekstu lewej strony
    ctx.strokeStyle = "#dbeafe";
    ctx.beginPath();
    ctx.moveTo(bx + 8, by + 10);
    ctx.lineTo(x + w / 2 - 6, by + 10);
    ctx.moveTo(bx + 8, by + 18);
    ctx.lineTo(x + w / 2 - 10, by + 18);
    ctx.stroke();

    // znak zapytania po prawej
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.fillText("?", x + w / 2 + 15, by + 24);

    ctx.textAlign = "left";
}

function collidesWithKnowledgeTerminal(rect) {
    return rectsOverlap(rect, {
        x: knowledgeTerminal.x,
        y: knowledgeTerminal.y,
        w: knowledgeTerminal.width,
        h: knowledgeTerminal.height
    });
}

function drawLibrary() {
    const doorX = library.x + library.w / 2 - library.doorW / 2;
    const doorY = library.y + library.h - library.wall;

    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(
        library.x + library.w / 2,
        library.y + library.h + 16,
        library.w * 0.45,
        28,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // podłoga
    ctx.fillStyle = "#1c1a2e";
    ctx.fillRect(
        library.x + library.wall,
        library.y + library.wall,
        library.w - library.wall * 2,
        library.h - library.wall * 2
    );

    // delikatne linie podłogi
    ctx.strokeStyle = "rgba(255, 210, 120, 0.08)";
    ctx.lineWidth = 1;

    for (let x = library.x + library.wall; x < library.x + library.w - library.wall; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, library.y + library.wall);
        ctx.lineTo(x, library.y + library.h - library.wall);
        ctx.stroke();
    }

    for (let y = library.y + library.wall; y < library.y + library.h - library.wall; y += 70) {
        ctx.beginPath();
        ctx.moveTo(library.x + library.wall, y);
        ctx.lineTo(library.x + library.w - library.wall, y);
        ctx.stroke();
    }

    // ściany
    ctx.fillStyle = "#221827";

    ctx.fillRect(library.x, library.y, library.w, library.wall);
    ctx.fillRect(library.x, library.y, library.wall, library.h);
    ctx.fillRect(library.x + library.w - library.wall, library.y, library.wall, library.h);

    ctx.fillRect(library.x, doorY, doorX - library.x, library.wall);
    ctx.fillRect(
        doorX + library.doorW,
        doorY,
        library.x + library.w - (doorX + library.doorW),
        library.wall
    );

    // jaśniejsze krawędzie
    ctx.fillStyle = "#3b2745";
    ctx.fillRect(library.x, library.y, library.w, 12);
    ctx.fillRect(library.x, library.y, 12, library.h);
    ctx.fillRect(library.x + library.w - 12, library.y, 12, library.h);

    ctx.fillRect(library.x, doorY, doorX - library.x, 12);
    ctx.fillRect(
        doorX + library.doorW,
        doorY,
        library.x + library.w - (doorX + library.doorW),
        12
    );

    // obrys
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 4;
    ctx.strokeRect(library.x, library.y, library.w, library.h);

    // maska drzwi
    ctx.fillStyle = "#1c1a2e";
    ctx.fillRect(doorX - 6, doorY - 4, library.doorW + 12, library.wall + 12);

    // próg
    ctx.fillStyle = "#ffd166";
    roundRect(doorX, doorY + 7, library.doorW, 22, 8);
    ctx.fill();

    ctx.fillStyle = "#ffe8a3";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BIBLIOTEKA", library.x + library.w / 2, library.y + 34);

    ctx.fillStyle = "#0f172a";
    ctx.font = "14px Arial";
    ctx.fillText("WEJŚCIE", doorX + library.doorW / 2, doorY + 24);

    ctx.textAlign = "left";
}

function drawLabEquipment() {
    drawRepairBox();
    drawTerminalDesk();
    drawCoreStorage();
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

    if (linkErrorFlash > 0) {
        const alpha = linkErrorFlash / 45;

        ctx.strokeStyle = `rgba(255, 80, 80, ${alpha})`;
        ctx.lineWidth = 6;
        roundRect(x + 35, y + 25, w - 70, 55, 14);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 40, 40, ${alpha * 0.18})`;
        roundRect(x + 35, y + 25, w - 70, 55, 14);
        ctx.fill();
    }
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

function drawKnowledgeTerminalWindow() {
    const w = 640;
    const h = 420;
    const x = canvas.width / 2 - w / 2;
    const y = canvas.height / 2 - h / 2;

    ctx.fillStyle = "rgba(5, 12, 24, 0.95)";
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#e0f2fe";
    ctx.font = "26px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TERMINAL WIEDZY", x + w / 2, y + 48);

    ctx.fillStyle = "#c8fff4";
    ctx.font = "17px Arial";
    ctx.textAlign = "left";

    const lines = [
        "Tutaj będą pojawiać się informacje z aktualnej bazy wiedzy.",
        "",
        "Na razie terminal został poprawnie otwarty.",
        "W następnym kroku pokażemy tutaj tematy:",
        "- topic",
        "- hint",
        "- explanation"
    ];

    let textY = y + 95;

    for (const line of lines) {
        ctx.fillText(line, x + 50, textY);
        textY += 28;
    }

    drawDatabaseButton(x + w / 2 - 90, y + h - 65, 180, 42, "ZAMKNIJ");

    ctx.textAlign = "left";
}

function drawCoreStorage() {
    const x = coreStorage.x;
    const y = coreStorage.y;
    const w = coreStorage.w;
    const h = coreStorage.h;

    // cień
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 10, w * 0.42, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // korpus
    ctx.fillStyle = "#1e293b";
    roundRect(x, y, w, h, 18);
    ctx.fill();

    // wnętrze magazynu — większa przestrzeń ładunkowa
    ctx.fillStyle = "#0f172a";
    roundRect(x + 18, y + 28, w - 36, h - 88, 14);
    ctx.fill();

    // obrys wnętrza
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    roundRect(x + 18, y + 28, w - 36, h - 88, 14);
    ctx.stroke();

    // podpis
    ctx.fillStyle = "#c8fff4";
    ctx.font = "15px Arial";
    ctx.fillText("MAGAZYN", x + 48, y + h - 24);

    // licznik mały na dole
    ctx.fillStyle = "#22c55e";
    ctx.font = "14px Arial";
    ctx.fillText(`${storedRepairedCores.length}/${cores.length}`, x + 68, y + h - 8);

    drawStoredCoresInsideStorage(x, y, w, h);
}

function drawStoredCoresInsideStorage(storageX, storageY, storageW, storageH) {
    const scale = 0.5;
    const miniW = CORE_SIZE * scale;
    const miniH = CORE_SIZE * scale;

    const columns = 3;
    const gapX = 18;
    const gapY = 18;

    const innerX = storageX + 18;
    const innerY = storageY + 28;
    const innerW = storageW - 36;
    const innerH = storageH - 88;

    const totalRowWidth = columns * miniW + (columns - 1) * gapX;
    const startX = innerX + innerW / 2 - totalRowWidth / 2;

    const bottomY = innerY + innerH - miniH - 16;

    for (let i = 0; i < storedRepairedCores.length; i++) {
        const col = i % columns;
        const rowFromBottom = Math.floor(i / columns);

        const x = startX + col * (miniW + gapX);
        const y = bottomY - rowFromBottom * (miniH + gapY);

        drawStoredMiniCore(x, y, scale);
    }
}

function drawStoredMiniCore(x, y, scale = 0.5) {
    const w = CORE_SIZE * scale;
    const h = CORE_SIZE * scale;

    ctx.fillStyle = "#2e1065";
    roundRect(x, y, w, h, 6);
    ctx.fill();

    // zielona obwódka = naprawiony
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.stroke();

    // wewnętrzna fioletowa obwódka
    ctx.strokeStyle = "#ff4fd8";
    ctx.lineWidth = 1.5;
    roundRect(x + 3, y + 3, w - 6, h - 6, 4);
    ctx.stroke();

    // punkt energii
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.28, 2.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawDamagedCore(core, scale = 1) {
    const x = core.x;
    const y = core.y;
    const w = core.w * scale;
    const h = core.h * scale;

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

function drawRepairedCore(core, scale = 1) {
    const x = core.x;
    const y = core.y;
    const w = core.w * scale;
    const h = core.h * scale;

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 5, 24 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2e1065";
    roundRect(x, y, w, h, 8 * scale);
    ctx.fill();

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 5 * scale;
    ctx.stroke();

    ctx.strokeStyle = "#ff4fd8";
    ctx.lineWidth = 2 * scale;
    roundRect(x + 5 * scale, y + 5 * scale, w - 10 * scale, h - 10 * scale, 6 * scale);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(x + 27 * scale, y + 10 * scale, 4 * scale, 0, Math.PI * 2);
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

function drawPrankRobot(robot) {
    const x = robot.x;
    const y = robot.y;
    const w = robot.w;
    const h = robot.h;

    // cień
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 5, w * 0.45, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // korpus
    ctx.fillStyle = "#451a03";
    roundRect(x, y + 8, w, h - 8, 10);
    ctx.fill();

    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 3;
    ctx.stroke();

    // głowa / sensor
    ctx.fillStyle = "#7c2d12";
    roundRect(x + 8, y, w - 16, 20, 8);
    ctx.fill();

    // oczy
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(x + 17, y + 12, 4, 0, Math.PI * 2);
    ctx.arc(x + 31, y + 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // antenka
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2 + 8, y - 12);
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(x + w / 2 + 8, y - 12, 3, 0, Math.PI * 2);
    ctx.fill();
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

function drawDatabaseWindow() {
    const w = 640;
    const h = 260;
    const x = canvas.width / 2 - w / 2;
    const y = canvas.height / 2 - h / 2;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#08111f";
    roundRect(x, y, w, h, 18);
    ctx.fill();

    ctx.strokeStyle = "#79ffe1";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#79ffe1";
    ctx.font = "24px Arial";
    ctx.fillText("WYBIERZ BAZĘ", x + 32, y + 48);

    ctx.fillStyle = "#c8fff4";
    ctx.font = "16px Arial";
    ctx.fillText("Wczytaj plik .js z danymi do gry.", x + 32, y + 86);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px Arial";
    ctx.fillText("Wybierz plik bazy, a następnie wczytaj go do gry.", x + 32, y + 116);

    // przyciski testowe
    drawDatabaseButton(x + 55, y + 150, 160, 42, "WYBIERZ PLIK");
    drawDatabaseButton(x + 240, y + 150, 160, 42, "WCZYTAJ");
    drawDatabaseButton(x + 425, y + 150, 160, 42, "ANULUJ");

    ctx.fillStyle = "#c8fff4";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(selectedDatabaseFileName, x + w / 2, y + 216);

    if (databaseStatusText) {
        ctx.fillStyle = "#ff8080";
        ctx.font = "14px Arial";
        ctx.fillText(databaseStatusText, x + w / 2, y + 238);
    }

    ctx.textAlign = "left";
}

function drawStartInfoWindow() {
    const w = 620;
    const h = 360;
    const x = canvas.width / 2 - w / 2;
    const y = canvas.height / 2 - h / 2;

    ctx.fillStyle = "rgba(5, 12, 24, 0.94)";
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "#79ffe1";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#79ffe1";
    ctx.font = "26px Arial";
    ctx.textAlign = "center";
    ctx.fillText("START POZIOMU", x + w / 2, y + 48);

    ctx.fillStyle = "#e5f7ff";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";

    const lines = [
        "Cel: napraw wszystkie rdzenie anomalii.",
        "",
        "1. Znajdź uszkodzony rdzeń na mapie.",
        "2. Zanieś go do laboratorium i zeskanuj.",
        "3. Odszukaj pasujący moduł kodu.",
        "4. Połącz rdzeń z poprawnym modułem.",
        "5. Odłóż naprawiony rdzeń do magazynu.",
        "",
        "Uważaj na roboty psotniki — mogą przesuwać obiekty."
    ];

    let textY = y + 82;

    for (const line of lines) {
        ctx.fillText(line, x + 50, textY);
        textY += 22;
    }

    drawDatabaseButton(x + w / 2 - 90, y + h - 70, 180, 42, "START");

    ctx.textAlign = "left";
}

function drawDatabaseButton(x, y, w, h, text) {
    ctx.fillStyle = "#08111f";
    roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#79ffe1";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
}

function drawInstructionWindow() {
    const w = 720;
    const h = 500;
    const x = canvas.width / 2 - w / 2;
    const y = canvas.height / 2 - h / 2;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#08111f";
    roundRect(x, y, w, h, 18);
    ctx.fill();

    ctx.strokeStyle = "#79ffe1";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#79ffe1";
    ctx.font = "23px Arial";
    ctx.fillText("INSTRUKCJA GRY", x + 32, y + 44);

    const lines = [
        ["Cel gry:", true],
        ["Napraw wszystkie rdzenie i zdeponuj je w magazynie.", false],
        ["Łącz uszkodzony rdzeń z właściwym modułem słowa.", false],

        ["Sterowanie:", true],
        ["WASD / strzałki — ruch", false],
        ["E — podnieś / odłóż obiekt", false],
        ["R — włóż / wyjmij obiekt z boxu lub skanera", false],
        ["G — diagnostyka terminala lub skan ręczny", false],
        ["L — link rdzenia z modułem w terminalu", false],
        ["SPACJA — rzut niesionym obiektem", false],
        ["I — instrukcja,  ESC — zamknij okno", false],

        ["Skaner:", true],
        ["Możesz przenieść go w teren. Włóż jeden obiekt i użyj G,", false],
        ["aby szybko sprawdzić jego informację.", false],

        ["Roboty psotniki:", true],
        ["Działają poza laboratorium i przesuwają obiekty.", false],
        ["Laboratorium jest bezpieczną strefą.", false]
    ];

    let lineY = y + 82;

    for (const [text, header] of lines) {
        if (header) {
            lineY += 8;
            ctx.fillStyle = "#b6ff6b";
            ctx.font = "16px Arial";
        } else {
            ctx.fillStyle = "#c8fff4";
            ctx.font = "14px Arial";
        }

        ctx.fillText(text, x + 36, lineY);
        lineY += header ? 21 : 19;
    }

    ctx.fillStyle = "#79ffe1";
    ctx.font = "15px Arial";
    ctx.fillText("ESC — zamknij", x + 36, y + h - 24);
}

function drawUI() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "rgba(4, 8, 16, 0.82)";
    ctx.fillRect(0, 0, canvas.width, 56);

    ctx.fillStyle = "#79ffe1";
    ctx.font = "18px Arial";
    ctx.fillText(message, 24, 35);

    drawDatabaseButton(canvas.width - 640, 11, 170, 34, "GENERATOR BAZY");
    drawDatabaseButton(canvas.width - 455, 11, 125, 34, "ZMIEŃ BAZĘ");

    ctx.fillStyle = wrongLinks >= 2 ? "#ff8080" : "#fef3c7";
    ctx.font = "16px Arial";
    ctx.fillText(
        `Błędy: ${wrongLinks} / ${WRONG_LINK_LIMIT}`,
        canvas.width - 310,
        35
    );

    ctx.fillStyle = "#c8fff4";
    ctx.font = "16px Arial";
    ctx.fillText(
        `Rdzenie: ${storedRepairedCores.length} / ${cores.length}`,
        canvas.width - 170,
        35
    );

    ctx.fillStyle = "rgba(4, 8, 16, 0.72)";
    ctx.fillRect(20, canvas.height - 54, 260, 34);

    ctx.fillStyle = "#c8fff4";
    ctx.font = "15px Arial";
    ctx.fillText("WASD / strzałki — ruch    I — instrukcja", 36, canvas.height - 32);
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

function createDatabaseFileInput() {
    databaseFileInput = document.createElement("input");
    databaseFileInput.type = "file";
    databaseFileInput.accept = ".js";
    databaseFileInput.style.display = "none";

    databaseFileInput.addEventListener("change", function () {
        selectedDatabaseFile = databaseFileInput.files[0] || null;
        databaseStatusText = "";

        if (selectedDatabaseFile) {
            selectedDatabaseFileName = selectedDatabaseFile.name;
        } else {
            selectedDatabaseFileName = "Nie wybrano pliku";
        }
    });

    document.body.appendChild(databaseFileInput);
}

function resetGameStateForNewDatabase() {
    player.x = 500;
    player.y = 500;
    player.moving = false;
    player.walkTime = 0;
    player.dirX = 0;
    player.dirY = 1;

    camera.x = 0;
    camera.y = 0;

    carriedObject = null;
    scannerSlot = null;

    repairedCores.length = 0;
    repairBoxSlots.length = 0;
    storedRepairedCores.length = 0;
    removedObjects.length = 0;
    thrownObjects.length = 0;

    wrongLinks = 0;
    gameOver = false;
    levelCompleted = false;
    diagnosticOpen = false;
    instructionOpen = false;

    temporaryMessage = null;
    temporaryMessageTimer = 0;
    scanPopupText = "";
    scanPopupTimer = 0;
    linkErrorFlash = 0;

    prankRobots[0].x = 1750;
    prankRobots[0].y = 760;

    prankRobots[1].x = 2050;
    prankRobots[1].y = 1050;

    prankRobots[2].x = 2350;
    prankRobots[2].y = 1360;

    for (const robot of prankRobots) {
        robot.target = null;
        robot.pushDirX = 0;
        robot.pushDirY = 0;
        robot.pushTimer = 0;
        robot.waitTimer = 0;
        robot.skippedTarget = null;
        robot.skipTimer = 0;
        robot.escapeTimer = 0;
        robot.escapeDirX = 0;
        robot.escapeDirY = 0;
    }
}

function applyDatabaseTasks(tasks) {
    buildObjectsFromTasks(tasks);
    resetGameStateForNewDatabase();

    databaseWindowOpen = false;
    startInfoWindowOpen = true;
    databaseStatusText = "";
    selectedDatabaseFile = null;
    selectedDatabaseFileName = "Nie wybrano pliku";

    if (databaseFileInput) {
        databaseFileInput.value = "";
    }

    showTemporaryMessage("Baza wczytana. Rozpocznij naprawę rdzeni.", 140);
}

function validateLoadedTasks(tasks) {
    if (!Array.isArray(tasks)) {
        return "Błąd bazy — tasks nie jest tablicą.";
    }

    if (tasks.length === 0) {
        return "Błąd bazy — lista tasks jest pusta.";
    }

    const ids = new Set();

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const rowNumber = i + 1;

        if (!task || typeof task !== "object") {
            return "Błąd w zadaniu " + rowNumber + " — niepoprawny obiekt.";
        }

        if (!task.id || typeof task.id !== "string") {
            return "Błąd w zadaniu " + rowNumber + " — brak id.";
        }

        if (ids.has(task.id)) {
            return "Błąd w zadaniu " + rowNumber + " — powtórzone id: " + task.id + ".";
        }

        ids.add(task.id);

        if (!task.code || typeof task.code !== "string") {
            return "Błąd w zadaniu " + rowNumber + " — brak code.";
        }

        if (!task.code.includes("___")) {
            return "Błąd w zadaniu " + rowNumber + " — code nie zawiera ___.";
        }

        if (!task.answer || typeof task.answer !== "string") {
            return "Błąd w zadaniu " + rowNumber + " — brak answer.";
        }
    }

    return null;
}

function readSelectedDatabaseFile() {
    if (!selectedDatabaseFile) {
        databaseStatusText = "Najpierw wybierz plik bazy.";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const fileText = event.target.result;

            if (!/const\s+GAME_CONTENT\s*=/.test(fileText)) {
                databaseStatusText = "Błąd bazy — plik nie zawiera const GAME_CONTENT.";
                return;
            }

            const loadedContent = new Function(`
    ${fileText}
    return GAME_CONTENT;
`)();

            if (!loadedContent || !loadedContent.tasks) {
                databaseStatusText = "Błąd bazy — brak GAME_CONTENT.tasks.";
                return;
            }

            const validationError = validateLoadedTasks(loadedContent.tasks);

            if (validationError) {
                databaseStatusText = validationError;
                return;
            }

            applyDatabaseTasks(loadedContent.tasks);

        } catch (error) {
            databaseStatusText = "Błąd wczytywania bazy.";
            console.error(error);
        }
    };

    reader.readAsText(selectedDatabaseFile, "UTF-8");
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

createDatabaseFileInput();
gameLoop();