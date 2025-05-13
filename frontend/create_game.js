let currStep = 1;
let numGog = -1;
let allPlayers = [];
let allGames = {};
let allGamesInfo = [];
let pointsSystem = {};

let selectedSystems = { points: "", games: "", speciality: 0 };
let selectedPlayers = [];
let selectedGames = [];
let selectedCategory = null;
let selectedSpecialityGames = [];

// Get information about which players and categories are selected
const categoryDivs = {
    card_games: document.getElementById('cardGames'),
    board_games: document.getElementById('boardGames'),
    video_games: document.getElementById('videoGames'),
    outdoor_games: document.getElementById('outdoorGames'),
    other_games: document.getElementById('otherGames')
};

// Get information of selected players and games
const selectedPlayersList = document.getElementById('selectedPlayersList');
const selectedGamesList = document.getElementById('selectedGamesList');

async function loadData() {
    const response = await fetch('./info_overall.json');
    const data = await response.json();
    numGog = data.numGog;
    allPlayers = data.allPlayers;
    allGames = data.allGames;
    allGamesInfo = data.allGamesInfo;
    pointsSystem = data.pointsSystem;
}

async function initialize() {
    await loadData();

    document.getElementById('title').innerHTML = `Creating Game of Games No. ${numGog + 1}`;

    createStep1();
    createStep2();
    createStep3();
    //createStep4();
    createStep5();
}

function createStep1() {
    const pointsCheckboxes = document.createElement('div');
    pointsCheckboxes.className = 'checkboxes';
    document.querySelector('.pointsSystem').appendChild(pointsCheckboxes);

    pointsCheckboxes.appendChild(createCheckbox(0, 'points', 'Just Points'));
    pointsCheckboxes.appendChild(createCheckbox(1, 'points', 'Points & Shots'));

    const points = document.querySelectorAll('.points-checkbox');
    points.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                // Deselect all other checkboxes
                points.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            }
        });
    });

    const gamesCheckboxes = document.createElement('div');
    gamesCheckboxes.className = 'checkboxes';
    document.querySelector('.gamesSystem').appendChild(gamesCheckboxes);

    gamesCheckboxes.appendChild(createCheckbox(0, 'games', 'Wheel'));
    gamesCheckboxes.appendChild(createCheckbox(1, 'games', 'Choose'));
    gamesCheckboxes.appendChild(createCheckbox(2, 'games', 'Vote'));

    const games = document.querySelectorAll('.games-checkbox');
    games.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                // Deselect all other checkboxes
                games.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            }
        });
    });
}

function createStep2() {
    const playersDiv = document.querySelector('.players');
    const playersCheckboxes = document.createElement('div');
    playersCheckboxes.className = 'checkboxes';
    playersCheckboxes.id = 'player-checkboxes';

    allPlayers.forEach((player, i) => {
        playersCheckboxes.appendChild(createCheckbox(i + 1, 'players', player));
    });

    playersDiv.appendChild(playersCheckboxes);

    const buttons = document.createElement('div');
    buttons.className = 'playerButtons';
    
    const deselect = document.createElement('button');
    deselect.type = 'submit';
    deselect.className = 'button';
    deselect.id = 'deselectAllPlayers';
    deselect.innerHTML = 'Deselect All';
    buttons.appendChild(deselect);

    const select = document.createElement('button');
    select.type = 'submit';
    select.className = 'button';
    select.id = 'selectAllPlayers';
    select.innerHTML = 'Select All';
    buttons.appendChild(select);

    document.getElementById('step-2').prepend(buttons);
}

function updatePlayers() {
    const step2 = document.getElementById('step-2');
    const playerButtons = document.querySelector('.playerButtons');
    if (playerButtons.firstChild) {
        playerButtons.firstChild.addEventListener("click", () => {
            const playerCheckboxes = step2.querySelectorAll('.checkboxes input[type="checkbox"]');
            playerCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                const playerName = checkbox.closest('.checkbox').querySelector('.checkboxLabel').innerText;
                selectedPlayers = selectedPlayers.filter(player => player != playerName);
            });
        });
    }
    if (playerButtons.lastChild) {
        playerButtons.lastChild.addEventListener("click", () => {
            const playerCheckboxes = step2.querySelectorAll('.checkboxes input[type="checkbox"]');
            playerCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
                const playerName = checkbox.closest('.checkbox').querySelector('.checkboxLabel').innerText;
                if (!selectedPlayers.includes(playerName)) {
                    selectedPlayers.push(playerName);
                }
            });
        });
    }
}

