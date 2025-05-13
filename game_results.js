let theGame = JSON.parse(localStorage.getItem('theGameResults'));
let gamesInfo = JSON.parse(localStorage.getItem('gamesInfo'));
/*console.log(theGame.gog_id);
console.log(theGame.status);
console.log(`${theGame.start_time} to ${theGame.end_time}`);
theGame.variations.forEach(v => { console.log(v); });
theGame.players.forEach(p => { console.log(p); });
console.log(`${theGame.possible_games.length} possible games`);
theGame.games.forEach(g => { console.log(g); });*/
let systems = theGame.systems;
const playedGames = theGame.games.map(g => { return g.name; });
//console.log(playedGames);
console.log(theGame);

const tabTitle = document.getElementById('tab-title');
tabTitle.innerHTML = theGame.gog_id;

const title = document.getElementById('title');
title.innerHTML = `${theGame.gog_id} Results`;
const mainBox = document.getElementById('main-box');

let gold = 'linear-gradient(to right, rgb(191, 149, 63), rgb(252, 246, 186), rgb(179, 135, 40), rgb(251, 245, 183), rgb(170, 119, 28))';
let silver = 'linear-gradient(45deg, rgb(153, 153, 153) 5%, rgb(255, 255, 255) 10%, rgb(204, 204, 204) 30%, rgb(221, 221, 221) 50%, rgb(204, 204, 204) 70%, rgb(255, 255, 255) 80%, rgb(153, 153, 153) 95%)';
let bronze = 'linear-gradient(to right, rgb(205, 127, 50), rgb(229, 180, 126), rgb(168, 109, 40), rgb(217, 160, 103), rgb(139, 78, 19))';
let blue = 'linear-gradient(45deg, rgb(180, 216, 255) 5%, rgb(224, 244, 255) 15%, rgb(160, 198, 230) 35%, rgb(204, 232, 255) 50%, rgb(160, 198, 230) 70%, rgb(224, 244, 255) 85%, rgb(180, 216, 255) 95%)';

// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    General
//

function showResults() {
    createTime();
    createSystems();
    //createGamesNotPlayed();
    createPlayers();
    createGames();
}

function placeColour(place) {
    switch (place) {
        case 1: return gold;
        case 2: return silver;
        case 3: return bronze;
        default: return blue;
    }
}

function header(type, text, game) {
    const header = document.createElement(type);
    header.innerHTML = text;
    if (game) header.style.color = 'black';
    return header;
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Left Box
//

function createTime() {
    const time = document.getElementById('game_time');
    
    const startSplit = splitTime(theGame.start_time);
    const { day: startDay, month: startMonth, year: startYear } = startSplit.date;
    const { hours: startHours, minutes: startMinutes, seconds: startSeconds } = startSplit.time;

    const finishSplit = splitTime(theGame.finish_time);
    const { day: finishDay, month: finishMonth, year: finishYear } = finishSplit.date;
    const { hours: finishHours, minutes: finishMinutes, seconds: finishSeconds } = finishSplit.time;

    let currHours = 0;
    let currMinutes = 0;
    let currSeconds = 0;

    if (startDay != finishDay) currHours += (finishDay - startDay) * 24;
    if (startMonth != finishMonth) currHours += (finishMonth - startMonth) * 30 * 24;
    if (startYear != finishYear) currHours += (finishYear - startYear) * 365 * 24;
    if (startHours != finishHours) currHours += finishHours - startHours;

    if (startMinutes != finishMinutes) currMinutes = finishMinutes - startMinutes;
    if (startMinutes != finishMinutes && currMinutes < 0) currHours--;
    if (startMinutes != finishMinutes && currMinutes < 0) currMinutes += 60;

    if (startSeconds != finishSeconds) currSeconds = finishSeconds - startSeconds;
    if (startSeconds != finishSeconds && currSeconds < 0) currMinutes--;
    if (startSeconds != finishSeconds && currSeconds < 0) currSeconds += 60;

    time.appendChild(header('h2', 'Game Started:'));
    time.appendChild(document.createElement('br'));
    time.appendChild(header('h3', startSplit.dateText));
    time.appendChild(header('h3', startSplit.timeText));
    time.appendChild(document.createElement('br'));

    time.appendChild(header('h2', 'Game Finished:'));
    time.appendChild(document.createElement('br'));
    time.appendChild(header('h3', finishSplit.dateText));
    time.appendChild(header('h3', finishSplit.timeText));
    time.appendChild(document.createElement('br'));

    time.appendChild(header('h2', 'Game Length:'));
    time.appendChild(document.createElement('br'));
    time.appendChild(header('h3', `${currHours} hours`));
    time.appendChild(header('h3', `${currMinutes} minutes ${currSeconds} seconds`));
    time.appendChild(document.createElement('br'));
}

function splitTime(givenTime) {
    const dateParts = givenTime.split(", ")[0].split("/");
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);

    const timeParts = givenTime.split(", ")[1].split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);

    const date = { day, month, year };
    const time = { hours, minutes, seconds };
    const newDate = new Date(year, month, day, hours, minutes, seconds);
    const dateText = `${day} ${newDate.toLocaleString('default', { month: 'long' })} ${year}`;
    let timeText = "";
    timeText += hours == 0 ? "12" : hours <= 12 ? `${hours}` : `${hours - 12}`;
    timeText += minutes < 10 ? `:0${minutes}` : `:${minutes}`;
    timeText += seconds < 10 ? `:0${seconds}` : `:${seconds}`;
    timeText += hours < 12 ? " am" : " pm";

    return { date, time, dateText, timeText };
}

