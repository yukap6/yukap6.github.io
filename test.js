const _ = require('lodash');

function binaryChop(search, targetArray) {
  let low = 0;
  let hig = targetArray.length - 1;
  targetArray.sort((a, b) => a - b);
  while(low <= hig) {
    const mid = Math.floor(low + ((hig - low) / 2));
    if (search < targetArray[mid]) {
      hig = mid - 1;
    } else if (search > targetArray[mid]) {
      low = mid + 1;
    } else {
      return mid;
    }
  }
  return -1;
}
const arr = [0,1,2,3,6,7,8,9,101,102];
console.log(binaryChop(101, arr));
