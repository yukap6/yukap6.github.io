var s1 = "get-element-by-id-hh";
function toHump(str) {
  var reg = /-[^-]+/g;
  return str.replace(reg, function(match, offset, string){
    console.log(match, offset, string);
    return p1.toUpperCase();
  });
}
function isContainRepeatLetter(str) {
  return /([a-zA-Z])\1/.test(str);
}
var s2 = 'http://www.runoob.com/regexp/regexp-metachar.html?sex=y&name=job&age=21&name=lucy';
function getUrlParamValueByKey(url, key) {
  var reg = new RegExp(`${key}=([^&]*)`, 'ig');
  var matched = url.match(reg);
  if (matched) {
    return matched[matched.length - 1].replace(`${key}=`, '');
  }
  return '';
}

var s3 = "IT面试题博客中包含很多  <a href='http://hi.baidu.com/mianshiti/blog/category/微软面试题'> 微软面试题 </a> ";
function getUrlFromString(str) {
  var reg = /href='([^']*)'/g;
  var arr = str.match(reg) || [];
  return str.match(reg).map((item) => {
    return item.replace('href=\'', '').replace(/'$/, '');
  });
}

var s4 = 1234567891;
function numberSeperateWithComma(num) {
  var reg = /\B(?=(\d{3})+(?!\d))/g;
  return  String(num).replace(reg, ',');
}

function numberSeperateWithComma1(num) {
  var reg = /(\d{3})(?=\d)/g;
  var str = String(num).split('').reverse().join('');
  var tmpResult = str.replace(reg, '$&,');
  return tmpResult.split('').reverse().join('');
}

var s5 = 1234000000;
function replaceNumEndCharacterToAnother(num, endCharactor, anotherCharactor) {
  var reg = new RegExp(endCharactor + '+$', 'g');
  var r = String(num);
  return r.replace(reg, function(match){
    return match.replace(new RegExp(endCharactor, 'g'), String(anotherCharactor));
  });
}



console.log(replaceNumEndCharacterToAnother(s5, 0, 9));