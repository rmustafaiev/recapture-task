## Project setup,

Requirements NodeJS 20.8 ver or above

- Install nodejs v20 or later,
- Unzip the archive,
- cd recapture-task/
- run install command `npm install`
- run build command `npm run build`
- run start command `npm run start`
- alternatively, execute via node cli, `node dist/main.js` (within recapture-task directory)
- you can configure some settings in `appconfig.json` please refer `./src/appconfig.json` file (this changes require rebuild command)
-

```json
 "order_feed": "https://cdn.recapture.io/coding-task/demo-orders-v2.json",
  "cart_feed": - remote resource/json
  "sources_dir": "res", - json files directory
  "cart_file_path": - local file
  "order_file_path": - local file
  "use_feed_sources": - indicates whether data sources served via web server
```

## Implementation notes

### Out of scope,

Testing is desired and should be considered.
I omitted it for time-saving purposes.

Further optimisation consideration
It is possible to write this program offloading 'topics' (cart, order) processing
to utilise worker threads, but it seems overhead for that task, it will bring complexity of further
processing, synchronization extra checks of validity etc ...
So, considering the comparably simple processing involved, asynchronous processing seems to be
a suitable way.

Consideration about JSON streams,
Drawbacks`stream-json` library processes
stream by chunk which enforce big amount of consuming iteration loops that after all looks slow.
I didn't find a proper/faster solution for that yet.
As a benefits we can consume large JSON, either through WebStream,
or via loading large JSON files and process them through Readable stream as well.
Those avoid node apps crashing since loading large files in memory,
eventually cause app termination with Heap Memory error.
As a result, less memory usage and handling streams gracefully.

I would be careful on my opinion, but perhaps an alternative solution would be,
prepare and fetch Data querying DynamoDB, or aggregation (MongoDB aggregation/pipelines)
this brings fewer data consuming traffic, fewer computation, better response time etc.
