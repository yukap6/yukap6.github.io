# 一张图说清楚 JavaScript 闭包（closure）

看图，说话 👻

![](http://www.iseb.cc/wp-content/uploads/2019/06/WX20190624-173203@2x.png)

示例代码

```
function p() {
  var a = 1;
  function c() {
    debugger;
    return a;
  }
  return c;
}
var cb = p();
cb();
```

以 Chrome 的 JavaScript 解析引擎为准，函数 `p` 及其创建时的词法环境即为一个 *闭包*。当执行函数 `c` 的时候，依然可以通过闭包访问到变量 `a` 的值。

> MDN 定义：闭包是由函数以及创建该函数的词法环境组合而成。[**这个环境包含了这个闭包创建时所能访问的所有局部变量**](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)。

（end）
