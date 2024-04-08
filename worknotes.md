

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
