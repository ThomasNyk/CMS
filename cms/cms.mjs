var selectedCharacter = 0;
var selectedReligion = 0;
var selectedOverlay;
var overlaySelectedIndex = 0;
var selectedAbilities = [];
const helpbTnIcon = "/client/cms/images/Icon-round-Question_mark.svg";
var playerData;
var gameInfo;
var tempValutas;
var tempXp;
var globalOverride = false;

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

function populateFields(_playerData, selectedCharacterNr, gameInfo) {

    let characters = _playerData.characters;
    let character = characters[selectedCharacterNr];

    populateNameAndImg(character, _playerData);

    //Charater
    makeSelector("characterSelector", characters, character.name, selectedCharacterUpdate);

    buildDivList("xpGrid", character.xpArr, buildXpElement, gameInfo.XpTypes);

    buildDivList("abilitiesDiv", character.abilities, buildAbilityDivElement);

    buildDivList("valuta", character.valutas, buildValutaElement, gameInfo.valutas);

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

function buildValutaElement(obj, i, gameInfoValutaObj) {
    let div = document.createElement("div");
    div.setAttribute("style", "display:inline-block; width: 4vw;");

    let hThree = document.createElement("h3");
    hThree.innerText = gameInfoValutaObj.name;
    hThree.style.textAlign = "center";
    hThree.classList.add("scrollAdd");
    div.appendChild(hThree);

    let divTwo = document.createElement("div");
    divTwo.setAttribute("style", "background-image: url(../cms/images/Green_hexagon.svg); user-select: none;");
    divTwo.classList.add("valuta");
    divTwo.classList.add("scrollAdd");


    let input = document.createElement("input");
    input.classList.add("valutaValue");
    input.classList.add("scrollAdd");
    input.max = 999;
    input.min = 0;
    input.value = getObjectbyProperty(obj, "name", gameInfoValutaObj.name).value
    input.name = gameInfoValutaObj.name
    input.addEventListener("change", changeValuta)

    divTwo.appendChild(input);

    div.appendChild(divTwo);

    return div;
}

function getObjectbyProperty(arr, property, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][property] == target) return arr[i];
    }
}

let added = false;
function addEventListeners() {
    document.getElementById("newProfession").addEventListener("click", newProfession);
    document.getElementById("newGeneralAbility").addEventListener("click", newGeneralAbility);
    document.getElementById("newSpecialAbility").addEventListener("click", newSpecialAbility);
    document.getElementById("tint").addEventListener("click", hideOverlay);
    document.getElementById("oConfirm").addEventListener("click", pushNewAbiltiesToServer);
    document.getElementById("oReset").addEventListener("click", resetOverlay);
    document.getElementById("hp").addEventListener("change", event => {
        let newHp = event.target.value
        if (newHp == "") {
            alert("Please enter a whole number");
        } else {
            let obj = {
                "id": document.cookie.split("=")[1],
                "characterName": playerData.characters[selectedCharacter].name,
                "hp": newHp
            }
            fetch("changeHp", {
                method: "POST",
                body: JSON.stringify(obj),
            })
                .then(response => response.json())
                .catch(err => { alert("No response from server: ", err); })
                .then(data => {
                });
        }
    });
    document.getElementById("hp").addEventListener("change", event => {
        let mana = event.target.value
        if (mana == "") {
            alert("Please enter a whole number");
        } else {
            let obj = {
                "id": document.cookie.split("=")[1],
                "characterName": playerData.characters[selectedCharacter].name,
                "mana": mana
            }
            fetch("changeMana", {
                method: "POST",
                body: JSON.stringify(obj),
            })
                .then(response => response.json())
                .catch(err => { alert("No response from server: ", err); })
                .then(data => {
                });
        }
    });


    //document.getElementById("valuta").addEventListener("mouseover", addScrollListener);
    /*let scrollElements = document.getElementsByClassName("scrollAdd");
    for (let i = 0; scrollElements.length; i++) {
        scrollElements[i].addEventListener("mouseover", addScrollListener);
    }*/
    /*
    document.getElementById("valuta").addEventListener("mouseout", event => {
        console.log("remove");
        if (added) {
            window.removeEventListener("wheel", scroll);
            added = false;
        } else {
            console.log("mouseOverFaultOut");
        }
    });*/
}

