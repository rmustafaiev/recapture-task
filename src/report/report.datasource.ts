import * as fs from "node:fs";
import {ReadStream} from "node:fs";

export const JSON_OPT = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

export function createReadableWebStream(url: string):Promise<any>{
    return new Promise(async (resolve, reject) => {
        const response = await fetch(url, JSON_OPT);
        if (!response.ok) {
            reject(`Unable to fetch  ${response.statusText}`)
        }
        resolve(response.body);
    })
}

export function createReadableFsStream(fileName: string): ReadStream {
    return fs.createReadStream(fileName);
}
