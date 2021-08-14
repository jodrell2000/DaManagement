function setIntersection(a, b) {
  let setA = new Set(a);
  let intersection = new Set();
  for (let elem of b) {
    if (setA.has(elem)) {
      intersection.add(elem);
    }
  }
  return Array.from(intersection);
}

function setDifference(a, b) {
  let difference = new Set(a);
  for (let elem of b) {
    difference.delete(elem);
  }
  return Array.from(difference);
}

module.exports = { setIntersection, setDifference };
