import { errorResponse } from "../responseHandlers.mjs";
import { getPostData, validateUserExistence, determineMimeType, importObject, exportObject } from "../serverHelpers.mjs";
import { getObjectbyProperty, getObjectIndexbyProperty, okResponse } from "./updateThings.mjs";
import * as fs from 'fs';
import exp from "constants";
import { uuid } from "uuidv4";

export function GetPlayerData(req, res) {
    getPostData(req)
        .catch(err => {
            errorResponse(res, 500, err);
            console.log("Could not get postData: " + err);
        })
        .then(data => {

            validateUserExistence(res, data.id)
                .catch(err => {
                    errorResponse(res, 401, "Could not authorize you");
                }).then(valid => {
                    if (valid) {
                        let path = `server/data/playerData/${data.id}.json`
                        if (!fs.existsSync(path)) {
                            fs.writeFileSync(path, JSON.stringify({}, {
                                //Just metadata stuffs
                                encoding: "utf8",
                                flag: "a+",
                                mode: 0o666,
                            }, 4));
                        }

                        fs.readFile(path, (err, fileData) => {
                            if (err) {
                                errorResponse(res, 500, "Could not read playerData file: " + err);
                            } else {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', determineMimeType(".json"));
                                res.write(fileData);
                                res.end('\n');
                                return 0;
                            }
                        });
                    } else {
                        errorResponse(res, 401, "Unauthorized");
                    }
                })
        });
}

export function getCharacter(req, res) {
    getPostData(req)
        .catch(err => {
            errorResponse(res, 500, err);
            console.log("Could not get postData: " + err);
        })
        .then(data => {

            validateUserExistence(res, data.playerId)
                .catch(err => {
                    errorResponse(res, 401, "Could not authorize you");
                }).then(valid => {
                    if (valid) {
                        let path = `server/data/playerData/${data.playerId}.json`
                        if (!fs.existsSync(path)) {
                            errorResponse(res, 404, "Could not find playerFile");
                        }

                        fs.readFile(path, (err, fileData) => {
                            if (err) {
                                errorResponse(res, 500, "Could not read playerData file: " + err);
                            } else {
                                let obj = getObjectbyProperty(JSON.parse(fileData).characters, "id", data.characterId);

                                res.statusCode = 200;
                                res.setHeader('Content-Type', determineMimeType(".json"));
                                if (obj == null) {
                                    errorResponse(res, 404, `Character by id: ${data.characterId} could not be found`);
                                    return 1;
                                }
                                res.write(JSON.stringify(obj));
                                res.end('\n');
                                return 0;
                            }
                        });
                    } else {
                        errorResponse(res, 401, "Unauthorized");
                    }
                })
        });
}

export function compileAdminPlayerList(req, res) {
    getPostData(req)
        .catch(err => {
            errorResponse(res, 500, err);
            console.log("Could not get postData: " + err);
        })
        .then(data => {
            if (verifyAdmin(data.id, res)) {
                let arr = [];
                let path = "server/data/playerData";
                let files = fs.readdirSync(path);
                files.forEach((file) => {
                    let obj = importObject(path + "/" + file);
                    if (Object.keys(obj).length != 0) {
                        let objSmall = {
                            "name": obj.playerInfo.name,
                            "id": obj.playerInfo.id
                        }
                        arr.push(objSmall);
                    }
                });
                console.log(arr);
                okResponse(res, arr);
                return 0;
            }
            errorResponse(res, 401, "Unauthorized admin")
        });
}

export function verifyAdmin(playerId, res) {
    let playerLogin = getObjectbyProperty(importObject("server/data/logins.json", res).users, "id", playerId);
    if (playerLogin != null && playerLogin.isAdmin == true) {
        return true;
    }
    return false;
}

export function newUser(req, res) {
    getPostData(req)
        .catch(err => {
            errorResponse(res, 500, err);
            console.log("Could not get postData: " + err);
        })
        .then(data => {
            let logins = importObject("server/data/logins.json");
            if (getObjectIndexbyProperty(logins.users, "username", data.username) != null) return errorResponse(res, 500, "User exists");
            logins.users.push({
                "username": data.username,
                "password": data.password,
                "id": uuid(),
                "isAdmin": data.isAdmin,
            });
            exportObject("server/data/logins.json", logins, res);
        });
    okResponse(res);
}