let theGame = JSON.parse(localStorage.getItem('theGame'));
let gamesInfo = JSON.parse(localStorage.getItem('gamesInfo'));
let allPlayers = JSON.parse(localStorage.getItem('allPlayers'));
let players = theGame.players;
let systems = theGame.systems;

let games = gamesInfo.map(g => g.game);
let gamesLeft = gamesInfo;
let gameNumber = 1;

let systemOp = JSON.parse(localStorage.getItem('pointsSystem'));
let pointsSystem = systems.points == "Points & Shots" ? systemOp.pointsShots[players.length - 2] :
                    systems.points == "Just Points" ? systemOp.points[players.length - 2] : [];
let gameSelection = systems.games;

let welcome = document.getElementById('welcome');
let gameTitle = document.getElementById('title');
let breakShot = document.getElementById('break');
let victoryShot = document.getElementById('victory');
let wheelShot = document.getElementById('wheelShot');
let askNeigh = document.getElementById('askNeigh');
let wheel = document.getElementById('game_wheel');
let playerWheel = document.getElementById('player_wheel');
let choose = document.getElementById('choosing_game');
let vote = document.getElementById('voting_game');

let currGame = {};
let shot = false;
let player = false;

let gold = 'linear-gradient(to right, rgb(191, 149, 63), rgb(252, 246, 186), rgb(179, 135, 40), rgb(251, 245, 183), rgb(170, 119, 28))';
let silver = 'linear-gradient(45deg, rgb(153, 153, 153) 5%, rgb(255, 255, 255) 10%, rgb(204, 204, 204) 30%, rgb(221, 221, 221) 50%, rgb(204, 204, 204) 70%, rgb(255, 255, 255) 80%, rgb(153, 153, 153) 95%)';
let bronze = 'linear-gradient(to right, rgb(205, 127, 50), rgb(229, 180, 126), rgb(168, 109, 40), rgb(217, 160, 103), rgb(139, 78, 19))';
let blue = 'linear-gradient(45deg, rgb(180, 216, 255) 5%, rgb(224, 244, 255) 15%, rgb(160, 198, 230) 35%, rgb(204, 232, 255) 50%, rgb(160, 198, 230) 70%, rgb(224, 244, 255) 85%, rgb(180, 216, 255) 95%)';

function header(type, text) {
    let element = document.createElement(type);
    element.innerHTML = text;
    return element;
}

function placeColour(place) {
    if (place == 1) return gold;
    if (place == 2) return silver;
    if (place == 3) return bronze;
    if (place > 3) return blue;
}

const createOption = (value, placeholder) => {
    let option = document.createElement('option');
    if (value == "") {
        option.value = "";
        option.disabled = true;
        option.selected = true;
        option.innerHTML = `${placeholder}`;
    } else {
        option.value = `${value}`;
        option.innerHTML = `${value}`;
    }
    return option;
};

const createNumInput = (tag, max, placeholder) => {
    let questionDiv = document.createElement('div');
    questionDiv.id = `${currGame.tag}_${tag.toLowerCase()}`;
    let input = document.createElement('input');
    input.type = "number";
    input.className = "num_box";
    input.id = `${currGame.tag}_${tag.toLowerCase()}Num`;
    input.max = max;
    input.placeholder = placeholder;
    questionDiv.appendChild(input);
    questionDiv.style.display = 'none';
    return questionDiv;
};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function addSpecialityTitle() {
    const specialityPlayers = players.filter(p => {
        return p.speciality.size != 0 && p.speciality.includes(currGame.game);
    }).map(p => p.name).sort((a, b) => !a.localeCompare(b));

    if (specialityPlayers.length != 0) {
        const title = document.getElementById('specialityTitle');
        let text = "";
        let size = specialityPlayers.length;
        specialityPlayers.forEach((p, i) => {
            if (i == size - 1) {
                if (size != 1) text += " and ";
            } else if (i != 0) {
                text += ", ";
            }
            text += p;
        });
        text += `'s Speciality Game`;
        title.innerHTML = text;
        title.style.display = 'flex';
    }
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    The Wheel
//


const colour = (index) => {
    return index % 6 == 0 ? "#FF0000" : index % 6 == 1 ? "#FF7F00" :
           index % 6 == 2 ? "#FFFF00" : index % 6 == 3 ? "#00FF00" :
           index % 6 == 4 ? "#0000FF" : "#9400D3";
};
let sectors = games.map((game, index) => ({ colour: colour(index), label: game }));
sectors.push({ colour: colour(games.length), label: "SHOT" });

let rand = (m, M) => Math.random() * (M - m) + m;
let l = sectors.length;
let tot = l - 0.75;
let spinEl = document.querySelector("#spin");
let ctx = document.querySelector("#wheel").getContext("2d");
let dia = 400; 
let rad = dia / 2;
let PI = Math.PI;
let TAU = 2 * PI;
let arc = TAU / tot;
let smallerArc = arc / 4;

let friction = 0.982; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0;
let ang = 0;

let noSpin = true;
let spinButtonClicked = false;

let getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

const events = {
    listeners: {},
    addListener: function (eventName, fn) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName].push(fn);
    },
    fire: function (eventName, ...args) {
        if (this.listeners[eventName]) {
            for (let fn of this.listeners[eventName]) {
                fn(...args);
            }
        }
    },
};
  
function openWheel() {
    wheel.style.display = 'flex';
    sectors.forEach(drawSector);
    rotateWheel(); // Initial rotation
    wheelEngine(); // Start engine
    spinEl.addEventListener("click", () => {
        if (!spinButtonClicked) noSpin = false;
        if (!angVel) angVel = rand(0.35, 0.55);
        spinButtonClicked = true;
    });
}

function resetWheel() {
    rand = (m, M) => Math.random() * (M - m) + m;
    l = sectors.length;
    if (shot) tot = l - 1.75;
    if (player) tot = l;
    if (!shot && !player) tot = l - 0.75;
    spinEl = !shot ? document.getElementById('spin') :
                     document.getElementById('spin2');
    ctx = !shot ? document.getElementById('wheel').getContext("2d") :
                  document.getElementById('wheel2').getContext("2d");
    dia = 400; 
    rad = dia / 2;
    PI = Math.PI;
    TAU = 2 * PI;
    arc = TAU / tot;
    smallerArc = arc / 4;
    friction = 0.982; // 0.995=soft, 0.99=mid, 0.98=hard
    angVel = 0;
    ang = 0;
    noSpin = true;
    spinButtonClicked = false;
    getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;
}

function drawSector(sector, i) {
    let sectorArc = arc;
    if (shot) {
        sectorArc = sector.label == "EVERYONE" || sector.label == "NO ONE" ? smallerArc : arc;
    } else if (player) {
        sectorArc = arc;
    } else {
        sectorArc = sector.label == "SHOT" ? smallerArc : arc;
    }
    const ang = arc * i;
    ctx.save();
  
    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.colour;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + sectorArc);
    ctx.lineTo(rad, rad);
    ctx.fill();
  
    // TEXT
    ctx.translate(rad, rad);
    ctx.rotate(ang + sectorArc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000000";
    ctx.font = "bold 15px 'Lato', sans-serif";
    ctx.fillText(sector.label, rad - 10, 10);
  
    ctx.restore();
}
  
function rotateWheel() {
    const sector = sectors[getIndex()];
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  
    spinEl.textContent = "SPIN";
    spinEl.style.background = sector.colour;
    spinEl.style.colour = "#000000";
}
  
function wheelEngine() {
    // Fire an event after the wheel has stopped spinning
    if (!angVel && spinButtonClicked) {
        const finalSector = sectors[getIndex()];
        events.fire("spinEnd", finalSector);
        spinButtonClicked = false; // reset the flag
        return;
    }
  
    angVel *= friction; // Decrement velocity by friction
    if (angVel < 0.002) angVel = 0; // Bring to stop
    ang += angVel; // Update angle
    ang %= TAU; // Normalize angle
    rotateWheel();
    requestAnimationFrame(wheelEngine);
}

function completeShotWheel() {
    shot = false;
    wheelShot.style.display = 'none';
    playerWheel.style.display = 'none';
    document.getElementById('wheelShotResult').style.display = 'none';

    gameTitle.style.display = 'block';
    if (gameSelection == "Wheel") replaceSectors("games", shuffle(games));
    if (gameSelection == "Vote") openVote();
}

function replaceSectors(type, options) {
    console.log(type);
    console.log(options);
    if (type == "games" || type == "voting") {
        sectors = options.map((g, i) => ({ colour: colour(i), label: g }));
        sectors.push({ colour: colour(options.length), label: "SHOT" });
    } else if (type == "shot") {
        sectors = options.map((p, i) => ({ colour: colour(i), label: p.name }));
        sectors.push({ shuffled: colour(options.length), label: "EVERYONE" });
        sectors.push({ shuffled: colour(options.length + 1), label: "NO ONE" });
    } else if (type == "players") {
        sectors = options.map((p, i) => ({ colour: colour(i), label: p.name }));
    }
    resetWheel();
    openWheel();
}

events.addListener("spinEnd", (sector) => {
    welcome.style.display = 'none';
    
    if (shot) {
        const ratatouille = document.getElementById('ratatouille');

        if (sector.label == "EVERYONE") {
            ratatouille.innerHTML = "Ratatouille Everyone!";
            players.forEach(p => { logShot(p.name, "wheel") });
        } else if (sector.label == "NO ONE") {
            ratatouille.innerHTML = "No one is having a shot lol";
        } else {
            ratatouille.innerHTML = `Ratatouille ${sector.label}!`;
            let player = players.find(p => { return p.name == sector.label });
            if (player) logShot(player.name, "wheel");
        }

        document.getElementById('wheelTitle').style.display = 'none';
        document.getElementById('wheelComplete').style.display = 'flex';
        document.getElementById('wheelShotResult').style.display = 'flex';
    } else if (player) {
        console.log(sector);
        console.log(players);

        wheel.style.display = 'none';
        startGame();
    } else {
        currGame = gamesInfo.find(g => g.game == sector.label);
        gamesLeft = gamesLeft.filter(g => g.game != sector.label);
        if (sector.label == "SHOT") {
            shot = true;
            replaceSectors("shot", shuffle(games));
            wheelShot.style.display = 'flex';
            playerWheel.style.display = 'flex';
        } else {
            gameTitle.innerHTML = `Game ${gameNumber} - ${sector.label}`;
            gameTitle.style.display = 'block';
            askNeigh.style.display = `flex`;
        }
        wheel.style.display = 'none';
    }
    addSpecialityTitle();
});


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Choosing
//