const step3 = document.getElementById('step-3');

function createStep3() {
    let games = document.querySelector('.games');
    const div = document.createElement('div');
    div.className = 'gamesSelect';
    games.appendChild(div);
    let allGamesObj = Object.entries(allGames);
    if (allGamesObj.length != 0) {
        const buttons = document.createElement('div');
        buttons.className = 'gameButtons';
        
        const deselect = document.createElement('button');
        deselect.type = 'submit';
        deselect.className = 'button';
        deselect.id = 'deselectAll';
        deselect.innerHTML = 'Deselect All';
        buttons.appendChild(deselect);

        const select = document.createElement('button');
        select.type = 'submit';
        select.className = 'button';
        select.id = 'selectAll';
        select.innerHTML = 'Select All';
        buttons.appendChild(select);

        div.appendChild(buttons);
    }
    allGamesObj.forEach(([category, games]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'gameCategory';
        categoryDiv.id = `${category}_category`;
        createCategory(categoryDiv, category, games);
        div.appendChild(categoryDiv);
    });

    const min = document.getElementById('addGameMin');
    const max = document.getElementById('addGameMax');
    //console.log(min);
    //console.log(max);
    min.style.width = min.getAttribute('placeholder').length;
    max.style.width = max.getAttribute('placeholder').length;
}

function createCategory(div, category, games) {
    const categoryHeader = document.createElement('h2');
    categoryHeader.id = 'categoryHeader';
    categoryHeader.innerHTML = category == "card_games" ? "Card Games" :
                                category == "board_games" ? "Board Games" :
                                category == "video_games" ? "Video Games" :
                                category == "outdoor_games" ? "Outdoor Games" :
                                "Other Games";
    div.appendChild(categoryHeader);

    const gamesCheckboxes = document.createElement('div');
    gamesCheckboxes.className = 'checkboxes';
    gamesCheckboxes.id = 'game-checkbox';

    games.forEach((game, i) => {
        gamesCheckboxes.appendChild(createCheckbox(i + 1, 'game', game));
    });

    div.appendChild(gamesCheckboxes);
}

function updateGames() {
    const gamesSelect = document.querySelector('.gamesSelect');
    Object.entries(allGames).forEach(([category, games]) => {
        const categoryDiv = document.getElementById(`${category}_category`);
        categoryDiv.innerHTML = '';
        
        const newGames = games.filter(game => {
            const num = selectedPlayers.length;
            const info = allGamesInfo.find(g => { return g.game == game });
            //console.log(game);
            //console.log(info);
            return num >= info.player_min && num <= info.player_max;
        }).sort((a, b) => {
            return a.localeCompare(b);
        });
        let noShowGames = document.querySelector('.noShowGames');
        const selectAll = document.getElementById('selectAll');
        const deselectAll = document.getElementById('deselectAll');
        if (newGames.length != 0) {
            selectAll.style.display = 'flex';
            deselectAll.style.display = 'flex';
            if (noShowGames) step3.removeChild(noShowGames);
            gamesSelect.style.overflowY = 'auto';
            createCategory(categoryDiv, category, newGames);
        } else {
            selectAll.style.display = 'none';
            deselectAll.style.display = 'none';
            selectedGames = [];
            if (!noShowGames) {
                noShowGames = document.createElement('div');
                noShowGames.className = "noShowGames";
                noShowGames.innerHTML = 'No Players selected';
                step3.prepend(noShowGames);
                gamesSelect.style.overflowY = 'hidden';
            }
        }
    });

    const gameButtons = document.querySelector('.gameButtons');
    if (gameButtons.firstChild) {
        gameButtons.firstChild.addEventListener("click", () => {
            const gameCheckboxes = step3.querySelectorAll('.checkboxes input[type="checkbox"]');
            gameCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                const gameName = checkbox.closest('.checkbox').querySelector('.checkboxLabel').innerText;
                selectedGames = selectedGames.filter(game => game !== gameName);
            });
            selectedGames.sort((a, b) => a.localeCompare(b));
        });
    }
    if (gameButtons.lastChild) {
        gameButtons.lastChild.addEventListener("click", () => {
            const gameCheckboxes = step3.querySelectorAll('.checkboxes input[type="checkbox"]');
            gameCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
                const gameName = checkbox.closest('.checkbox').querySelector('.checkboxLabel').innerText;
                if (!selectedGames.includes(gameName)) {
                    selectedGames.push(gameName);
                }
            });
            selectedGames.sort((a, b) => a.localeCompare(b));
        });
    }
}

