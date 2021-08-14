#!/usr/bin/env node

let { setIntersection, setDifference } = require("../modules/setlib");

let a = [1, 2, 3];
let b = [3, 4, 5, 6];

let c = [7, 8];
let z = [3, 4, 5, 6];

console.log(setIntersection(a, b));
console.log(setDifference(b, a));
