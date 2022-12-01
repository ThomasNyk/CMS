import { errorResponse } from "../responseHandlers.mjs";
import { exportObject, getPostData, importObject, determineMimeType } from "../serverHelpers.mjs";

var partialPath = "server/data/playerData/"

export function updateGeneralAbilities(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client"))
        .then(data => {
            //data = JSON.parse(data)
            let diskObj = importObject(partialPath + data.id + ".json");
            let character = getObjectbyProperty(diskObj.characters, "name", data.characterName);
            character.valutas = data.tempValutas;
            character.xpArr = data.tempXp;
            for (let i = 0; i < data.selectedAbilities.length; i++) {
                if (!character.abilities.contains(data.selectedAbilities[i])) {
                    console.log("adding");
                    character.abilities.push(data.selectedAbilities[i]);
                }
            }
            exportObject(partialPath + data.id + ".json", diskObj, res);
            okResponse(res);
        });

}
function okResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', determineMimeType("fileName.json"));
    res.write(JSON.stringify({ "statusCode": 200 }));
    res.end('\n');
}

export function changeRace(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client"))
        .then(data => {
            //data = JSON.parse(data)
            let diskObj = importObject(partialPath + data.id + ".json");
            let character = getObjectbyProperty(diskObj.characters, "name", data.characterName);
            character.race = data.newRace;
            exportObject(partialPath + data.id + ".json", diskObj, res);
            okResponse(res);
        });
}

export function changeValuta(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client"))
        .then(data => {
            //data = JSON.parse(data)
            let diskObj = importObject(partialPath + data.id + ".json");
            let character = getObjectbyProperty(diskObj.characters, "name", data.characterName);
            getObjectbyProperty(character.valutas, "name", data.valutaName).value = parseInt(data.value);
            exportObject(partialPath + data.id + ".json", diskObj, res);
            okResponse(res);
        });
}

function getObjectbyProperty(arr, property, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][property] == target) return arr[i];
    }
}

export function updateXp(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client"))
        .then(data => {
            //data = JSON.parse(data)
            let diskObj = importObject(partialPath + data.id + ".json");
            let character = getObjectbyProperty(diskObj.characters, "name", data.characterName);
            getObjectbyProperty(character.xpArr, "name", data.xpName).value = parseInt(data.xpValue);
            exportObject(partialPath + data.id + ".json", diskObj, res);
            okResponse(res);
        });
}

export function updateHp(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client"))
        .then(data => {
            //data = JSON.parse(data)
            let diskObj = importObject(partialPath + data.id + ".json");
            let character = getObjectbyProperty(diskObj.characters, "name", data.characterName);
            character.hp = parseInt(data.hp);
            exportObject(partialPath + data.id + ".json", diskObj, res);
            okResponse(res);
        });
}
export function updateMana(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client"))
        .then(data => {
            //data = JSON.parse(data)
            let diskObj = importObject(partialPath + data.id + ".json");
            let character = getObjectbyProperty(diskObj.characters, "name", data.characterName);
            character.mana = parseInt(data.mana);
            exportObject(partialPath + data.id + ".json", diskObj, res);
            okResponse(res);
        });
}

export function changeCharacterTrait(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            console.log("data");
            console.log(data);
            //data = JSON.parse(data)
            let diskObj = importObject(partialPath + data.id + ".json");
            let character = getObjectbyProperty(diskObj.characters, "name", data.characterName);
            if (character[data.trait] == null) {
                errorResponse(res, 400, "Non-existent trait");
            } else {
                character[data.trait] = data.data;
                exportObject(partialPath + data.id + ".json", diskObj, res);
                okResponse(res);
            }
        });
}