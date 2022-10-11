var selectedCharacter = 0;
var selectedReligion = 0;
var selectedOverlay;
var overlaySelectedIndex = 0;
var selectedAbilities = ["a"];
const helpbTnIcon = "/client/cms/images/Icon-round-Question_mark.svg";
var playerData;
var gameInfo;
var tempValuta;

if (!document.cookie.includes("id") || document.cookie == undefined) {
    window.location.replace("../login/login.html");
} else {
    fetch("../../../gameinfo.json")
        .then(response => response.json())
        .catch(err => { alert("Could not fetch GameInfo"); console.log(err) })
        .then(_gameInfo => {
            gameInfo = _gameInfo;
            updateFields(gameInfo);
        });
}

function updateFields() {
    let id = getCookie(`id`);
    fetch(`playerData`, {
        method: "POST",
        body: JSON.stringify({ "id": id })
    })
        .then(response => response.json())
        .catch(err => { alert("Could not fetch playerData" + err); console.log(err) })
        .then(_playerData => {
            playerData = _playerData;
            for (let i = 0; i < playerData.length; i++) {
                if (playerData.characters[i].selected == true) selectedCharacter = i;
            }
            addEventListeners();
            populateFields(playerData, selectedCharacter, gameInfo);
        });
}

function getCookie(target) {
    let cookies = document.cookie.split(' ');
    for (let i = 0; i < cookies.length; i++) {
        let splitCookie = cookies[i].split(`=`);
        if (splitCookie[0] == target) {
            return splitCookie[1];
        }
    }
    return undefined;
}
/*
for(let i = 0; i < characters.length; i++) {
        
}
    */

function populateFields(_playerData, selectedCharacterNr, gameInfo) {

    let characters = _playerData.characters;
    let character = characters[selectedCharacterNr];

    populateNameAndImg(character, _playerData);

    //Charater
    makeSelector("characterSelector", characters, character.name, selectedCharacterUpdate);

    buildDivList("xpGrid", character.xpArr, buildXpElement);

    buildDivList("abilitiesDiv", character.abilities, buildAbilityDivElement);

    makeSelector("raceSelector", gameInfo.races, character.race, changeReligion);



    /*let religionSelector = document.getElementById("religion");
    for (let i = 0; i < obj.religions.length; i++) {
        let option = document.createElement("option");
        option.innerText = obj.religions[i].name;
        option.id = obj.religions[i].name;
        religionSelector.appendChild(option);
    }
    if (obj.character.religion != "") {
        document.getElementById(obj.character.religion).setAttribute("selected", true);
        removeSelect();
    }
    */
}
function addEventListeners() {
    document.getElementById("newProfession").addEventListener("click", newProfession);
    document.getElementById("newGeneralAbility").addEventListener("click", newGeneralAbility);
    document.getElementById("newSpecialAbility").addEventListener("click", newSpecialAbility);
    document.getElementById("tint").addEventListener("click", hideOverlay);
}

function changeReligion() {

}

let overlay = document.getElementById("overlay");
let tint = document.getElementById("tint");

function newProfession() {
    showOverlay()
    buildOverlay("profession");
}
function newGeneralAbility() {
    showOverlay()
    buildOverlay("generalAbility");
}
function newSpecialAbility() {
    showOverlay()
    buildOverlay("specialAbility");
}

function buildOverlay(type) {
    if (selectedOverlay == type) {
        return;
    }
    tempValuta = playerData.characters[selectedCharacter].valuta;
    selectedOverlay = type;
    let obj;
    let title;
    switch (selectedOverlay) {
        case "profession":
            obj = gameInfo.professions;
            title = "Profession";
            break;
        case "generalAbility":
            obj = checkRequirements(gameInfo.abilities, "abilityMatrix");
            title = "General Ability";
            break;
        case "specialAbility":
            obj = gameInfo.specialAbilities;
            title = "Special Ability";
            break;
    }
    document.getElementById("oTitle").innerText = title;
    buildDivList("oListDiv", obj, buildOListElement);
}

function removeAchieved(verifiedAbilityList) {
    let newList = [];
    for (let i = 0; i < verifiedAbilityList.length; i++) {
        //console.log(verifiedAbilityList[i].name, requirementMet(verifiedAbilityList[i].name));
        if (!requirementMet(verifiedAbilityList[i].name)) newList.push(verifiedAbilityList[i]);
    }
    return newList;
}

