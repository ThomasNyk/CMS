if (document.cookie != "pasd") {
    console.log("asdasd");
    window.location.replace("../login/login.html");
} else {
    fetch("../../../input.json")
        .then(response => response.json())
        .catch(err => { alert("No calls"); console.log(err) })
        .then(jsonData => {
            populateFields(jsonData);
        });
}


function populateFields(obj) {
    //document.getElementById("name").value = obj.character.name;
    console.log(obj.character.image)
    if (obj.character.image != undefined && obj.character.image != "") {
        document.getElementById("img").src = obj.character.image;
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