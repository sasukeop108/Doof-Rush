import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

kaplay({ debugKey: "w" });

loadFont("Darumadrop One", "assets/fonts/DarumadropOne-Regular.ttf");
loadSprite("daven", "assets/sprites/daven.png");
loadSprite("bg", "assets/bg/hero-bg.png");
loadSprite("welcomeBg", "assets/bg/trail.png");
loadSprite("overbg", "assets/bg/game-over-bg.png");
loadSprite("spaceBg", "/assets/bg/space.jpg");
loadSprite("spring", "assets/spring.png");
loadSprite("portal", "assets/sprites/portal.png");

loadSound("space", "assets/audio/space-click.mp3");
loadSound("boom", "assets/audio/boom.mp3");
loadSound("boing", "assets/audio/boing-with-quiver.mp3");
loadSound("springSound", "assets/audio/goofy-spring-sound.mp3");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

function focusCanvas() {
    const canvas = document.querySelector("canvas");
    if (canvas) canvas.focus();
}

startBtn.addEventListener("click", () => {
    startBtn.blur();
    focusCanvas();
    go("game", { score: 0 });
});

restartBtn.addEventListener("click", () => {
    restartBtn.blur();
    focusCanvas();
    go("game", { score: 0 });
});

function setupBg(spriteName) {
    const bg = add([
        sprite(spriteName),
        pos(center()),
        anchor("center"),
        scale(1),
        z(-100),
        fixed(),
    ]);

    const fit = () => {
        if (bg.width && bg.height) {
            const scaleX = width() / bg.width;
            const scaleY = height() / bg.height;
            bg.scale = vec2(Math.max(scaleX, scaleY));
        }
    };

    fit();
    if (bg.onLoad) bg.onLoad(fit);
    onResize(fit);
    return bg;
}

const RICK_ROLL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

function openRickRoll() {
    try {
        const win = window.open(RICK_ROLL_URL, "_blank");
        if (!win || win.closed || typeof win.closed === "undefined") {
            window.location.href = RICK_ROLL_URL;
        }
    } catch {
        window.location.href = RICK_ROLL_URL;
    }
}

function getHighScore() {
    return parseInt(localStorage.getItem("haven_highscore")) || 0;
}

function saveHighScore(newScore) {
    const currentHigh = getHighScore();
    if (newScore > currentHigh) {
        localStorage.setItem("haven_highscore", newScore);
        return true;
    }
    return false;
}

scene("welcome", () => {
    startBtn.style.display = "block";
    restartBtn.style.display = "none";
    setupBg("welcomeBg");

    add([
        text("DOOF RUSH", { font: "Darumadrop One", size: 90 }),
        pos(center().x, center().y - 120),
        anchor("center"),
        color(120, 61, 43),
        z(10),
    ]);

    const high = getHighScore();
    if (high > 0) {
        add([
            text(`HIGH SCORE: ${high}`, { font: "Darumadrop One", size: 34 }),
            pos(center().x, center().y - 45),
            anchor("center"),
            color(255, 220, 80),
            z(10),
        ]);
    }
});

scene("lose", ({ score = 0 } = {}) => {
    startBtn.style.display = "none";
    restartBtn.style.display = "block";

    setupBg("overbg");

    const isNewHigh = saveHighScore(score);
    const high = getHighScore();

    add([
        text("Game Over", { font: "Darumadrop One", size: 80 }),
        pos(center().x, center().y - 75),
        anchor("center"),
        color("#dfa063"),
        z(10),
    ]);

    add([
        text(`Final Score: ${score}`, { font: "Darumadrop One", size: 38 }),
        pos(center().x, center().y - 10),
        anchor("center"),
        color(255, 255, 255),
        z(10),
    ]);

    add([
        text(isNewHigh ? `NEW HIGH SCORE: ${high} ` : `High Score: ${high}`, { font: "Darumadrop One", size: 32 }),
        pos(center().x, center().y + 35),
        anchor("center"),
        color(isNewHigh ? rgb(255, 220, 80) : rgb(200, 200, 200)),
        z(10),
    ]);
});

