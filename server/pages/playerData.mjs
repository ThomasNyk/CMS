import { errorResponse } from "../responseHandlers.mjs";
import { getPostData, validateUserExistence, determineMimeType } from "../serverHelpers.mjs";
import * as fs from 'fs';

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
                            fs.writeFileSync(path, JSON.stringify([], {
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