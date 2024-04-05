
Project setup,
------------------------
Requirements NodeJS 20.8 ver or above
* Unzip the archive,
* run install command `npm i'
* run build command `npm run build`
* run start command `npm run start`
* you can configure some settings in `appconfig.json` please refer `./src/appconfig.json` file (this changes require rebuild command)
*
```json
 "order_feed": "https://cdn.recapture.io/coding-task/demo-orders-v2.json",
  "cart_feed": - remote resource/json
  "sources_dir": "res", - json files directory
  "cart_file_path": - local file
  "order_file_path": - local file
  "use_feed_sources": - indicates whether data sources served via web server
```
