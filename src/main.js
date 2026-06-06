const {invoke, convertFileSrc} = window.__TAURI__.core;

(function () {

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    class Location {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Pipe {
        constructor(x, gapY) {
            this.x = x;
            this.gapY = gapY;
        }
    }

    let bird;
    let pipes = [];
    let score = 0;
    let isGameOver = false;

    let pipeTimer = 0;
    const pipeSpawnInterval = 90;

    let birdSize;
    let pipeWidth;
    let pipeGap;
    let groundHeight;

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function resizeCanvas() {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        birdSize = Math.max(40, canvas.width * 0.04);

        pipeWidth = Math.max(70, canvas.width * 0.08);

        pipeGap = Math.max(180, canvas.height * 0.28);

        groundHeight = canvas.height * 0.1;
    }

    function createPipe() {

        const minGapY = canvas.height * 0.2;
        const maxGapY = canvas.height * 0.7;

        pipes.push(
            new Pipe(
                canvas.width,
                randomInt(minGapY, maxGapY)
            )
        );
    }

    function drawBackground() {

        const skyGradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height
            );

        skyGradient.addColorStop(0, "#87CEEB");
        skyGradient.addColorStop(1, "#4DA6FF");

        ctx.fillStyle = skyGradient;
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.8)";

        const cloudScale =
            Math.max(
                0.7,
                canvas.width / 1200
            );

        drawCloud(
            150 * cloudScale,
            100 * cloudScale,
            cloudScale
        );

        drawCloud(
            canvas.width * 0.75,
            canvas.height * 0.18,
            cloudScale
        );
    }

    function drawCloud(x, y, scale) {

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            40 * scale,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 40 * scale,
            y,
            50 * scale,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 80 * scale,
            y,
            40 * scale,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    function drawGround() {

        const groundY =
            canvas.height - groundHeight;

        ctx.fillStyle = "#6ab04c";

        ctx.fillRect(
            0,
            groundY,
            canvas.width,
            groundHeight
        );

        ctx.fillStyle = "#9B7653";

        ctx.fillRect(
            0,
            groundY + 20,
            canvas.width,
            groundHeight
        );
    }

    function drawBird() {

        ctx.fillStyle = "#FFD93D";

        ctx.beginPath();

        ctx.arc(
            bird.x + birdSize / 2,
            bird.y + birdSize / 2,
            birdSize / 2,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#FFC300";

        ctx.beginPath();

        ctx.arc(
            bird.x + birdSize * 0.4,
            bird.y + birdSize * 0.6,
            birdSize * 0.25,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            bird.x + birdSize * 0.7,
            bird.y + birdSize * 0.35,
            birdSize * 0.12,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "black";

        ctx.beginPath();

        ctx.arc(
            bird.x + birdSize * 0.75,
            bird.y + birdSize * 0.35,
            birdSize * 0.06,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "orange";

        ctx.beginPath();

        ctx.moveTo(
            bird.x + birdSize,
            bird.y + birdSize * 0.5
        );

        ctx.lineTo(
            bird.x + birdSize * 1.25,
            bird.y + birdSize * 0.4
        );

        ctx.lineTo(
            bird.x + birdSize,
            bird.y + birdSize * 0.3
        );

        ctx.closePath();
        ctx.fill();
    }

    function drawPipes() {

        for (const pipe of pipes) {

            const topHeight =
                pipe.gapY - pipeGap / 2;

            const bottomY =
                pipe.gapY + pipeGap / 2;

            ctx.fillStyle = "#2ECC71";

            ctx.fillRect(
                pipe.x,
                0,
                pipeWidth,
                topHeight
            );

            ctx.fillRect(
                pipe.x,
                bottomY,
                pipeWidth,
                canvas.height
            );

            ctx.fillStyle = "#58D68D";

            ctx.fillRect(
                pipe.x - 10,
                topHeight - 20,
                pipeWidth + 20,
                20
            );

            ctx.fillRect(
                pipe.x - 10,
                bottomY,
                pipeWidth + 20,
                20
            );
        }
    }

    function drawScore() {

        const fontSize =
            Math.max(28, canvas.width * 0.03);

        ctx.font =
            `bold ${fontSize}px Arial`;

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";

        ctx.lineWidth = 4;

        const text =
            Math.floor(score / 10);

        ctx.strokeText(
            text,
            canvas.width - fontSize * 2,
            fontSize + 10
        );

        ctx.fillText(
            text,
            canvas.width - fontSize * 2,
            fontSize + 10
        );
    }

    function drawGameOver() {

        ctx.fillStyle =
            "rgba(0,0,0,0.85)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "white";

        ctx.textAlign = "center";

        ctx.font =
            `bold ${canvas.width * 0.07}px Arial`;

        ctx.fillText(
            "Game Over",
            canvas.width / 2,
            canvas.height / 2 - 80
        );

        ctx.font =
            `bold ${canvas.width * 0.03}px Arial`;

        ctx.fillText(
            "Tap or Press R",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.fillText(
            `Score: ${Math.floor(score / 10)}`,
            canvas.width / 2,
            canvas.height / 2 + 70
        );
    }

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawBackground();
        drawPipes();
        drawGround();
        drawBird();
        drawScore();

        if (isGameOver) {
            drawGameOver();
        }
    }

    function update() {

        if (isGameOver) return;

        bird.y += canvas.height * 0.004;

        pipeTimer++;

        if (pipeTimer >= pipeSpawnInterval) {
            createPipe();
            pipeTimer = 0;
        }

        for (let i = 0; i < pipes.length; i++) {

            pipes[i].x -= canvas.width * 0.006;

            if (
                pipes[i].x + pipeWidth < 0
            ) {
                pipes.splice(i, 1);
                i--;
            }
        }

        if (
            bird.y + birdSize >=
            canvas.height - groundHeight
        ) {
            isGameOver = true;
        }

        for (const pipe of pipes) {

            const topHeight =
                pipe.gapY - pipeGap / 2;

            const bottomY =
                pipe.gapY + pipeGap / 2;

            const overlapX =
                bird.x + birdSize > pipe.x &&
                bird.x < pipe.x + pipeWidth;

            const hitTop =
                bird.y < topHeight;

            const hitBottom =
                bird.y + birdSize > bottomY;

            if (
                overlapX &&
                (hitTop || hitBottom)
            ) {
                isGameOver = true;
            }
        }

        score++;
    }

    function jump() {

        if (isGameOver) return;

        bird.y -= canvas.height * 0.08;
    }

    function restart() {

        score = 0;

        pipes = [];

        pipeTimer = 0;

        isGameOver = false;

        bird = new Location(
            canvas.width * 0.15,
            canvas.height * 0.4
        );
    }

    function gameLoop() {

        update();
        draw();

        requestAnimationFrame(
            gameLoop
        );
    }

    function bindControls() {

        window.addEventListener(
            "keydown",
            (e) => {

                if (
                    e.key === " " ||
                    e.key === "ArrowUp"
                ) {
                    e.preventDefault();
                    jump();
                }

                if (
                    e.key === "r" ||
                    e.key === "R"
                ) {
                    restart();
                }
            }
        );

        window.addEventListener(
            "touchstart",
            (e) => {

                e.preventDefault();

                if (isGameOver) {
                    restart();
                } else {
                    jump();
                }
            },
            { passive: false }
        );
    }

    function init() {

        resizeCanvas();

        restart();

        bindControls();

        window.addEventListener(
            "resize",
            resizeCanvas
        );

        gameLoop();
    }

    init();

})();