scene("game", ({ score: initialScore = 0, fromSpace = false, rickRolled: initialRickRolled = false } = {}) => {
    startBtn.style.display = "none";
    restartBtn.style.display = "none";

    setupBg("bg");

    let score = initialScore;
    let rickRolled = initialRickRolled;
    let scoreTimer = 0;
    const gameStartTime = time();
    let transitioning = false;

    const scoreText = add([
        text(`SCORE: ${score}`, { font: "Darumadrop One", size: 36 }),
        pos(24, 24),
        color(255, 255, 255),
        z(50),
    ]);

    const highScoreText = add([
        text(`HIGH: ${Math.max(getHighScore(), score)}`, { font: "Darumadrop One", size: 32 }),
        pos(width() - 24, 24),
        anchor("topright"),
        color(255, 220, 80),
        z(50),
    ]);

    function checkRickRoll() {
        if (!rickRolled && score >= 92000) {
            score = 92000;
            scoreText.text = `SCORE: ${score}`;
            highScoreText.text = `HIGH: ${Math.max(getHighScore(), score)}`;
            rickRolled = true;

            add([
                text("🎉 92,000 REACHED! RICK ROLL TIME! 🎉", { font: "Darumadrop One", size: 48 }),
                pos(center().x, center().y - 80),
                anchor("center"),
                color(255, 220, 60),
                z(100),
            ]);

            wait(0.5, () => {
                openRickRoll();
            });
        }
    }

    onUpdate(() => {
        if (!transitioning && !rickRolled) {
            scoreTimer += dt();
            if (scoreTimer >= 1.0) {
                scoreTimer -= 1.0;
                score += 100;
                scoreText.text = `SCORE: ${score}`;
                highScoreText.text = `HIGH: ${Math.max(getHighScore(), score)}`;
                checkRickRoll();
            }
        }
    });

    add([
        rect(width(), 48),
        pos(0, height() - 48),
        outline(1),
        area(),
        body({ isStatic: true }),
        color(255, 117, 0),
        z(5),
    ]);

    const startY = fromSpace ? 50 : height() - 48;
    const player = add([
        sprite("daven"),
        pos(200, startY),
        anchor("botleft"),
        area(),
        body(),
        z(20),
    ]);

    setGravity(1600);

    if (fromSpace) {
        const welcomeBanner = add([
            text("BACK ON EARTH!", { font: "Darumadrop One", size: 48 }),
            pos(center().x, 100),
            anchor("center"),
            color(255, 200, 50),
            z(50),
        ]);
        wait(2, () => destroy(welcomeBanner));
    }

    onKeyPress("space", () => {
        player.jump();
        play("space");
    });

    player.onCollide("hurdle", (hurdle) => {
        if (transitioning) return;
        addKaboom(hurdle.pos);
        shake();
        play("boom");
        destroy(hurdle);
        go("lose", { score });
    });

    player.onCollide("spring", (spring) => {
        if (transitioning) return;
        transitioning = true;

        play("boing");
        shake(10);

        spring.scale = vec2(0.38, 0.15);
        wait(0.08, () => {
            spring.scale = vec2(0.32, 0.35);
        });

        player.jump(1400);

        wait(0.45, () => {
            go("space", { score, rickRolled });
        });
    });

    function spawnObstacle() {
        if (transitioning) return;

        const elapsed = time() - gameStartTime;
        const allowSpring = elapsed >= 6;
        const isSpring = allowSpring && choose([true, false, false]);

        if (isSpring) {
            add([
                sprite("spring"),
                scale(0.32),
                area(),
                body({ isStatic: true }),
                pos(width(), height() - 48),
                anchor("botleft"),
                move(LEFT, 480),
                offscreen({ destroy: true }),
                z(10),
                "spring",
            ]);
        } else {
            add([
                rect(72, rand(35, 115)),
                area(),
                body({ isStatic: true }),
                outline(4),
                pos(width(), height() - 48),
                anchor("botleft"),
                color(0, 0, 0),
                move(LEFT, 480),
                offscreen({ destroy: true }),
                z(10),
                "hurdle",
            ]);
        }

        wait(rand(1.1, 2.3), () => {
            if (!transitioning) {
                spawnObstacle();
            }
        });
    }

    spawnObstacle();
});

