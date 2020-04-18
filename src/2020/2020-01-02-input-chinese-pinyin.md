# React 中 Input 组件中文输入实时校验问题

![](http://www.iseeit.cn/wp-content/uploads/2020/04/input.png)

## 中文输入场景遇到的问题

使用 `input` 输入框时，如下需求比较常见：

* 实时校验用户名合法性；
* 实时校验文本输入长度；

常规做法是监听 `onChange` 事件，实时校验输入内容。输入英文，正常；但输入中文时，就会出现问题：用户没有完成当前中文输入之前，`onChange` 事件也会被触发，而实际是希望当前中文输入完成后再进行校验，如图 `1-1` 所示： 

![](http://www.iseeit.cn/wp-content/uploads/2020/04/20200418115721.jpg)
1-1 `onChange` 事件触发了一些无效响应

如上示例控制台打印所示，前四次 `onChange` 事件触发时，`input` 输入框的内容都不是目标内容，那如何才能做到仅在中文输入完成时校验呢？

答案就是 `CompositionEvent` 合成事件。

## `CompositionEvent` 一击必杀

顾名思义，合成事件：即一个完整的事件过程由几部分组成。使用拼音输入法输入中文时，常见如下三个事件组合：

1. `onCompositionStart` 合成事件开始；
2. `onCompositionUpdate` 合成事件更新；
3. `onCompositionEnd` 合成事件结束；

针对 `1-1` 示例问题，解决方案就是，将 `onChange` 事件和 `onCompositionEnd` 组合起来使用，解决中文输入实时监听问题。 当输入中文时 `onCompositionEnd` 会在当前中文输入完成后触发，这就解决了 `onChange` 不能解决的问题，效果图如下 `2-1`。

![](http://www.iseeit.cn/wp-content/uploads/2020/04/20200418142218.jpg)
2-1 `composition` 事件

输入非中文 `77` 时，实时响应；输入中文 `奋发图强`的时候，仅在当前中文输入完成后触发响应。

完整代码如下：

```
import React from 'react';

let isOnComposition = false;
const isChrome = !!window.chrome;

const inputCheckLogic = (v) => {
  console.log(v);
};

const handleComposition = (e) => {
  const {
    type,
    currentTarget: {
      value,
    },
  } = e;
  if (type === 'compositionend') {
    /**
     * 合成事件结束，可以触发输入实时校验
     * 这里多做一次针对 chrome 的逻辑是因为 chrome 中
     * `compositionend` 事件在 `onChange` 事件之后触发
     */
    isOnComposition = false;
    if (e.currentTarget instanceof HTMLInputElement && !isOnComposition && isChrome) {
      inputCheckLogic(value);
    }
  } else {
    // 合成事件进行时
    isOnComposition = true;
  }
};

const handleChange = (e) => {
  const {
    currentTarget: {
      value,
    },
  } = e;
  /**
   * 非合成事件，可以触发输入实时校验
   */
  if (e.currentTarget instanceof HTMLInputElement && !isOnComposition) {
    inputCheckLogic(value);
  }
};

function Demo() {
  return (
    <div>
      <input
        onCompositionStart={handleComposition}
        onCompositionUpdate={handleComposition}
        onCompositionEnd={handleComposition}
        onChange={handleChange}
      />
    </div>
  );
}

export default Demo;
```

如上核心思路就是：

* 普通的 `onChange` 事件直接触发校验逻辑；
* 输入中文时，仅在输入完成后触发校验逻辑；

以上。
