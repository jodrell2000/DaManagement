#!/usr/bin/env node

let videoFunctions = require("../modules/videoModule");
let {
  addAlertRegion,
  removeAlertRegion,
  listAlertRegions,
  test_alertIfRegionsNotAllowed,
  test_alertIfRegionsBlocked,
} = videoFunctions(null);

const dummyChat = {
  botSpeak: (msg, data) => console.log(msg),
};

console.log("-test 1");
test_alertIfRegionsNotAllowed({ allowed: ["GB", "DV"] }, console.log);
console.log("-test 2");
test_alertIfRegionsBlocked({ blocked: ["GB", "US", "DV"] }, console.log);

console.log("-test 3");
test_alertIfRegionsNotAllowed({ allowed: ["GB", "US"] }, console.log);

console.log("-test 4");
listAlertRegions(null, dummyChat);
test_alertIfRegionsBlocked({ blocked: ["IT", "DV"] }, console.log);
addAlertRegion(null, ["DV"], dummyChat);
listAlertRegions(null, dummyChat);
test_alertIfRegionsBlocked({ blocked: ["IT", "DV"] }, console.log);
removeAlertRegion(null, ["DV"], dummyChat);
listAlertRegions(null, dummyChat);
test_alertIfRegionsBlocked({ blocked: ["IT", "DV"] }, console.log);
listAlertRegions(null, dummyChat);