function createGameBox(game) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = "checkbox";
    input.value = game;
    input.name = "game";

    label.appendChild(input);
    label.appendChild(document.createTextNode(game));

    // Add change listener to update selected games
    input.addEventListener('change', () => {
        backgroundColour(label, input.checked);
        if (input.checked) selectedGames.push(game);
        if (!input.checked) selectedGames = selectedGames.filter(g => g != game);
    });

    return label;
}

let numSpeciality = 0;
let currGames = [];

/*function createStep4() {
    const div = document.getElementById('specialityPlayers');
    div.innerHTML = '';
    console.log(selectedPlayers);
    selectedPlayers.forEach(player => { 
        const playerSection = document.createElement('div');
        playerSection.className = 'playerSection';

        const playerBox = document.createElement('div');
        playerBox.className = 'playerBox';
        playerBox.id = player;
        playerBox.innerHTML = player;
        backgroundColour(playerBox, true);
        playerSection.appendChild(playerBox);

        const playerSpecialties = document.createElement('div');
        playerSpecialties.className = 'playerSpecialties';
        playerSection.appendChild(playerSpecialties);

        // Restore previously selected specialties
        const existingSpecialties = selectedSpecialityGames.find(p => p.name === player);
        if (existingSpecialties) {
            existingSpecialties.games.forEach(game => {
                const specialityDiv = document.createElement('select');
                specialityDiv.className = 'specialitySelect';

                const baseOption = document.createElement('option');
                baseOption.value = "";
                baseOption.disabled = true;
                baseOption.innerHTML = 'Pick a speciality...';
                specialityDiv.appendChild(baseOption);

                selectedGames.forEach(g => {
                    const option = document.createElement('option');
                    option.value = g;
                    option.innerHTML = g;
                    option.disabled = existingSpecialties.games.includes(g);
                    if (g === game) option.selected = true;
                    specialityDiv.appendChild(option);
                });

                specialityDiv.addEventListener("change", () => {
                    let currGames = [];
                    Array.from(playerSpecialties.children).forEach(s => {
                        if (s.value !== "") currGames.push(s.value);
                    });

                    let playerEntry = selectedSpecialityGames.find(p => p.name === player);
                    if (playerEntry) {
                        playerEntry.games = currGames;
                    } else {
                        selectedSpecialityGames.push({ name: player, games: currGames });
                    }
                });

                playerSpecialties.appendChild(specialityDiv);
            });
        }

        div.appendChild(playerSection);
    });

    div.style.justifyContent = selectedPlayers.length <= 5 ? 'center' : 'flex-start';
}*/

function createStep4() {
    const div = document.getElementById('specialityPlayers');

    // Preserve previously stored selections and prevent clearing
    const existingData = new Map();
    selectedSpecialityGames.forEach(player => {
        existingData.set(player.name, [...player.games]); // Store current selections
    });
    console.log(existingData);

    div.innerHTML = ''; // Clear only if necessary

    selectedPlayers.forEach(player => { 
        const playerSection = document.createElement('div');
        playerSection.className = 'playerSection';

        const playerBox = document.createElement('div');
        playerBox.className = 'playerBox';
        playerBox.id = player;
        playerBox.innerHTML = player;
        backgroundColour(playerBox, true);
        playerSection.appendChild(playerBox);

        const playerSpecialties = document.createElement('div');
        playerSpecialties.className = 'playerSpecialties';
        playerSection.appendChild(playerSpecialties);

        div.appendChild(playerSection);

        // Restore previous selections or create new ones
        const existingSpecialties = existingData.get(player) || [];

        existingSpecialties.forEach(game => {
            createSpecialityDropdown(player, playerSpecialties, game);
        });

        // Ensure the correct number of specialties are displayed
        while (playerSpecialties.children.length < numSpeciality) {
            createSpecialityDropdown(player, playerSpecialties);
        }
    });

    div.style.justifyContent = selectedPlayers.length <= 5 ? 'center' : 'flex-start';
}

