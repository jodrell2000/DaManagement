// load the googleAPI
let { google } = require("googleapis");
let authorize = require("./oauth2lib");

let { setIntersection, setDifference } = require("../modules/setlib");

let SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];
let CLIENT_SECRET_PATH = "client_secret.json";
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH) + "/.credentials/";
let TOKEN_PATH = TOKEN_DIR + "theManagementCredentials.json";

let musicDefaults = require("../defaultSettings/musicDefaults.js");
let regionsWeCareAbout = new Set(musicDefaults.alertIfRegionBlocked); //song play limit, this is for the playLimit variable up above(off by default)

const videoFunctions = () => {
  function alertIfRegionsNotAllowed(restrictions, notifier) {
    let missingRegions = setDifference(
      regionsWeCareAbout,
      restrictions.allowed
    );
    if (missingRegions.length) {
      notifier(
        `This video can't be played in ${missingRegions}. Please consider skipping.`
      );
    }
  }

  function alertIfRegionsBlocked(restrictions, notifier) {
    let blockedRegions = setIntersection(
      regionsWeCareAbout,
      restrictions.blocked
    );
    if (blockedRegions.length) {
      notifier(
        `This video can't be played in ${blockedRegions}. Please consider skipping.`
      );
    }
  }

  async function queryVideoDetails(auth, videoID) {
    let service = google.youtube("v3");
    return service.videos
      .list({
        auth: auth,
        part: "snippet,contentDetails,statistics",
        id: videoID,
      })
      .then(({ data }) => {
        return data.items[0].contentDetails;
      });
  }

  async function getRegionRestrictions(auth, videoID) {
    const { regionRestriction } = await queryVideoDetails(auth, videoID);
    return regionRestriction;
  }

  return {
    listAlertRegions: function (data, chatFunctions) {
      const regionsAsArray = Array.from(regionsWeCareAbout);
      const message = `The list of regions that will triger a blocked alert is currently ${regionsAsArray}`;
      chatFunctions.botSpeak(data, message);
    },

    addAlertRegion: function (data, [region], chatFunctions) {
      let message;
      if (regionsWeCareAbout.has(region)) {
        message = `${region} is already in the region alerts list`;
      } else {
        regionsWeCareAbout.add(region);
        message = `${region} has been added to the region alerts list`;
      }
      chatFunctions.botSpeak(data, message);
    },

    removeAlertRegion: function (data, [region], chatFunctions) {
      let message;
      if (regionsWeCareAbout.delete(region)) {
        message = `${region} has been removed from the region alerts list`;
      } else {
        message = `${region} is not in the region alerts list`;
      }
      chatFunctions.botSpeak(data, message);
    },

    readRegions: function (data, [videoID], userFunctions, chatFunctions) {
      authorize(CLIENT_SECRET_PATH, TOKEN_PATH, SCOPES)
        .then((oauthClient) => getRegionRestrictions(oauthClient, videoID))
        .then((restrictions) => {
          if (restrictions.allowed !== undefined) {
            alertIfRegionsNotAllowed(restrictions, (msg) =>
              chatFunctions.botSpeak(data, msg)
            );
          }
          if (restrictions.blocked !== undefined) {
            alertIfRegionsBlocked(restrictions, (msg) =>
              chatFunctions.botSpeak(data, msg)
            );
          }
        });
    },

    // this is pretty horrible, but nothing in here is easy to test
    test_alertIfRegionsNotAllowed: alertIfRegionsNotAllowed,
    test_alertIfRegionsBlocked: alertIfRegionsBlocked,
  };
};

module.exports = videoFunctions;
