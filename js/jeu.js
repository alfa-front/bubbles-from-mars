/*The Attack of the Bubbles from Mars - 11/2016
https://alfa-front.com
*/

bubblesFromMars = (function () {
    window.addEventListener('load', charger, false);
    let mousex = 0;
    let mousey = 0;
    let joueur = new Bubble(300, 80, 10);
    let jeuVideo = {
        lastUpdate: 0,
        gameOver: true,
        pause: true,
        points: 0,
        detonant: 0,
        bombes: []
    };
    let record = [0];
    //let bombesLength = jeuVideo.bombes.length;

    let soundMars = new Audio("sounds/stage.mp3");
    let soundExplo = new Audio("sounds/blop.mp3");
    let soundGameOver = new Audio("sounds/boom.mp3");
    let soundWin = new Audio("sounds/clink.mp3");
    let soundLife = new Audio("https://ia800502.us.archive.org/17/items/LifeOnMars_934/31LifeOnMars.mp3");


    function charger() {
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 500;
        souris();
        demarrer();
    }

    function demarrer() {
        requestAnimationFrame(demarrer);
        let randomTimer = (random(5) * (0.0190 - 0.0160) + 0.0160);
        moteur(randomTimer);
        colorier(ctx);
    }

    function moteur(randomTimer) {
        if (jeuVideo.gameOver == false) {

            soundMars.play(); // Musique du jeu

            // Déplacement du Joueur
            joueur.x = mousex;
            joueur.y = mousey;

            // Tenir joueur dans le canvas
            if (joueur.x < 0) {
                joueur.x = 0;
            }
            if (joueur.x > canvas.width) {
                joueur.x = canvas.width;
            }
            if (joueur.y < 0) {
                joueur.y = 0;
            }
            if (joueur.y > canvas.height) {
                joueur.y = canvas.height;
            }

            // Creer une nouvelle bulle
            jeuVideo.detonant -= randomTimer;
            if (jeuVideo.detonant < 0) {
                let ennemi = new Bubble(random(1) * canvas.width, random(1) * canvas.height, 20);
                ennemi.detonant = 1 + random(0.5); //Pour faire exploser les bulles
                ennemi.vitesse = 200 + (random(jeuVideo.points)) * 5; // Vitesse des bulles
                jeuVideo.bombes.push(ennemi);
                jeuVideo.detonant = 0.1 + random(0.8); //Pour faire apparaitre les bulles
            }

            // Fonctionnement des bombes
            let l = jeuVideo.bombes.length;

            for (let i = 0; i < l; i++) {
                if (jeuVideo.bombes[i].detonant < 0) {
                    soundExplo.play();
                    jeuVideo.points++;
                    jeuVideo.bombes.splice(i--, 1);
                    l--;
                }
                // "AI" des ennemis
                jeuVideo.bombes[i].detonant -= randomTimer;
                let angle = jeuVideo.bombes[i].donnerAngle(joueur);
                jeuVideo.bombes[i].trajectoire(angle, jeuVideo.bombes[i].vitesse * randomTimer);

                // Collision et game over
                if (jeuVideo.bombes[i].detonant < 0) {
                    jeuVideo.bombes[i].radius *= 4;
                    if (jeuVideo.bombes[i].distance(joueur) < 0) {
                        record.push(jeuVideo.points);
                        soundGameOver.play();
                        jeuVideo.gameOver = true; // :(
                    }
                }
            }
        }
    }

    function colorier(ctx) {
        let background = new Image();
        background.src = "images/mars.jpg";

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Inserer le background

        // Styler le joueur et les ennemis
        l = jeuVideo.bombes.length;

        for (let i = 0; i < l; i++) {
            if (jeuVideo.bombes[i].detonant < 0) {
                ctx.fillStyle = '#fbfd69';
                jeuVideo.bombes[i].fill(ctx);
            } else {
                if (jeuVideo.bombes[i].detonant < 1 && Math.floor(jeuVideo.bombes[i].detonant * 10) % 2 == 0) {
                    ctx.fillStyle = '#ff3333';
                    jeuVideo.bombes[i].fill(ctx);
                    ctx.strokeStyle = '#fbfd69';
                    ctx.lineWidth = 3;
                    jeuVideo.bombes[i].stroke(ctx);
                } else {
                    ctx.strokeStyle = '#ffffcc';
                    ctx.lineWidth = 3;
                    jeuVideo.bombes[i].stroke(ctx);
                }
            }
        }

        // Top Score
        let max = record[0];
        for (let r = 1; r < record.length; r++) {
            if (record[r] > max) {
                max = record[r];
            }
        }


        // Bulle joueur
        ctx.fillStyle = '#128F76';
        joueur.fill(ctx);

        // Textes du jeu
        ctx.fillStyle = 'white';
        ctx.textAlign = ' left';
        ctx.font = "15px Lato";
        ctx.fillText('Points: ' + jeuVideo.points, 60, 20);
        ctx.fillText('Top Score: ' + max, 520, 20);


        if (jeuVideo.gameOver) {
            soundMars.pause();
            soundMars.currentTime = 0;
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', 300, 230);
            ctx.textAlign = 'center';
            ctx.fillText('CLICK POUR COMMENCER', 300, 250);

            if (jeuVideo.points >= 200) {
                soundLife.play();
                ctx.textAlign = 'left';
                ctx.fillText("☆ CONGRATULATIONS, NOW YOU'RE A REAL HERO ! ☆", 210, 490);
                ctx.textAlign = 'left';
                ctx.fillText("THE END", 20, 490);
            }
        }
    }

    function souris() {
        document.addEventListener('mousemove', function (evt) {
            mousex = evt.pageX - canvas.offsetLeft;
            mousey = evt.pageY - canvas.offsetTop;
        }, false);

        // Reinicier le jeu avec un click
        canvas.addEventListener('mousedown', function (evt) {
            if (jeuVideo.gameOver == true) {
                jeuVideo.gameOver = false;
                jeuVideo.points = 0;
                jeuVideo.detonant = 0;
                soundLife.pause();
                soundLife.currentTime = 0;
                jeuVideo.bombes.length = 0;
            }
        }, false);
    }

    // Constructeur 
    function Bubble(x, y, radius) {
        this.x = (x == null) ? 0 : x;
        this.y = (y == null) ? 0 : y;
        this.radius = (radius == null) ? 0 : radius;
        this.vitesse = 0;

        this.distance = function (cercle) {
            if (cercle != null) {
                let distanceX = this.x - cercle.x;
                let distanceY = this.y - cercle.y;
                return (Math.sqrt(distanceX * distanceX + distanceY * distanceY) - (this.radius + cercle.radius));
            }
        }

        this.donnerAngle = function (cercle) {
            if (cercle)
                return (Math.atan2(cercle.y - this.y, cercle.x - this.x));
        }

        this.trajectoire = function (angle, vitesse) {
            if (vitesse) {
                this.x += Math.cos(angle) * vitesse;
                this.y += Math.sin(angle) * vitesse;
            }
        }

        this.stroke = function (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            ctx.stroke();
        }

        this.fill = function (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            ctx.fill();
        }
    }

    function random(max) {
        return (Math.random() * max);
    }
});

bubblesFromMars();