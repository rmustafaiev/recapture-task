import * as fs from "node:fs";
import {ReadStream} from "node:fs";
import { ReadableStream } from "node:stream/web";

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

export function createReadableWebStream2(url: string):Promise<any>{
    return fetch(url, JSON_OPT)
        .then(res => {
            if (!res.ok)
                throw new Error(`Unable to fetch  ${res.statusText}`);
          return res.body;
        })
}

export function createReadableFsStream(fileName: string): ReadStream {
    return fs.createReadStream(fileName);
}
