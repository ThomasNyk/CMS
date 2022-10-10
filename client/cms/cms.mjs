var selectedCharacter = 0;

if (!document.cookie.includes("id") || document.cookie == undefined) {
    window.location.replace("../login/login.html");
} else {
    fetch("../../../gameinfo.json")
        .then(response => response.json())
        .catch(err => { alert("Could not fetch GameInfo"); console.log(err) })
        .then(jsonData => {
            updateFields()
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
        .then(jsonData => {
            for (let i = 0; i < jsonData.length; i++) {
                if (jsonData[i].selected == true) selectedCharacter = i;
            }
            populateFields(jsonData, selectedCharacter);
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

function populateFields(_playerData, selectedCharacterNr) {
    let characters = _playerData.characters;
    let character = characters[selectedCharacterNr];

    document.getElementById("chrName").value = character.name;
    document.getElementById("chrAge").value = character.age;

    document.getElementById("playerName").value = _playerData.playerInfo.name;
    document.getElementById("playerAge").value = _playerData.playerInfo.age;



    let characterSelectorSelect = document.getElementById("characterSelector");
    characterSelectorSelect.addEventListener("change", event => {
        console.log("update");
        selectedCharacter = characterSelectorSelect.selectedIndex;
        updateFields();
    });
    characterSelectorSelect.innerHTML = "";
    for (let i = 0; i < characters.length; i++) {
        let option = document.createElement("option");
        option.innerText = characters[i].name;
        characterSelectorSelect.appendChild(option);
    }
    characterSelectorSelect.value = character.name;


    if (character.image != undefined && character.image != "") {
        document.getElementById("img").src = character.image;
    }

    let xpGrid = document.getElementById("xpGrid");
    xpGrid.innerHTML = "";
    for (let i = 0; i < character.xpArr.length; i++) {
        let div = document.createElement("div");
        div.style.textAlign = "center";
        div.style.padding = "7px";
        div.style.marginBottom = "5px";
        div.style.backgroundColor = "#393939";
        div.style.borderRadius = "5px";

        let output = document.createElement("output");
        output.innerText = character.xpArr[i].name + ": " + character.xpArr[i].value
        output.style.color = "#ffffff"
        output.style.fontSize = "20px";

        div.appendChild(output);
        xpGrid.appendChild(div);
    }

    let abilitiesDiv = document.getElementById("abilitiesDiv");
    for (let i = 0; i < character.abilities.length; i++) {
        let div = document.createElement("div");
        //div.style.textAlign = "center";
        div.style.padding = "7px";
        div.style.marginBottom = "5px";
        div.style.backgroundColor = "#393939";
        div.style.borderRadius = "5px";
        div.style.width = "100%";
        //div.style.

        let output = document.createElement("output");
        output.innerText = character.abilities[i];
        output.style.color = "#ffffff"
        output.style.fontSize = "20px";

        div.appendChild(output);
        abilitiesDiv.appendChild(div);
    }



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
    }*/
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
    console.log(abilities);
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