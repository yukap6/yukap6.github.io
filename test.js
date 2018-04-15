// 二分查找
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

// 选择排序
function selectSort(arr) {
  for (let i = 0, len = arr.length; i < len; i++) {
    let min = i;
    for (let j = i + 1; j < len; j++) {
      if (Number(arr[j]) - Number(arr[min]) <= 0) {
        min = j;
      }
    }
    const t = arr[i];
    arr[i] = arr[min];
    arr[min] = t;
  }
  return arr;
}

function less(a, b) {
  return a - b < 0;
}
function exch(arr, indexA, indexB) {
  let tmp = arr[indexA];
  arr[indexA] = arr[indexB];
  arr[indexB] = tmp;
}

// 插入排序
function insertSort(arr) {
  for (let i = 0, len = arr.length; i < len; i++) {
    for (let j = i; j > 0 && less(arr[j], arr[j - 1]); j--) {
      exch(arr, j, j - 1);
    }
  }
  return arr;
}
const arr = [19,28,98, 1,2,3,0,1,2,3,6,7,8,9,101,102];
console.log(insertSort(arr));