function changeValuta(e) {
    let obj = {
        "id": document.cookie.split("=")[1],
        "characterName": playerData.characters[selectedCharacter].name,
        "valutaName": e.target.name,
        "value": e.target.value
    }
    fetch("changeValuta", {
        method: "POST",
        body: JSON.stringify(obj),
    })
        .then(response => response.json())
        .catch(err => { alert("No response from server: ", err); })
        .then(data => {
            globalOverride = true;
        });
}

function resetOverlay() {
    selectedAbilities = [];
    tempValutas = JSON.parse(JSON.stringify(playerData.characters[selectedCharacter].valutas));
    buildOverlay(selectedOverlay, true);
}

function pushNewAbiltiesToServer() {
    let btn = document.getElementById("oConfirm");
    btn.disabled = true;
    let obj = {
        "id": document.cookie.split("=")[1],
        "characterName": playerData.characters[selectedCharacter].name,
        tempValutas,
        tempXp,
        selectedAbilities
    }
    if (selectedAbilities.length > 0) {
        fetch("abilityBought", {
            method: "POST",
            body: JSON.stringify(obj),
        })
            .then(response => response.json())
            .catch(err => { alert("No response from server: ", err); btn.disabled = false; })
            .then(data => {
                resetOverlay();
                hideOverlay();
                populateNameAndImg(characters[selectedCharacter], playerData);
                populateFields(playerData, selectedCharacter, gameInfo);
                btn.disabled = false;
            })
    } else {
        alert("Select items by clicking them please");
    }
}

function addScrollListener(e) {
    document.addEventListener("mousemove", e => {
        let bodySroll = window.scrollY + 17;
        console.log("Scroll", bodySroll);
        let rect = document.getElementById("valuta").getBoundingClientRect();
        if (e.pageX != null && e.pageX != null) {
            console.log(e.pageX, e.pageY, "   ", (rect.top + bodySroll));
            //console.log(e.pageY > (rect.top + rect.height + bodySroll))
            //console.log(e.pageX < rect.left)
            //console.log(e.pageX > (rect.left + rect.width));
            //console.log(e.pageY, (rect.top + rect.height));

            if (e.pageY < (rect.top + bodySroll) || e.pageY > (rect.top + rect.height + bodySroll) || e.pageX < rect.left || e.pageX > (rect.left + rect.width)) {
                console.log("removed");
                console.log(e.pageY < (rect.top + bodySroll))
                console.log(e.pageY, (rect.top + bodySroll))
                window.removeEventListener("wheel", scroll);
                added = false;
            }

        }
    })
    console.log("add");
    if (!added && e.target.scrollWidth > e.target.clientWidth) {
        window.addEventListener("wheel", scroll, { passive: false });
        added = true;
    } else {
        console.log("mouseOverFaultIn");
    }
}

function scroll(e) {
    console.log("scroll");
    e.preventDefault();
    let div = document.getElementById("valuta")
    if (e.deltaY > 0) div.scrollLeft += 100;
    else div.scrollLeft -= 100;
}