function openChoosing() {
    const choosingDiv = document.createElement('div');
    choosingDiv.id = 'choosing';

    gamesLeft.sort((a, b) => a.game.localeCompare(b.game));
    gamesLeft.forEach(curr => {
        const game = curr.game;//gamesInfo.find(g => g.game == game);
        const box = document.createElement('div');
        box.className = 'gameBox';
        box.id = curr ? `${curr.tag}_box` : "";
        
        box.appendChild(header('h3', game));
        box.addEventListener("click", () => {
            welcome.style.display = 'none';
            gameTitle.innerHTML = `Game ${gameNumber} - ${game}`;
            currGame = curr;
            gamesLeft = gamesLeft.filter(g => g.game != curr.game);
            addSpecialityTitle();
            toPlayOrNotToPlay(1);
            gameTitle.style.display = 'block';
            choose.style.display = 'none';
        });

        choosingDiv.appendChild(box);
    });

    choose.appendChild(choosingDiv);
    choose.style.display = 'flex';
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Voting
//

let currVotes = [];

function openVote() {
    const votingDiv = document.getElementById('voting');
    votingDiv.innerHTML = '';

    theGame.players.filter(p => !theGame.abandoned.includes(p.name)).forEach(player => {
        const box = document.createElement('div');
        box.className = 'playerBox';
        box.id = `${player.name}_vote`;

        box.appendChild(header('h3', player.name));
        
        const select = document.createElement('select');
        select.className = 'votingSelect';

        select.appendChild(createOption("", "Pick a game..."));
        select.appendChild(createOption("RANDOM", ""));
        gamesLeft.sort((a, b) => {
            return a.game.localeCompare(b.game);
        }).forEach(g => select.appendChild(createOption(g.game, "")));

        select.addEventListener("change", () => {
            let curr = currVotes.find(v => v.name == player.name);
            if (curr) {
                curr.vote = select.value;
            } else {
                currVotes.push({ name: player.name, vote: select.value });
            }
            if (currVotes.length == players.length) document.getElementById('vote').style.display = 'flex';
        });
        box.appendChild(select);

        votingDiv.appendChild(box);
    });
    vote.style.display = 'flex';
}

function submitVotes() {
    vote.style.display = 'none';
    Array.from(document.getElementById('voting').children).forEach(v => {
        v.lastChild.value = "";
    });
    let newGames = [];
    currVotes.forEach(v => {
        if (v.vote == "RANDOM") {
            if (gamesLeft.size == 0) {

            } else {
                v.vote = gamesLeft[Math.floor(Math.random() * gamesLeft.length)].game;
            }
        }
        newGames.push(v.vote);
    });
    replaceSectors("voting", shuffle(newGames));
    currVotes = [];
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                      Coin Flip
//


let coinsClicked = [];

function createCoin(size, results, coins, box, result) {
    let player = document.createElement('div');
    player.id = 'player_coin';
    let playerText = header('h3', result.name);
    playerText.id = 'player_coin_header';
    player.appendChild(playerText);
    
    let coin = document.createElement('div');
    coin.id = 'coin';

    let sideA = document.createElement('div');
    sideA.id = 'side_a';
    let sideAText = document.createElement('h3');
    sideAText.id = "side_a_text";

    let sideB = document.createElement('div');
    sideB.id = 'side_b';
    let sideBText = document.createElement('h3');
    sideBText.id = "side_b_text";
    
    let type = result.reward;
    sideAText.innerHTML = type == "pn" || type == "pc" ? "Point" : type == "nc" ? "Nothing" : "Shot";
    sideBText.innerHTML = type == "pc" || type == "nc" ? "Shot" : type == "pn" ? "Nothing" : "Shot";

    coinsClicked = [];

    coin.addEventListener("click", () => {
        let currCoin = coins.find(c => c.name == result.name);
        if (currCoin.result == "heads" || currCoin.result == "tails") return;
        
        let newResult = Math.random() < 0.5 ? "heads" : "tails";
        coin.classList.remove("heads", "tails");
        void coin.offsetWidth; // Forces reflow to restart the animation
        coin.classList.add(newResult);

        currCoin.result = newResult;
        if (newResult == "heads") {
            result.reward = type == "pn" || type == "pc" ? "1 point" : type == "nc" ? "Nothing" : "1 shot";
        } else if (newResult == "tails") {
            result.reward = type == "pc" || type == "nc" ? "1 shot" : type == "pn" ? "Nothing" : "1 shot";
        } else {
            console.error(`Error with coin flip: ${newResult}`);
        }
        currCoin.reward = result.reward;

        coinsClicked.push(currCoin);
        if (coinsClicked.length == size) {
            coin.addEventListener("animationend", function handleAnimationEnd() {
                coin.removeEventListener("animationend", handleAnimationEnd);
                const coinBox = document.getElementById('coin_box');
                coinBox.innerHTML = '';
                submitResults(results);
            });
        }
    });

    sideA.appendChild(sideAText);
    sideB.appendChild(sideBText);
    coin.appendChild(sideA);
    coin.appendChild(sideB);
    player.appendChild(coin);
    box.style.display = 'flex';
    box.appendChild(player);

    return { name: result.name, result: "" , reward: "" };
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                 Creating the games
//

function createMarioParty() {
    const gameDiv = document.getElementById(`${currGame.tag}_game`);
    const half = Math.ceil(players.length / 2);
    const playersPart1 = players.slice(0, half);
    const playersPart2 = players.slice(half);

    const create = (game, gameDiv, num) => {
        gameDiv.appendChild(document.createElement('br'));
        
        const table = document.createElement('table');
        table.id = `${game}_table`;
    
        const thead = document.createElement('thead');
        const names = document.createElement('tr');
        names.id = `${game}_names${num}`;
        thead.appendChild(names);
        table.appendChild(thead);
    
        const tbody1 = document.createElement('tbody');
        const stars = document.createElement('tr');
        stars.id = `${game}_stars${num}`;
        tbody1.appendChild(stars);
        table.appendChild(tbody1);
        
        const tbody2 = document.createElement('tbody');
        const coins = document.createElement('tr');
        coins.id = `${game}_coins${num}`;
        tbody2.appendChild(coins);
        table.appendChild(tbody2);

        gameDiv.appendChild(table);
        return [names, stars, coins];
    };

    const addPlayerToMPTable = (player, header, stars, coins) => {
        const th = document.createElement("th");
        th.textContent = player.name;
        header.appendChild(th);
    
        const td_s = document.createElement("td");
        td_s.contentEditable = "true";
        td_s.textContent = "0 stars";
        td_s.addEventListener("input", () => { td_s.textContent = `${td_s.textContent.replace(/[^0-9]/g, '')} stars`; });
        stars.appendChild(td_s);
    
        const td_c = document.createElement("td");
        td_c.contentEditable = "true";
        td_c.textContent = "0 coins";
        td_c.addEventListener("input", () => { td_c.textContent = `${td_c.textContent.replace(/[^0-9]/g, '')} coins`; });
        coins.appendChild(td_c);
    }
    
    const [names1, stars1, coins1] = create(currGame.tag, gameDiv, 1);
    const [names2, stars2, coins2] = create(currGame.tag, gameDiv, 2);
    playersPart1.forEach(player => { addPlayerToMPTable(player, names1, stars1, coins1); });
    playersPart2.forEach(player => { addPlayerToMPTable(player, names2, stars2, coins2); });
}

function createBetrayal() {
    const gameDiv = document.getElementById(`${currGame.tag}_game`);

    const betrayalPlayers = document.createElement('div');
    betrayalPlayers.id = 'betrayalPlayers';
    gameDiv.appendChild(betrayalPlayers);

    let traitor = {};
    let playerDivs = [];
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-box';
        playerDiv.textContent = player.name;

        playerDiv.addEventListener('click', () => {
            playerDivs.forEach(div => { div.style.background = '#FFFFFF'; });
            playerDiv.style.background = blue;
            traitor = player;
            updateButtonState();
        });

        playerDivs.push(playerDiv);
        betrayalPlayers.appendChild(playerDiv);
    });

    const nextRoundButton = document.createElement('button');
    nextRoundButton.style.display = 'none';
    nextRoundButton.className = 'button';
    nextRoundButton.textContent = 'Submit Traitor';
    nextRoundButton.disabled = true;

    nextRoundButton.addEventListener('click', () => {
        const header = document.getElementById('betrayal_header');
        header.innerHTML = `Don't die (or maybe do if you need to)<br><br>Who wins?`;
        
        while (betrayalPlayers.firstChild) {
            betrayalPlayers.removeChild(betrayalPlayers.lastChild);
        }
        nextRoundButton.style.display = 'none';

        const player1Div = document.createElement('div');
        player1Div.className = 'player-box-2';
        player1Div.id = 'betrayal_traitor';
        player1Div.textContent = traitor.name;
        player1Div.style.background = blue;

        const vsDiv = document.createElement('div');
        vsDiv.className = 'versus';
        vsDiv.textContent = 'vs';

        const player2Div = document.createElement('div');
        player2Div.id = 'betrayal_non_traitors';
        player2Div.background = gold;
        players.filter(p => { return p.name != traitor.name }).forEach(p => {
            const div = document.createElement('div');
            div.className = 'player-box-2';
            div.id = 'betrayal_team';
            div.textContent = p.name;
            div.style.background = blue;

            div.addEventListener("click", () => { selectWinner(false) });

            player2Div.appendChild(div);
        });

        player1Div.addEventListener("click", () => { selectWinner(true) });

        betrayalPlayers.appendChild(player1Div);
        betrayalPlayers.appendChild(vsDiv);
        betrayalPlayers.appendChild(player2Div);
    });

    gameDiv.appendChild(nextRoundButton);

    // Enable button when all winners are selected
    const updateButtonState = () => {
        nextRoundButton.style.display = 'flex';
        nextRoundButton.disabled = false;
    }

    const selectWinner = (traitor) => {
        const team = document.getElementById('betrayal_non_traitors');
        Array.from(team.children).forEach(c => { c.style.background = traitor ? blue : gold; });
        document.getElementById('betrayal_traitor').style.background = traitor ? gold : blue;
        document.getElementById('submit').style.display = 'flex';
    };
}

function createTable() {
    const gameDiv = document.getElementById(`${currGame.tag}_game`);
    const half = Math.ceil(players.length / 2);
    const playersPart1 = players.slice(0, half);
    const playersPart2 = players.slice(half);

    const create = (game, gameDiv, num) => {
        gameDiv.appendChild(document.createElement('br'));
        
        const table = document.createElement('table');
        table.id = `${game}_table`;
    
        const thead = document.createElement('thead');
        const names = document.createElement('tr');
        names.id = `${game}_names${num}`;
        thead.appendChild(names);
        table.appendChild(thead);
    
        const tbody = document.createElement('tbody');
        const points = document.createElement('tr');
        points.id = `${game}_points${num}`;
        tbody.appendChild(points);
        table.appendChild(tbody);
        
        gameDiv.appendChild(table);
        return [names, points];
    };

    const addPlayerToTable = (player, header, points) => {
        const th = document.createElement("th");
        th.textContent = player.name;
        header.appendChild(th);
    
        const td = document.createElement("td");
        td.contentEditable = "true";
        td.textContent = "0";
        td.addEventListener("input", () => { td.textContent = td.textContent.replace(/[^0-9]/g, ''); });
        points.appendChild(td);
    };
    
    const [names1, points1] = create(currGame.tag, gameDiv, 1);
    const [names2, points2] = create(currGame.tag, gameDiv, 2);
    playersPart1.forEach(player => { addPlayerToTable(player, names1, points1); });
    playersPart2.forEach(player => { addPlayerToTable(player, names2, points2); });
};

function createKnockout() {
    const gameDiv = document.getElementById(`${currGame.tag}_game`);

    const knockoutContainer = document.createElement('div');
    knockoutContainer.id = 'knockoutContainer';
    gameDiv.appendChild(knockoutContainer);

    const knockout = document.createElement('div');
    knockout.id = 'knockoutPlayers';
    knockoutContainer.appendChild(knockout);

    const order = document.createElement('div');
    order.id = 'knockoutOrder';
    knockoutContainer.appendChild(order);

    const place = (index) => {
        if (currGame.winner == "first") return index + 1;
        if (currGame.winner == "last") return players.length - index;
        return -1;
    };

    const updateOrderStyles = (orderDiv) => {
        const place = orderDiv.textContent.split(". ")[0];
        if (place == 1) orderDiv.style.background = gold;
        if (place == 2) orderDiv.style.background = silver;
        if (place == 3) orderDiv.style.background = bronze;
        if (place > 3) orderDiv.style.background = blue;
    };

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-box';
        playerDiv.textContent = player.name;

        playerDiv.addEventListener('click', () => {
            if (!playerDiv.classList.contains('selected')) {
                knockout.removeChild(playerDiv);

                playerDiv.classList.add('selected');
                const orderDiv = document.createElement('div');
                orderDiv.className = 'order-box';
                orderDiv.textContent = `${place(order.children.length)}. ${player.name}`;

                orderDiv.addEventListener('click', () => {
                    playerDiv.classList.remove('selected');
                
                    playerDiv.style.backgroundColor = '';
                    playerDiv.style.color = '';
                
                    knockout.appendChild(playerDiv);
                    order.removeChild(orderDiv);
                    
                    const orderArray = Array.from(order.children);
                    if (currGame.winner == "last") orderArray.reverse();
                    orderArray.forEach((child, index) => {
                        const curr = child.textContent.split('. ');
                        console.log(index);
                        console.log(curr);
                        child.textContent = `${place(index)}. ${child.textContent.split('. ')[1]}`;
                        updateOrderStyles(child);
                    });
                });

                if (currGame.winner == "first") order.appendChild(orderDiv);
                if (currGame.winner == "last") order.prepend(orderDiv);

                Array.from(order.children).forEach((child) => {
                    updateOrderStyles(child);
                });
            }
        });

        knockout.appendChild(playerDiv);
    });
}

