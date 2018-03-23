# JavaScript 正则

> JavaScript 中用于正则操作的方法，共有6个，字符串实例4个，正则实例2个。JavaScript 的正则引擎属于传统 NFA 类型，大部分语法及使用都兼容 Perl 语言的正则表达式，但不支持逆序环视以及固化分组（或者占有优先量词）。

## 基础知识

### 正则实例的 2 个方法

[RegExp#test](http://devdocs.io/javascript/global_objects/regexp/test)

语法：`regexObj.test(str)`。

参数：目标字符串。

返回值：`true/false`。目标字符串中存在和正则表达式匹配的子字符串，则返回 `true`，否则返回 `false`。

> 如果正则表达式有 `/g` 修饰符，则正则实例 `regexObj` 的 `lastIndex` 属性会随着 `test()` 方法的执行而变化(同 `exec`)，如果需要从字符串开始位置重新匹配，则需要将 `regexObj.lastIndex` 置为 0（可以理解为类似 C 语言里的指针移动）。

示例：

```
var regex = /foo/g;

// regex.lastIndex 为 0
regex.test('foo'); // true

// regex.lastIndex 为 3，表示从位置 3 开始匹配
regex.test('foo'); // false
```

[RegExp#exec](http://devdocs.io/javascript/global_objects/regexp/exec)

语法：`regexObj.exec(str)`。

返回值：匹配失败返回 `null`，匹配成功则返回一个数组，其中数组的元素为 `[match, p1...pn, offset, wholeInput]`，`match` 对应匹配的文本，`p1-pn` 对应每个子捕获，`offset` 表示匹配出现的位置，`wholeInput` 表示原始目标字符串。如果使用了 `/g` 修饰符，需要循环执行匹配，直到字符串末尾（注意不要把正则实例的定义放在循环判断之内，否则会造成无限循环，因为每次定义正则实例的时候，都会初始化该正则实例的 `lastIndex` 属性为 0）。

示例：

```
// 没有 `/g` 修饰符的情况
var re = /quick\s(brown).+?(jumps)/ig;
var result = re.exec('The Quick Brown Fox Jumps Over The Lazy Dog');
console.log(result); // ["Quick Brown Fox Jumps", "Brown", "Jumps", index: 4, input: "The Quick Brown Fox Jumps Over The Lazy Dog"]
// result[0] 是 "Quick Brown Fox Jumps"，表示完整匹配的文本；
// result[1-2] 是 "Brown" 和 "Jumps"，表示捕获组括号对应的匹配；
// result.index 为 4，表示完整匹配在目标字符串中的位置
// result.input 表示原始目标字符串

// 有 `/g` 修饰符的情况
var myRe = /ab*/g;
var str = 'abbcdefabh';
var myArray;
while ((myArray = myRe.exec(str)) !== null) {
  var msg = 'Found ' + myArray[0] + '. ';
  msg += 'Next match starts at ' + myRe.lastIndex;
  console.log(msg);
}
// 结果是
// Found abb. Next match starts at 3
// Found ab. Next match starts at 9
```

### 字符串实例和正则相关的 4 个方法

[String#search](http://devdocs.io/javascript/global_objects/string/search)

语法：`str.search(regexp)`

参数：参数默认要求是一个正则表达式，如果不是正则表达式，则会强制使用 `new RegExp` 将其转换为正则表达式。

返回值：返回字符串中和正则表达式匹配的第一处索引，如果没有匹配，则返回 -1。

> 因为这里是匹配正则表达式在字符串中第一次匹配时出现的位置，所以修饰符 `/g` 是非必须的，也不影响最终结果

示例：

```
var str = "hey JudE";
var re = /[A-Z]/g;
var re2 = /[.]/g;
console.log(str.search(re)); // 4
console.log(str.search(re2)); // -1
```

[String#replace](http://devdocs.io/javascript/global_objects/string/replace)

语法：`str.replace(regexp|substr, newSubstr|function)` 

参数：第一个参数为要搜索的正则表达式或者子字符串，第二个参数为要替换的子字符串或者可执行函数，该函数会依次应用到每个匹配并返回新的替换文本。

第二个参数分两种情况

* 类型为字符串 `newSubStr` 的时候，`newSubStr` 里 \$\$ 表示 \$, \$& 表示匹配到的子字符串，\$\` 表示匹配字符串前面的部分，\$' 表示匹配字符串后面的部分，\$n 表示第 n 个子匹配
* 类型为函数 `function` 的时候，`function` 的参数分别是：`function (match, p1, pn.., offset, wholeString)`，`match` 对应匹配到的文本，`p1-pn` 表示每个捕获括号对应的子匹配，`offset` 表示该次匹配在字符串中的索引，`wholeString` 则是完整的目标字符串。

返回值：返回替换后生成的新字符串，不修改原始字符串。

示例：

```
function replacer(match, p1, p2, p3, offset, string) {
  // p1 is nondigits, p2 digits, and p3 non-alphanumerics
  return [p1, p2, p3].join(' - ');
}
var newString = 'abc12345#$*%'.replace(/([^\d]*)(\d*)([^\w]*)/, replacer);
console.log(newString);  // abc - 12345 - #$*%
```

[String#split](http://devdocs.io/javascript/global_objects/string/split)

语法：`str.split([separator[, limit]])`

参数：第一个参数为分隔符[可选]，第二个参数限制最多分割的数目[可选]。

> 如果分隔符是空字符串 "", 则目标字符串会按照单个字符进行分割；
> 
> 如果分隔符未找到或者不提供，则返回包含原始字符串的数组；
> 
> 如果目标字符串是空字符串，则split() 返回包含一个空字符串的数组，如果目标字符串和分隔符都是空字符串，则返回一个空数组；
>
> 如果分隔符是一个包含子捕获组的正则表达式，则子捕获组会被叠加到目标数组里，如下示例 [并非所有浏览器支持]；

示例：

```
var myString = 'Hello 1 word. Sentence number 2.';
var splits = myString.split(/(\d)/);

console.log(splits);
// [ "Hello ", "1", " word. Sentence number ", "2", "." ]
```

[String#match](http://devdocs.io/javascript/global_objects/string/match)

语法：`str.match(regexp)`。

参数：参数默认要求是一个正则表达式，如果不是正则表达式，则会强制使用 `new RegExp` 将其转换为正则表达式。

> 如果参数被忽略，则会返回包含一个空字符串元素的数组 `['']`；
> 
> 如果正则表达式不包含 `/g` 修饰符，则执行结果同 `RegExp.exec()`，返回的数组为匹配对象；如果包含 `/g` 修饰符，则返回的数组包含所有匹配的子字符串（而不再是匹配对象）。

示例：

```
// 不包含 /g 修饰符的情况
var str = 'For more information, see Chapter 3.4.5.1';
var re = /see (chapter \d+(\.\d)*)/i;
var found = str.match(re);

console.log(found);

// logs [ 'see Chapter 3.4.5.1',
//        'Chapter 3.4.5.1',
//        '.1',
//        index: 22,
//        input: 'For more information, see Chapter 3.4.5.1' ]

// found[0] 'see Chapter 3.4.5.1' 是完整匹配的文本；
// found[1] 'Chapter 3.4.5.1' 由 '(chapter \d+(\.\d)*)' 子表达式捕获；
// found[2] '.1' 由 '(\.\d)' 捕获；
// index: 22 表示完整匹配出现的索引位置，从 0 开始计数；
// input: ... 表示原始目标字符串。

// 包含 /g 修饰符的情况
var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var regexp = /[A-E]/gi;
var matches_array = str.match(regexp);

console.log(matches_array);
// ['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e']
```

## 实战训练

**练习1**：`var s1 = "get-element-by-id";` 给定这样一个连字符串，写一个 `function` 转换为驼峰命名法形式的字符串 `getElementById`。

解法(1)：

```
function toHump(str) {
  var reg = /-([a-z])/g;
  return str.replace(reg, function(match, p1, offset, string){
    return p1.toUpperCase();
  });
}
```

解法(2)：

```
function toHump(str) {
  var reg = /-\w/g;
  return str.replace(reg, function(match){
    return match.slice(1).toUpperCase();
  });
}
```

**练习2**：检测字符串中是否有重复的字母

```
function isContainRepeatLetter(str) {
    return /([a-zA-Z])\1/.test(str);
}
```

**练习3**：获取URL中指定参数的值

解法(1)：不考虑重复参数的问题，只取第一个值，比如 `&name=job&age=21&name=lucy`，只取 `name=job` 中的 `job`

```
function getUrlParamValueByKey(url, key) {
    var reg = new RegExp(`${key}=([^&]*)`, 'i');
    var r = url.match(reg);
    return r && r[1] || '';
}
```

解法(2)：考虑重复参数的问题，取最后一个值为有效值，比如 `&name=job&age=21&name=lucy`，取 `name=lucy` 中的 `lucy`

```
function getUrlParamValueByKey(url, key) {
  var reg = new RegExp(`${key}=([^&]*)`, 'ig');
  var matched = url.match(reg);
  if (matched) {
    return matched[matched.length - 1].replace(`${key}=`, '');
  }
  return '';
}
```

**练习4**：将字符串倒序输出

```
function strReverse(str) {
    return str.split('').reverse().join('');
}
```

**练习5**：提取链接地址

```
var s3 = "IT面试题博客中包含很多  <a href='http://hi.baidu.com/mianshiti/blog/category/微软面试题'> 微软面试题 </a> ";
function getUrlFromString(str) {
  var reg = /href='([^']*)'/g;
  var arr = str.match(reg) || [];
  return str.match(reg).map((item) => {
    return item.replace('href=\'', '').replace(/'$/, '');
  });
}

```

**练习6**：对数字使用逗号','进行千位分割，也就是三位数字用一个逗号','隔开，比如 12345678, 结果为 12,345,678

解法(1)：

```
function numberSeperateWithComma(num) {
  var reg = /\B(?=(\d{3})+(?!\d))/g;
  return  String(num).replace(reg, ',');
}
```

> 解释：正则表达式 `/\B(?=(\d{3})+(?!\d))/g` 分解开来就是
> 首先，将数字进行三位一分组，定位到三位一分组之间的空白位置，则是 `/(\d){3}+/g`
> 其次，进行三位一分组的时候，后边界不能剩余任何数字，则是 `/(\d){3}+(?!\d)/g`
> 最后，三位一分组之间的空白位置不能出现在最前边，避免 `,123,456` 这种情况，则要限制该空位必须以非单词边界开始，也就是加入 `\B`，则是 `/\B(?=(\d{3})+(?!\d))/g`

解法(2)：逆向思维

```
function numberSeperateWithComma(num) {
  var reg = /(\d{3})(?=\d)/g;
  var str = String(num).split('').reverse().join('');
  var tmpResult = str.replace(reg, '$&,');
  return tmpResult.split('').reverse().join('');
}
```

> 解释：将字符串逆向排序之后，从前往后，每隔3个字符插入一个逗号，然后再逆向排序回目标状态（就相当于从后往前每隔三个数字插入一个逗号）
> 首先，将目标数字进行逆向排序
> 其次，将目标数字进行三个一组匹配并插入逗号','分隔符，正则为 `/(\d{3})/g`，替换方式为 `str.replace(reg, '$&,')`，这里的 $& 表示当前匹配子串
> 接着，处理边界，最后插入的逗号不能在单词边界，即必须紧邻任何数字，所以正则调整为 `/(\d{3})(?=\d)/g`
> 最后，将处理好的结果进行逆向排序，产生目标字符串


**练习7**：写一个方法把一个数字末尾的连续0变成9，如1230000变成1239999

解法(1)

```
function replaceNumEndCharacterToAnother(num, endCharactor, anotherCharactor) {
  var reg = new RegExp(endCharactor + '+$', 'g');
  var r = String(num);
  return r.replace(reg, function(match){
    return match.replace(new RegExp(endCharactor, 'g'), String(anotherCharactor));
  });
}

var s5 = 5230300010200000;
replaceNumEndCharacterToAnother(s5, 0, 9); // 1234999999
```

解法(2)

```
"5230300010200000".replace(/0(?=(0+$)|\b)/g, 9);
```

解法(3)

```
"5230300010200000".replace(/0(?=(0+|0?)$)/g, 9);
```

解法(4)

```
"5230300010200000".replace(/(?=(0+$))0/g,9);
```


