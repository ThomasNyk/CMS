let mainUl = document.getElementById("tree");
fetch("../../input.json")
    .then(response => response.json())
    .catch(err => { alert("No calls"); console.log(err) })
    .then(jsonData => {
        //abilities.sort((a, b) => {
        //    a.localeCompare(b);
        //})
        let starters = determineStarters(jsonData.abilityMatrix);


        for (let i = 0; i < starters.length; i++) {
            //console.log("Doing a starter");
            mainUl.appendChild(exploreMatrix(jsonData, starters[i]));
        }
        let nameText = jsonData.character.name;
        if (nameText[nameText.length - 1] == "s") {
            nameText += "' ablility sheet";
        } else {
            nameText += "'s ablility sheet";
        }
        document.getElementById("title").innerText = nameText;
    });

//Explores the matrix for requirements, note: Does not detect loops
function exploreMatrix(jsonData, elementNr) {
    //console.log("Entering ExploreMatrix");
    let li = createTreeNode(elementNr, jsonData.abilities, jsonData.character.abilities);
    let found = false;
    //console.log(elementNr);
    let ulTwo = document.createElement("ul");
    for (let i = 0; i < jsonData.abilityMatrix.length; i++) {

        //console.log(elementNr + " " + i + " : " + jsonData.abilityMatrix[elementNr][i]);

        if (jsonData.abilityMatrix[i][elementNr] == 1) {
            //console.log("Found  AT")
            ulTwo.appendChild(exploreMatrix(jsonData, i));
            li.appendChild(ulTwo);
            found = true;
        }
    }
    if (found) {
        return li;
    } else {
        //console.log("Not found");
        return createTreeNode(elementNr, jsonData.abilities, jsonData.character.abilities);
    }
}

function createTreeNode(i, abilities, chrAbilities) {
    let li = document.createElement("li");
    let span = document.createElement("span");
    span.setAttribute("class", "unselectable")
    span.innerText = abilities[i].name;
    //console.log(chrAbilities);
    if (chrAbilities.contains(abilities[i].name)) {
        span.setAttribute("style", "background-color: #90EE90;");
        //console.log("FOUND")
    }

    span.addEventListener("mouseover", (event) => {
        document.getElementById("hoverName").innerText = abilities[i].name;
        document.getElementById("hoverText").innerText = abilities[i].description;
    });

    li.appendChild(span);
    return li;
}

Array.prototype.contains = function (target) {
    //console.log(this + " : " + target);
    for (let i = 0; i < this.length; i++) {
        if (this[i] == target) {
            return true;
        }
    }
    return false;
}

//Returns a list of numbers corresponding to the starter abilities(Not required by another ability)
function determineStarters(matrix) {
    let starters = []
    for (let i = 0; i < matrix[0].length; i++) {
        let notFound = true;
        for (let p = 0; p < matrix.length; p++) {
            //console.log(i + "length: " + matrix[0].length + "    " + p + "length:" + matrix.length);
            if (matrix[i][p] == 1) {
                notFound = false;
            }
        }
        if (notFound) {
            starters.push(i);
        }
    }
    //console.log(starters);
    return starters;
}

var elmnt = document.getElementById("skillTreeDiv");
let enableDrag = false;
var posX = 0, posY = 0, posXmouse = 0, posYmouse = 0;
elmnt.addEventListener("mousedown", event => {
    console.log("Down");
    if (elmnt.style.left != "") {
        posX = parseInt(elmnt.style.left.slice(0, elmnt.style.left.length - 2));
    }
    if (elmnt.style.top != "") {
        posY = parseInt(elmnt.style.top.slice(0, elmnt.style.top.length - 2));
    }
    console.log(posX)
    posXmouse = window.event.clientX;
    posYmouse = window.event.clientY;
    elmnt.onmousemove = drag;
});

elmnt.addEventListener("mouseup", event => {
    console.log("Up");
    elmnt.onmousemove = nothing;
});

function nothing() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
}

function drag() {
    console.log("drag");
    let e = window.event;

    e.preventDefault();
    // calculate the new cursor position:
    let posXNew = posX + e.clientX - posXmouse;
    let posYNew = posY + e.clientY - posYmouse;
    //console.log(posX + " + " + e.clientX + " - " + posXmouse + "  :  " + (e.clientX - posXmouse));
    //console.log(posXNew);
    // set the element's new position:
    elmnt.style.top = (posYNew) + "px";
    elmnt.style.left = (posXNew) + "px";
}
elmnt.style.top = (20) + "px";
elmnt.style.left = ((window.screen.width / 3) - elmnt.style.width) + "px";