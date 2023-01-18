# Fubuki-Care server (Sievert data recieving server)
This is Fubuki-Caring Server code. just recieve data from HTTP call with KEY in ENV, then push data to local mongodb, notion database, google sheet. Also, it can query data from mongodb.

# Pre-requirement
To run this server you should install all stuff below:
- Docker (v20+, require in production only)
- Docker-Compose (v2.14+, require in production only)
- NodeJS (v19+)
- MongoDB (v4+)
Also, you should create：
- notion.so account that have Notion API access
- google cloud account that can create Service Account with Sheet API

# Setup
First, please use NPM to install require packages:
```bash
npm install
npm install --dev
```

## Google Service Account
To store data to Google Sheet, you should:
- Create Google account that can access Google Cloud
- go to Google Cloud, search and  navtigate to Sheet API, Enable it.
- stay on Google Cloud, search and navigate to Service Account.
- Create new Service Account
- Create new key for the service account, then download the credential.json
- Open the credential.json, copy the service account's email, copy it.
- create new Google Sheet in Google Drive, go to share and parse the service account email, grant read&write permission.
- parse the credential.json on this project root dir, reaname to google-credentials.json
You can check a article from other project. It should you a guide with picture so easily to understand.
[guide with pireture for gsheet api](https://github.com/juampynr/google-spreadsheet-reader)

## Notion API
To store data to Notion, you should:
- create a notion account that have Notion API access.
- go to settings > Connections > develop or manage integrations > new integration
- fill a name, allow read& write, choose correct workspace.
- then you can get the NOTION_TOKEN that start with secret_ 
- go to your notion workspace, create a new notion database.
- click the right-top corner 3-dot icon > add connections, then choose the connection you previous step created intration's name.

## SSL cert (Optional)
If you need ssl connection, you should create new SSL key-set,then copy the ssl certificate and privte key to _ssl_certs folder.
 - ssl_certificate: ./ssl_certs/cert.pem;
 - ssl_certificate_key: ./ssl_certs/privkey.pem;

## set the ENV
Then, copy the .env-template and change the varible.

save it to .env.development.local for development. or, save it to .env.production.local for production in this project root.
### MONGODB_FULLURL
your full url of the mongodb, includes username and password
### NOTION_TOKEN
a text start with serect_. create on previous NOTION API steps.
### RAY_NOTION_DATABASE_ID 
go to the notion database page or open as page for inline database, your notion url look like:
`https://www.notion.so/<your_username>/<database_id>?v=<view_id>`
extract & copy the database_id and set it.
### RAY_GSHEET_ID | RAY_GSHEET_SID
Open your google sheets doc, your url look like:
`https://docs.google.com/spreadsheets/d/<doc_id>/edit#gid=<sheet_id>`
doc_id is your speadsheet docment id, and sheet_id is your id of single sheeet (single tab in google sheet).
set doc_id to RAY_GSHEET_ID and set sheet_id to RAY_GSHEET_SID
### THIS_API_SENSITIVE_SECRET
You don't want anyone can make request to add record to database, so you can get a random string from any password generator/random string generator, then set on it.
then every new record HTTP request should pass it like bearer token in request.Authorization
```
Authorization:Bearer <LONGLONGSTRING>
```

# APIs
## POST /api_v1/ray
Paramater in Headers:
```
Authorization: Bearer THIS_API_SENSITIVE_SECRET
```
Authorization Bearer only require you set the ENV THIS_API_SENSITIVE_SECRET in previous step.
Paramaters in body(application/json):
```json
{
    "sv":"0.78", // the sv numbers
    "source":"fubuki_sz" // the type of source, must match in enum IRayObjectSource in file src/interfaces/ray.interface.ts
}
```
|  param_name | data_type | example | description |
|  sv         | float number in string |  "0.78" | you should pass a float number but in string, so that the API will convert&rip it to correct float |
| source | "fubuki_sz" | "fubuki_hmt" | "fubuki_sz" | only "fubuki_sz" or "fubuki_hmt". "fubuki_sz" for testing only. |


## GET /api_v1/ray
paramaters in body:
CONTENT_TYPE: application/json
```json
{
    "dateAfter": "", //ISO DateTime in String, optional. example: '2023-01-18T05:21:36.798Z'
    "dateBefore": "", //ISO DateTime in String, optional. example: '2023-01-18T05:21:36.798Z'
    "sourceType": "", // String-type enum, must match in enum IRayObjectSource in file src/interfaces/ray.interface.ts
}
```
|  param_name | data_type | example | description |
| dateAfter | string | '2023-01-18T05:21:36.798Z' | the iso datetime string. only pass you want to query records that created after that datetime |
| dateBefore | string | '2023-01-18T05:21:36.798Z' | the iso datetime string. only pass you want to query records that created before that datetime |
| sourceType | "fubuki_sz" | "fubuki_hmt" | "fubuki_sz" | only "fubuki_sz" or "fubuki_hmt". "fubuki_sz" for testing only. |