function checkRequirements(arr, matrixName) {
    let verifiedAbilityList = [];
    for (let i = 0; i < arr.length; i++) {
        let notMet = false;
        let iMatrixIndex = getMatrixColumnIndex(arr[i].name, matrixName);
        let requirements = getRequirements(iMatrixIndex, matrixName);
        for (let p = 0; p < requirements.length; p++) {
            if (!requirementMet(requirements[i])) {
                notMet = true;
                break;
            }
        }
        if (!notMet) {
            verifiedAbilityList.push(arr[i]);
        }
    }
    return removeAchieved(verifiedAbilityList);
}

function requirementMet(requirement) {
    //console.log(playerData.characters[selectedCharacter].abilities);
    for (let i = 0; i < playerData.characters[selectedCharacter].abilities.length; i++) {
        if (playerData.characters[selectedCharacter].abilities[i] == requirement) return true;
    }
    return false;
}

function getRequirements(matrixColumn, matrixName) {
    let requirementList = []
    for (let p = 1; p < gameInfo[matrixName][matrixColumn].length; p++) {
        if (gameInfo[matrixName][matrixColumn][p]) {
            requirementList.push(gameInfo[matrixName][p - 1][0])
        }
    }
    return requirementList;
}

function getMatrixColumnIndex(name, matrixName) {
    if (matrixName == undefined) return undefined;
    //console.log(gameInfo[matrixName].length);/*
    for (let i = 0; gameInfo[matrixName].length; i++) {
        if (name == gameInfo[matrixName][i][0]) {
            return i;
        }
    }
}

function buildOListElement(obj, i) {
    let div = document.createElement("div");
    console.log(playerData.characters[selectedCharacter].valuta, tempValuta)

    document.getElementById("oValuta").innerText = `Valuta: ${playerData.characters[selectedCharacter].valuta}`;
    document.getElementById("oCost").innerText = `Cost: ${playerData.characters[selectedCharacter].valuta - tempValuta}`;
    document.getElementById("oLeft").innerText = `Left: ${tempValuta}`;



    div.addEventListener("mouseover", event => {
        overlaySelectedIndex = i;
        updateInfo(obj);
    })
    let bgColor;
    let color;
    if (tempValuta >= obj.cost && !selectedAbilities.contains(obj.name)) {
        bgColor = "#02cf0c";
        div.addEventListener("click", event => {
            tempValuta -= obj.cost;
            selectedAbilities.push(obj.name);
            buildDivList("oListDiv", checkRequirements(gameInfo.abilities, "abilityMatrix"), buildOListElement);
        });
    } else {
        bgColor = "#191919";
    }

    if (selectedAbilities != undefined && selectedAbilities.contains(obj.name)) {
        bgColor = "#0dfce0";
        color = "#ffffff"
        div.addEventListener("click", event => {
            tempValuta += obj.cost;
            selectedAbilities = selectedAbilities.splice(selectedAbilities.indexOf(obj.name), 1);
            console.log(selectedAbilities);
            buildDivList("oListDiv", checkRequirements(gameInfo.abilities, "abilityMatrix"), buildOListElement);
        });
    }
    div.setAttribute("style", `background-color: ${bgColor}; color: ${color}; text-align: center; margin-bottom: 10px; border-radius: 10px; height: 4vh;`)

    let output = document.createElement("output");
    output.style.color = "white";
    output.value = obj.name;
    output.style.verticalAlign = "middle";

    div.appendChild(output);
    return div;
}

Array.prototype.contains = function (target) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] == target) return true;
    }
    return false;
};

function updateInfo(obj) {
    document.getElementById("oInfoTitle").innerText = obj.name;
    document.getElementById("oInfo").innerText = obj.description;
}

function showOverlay() {
    overlay.style.display = "block";
    tint.style.display = "block";
}

function hideOverlay() {
    overlay.style.display = "none";
    tint.style.display = "none";
}


function populateNameAndImg(character, _playerData) {
    if (character.image != undefined && character.image != "") {
        document.getElementById("img").src = character.image;
    }
    document.getElementById("chrName").value = character.name;
    document.getElementById("chrAge").value = character.age;

    document.getElementById("playerName").value = _playerData.playerInfo.name;
    document.getElementById("playerAge").value = _playerData.playerInfo.age;

    document.getElementById("backstoryBox").value = character.backstory;
    document.getElementById("noteBox").value = character.notes;

    document.getElementById("valutaValue").innerText = character.valuta;
}