scene("space", ({ score: initialScore = 0, rickRolled: initialRickRolled = false } = {}) => {
    startBtn.style.display = "none";
    restartBtn.style.display = "none";

    setupBg("spaceBg");

    let score = initialScore;
    let rickRolled = initialRickRolled;
    let scoreTimer = 0;
    let spaceSpringHits = 0;
    let portalOpen = false;
    let transitioning = false;

    setGravity(750);

    const scoreText = add([
        text(`SCORE: ${score}`, { font: "Darumadrop One", size: 36 }),
        pos(24, 24),
        color(255, 255, 255),
        z(50),
    ]);

    const highScoreText = add([
        text(`HIGH: ${Math.max(getHighScore(), score)}`, { font: "Darumadrop One", size: 32 }),
        pos(width() - 24, 24),
        anchor("topright"),
        color(255, 220, 80),
        z(50),
    ]);

    function checkRickRoll() {
        if (!rickRolled && score >= 92000) {
            score = 92000;
            scoreText.text = `SCORE: ${score}`;
            highScoreText.text = `HIGH: ${Math.max(getHighScore(), score)}`;
            rickRolled = true;

            add([
                text("🎉 92,000 REACHED! RICK ROLL TIME! 🎉", { font: "Darumadrop One", size: 48 }),
                pos(center().x, center().y - 80),
                anchor("center"),
                color(255, 220, 60),
                z(100),
            ]);

            wait(0.5, () => {
                openRickRoll();
            });
        }
    }

    onUpdate(() => {
        if (!transitioning && !rickRolled) {
            scoreTimer += dt();
            if (scoreTimer >= 1.0) {
                scoreTimer -= 1.0;
                score += 100;
                scoreText.text = `SCORE: ${score}`;
                highScoreText.text = `HIGH: ${Math.max(getHighScore(), score)}`;
                checkRickRoll();
            }
        }
    });

    add([
        rect(width(), 48),
        pos(0, height() - 48),
        outline(2, rgb(130, 200, 255)),
        area(),
        body({ isStatic: true }),
        color(20, 15, 45),
        z(5),
    ]);

    const player = add([
        sprite("daven"),
        pos(200, height() - 48),
        anchor("botleft"),
        area(),
        body(),
        z(25),
    ]);

    player.jump(900);

    const MOVE_SPEED = 400;
    onKeyDown("left", () => {
        player.move(-MOVE_SPEED, 0);
    });
    onKeyDown("right", () => {
        player.move(MOVE_SPEED, 0);
    });

    onKeyPress(["space", "up"], () => {
        if (player.isGrounded()) {
            player.jump(750);
            play("space");
        }
    });

    player.onUpdate(() => {
        if (player.pos.y < 50) {
            player.pos.y = 50;
            if (player.vel.y < 0) player.vel.y = 0;
        }
        if (player.pos.x < 30) player.pos.x = 30;
        if (player.pos.x > width() - 30) player.pos.x = width() - 30;
        if (player.pos.y > height() + 100) {
            go("lose", { score });
        }
    });

    player.onCollide("hurdle", (hurdle) => {
        if (transitioning) return;
        addKaboom(hurdle.pos);
        shake();
        play("boom");
        destroy(hurdle);
        go("lose", { score });
    });

    player.onCollide("spring", (spring) => {
        play("springSound");
        shake(8);
        player.vel.y = -950;

        spring.scale = vec2(0.38, 0.15);
        wait(0.08, () => {
            spring.scale = vec2(0.32, 0.35);
        });

        if (spaceSpringHits < 3) {
            spaceSpringHits++;
            if (spaceSpringHits === 3 && !portalOpen) {
                portalOpen = true;
                spawnPortal();
            }
        }
    });

    function spawnPortal() {
        play("space");
        shake(10);

        add([
            text("USE RIGHT ARROW [ -> ] & JUMP TO ENTER THE PORTAL!", { font: "Darumadrop One", size: 34 }),
            pos(center().x, 80),
            anchor("center"),
            color(100, 255, 180),
            z(50),
        ]);

        const portal = add([
            sprite("portal"),
            pos(width() - 120, center().y),
            anchor("center"),
            scale(0.38),
            area(),
            body({ isStatic: true }),
            z(30),
            "portal",
        ]);

        portal.add([
            text("ENTER HERE 🌀", { font: "Darumadrop One", size: 22 }),
            pos(0, -70),
            anchor("center"),
            color(255, 255, 255),
        ]);

        portal.onUpdate(() => {
            portal.scale = vec2(0.38 + Math.sin(time() * 6) * 0.03);
        });
    }

    player.onCollide("portal", (portal) => {
        if (transitioning) return;
        transitioning = true;

        play("boing");
        shake(15);
        addKaboom(portal.pos);

        wait(0.35, () => {
            go("game", { score, fromSpace: true, rickRolled });
        });
    });

    function spawnSpaceObstacle() {
        if (transitioning) return;

        const isSpring = choose([true, true, false]);

        if (isSpring) {
            add([
                sprite("spring"),
                scale(0.32),
                area(),
                body({ isStatic: true }),
                pos(width(), height() - 48),
                anchor("botleft"),
                move(LEFT, 480),
                offscreen({ destroy: true }),
                z(10),
                "spring",
            ]);
        } else {
            add([
                rect(60, rand(30, 95)),
                area(),
                body({ isStatic: true }),
                outline(3, rgb(200, 120, 255)),
                pos(width(), height() - 48),
                anchor("botleft"),
                color(45, 25, 75),
                move(LEFT, 480),
                offscreen({ destroy: true }),
                z(10),
                "hurdle",
            ]);
        }

        wait(rand(1.2, 2.4), () => {
            if (!transitioning) {
                spawnSpaceObstacle();
            }
        });
    }

    spawnSpaceObstacle();
});

go("welcome");