function changeReligion(e) {
    let obj = {
        "id": document.cookie.split("=")[1],
        "characterName": playerData.characters[selectedCharacter].name,
        "newRace": e.target.value,
    }
    fetch("changeRace", {
        method: "POST",
        body: JSON.stringify(obj),
    })
        .then(response => response.json())
        .catch(err => { alert("No response from server: ", err); })
        .then(data => {
            resetOverlay();
            hideOverlay();
            populateFields(playerData, selectedCharacter, gameInfo);
        })
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

function buildOverlayValutaElement(arr, i, gameInfoValutaObj) {
    let div = document.createElement("div");
    div.setAttribute("style", "background-color: rgb(30, 30, 30); margin-bottom: 10px; border-radius: 7px;");

    let output = document.createElement("output");
    let obj = getObjectbyProperty(arr, "name", gameInfoValutaObj.name);
    output.setAttribute("style", "color: white; font-size: x-large; padding-left: 5px;")
    output.innerText = obj.name + ": " + obj.value;


    div.appendChild(output);

    return div;
}

function buildOverlay(type, override) {
    if (selectedOverlay == type && !override == true && !globalOverride == true) {
        console.log("ignoring update");
        globalOverride = false;
        return;
    }
    selectedOverlay = type;
    let obj;
    let title;
    switch (selectedOverlay) {
        case "profession":
            obj = gameInfo.professions;
            title = "Profession";
            buildDivList("oListDiv", obj, buildOListElementProfession);
            break;
        case "generalAbility":
            tempValutas = JSON.parse(JSON.stringify(playerData.characters[selectedCharacter].valutas));
            tempXp = JSON.parse(JSON.stringify(playerData.characters[selectedCharacter].xpArr));
            buildDivList("oValutas", tempValutas, buildOverlayValutaElement, gameInfo.valutas)
            buildDivList("oValutas", tempXp, buildOverlayValutaElement, gameInfo.XpTypes, true);
            obj = checkRequirements(gameInfo.abilities, "abilityMatrix");
            title = "General Ability";
            buildDivList("oListDiv", obj, buildOListElement);
            break;
        case "specialAbility":
            obj = gameInfo.specialAbilities;
            title = "Special Ability";
            break;
    }
    document.getElementById("oTitle").innerText = title;
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

    // document.getElementById("oValutas").innerText = `Valuta: ${playerData.characters[selectedCharacter].valuta}`;
    // document.getElementById("oCost").innerText = `Cost: ${playerData.characters[selectedCharacter].valuta - tempValuta}`;
    // document.getElementById("oLeft").innerText = `Left: ${tempValuta}`;



    div.addEventListener("mouseover", event => {
        overlaySelectedIndex = i;
        updateInfo(obj);
    });
    let bgColor;
    let color;
    let selected;
    if (selectedAbilities.length <= 0)
        selected = false;
    else selected = selectedAbilities.contains(obj.name);

    let valuta = getObjectbyProperty(tempValutas, "name", obj.valuta);
    if ((valuta.value >= obj.cost && canAfforXp(tempXp, obj.xpCosts)) || selected) {
        bgColor = "#02cf0c";
        div.addEventListener("click", event => {
            if (selected) {
                console.log("deselecting");
                valuta.value += obj.cost;
                updateLocalXp(tempXp, getObjectbyProperty(gameInfo.abilities, "name", obj.name).xpCosts, false);
                if (selectedAbilities != undefined) selectedAbilities = removeItem(selectedAbilities, obj.name);
            } else {
                console.log("selecting");
                valuta.value -= obj.cost;
                selectedAbilities.push(obj.name);
                console.log(obj.name, getObjectbyProperty(gameInfo.abilities, "name", obj.name).xpCosts);
                updateLocalXp(tempXp, getObjectbyProperty(gameInfo.abilities, "name", obj.name).xpCosts, false);
            }
            buildDivList("oValutas", tempValutas, buildOverlayValutaElement, gameInfo.valutas);
            buildDivList("oValutas", tempXp, buildOverlayValutaElement, gameInfo.XpTypes, true);
            buildDivList("oListDiv", checkRequirements(gameInfo.abilities, "abilityMatrix"), buildOListElement);
        });
    } else {
        bgColor = "#191919";
    }
    if (selected) {
        bgColor = "#0dfce0";
        color = "#ffffff"
    }

    div.setAttribute("style", `background-color: ${bgColor}; color: ${color}; text-align: center; margin-bottom: 10px; border-radius: 10px; height: 4vh;`)

    let output = document.createElement("output");
    output.style.color = "white";
    output.value = obj.name;
    output.style.verticalAlign = "middle";
    output.style.pointerEvents = "none";
    let outputTwo = document.createElement("output");
    outputTwo.setAttribute("style", "color: white; display: block");
    outputTwo.style.pointerEvents = "none";
    outputTwo.innerText = `Cost: ${obj.cost} ${obj.valuta}` + addMoreCosts(getObjectbyProperty(gameInfo.abilities, "name", obj.name).xpCosts);

    div.appendChild(output);
    div.appendChild(outputTwo)
    return div;
}

function addMoreCosts(prices) {
    let str = "";
    for (let i = 0; i < prices.length; i++) {
        str += `, ${prices[i].name}: ${prices[i].value}`
    }
    return str;
}

function updateLocalXp(wallet, prices, add) {
    for (let p = 0; p < prices.length; p++) {
        let xp = getObjectbyProperty(wallet, "name", prices[p].name);
        if (add) xp.value += prices[p].value;
        else xp.value -= prices[p].value;
    }
}

function canAfforXp(wallet, prices) {
    let canAfford = true;
    for (let i = 0; i < prices.length; i++) {
        for (let p = 0; i < wallet.lengthM; p++) {
            if (wallet[p].name == prices[i].name && wallet[p].value < prices[i].value) {
                canAfford = false;
            }
        }
    }
    return canAfford;
}

function buildOListElementProfession(obj, i) {
    let div = document.createElement("div");

    div.addEventListener("mouseover", event => {
        overlaySelectedIndex = i;
        updateInfo(obj);
    });

    div.addEventListener("click", event => {
        alert("I don't know the expected behaviour");
        hideOverlay();
        /*
        let objTwo = {
            "id": document.cookie.split("=")[1],
            "characterName": playerData.characters[selectedCharacter].name,
            "professionName": obj.name
        }
        
        fetch("", {
            method: "POST",
            body: JSON.stringify(obj),
        })
            .then(response => response.json())
            .catch(err => { alert("No response from server: ", err); })
            .then(data => {
                resetOverlay();
                hideOverlay();
                populateFields(playerData, selectedCharacter, gameInfo);
            })*/
    });


    div.setAttribute("style", `background-color: #191919; color: white; text-align: center; margin-bottom: 10px; border-radius: 10px; height: 4vh;`)

    let output = document.createElement("output");
    output.style.color = "white";
    output.value = obj.name;
    output.style.verticalAlign = "middle";
    output.style.pointerEvents = "none";

    div.appendChild(output);
    return div;
}

function removeItem(arr, target) {
    let newArrTest = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] != target) {
            newArrTest.push(arr[i]);
        }
    }
    return newArrTest;
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

    document.getElementById("hp").value = character.hp;
    document.getElementById("mana").value = character.mana;
}