function createSingle() {
    const gameDiv = document.getElementById(`${currGame.tag}_game`);

    const singleContainer = document.createElement('div');
    singleContainer.id = 'singleContainer';
    gameDiv.appendChild(singleContainer);

    const single = document.createElement('div');
    single.id = 'singlePlayers';
    singleContainer.appendChild(single);

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.id = `${player.name}_single_box`;
        playerDiv.className = 'player-box';
        playerDiv.textContent = player.name;

        playerDiv.addEventListener('click', () => {
            players.forEach(p => {
                const div = document.getElementById(`${p.name}_single_box`);
                div.style.background = p.name != player.name ? gold : blue;
            });
        });

        single.appendChild(playerDiv);
    });
}

let currTournament = [];

function createTournament() {
    const gameDiv = document.getElementById(`${currGame.tag}_game`);
    let { rounds, places } = generateTournamentBrackets();
    const roundContainer = document.createElement('div');
    roundContainer.id = 'roundContainer';
    gameDiv.appendChild(roundContainer);

    let round = 0;

    // Function to render a specific round
    function renderRound(roundIndex) {
        const finalRound = rounds[roundIndex].length == 1;
        roundContainer.innerHTML = ''; // Clear previous round content

        const roundHeader = document.createElement('h3');
        roundHeader.className = 'roundHeader';
        roundHeader.textContent = finalRound ? "Final Round" : `Round ${round + 1}`;
        roundContainer.appendChild(roundHeader);
        
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        roundContainer.appendChild(roundDiv);

        let winners = []; // Store winners for this round

        const findPlayer = (round, player) => {
            if (player == "Bye" || players.find(p => p.name == player)) return player;
            const prev = rounds[round - 1];
            const [_, num, type] = player.split(" ");
            if (type == "winner") return prev[num - 1].winner;
            if (type == "loser") return prev[num - 1].loser;
            console.error(`Error in ${player} with ${type}`);
        };

        rounds[roundIndex].forEach(match => {
            match.player1 = findPlayer(match.round - 1, match.player1);
            match.player2 = findPlayer(match.round - 1, match.player2);
            
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';

            const player1Div = document.createElement('div');
            player1Div.className = 'player-box-2';
            player1Div.textContent = match.player1;
            player1Div.style.background = match.player2 == "Bye" ? gold : blue;

            const vsDiv = document.createElement('div');
            vsDiv.className = 'versus';
            vsDiv.textContent = 'vs';

            const player2Div = document.createElement('div');
            player2Div.className = 'player-box-2';
            player2Div.textContent = match.player2;
            player2Div.style.background = blue;

            // Handle winner selection
            const selectWinner = (winner, loser, winnerDiv, loserDiv) => {
                winnerDiv.style.background = gold; // Highlight winner
                loserDiv.style.background = blue; // Unhighlight loser

                // Update winners array
                match.winner = winner;
                match.loser = loser;
                winners.push({ match, winner });

                if (!finalRound) updateButtonState(); // Enable button if all winners selected
                if (finalRound) {
                    currTournament = [];
                    places = places.forEach((p, index) => {
                        const [round, player] = p.split(" - ");
                        currTournament.push({
                            name: findPlayer(parseInt(round), player),
                            place: index + 1,
                            reward: pointsSystem[index]
                        });
                    });
                   document.getElementById('submit').style.display = 'flex';
                }
            };

            player1Div.addEventListener('click', () => selectWinner(match.player1, match.player2, player1Div, player2Div));
            player2Div.addEventListener('click', () => selectWinner(match.player2, match.player1, player2Div, player1Div));
            if (match.player2 == "Bye") {
                winners.push({ match, winner: match.player1 });
                player1Div.textContent = `${match.player1}`;
                match.winner = match.player1;
                match.loser = "";
            }

            matchDiv.appendChild(player1Div);
            if (match.player2 != "Bye") matchDiv.appendChild(vsDiv);
            if (match.player2 != "Bye") matchDiv.appendChild(player2Div);
            roundDiv.appendChild(matchDiv);
        });

        // Handle the next round button
        if (roundIndex < rounds.length - 1) {
            const nextRoundButton = document.createElement('button');
            nextRoundButton.style.display = 'none';
            nextRoundButton.className = 'button';
            nextRoundButton.textContent = 'Next Round';
            nextRoundButton.disabled = true;

            nextRoundButton.addEventListener('click', () => {
                winners.forEach(w => {
                    let newRound = [];
                    rounds[roundIndex + 1].forEach(r => {
                        if (r[0] === "") r[0] = w.winner;
                        else if (r[1] === "") r[1] = w.winner;
                        newRound.push(r);
                    });
                });

                round++;
                renderRound(round);
            });

            roundContainer.appendChild(nextRoundButton);

            // Enable button when all winners are selected
            function updateButtonState() {
                if (winners.length === rounds[roundIndex].length) {
                    nextRoundButton.style.display = 'flex';
                    nextRoundButton.disabled = false;
                }
            }
        }
    }



    renderRound(round); // Start with the first round
}

let currTeams = [];

function createTeam(gameDiv) {
    //const gameDiv = document.getElementById(`${currGame.tag}_game`);

    function addTeams(teamsDiv) {
        currTeams = [];
        teamsDiv.innerHTML = '';

        const addPlayers = (currPlayers, num) => {
            let team = [];
            const teamDiv = document.createElement('div');
            teamDiv.id = `team_${num}`;
            let teamHeader = document.createElement('h3');
            teamHeader.innerHTML = `Team ${num}`;
            teamHeader.style.paddingBottom = '10px';
            teamDiv.appendChild(teamHeader);
            
            currPlayers.forEach(player => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'player-box-3';
                playerDiv.textContent = player;
                team.push(player);
        
                teamDiv.appendChild(playerDiv);
            });
            teamsDiv.appendChild(teamDiv);
            currTeams.push(team.length == 1 ? team[0] : team.join(" and "));
        };
        
        const curr = shuffle(players.map(p => p.name));
        if (curr.length == 2) {
            addPlayers([curr[0]], 1);
            addPlayers([curr[1]], 2);
        } else {
            const numTeams = Math.floor(curr.length / 2);
            let numTeam = 1;

            for (let i = 0; i < numTeams; i++) {
                addPlayers([curr[2*i], curr[2*i + 1]], numTeam);
                numTeam++;
            }

            if (curr.length % 2 != 0) addPlayers([curr[curr.length - 1]], numTeam);
        }
    }

    const teams = document.createElement('div');
    teams.id = 'teams';
    gameDiv.appendChild(teams);
    addTeams(teams);

    const buttons = document.createElement('div');
    buttons.id = 'teamButtons';
    gameDiv.appendChild(buttons);

    const randomise = document.createElement('button');
    randomise.style.display = 'flex';
    randomise.className = 'button';
    randomise.textContent = 'Randomise';
    randomise.addEventListener('click', () => { addTeams(teams); });
    if (players.length != 2) buttons.appendChild(randomise);

    const start = document.createElement('button');
    start.style.display = 'flex';
    start.className = 'button';
    start.textContent = 'Start';
    start.addEventListener('click', () => {
        player = true;
        replaceSectors("players", shuffle(players))
    });
    buttons.appendChild(start);
}

function playTeam() {
    document.getElementById(`${currGame.tag}_setup`).style.display = 'none';
    const gameDiv = document.getElementById(`${currGame.tag}_game`);
    gameDiv.style.display = 'flex';
    if (currTeams.length == 2) {
        const playersDiv = document.createElement('div');
        playersDiv.id = 'teamPlayers';
        playersDiv.style.marginTop = '30px';

        const team = (teamPlayers) => {
            const playerDiv = document.createElement('div');
            playerDiv.id = `${teamPlayers}_box`;
            playerDiv.className = 'player-box-3';
            playerDiv.textContent = teamPlayers;

            playerDiv.addEventListener('click', () => {
                currTeams.forEach(t => {
                    document.getElementById(`${t}_box`).style.background = t == teamPlayers ? gold : blue;
                });
                document.getElementById('submit').style.display = 'flex';
            });

            playersDiv.appendChild(playerDiv);
        };

        team(currTeams[0]);
        const vsDiv = document.createElement('div');
        vsDiv.className = 'versus';
        vsDiv.textContent = 'vs';
        playersDiv.appendChild(vsDiv);
        team(currTeams[1]);

        gameDiv.appendChild(playersDiv);
    } else if (currTeams.length > 2 && currTeams.length <= 5) {
        currTeams = shuffle(currTeams);
        const { rounds, places } = currTeams.length == 3 ? generateThreePlayerTournament(currTeams) :
                                    currTeams.length == 4 ? generateFourPlayerTournament(currTeams) :
                                    generateFivePlayerTournament(currTeams);

        console.log(rounds);
        console.log(places);
    } else {
        console.error(`Error with teams length: ${currTeams.length}`);
    }
}