// Create the specialty dropdown
/*function createSpecialityDropdown(player, container, selectedGame = "") {
    const specialityDiv = document.createElement('select');
    specialityDiv.className = 'specialitySelect';

    const baseOption = document.createElement('option');
    baseOption.value = "";
    baseOption.disabled = true;
    baseOption.innerHTML = 'Pick a speciality...';
    specialityDiv.appendChild(baseOption);

    selectedGames.forEach(game => {
        const option = document.createElement('option');
        option.value = game;
        option.innerHTML = game;
        option.disabled = selectedSpecialityGames.some(p => p.name === player && p.games.includes(game));
        if (game === selectedGame) option.selected = true;
        specialityDiv.appendChild(option);
    });

    specialityDiv.addEventListener("change", () => {
        let currGames = [];
        Array.from(container.children).forEach(s => {
            if (s.value !== "") currGames.push(s.value);
        });

        let playerEntry = selectedSpecialityGames.find(p => p.name === player);
        if (playerEntry) {
            playerEntry.games = currGames;
        } else {
            selectedSpecialityGames.push({ name: player, games: currGames });
        }

        // Disable already selected specialties in all dropdowns
        Array.from(container.children).forEach(select => {
            Array.from(select.children).forEach(option => {
                option.disabled = select.value === "" ? currGames.includes(option.value) : 
                    option.value !== select.value && currGames.includes(option.value);
            });
        });
    });

    container.appendChild(specialityDiv);
}*/

function createSpecialityDropdown(player, container, selectedGame = "") {
    const specialityDiv = document.createElement('select');
    specialityDiv.className = 'specialitySelect';

    const baseOption = document.createElement('option');
    baseOption.value = "";
    baseOption.disabled = true;
    baseOption.innerHTML = 'Pick a speciality...';

    // Ensure it stays selected if no game is chosen
    if (!selectedGame) {
        baseOption.selected = true;
    }

    specialityDiv.appendChild(baseOption);

    selectedGames.forEach(game => {
        const option = document.createElement('option');
        option.value = game;
        option.innerHTML = game;

        // Disable if another specialty box has already picked this game
        option.disabled = selectedSpecialityGames.some(p => p.name === player && p.games.includes(game));

        // Set the option as selected only if it matches the stored selection
        if (game === selectedGame) {
            option.selected = true;
        }

        specialityDiv.appendChild(option);
    });

    specialityDiv.addEventListener("change", () => {
        let currGames = [];
        Array.from(container.children).forEach(s => {
            if (s.value !== "") currGames.push(s.value);
        });

        let playerEntry = selectedSpecialityGames.find(p => p.name === player);
        if (playerEntry) {
            playerEntry.games = currGames;
        } else {
            selectedSpecialityGames.push({ name: player, games: currGames });
        }

        // Disable already selected specialties in all dropdowns
        Array.from(container.children).forEach(select => {
            Array.from(select.children).forEach(option => {
                option.disabled = select.value === "" ? currGames.includes(option.value) : 
                    option.value !== select.value && currGames.includes(option.value);
            });
        });
    });

    container.appendChild(specialityDiv);
}

/*function createStep4() {
    const div = document.getElementById('specialityPlayers');
    div.innerHTML = '';
    selectedPlayers.forEach(player => { 
        const playerSection = document.createElement('div');
        playerSection.className = 'playerSection';

        const playerBox = document.createElement('div');
        playerBox.className = 'playerBox';
        playerBox.id = player;
        playerBox.innerHTML = player;
        backgroundColour(playerBox, true);
        playerSection.appendChild(playerBox);

        const playerSpecialties = document.createElement('div');
        playerSpecialties.className = 'playerSpecialties';
        playerSection.appendChild(playerSpecialties);
        
        div.appendChild(playerSection);
    });
    div.style.justifyContent = selectedPlayers.length <= 5 ? 'center' : 'flex-start';
}*/

