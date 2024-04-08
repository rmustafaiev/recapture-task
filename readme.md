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

### The task
[Task description](task.md)

### Worknotes
[Implementation notes](worknotes.md)