function createMultiple() {
    if (currGame.game == "Super Smash Bros") {
        const type = document.getElementById('smash_type').value;
        if (!type) return;
        if (type == "Tournament") createTournament();
        if (type == "Knockout") {
            currGame.results = "knockout";
            currGame.winner = "last";
            createKnockout();
        }
    } else if (currGame.game == "Switch Basketball") {
        const type = document.getElementById('s_basketball_type').value;
        if (!type) return;
        if (type == "Teams") createTeam(document.getElementById('s_basketball_game'));
        if (type == "Table") createTable();
    }
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                   Generating the Results
//

function generateResults() {
    if (currGame.game == "Mario Party") return generateMarioPartyResults();
    if (currGame.game == "Betrayal") return generateBetrayalResults();
    if (currGame.results == "table") return generateTableResults();
    if (currGame.results == "knockout") return generateKnockoutResults();
    if (currGame.results == "single") return generateSingleResults();
    if (currGame.results == "team") return generateTeamResults();
    if (currGame.results == "tournament") return currTournament;
    if (currGame.results == "multiple") return generateMultipleResults();
    return [];
}

function generateMarioPartyResults() {
    let names1 = document.getElementById(`mario_party_names1`);
    let names2 = document.getElementById(`mario_party_names2`);
    let stars1 = document.getElementById(`mario_party_stars1`);
    let stars2 = document.getElementById(`mario_party_stars2`);
    let coins1 = document.getElementById(`mario_party_coins1`);
    let coins2 = document.getElementById(`mario_party_coins2`);
    let results = [];

    // Collect names and points from the rows
    const collectData = (headerRow, starsRow, coinsRow) => {
        if (headerRow && starsRow && coinsRow) {
            const names = Array.from(headerRow.children).map(th => th.textContent.trim());
            const stars = Array.from(starsRow.children).map(td => parseInt(td.textContent.trim(), 10));
            const coins = Array.from(coinsRow.children).map(td => parseInt(td.textContent.trim(), 10));
            names.forEach((name, index) => {
                if (isNaN(stars[index]) || isNaN(coins[index])) {
                    results.push({ name: name, stars: -1, coins: -1 });
                } else {
                    results.push({ name: name, stars: stars[index], coins: coins[index] });
                }
            });
        }
    };
    collectData(names1, stars1, coins1);
    collectData(names2, stars2, coins2);

    // Sort by points then alphabetically
    results.sort((a, b) => {
        const stars = b.stars - a.stars;
        const coins = b.coins - a.coins;
        return stars != 0 ? stars :
                coins != 0 ? coins : a.name.localeCompare(b.name);
    });

    let currentPlace = 1;
    let extraPlaces = 0;
    while (results[0].stars == -1) results.push(results.shift());

    results.forEach((result, index) => {
        if (index != 0) {
            if (result.stars == results[index - 1].stars) {
                if (result.coins == results[index - 1].coins) {
                    extraPlaces++;
                } else {
                    currentPlace += extraPlaces + 1;
                    extraPlaces = 0;
                }
            } else {
                currentPlace += extraPlaces + 1;
                extraPlaces = 0;
            }
        }
        result.place = currentPlace;
        result.reward = pointsSystem[currentPlace - 1];
    });

    return results;
}

function generateBetrayalResults() {
    const traitor = document.getElementById('betrayal_traitor');
    const traitorPlayer = players.find(p => { return p.name == traitor.textContent});
    const team = players.filter(p => { return p.name != traitorPlayer.name });
    let index = pointsSystemShots ? players.length - 1 : team.length == 1 || team.length == 2 ? team.length : 3;
    let results = [];

    if (traitor.style.background == gold) {
        results.push({ name: traitorPlayer.name, place: 1, reward: pointsSystem[0] });
        team.forEach(p => { results.push({ name: p.name, place: 2, reward: pointsSystem[index] }); });
    } else if (traitor.style.background == blue) {
        team.forEach(p => { results.push({ name: p.name, place: 1, reward: pointsSystem[0] }); });
        results.push({ name: traitorPlayer.name, place: 2, reward: pointsSystem[index] });
    } else {
        console.error(`Error with background: ${traitor.style.background}`);
    }

    results.sort((a, b) => {
        const compare = a.place - b.place;
        return compare != 0 ? compare : a.name.localeCompare(b.name);
    });

    return results;
}

function generateTableResults() {
    let names1 = document.getElementById(`${currGame.tag}_names1`);
    let names2 = document.getElementById(`${currGame.tag}_names2`);
    let points1 = document.getElementById(`${currGame.tag}_points1`);
    let points2 = document.getElementById(`${currGame.tag}_points2`);
    let results = [];

    // Collect names and points from the rows
    const collectData = (headerRow, pointsRow) => {
        if (headerRow && pointsRow) {
            const names = Array.from(headerRow.children).map(th => th.textContent.trim());
            const points = Array.from(pointsRow.children).map(td => parseInt(td.textContent.trim(), 10));
            names.forEach((name, index) => {
                if (isNaN(points[index])) { results.push({ name: name, points: -1 });
                } else { results.push({ name: name, points: points[index] }); }
            });
        }
    };
    collectData(names1, points1);
    collectData(names2, points2);

    // Sort by points then alphabetically
    results.sort((a, b) => {
        let points = -1;
        if (currGame.winner == "highest") {
            points = b.points - a.points;
        } else if (currGame.winner == "lowest") {
            points = a.points - b.points;
        } else {
            console.error(`Error with winner in ${currGame.game}: ${currGame.winner}`);
        }
        return points != 0 ? points : a.name.localeCompare(b.name);
    });
    while (results[0].points == -1) results.push(results.shift());

    let currentPlace = 1;
    let extraPlaces = 0;
    results.forEach((result, index) => {
        if (index != 0) {
            if (result.points == results[index - 1].points) {
                extraPlaces++;
            } else {
                currentPlace += extraPlaces + 1;
                extraPlaces = 0;
            }
        }
        result.place = currentPlace;
        result.reward = pointsSystem[currentPlace - 1];
    });

    return results;
}

function generateKnockoutResults() {
    const otherPlayers = document.getElementById('knockoutPlayers');
    let others = [];
    Array.from(otherPlayers.children).map(p => { others.push(p) });

    const order = document.getElementById('knockoutOrder');
    const results = Array.from(order.children).map(orderDiv => {
        const [place, name] = orderDiv.textContent.split('. ');
        if (currGame.winner == "first" || currGame.winner == "last") {
            const numPlace = parseInt(place);
            return { name, place: numPlace, reward: pointsSystem[numPlace - 1] };
        } else {
            console.error(`Error with winner in ${currGame.game}: ${currGame.winner}`);
        }
    });
    others.forEach(p => {
        let place = results[results.length - 1].place - 1;
        results.push({ name: p.textContent, place, reward: pointsSystem[place - 1] });
    });

    return results;
}

function generateSingleResults() {
    let results = [];
    players.forEach(p => {
        const div = document.getElementById(`${p.name}_single_box`);
        if (div.style.background == gold) {
            results.push({ name: p.name, place: 1, reward: "1 point" });
        } else if (div.style.background == blue) {
            results.push({ name: p.name, place: players.length, reward: "1 shot" });
        } else {
            console.error(`Error with ${p.name} - ${div.style.background}`);
        }
    });

    results.sort((a, b) => {
        const compare = a.place - b.place;
        return compare != 0 ? compare : a.name.localeCompare(b.name);
    });
    
    return results;
}

function generateTwoPlayerTournament(curr) {
    const rounds = [
        [ { round: 1, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}`, winner: "", loser: "" } ],
        [ { round: 2, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}`, winner: "", loser: "" } ],
        [ { round: 3, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}`, winner: "", loser: "" } ]
    ];
    const places = [];
    return { rounds, places };
}

function generateThreePlayerTournament(curr) {
    const rounds = [
        [
            { round: 1, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}`, winner: "", loser: "" },
            { round: 1, game: 2, player1: `${curr[2]}`, player2: "Bye", winner: "", loser: "" }
        ],
        [
            { round: 2, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 2, game: 2, player1: "game 1 loser", player2: "Bye", winner: "", loser: "" }
        ],
        [
            { round: 3, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 3, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" }
        ],
        [
            { round: 4, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" }
        ]
    ];
    const places = [
        "4 - game 1 winner",
        "4 - game 1 loser",
        "3 - game 2 loser"
    ];
    return { rounds, places };
}

function generateFourPlayerTournament(curr) {
    const rounds = [
        [
            { round: 1, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}`, winner: "", loser: "" },
            { round: 1, game: 2, player1: `${curr[2]}`, player2: `${curr[3]}`, winner: "", loser: "" }
        ],
        [
            { round: 2, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 2, game: 2, player1: "game 1 loser", player2: "game 2 loser", winner: "", loser: "" }
        ],
        [
            { round: 3, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 3, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" }
        ],
        [
            { round: 4, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" }
        ]
    ];
    const places = [
        "4 - game 1 winner",
        "4 - game 1 loser",
        "3 - game 2 loser",
        "2 - game 2 loser"
    ];
    return { rounds, places };
}

function generateFivePlayerTournament(curr) {
    const rounds = [
        [
            { round: 1, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}`, winner: "", loser: "" },
            { round: 1, game: 2, player1: `${curr[2]}`, player2: `${curr[3]}`, winner: "", loser: "" },
            { round: 1, game: 3, player1: `${curr[4]}`, player2: "Bye", winner: "", loser: "" }
        ],
        [
            { round: 2, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 2, game: 2, player1: "game 2 winner", player2: "game 3 winner", winner: "", loser: "" },
            { round: 2, game: 3, player1: "game 1 loser", player2: "game 2 loser", winner: "", loser: "" }
        ],
        [
            { round: 3, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 3, game: 2, player1: "game 2 loser", player2: "game 3 winner", winner: "", loser: "" }
        ],
        [
            { round: 4, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 4, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" }
        ],
        [
            { round: 5, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" }
        ]
    ];
    const places = [
        "5 - game 1 winner",
        "5 - game 1 loser",
        "4 - game 2 loser",
        "3 - game 2 loser",
        "2 - game 3 loser"
    ];
    return { rounds, places };
}

function generateSixPlayerTournament(curr) {
    const rounds = [
        [
            { round: 1, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}`, winner: "", loser: "" },
            { round: 1, game: 2, player1: `${curr[2]}`, player2: `${curr[3]}`, winner: "", loser: "" },
            { round: 1, game: 3, player1: `${curr[4]}`, player2: `${curr[5]}`, winner: "", loser: "" }
        ],
        [
            { round: 2, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 2, game: 2, player1: "game 2 winner", player2: "game 3 winner", winner: "", loser: "" },
            { round: 2, game: 3, player1: "game 1 loser", player2: "Bye", winner: "", loser: "" },
            { round: 2, game: 4, player1: "game 2 loser", player2: "game 3 loser", winner: "", loser: "" }
        ],
        [
            { round: 3, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 3, game: 2, player1: "game 2 loser", player2: "game 4 winner", winner: "", loser: "" },
            { round: 3, game: 3, player1: "game 3 winner", player2: "game 4 winner", winner: "", loser: "" }
        ],
        [
            { round: 4, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 4, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" },
            { round: 4, game: 3, player1: "game 2 loser", player2: "game 3 winner", winner: "", loser: "" }
        ],
        [
            { round: 5, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 5, game: 2, player1: "game 2 loser", player2: "game 3 winner", winner: "", loser: "" }
        ],
        [
            { round: 6, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 6, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" }
        ],
        [
            { round: 7, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" }
        ]
    ];
    const places = [
        "7 - game 1 winner",
        "7 - game 1 loser",
        "6 - game 2 loser",
        "5 - game 2 loser",
        "4 - game 3 loser",
        "3 - game 3 loser"
    ];
    return { rounds, places };
}

function generateSevenPlayerTournament(curr) {
    const rounds = [
        [
            { round: 1, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}`, winner: "", loser: "" },
            { round: 1, game: 2, player1: `${curr[2]}`, player2: `${curr[3]}`, winner: "", loser: "" },
            { round: 1, game: 3, player1: `${curr[4]}`, player2: `${curr[5]}`, winner: "", loser: "" },
            { round: 1, game: 4, player1: `${curr[6]}`, player2: "Bye", winner: "", loser: "" }
        ],
        [
            { round: 2, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 2, game: 2, player1: "game 3 winner", player2: "game 4 winner", winner: "", loser: "" },
            { round: 2, game: 3, player1: "game 1 loser", player2: "Bye", winner: "", loser: "" },
            { round: 2, game: 4, player1: "game 2 loser", player2: "game 3 loser", winner: "", loser: "" }
        ],
        [
            { round: 3, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 3, game: 2, player1: "game 1 loser", player2: "game 2 loser", winner: "", loser: "" },
            { round: 3, game: 3, player1: "game 4 winner", player2: "Bye", winner: "", loser: "" },
            { round: 3, game: 4, player1: "game 3 winner", player2: "game 4 loser", winner: "", loser: "" }
        ],
        [
            { round: 4, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 4, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" },
            { round: 4, game: 3, player1: "game 2 loser", player2: "Bye", winner: "", loser: "" },
            { round: 4, game: 4, player1: "game 3 winner", player2: "game 4 winner", winner: "", loser: "" }
        ],
        [
            { round: 5, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 5, game: 2, player1: "game 2 loser", player2: "Bye", winner: "", loser: "" },
            { round: 5, game: 3, player1: "game 3 winner", player2: "game 4 winner", winner: "", loser: "" }
        ],
        [
            { round: 6, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 6, game: 2, player1: "game 1 loser", player2: "Bye", winner: "", loser: "" },
            { round: 6, game: 3, player1: "game 2 winner", player2: "game 3 winner", winner: "", loser: "" }
        ],
        [
            { round: 7, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 7, game: 2, player1: "game 2 winner", player2: "game 3 winner", winner: "", loser: "" }
        ],
        [
            { round: 8, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" }
        ]
    ];
    const places = [
        "8 - game 1 winner",
        "8 - game 1 loser",
        "7 - game 2 loser",
        "6 - game 3 loser",
        "5 - game 3 loser",
        "4 - game 4 loser",
        "3 - game 4 loser"
    ];
    return { rounds, places };
}

function generateEightPlayerTournament(curr) {
    const rounds = [
        [
            { round: 1, game: 1, player1: `${curr[0]}`, player2: `${curr[1]}` },
            { round: 1, game: 2, player1: `${curr[2]}`, player2: `${curr[3]}` },
            { round: 1, game: 3, player1: `${curr[4]}`, player2: `${curr[5]}` },
            { round: 1, game: 4, player1: `${curr[6]}`, player2: `${curr[7]}` }
        ],
        [
            { round: 2, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 2, game: 2, player1: "game 3 winner", player2: "game 4 winner", winner: "", loser: "" },
            { round: 2, game: 3, player1: "game 1 loser", player2: "game 2 loser", winner: "", loser: "" },
            { round: 2, game: 4, player1: "game 3 loser", player2: "game 4 loser", winner: "", loser: "" }
        ],
        [
            { round: 3, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 3, game: 2, player1: "game 1 loser", player2: "game 2 loser", winner: "", loser: "" },
            { round: 3, game: 3, player1: "game 3 winner", player2: "game 4 winner", winner: "", loser: "" },
            { round: 3, game: 4, player1: "game 3 loser", player2: "game 4 loser", winner: "", loser: "" }
        ],
        [
            { round: 4, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: ""},
            { round: 4, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" },
            { round: 4, game: 3, player1: "game 2 loser", player2: "game 3 winner", winner: "", loser: "" },
            { round: 4, game: 4, player1: "game 3 loser", player2: "game 4 winner", winner: "", loser: "" }
        ],
        [
            { round: 5, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 5, game: 2, player1: "game 2 loser", player2: "game 3 winner", winner: "", loser: "" },
            { round: 5, game: 3, player1: "game 3 loser", player2: "game 4 winner", winner: "", loser: "" } 
        ],
        [
            { round: 6, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 6, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" },
            { round: 6, game: 3, player1: "game 2 loser", player2: "game 3 winner", winner: "", loser: "" }
        ],
        [
            { round: 7, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" },
            { round: 7, game: 2, player1: "game 2 loser", player2: "game 3 winner", winner: "", loser: "" }
        ],
        [
            { round: 8, game: 1, player1: "game 1 winner", player2: "Bye", winner: "", loser: "" },
            { round: 8, game: 2, player1: "game 1 loser", player2: "game 2 winner", winner: "", loser: "" }
        ],
        [
            { round: 9, game: 1, player1: "game 1 winner", player2: "game 2 winner", winner: "", loser: "" }
        ]
    ];
    const places = [
        "9 - game 1 winner",
        "9 - game 1 loser",
        "8 - game 2 loser",
        "7 - game 2 loser",
        "6 - game 3 loser",
        "5 - game 3 loser",
        "4 - game 4 loser",
        "3 - game 4 loser"
    ];
    return { rounds, places };
}

function generateTournamentBrackets() {
    const curr = shuffle(players.map(p => p.name));

    let rounds = [];
    let places = [];
    let numPlayers = curr.length;

    if (numPlayers == 2) return generateTwoPlayerTournament(curr);
    if (numPlayers == 3) return generateThreePlayerTournament(curr);
    if (numPlayers == 4) return generateFourPlayerTournament(curr);
    if (numPlayers == 5) return generateFivePlayerTournament(curr);
    if (numPlayers == 6) return generateSixPlayerTournament(curr);
    if (numPlayers == 7) return generateSevenPlayerTournament(curr);
    if (numPlayers == 8) return generateEightPlayerTournament(curr);
    if (numPlayers > 8) console.error(`Error with ${numPlayers} players`);

    return { rounds, places };
}

function generateTeamResults() {
    let results = [];
    if (currTeams.length == 2) {
        const teamPlayers = document.getElementById('teamPlayers');
        Array.from(teamPlayers.children).filter(t => { return t.className != "versus" }).forEach(t => {
            const names = t.textContent.split(" and ");
            names.forEach(p => {
                if (t.style.background == gold) results.push({ name: p, place: 1, reward: "1 point" });
                if (t.style.background == blue) results.push({ name: p, place: 2, reward: "1 shot" });
            });
        });
    } else if (currTeams.length > 2 && currTeams.length <= 5) {

    } else {
        console.error(`Error with teams length: ${currTeams.length}`);
    }

    results.sort((a, b) => {
        const compare = a.place - b.place;
        return compare != 0 ? compare : a.name.localeCompare(b.name);
    });

    return results;
}

function generateMultipleResults() {
    if (currGame.game == "Super Smash Bros") {
        const type = document.getElementById('smash_type').value;
        if (!type) return [];
        if (type == "Tournament") return currTournament;
        if (type == "Knockout") return generateKnockoutResults();
    } else if (currGame.game == "Switch Basketball") {
        const type = document.getElementById('s_basketball_type').value;
        if (!type) return [];
        if (type == "Teams") return generateTeamResults();
        if (type == "Table") return generateTableResults();
    }
    return [];
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                   Submitting the Results
//

const overallResults = document.getElementById('overallResults');

function submitResults(results) {
    if (currGame.game == "Mario Party") submitMarioParty(results);
    if (currGame.game == "Betrayal") submitBetrayal(results);
    if (currGame.results == "table") submitTableGame(results);
    if (currGame.results == "knockout") submitKnockoutGame(results);
    if (currGame.results == "single") submitSingleGame(results);
    if (currGame.results == "tournament") submitTournamentGame(results);
    if (currGame.results == "team") submitTeamGame(results);
    if (currGame.results == "multiple") submitMultipleGame(results);
    
    logResults(results);
    if (games.length != 1) document.getElementById('next').style.display = 'flex';
    document.getElementById('finish').style.display = 'flex';

    showOverallResults();
}

function submitMarioParty(results) {
    let resultsBox = document.getElementById(`mario_party_results`);

    let box = document.createElement('div');
    box.className = "curr_game_box";
    box.style.border = 'none';
    box.appendChild(header('h3', "Place"));
    box.appendChild(header('h3', "Name"));
    box.appendChild(header('h3', "Game Stars"));
    box.appendChild(header('h3', "Game Coins"));
    box.appendChild(header('h3', "Reward"));
    resultsBox.appendChild(box);
    
    results.forEach((result) => {
        let playerBox = document.createElement('div');
        playerBox.id = `mario_party_box`;
        playerBox.className = "curr_game_box";
        playerBox.style.background = placeColour(result.place);
        playerBox.appendChild(header('h3', 
            result.place == 1 ? `1st` : result.place == 2 ? `2nd` :
            result.place == 3 ? `3rd` : `${result.place}th`
        ));
        playerBox.appendChild(header('h3', `${result.name}`));
        playerBox.appendChild(header('h3', result.stars == 1 ? `1 star` : `${result.stars} stars`));
        playerBox.appendChild(header('h3', result.coins == 1 ? `1 coin` : `${result.coins} coins`));
        playerBox.appendChild(header('h3', reward(result)));
        resultsBox.appendChild(playerBox);
    });

    document.getElementById('submit').style.display = 'none';
    if (games.length != 1) document.getElementById('next').style.display = 'flex';
    document.getElementById('finish').style.display = 'flex';
    showResults(resultsBox);
}

function submitBetrayal(results) {
    let resultsBox = document.getElementById(`betrayal_results`);

    let box = document.createElement('div');
    box.className = "curr_game_box";
    box.style.border = 'none';
    box.appendChild(header('h3', "Place"));
    box.appendChild(header('h3', "Name"));
    box.appendChild(header('h3', "Reward"));
    resultsBox.appendChild(box);
    
    results.forEach((result) => {
        let winner = result.place == 1;
        let playerBox = document.createElement('div');
        playerBox.id = `betrayal_box`;
        playerBox.className = "curr_game_box";
        playerBox.style.background = winner ? gold : blue;
        playerBox.appendChild(header('h3', winner ? `Winner` : `Loser`));
        playerBox.appendChild(header('h3', `${result.name}`));
        playerBox.appendChild(header('h3', reward(result)));
        resultsBox.appendChild(playerBox);
    });

    document.getElementById('submit').style.display = 'none';
    if (games.length != 1) document.getElementById('next').style.display = 'flex';
    document.getElementById('finish').style.display = 'flex';
    showResults(resultsBox);
}

function submitTableGame(results) {
    let resultsBox = document.getElementById(`${currGame.tag}_results`);

    let box = document.createElement('div');
    box.className = "curr_game_box";
    box.style.border = 'none';
    box.appendChild(header('h3', "Place"));
    box.appendChild(header('h3', "Name"));
    box.appendChild(header('h3', "Game Points"));
    box.appendChild(header('h3', "Reward"));
    resultsBox.appendChild(box);

    results.forEach((result) => {
        let playerBox = document.createElement('div');
        playerBox.id = `${currGame.tag}_box`;
        playerBox.className = "curr_game_box";
        playerBox.style.background = placeColour(result.place);
        playerBox.appendChild(header('h3', 
            result.place == 1 ? `1st` : result.place == 2 ? `2nd` :
            result.place == 3 ? `3rd` : `${result.place}th`
        ));
        playerBox.appendChild(header('h3', `${result.name}`));
        playerBox.appendChild(header('h3', result.points == 1 ? `${result.points} point` : `${result.points} points`));
        playerBox.appendChild(header('h3', reward(result)));
        resultsBox.appendChild(playerBox);
    });
    showResults(resultsBox);
}

function submitKnockoutGame(results) {
    let resultsBox = document.getElementById(`${currGame.tag}_results`);
    let box = document.createElement('div');
    box.className = "curr_game_box";
    box.style.border = 'none';
    box.appendChild(header('h3', "Place"));
    box.appendChild(header('h3', "Name"));
    box.appendChild(header('h3', "Reward"));
    resultsBox.appendChild(box);

    results.forEach((result) => {
        let playerBox = document.createElement('div');
        playerBox.id = `${currGame.tag}_box`;
        playerBox.className = "curr_game_box";
        playerBox.style.background = placeColour(result.place);
        playerBox.appendChild(header('h3', 
            result.place == 1 ? `1st` : result.place == 2 ? `2nd` :
            result.place == 3 ? `3rd` : `${result.place}th`
        ));
        playerBox.appendChild(header('h3', `${result.name}`));
        playerBox.appendChild(header('h3', reward(result)));
        resultsBox.appendChild(playerBox);
    });
    showResults(resultsBox);
}

function submitSingleGame(results) {
    let resultsBox = document.getElementById(`${currGame.tag}_results`);
    let box = document.createElement('div');
    box.className = "curr_game_box";
    box.style.border = 'none';
    box.appendChild(header('h3', "Place"));
    box.appendChild(header('h3', "Name"));
    box.appendChild(header('h3', "Reward"));
    resultsBox.appendChild(box);

    results.forEach((result) => {
        let playerBox = document.createElement('div');
        playerBox.id = `${currGame.tag}_box`;
        playerBox.className = "curr_game_box";
        playerBox.style.background = placeColour(result.place);
        playerBox.appendChild(header('h3', result.place == 1 ? `Winner` : `Loser`));
        playerBox.appendChild(header('h3', `${result.name}`));
        playerBox.appendChild(header('h3', reward(result)));
        resultsBox.appendChild(playerBox);
    });
    showResults(resultsBox);
}

function submitTournamentGame(results) {
    let resultsBox = document.getElementById(`${currGame.tag}_results`);
    let box = document.createElement('div');
    box.className = "curr_game_box";
    box.style.border = 'none';
    box.appendChild(header('h3', "Place"));
    box.appendChild(header('h3', "Name"));
    box.appendChild(header('h3', "Reward"));
    resultsBox.appendChild(box);

    results.forEach((result) => {
        let playerBox = document.createElement('div');
        playerBox.id = `${currGame.tag}_box`;
        playerBox.className = "curr_game_box";
        playerBox.style.background = placeColour(result.place);
        playerBox.appendChild(header('h3', 
            result.place == 1 ? `1st` : result.place == 2 ? `2nd` :
            result.place == 3 ? `3rd` : `${result.place}th`
        ));
        playerBox.appendChild(header('h3', `${result.name}`));
        playerBox.appendChild(header('h3', reward(result)));
        resultsBox.appendChild(playerBox);
    });
    showResults(resultsBox);
}

function submitTeamGame(results) {
    let resultsBox = document.getElementById(`${currGame.tag}_results`);
    let box = document.createElement('div');
    box.className = "curr_game_box";
    box.style.border = 'none';
    box.appendChild(header('h3', "Place"));
    box.appendChild(header('h3', "Name"));
    box.appendChild(header('h3', "Reward"));
    resultsBox.appendChild(box);

    results.forEach((result) => {
        let playerBox = document.createElement('div');
        playerBox.id = `${currGame.tag}_box`;
        playerBox.className = "curr_game_box";
        playerBox.style.background = placeColour(result.place);
        playerBox.appendChild(header('h3', 
            result.place == 1 ? `1st` : result.place == 2 ? `2nd` :
            result.place == 3 ? `3rd` : `${result.place}th`
        ));
        playerBox.appendChild(header('h3', `${result.name}`));
        playerBox.appendChild(header('h3', reward(result)));
        resultsBox.appendChild(playerBox);
    });
    showResults(resultsBox);
}

function submitMultipleGame(results) {
    if (currGame.game == "Super Smash Bros") {
        const type = document.getElementById('smash_type').value;
        if (!type) return;
        if (type == "Tournament") submitTournamentGame(results);
        if (type == "Knockout") submitKnockoutGame(results);
    } else if (currGame.game == "Switch Basketball") {
        const type = document.getElementById('s_basketball_type').value;
        if (!type) return [];
        if (type == "Teams") return submitTeamGame(results);
        if (type == "Table") return submitTableGame(results);
    }
}

function reward(result) {
    let text = result.reward;
    let num = 0;
    let type = "";

    if (text.includes("1 shot")) {
        type = "shot";
    } else if (text.includes("point")) {
        num = parseInt(text.split(" ")[0]);
        type = "point";
    } else if (text == "Nothing") {
        type = "nothing";
    }

    let player = players.find(p => { return p.name == result.name });
    let isSpeciality = player.speciality.includes(currGame.game);
    if (isSpeciality && result.place == 1) {
        if (type == "point") text = `${++num} points`;
        if (type == "shot") text = '1 point 1 shot';
        if (type == "nothing") text = '1 point';
    } else if (isSpeciality && result.place != 1) {
        if (type == "point") {
            --num;
            text = num == 0 ? "Nothing" : num == 1 ? "1 point" : `${num} points`;
        }
        if (type == "shot") text = '1 shot -1 point';
        if (type == "nothing") text = '-1 point';
    }

    result.reward = text;
    return text;
}

function showResults(div) {
    div.style.display = 'flex';

    const specialityPlayers = players.filter(p => {
        return p.speciality.includes(currGame.game);
    }).map(p => p.name);

    if (specialityPlayers.length != 0) {
        div.style.marginTop = '0px';
        div.style.maxHeight = '225px';
    }
}

function showOverallResults() {
    overallResults.innerHTML = '';
    let results = [];

    theGame.players.forEach(p => {
        const shots = Object.values(p.shots).reduce((a, b) => a + b, 0);
        const points = Object.values(p.points).reduce((a, b) => a + b, 0);
        results.push({ name: p.name, points, shots });
    });

    results.sort((a, b) => {
        const comparePoints = b.points - a.points;
        const compareShots = a.shots - b.shots;
        return comparePoints != 0 ? comparePoints :
                compareShots != 0 ? compareShots : a.name.localeCompare(b.name);
    });
    
    let currentPlace = 1;
    let extraPlaces = 0;
    results.forEach((result, index) => {
        if (index != 0) {
            if (result.points == results[index - 1].points && result.shots == results[index - 1].shots) {
                extraPlaces++;
            } else {
                currentPlace += extraPlaces + 1;
                extraPlaces = 0;
            }
        }
        result.place = currentPlace;
    });

    results.forEach(r => {
        const box = document.createElement('div');
        box.className = 'overallPlayerBox';
        box.style.background = placeColour(r.place);
    
        const info = document.createElement('div');
        info.className = 'overallPlayerInfo';

        let topText = `${r.name} - `;
        topText += r.place == 1 ? '1st' : r.place == 2 ? '2nd' :
                    r.place == 3 ? '3rd' : `${r.place}th`;
        let points = r.points != 1 ? `${r.points} points` : `${r.points} point`;
        let shots = r.shots != 1 ? `${r.shots} shots` : `${r.shots} shot`;

        box.appendChild(header('h2', topText));
        info.appendChild(header('h3', points));
        info.appendChild(header('h3', shots));
        box.appendChild(info);

        overallResults.appendChild(box);
    });

    overallResults.parentElement.style.display = 'flex';
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Games
//
//


let createdGames = [ "cah", "mario_party", "skip_bo" ];

function playGame(game) {
    createGame();
    document.getElementById(`${game}`).style.display = 'block';
    document.getElementById(`${game}_setup`).style.display = 'flex';
}

function startGame() {
    const specialityPlayers = players.filter(p => {
        return p.speciality.includes(currGame.game)
    }).map(p => p.name);

    theGame.games.push({
        game_id: `game_${gameNumber}`,
        status: "active",
        name: currGame.game,
        extras: [],
        players: players.map(p => { return p.name; }),
        speciality: specialityPlayers,
        results: [],
        after: []
    });

    if (currGame.game == "Mario Party") createMarioParty();
    if (currGame.game == "Betrayal") createBetrayal();
    if (currGame.results == "table")  createTable();
    if (currGame.results == "knockout") createKnockout();
    if (currGame.results == "single") createSingle();
    if (currGame.results == "tournament") createTournament();
    if (currGame.results == "team") playTeam();
    if (currGame.results == "multiple") createMultiple();

    document.getElementById(`${currGame.tag}_setup`).style.display = 'none';
    const noPlayers = document.getElementById('noPlayers');
    if (noPlayers) noPlayers.style.display = 'none';
    let game = theGame.games.find(g => { return g.name == currGame.game; });
    let header = document.getElementById(`${currGame.tag}_header`);
    switch (currGame.game) {
        case 'Golf':
            const option = document.getElementById('golf_options');
            if (!option) break;
            option.style.display = 'none';
            if (option.value == 'Rounds') {
                const roundsNum = document.getElementById('golf_roundsNum');
                if (!roundsNum) break;
                header.innerHTML = `Total Rounds: ${roundsNum.value}`;
                game.extras.push(`${roundsNum.value} rounds`);
            } else if (option.value == 'Limit') {
                const limitNum = document.getElementById('golf_limitNum');
                if (!limitNum) break;
                header.innerHTML = `Total Limit: ${limitNum.value}`;
                game.extras.push(`${limitNum.value} limit`);
            } else {
                console.error(`Error with ${option.value}`);
            }
            break;
        case 'Cards Against Humanity':
            const wins = document.getElementById('cah_winNum');
            if (!wins) break;
            header.innerHTML = `Get ${wins.value} cards to win!`;
            game.extras.push(`${wins.value} cards`);
            break;
        case 'Mario Party':
            const version = document.getElementById('mario_party_version');
            const map = document.getElementById('mario_party_map');
            const turns = document.getElementById('mario_party_turns');
            if (!version || !map || !turns) break;
            gameTitle.innerHTML = `Game ${gameNumber} - ${version.value}`;
            header.innerHTML = `Playing ${turns.value} turns on ${map.value}. Good Luck!`;
            game.extras.push(`Version: ${version.value}`);
            game.extras.push(`Turns: ${turns.value}`);
            game.extras.push(`Map: ${map.value}`);
            break;
        case 'Skip Bo':
            const cards = document.getElementById('skip_bo_cardNum');
            if (!cards) break;
            header.innerHTML = `Get rid of all ${cards.value} cards to win!`;
            game.extras.push(`${cards.value} cards`);
            break;
        ////////////////////// MORE OPTIONS HERE ///////////////////////////////////////
        default: header.innerHTML = currGame.header;
    }
    header.style.display = 'flex';
    document.getElementById(`${currGame.tag}_game`).style.display = 'flex';
    document.getElementById('next').style.display = 'none';
    if (currGame.game == "Super Smash Bros") {
        const type = document.getElementById('smash_type').value;
        if (!type) return;
        if (type != "Tournament") document.getElementById('submit').style.display = 'flex';
    } else if (currGame.results != "tournament" && currGame.results != "team" && currGame.game != "Betrayal") {
        document.getElementById('submit').style.display = 'flex';
    }
}

function submitGame() {
    document.getElementById(`${currGame.tag}_game`).style.display = 'none';
    const results = generateResults();
    
    let box = document.getElementById('coin_box');
    if (!box) {
        box = document.createElement('div');
        box.id = `coin_box`;
    }
    let coins = [];
    let size = 0;
    results.forEach(result => {
        if (result.reward != "1 shot" && !result.reward.includes("point")) size++;
    });
    results.forEach(result => {
        if (result.reward != "1 shot" && !result.reward.includes("point") && result.reward != "Nothing") {
            coins.push(createCoin(size, results, coins, box, result));
        }
    });

    if (coins.length == 0) submitResults(results);
    document.getElementById(`${currGame.tag}`).appendChild(box);
    document.getElementById(`${currGame.tag}_header`).style.display = 'none';
    document.getElementById('submit').style.display = 'none';
}

function nextGame() {
    gameNumber++;
    saveGameState();
    document.getElementById('next').style.display = 'none';
    
    if (gameSelection == "Wheel") {
        if (noSpin) return;
        games = games.filter(g => g != currGame.game);
        replaceSectors("games", shuffle(games));
    }
    
    document.getElementById('specialityTitle').style.display = 'none';
    document.getElementById(`${currGame.tag}_results`).style.display = 'none';
    document.getElementById('finish').style.display = 'none';
    document.getElementById('coin_box').style.display = 'none';

    gameTitle.innerText = `Game ${gameNumber}`;
    wheelShot.style.display = 'none';
    askNeigh.style.display = 'none';
    overallResults.parentElement.style.display = 'none';

    if (gameSelection == "Choose") {
        document.getElementById(`${currGame.tag}`).remove();
        document.getElementById(`${currGame.tag}_box`).remove();
        choose.style.display = 'flex';
    } else if (gameSelection == "Vote") {
        document.getElementById(`${currGame.tag}`).remove();
        openVote();
    }
}

function createGame() {
    const box = document.getElementById('box');

    const gameDiv = document.createElement('div');
    gameDiv.id = `${currGame.tag}`;
    gameDiv.className = "curr_game";

    const setup = document.createElement('div');
    setup.id = `${currGame.tag}_setup`;
    setup.className = "curr_game_setup";

    if (currGame.game == "Golf") {
        const options = document.createElement('select');
        options.id = "golf_options";
        options.className = "game_select";
        options.appendChild(createOption("", "Rounds or Limit..."))
        options.appendChild(createOption("Rounds", ""));
        options.appendChild(createOption("Limit", ""));
        setup.appendChild(options);

        const rounds = createNumInput("Rounds", 15, "How many rounds...");
        const limit = createNumInput("Limit", 99, "What's the limit...");
        
        setup.appendChild(rounds);
        setup.appendChild(limit);

        options.addEventListener("change", () => {
            const option = document.getElementById('golf_options').value;
            rounds.style.display = option == "Rounds" ? 'flex' : 'none';
            limit.style.display = option == "Limit" ? 'flex' : 'none';
            document.getElementById('golf_start').style.display = 'flex';
        });
    } else if (currGame.game == "Cards Against Humanity") {
        const win = createNumInput("win", 15, "How many cards to win...");
        win.style.display = 'flex';
        setup.appendChild(win);
    } else if (currGame.game == "Mario Party") {
        const version = document.createElement('select');
        version.id = "mario_party_version";
        version.className = "game_select";
        version.appendChild(createOption("", "Pick a version..."))
        version.appendChild(createOption("Super Mario Party", ""));
        version.appendChild(createOption("Mario Party Superstars", ""));
        version.appendChild(createOption("Super Mario Party Jamboree", ""));
        setup.appendChild(version);

        const map = document.createElement('select');
        map.id = "mario_party_map";
        map.className = "game_select";
        map.style.display = 'none';
        setup.appendChild(map);

        const turns = document.createElement('select');
        turns.id = "mario_party_turns";
        turns.className = "game_select";
        turns.style.display = 'none';
        turns.appendChild(createOption("", "Number of turns..."));
        turns.appendChild(createOption("10", ""));
        turns.appendChild(createOption("15", ""));
        turns.appendChild(createOption("20", ""));
        turns.appendChild(createOption("25", ""));
        turns.appendChild(createOption("30", ""));
        setup.appendChild(turns);

        version.addEventListener("change", () => {
            const option = document.getElementById('mario_party_version').value;
            map.innerHTML = '';
            map.appendChild(createOption("", "Pick a map..."));
            if (option == "Super Mario Party") {
                map.appendChild(createOption("Whomp's Domino Ruins", ""));
                map.appendChild(createOption("King Bob-omb's Powderkeg Mine", ""));
                map.appendChild(createOption("Megafruit Paradise"));
                map.appendChild(createOption("Kamek's Tantalizing Tower", ""));
            } else if (option == "Mario Party Superstars") {
                map.appendChild(createOption("Yoshi's Tropical Island", ""));
                map.appendChild(createOption("Space Land", ""));
                map.appendChild(createOption("Peach's Birthday Cake", ""));
                map.appendChild(createOption("Woody Woods", ""));
                map.appendChild(createOption("Horror Land", ""));
            } else if (option == "Super Mario Party Jamboree") {
                map.appendChild(createOption("Mega Wiggler's Tree Party", ""));
                map.appendChild(createOption("Roll 'em Raceway", ""));
                map.appendChild(createOption("Goomba Lagoon", ""));
                map.appendChild(createOption("Rainbow Galleria", ""));
                map.appendChild(createOption("Western Land", ""));
                map.appendChild(createOption("Mario's Rainbow Castle", ""));
                map.appendChild(createOption("King Bowser's Keep", ""));
            } else {
                console.error(`Error with Mario Party setup: ${option}`);
            }
            map.style.display = 'flex';
        });

        map.addEventListener("change", () => {
            const map = document.getElementById('mario_party_map').value;
            console.log(map);
            document.getElementById('mario_party_turns').style.display = 'flex';
        });
    } else if (currGame.game == "Skip Bo") {
        const win = createNumInput("card", 15, "How many cards...");
        win.style.display = 'flex';
        setup.appendChild(win);
    } else if (currGame.game == "Super Smash Bros") {
        const type = document.createElement('select');
        type.id = "smash_type";
        type.className = "game_select";
        type.appendChild(createOption("", "Tournament or Knockout..."))
        type.appendChild(createOption("Tournament", ""));
        type.appendChild(createOption("Knockout", ""));
        setup.appendChild(type);
    } else if (currGame.game == "Switch Basketball") {
        const type = document.createElement('select');
        type.id = "s_basketball_type";
        type.className = "game_select";
        type.appendChild(createOption("", "Teams or Table..."))
        type.appendChild(createOption("Teams", ""));
        type.appendChild(createOption("Table", ""));
        setup.appendChild(type);
    }
    
    if (currGame.results != "team") {
        const button = document.createElement('button');
        button.id = `${currGame.tag}_start`;
        button.className = "button";
        button.type = "submit";
        button.innerHTML = "Start";
        button.addEventListener("click", () => {
            player = true;
            replaceSectors("players", shuffle(players));
        });
        setup.appendChild(button);
    }

    gameDiv.appendChild(setup);

    const header = document.createElement('div');
    header.id = `${currGame.tag}_header`;
    header.className = "curr_game_header";
    gameDiv.appendChild(header);

    const game = document.createElement('div');
    game.id = `${currGame.tag}_game`;
    game.className = "curr_game_game";
    gameDiv.appendChild(game);

    const results = document.createElement('div');
    results.id = `${currGame.tag}_results`;
    results.className = "curr_game_results";
    gameDiv.appendChild(results);

    box.appendChild(gameDiv);

    if (currGame.results == "team") {
        createTeam(setup);
    }
}

// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                      Neighs
//


function resetNeigh() {
    askNeigh.style.display = 'none';
    showNeigh(1);
    hideNeigh(2);
    hideNeigh(3);
}

function hideNeigh(num) {
    document.getElementById(`neighButtons${num}`).style.display = 'none';
    document.getElementById(`ask${num}`).style.display = 'none';
    document.getElementById(`yesNeigh${num}`).style.display = 'none';
    document.getElementById(`noNeigh${num}`).style.display = 'none';
}

function showNeigh(num) {
    document.getElementById(`neighButtons${num}`).style.display = 'flex';
    document.getElementById(`ask${num}`).style.display = 'block';
    document.getElementById(`yesNeigh${num}`).style.display = 'flex';
    document.getElementById(`noNeigh${num}`).style.display = 'flex';
}

/*function neigh(option, num) {
    resetNeigh();
    if (option) {
        askNeigh.style.display = 'flex';
        for (let i = 0; i < 3; i++) hideNeigh(i + 1);
        const possiblePlayers = players.filter(p => {
            return p.cards.neigh > 0 || p.cards.super_neigh > 0;
        });

        if (possiblePlayers.length == 0) {
            const noPlayers = header('h3', "Too bad, no one can");
            noPlayers.id = 'noPlayers';
            noPlayers.style.marginBottom = '30px';
            askNeigh.appendChild(noPlayers);
            if (num == 1 || num == 3) {
                playGame(currGame.tag);
            } else if (num == 2) {
                wheel.style.display = 'flex';
                openWheel();
            }
        } else {
            const who = header('h3', "Who?<br>What type?");
            who.style.textAlign = 'center';
            askNeigh.appendChild(who);

            const select = document.getElementById('selectNeighPlayer');
            askNeigh.removeChild(select);
            select.innerHTML = '';
            select.style.display = 'flex';
            select.appendChild(createOption("", "Select Player..."));
            players.forEach(p => { select.appendChild(createOption(`${p.name}`, "")); });
            askNeigh.appendChild(select);

            select.addEventListener("change", () => {
                const selectType = document.getElementById('selectNeighType');
                askNeigh.removeChild(selectType);
                selectType.innerHTML = '';
                selectType.style.display = 'flex';
                selectType.style.marginTop = '-20px';
                selectType.appendChild(createOption("", "Select Neigh Type..."));
                const player = players.find(p => { return p.name == select.value });
                if (player.cards.neigh > 0) selectType.appendChild(createOption("Neigh", ""));
                if (player.cards.super_neigh > 0) selectType.appendChild(createOption("Super Neigh", ""));
                if (player.cards.neigh <= 0 && player.cards.super_neigh <= 0) selectType.appendChild(createOption("", "You don't have any lol!"))
                askNeigh.appendChild(selectType);

                selectType.addEventListener("change", () => {
                    let neighButton = document.getElementById('submitNeigh');
                    if (neighButton) {
                        askNeigh.removeChild(neighButton);
                    } else {
                        neighButton = document.createElement('button');
                        neighButton.type = 'submit';
                        neighButton.className = 'button';
                        neighButton.id = 'submitNeigh';
                        neighButton.textContent = 'Submit Neigh';
                    }
                    neighButton.style.display = 'flex';
                    neighButton.addEventListener("click", () => {
                        logNeigh(select.value, selectType.value);
                        who.style.display = 'none';
                        select.style.display = 'none';
                        selectType.style.display = 'none';
                        neighButton.style.display = 'none';
                        for (let i = 0; i < 3; i++) hideNeigh(i + 1);
                        showNeigh(num == 3 ? 2 : num + 1);
                    });
                    askNeigh.appendChild(neighButton);
                });
            });
        }
        // hideNeigh(1);
        // hideNeigh(num);
        // showNeigh(num == 3 ? 2 : num + 1);
    } else if (num == 1 || num == 3) {
        playGame(currGame.tag);
    } else {
        wheel.style.display = 'flex';
        openWheel();
    }
}*/

function toPlayOrNotToPlay(num) {
    if (num == 1 || num == 3) {
        playGame(currGame.tag);
    } else if (num == 2) {
        gameTitle.innerHTML = `Game ${gameNumber}`;
        if (gameSelection == "Wheel") openWheel();
        if (gameSelection == "Choose") openChoosing();
        if (gameSelection == "Vote") openVote();
    } else {
        console.error(`Error with num: ${num}`);
    }
}

function neigh(option, num) {
    resetNeigh();
    if (option) {
        let goBack = document.getElementById('goBack');
        if (goBack) askNeigh.removeChild(goBack);
        if (!goBack) {
            goBack = document.createElement('button');
            goBack.type = 'submit';
            goBack.className = 'button';
            goBack.id = 'goBack';
            goBack.textContent = 'Go Back';
        }
        askNeigh.style.display = 'flex';
        for (let i = 0; i < 3; i++) hideNeigh(i + 1);

        const possiblePlayers = players.filter(p => p.cards.neigh > 0 || p.cards.super_neigh > 0);

        if (possiblePlayers.length === 0) {
            const noPlayers = header('h3', "Too bad, no one can");
            noPlayers.id = 'noPlayers';
            noPlayers.style.marginBottom = '30px';
            askNeigh.appendChild(noPlayers);
            toPlayOrNotToPlay(num);
        } else {
            let who = document.getElementById('who');
            if (who) {
                askNeigh.removeChild(who);
                who.style.display = 'block';
            } else {
                who = header('h3', "Who?<br>What type?");
                who.id = 'who';
                who.style.textAlign = 'center';
                who.style.paddingBottom = '20px';
            }
            askNeigh.appendChild(who);

            let neighOptions = document.getElementById('neighOptions');
            if (neighOptions) {
                askNeigh.removeChild(neighOptions);
            } else {
                neighOptions = document.createElement('div');
                neighOptions.id = 'neighOptions';
            }
            askNeigh.appendChild(neighOptions);

            const select = document.getElementById('selectNeighPlayer');
            select.innerHTML = '';
            select.style.display = 'flex';
            select.appendChild(createOption("", "Select Player..."));
            possiblePlayers.forEach(p => select.appendChild(createOption(`${p.name}`, "")));
            neighOptions.appendChild(select);

            const selectHandler = () => {
                askNeigh.removeChild(document.getElementById('goBack'))
                const selectType = document.getElementById('selectNeighType');
                selectType.innerHTML = '';
                selectType.style.display = 'flex';
                selectType.appendChild(createOption("", "Select Neigh Type..."));

                const player = players.find(p => p.name === select.value);
                if (player.cards.neigh > 0) selectType.appendChild(createOption("Neigh", ""));
                if (player.cards.super_neigh > 0) selectType.appendChild(createOption("Super Neigh", ""));
                neighOptions.appendChild(selectType);

                const typeHandler = () => {
                    let neighButton = document.getElementById('submitNeigh');
                    if (neighButton) {
                        askNeigh.removeChild(neighButton);
                        askNeigh.appendChild(neighButton);
                    } else {
                        neighButton = document.createElement('button');
                        neighButton.type = 'submit';
                        neighButton.className = 'button';
                        neighButton.id = 'submitNeigh';
                        neighButton.textContent = 'Submit Neigh';
                        askNeigh.appendChild(neighButton);
                    }

                    neighButton.onclick = () => {
                        logNeigh(select.value, selectType.value);
                        who.style.display = 'none';
                        select.style.display = 'none';
                        selectType.style.display = 'none';
                        neighButton.style.display = 'none';
                        for (let i = 0; i < 3; i++) hideNeigh(i + 1);
                        showNeigh(num == 3 ? 2 : num + 1);
                    };
                    neighButton.style.display = 'block';
                };

                selectType.removeEventListener("change", typeHandler);
                selectType.addEventListener("change", typeHandler);
            };

            select.removeEventListener("change", selectHandler);
            select.addEventListener("change", selectHandler);

            askNeigh.appendChild(goBack);

            const backHandler = () => {
                who.style.display = 'none';
                select.style.display = 'none';
                document.getElementById('selectNeighType').style.display = 'none';
                goBack.style.display = 'none';
                for (let i = 0; i < 3; i++) hideNeigh(i + 1);
                showNeigh(num);
            }

            goBack.removeEventListener("click", backHandler);
            goBack.addEventListener("click", backHandler);
        }
    } else {
        toPlayOrNotToPlay(num);
    }
}



// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                      Logs
//


function logResults(results) {
    results.forEach(r => {
        let baseReward = pointsSystem[r.place - 1];
        let coin = baseReward == "pn" || baseReward == "pc" || baseReward == "nc";
        if (r.reward == "1 shot") logShot(r.name, coin ? "coin" : "loss");
        if (r.reward.includes("point")) {
            for (let i = 0; i < r.reward.split(" ")[0]; i++) {
                logPoint(r.name, coin ? "coin" : "game");
            }
        }
        let player = players.find(p => { return p.name == r.name });
        let isSpeciality = player.speciality.includes(currGame.game);
        if (isSpeciality && r.place == 1) logPoint(r.name, "speciality won");
        if (isSpeciality && r.place != 1) logPoint(r.name, "speciality lost");
    });

    let game = theGame.games.find(g => g.name == currGame.game);
    game.status = "complete";
    game.results = results;
}

function logShot(name, type) {
    let player = theGame.players.find(p => { return p.name == name });
    console.log(player);
    if (!player) return;
    //console.log(`Adding shot of type ${type} for ${name}`);
    if (type == "wheel" || type == "break" || type == "victory") {
        //const game = theGame.games.find(g => g.name == currGame.game);
        //console.log(game);
    }
    switch (type) {
        case "pre-game": case "break": player.shots.pg_shot++; break;
        case "loss": player.shots.l_shot++; break;
        case "coin": player.shots.c_shot++; break;
        case "wheel": player.shots.w_shot++; break;
        case "victory": player.shots.v_shot++; break;
        default: console.error(`Error with point type: ${type}`);
    }
}

function logPoint(name, type) {
    let player = theGame.players.find(p => { return p.name == name });
    if (!player) return;
    //console.log(`Adding point of type ${type} for ${name}`);
    switch (type) {
        case "game": player.points.g_point++; break;
        case "coin": player.points.c_point++; break;
        case "speciality won": player.points.special_w_point++; break;
        case "speciality lost": player.points.special_l_point--; break;
        default: console.error(`Error with point type: ${type}`);
    }
}

function logNeigh(name, type) {
    let player = theGame.players.find(p => { return p.name == name });
    //console.log(player);
    //console.log(type);
    if (!player) return;
    switch (type) {
        case "Neigh": player.cards.neigh--; break;
        case "Super Neigh": player.cards.super_neigh--; break;
        default: console.error(`Error with neigh type: ${type}`);
    }
    if (player.cards.neigh < 0) player.cards.neigh = 0;
    if (player.cards.super_neigh < 0) player.cards.super_neigh = 0;
}

function logGooC(name, type) {
    let player = theGame.players.find(p => { return p.name == name });
    if (!player) return;
    switch (type) {
        case "add": player.cards.gooc_total++; break;
        case "use": player.cards.gooc_used++; break;
        default: console.error(`Error with neigh type: ${type}`);
    }
}

// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                         Extra Buttons Functionality
//

const middle = document.getElementById('middle-container');

const intrudeGameDiv = document.getElementById('intrude-game');
const abandonGameDiv = document.getElementById('abandon-game');
const breakTimeDiv = document.getElementById('break-shot');
const victoryTimeDiv = document.getElementById('victory-shot');

const intruderSpecialities = document.getElementById('intrude-game-specialities');

function middleOpen() {
    return intrudeGameDiv.style.display == 'flex' ||
           abandonGameDiv.style.display == 'flex' ||
           breakTimeDiv.style.display == 'flex' ||
           victoryTimeDiv.style.display == 'flex';
}

function intrudeGame() {
    if (middleOpen()) return;
    const possiblePlayers = allPlayers.filter(p => !players.find(p2 => p == p2.name));
    middle.style.display = 'flex';
    const intrudeDiv = document.getElementById('intrude-game-players');
    intrudeDiv.innerHTML = '';

    const select = document.createElement('select');
    select.id = 'intrude-game-name';
    select.className = 'middle-select';
    intrudeDiv.appendChild(select);
    
    select.appendChild(createOption("", "Select intruder..."));
    possiblePlayers.forEach(p => {
        select.appendChild(createOption(p, ""));
    });
    select.appendChild(createOption("New Player", ""));

    select.addEventListener("change", () => {
        if (select.value == "New Player") {
            // NEW PLAYER MOMENT   
        } else {
            addIntruderSpecialities();
        }
        if (systems.points == "Points & Shots") {
            const result = document.getElementById('intrude-game-result');
            result.innerHTML = `Ratatouille ${select.value}!`;
            result.style.display = 'flex';
        }
        document.getElementById('intrude-game-button').style.display = 'flex';
    });
    
    intrudeGameDiv.style.display = 'flex';
}

function closeIntrude() {
    document.getElementById('intrude-game-players').innerHTML = '';
    document.getElementById('intrude-game-result').style.display = 'none';
    document.getElementById('intrude-game-button').style.display = 'none';
    intruderSpecialities.style.display = 'none';
    intrudeGameDiv.style.display = 'none';
    middle.style.display = 'none';
}

function addIntruderSpecialities() {
    intruderSpecialities.innerHTML = '';
    for (let i = 0; i < parseInt(systems.speciality); i++) {
        const speciality = document.createElement('select');
        speciality.className = 'middle-select';
        intruderSpecialities.appendChild(speciality);

        speciality.appendChild(createOption("", "Select Speciality..."));
        gamesLeft.sort((a, b) => {
            return a.game.localeCompare(b.game);
        }).forEach(g => {
            speciality.appendChild(createOption(g.game, ""));
        });

        speciality.addEventListener("change", () => {
            const selected = Array.from(intruderSpecialities.children).filter(s => {
                return s.value != "";
            }).map(s => s.value);

            /*Array.from(intruderSpecialities.children).forEach(s => {
                console.log(s);
                Array.from(s.children).forEach(o => {
                    if (s.value == "") {
                        o.disabled = o.value == "" || selected.includes(o.value);
                    } else if (s.value != o.value) {
                        
                    } else {
                        
                    }
                });
            });*/
        });
    }
    intruderSpecialities.style.display = 'flex';
}

function intrude() {
    const name = document.getElementById('intrude-game-name').value;
    const specialities = Array.from(intruderSpecialities.children).map(s => s.value);

    theGame.intruded.push(name);
    theGame.players.push({
        name,
        speciality: specialities,
        shots: { pg_shot: 1, l_shot: 0, c_shot: 0, w_shot: 0, v_shot: 0 },
        points: { g_point: 0, c_point: 0, special_w_point: 0, special_l_point: 0 },
        cards: { neigh: 2, super_neigh: 2, gooc_total: 0, gooc_used: 0 }
    });
    players = theGame.players;

    let num = players.length;
    const deleteGames = theGame.possible_games.filter(game => {
        const currInfo = gamesInfo.find(g => g.game == game);
        return num < currInfo.player_min || num > currInfo.player_max;
    });

    theGame.possible_games = theGame.possible_games.filter(game => !deleteGames.includes(game));
    gamesLeft.filter(g => !deleteGames.includes(g.game));

    let game = theGame.games - 1;
    if (game >= 0) theGame.games[game].after.push(`${name} INTRUDED the Game`);

    intrudeGameDiv.style.display = 'none';
    middle.style.display = 'none';
}

function abandonGame() {
    if (middleOpen()) return;
    middle.style.display = 'flex';
    const abandonDiv = document.getElementById('abandon-game-players');
    abandonDiv.innerHTML = '';

    const select = document.createElement('select');
    select.id = 'abandon-game-name';
    select.className = 'middle-select';
    abandonDiv.appendChild(select);
    
    select.appendChild(createOption("", "Select abandoner..."));
    players.forEach(p => {
        select.appendChild(createOption(p.name, ""));
    });

    select.addEventListener("change", () => {
        const result = document.getElementById('abandon-game-result');
        result.innerHTML = `See you later ${select.value}!`;
        result.style.display = 'flex';
        document.getElementById('abandon-game-button').style.display = 'flex';
    });
    
    abandonGameDiv.style.display = 'flex';
}

function abandon() {
    const name = document.getElementById('abandon-game-name').value;

    theGame.abandoned.push(name);
    players = theGame.players.filter(p => p.name != name).map(p => p.name);

    let game = theGame.games - 1;
    if (game >= 0) theGame.games[game].after.push(`${name} ABANDONED the Game`);

    abandonGameDiv.style.display = 'none';
    middle.style.display = 'none';
}

function closeAbandon() {
    document.getElementById('abandon-game-players').innerHTML = '';
    document.getElementById('abandon-game-result').style.display = 'none';
    document.getElementById('abandon-game-button').style.display = 'none';
    abandonGameDiv.style.display = 'none';
    middle.style.display = 'none';
}

function pickBreakShot() {
    if (middleOpen()) return;
    middle.style.display = 'flex';
    const playerDiv = document.getElementById('break-shot-players');
    players.forEach(p => {
        playerDiv.appendChild(header('h2', p.name));
    });
    playerDiv.parentElement.style.display = 'flex';
}

function breakTime() {

}

function pickVictoryShot() {
    if (middleOpen()) return;
    middle.style.display = 'flex';
    const playerDiv = document.getElementById('victory-shot-players');
    players.forEach(p => {
        playerDiv.appendChild(header('h2', p.name));
    });
    playerDiv.parentElement.style.display = 'flex';
}


function victoryTime() {

}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                               Starting, Saving and Finishing a Game of Games
//



function startGoG(newGame) {
    console.log("The Game", theGame);
    console.log("Game Info", gamesInfo);
    console.log("All Players", allPlayers);
    console.log("Game Number", gameNumber);
    console.log("Games Left", gamesLeft);
    console.log("New Game", newGame);
    document.getElementById('header').innerHTML = `${theGame.gog_id}`
    gameTitle.innerHTML = `Game ${gameNumber}`;
    if (newGame) {
        welcome.style.display = 'flex';
    
        
    } else if (theGame.players[0].shots.pg_shot == 0) {
        if (systems.points == "Points & Shots") {
            welcome.appendChild(header('h4', "Everyone have a pre-game shot to begin!"));
            players.forEach(p => logShot(p.name, "pre-game"));
            //breakShot.style.display = 'flex';
            //victoryShot.style.display = 'flex';
        }
        gameTitle.innerHTML = `Game ${gameNumber}`;
        gameTitle.style.display = 'block';
    } else {
        gameTitle.innerHTML = `Game ${gameNumber}`;
        gameTitle.style.display = 'block';
    }
    
    if (gameSelection == "Wheel") openWheel();
    if (gameSelection == "Choose") openChoosing();
    if (gameSelection == "Vote") openVote();
}

function saveGameState() {
    localStorage.setItem('theGame', JSON.stringify(theGame));
    localStorage.setItem('gamesInfo', JSON.stringify(gamesInfo));
    localStorage.setItem('allPlayers', JSON.stringify(allPlayers));
}

function loadGameState() {
    const game = localStorage.getItem('theGame');
    if (!game) startGoG(true);
    if (game) {
        theGame = JSON.parse(game);
        gamesInfo = JSON.parse(localStorage.getItem('gamesInfo'));
        allPlayers = JSON.parse(localStorage.getItem('allPlayers'));
        gameNumber = theGame.games.length + 1;
        gamesLeft = gamesLeft.filter(g => !theGame.games.find(g2 => g.game == g2.name));
        startGoG(false);
    }
}

async function updateLastLog(newGameData) {
    let logs = JSON.parse(localStorage.getItem('info_logs')) || [];

    if (logs.length > 0) {
        let lastLog = logs[logs.length - 1];

        // Check if the last log matches the current game ID to avoid duplicates
        if (lastLog.id === newGameData.id) {
            logs[logs.length - 1] = newGameData;  // Update existing log
        } else {
            logs.push(newGameData);  // Add new entry if it's a different game
        }
    } else {
        logs.push(newGameData);
    }

    // Save updated logs to localStorage
    localStorage.setItem('info_logs', JSON.stringify(logs));
}

async function updateLastLog(data) {
    let response = await fetch('info_logs.json');
    let logs = await response.json();
    let size = logs.length - 1;
    console.log(data);
    console.log(logs);

    if (size < 0) logs.push(data);
    if (size >= 0) {
        if (logs[size].gog_id == data.gog_id) logs[size] = data;
        if (logs[size].gog_id != data.gog_id) logs.push(data);
    }

    localStorage.setItem('info_logs', JSON.stringify(logs));
}

function saveGoG() {
    localStorage.setItem('theGameResults', JSON.stringify(theGame));
    window.location.href='/';
}

function finishGoG() {
    theGame.status = "complete";
    theGame.finish_time = new Date().toLocaleString();

    theGame.players.forEach(p => {
        theGame.final_results.push({
            name: p.name,
            points: Object.values(p.points).reduce((s, v) => s + v, 0),
            shots: Object.values(p.shots).reduce((s, v) => s + v, 0)
        });
    });

    theGame.final_results.sort((a, b) => {
        const compare = b.points - a.points;
        return compare != 0 ? compare : a.shots - b.shots;
    });

    let currentPlace = 1;
    let extraPlaces = 0;
    theGame.final_results.forEach((r, i, fr) => {
        if (i > 0) {
            if (r.points == fr[i - 1].points && r.shots == fr[i - 1].shots) {
                extraPlaces++;
            } else {
                currentPlace += extraPlaces + 1;
                extraPlaces = 0;
            }
        }
        r.place = currentPlace;
    });

    console.log(theGame);
    localStorage.setItem('theGameResults', JSON.stringify(theGame));
    window.location.href = 'game_results.html';
}

//startGoG();
//window.onload = loadGameState;
loadGameState();
