import { nanoid } from "nanoid";
import { uuid } from "uuidv4";
import { errorResponse } from "../responseHandlers.mjs";
import { exportObject, getPostData, importObject, determineMimeType } from "../serverHelpers.mjs";
import { verifyAdmin } from "./playerData.mjs";
import * as fs from 'fs';

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
                    //console.log("adding");
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
    if (arr == undefined) return null;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][property] == target) return arr[i];
    }
}
export function getObjectIndexbyProperty(arr, property, target) {
    if (arr == undefined) return null;
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
            let diskObj = importObject(partialPath + data.playerId + ".json");
            let characterIndex = getObjectIndexbyProperty(diskObj.characters, "id", data.characterId);
            if (false && diskObj["characters"][characterIndex][data.trait] == null) {
                errorResponse(res, 400, "Non-existent trait");
            } else {
                diskObj["characters"][characterIndex][data.trait] = data.data;

                exportObject(partialPath + data.playerId + ".json", diskObj, res);
                okResponse(res);
            }
        });
}

export function newCharacter(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            let imagePath;
            if (data.fileExtension != undefined && data.fileExtension != "") {
                const ARTWORK_PATH = "server/data/images/";
                //console.log(data.imageData);
                let imageBuffer = Buffer.from(data.imageData, 'base64');
                let fileName = nanoid(20);
                imagePath = ARTWORK_PATH + fileName + "." + data.fileExtension
                fs.writeFile(ARTWORK_PATH + fileName + "." + data.fileExtension, imageBuffer, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("The file was saved!");
                    }
                });
            }


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
                    "image": imagePath,
                }
                diskObj["characters"].push(tempObj);

                //console.log(data.RacList);
                //console.log(diskObj["characters"]);
                //console.log(data.id);

                let characterIndex = getObjectIndexbyProperty(diskObj["characters"], "id", tempObj.id);
                //console.log(characterIndex);
                let UIDType = data.RacList[0].split("-/")[0];
                diskObj = handleFreeAbilities(diskObj, characterIndex, data.RacList[0], UIDType);
                //diskObj = handleAffectedResources(diskObj, characterIndex, data.RacList[0], data.RacList[0],);
            }
            exportObject(partialPath + data.id + ".json", diskObj, res);

            //console.log(tempObj);
            okResponse(res, tempObj);
        });
}

function handleAffectedResources(diskObj, characterIndex, boughtUID, boughtItemUid) {
    console.log(boughtItemUid);
    let UIDType = boughtUID.split("-/")[0];
    let gameData = importObject("gameinfo.json");
    //console.log(gameData);
    //console.log(boughtItem);
    let race = getObjectbyProperty(gameData[UIDType], "UID", boughtItemUid);
    console.log(race);
    for (let i = 0; i < race.AffectedResources.length; i++) {
        let resUidtoAffect = race.AffectedResources[i]["UID"];
        let UIDTypeTwo = resUidtoAffect.split("-/")[0];
        let indexToAffect = getObjectIndexbyProperty(diskObj["characters"][characterIndex][UIDTypeTwo], "UID", resUidtoAffect);
        if (indexToAffect == null) {
            if (diskObj["characters"][characterIndex][UIDTypeTwo] == undefined) diskObj["characters"][characterIndex][UIDTypeTwo] = [];
            console.log("Make");
            diskObj["characters"][characterIndex][UIDTypeTwo].push({
                "UID": resUidtoAffect,
                "Amount": race.AffectedResources[i].Amount
            });
            console.log(diskObj["characters"][characterIndex][UIDTypeTwo]);
        } else {
            console.log("Add");
            console.log(diskObj["characters"][characterIndex][UIDTypeTwo][indexToAffect]);
            diskObj["characters"][characterIndex][UIDTypeTwo][indexToAffect].Amount += race.AffectedResources[i].Amount
            console.log(diskObj["characters"][characterIndex][UIDTypeTwo][indexToAffect]);
        }
    }
    //console.log(diskObj);
    return diskObj;
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
    //console.log(boughtItem);

    if (boughtItem != null && boughtItem.FreeAbilities != null) {
        for (let i = 0; i < boughtItem.FreeAbilities.length; i++) {
            let UIDTypeTwo = boughtItem.FreeAbilities[i].split("-/")[0];
            if (diskObj["characters"][characterIndex][UIDTypeTwo] == undefined) diskObj["characters"][characterIndex][UIDTypeTwo] = [];
            diskObj["characters"][characterIndex][UIDTypeTwo].push(boughtItem.FreeAbilities[i]);
        }
    }
    return diskObj;
}

