let allGamesInfo = [];
let logs = [];

let center = document.getElementById('center');

async function initialize() {
    const logsResponse = await fetch('./info_logs.json');
    logs = await logsResponse.json();
    logs.forEach(l => createBox(l));

    const gamesResponse = await fetch('./info_overall.json');
    const gamesData = await gamesResponse.json();
    allGamesInfo = gamesData.allGamesInfo;
}

function colour(status) {
    let green = "rgb(76, 175, 80) 5%, rgb(200, 230, 201) 15%, rgb(67, 160, 71) 35%, rgb(165, 214, 167) 50%, rgb(67, 160, 71) 70%, rgb(200, 230, 201) 85%, rgb(76, 175, 80) 95%";
    let red = "rgb(244, 67, 54), rgb(255, 205, 210), rgb(211, 47, 47), rgb(239, 154, 154), rgb(183, 28, 28)";
    
    if (status == "completed") return `linear-gradient(to right, ${green})`;
    if (status == "active") return `linear-gradient(to right, ${red})`;
    return "white";
}

function createBox(log) {
    console.log(log);
    
    const box = document.createElement('div');
    box.className = 'box';
    box.style.background = colour(log.status);
    
    const label = document.createElement('h3');
    label.innerHTML = log.gog_id;
    box.appendChild(label);

    box.addEventListener("click", () => {
        const gamesInfo = allGamesInfo.filter(g => log.possible_games.includes(g.game));
        localStorage.setItem('theGameResults', JSON.stringify(log));
        localStorage.setItem('gamesInfo', JSON.stringify(gamesInfo));
        window.open('game_results.html', '_blank');
    });

    center.appendChild(box);
}

initialize();