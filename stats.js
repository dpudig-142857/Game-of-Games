const leftPlayersDiv = document.getElementById('left-players');
const leftGamesDiv = document.getElementById('left-games');

const rightPlayerDiv = document.getElementById('right-player');
const playerNameDiv = document.getElementById('player-name');
const playerPlayedDiv = document.getElementById('player-played');
const playerChanceDiv = document.getElementById('player-chance');
const playerPlacesDiv = document.getElementById('player-places');
const playerIntrudeDiv = document.getElementById('player-intrude');
const playerAbandonDiv = document.getElementById('player-abandon');
const playerOverallShotDiv = document.getElementById('player-overall-shots');
const playerShotDiv = document.getElementById('player-shots');
const playerOverallPointDiv = document.getElementById('player-overall-points');
const playerPointDiv = document.getElementById('player-points');
const playerCardDiv = document.getElementById('player-cards');
const playerGamePlayedDiv = document.getElementById('player-games-played');
const playerGameWonDiv = document.getElementById('player-games-won');
const playerGameLostDiv = document.getElementById('player-games-lost');
const playerGameChanceDiv = document.getElementById('player-games-chance');
const playerGamesDiv = document.getElementById('player-games');

const rightGameDiv = document.getElementById('right-game');
const gameNameDiv = document.getElementById('game-name');
const gamePlayedDiv = document.getElementById('game-played');
const gameChanceDiv = document.getElementById('game-chance');
const gameNeighDiv = document.getElementById('game-neigh');
const gameSuperDiv = document.getElementById('game-super');
const gamePlayersDiv = document.getElementById('game-players');

const rightTotalDiv = document.getElementById('right-total');
const totalGoGDiv = document.getElementById('total-gog');
const totalGameDiv = document.getElementById('total-games');
const totalPlayerDiv = document.getElementById('total-player');
const totalPlayersDiv = document.getElementById('total-players');
const totalShotDiv = document.getElementById('total-shots');
const totalPointDiv = document.getElementById('total-points');
const totalCardDiv = document.getElementById('total-cards');
const totalLogDiv = document.getElementById('total-logs');

let allPlayers = [];
let allGames = [];
let logs = [];

let playersStats = [];
let gamesStats = [];
let totalStats = {};

function typeText(type) {
    if (type == "overall_shot") return "Overall Shots:";
    if (type == "pg_shot") return "Pre-Game/Break Shots:";
    if (type == "l_shot") return "Losing Shots:";
    if (type == "c_shot") return "Coin Flip Shots:";
    if (type == "w_shot") return "Wheel Shots:";
    if (type == "v_shot") return "Victory Shots:";

    if (type == "overall_point") return "Overall Points:";
    if (type == "g_point") return "Game Points:";
    if (type == "c_point") return "Coin Flip Points:";
    if (type == "special_w_point") return "Speciality Points won:";
    if (type == "special_l_point") return "Speciality Points lost:";

    if (type == "neigh") return "Neigh Cards used:";
    if (type == "super_neigh") return "Super Neigh Cards used:";
    if (type == "gooc_total") return "GooC Cards earned:";
    if (type == "gooc_used") return "GooC Cards used:";

    if (type == "overall_game") return "Games:";
    if (type == "overall_player") return "Players:"

    return "";
}

function divide(a, b) {
    return parseFloat((a / b).toFixed(2));
}

function percentage(a, b) {
    return parseInt((a / b).toFixed(2) * 100) || 0;
}

function gamesText(num) {
    if (num == 1) return "1 game";
    return `${num} games`;
}

function times(num) {
    if (num == 0) return "Never";
    if (num == 1) return "1 time";
    return `${num} times`;
}

function header(type, text) {
    const header = document.createElement(type);
    header.innerHTML = text;
    return header;
}

// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                     Initialise
//

async function initialise() {
    const overallResponse = await fetch('./info_overall.json');
    const overall = await overallResponse.json();
    const logsResponse = await fetch('./info_logs.json');
    
    allPlayers = overall.allPlayers;
    allGames = Object.values(overall.allGames).flat();
    logs = await logsResponse.json();

    allPlayers.forEach(p => playersStats.push(generatePlayerStats(p)));
    allGames.forEach(g => gamesStats.push(generateGameStats(g)));
    totalStats = generateTotalStats();

    resetDivs("");
}