function changeSpecialityNum() {
    const newNum = document.getElementById('specialityNum').value;
    const playerSections = document.querySelectorAll('.playerSpecialties');
    if (numSpeciality >= newNum) {
        currGames.pop();
    }
    playerSections.forEach(section => {
        if (numSpeciality < newNum) {
            createSpeciality(newNum, section);
        } else {
            const name = Array.from(section.parentElement.children).find(c => {
                return c.className == "playerBox";
            }).id;
            let player = selectedSpecialityGames.find(p => p.name == name);
            if (player) player.games = currGames;
            section.removeChild(section.lastChild);
            Array.from(section.children).forEach(select => {
                Array.from(select.children).filter(s => s.value != "").forEach(option => {
                    option.disabled = select.value == "" ? 
                        currGames.includes(option.value) : 
                        option.value != select.value && currGames.includes(option.value);
                });
            });
        }
    });
    numSpeciality = newNum;
    selectedSystems.speciality = newNum;
}

function createSpeciality(num, section) {
    const name = Array.from(section.parentElement.children).find(c => {
        return c.className == "playerBox";
    }).id;
    const player = selectedSpecialityGames.find(p => p.name == name);
    currGames = player ? player.games : [];
    
    const specialityDiv = document.createElement('select');
    specialityDiv.className = 'specialitySelect';
    specialityDiv.id = `specialitySelect_${num}`;

    const baseOption = document.createElement('option');
    baseOption.value = "";
    baseOption.disabled = true;
    baseOption.selected = true;
    baseOption.innerHTML = 'Pick a speciality...';
    specialityDiv.appendChild(baseOption);

    selectedGames.forEach(game => {
        const option = document.createElement('option');
        option.value = game;
        option.innerHTML = game;
        if (currGames.includes(game)) option.disabled = true;
        specialityDiv.appendChild(option);
    });

    specialityDiv.addEventListener("change", () => {
        let currGames = [];
        Array.from(section.children).filter(s => s.value != "").forEach(s => {
            currGames.push(s.value);
        });
        const specialityGames = selectedSpecialityGames.find(g => g.name == name);
        if (specialityGames) specialityGames.games = currGames;
        if (!specialityGames) selectedSpecialityGames.push({ name, games: currGames });

        Array.from(section.children).forEach(select => {
            Array.from(select.children).filter(s => s.value != "").forEach(option => {
                option.disabled = select.value == "" ? 
                    currGames.includes(option.value) : 
                    option.value != select.value && currGames.includes(option.value);
            });
        });
    });

    section.appendChild(specialityDiv);
}

function updateSpecialties() {
    const step4 = document.getElementById('step-4');
    let noShowSpecialties = document.querySelector('.noShowSpecial');
    if (selectedPlayers.length != 0) {
        if (noShowSpecialties) {
            step4.removeChild(noShowSpecialties);
            Array.from(step4.children).forEach(c => c.style.display = 'flex');
        }
        createStep4();
    } else {
        selectedSpecialityGames = [];
        if (!noShowSpecialties) {
            Array.from(step4.children).forEach(c => c.style.display = 'none');
            
            noShowSpecialties = document.createElement('div');
            noShowSpecialties.className = "noShowSpecial";
            noShowSpecialties.innerHTML = 'No Players selected';
            step4.prepend(noShowSpecialties);
        }
    }
}

