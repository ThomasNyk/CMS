import { uuid } from "uuidv4";
import { errorResponse } from "../responseHandlers.mjs";
import { exportObject, getPostData, importObject, determineMimeType } from "../serverHelpers.mjs";
import { verifyAdmin } from "./playerData.mjs";

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
export function okResponse(res, argument) {

    res.statusCode = 200;
    res.setHeader('Content-Type', determineMimeType("fileName.json"));
    if (argument == undefined) {
        res.write(JSON.stringify({ "statusCode": 200 }));
    } else {
        res.write(JSON.stringify(argument));
    }
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

export function getObjectbyProperty(arr, property, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][property] == target) return arr[i];
    }
}
export function getObjectIndexbyProperty(arr, property, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][property] == target) return i;
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
            //console.log("data");
            //console.log(data);
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

export function newCharacter(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            let tempObj;
            let diskObj = importObject(partialPath + data.id + ".json");
            if (diskObj["characters"] == null) {
                diskObj["characters"] = [];
            }
            if (diskObj["characters"].containsAttribute(data.id, "id")) {
                errorResponse(res, 500, "Character with id already exsists")
            } else {
                tempObj = {
                    "id": uuid(),
                    "name": data.name,
                    "AbiList": data.AbiList,
                    "RacList": data.RacList,
                }
                diskObj["characters"].push(tempObj);

                //console.log(data.RacList);
                //console.log(diskObj["characters"]);
                //console.log(data.id);

                let characterIndex = getObjectIndexbyProperty(diskObj["characters"], "id", tempObj.id);
                //console.log(characterIndex);
                let UIDType = data.RacList[0].split("-/")[0];
                diskObj = handleFreeAbilities(diskObj, characterIndex, data.RacList[0], UIDType);
            }
            exportObject(partialPath + data.id + ".json", diskObj, res);

            console.log(tempObj);
            okResponse(res, tempObj);
        });
}

export function newPlayer(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            let diskObj = importObject(partialPath + data.id + ".json");

            if (verifyAdmin(data.id, res)) data.isAdmin = true;
            diskObj["playerInfo"] = data;

            exportObject(partialPath + data.id + ".json", diskObj, res);
            okResponse(res);
        });
}

export function buy(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            let diskObj = importObject(partialPath + data.playerId + ".json");
            let characterIndex = getObjectIndexbyProperty(diskObj["characters"], "id", data.characterId);
            let UIDType = data.UID.split("-/")[0];

            if (diskObj["characters"][characterIndex][UIDType] == null) {
                diskObj["characters"][characterIndex][UIDType] = [];
            }
            if (diskObj["characters"][characterIndex][UIDType].containsAttribute(data.UID, "UID")) {
                errorResponse(res, 500, "Ability with UID already exsists in your abilityList")
            } else {


                diskObj = handleFreeAbilities(diskObj, characterIndex, data.UID, UIDType);

                if (UIDType == "RelList") diskObj["characters"][characterIndex][UIDType] = [];

                diskObj["characters"][characterIndex][UIDType].push(data.UID);



                for (const [key, value] of Object.entries(data.costs)) {
                    let UIDTypeTwo = key.split("-/")[0];
                    let resIndex = getObjectIndexbyProperty(diskObj["characters"][characterIndex][UIDTypeTwo], "UID", key);

                    diskObj["characters"][characterIndex][UIDTypeTwo][resIndex].Amount -= parseInt(value);

                }
            }
            exportObject(partialPath + data.playerId + ".json", diskObj, res);
            okResponse(res);
        });
}

function handleFreeAbilities(diskObj, characterIndex, boughtItemUid, UIDType) {
    let gameData = importObject("gameinfo.json");
    //console.log(gameData);
    let boughtItem = getObjectbyProperty(gameData[UIDType], "UID", boughtItemUid);

    if (boughtItem != null && boughtItem.FreeAbilities != null) {
        for (let i = 0; i < boughtItem.FreeAbilities.length; i++) {
            let UIDTypeTwo = boughtItem.FreeAbilities[i].split("-/")[0];
            if (diskObj["characters"][characterIndex][UIDTypeTwo] == undefined) diskObj["characters"][characterIndex][UIDTypeTwo] = [];
            diskObj["characters"][characterIndex][UIDTypeTwo].push(boughtItem.FreeAbilities[i]);
        }
    }
    return diskObj;
}