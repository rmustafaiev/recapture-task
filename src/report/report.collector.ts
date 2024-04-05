import StreamArray from "stream-json/streamers/StreamArray.js";
import {promisify} from "node:util";
import stream from "node:stream";
import {ReadStream} from "node:fs";
import {Calculator} from "./report.calculator.js";
import EventEmitter from "node:events";

export enum Status {
    pending = "pending",
    progress = "progress",
    completed = "completed"
}

export interface Collector {
    collect(readable: Promise<any> | ReadStream, calculator: Calculator): void;
}

export class Collector extends EventEmitter implements Collector {
    private _status: Status = Status.pending;
    protected _calculator:Calculator|undefined;

    constructor() {
        super();
    }
    protected setStatus(status: Status) {
        if (status !== this._status) {
            this._status = status;
        }
    }

    get status(): Status {
        return this._status;
    }

    collect(readable: Promise<any> | ReadStream , calculator: Calculator): void {
    };

    protected setCalculator(calculator: Calculator): void {
        this._calculator = calculator;
    }
    get calculator():Calculator|undefined {
        return this._calculator;
    }
}

export class InMemoryCollector extends Collector {
    constructor() {
        super();
    }
    async collect(readable: ReadStream, calculator: Calculator): Promise<void> {
        this.setCalculator(calculator);
        return new Promise(async (resolve, reject) => {
            try {
                let rawData = Buffer.alloc(0);
                for await (const chunk of readable) {
                    rawData = Buffer.concat([rawData, chunk]);
                    this.setStatus(Status.progress);
                }
                const jsonData = JSON.parse(rawData.toString());
                for (const item of jsonData) {
                    if (this.calculator)
                        this.calculator.processNext(item);
                    this.emit('progress');
                }
                this.setStatus(Status.completed);
                this.emit('completed');
                resolve();
            } catch (err) {
                this.setStatus(Status.completed);
                this.emit('completed');
                reject(new Error(`InMemoryAggregator: Unable to collect data: ${err}`));
            }
        })
    }
}

export class StreamCollector extends Collector {
    constructor() {
        super();
    }
    public async collect(readable: Promise<any>, calculator: Calculator): Promise<void> {
        this.setCalculator(calculator);
        return new Promise(async (resolve, reject) => {
            try{
                const pipeline = promisify(stream.pipeline);
                const readableStream = await readable;
                await pipeline(readableStream,
                    StreamArray.withParser(),
                    async (parsedIterable) => {
                        for await (const {key: index, value: element} of parsedIterable) {
                            if (this.calculator)
                                this.calculator.processNext(element);
                            this.setStatus(Status.progress);
                            this.emit('progress');
                        }
                    })
                    .then(() => {
                        this.setStatus(Status.completed);
                        this.emit('completed');
                        resolve();
                    })
                    .catch(err => {
                        this.setStatus(Status.completed);
                        this.emit('completed');
                        reject(new Error(`StreamAggregator: Unable to collect data: ${err}`))
                    });
            }
            catch (err) {
                this.setStatus(Status.completed);
                this.emit('completed');
                reject(new Error(`StreamAggregator: Unable to collect data: ${err}`));
            };
        })
    }
}