function resetDivs(type) {
    leftPlayersDiv.style.display = type == "player" ? 'flex' : 'none';
    leftGamesDiv.style.display = type == "game" ? 'flex' : 'none';
    rightPlayerDiv.style.display = 'none';
    rightGameDiv.style.display = 'none';
    rightTotalDiv.style.display = type == "total" ? 'flex' : 'none';
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Player Stats
//

function generatePlayerStats(player) {
    const curr = {
        name: player,                           // Name of player
        played: 0,                              // Number of GoG that have been played
        win_perc: 0,                            // Win percentage of GoG
        places: [],                             // Number of times for each place
        intruded: 0,                            // Number of times intruded into a GoG
        abandoned: 0,                           // Number of times abandoned a GoG
        overall_shot: 0,                        // Total number of shots done
        avg_shot: 0,                            // Average number of total shots per GoG
        highest_shot: [{ gog: "", num: 0 }],    // Highest number of total shots from one GoG
        shot_info: [],                          // Info for each type of shot
        overall_point: 0,                       // Total number of points earned
        avg_point: 0,                           // Average number of total points per GoG
        highest_point: [{ gog: "", num: 0 }],   // Highest number of total points from one GoG
        point_info: [],                         // Info for each type of point
        card_info: [],                          // Info for each type of card
        played_games: 0,                        // Total number of games played
        won_games: 0,                           // Total number of games won
        lost_games: 0,                          // Total number of games lost
        win_perc_games: 0,                      // Percentage that the player will win a game
        games: []                               // Info about each game below, outlined below:
    };
    const shotTypes = [ "pg_shot", "l_shot", "c_shot", "w_shot", "v_shot"];
    shotTypes.forEach(type => {
        curr.shot_info.push({
            type,                               // Type of shot
            total: 0,                           // Total number of this type of shot
            avg: 0,                             // Average number of this type of shot per GoG
            highest: [{ gog: "", num: 0 }]      // Highest number of this type of shot in one GoG
        });
    });
    const pointTypes = [ "g_point", "c_point", "special_w_point", "special_l_point" ];
    pointTypes.forEach(type => {
        curr.point_info.push({
            type,                               // Type of point
            total: 0,                           // Total number of this type of point
            avg: 0,                             // Average number of this type of point per GoG
            highest: [{ gog: "", num: 0 }]      // Highest number of this type of point in one GoG
        });
    });
    const cardTypes = [ "neigh", "super_neigh", "gooc_total", "gooc_used"];
    cardTypes.forEach(type => {
        curr.card_info.push({
            type,                               // Type of card
            total: 0,                           // Total number of this type of card
            avg: 0,                             // Average number of this type of card per GoG
            highest: [{ gog: "", num: 0 }]      // Highest number of this type of card in one GoG
        });
    });
    allPlayers.forEach((_, i) => {
        const place = i == 0 ? "1st" : i == 1 ? "2nd" : i == 2 ? "3rd" : `${i + 1}th`;
        curr.places.push({
            place_num: i + 1,                   // Place as number
            place,                              // Place
            total: 0                            // Number of times for the place
        });
    });
    allGames.forEach(g => {
        curr.games.push({
            name: g,                            // Name of game
            played: 0,                          // Number of times the game has been played
            won: 0,                             // Number of times the game has been won
            lost: 0,                            // Number of times the game has been lost
            win_perc: 0,                        // Percentage of win in this game
            neigh: 0,                           // Number of times the game has been neighed
            super_neigh: 0,                     // Number of times the game has been super neighed
            speciality_chosen: 0,               // Number of times they have chosen the game as a speciality
            speciality_won: 0,                  // Number of times they have won the game as a speciality
            speciality_lost: 0                  // Number of times they have lost the game as a speciality
        });
    });

    logs.forEach(log => {
        const result = log.final_results.find(r => r.name == player);
        if (result) {
            let place = curr.places.find(p => p.place_num == result.place);
            if (place) place.total++;
        }
        
        const playerStats = log.players.find(p => p.name == player);
        if (playerStats) {
            curr.played++;
            
            let currShots = 0;
            Object.entries(playerStats.shots).forEach(([key, value]) => {
                let info = curr.shot_info.find(i => i.type == key);
                info.total += value;
                if (value > info.highest[0].num) {
                    info.highest = [{ gog: log.gog_id, num: value }];
                } else if (value == info.highest[0].num) {
                    info.highest.push({ gog: log.gog_id, num: value });
                }

                currShots += value;
            });
            curr.overall_shot += currShots;
            if (currShots > curr.highest_shot[0].num) {
                curr.highest_shot = [{ gog: log.gog_id, num: currShots }];
            } else if (currShots == curr.highest_shot[0].num) {
                curr.highest_shot.push({ gog: log.gog_id, num: currShots });
            }

            let currPoints = 0;
            Object.entries(playerStats.points).forEach(([key, value]) => {
                let info = curr.point_info.find(i => i.type == key);
                info.total += value;
                const compare = key == "special_l_point" ? (a, b) => a < b : (a, b) => a > b;
                if (compare(value, info.highest[0].num)) {
                    info.highest = [{ gog: log.gog_id, num: value }];
                } else if (value == info.highest[0].num) {
                    info.highest.push({ gog: log.gog_id, num: value });
                }

                currPoints += value;
            });
            curr.overall_point += currPoints;
            if (currPoints > curr.highest_point[0].num) {
                curr.highest_point = [{ gog: log.gog_id, num: currPoints }];
            } else if (currPoints == curr.highest_point[0].num) {
                curr.highest_point.push({ gog: log.gog_id, num: currPoints });
            }

            Object.entries(playerStats.cards).forEach(([key, value]) => {
                let info = curr.card_info.find(i => i.type == key);
                let numCard = (key == "neigh" || key == "super_neigh") ? 2 - value : value; 
                info.total += numCard;
                if (numCard > info.highest[0].num) {
                    info.highest = [{ gog: log.gog_id, num: numCard }];
                } else if (numCard == info.highest[0].num) {
                    info.highest.push({ gog: log.gog_id, num: numCard });
                }
            });

            playerStats.speciality.forEach(game => {
                let gameInfo = curr.games.find(g => g.name == game);
                gameInfo.speciality_chosen++;
            });
        }
        if (log.intruded.find(p => p == player)) curr.intruded++;
        if (log.abandoned.find(p => p == player)) curr.abandoned++;
        log.games.forEach(game => {
            const result = game.results.find(r => r.name == player);
            if (result) {
                let gameInfo = curr.games.find(g => g.name == game.name);
                curr.played_games++;
                gameInfo.played++;
                if (result.place == 1) {
                    curr.won_games++;
                    gameInfo.won++;
                    if (game.speciality.includes(player)) gameInfo.speciality_won++;
                } else {
                    curr.lost_games++;
                    gameInfo.lost++;
                    if (game.speciality.includes(player)) gameInfo.speciality_lost++;
                }
            }
            
            game.after.forEach(a => {
                if (a.includes("SUPER NEIGHED")) {
                    const neigh = a.split(" SUPER NEIGHED ");
                    if (neigh[0] == player && !neigh[1].includes("Neigh")) {
                        curr.games.find(g => g.name == neigh[1]).super_neigh++;
                    }
                } else if (a.includes("NEIGHED")) {
                    const neigh = a.split(" NEIGHED ");
                    if (neigh[0] == player && !neigh[1].includes("Neigh")) {
                        curr.games.find(g => g.name == neigh[1]).neigh++;
                    }
                }
            });
        });
    });
    curr.win_perc = percentage(curr.places[0].total, logs.length);
    curr.avg_shot = divide(curr.overall_shot, logs.length);
    curr.avg_point = divide(curr.overall_point, logs.length);
    curr.win_perc_games = percentage(curr.won_games, curr.played_games);
    curr.shot_info.forEach(i => i.avg = divide(i.total, logs.length));
    curr.point_info.forEach(i => i.avg = divide(i.total, logs.length));
    curr.card_info.forEach(i => i.avg = divide(i.total, logs.length));
    curr.games.forEach(g => g.win_perc = percentage(g.won, g.played));

    return curr;
}

function showPlayers() {
    if (leftPlayersDiv.style.display != 'none') {
        leftPlayersDiv.style.display = 'none';
        rightPlayerDiv.style.display = 'none';
        return;
    }
    leftPlayersDiv.innerHTML = '';

    //console.log(allPlayers);
    allPlayers.forEach((p, i) => {
        leftPlayersDiv.appendChild(createPlayerBox(p));
        if (i == allPlayers.length - 1) {
            leftPlayersDiv.appendChild(document.createElement('br'));
        }
    });

    resetDivs("player");
}

function createPlayerBox(player) {
    const stats = playersStats.find(p => p.name == player);

    const div = document.createElement('div');
    div.className = 'left-box';
    div.appendChild(header('h3', player));

    div.addEventListener("click", () => {
        if (playerNameDiv.className == stats.name) rightPlayerDiv.style.display = 'none';
        
        playerNameDiv.innerHTML = '';
        playerNameDiv.className = stats.name;
        playerNameDiv.appendChild(header('h1', `${stats.name}'s Stats`));

        playerPlayedDiv.innerHTML = '';
        playerPlayedDiv.appendChild(header('h3', `Played: ${times(stats.played)}`));

        playerChanceDiv.innerHTML = '';
        playerChanceDiv.appendChild(header('h3', `Chance: ${stats.win_perc}%`));

        playerPlacesDiv.innerHTML = '';
        stats.places.forEach(p => {
            const div = document.createElement('div');
            div.className = 'right-game-box';
            div.appendChild(header('h3', `Earned ${p.place}: ${times(p.total)}`));
            playerPlacesDiv.appendChild(div);
        });

        playerIntrudeDiv.innerHTML = '';
        playerIntrudeDiv.appendChild(header('h3', `Intruded: ${times(stats.intruded)}`));

        playerAbandonDiv.innerHTML = '';
        playerAbandonDiv.appendChild(header('h3', `Abandoned: ${times(stats.abandoned)}`));

        playerShotDiv.innerHTML = '';
        playerShotDiv.appendChild(createStat(
            "overall_shot",
            stats.overall_shot,
            stats.avg_shot,
            stats.highest_shot
        ));
        stats.shot_info.forEach(i => {
            playerShotDiv.appendChild(createStat(i.type, i.total, i.avg, i.highest));
        });

        playerPointDiv.innerHTML = '';
        playerPointDiv.appendChild(createStat(
            "overall_point",
            stats.overall_point,
            stats.avg_point,
            stats.highest_point
        ));
        stats.point_info.forEach(i => {
            playerPointDiv.appendChild(createStat(i.type, i.total, i.avg, i.highest));
        });

        playerCardDiv.innerHTML = '';
        stats.card_info.forEach(i => {
            playerCardDiv.appendChild(createStat(i.type, i.total, i.avg, i.highest));
        });

        playerGamePlayedDiv.innerHTML = '';
        const played = `Played: ${gamesText(stats.played_games)}`;
        playerGamePlayedDiv.appendChild(header('h3', `${played}`));

        playerGameWonDiv.innerHTML = '';
        const won = `Won: ${gamesText(stats.won_games)}`;
        playerGameWonDiv.appendChild(header('h3', `${won}`));

        playerGameLostDiv.innerHTML = '';
        const lost = `Lost: ${gamesText(stats.lost_games)}`;
        playerGameLostDiv.appendChild(header('h3', `${lost}`));

        playerGameChanceDiv.innerHTML = '';
        const win_perc = `Win Percentage: ${stats.win_perc_games}%`;
        playerGameChanceDiv.appendChild(header('h3', `${win_perc}`));

        playerGamesDiv.innerHTML = '';
        stats.games.forEach(g => {
            const game = document.createElement('div');
            game.className = 'right-game-box';
            game.appendChild(header('h3', g.name));
            game.appendChild(document.createElement('br'));
            
            const infoDiv = document.createElement('div');
            infoDiv.id = 'game-player-info';
            infoDiv.appendChild(header('p', `<strong>Played:</strong> ${times(g.played)}`));
            infoDiv.appendChild(header('p', `<strong>Won:</strong> ${times(g.won)}`));
            infoDiv.appendChild(header('p', `<strong>Lost:</strong> ${times(g.lost)}`));
            infoDiv.appendChild(header('p', `<strong>Win Percentage:</strong> ${g.win_perc}%`));
            infoDiv.appendChild(header('p', `<strong>Neighed:</strong> ${times(g.neigh)}`));
            infoDiv.appendChild(header('p', `<strong>Super Neighed:</strong> ${times(g.super_neigh)}`));
            infoDiv.appendChild(header('p', `<strong>Chosen as Speciality:</strong> ${times(g.speciality_chosen)}`));
            infoDiv.appendChild(header('p', `<strong>Won Speciality:</strong> ${times(g.speciality_won)}`));
            infoDiv.appendChild(header('p', `<strong>Lost Speciality:</strong> ${times(g.speciality_lost)}`));
            game.appendChild(infoDiv);

            playerGamesDiv.appendChild(game);
        });

        rightPlayerDiv.style.display = 'flex';
    });

    return div;
}

function createStat(type, total, avg, highest) {
    const div = document.createElement('div');
    div.id = type;
    div.className = 'right-game-box';
    
    div.appendChild(header('h3', typeText(type)));
    div.appendChild(document.createElement('br'));
    div.appendChild(header('p', `<strong>Total:</strong> ${total}`));
    if (total != 0) div.appendChild(header('p', `<strong>Average:</strong> ${avg}`));
    if (total != 0 && highest[0].num != 0) {
        let highestText = `<strong>Highest:</strong> ${highest[0].num} in `;
        const g = highest.map(h => h.gog.split("No. ")[1]);
        if (g.length == 1) highestText += `GoG ${g[0]}`;
        if (g.length >= 2) highestText += `GoGs ${g.join(', ')}`;
        div.appendChild(header('p', highestText));
    }

    return div;
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Game Stats
//

function generateGameStats(game) {
    const curr = {
        name: game,                 // Name of game
        played: 0,                  // Number of times played in a GoG
        chance: 0,                  // Average of playing a game in a GoG
        neigh: 0,                   // Number of times the game has been neighed
        super_neigh: 0,             // Number of times the game has been super neighed
        players: []                 // Info about each player below, outlined below:
    }
    allPlayers.forEach(p => {
        curr.players.push({
            name: p,                // Name of player
            played: 0,              // Number of times they have played this game
            won: 0,                 // Number of times they have won the game
            lost: 0,                // Number of times they have lost the game
            win_perc: 0,            // Percentage that they will win the game
            neigh: 0,               // Number of times they neighed the game
            super_neigh: 0,         // Number of times they super neighed the game
            speciality_chosen: 0,   // Number of times they have chosen the game as a speciality
            speciality_won: 0,      // Number of times they have won the game as a speciality
            speciality_lost: 0      // Number of times they have lost the game as a speciality
        });
    });
    logs.forEach(log => {
        log.players.forEach(p => {
            if (p.speciality.find(s => s == game)) {
                let currPlayer = curr.players.find(p2 => p.name == p2.name);
                currPlayer.speciality_chosen++;
            }
        });
        const playedGame = log.games.find(g => g.name == game);
        if (playedGame) {
            curr.played++;
            playedGame.results.forEach(r => {
                let currPlayer = curr.players.find(p => p.name == r.name);
                currPlayer.played++;
                if (r.place == 1) currPlayer.won++;
                if (r.place != 1) currPlayer.lost++;
            });
            playedGame.speciality.forEach(s => {
                let currPlayer = curr.players.find(p => p.name == s);
                let result = playedGame.results.find(r => r.name == s);
                if (result.place == 1) currPlayer.speciality_won++;
                if (result.place != 1) currPlayer.speciality_lost++;
            });
        }
        log.games.forEach(g => g.after.forEach(a => {
            if (a.includes("SUPER NEIGHED")) {
                const neigh = a.split(" SUPER NEIGHED ");
                if (neigh[1] == game) {
                    curr.players.find(p => p.name == neigh[0]).super_neigh++;
                    curr.super_neigh++;
                }
            } else if (a.includes("NEIGHED")) {
                const neigh = a.split(" NEIGHED ");
                if (neigh[1] == game) {
                    curr.players.find(p => p.name == neigh[0]).neigh++;
                    curr.neigh++;
                }
            }
        }));
    });
    curr.players.forEach(p => p.win_perc = percentage(p.won, p.played));
    curr.chance = percentage(curr.played, logs.length);
    curr.players.sort((a, b) => {
        const comparePerc = b.win_perc - a.win_perc;
        const comparePlayed = b.played - a.played;
        return comparePerc != 0 ? comparePerc :
                comparePlayed != 0 ? comparePlayed :
                a.name.localeCompare(b.name);
    });
    
    return curr;
}

function showGames() {
    if (leftGamesDiv.style.display != 'none') {
        leftGamesDiv.style.display = 'none';
        rightGameDiv.style.display = 'none';
        return;
    }
    leftGamesDiv.innerHTML = '';

    allGames.forEach((g, i) => {
        leftGamesDiv.appendChild(createGameBox(g));
        if (i == allGames.length - 1) {
            leftGamesDiv.appendChild(document.createElement('br'));
        }
    });

    resetDivs("game");
}

function createGameBox(game) {
    const stats = gamesStats.find(g => g.name == game);

    const div = document.createElement('div');
    div.className = 'left-box';
    div.appendChild(header('h3', game));

    div.addEventListener("click", () => {
        if (gameNameDiv.className == stats.name) rightGameDiv.style.display = 'none';
        
        gameNameDiv.innerHTML = '';
        gameNameDiv.className = stats.name;
        gameNameDiv.appendChild(header('h1', `${stats.name}'s Stats`));

        gamePlayedDiv.innerHTML = '';
        gamePlayedDiv.appendChild(header('h3', `Played: ${times(stats.played)}`));

        gameChanceDiv.innerHTML = '';
        gameChanceDiv.appendChild(header('h3', `Chance: ${stats.chance}%`));

        gameNeighDiv.innerHTML = '';
        gameNeighDiv.appendChild(header('h3', `Neighed: ${times(stats.neigh)}`));

        gameSuperDiv.innerHTML = '';
        gameSuperDiv.appendChild(header('h3', `Super Neighed: ${times(stats.super_neigh)}`));
        
        gamePlayersDiv.innerHTML = '';
        stats.players.forEach(p => {
            const player = document.createElement('div');
            player.className = 'right-player-box';
            player.appendChild(header('h3', p.name));
            player.appendChild(document.createElement('br'));
            
            const infoDiv = document.createElement('div');
            infoDiv.id = 'game-player-info';
            infoDiv.appendChild(header('p', `<strong>Played:</strong> ${times(p.played)}`));
            infoDiv.appendChild(header('p', `<strong>Won:</strong> ${times(p.won)}`));
            infoDiv.appendChild(header('p', `<strong>Lost:</strong> ${times(p.lost)}`));
            infoDiv.appendChild(header('p', `<strong>Win Percentage:</strong> ${p.win_perc}%`));
            infoDiv.appendChild(header('p', `<strong>Neighed:</strong> ${times(p.neigh)}`));
            infoDiv.appendChild(header('p', `<strong>Super Neighed:</strong> ${times(p.super_neigh)}`));
            infoDiv.appendChild(header('p', `<strong>Chosen as Speciality:</strong> ${times(p.speciality_chosen)}`));
            infoDiv.appendChild(header('p', `<strong>Won Speciality:</strong> ${times(p.speciality_won)}`));
            infoDiv.appendChild(header('p', `<strong>Lost Speciality:</strong> ${times(p.speciality_lost)}`));
            player.appendChild(infoDiv);

            gamePlayersDiv.appendChild(player);
        });

        rightGameDiv.style.display = 'flex';
    });

    return div;
}


// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
//
//                                                    Total Stats
//

function generateTotalStats() {
    const curr = {
        total_gog: logs.length,                     // Total number of GoG
        total_players: 0,                           // Total number of players played
        avg_players: 0,                             // Average number of players per GoG
        highest_players: [{ gog: "", num: 0 }],     // Highest number of players for a GoG
        players: [],                                // Players who have played the GoG
        total_shot: 0,                              // Total shots done in the GoG
        avg_shot: 0,                                // Average number of total shots per GoG
        highest_shot: [{ gog: "", num: 0 }],        // Highest number of total shots for a GoG
        shot_info: [],                              // Shot info outlined below
        total_point: 0,                             // Total points earned in the GoG
        avg_point: 0,                               // Average number of total points per GoG 
        highest_point: [{ gog: "", num: 0 }],       // Highest number of total points for a GoG
        point_info: [],                             // Point info outlined below
        card_info: [],                              // Card info outlined below
        played_games: 0,                            // Total number of games played in the GoG
        avg_games: 0,                               // Average number of games per GoG
        highest_games: [{ gog: "", num: 0 }],       // Highest number of games for a GoG
        logs: []                                    // Log info outlined below
    };
    allPlayers.forEach(player => curr.players.push({ name: player, wins: 0 }));
    logs.forEach(log => {
        curr.logs.push({
            gog_id: log.gog_id,                     // Title of current GoG
            overall_shot: 0,                        // Total shots done in GoG
            shot_info: [],                          // Shot info for each type in GoG
            overall_point: 0,                       // Total points earned in GoG
            point_info: [],                         // Point info for each type in GoG
            card_info: [],                          // Card info for each type in GoG
            played_games: 0,                        // Number of games played in GoG
            winner: []                              // Winner of GoG
        });
    });
    const shotTypes = [ "pg_shot", "l_shot", "c_shot", "w_shot", "v_shot"];
    shotTypes.forEach(type => {
        curr.shot_info.push({
            type,                                   // Type of shot
            total: 0,                               // Total number of this type of shot
            avg: 0,                                 // Average number of this type of shot per GoG
            highest: [{ gog: "", num: 0 }]          // Highest number of this type of shot in one GoG
        });
        curr.logs.forEach(log => log.shot_info.push({ type, total: 0 }));
    });
    const pointTypes = [ "g_point", "c_point", "special_w_point", "special_l_point" ];
    pointTypes.forEach(type => {
        curr.point_info.push({
            type,                                   // Type of point
            total: 0,                               // Total number of this type of point
            avg: 0,                                 // Average number of this type of point per GoG
            highest: [{ gog: "", num: 0 }]          // Highest number of this type of point in one GoG
        });
        curr.logs.forEach(log => log.point_info.push({ type, total: 0 }));
    });
    const cardTypes = [ "neigh", "super_neigh", "gooc_total", "gooc_used"];
    cardTypes.forEach(type => {
        curr.card_info.push({
            type,                                   // Type of card
            total: 0,                               // Total number of this type of card
            avg: 0,                                 // Average number of this type of card per GoG
            highest: [{ gog: "", num: 0 }]          // Highest number of this type of card in one GoG
        });
        curr.logs.forEach(log => log.card_info.push({ type, total: 0 }));
    });

    logs.forEach(log => {
        const gog = log.gog_id;
        const currLog = curr.logs.find(l => l.gog_id == log.gog_id);
        
        let num = log.players.length;
        curr.total_players += num;
        if (num > curr.highest_players[0].num) {
            curr.highest_players = [{ gog, num }]
        } else if (num == curr.highest_players[0].num) {
            curr.highest_players.push({ gog, num });
        }

        log.players.forEach(p => {
            Object.entries(p.shots).forEach(([key, value]) => {
                currLog.overall_shot += value;
                currLog.shot_info.find(t => t.type == key).total += value;
            });
            Object.entries(p.points).forEach(([key, value]) => {
                currLog.overall_point += value;
                currLog.point_info.find(t => t.type == key).total += value;
            });
            Object.entries(p.cards).forEach(([key, value]) => {
                let total = (key == "neigh" || key == "super_neigh") ? 2 - value : value;
                currLog.card_info.find(t => t.type == key).total += total;
            });
        });

        num = currLog.overall_shot;
        curr.total_shot += num;
        if (num > curr.highest_shot[0].num) {
            curr.highest_shot = [{ gog, num }];
        } else if (num == curr.highest_shot[0].num) {
            curr.highest_shot.push({ gog, num });
        }
        currLog.shot_info.forEach(shot => {
            num = shot.total;
            let currInfo = curr.shot_info.find(t => t.type == shot.type);
            currInfo.total += num;
            if (num > currInfo.highest[0].num) {
                currInfo.highest = [{ gog, num }];
            } else if (num == currInfo.highest[0].num) {
                currInfo.highest.push({ gog, num });
            }
        });

        num = currLog.overall_point;
        curr.total_point += num;
        if (num > curr.highest_point[0].num) {
            curr.highest_point = [{ gog, num }];
        } else if (num == curr.highest_shot[0].num) {
            curr.highest_point.push({ gog, num });
        }
        currLog.point_info.forEach(point => {
            num = point.total;
            let currInfo = curr.point_info.find(t => t.type == point.type);
            currInfo.total += num;
            const compare = point.type == "special_l_point" ? (a, b) => a < b : (a, b) => a > b;
            if (compare(num, currInfo.highest[0].num)) {
                currInfo.highest = [{ gog, num }];
            } else if (num == currInfo.highest[0].num) {
                currInfo.highest.push({ gog, num });
            }
        });
        currLog.card_info.forEach(card => {
            num = card.total;
            let currInfo = curr.card_info.find(t => t.type == card.type);
            currInfo.total += num;
            if (num > currInfo.highest[0].num) {
                currInfo.highest = [{ gog, num }];
            } else if (num == currInfo.highest[0].num) {
                currInfo.highest.push({ gog, num });
            }
        });
        
        num = log.games.length;
        currLog.played_games = num;
        curr.played_games += num;
        if (num > curr.highest_games[0].num) {
            curr.highest_games = [{ gog, num }];
        } else if (num == curr.highest_games[0].num) {
            curr.highest_games.push({ gog, num });
        }
        
        const results = log.final_results.filter(r => r.place == 1);
        results.forEach(r => currLog.winner.push({
            player: r.name,
            points: r.points,
            shots: r.shots
        }));
    });

    const winners = curr.logs.flatMap(log => log.winner.map(w => w.player));
    const counts = winners.reduce((acc, winner) => {
        let count = acc.find(c => c.name == winner);
        if (count) count.num++;
        if (!count) acc.push({ name: winner, num: 1 });
        return acc;
    }, []);
    counts.forEach(c => curr.players.find(p => p.name == c.name).wins = c.num);
    curr.players.sort((a, b) => b.wins - a.wins);

    curr.avg_players = divide(curr.total_players, logs.length);
    curr.avg_shot = divide(curr.total_shot, logs.length);
    curr.shot_info.forEach(i => i.avg = divide(i.total, logs.length));
    curr.avg_point = divide(curr.total_point, logs.length);
    curr.point_info.forEach(i => i.avg = divide(i.total, logs.length));
    curr.card_info.forEach(i => i.avg = divide(i.total, logs.length));
    curr.avg_games = divide(curr.played_games, logs.length);

    return curr;
}

function showTotal() {
    if (rightTotalDiv.style.display != 'none') {
        rightTotalDiv.style.display = 'none';
        return;
    }

    totalGoGDiv.innerHTML = '';
    totalGoGDiv.appendChild(box("Game of Games Played", totalStats.total_gog));

    totalGameDiv.innerHTML = '';
    totalGameDiv.appendChild(create(
        "overall_game", totalStats.played_games, totalStats.avg_games, totalStats.highest_games
    ));
    
    totalPlayerDiv.innerHTML = '';
    totalPlayerDiv.appendChild(create(
        "overall_player", totalStats.total_players, totalStats.avg_players, totalStats.highest_players
    ));
    
    totalPlayersDiv.innerHTML = '';
    totalStats.players.forEach(p => totalPlayersDiv.appendChild(box(`${p.name} victories`, p.wins)));
    
    totalShotDiv.innerHTML = '';
    totalShotDiv.appendChild(create(
        "overall_shot", totalStats.total_shot, totalStats.avg_shot, totalStats.highest_shot
    ));
    totalStats.shot_info.forEach(i => {
        totalShotDiv.appendChild(create(i.type, i.total, i.avg, i.highest));
    });

    totalPointDiv.innerHTML = '';
    totalPointDiv.appendChild(create(
        "overall_point", totalStats.total_point, totalStats.avg_point, totalStats.highest_point
    ));
    totalStats.point_info.forEach(i => {
        totalPointDiv.appendChild(create(i.type, i.total, i.avg, i.highest));
    });

    totalCardDiv.innerHTML = '';
    totalStats.card_info.forEach(i => {
        totalCardDiv.appendChild(create(i.type, i.total, i.avg, i.highest));
    });

    totalLogDiv.innerHTML = '';
    totalStats.logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'right-total-box';
        div.appendChild(header('h3', log.gog_id));
        div.appendChild(document.createElement('br'));
        div.appendChild(document.createElement('br'));
        div.appendChild(header('p', `<strong>Total Shots:</strong> ${log.overall_shot}`));
        log.shot_info.forEach(i => {
            div.appendChild(header('p', `<strong>Total ${typeText(i.type)}</strong> ${i.total}`));
        });
        
        div.appendChild(document.createElement('br'));
        div.appendChild(header('p', `<strong>Total Points:</strong> ${log.overall_point}`));
        log.point_info.forEach(i => {
            div.appendChild(header('p', `<strong>Total ${typeText(i.type)}</strong> ${i.total}`));
        });
        
        div.appendChild(document.createElement('br'));
        log.card_info.forEach(i => {
            div.appendChild(header('p', `<strong>Total ${typeText(i.type)}</strong> ${i.total}`));
        });

        div.appendChild(document.createElement('br'));
        div.appendChild(header('p', `<strong>Games Played:</strong> ${log.played_games}`));

        div.appendChild(document.createElement('br'));
        let text = "";
        const p = log.winner.map(w => w.player);
        if (p.length == 1) text += `<strong>Winner:</strong> ${p[0]}`;
        if (p.length >= 2) text += `<strong>Winners:</strong> ${p.slice(0, -1).join(', ')} and ${p[p.length - 1]}`;
        text += ` with ${log.winner[0].points} points and ${log.winner[0].shots} shots`;
        div.appendChild(header('p', text));

        console.log(log.winner);

        totalLogDiv.appendChild(div);
    });

    resetDivs("total");
}

function box(name, info) {
    const div = document.createElement('div');
    div.className = 'right-total-box';
    div.appendChild(header('h3', `${name}: ${info}`));
    return div;
}

function create(type, total, avg, highest) {
    const div = document.createElement('div');
    div.id = type;
    div.className = 'right-total-box';
    
    div.appendChild(header('h3', typeText(type)));
    div.appendChild(document.createElement('br'));
    div.appendChild(header('p', `<strong>Total:</strong> ${total}`));
    if (total != 0) div.appendChild(header('p', `<strong>Average:</strong> ${avg}`));
    if (total != 0 && highest[0].num != 0) {
        let text = `<strong>Highest:</strong> `;
        const g = highest.map(h => h.gog.split("No. ")[1]);
        if (g.length == 1) text += `GoG ${g[0]}`;
        if (g.length >= 2) text += `GoGs ${g.slice(0, -1).join(', ')} and ${g[g.length - 1]}`;
        div.appendChild(header('p', text));
    }

    return div;
}

initialise();
