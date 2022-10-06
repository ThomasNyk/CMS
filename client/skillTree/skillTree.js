let offsetX = 150;
let offsetY = 50;
let boxWidth = 50;
let boxHeigt = 20;
let lastPosX = document.getElementById("skillTreeDiv").clientWidth / 2;
let lastPosy = document.getElementById("skillTreeDiv").clientHeight - 500;

let longestBranchFirst;

fetch("../../input.json")
    .then(response => response.json())
    .catch(err => { alert("No calls"); console.log(err) })
    .then(jsonData => {
        //abilities.sort((a, b) => {
        //    a.localeCompare(b);
        //})
        let nameText = jsonData.character.name;
        if (nameText[nameText.length - 1] == "s") {
            nameText += "' ablility sheet";
        } else {
            nameText += "'s ablility sheet";
        }
        document.getElementById("title").innerText = nameText;

        longestBranchFirst = jsonData.abilityMatrix.sort((a, b) => {
            let aLen = CountBranchSize(0, a, jsonData.abilityMatrix);
            let bLen = CountBranchSize(0, b, jsonData.abilityMatrix);
            //console.log(a, aLen, b, bLen);
            return bLen - aLen;
        })
        console.log(longestBranchFirst);
        left = 0;
        right = 0;

        for (let i = 0; i < longestBranchFirst.length; i++) {
            if (longestBranchFirst[i].added != true) {
                longestBranchFirst[i].added = true;
                console.log(longestBranchFirst);
                let level = 0;
                addElement(jsonData.abilityMatrix, longestBranchFirst[i], i, level);
            }
        }

    });

function addElement(abilityMatrix, element, elementNr) {
    console.log("Start ", element[0])
    createElement(element[0]);
    for (let i = 1; i < element.length; i++) {
        if (element[i]) {
            console.log(abilityMatrix[i - 1])
            //createElement(abilityMatrix[i - 1][0]);
            addElement(abilityMatrix,)
        }
    }
}

function createElement(name) {
    let span = document.createElement("span");
    span.style.left = lastPosX + "px";
    span.style.top = lastPosy + "px";
    lastPosy -= offsetY - boxHeigt;
    span.innerText = name;
    findAndAdd(name);
    document.getElementById("skillTreeDiv").appendChild(span);
}

function findAndAdd(name) {
    for (let i = 0; i < longestBranchFirst.length; i++) {
        if (longestBranchFirst[i] == name) {
            longestBranchFirst[i].added = true;
        }
    }
}

function CountBranchSize(count, element, abilityMatrix) {
    let childLengths = [];
    for (let i = 1; i < element.length; i++) {
        if (element[i] == 1) {
            //console.log(element, i - 1);
            //console.log(abilityMatrix[i - 1])
            childLengths.push(CountBranchSize(count, abilityMatrix[i - 1], abilityMatrix));
        }
    }
    let longestChild = 0;
    for (let i = 0; i < childLengths.length; i++) {
        if (longestChild < childLengths[i]) {
            longestChild = childLengths[i];
        }
    }
    return count + longestChild + 1;
}
Array.prototype.contains = function (startNr, target) {
    //console.log(this + " : " + target);
    for (let i = startNr; i < this.length; i++) {
        if (this[i] == target) {
            return true;
        }
    }
    return false;
}

/*
let pos = 0;
document.getElementById("move").addEventListener("click", event => {
pos += 10;
console.log(pos)
elmnt.offsetHeight = (pos) + "px";
elmnt.offsetWidth = (pos) + "px";
});

let elmnt = document.getElementById("test");
function move() {
pos += 10;
console.log("pos")
console.log(elmnt);
console.log(pos + "px");
elmnt.style.top = pos + "px";
elmnt.style.left = pos + "px";
}
*/


/*
var elmnt = document.getElementById("skillTreeDiv");
let enableDrag = false;
var posX = 0, posY = 0, posXmouse = 0, posYmouse = 0;
elmnt.addEventListener("mousedown", event => {
    //console.log("Down");
    if (elmnt.style.left != "") {
        posX = parseInt(elmnt.style.left.slice(0, elmnt.style.left.length - 2));
    }
    if (elmnt.style.top != "") {
        posY = parseInt(elmnt.style.top.slice(0, elmnt.style.top.length - 2));
    }
    //console.log(posX)
    posXmouse = window.event.clientX;
    posYmouse = window.event.clientY;
    elmnt.onmousemove = drag;
});

elmnt.addEventListener("mouseup", event => {
    //console.log("Up");
    elmnt.onmousemove = nothing;
});

function nothing() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
}

function drag() {
    //console.log("drag");
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
elmnt.style.top = (-elmnt.clientHeight / 2.2) + "px";
console.log(window.innerWidth)
elmnt.style.left = ((window.innerWidth / 2) - elmnt.clientWidth / 2) + "px";
*/