export function generateToken(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            if (!verifyAdmin(data.playerId, res)) return errorResponse(res, 401, "Unauthorized admin");
            let tokenList = importObject("server/data/tokens.json", res);
            let token = {
                "UID": nanoid(10),
                "Type": 0,
                "TokenUID": data.UID,
                "TokenAmount": data.Amount,
                "Name": data.Name,
            }
            if (tokenList[data.playerId] == undefined) tokenList[data.playerId] = [];
            tokenList[data.playerId].push(token);
            exportObject("server/data/tokens.json", tokenList, res);
            okResponse(res, { "statusCode": 200, "data": token });
        });
}

export function getTokens(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            //console.log(data.playerId);
            if (!verifyAdmin(data.playerId, res)) return errorResponse(res, 401, "Unauthorized admin");
            let tokenList = importObject("server/data/tokens.json", res);

            if (tokenList[data.playerId] == undefined) tokenList[data.playerId] = [];
            //console.log(tokenList[data.playerId])
            okResponse(res, tokenList[data.playerId]);
        });
}

export function redeemToken(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            let tokenList = importObject("server/data/tokens.json", res);

            let toReturn = null;
            for (const [key, value] of Object.entries(tokenList)) {
                for (let i = 0; i < value.length; i++) {
                    if (value[i].UID == data.UID) {
                        toReturn = value[i];
                        tokenList[key].splice(i, 1);
                    }
                }
            }
            if (toReturn == null) {
                errorResponse(res, 404, "Invalid Token");
                return 1;
            }

            let path = `server/data/playerData/${data.playerId}.json`
            if (!fs.existsSync(path)) {
                errorResponse(res, 404, "Could not find playerFile");
            }

            fs.readFile(path, (err, fileData) => {
                if (err) {
                    errorResponse(res, 500, "Could not read playerData file: " + err);
                } else {
                    let characterIndex = getObjectIndexbyProperty(JSON.parse(fileData).characters, "id", data.characterId);
                    fileData = JSON.parse(fileData);
                    res.statusCode = 200;
                    if (characterIndex == null) {
                        errorResponse(res, 404, `Character by id: ${data.characterId} could not be found`);
                        return 1;
                    }
                    //console.log(toReturn);
                    let UIDType = toReturn.TokenUID.split("-/")[0];
                    //console.log(fileData);
                    if (fileData.characters[characterIndex][UIDType] == undefined) fileData.characters[characterIndex][UIDType] = [];
                    let resIndex = getObjectIndexbyProperty(fileData.characters[characterIndex][UIDType], "UID", toReturn.TokenUID);
                    if (resIndex == null) {
                        fileData.characters[characterIndex][UIDType].push({
                            "UID": toReturn.TokenUID,
                            "Amount": toReturn.TokenAmount,
                        });
                    } else {
                        fileData.characters[characterIndex][UIDType][resIndex].Amount += toReturn.TokenAmount;
                    }

                    exportObject(path, fileData, res);
                    return 0;
                }
            });



            exportObject("server/data/tokens.json", tokenList, res);
            okResponse(res, toReturn);
        });
}

export function getGameData(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            let gameData = importObject("gameinfo.json", res);

            okResponse(res, gameData);
        });
}

export function uploadImage(req, res) {
    getPostData(req)
        .catch(err => errorResponse(res, 500, "Could not get PostData from client: " + err))
        .then(data => {
            let gameData = importObject("gameinfo.json", res);

            okResponse(res, gameData);
        });
}