import { json } from 'node:stream/consumers';
import * as fs from 'node:fs';
import { ReadStream } from 'node:fs';
import { promisify } from 'node:util';
import stream from 'node:stream';
import StreamArray from 'stream-json/streamers/StreamArray.js';
import { AppError } from '../error/errors.js';
import { ReadableStream } from 'node:stream/web';

const urlLike = (str: string) => /^(ftp|http|https):\/\/[^ "]+$/.test(str);

export async function readJsonFile(
  filePath: string,
): Promise<object[] | object | unknown> {
  const stream = fs.createReadStream(filePath);
  return json(stream);
}

export function createReadableStream(fileName: string): ReadStream {
  return fs.createReadStream(fileName);
}

/**
 * Read the JSON stream from the specified path. It can be either local file or an URL.
 * @param {string} path - The path to the JSON stream. filePath|Url
 * @param {(err: Error | null, data: object | null) => void} chunkCb
 * - The callback function to be called for each chunk of data read from the stream.
 *   Receives an error object (if any) and the data chunk as parameters.
 * @returns {Promise<void>} - A promise that resolves when the stream has been fully read, or rejects if an error occurs during reading.
 */
export async function readJsonStream(
  path: string,
  chunkCb: (err: Error | unknown, data: object | null) => void,
): Promise<void> {
  try {
    if (!chunkCb) {
      throw new AppError('Chunk read callback must be provided', '');
    }

    let readableStream: ReadableStream | ReadStream;
    if (urlLike(path)) {
      const response = await fetch(path);
      if (!response.ok) {
        throw new AppError(
          `Unable to load data: ${path} -- ${response.statusText}`,
        );
      }
      readableStream = response.body as ReadableStream;
    } else {
      readableStream = createReadableStream(path) as ReadStream;
    }

    const pipeline = promisify(stream.pipeline);
    await pipeline(
      readableStream,
      StreamArray.withParser(),
      async (parsedIterable: AsyncIterable<any>) => {
        for await (const { key: index, value: element } of parsedIterable) {
          chunkCb(null, element);
        }
      },
    );
  } catch (err) {
    throw new AppError('Unable to process stream', err);
  }
}