function createStep5() {
    const step5 = document.getElementById('step-5');
    step5.innerHTML = '';

    const confirm = document.createElement('div');
    confirm.className = 'confirming';

    const systems = document.createElement('div');
    systems.id = 'confirmingSystems';
    confirm.appendChild(systems);

    const pointsSystem = document.createElement('div');
    pointsSystem.className = "confirmingBox";
    pointsSystem.id = 'points-system';
    systems.appendChild(pointsSystem);

    const gamesSystem = document.createElement('div');
    gamesSystem.className = "confirmingBox";
    gamesSystem.id = 'games-system';
    systems.appendChild(gamesSystem);

    const players = document.createElement('div');
    players.id = 'confirmingPlayers';
    confirm.appendChild(players);

    const noPlayers = document.createElement('div');
    noPlayers.className = "confirmingBox";
    noPlayers.id = 'noPlayers';
    noPlayers.innerHTML = 'No Players selected';
    systems.appendChild(noPlayers);

    const games = document.createElement('div');
    games.id = 'confirmingGames';
    confirm.appendChild(games);

    const noGames = document.createElement('div');
    noGames.className = "confirmingBox";
    noGames.id = 'noGames';
    noGames.innerHTML = 'No Games selected';
    systems.appendChild(noGames);

    step5.appendChild(confirm);
    //console.log("ADDED");
}

function updateStep5() {
    let isPointSystem = true;
    const pointSystem = document.getElementById('points-system');
    if (selectedSystems.points != "") {
        pointSystem.innerHTML = selectedSystems.points;
        pointSystem.style.fontWeight = 'bold';
        backgroundColour(pointSystem, true);
    } else {
        pointSystem.innerHTML = "No system picked for points";
        isPointSystem = false;
    }
    
    let isGameSystem = true;
    const gameSystem = document.getElementById('games-system');
    if (selectedSystems.games == "Wheel") {
        gameSystem.innerHTML = "Spin a wheel to decide the game";
    } else if (selectedSystems.games == "Choose") {
        gameSystem.innerHTML = "Unanimously choose a game to play";
    } else if (selectedSystems.games == "Vote") {
        gameSystem.innerHTML = "Everyone vote for a game, and then a spin a wheel";
    } else {
        gameSystem.innerHTML = "No system picked for games";
        isGameSystem = false
    }
    if (isGameSystem) {
        gameSystem.style.fontWeight = 'bold';
        backgroundColour(gameSystem, true);
    }
    
    let isPlayers = true;
    const noPlayers = document.getElementById('noPlayers');
    noPlayers.style.display = selectedPlayers.length == 0 ? 'flex' : 'none';
    if (selectedPlayers.length == 0) isPlayers = false;

    const players = document.getElementById('confirmingPlayers');
    players.innerHTML = '';
    const sections = document.querySelectorAll('.playerSection');
    sections.forEach(section => {
        const box = document.createElement('div');
        box.id = 'confirmingPlayerBox';
        backgroundColour(box, true);
        
        const name = document.createElement('h4');
        name.innerHTML = section.firstChild.id;
        box.appendChild(name);
        box.appendChild(document.createElement('br'));

        const game = document.createElement('p');
        if (section.children.length == 1) game.innerHTML = "No Speciality";
        if (section.children.length != 1) {
            let currGames = [];
            Array.from(section.lastChild.children).forEach(speciality => {
                if (speciality.value != "") currGames.push(speciality.value);
            });
            if (currGames.length == 0) game.innerHTML = "No Speciality";
            if (currGames.length != 0) game.innerHTML = currGames.join(", ");
        }
        box.appendChild(game);

        players.appendChild(box);
    });
    if (players.scrollWidth <= players.clientWidth) {
        players.style.justifyContent = 'center';
    }
    players.style.justifyContent = players.scrollWidth <= players.clientWidth ?
                                    'center' : 'flex-start';

    let isGames = true;
    const noGames = document.getElementById('noGames');
    noGames.style.display = selectedGames.length == 0 ? 'flex' : 'none';
    if (selectedGames.length == 0) isGames = false;

    const games = document.getElementById('confirmingGames');
    games.innerHTML = '';
    selectedGames.forEach(g => {
        const box = document.createElement('div');
        box.id = 'confirmingGameBox';
        box.innerHTML = g;
        backgroundColour(box, true);
        games.appendChild(box);
    });
    setTimeout(() => {
        games.style.justifyContent = games.scrollWidth <= games.clientWidth ?
                                        'center' : 'flex-start';
    }, 0);
    if (isPointSystem && isGameSystem && isPlayers && isGames) {
        document.getElementById('start').style.display = 'flex';
    }
}

