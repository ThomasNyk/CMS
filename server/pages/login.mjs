import { getPostData } from "../serverHelpers.mjs";
import { determineMimeType } from "../serverHelpers.mjs";
import { uuid } from "uuidv4";

import * as fs from 'fs';

var loginFile = "server/data/logins.json"

export function Login(req, res) {
    getPostData(req)
        .then(data => {
            fs.readFile(loginFile, (err, login) => {
                if (err) {
                    console.log(err);
                    //return errorResponse(res, 404, "404: Not Found: " + err);
                } else {
                    login = JSON.parse(login);
                    let found = false;
                    login.users.forEach(element => {
                        if (element.username.toLowerCase() == data.usr.toLowerCase() && element.password == data.psw) {
                            found = true;
                            let obj = {
                                "statusCode": 200,
                                "id": element.id
                            }
                            res.statusCode = 200;
                            res.setHeader('Content-Type', determineMimeType("login.json"));
                            res.write(JSON.stringify(obj));
                            res.end('\n');
                            return 0;
                        }
                    });
                    if (!found) {
                        res.statusCode = 401;
                        res.setHeader('Content-Type', determineMimeType("login.json"));
                        let obj = {
                            "statusCode": 401,
                        }
                        res.write(JSON.stringify(obj));
                        res.end('\n');
                    }


                    /*res.statusCode = 200;
                    res.setHeader('Content-Type', determineMimeType(fileName));
                    res.write(login);
                    res.end('\n');*/
                }
            });
        })
        .catch(err => {
            console.log("Error getting post data: ", err);
        })
}