// load the googleAPI
let fs = require("fs/promises");
let readline = require("readline");
let { google } = require("googleapis");

let OAuth2 = google.auth.OAuth2;
let SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH) + "/.credentials/";
let TOKEN_PATH = "theManagementCredentials.json";

let musicDefaults = require("../defaultSettings/musicDefaults.js");
let alertIfRegionBlocked = musicDefaults.alertIfRegionBlocked; //song play limit, this is for the playLimit variable up above(off by default)

const videoFunctions = (bot) => {
  async function queryVideoDetails(auth, videoID) {
    let service = google.youtube("v3");
    return service.videos
      .list({
        auth: auth,
        part: "snippet,contentDetails,statistics",
        id: videoID,
      })
      .then(({ data }) => {
        console.log("Found video data", data);
        return data.items[0].contentDetails;
      });
  }

  async function checkVideo(auth, videoId) {
    const { regionRestriction } = await queryVideoDetails(auth, videoID);
    if (regionRestriction !== undefined) {
      return videoData[0].contentDetails.regionRestriction;
    } else {
      console.log("Didn't find any regions:" + JSON.stringify(videoData));
      return null;
    }
  }

  async function askUserForCredentials(oauth2Client) {
    let authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url: ", authUrl);
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const promise = new Promise((resolve, reject) => {
      rl.question("Enter the code from that page here: ", function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
          if (err) {
            console.log("Error while trying to retrieve access token", err);
            reject(err);
          } else {
            resolve(oauth2Client);
          }
        });
      });
    });
    return promise;
  }

  function buildClient(credentials) {
    clientSecret = credentials.installed.client_secret;
    clientId = credentials.installed.client_id;
    redirectUrl = credentials.installed.redirect_uris[0];

    return new OAuth2(clientId, clientSecret, redirectUrl);
  }

  async function getAuthorizedClient(credentials) {
    oauth2Client = buildClient(credentials);
    const storedCredentials = await loadJSONFromFile(TOKEN_DIR, TOKEN_PATH);
    if (storedCredentials) {
      oauth2Client.credentials = storedCredentials;
    } else {
      const newCredentials = await askUserForCredentials();
      await storeJSONToFile(TOKEN_DIR, TOKEN_PATH, newCredentials);
      oauth2Client.credentials = newCredentials;
    }
    return oauth2CLient;
  }

  async function loadJSONFromFile(dir, path) {
    try {
      const contents = await fs.readFile(dir + path);
      return JSON.parse(contents);
    } catch (err) {
      console.error(`Error loading JSON from file ${path} : ${err}`);
      return null;
    }
  }

  async function ensureDirectoryExists(dir) {
    try {
      await fs.mkdir(dir);
    } catch (err) {
      if (err.code != "EEXIST") {
        console.error(`Error making directory ${dir} : ${err}`);
        throw err;
      }
    }
  }

  async function storeJSONToFile(dir, path, content) {
    await ensureDirectoryExists(dir);
    try {
      return fs.writeFile(dir + path, JSON.stringify(content));
    } catch (err) {
      console.error(`Error saving JSON to file ${path} : ${err}`);
      throw err;
    }
  }
  //allow undefined blocked undefined - allowed everywhere
  //allow undefined blocked emptyList - blocked nowhere

  //allow list blocked undefined - allowed somewhere
  //allow undefined blocked list - blocked somewhere

  //allow emptyList blocked undefined - allowed nowhere

  async function authorize() {
    const clientAuth = await loadJSONFromFile("client_secret.json");
    return await getAuthorizedClient(JSON.parse(clientAuth));
  }

  return {
    alertIfRegionBlocked: () => alertIfRegionBlocked,

    listAlertRegions: function (data, chatFunctions) {
      chatFunctions.botSpeak(
        data,
        "The list of regions that will triger a blocked alert is currently " +
          this.alertIfRegionBlocked()
      );
    },

    addAlertRegion: function (data, args, chatFunctions) {
      const region = args[0];
      if (this.alertIfRegionBlocked().indexOf(region) === -1) {
        alertIfRegionBlocked.push(region);
        chatFunctions.botSpeak(
          data,
          region + " has been added to the region alerts list"
        );
      } else {
        chatFunctions.botSpeak(
          data,
          region + " is already in the reggion alerts list"
        );
      }
    },

    removeAlertRegion: function (data, args, chatFunctions) {
      const region = args[0];
      if (this.alertIfRegionBlocked().indexOf(region) === -1) {
        chatFunctions.botSpeak(
          data,
          region + " is not in the region alerts list"
        );
      } else {
        const listPosition = this.alertIfRegionBlocked().indexOf(region);
        alertIfRegionBlocked.splice(listPosition, 1);
        chatFunctions.botSpeak(
          data,
          region + " has been removed from the reggion alerts list"
        );
      }
    },

    readRegions: function (data, args, userFunctions, chatFunctions) {
      const theDJID = data.room.metadata.current_dj;
      const videoID = args[0];

      authorize()
        .then((oauthClient) => checkVideo(oauthClient, videoId))
        .then((restrictions) => {
          console.log(restrictions);
        });
      //  .then((blocked, hasRestrictions, restrictionDescription) => {
      //    if (blocked) {
      //      chatFunctions.botSpeak(
      //        data,
      //        "@" +
      //          userFunctions.getUsername(theDJID) +
      //          " that video is blocked everywhere"
      //      );
      //    } else if (hasRestrictions) {
      //      chatFunctions.botSpeak(
      //        data,
      //        "@" +
      //          userFunctions.getUsername(theDJID) +
      //          " that video is blocked in the following important places" +
      //          ""
      //      );
      //    } else {
      //      console.log("Mum's the word...video has no restrictions");
      //    }
      //  });
    },
  };
};

module.exports = videoFunctions;