function createCheckbox(id, type, text) {
    const checkbox = document.createElement('div');
    checkbox.className = 'checkbox';

    const cbx = document.createElement('div');
    cbx.className = 'cbx';
    checkbox.appendChild(cbx);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `cbx-${id}`;
    input.className = `${type}-checkbox`;
    if (selectedGames.includes(text)) input.checked = true;
    cbx.appendChild(input);

    input.addEventListener("click", () => {
        if (type == "points") {
            selectedSystems.points = input.checked ? text : "";
        } else if (type == "games") {
            selectedSystems.games = input.checked ? text : "";
        } else if (type == "players") {
            if (input.checked) selectedPlayers.push(text);
            if (!input.checked) selectedPlayers = selectedPlayers.filter(p => p != text);
        } else if (type == "game") {
            if (input.checked) selectedGames.push(text);
            if (!input.checked) selectedGames = selectedGames.filter(g => g != text);
        }
    });

    const label = document.createElement('label');
    label.htmlFor = `cbx-${id}`;
    cbx.appendChild(label);

    // Create the SVG using createElementNS
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 15 14');
    svg.setAttribute('height', '14');
    svg.setAttribute('width', '15');
    cbx.appendChild(svg);

    // Create the path using createElementNS
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tick.setAttribute('d', 'M2 8.36364L6.23077 12L13 3');
    svg.appendChild(tick);

    const checkboxLabel = document.createElement('div');
    checkboxLabel.className = 'checkboxLabel';
    checkboxLabel.innerHTML = text;
    checkbox.appendChild(checkboxLabel);

    return checkbox;
}

function createAddPlayer() {
    document.getElementById('addPlayer').style.display = 'none';
    document.getElementById('addPlayerName').style.display = 'flex';
    document.getElementById('confirmPlayer').style.display = 'flex';
}

function confirmPlayer() {
    const playersDiv = document.getElementById('player-checkboxes');
    const num = playersDiv.children.length;
    const name = document.getElementById('addPlayerName');
    const player = name.value;
    playersDiv.appendChild(createCheckbox(num, 'players', player));
    name.value = '';
    document.getElementById('addPlayer').style.display = 'flex';
    name.style.display = 'none';
    document.getElementById('confirmPlayer').style.display = 'none';
}

function createAddGame() {
    document.getElementById('addGame').style.display = 'none';
    document.querySelectorAll('.addGameBox').forEach(s => { s.style.display = 'flex'; });
    document.getElementById('confirmGame').style.display = 'flex';
}

function confirmGame() {
    const findCheckbox = (gameType) => {
        switch (gameType) {
            case "card": return document.getElementById("cardGames");
            case "board": return document.getElementById("boardGames");
            case "video": return document.getElementById("videoGames");
            case "outdoor": return document.getElementById("outdoorGames");
            case "other": return document.getElementById("otherGames");
            default: console.error(`Nothing selected`);
        }
    }
    const type = document.getElementById('addGameType');
    const checkbox = findCheckbox(type.value);
    if (!checkbox) return;
    //console.log(checkbox);
    const name = document.getElementById('addGameName');
    const results = document.getElementById('addGameResults');
    const min = document.getElementById('addGameMin');
    const max = document.getElementById('addGameMax');
    //console.log(name.value);
    //console.log(results.value);
    //console.log(min.value);
    //console.log(max.value);
    checkbox.appendChild(createGameBox(name.value));
    name.value = type.value = results.value = min.value = max.value = "";
    document.getElementById('addGame').style.display = 'flex';
    document.querySelectorAll('.addGameBox').forEach(s => { s.style.display = 'none'; });
    document.getElementById('confirmGame').style.display = 'none';
}

function stepText() {
    switch (currStep) {
        case 1: return "Step 1 - Systems";
        case 2: return "Step 2 - Players";
        case 3: return "Step 3 - Games";
        case 4: return "Step 4 - Specialities";
        case 5: return "Step 5 - Confirmation";
    }
}