function makeSelector(selectorID, dataArr, selectedName, ChangeFunction) {
    let selector = document.getElementById(selectorID);
    selector.addEventListener("change", ChangeFunction, false);
    selectedAbilities = ["a"];
    selectedOverlay = "";
    buildDivList(selectorID, dataArr, buildSelectorOption);
    selector.value = selectedName;
}

function selectedCharacterUpdate(evt) {
    selectedCharacter = evt.target.selectedIndex;
    updateFields();
}

function buildSelectorOption(obj, i) {
    let option = document.createElement("option");
    option.innerText = obj.name;
    return option;
}

function buildXpElement(obj) {
    let div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.padding = "7px";
    div.style.marginBottom = "5px";
    div.style.backgroundColor = "#393939";
    div.style.borderRadius = "5px";

    let output = document.createElement("output");
    output.innerText = obj.name + ": " + obj.value
    output.style.color = "#ffffff"
    output.style.fontSize = "20px";

    div.appendChild(output);
    xpGrid.appendChild(div);
    return div;
}

function buildDivList(divId, array, buildElementFunction) {
    let div = document.getElementById(divId);
    div.innerHTML = "";

    for (let i = 0; i < array.length; i++) {
        div.appendChild(buildElementFunction(array[i], i));
    }

}

function getAbilityObj(name) {
    for (let i = 0; i < gameInfo.abilities.length; i++) {
        //console.log(name, gameInfo.abilities[i].name);
        if (name == gameInfo.abilities[i].name) {
            //console.log("found");
            return gameInfo.abilities[i];
        }
    }
    return undefined;
}

function buildAbilityDivElement(obj, i) {
    let div = document.createElement("div");
    //div.style.textAlign = "center";
    div.style.padding = "7px";
    div.style.marginBottom = "5px";
    div.style.backgroundColor = "#393939";
    div.style.borderRadius = "5px";
    div.style.width = "100%";
    //div.style.

    let output = document.createElement("output");
    output.innerText = obj;
    output.style.color = "#ffffff"
    output.style.fontSize = "20px";

    let img = document.createElement("img");
    img.setAttribute("src", helpbTnIcon);
    img.style.height = "25px";
    img.setAttribute("style", "float: right; position: float; height: 25px;")
    // let helpBtn = document.createElement("input");
    // helpBtn.setAttribute("type", "button");
    // helpBtn.style.backgroundImage = background = `url('${helpBtn}')`;;
    // helpBtn.onclick = `showAbilityHelp(${character.abilities[i]})`;
    // helpBtn.style.float = "inline-end;";
    // helpBtn.style.position = "float";
    img.addEventListener("click", event => {
        let collapsable = document.getElementById(`abilityCollapse${i}`);
        if (collapsable.style.display == "none") {
            collapsable.style.display = "block";
        } else {
            collapsable.style.display = "none";
        }
    });

    let collapsableDiv = document.createElement("div");
    collapsableDiv.id = `abilityCollapse${i}`;
    collapsableDiv.style.display = "none";

    let description = document.createElement("p");
    description.innerText = getAbilityObj(obj).description;
    description.style.color = "#e0dede";
    collapsableDiv.appendChild(description);

    div.appendChild(output);
    div.appendChild(img);
    div.appendChild(collapsableDiv);
    return div;
}

//document.getElementById("religion").addEventListener("click", removeSelect);

function removeSelect() {
    document.getElementById("removableReligion").remove();
    document.getElementById("religion").removeEventListener("click", removeSelect);
}


//Test for adding requirements
if (0) {
    let matrix = [];
    let abilities = [
        "HP+1",
        "HP+2",
        "Specialvåben Tohåndssværd",
        "Fireball",
        "FireWall"
    ];
    abilities.sort((a, b) => {
        a.localeCompare(b);
    })
    for (let i = 0; i < abilities.length; i++) {
        let line = [];
        for (let j = 0; j < abilities.length; j++) {
            line.push(0);
        }
        matrix.push(line);
    }
    //console.log(matrix);

    console.log(JSON.stringify(matrix, {
        //Just metadata stuffs
        encoding: "utf8",
        flag: "a+",
        mode: 0o666,
    }, 4))
    matrix[2][2] = 1;

    //console.log(matrix);
}