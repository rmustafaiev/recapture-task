import { Calculator } from './report.calculator.js';
import EventEmitter from 'node:events';
import { readJsonStream } from '../util/jsonstream.js';

export interface DataReader {
  read(path: string, calculator: Calculator): void;
}

export class DataReader extends EventEmitter implements DataReader {
  private _calculator: Calculator = new Calculator();
  private path: string;
  get calculator(): Calculator {
    return this._calculator;
  }

  constructor(path: string, calculator: Calculator) {
    super();
    this.path = path;
    this._calculator = calculator;
  }

  async read(): Promise<void> {
    await readJsonStream(this.path, (err, data) => {
      if (err) {
        this.emit('error', err);
        throw err;
      }
      this.calculator.processNext(data);
      this.emit('progress', this.calculator.result());
    });
    this.emit('complete', this.calculator.result());
  }
}
