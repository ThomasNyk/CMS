import { determineMimeType, getArgs } from "./serverHelpers.mjs";
import { Login } from "./pages/login.mjs"
import * as fs from 'fs';
import { compileAdminPlayerList, getCharacter, GetPlayerData, newUser } from "./pages/playerData.mjs";
import { changeRace, updateGeneralAbilities, changeValuta, updateXp, updateMana, updateHp, changeCharacterTrait, newCharacter, newPlayer, buy, generateToken, getTokens, redeemToken, getGameData } from "./pages/updateThings.mjs";

const operatorPath = "Server/ServerData/operators.json";

//Handles post requests
export function postHandler(req, res) {
    let d = new Date()
    let path = "Server/ServerData/CallerDB/callers" + "-" + d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + ".json";
    console.log(req.url);
    switch (req.url) {
        case "login":
            Login(req, res);
            break;
        case "client/cms/playerData":
            GetPlayerData(req, res);
            break;
        case "getCharacter":
            getCharacter(req, res);
            break;
        case "client/cms/abilityBought":
            updateGeneralAbilities(req, res);
            break;
        case "client/cms/changeRace":
            changeRace(req, res);
            break;
        case "client/cms/changeValuta":
            changeValuta(req, res);
            break;
        case "client/cms/changeXp":
            updateXp(req, res);
            break;
        case "client/cms/changeMana":
            updateMana(req, res);
            break;
        case "client/cms/changeHp":
            updateHp(req, res);
            break;
        case "client/cms/changeCharacterTrait":
            changeCharacterTrait(req, res);
            break;
        case "newCharacter":
            newCharacter(req, res);
            break;
        case "newPlayer":
            newPlayer(req, res)
            break;
        case "buy":
            buy(req, res);
            break;
        case "adminPlayerList":
            compileAdminPlayerList(req, res);
            break;
        case "generateToken":
            generateToken(req, res);
            break;
        case "getTokens":
            getTokens(req, res);
            break;
        case "redeemToken":
            redeemToken(req, res);
            break;
        case "getGameData":
            getGameData(req, res);
            break;
        case "registerUser":
            newUser(req, res);
            break;
        default:
            return errorResponse(res, 404, "Post request not found");

    }
}



//Handles http requests of method type GET
export function getHandler(req, res) {
    //Split the url at "?" as first part is the path to the page and after is
    //arguments
    const splitUrl = req.url.split('?');
    //puts arguments in object args
    const args = getArgs(splitUrl[1]);
    //Depending on the requested page GET requests need to be handled differently
    switch (splitUrl[0]) {
        /*case "Pages/ECC/ecc.html":
            if (pageEcc(req, res, operatorPath) == 1) return 1;
            break;*/
        case "":
            break;
        default:
            break;
    }
    //Continues response
    responseCompiler(req, res);
}

//So far does nothing except continues, might do something later
export function responseCompiler(req, res) {
    fileResponse(req.url, res);
}

//Default file responder simply responds with a file. GET/POST-handler
//can have changes the res(response) object with extra/modified data
//as both calls fileResponse after modifying res
export function fileResponse(url, res) {
    //First part of the url split by "?" is the path
    const path = url.split('?')[0];
    //Last part of the path split is the name of the file
    const fileName = path.split('/')[path.split('/').length - 1];
    //Reads file from disk
    fs.readFile(path, (err, data) => {
        //In case of an error we assume the requested file does not exist
        //and respond with a 404 http code
        if (err) {
            return errorResponse(res, 404, "404: Not Found: " + err);
        } else {
            //everything has now been handled correctly and we can repond
            //with a http 200 code
            res.statusCode = 200;
            //We need to tell what type of file the responded file is so
            //the browser knows what to do with it
            res.setHeader('Content-Type', determineMimeType(fileName));
            //Send the data
            res.write(data);
            //End the transmission
            res.end('\n');
        }
    })
}

//Responds with an error
export function errorResponse(res, code, reason) {
    console.log(reason);
    //Set type to "text/txt" because.... that's the simplest i guess
    res.setHeader('Content-Type', 'text/txt');
    res.statusCode = code;
    //Write reason to user
    res.write(reason);
    res.end("\n");
    return 1;
}