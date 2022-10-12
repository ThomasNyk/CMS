var spacing = 10;
var lastPosX = document.getElementById("skillTreeDiv").clientWidth / 2;
var lastPosy = document.getElementById("skillTreeDiv").clientHeight - 500;
var boxWidth = 100;
var boxHeight = 50;

var maxMatrixDepth = 20;

var longestBranchFirst;

var levelDivs = [];

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
        let abilityMatrix = JSON.parse(JSON.stringify(jsonData.abilityMatrix));
        longestBranchFirst = JSON.parse(JSON.stringify(jsonData.abilityMatrix.sort((a, b) => {
            let aLen = CountBranchSize(0, a, jsonData.abilityMatrix);
            let bLen = CountBranchSize(0, b, jsonData.abilityMatrix);
            //console.log(a, aLen, b, bLen);
            return bLen - aLen;
        })));

        left = 0;
        right = 0;
        let divCounter = 0;
        for (let i = 0; i < longestBranchFirst.length; i++) {
            longestBranchFirst[i].added = false;
        }

        for (let i = 0; i < longestBranchFirst.length; i++) {
            if (longestBranchFirst[i].added != true) {
                let level = 0;
                let branchDiv = document.createElement("div");
                branchDiv.id = `branchDiv${divCounter}`;
                divCounter++;
                document.getElementById("skillTreeDiv").appendChild(branchDiv);
                addElement(abilityMatrix, findNameInMatrix(abilityMatrix, longestBranchFirst[i][0]), level, branchDiv, true, false);
            }
        }

        center()
        drawLines();

    });

function drawLines() {
    let localLevelDivs = levelDivs.reverse();
    //TODO: Clear canvas
    var dimension = [document.documentElement.clientWidth, document.documentElement.clientHeight];
    var c = document.getElementById("canvas");
    c.width = dimension[0];
    c.height = dimension[1];

    var ctx = c.getContext("2d");
    //var ctx = canvas.getContext("2d");
    //ctx.fillStyle = "#FF0000";

    for (let p = 0; p < localLevelDivs.length; p++) {
        let children = localLevelDivs[p].childNodes;
        for (let i = 0; i < children.length; i++) {
            let childrenRelated = getRelatedChildren(children[i].firstChild.innerText, p, localLevelDivs);
            let rect = children[i].getBoundingClientRect(); rect.width
            let x = Math.ceil(rect.left + rect.width / 2);
            let y = rect.top + rect.height;
            console.log(x, y);
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 10);
            ctx.stroke();
        }
    }
}

function getRelatedChildren(name, level, localLevelDivs) {
    let result = [];
    for (let i = 0; i < localLevelDivs[level + 1].length; i++) {
        if (localLevelDivs[level + 1][i].firstChild.innerText = name) {

        }
    }
}

function center() {
    //console.log(levelDivs)
    for (let p = 0; p < levelDivs.length; p++) {


        let children = levelDivs[p].childNodes;
        let right = false;
        let offset = 0;
        for (let i = 0; i < children.length; i++) {
            let marginLeft = children[i].style.marginLeft == undefined ? 0 : children[i].style.marginLeft.slice(0, children[i].style.marginLeft.length - 2)
            //console.log(children[i].style.marginLeft.slice(0, children[i].style.marginLeft.length - 2))
            if (children[i].classList.contains("centered")) {
                right = true;
            } else if (right) {
                offset += (parseInt(Math.ceil(children[i].getBoundingClientRect().width)) + parseInt(marginLeft)) / 2 + 1;
            } else {
                offset -= (parseInt(Math.ceil(children[i].getBoundingClientRect().width)) + parseInt(marginLeft)) / 2 + 1;
            }
        }
        for (let i = 0; i < children.length; i++) {
            children[i].style.left = offset + "px";
        }
    }
}
function addElement(abilityMatrix, elementNr, level, branchDiv, centered, left) {
    if (findAndAdd(abilityMatrix[elementNr][0], false) != true) {
        findAndAdd(abilityMatrix[elementNr][0], true);
        createElement(abilityMatrix[elementNr][0], level, branchDiv, centered, left);

        let count = 0;
        for (let i = 0; i < abilityMatrix.length; i++) {
            if (abilityMatrix[i][elementNr + 1]) {
                count++;
            }
        }
        for (let i = 0; i < abilityMatrix.length; i++) {
            if (abilityMatrix[i][elementNr + 1]) {
                if (elementNr == 0) console.log(i, elementNr);
                if (level > maxMatrixDepth) {
                    console.log("STOOOOP")
                } else {
                    let addLeft = i > count / 2 ? true : false;
                    addElement(abilityMatrix, i, level - 1, branchDiv, false, addLeft);
                }
            }
        }

        for (let i = 1; i < abilityMatrix[elementNr].length; i++) {
            if (abilityMatrix[elementNr][i]) {
                if (level > maxMatrixDepth) {
                    console.log("STOOOOP")
                } else {
                    addElement(abilityMatrix, i - 1, level + 1, branchDiv, true, false);
                }
            }
        }
    } else {
        //console.log("Already added");
    }

}

function createElement(name, level, branchDiv, centered, left) {
    let parentDiv = createLevelDiv(branchDiv, level);
    let div = document.createElement("div");
    div.innerHTML = "<p>" + name + "</p>";
    div.style.margin = "5px";
    div.style.display = "inline-block"
    div.style.height = boxHeight + "px";
    div.style.width = boxWidth + "px";
    div.style.border = "5px red";
    div.style.position = "relative";
    div.style.backgroundColor = "grey";
    div.style.borderRadius = "5px";
    div.classList.add("nodeElement");


    if (centered) div.classList.add("centered");
    findAndAdd(name, true);
    if (left) {
        parentDiv.insertBefore(div, parentDiv.firstChild);
    } else {
        parentDiv.appendChild(div);
    }
    //document.getElementById("skillTreeDiv").appendChild(span);
    return parentDiv;
}

function createLevelDiv(branchDiv, level) {
    let levelDiv = document.getElementById(`${branchDiv.id}Level${level}`);
    if (levelDiv == null) {
        levelDiv = document.createElement("div");
        levelDiv.id = `${branchDiv.id}Level${level}`;
        levelDiv.class = "grid";
        levelDiv.style.marginBottom = "20px";
        branchDiv.appendChild(levelDiv);
        levelDivs.push(levelDiv);
    }
    return document.getElementById(`${branchDiv.id}Level${level}`);
}

function findAndAdd(name, add) {
    for (let i = 0; i < longestBranchFirst.length; i++) {
        if (longestBranchFirst[i][0] == name) {
            if (add) {
                longestBranchFirst[i].added = true;
            } else {
                return longestBranchFirst[i].added;
            }
        }
    }
}

function findNameInMatrix(matrix, name) {
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][0] == name) {
            //console.log("Found: ", name, i)
            return i;
        }
    }
}

function CountBranchSize(count, element, abilityMatrix) {
    let childLengths = [];
    for (let i = 1; i < element.length; i++) {
        if (element[i]) {
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