function createSystems() {
    const systemDiv = document.getElementById('game_systems');

    systemDiv.appendChild(header('h2', 'Points System:'));
    systemDiv.appendChild(document.createElement('br'));
    systemDiv.appendChild(header('h3', `${systems.points}`));
    systemDiv.appendChild(document.createElement('br'));

    systemDiv.appendChild(header('h2', 'Game Selection System:'));
    systemDiv.appendChild(document.createElement('br'));
    systemDiv.appendChild(header('h3', `${systems.games}`));
    systemDiv.appendChild(document.createElement('br'));
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Middle Box
//

function generateResults() {
    let results = [];

    theGame.players.forEach(p => {
        let points = 0;
        Object.values(p.points).forEach(point => { points += point; });
        let shots = 0;
        Object.values(p.shots).forEach(shot => { shots += shot; });
        results.push({ name: p.name, points, shots });
    });

    results.sort((a, b) => {
        const points = b.points - a.points;
        const shots = a.shots - b.shots;
        return points != 0 ? points : shots != 0 ? shots : a.name.localeCompare(b.name);
    });

    let currentPlace = 1;
    let extraPlaces = 0;
    results.forEach((r, i) => {
        if (i != 0) {
            if (r.points == results[i - 1].points && r.shots == results[i - 1].shots) {
                extraPlaces++;
            } else {
                currentPlace += extraPlaces + 1;
                extraPlaces = 0;
            }
        }
        r.place = currentPlace;
    });

    /*results.forEach(r => {
        console.log(r);
    });*/

    return results;
}

function createPlayers() {
    const results = generateResults();
    
    const playersDiv = document.getElementById('game_players');

    results.forEach(r => {
        const div = document.createElement('div');
        div.className = 'box';
        div.style.background = placeColour(r.place);
        const place = r.place == 1 ? `1st` : r.place == 2 ? `2nd` : r.place == 3 ? `3rd` : `${r.place}th`;
        div.appendChild(header('h3', `${place} - ${r.name}`));

        div.appendChild(document.createElement('br'));
        const points = r.points == 1 ? `1 point` : `${r.points} points`;
        div.appendChild(header('h3', `${points}`));
        if (systems.points == "Points & Shots") {
            const shots = r.shots == 1 ? `1 shot` : `${r.shots} shots`;
            div.appendChild(header('h3', `${shots}`));
        }

        const games = document.getElementById('game_games_played');
        const breakdown = document.getElementById('game_breakdown');
        const player = theGame.players.find(p => { return p.name == r.name });

        div.addEventListener("click", () => {
            if (breakdown.innerHTML != '' && breakdown.firstChild.id == r.name) {
                breakdown.innerHTML = '';
                breakdown.style.display = 'none';
                games.style.display = 'block';
            } else {
                breakdown.innerHTML = '';
                breakdown.appendChild(createPlayer(r, player));
                breakdown.style.display = 'flex';
                games.style.display = 'none';
            }
        });

        playersDiv.appendChild(div);
    });
}

function createPlayer(result, player) {
    const section = document.createElement('div');
    section.className = 'breakdown-section';
    section.id = `${result.name}`;

    const playerBox = document.createElement('div');
    playerBox.className = 'box';
    playerBox.style.background = placeColour(result.place);
    const place = result.place == 1 ? `1st` : result.place == 2 ? `2nd` : result.place == 3 ? `3rd` : `${result.place}th`;
    playerBox.appendChild(header('h3', `${place} - ${result.name}`));
    section.appendChild(playerBox);

    if (systems.speciality != 0) {
        section.appendChild(header('h2', '<br>Specialty Games:', true));

        const specialityRow = document.createElement('div');
        specialityRow.className = 'breakdown-row';
        player.speciality.forEach(g => {
            const speciality = document.createElement('div');
            speciality.className = 'speciality-box';
            speciality.style.background = blue;
            speciality.appendChild(header('h3', `${g}:`));

            let game = theGame.games.find(p => p.name == g);
            if (game) {
                const currResult = game.results.find(r => r.name == result.name);
                if (currResult.place == 1) speciality.appendChild(header('h4', "Won"));
                if (currResult.place != 1) speciality.appendChild(header('h4', "Lost"));
            } else {
                speciality.appendChild(header('h4', "Not Played"));
            }

            specialityRow.appendChild(speciality);
        });
        section.appendChild(specialityRow);
    }  

    /*if (systems.points == "Points & Shots") {
        section.appendChild(header('h2', '<br>Points:', true));

        
    } else if (systems.points == "Just Points") {
        
    } else {
        console.log(systems.points);
    }*/
    const wheel = systems.games == "Wheel";
    const shots = systems.points == "Points & Shots";

    createPoints(section, player, shots);
    if (shots) createShots(section, player, theGame.players.length > 3, wheel);
    createCards(section, player, wheel, shots);

    return section;
}

function createPoints(section, player, shots) {
    section.appendChild(header('h2', '<br>Points:', true));

    if (shots) {
        const pointsRow = document.createElement('div');
        pointsRow.className = 'breakdown-row';
        Object.entries(player.points).filter((_, i) => i < 2).forEach(([key, value]) => {
            console.log(key, value);
            const points = document.createElement('div');
            points.className = 'breakdown-box';
            points.style.background = blue;
            if (key == "g_point") points.appendChild(header('h3', "Game<br>Points:"));
            if (key == "c_point") points.appendChild(header('h3', "Coin Flip<br>Points:"));
            points.appendChild(header('h3', value));
            pointsRow.appendChild(points);
        });
        section.appendChild(pointsRow);

        section.appendChild(document.createElement('br'));

        const pointsRow2 = document.createElement('div');
        pointsRow2.className = 'breakdown-row';
        Object.entries(player.points).filter((_, i) => i >= 2).forEach(([key, value]) => {
            const points = document.createElement('div');
            points.className = 'breakdown-box';
            points.style.background = blue;
            let newValue = value;
            if (key == "special_w_point") points.appendChild(header('h3', "Speciality Points<br>Won:"));
            if (key == "special_l_point") points.appendChild(header('h3', "Speciality Points<br>Lost:"));
            if (key == "special_l_point") newValue = -value;
            points.appendChild(header('h3', newValue));
            pointsRow2.appendChild(points);
        });
        section.appendChild(pointsRow2);
    } else {
        const pointsRow = document.createElement('div');
        pointsRow.className = 'breakdown-row';
        Object.entries(player.points).filter((_, i) => {
            return i == 0 || i == 2 || i == 3;
        }).forEach(([key, value]) => {
            const points = document.createElement('div');
            points.className = 'breakdown-box';
            points.style.background = blue;
            console.log(key);
            let newValue = value;
            if (key == "g_point") points.appendChild(header('h3', "Game<br>Points:"));
            if (key == "special_w_point") points.appendChild(header('h3', "Speciality Points<br>Won:"));
            if (key == "special_l_point") points.appendChild(header('h3', "Speciality Points<br>Lost:"));
            if (key == "special_l_point") newValue = -value;
            points.appendChild(header('h3', newValue));
            pointsRow.appendChild(points);
        });
        section.appendChild(pointsRow);
    }
}

function createShots(section, player, coin, wheel) {
    const shotMapping = {
        pg_shot: 'Break<br>Shots:',
        l_shot: 'Losing<br>Shots:',
        c_shot: 'Coin Flip<br>Shots:',
        w_shot: 'Wheel<br>Shots:',
        v_shot: 'Victory<br>Shots:'
    };

    const shotFilter = (index) => {
        if (coin && wheel) return index < 6;
        if (!coin && wheel) return index != 3;
        if (coin && !wheel) return index != 4;
        return index <= 2 || index == 5;
    };

    const createShotRow = (filterFn) => {
        const shotsRow = document.createElement('div');
        shotsRow.className = 'breakdown-row';

        Object.entries(player.shots)
            .filter(([_, __], index) => filterFn(index))
            .forEach(([key, value]) => {
                const shots = document.createElement('div');
                shots.className = 'breakdown-box';
                shots.style.background = blue;
                if (shotMapping[key]) shots.appendChild(header('h3', shotMapping[key]));
                shots.appendChild(header('h3', value));
                shotsRow.appendChild(shots);
            });

        return shotsRow;
    };

    section.appendChild(header('h2', '<br>Shots:', true));

    const firstRow = createShotRow((index) => shotFilter(index) && index < 3);
    section.appendChild(firstRow);

    section.appendChild(document.createElement('br'));

    const secondRow = createShotRow((index) => shotFilter(index) && index >= 3);
    section.appendChild(secondRow);
}

function createCards(section, player, neigh, gooc) {
    if (neigh || gooc) section.appendChild(header('h2', '<br>Cards:', true));
    
    if (neigh) {
        const cardsRow = document.createElement('div');
        cardsRow.className = 'breakdown-row';
        Object.entries(player.cards).filter((_, i) => i < 2).forEach(([key, value]) => {
            const cards = document.createElement('div');
            cards.className = 'breakdown-box';
            cards.style.background = blue;
            if (key == "neigh") cards.appendChild(header('h3', "Neigh Cards<br>Used:"));
            if (key == "super_neigh") cards.appendChild(header('h3', "Super Neigh Cards<br>Used:"));
            cards.appendChild(header('h3', 2 - value));
            cardsRow.appendChild(cards);
        });
        section.appendChild(cardsRow);
    }

    if (neigh && gooc) section.appendChild(document.createElement('br'));

    if (gooc) {
        const cardsRow = document.createElement('div');
        cardsRow.className = 'breakdown-row';
        Object.entries(player.cards).filter((_, i) => i >= 2).forEach(([key, value]) => {
            const cards = document.createElement('div');
            cards.className = 'breakdown-box';
            cards.style.background = blue;
            if (key == "gooc_total") cards.appendChild(header('h3', 'GooC Cards<br>Earned:'));
            if (key == "gooc_used") cards.appendChild(header('h3', 'GooC Cards<br>Used:'));
            cards.appendChild(header('h3', value));
            cardsRow.appendChild(cards);
        });
        section.appendChild(cardsRow);
    }
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Right Box
//

function createGames() {
    //const allGamesDiv = document.getElementById('game_games_played');
    const chooseGame = document.getElementById('choose_game');
    const showGameDiv = document.getElementById('show_game');

    if (theGame.possible_games.length <= 4) {
        chooseGame.style.justifyContent = 'space-evenly';
    }
    
    theGame.games.forEach((game, index) => {
        const currGame = document.createElement('div');
        currGame.id = `game_${index + 1}`;
        currGame.className = 'currGame';
        currGame.style.display = 'none';
        createGame(currGame, game, index + 1);
        showGameDiv.appendChild(currGame);
        
        const gameDiv = document.createElement('div');
        gameDiv.id = `game_${index}_option`;
        gameDiv.className = 'game-box';
        gameDiv.style.background = blue;

        gameDiv.appendChild(header('h2', `Game ${index + 1}:`, true));
        gameDiv.appendChild(document.createElement('br'));
        gameDiv.appendChild(header('h3', `${game.name}`));
        gameDiv.addEventListener("click", () => { showGame(game) });

        chooseGame.appendChild(gameDiv);

        game.after.forEach(curr => {
            const currDiv = document.createElement('div');
            currDiv.className = 'after-box';
            currDiv.style.background = 'white';
            currDiv.appendChild(header('h3', curr));
            chooseGame.appendChild(currDiv);
        });
    });

    /*const gamesNotPlayed = theGame.possible_games.filter(g => { return !playedGames.includes(g); });
    gamesNotPlayed.forEach((g, i) => {
        const gameDiv = document.createElement('div');
        gameDiv.id = `game_${i}`;
        gameDiv.className = 'game-box';
        gameDiv.style.display = 'flex';
        gameDiv.style.flexDirection = 'column';
        gameDiv.style.verticalAlign = 'middle';
        gameDiv.style.cursor = 'default';
        gameDiv.appendChild(header('h3', g));
        chooseGame.appendChild(gameDiv);
    });*/
}

function createGame(div, game, gameNum) {
    const gameHeader = header('h1', `Game ${gameNum} - ${game.name}`);
    div.appendChild(gameHeader);
    //console.log(`Game ${gameNum}`);
    //console.log(game);
    const specialityPlayers = theGame.players.filter(p => p.speciality.includes(game.name)).map(p => p.name);
    if (specialityPlayers.length != 0) {
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
        //console.log(text);
        const title = header('h2', text, true);
        title.id = 'specialityTitle';
        title.style.display = 'flex';
        gameHeader.after(title);
    }
    let gameInfo = gamesInfo.find(g => { return g.game == game.name });

    const gamePlayers = document.createElement('div');
    gamePlayers.id = 'gamePlayers';
    game.results.forEach(r => {
        const playerDiv = document.createElement('div');
        playerDiv.id = `${r.name}_result`;
        playerDiv.className = 'box';
        playerDiv.style.background = placeColour(r.place);
        
        playerDiv.appendChild(header('h3', `${r.name}`));
        playerDiv.appendChild(document.createElement('br'));
        
        if (gameInfo.game == "Mario Party") {
            playerDiv.appendChild(header('h3', "Game:"));
            playerDiv.appendChild(header('h4', `${r.stars} stars`));
            playerDiv.appendChild(header('h4', `${r.coins} coins`));
        } else if (gameInfo.game == "Betrayal") {
            //console.log("Nothing with betrayal");
        } else if (gameInfo.results == "table") {
            playerDiv.appendChild(header('h3', "Game:"));
            playerDiv.appendChild(header('h4', `${r.points} points`));
        } else if (gameInfo.results == "knockout") {
            //console.log("Nothing with knockout");
        } else if (gameInfo.results == "single") {
            //console.log("Nothing with single");
        } else if (gameInfo.results == "team") {
            //console.log("Nothing with team");
        } else if (gameInfo.results == "tournament") {
            //console.log("Nothing with tournament");
        } else if (gameInfo.results == "multiple") {
            //console.log("Nothing with multiple");
        } else {
            console.error(`Error with game: ${gameInfo.game}`);
        }
        playerDiv.appendChild(document.createElement('br'));
        playerDiv.appendChild(header('h3', "Reward:"));
        playerDiv.appendChild(header('h4', `${r.reward}`));

        gamePlayers.appendChild(playerDiv);
    });

    div.appendChild(gamePlayers);
}

function showGame(game) {
    //console.log(game);
    const showGameDiv = document.getElementById('show_game');
    Array.from(showGameDiv.children).forEach(g => {
        g.style.display = g.id == game.game_id ? 'flex' : 'none';
    });
}

showResults();