function makeSelector(selectorID, dataArr, selectedName, ChangeFunction) {
    let selector = document.getElementById(selectorID);
    selector.addEventListener("change", ChangeFunction, false);
    selectedAbilities = [];
    selectedOverlay = "";
    buildDivList(selectorID, dataArr, buildSelectorOption);
    selector.value = selectedName;
}

function selectedCharacterUpdate(evt) {
    selectedCharacter = evt.target.selectedIndex;
    selectedOverlay = "";
    updateFields();
}

function buildSelectorOption(obj, i) {
    let option = document.createElement("option");
    option.innerText = obj.name;
    return option;
}

function buildXpElement(charArr, i, obj) {
    let div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.padding = "7px";
    div.style.marginBottom = "5px";
    div.style.backgroundColor = "#393939";
    div.style.borderRadius = "5px";
    div.style.display = "inline-block";

    let charObj = getObjectbyProperty(charArr, "name", obj.name)
    let output = document.createElement("output");
    output.innerText = charObj.name + ":"
    output.style.color = "#ffffff"
    output.style.fontSize = "20px";

    let input = document.createElement("input");
    input.type = "number";
    input.value = charObj.value;
    input.setAttribute("style", "background: none; border: none;");
    input.classList.add("numberbutton");
    input.addEventListener("change", event => {
        if (event.target.value == "") {
            alert("Please enter a number");
        } else {
            let obj = {
                "id": document.cookie.split("=")[1],
                "characterName": playerData.characters[selectedCharacter].name,
                "xpName": charObj.name,
                "xpValue": input.value,
            }
            fetch("changeXp", {
                method: "POST",
                body: JSON.stringify(obj),
            })
                .then(response => response.json())
                .catch(err => { alert("No response from server: ", err); })
                .then(data => {
                    getObjectbyProperty(playerData.characters[selectedCharacter].xpArr, "name", obj.xpName).value = obj.xpValue;
                    globalOverride = true;
                });
        }
    })


    div.appendChild(output);
    div.appendChild(input);
    return div;
}

function buildDivList(divId, array, buildElementFunction, optionalArray, dontClear = false) {
    let size = array.length;
    if (optionalArray != undefined) size = optionalArray.length;
    let div = document.getElementById(divId);
    if (dontClear != true) {
        div.innerHTML = "";
    }
    if (optionalArray == undefined) {
        // console.log("3 arguments");
        for (let i = 0; i < size; i++) {
            div.appendChild(buildElementFunction(array[i], i));
        }
    } else {
        // console.log("4 arguments");
        for (let i = 0; i < size; i++) {
            div.appendChild(buildElementFunction(array, i, optionalArray[i]));
        }
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
}