function prevStep() {
    if (currStep == 5) document.getElementById('next').style.display = 'flex';
    if (currStep == 5) document.getElementById('start').style.display = 'none';
    document.getElementById(`step-${currStep}`).style.display = 'none';
    currStep--;
    document.getElementById(`step-${currStep}`).style.display = 'flex';
    document.getElementById('step-header').textContent = stepText();
    if (currStep == 1) document.getElementById('prev').style.display = 'none';
}

function nextStep() {
    if (currStep == 1) document.getElementById('prev').style.display ='flex';
    if (currStep == 1) updatePlayers();
    if (currStep == 2) updateGames();
    if (currStep == 3) updateSpecialties();
    if (currStep == 4) updateStep5();
    document.getElementById(`step-${currStep}`).style.display = 'none';
    currStep++;
    document.getElementById(`step-${currStep}`).style.display = 'flex';
    document.getElementById('step-header').textContent = stepText();
    if (currStep == 5) document.getElementById('next').style.display = 'none';
}

function backgroundColour(label, isChecked) {
    if (isChecked) {
        label.style.background = 'linear-gradient(45deg, rgb(180, 216, 255) 5%, rgb(224, 244, 255) 15%, rgb(160, 198, 230) 35%, rgb(204, 232, 255) 50%, rgb(160, 198, 230) 70%, rgb(224, 244, 255) 85%, rgb(180, 216, 255) 95%)';
    } else {
        label.style.background = "white";
    }
}

function startGame() {
    /*
    selectedSystems = { points: "", games: "" };
    selectedPlayers = ["Dan", "Gid", "Jake", "Danny", "Alex" ];
    selectedGames = [ "Golf", "Monopoly Deal", "Monopoly Bid", "Muffin Time", "Unstable Unicorns",
        "Llamas Unleashed", "Yahtzee Cards", "FUCK the Game", "Cards Against Humanity", "Costumed Cats",
        "Struggle for Catan", "Monopoly", "Game of Life", "Catan", "Block Party", "Mario Party",
        "Switch Bowling", "Switch Golf", "Minigolf Adventure", "Gang Beasts", "FIFA", "NBA",
        "Call of Duty", "Basketball", "Backyard Cricket", "Soccer", "Capture the Flag",
        "Quoits", "Cornhole", "Shooting", "Alphabetix", "Shithead", "Skip Bo", "Coup",
        "Uno", "Uno Flip", "Trouble (Pop-n-hop)", "Uno Stacko", "Jenga" ];
    */

    //console.log('Selected Systems:');
    //console.log(selectedSystems);
    //console.log('Selected Players:');
    //console.log(selectedPlayers);
    //console.log('Selected Games:');
    //console.log(selectedGames);
    
    let players = [];
    selectedPlayers.forEach(p => {
        const player = selectedSpecialityGames.find(curr => curr.name == p);
        const games = player ? player.games : [];
        players.push({
            name: p,
            speciality: games,
            shots: { pg_shot: 0, l_shot: 0, c_shot: 0, w_shot: 0, v_shot: 0 },
            points: { g_point: 0, c_point: 0, special_w_point: 0, special_l_point: 0 },
            cards: { neigh: 2, super_neigh: 2, gooc_total: 0, gooc_used: 0 }
        });
    });

    const newGame = {
        gog_id: `Game of Games No. ${numGog + 1}`,
        status: 'active',
        start_time: new Date().toLocaleString(),
        finish_time: new Date().toLocaleString(),
        systems: selectedSystems,
        intruded: [],
        abandoned: [],
        extra: [],
        players: players,
        possible_games: selectedGames,
        games: [],
        final_results: []
    };

    allGamesInfo = allGamesInfo.filter(g => selectedGames.includes(g.game));

    //console.log('New Game Created:');
    //console.log(newGame);
    //console.log('Game Info');
    //console.log(allGamesInfo);
    localStorage.setItem('theGame', JSON.stringify(newGame));
    localStorage.setItem('allPlayers', JSON.stringify(allPlayers));
    localStorage.setItem('gamesInfo', JSON.stringify(allGamesInfo));
    localStorage.setItem('pointsSystem', JSON.stringify(pointsSystem));
    window.location.href = 'game.html';// it'll eventually be 'starting_game.html';
}

// Populate the games when the page loads
initialize();