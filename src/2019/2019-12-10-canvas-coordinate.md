# 借助图片旋转理解 canvas 坐标系

![](http://www.iseeit.cn/wp-content/uploads/2019/12/canvas-1.jpg)
图1-0

### 坐标系基本规则

canvas 坐标系默认以左上角为原点 `0,0`，`x` 轴为横轴，`y` 轴为纵轴。不同于笛卡尔坐标系的是，canvas 坐标系从原点 `0,0` 开始，`x` 轴右侧部分的横坐标为正值，反之为负值；从原点 `0,0` 开始，`y` 轴下侧部分的纵坐标为正值，反之为负值，如下示例（[点我查看在线示例](https://codepen.io/yukap6/pen/XWJdxez){:target="_blank"}）

```
var canvas = document.createElement('canvas'); // 创建canvas 画布
var ctx = canvas.getContext("2d"); // 获取 canvas 绘图上下文
canvas.width = 400;
canvas.height = 200;
canvas.style.border = '1px solid #ccc'; // 设置元素外框样式
ctx.fillRect(10, 10, 50, 50); // 第一个方块：在坐标 (10,10) 位置画一个长宽各50的长方形，默认黑色填充
ctx.fillStyle = 'RGB(255, 0, 0)'; // 调整填充色为红色
ctx.fillRect(60, 60, 50, 50); // 第二个方块：在坐标 (60,60) 位置画一个长宽各50的长方形
ctx.fillRect(-40, 60, 50, 50); // 第三个方块：在坐标 (-40,60) 位置画一个长宽各50的长方形
document.body.appendChild(canvas);
```

![](http://www.iseeit.cn/wp-content/uploads/2019/12/canvas-2.jpg)
图1-1

图1-1示例中，第三个方块 `ctx.fillRect(-40, 60, 50, 50)` 只显示了部分，这说明当坐标位于负区间时，则该部分不可见；同样，如果坐标超出了 canvas 画布范围，内容也将不可见。了解了 canvas 坐标系的基本规则之后，接下来进入正文，在 canvas 中旋转图片。

### 图片旋转90°显示

![](http://www.iseeit.cn/wp-content/uploads/2019/12/canvas-3.jpg)
图2-0

有这样一个妹纸，你想把她推到，哦不，在 canvas 上顺时针旋转90°，该怎么做呢？（[点我查看在线示例](https://codepen.io/yukap6/pen/eYmzzYV)）

```
var canvas = document.createElement('canvas'); // 创建canvas 画布
var ctx = canvas.getContext("2d"); // 获取 canvas 绘图上下文
var img = new Image();
img.src = 'http://www.iseeit.cn/wp-content/uploads/2019/12/canvas-3.jpg';
img.onload = () => {
  // 步骤1：准备好画布
  canvas.width = img.height; // 图片旋转90°之后，高度则对应 canvas 画布的宽度
  canvas.height = img.width; // 图片旋转90°之后，宽度则对应 canvas 画布的高度

  // 步骤2：坐标系旋转90°
  ctx.rotate((90 * Math.PI) / 180); // 以左上角原点 (0,0) 为中心旋转 canvas 坐标系，角度为90°

  // 步骤3：移动坐标系进入可视区域
  ctx.translate(0, -canvas.width); // 将坐标系移动进入画布范围

  // 步骤4：画图
  ctx.drawImage(img, 0, 0, canvas.height,  canvas.width); // 绘制图片，注意此时绘制的宽度、高度参数刚好和 canvas 的宽高相反
  
  // 步骤5：恢复坐标系
  ctx.setTransform(1, 0, 0, 1, 0, 0); // 恢复坐标系到初始值

  document.body.appendChild(canvas);
}
```

代码可能有点不太直观，没关系，步骤拆解图示已奉上，请查阅

> * 重点关注步骤2，坐标系以 `(0,0)` 点为中心旋转90°之后，新的坐标系位置已经完全变换掉了（且此时不在画布可视区域）；
> * 示例中的彩色区域为 canvas 画布可视区域；
> * canvas 绘图中，所有元素都是依据原点 `(0,0)` 和坐标系来定位的；当步骤3完成的时候，原点 `(0,0)` 和坐标系已确定，画图则只是简单的参考坐标系位置绘制而已；所以图片旋转的核心就是：旋转坐标系；
> * 绘图完成之后，为了方便后续的绘制，恢复坐标系到默认值（非必须）；

![](http://www.iseeit.cn/wp-content/uploads/2019/12/canvas-4.png)
