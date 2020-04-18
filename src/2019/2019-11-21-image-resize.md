# 纯前端实现图片压缩 & 方向校正

`web` 图片上传一般会遇到以下2个问题：

1. 图片太大，需要压缩；
2. 图片传到服务器之后，不是正的，而是歪的，需要校正。

OK，一个一个解决。

## 图片压缩：解决图片过大的问题

纯 `JavaScript` 实现图片压缩主要依赖 `canvas` 的能力，其核心原理就是：将较大的图片以较小的尺寸在 `canvas` 画布上进行重绘。图片宽高缩小之后，生成的像素点更少，就相当于被压缩了，是不是很简单！！

当然，细心的同学可能会发现一个漏洞，那就是如果宽高缩小到一定程度之后，还是没法达成文件大小的最低要求，而此时不允许再缩小图片宽高尺寸，该怎么办呢？很简单，`canvas` 的 API 里提供了一个叫 `.toBlob()` 的方法，可以设置导出的 `blob` 二进制文件流的质量，取值 `0-1` 之间，值越大，质量越高，就类似 `PS` 中导出 `JPEG` 图片时设置图片质量。如果图片宽高限制了，那就通过调整图片质量参数来压缩图片即可。

核心代码奉上

```
/**
 * 压缩图片至指定大小
 * @param {blob} file 文件对象
 * @param {object} params 压缩文件参数
 * @param {func} cb 成功回调函数，参数为压缩后的二进制文件流
 */
const LIMIT_SIZE = 0.5 * 1024 * 2014; // 限制大小 500 KB 以内
let compressCount = 0;
export const compressImage = (file, cb = () => {}, params = {
  width: 1000,
}) => {
  const {
    width,
  } = params;
  const finnalCallBack = (e) => {
    console.error('图片压缩出错：', e);
    cb(file);
  };
  try {
    // 步骤1：通过 FileReader 读取文件内容
    const fileReader = new FileReader();
    fileReader.onload = () => {
      // 步骤2：将读取到的文件内容转为 Image 对象
      const img = new Image();
      img.onload = () => {
        try {
          // 步骤3：对图片进行压缩
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const originWidth = width;
          const originHeight = originWidth / (img.width / img.height);
          canvas.width = originWidth;
          canvas.height = originHeight;
          context.drawImage(img, 0, 0, originWidth, originHeight);
          canvas.toBlob((blob) => {
            // 步骤4：将压缩后的图片导出为二进制文件流
            if (blob.size > LIMIT_SIZE) {
              // 图片大小未达标，则继续压缩
              compressCount += 1;
              compressImage(blob, cb);
            } else {
              compressCount = 0;
              cb(blob);
            }
          }, 'image/jpeg', 0.9 - (compressCount * 0.1)); // 第三个参数控制图片质量
        } catch (e) {
          finnalCallBack(e);
        }
      };
      img.src = fileReader.result;
    };
    fileReader.onerror = (e) => {
      finnalCallBack(e);
    };
    fileReader.readAsDataURL(file);
  } catch (e) {
    finnalCallBack(e);
  }
};
```

这个方法要注意的是：图片文件需要在 `onload` 之后执行下一步的绘制动作，否则会出现空白渲染的情况。

## 图片方向校正：处理图片“歪倒”的情况

相机拍摄照片时，可能会出现以下四种拍照方位，拍出来的照片方向参数各不一样，取值分别是 `1`、`8`、`3` 和 `6`。

![](http://www.iseeit.cn/wp-content/uploads/2019/12/orientation.gif)
图 2-0

此时，图片被原封不动上传之后，就可能会出现“歪着”的情况。所以，在文件上传之前，需要先对图片进行方向校正，然后再上传。

**三步走**：
1. 获取到图片的方位 `orientation` 信息，四个方位分别对应 `1`, `3`, `6`, `8`，如图 2-0 所示；
2. 在 `canvas` 画布上绘制图片之前，先校正方位，再进行绘制；
3. 将 `canvas` 画布上绘制的正过来的图片导出为 `blob` 数据格式（二进制文件流）；
   
完整代码奉上

```
/**
 * 压缩图片至指定大小
 * @param {blob} file 文件对象
 * @param {object} params 压缩文件参数
 * @param {func} cb 成功回调函数，参数: 二进制文件流
 */
import exif from 'exif-js';
 
let compressCount = 0;
export const compressImage = (file, cb = () => {}, params = {
  width: 1000,
}) => {
  const {
    width,
  } = params;
  const finnalCallBack = (e) => {
    console.error('图片压缩出错：', e); // eslint-disable-line
    cb(file);
  };
  try {
    exif.getData(file, () => {
      try {
        const orientation = exif.getTag(file, 'Orientation') || 1;
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              const originWidth = width;
              const originHeight = originWidth / (img.width / img.height);
              canvas.width = originWidth;
              canvas.height = originHeight;
              // debugger; //eslint-disable-line
              let angle = 0; // 旋转角度
              switch (Number(orientation)) {
                case 1:
                  // 0°，不旋转
                  break;
                case 6:
                  // 逆时针90°，需要顺时针旋转90°
                  angle = (90 * Math.PI) / 180;
                  canvas.width = originHeight;
                  canvas.height = originWidth;
                  context.rotate(angle);
                  context.translate(0, -canvas.width);
                  break;
                case 8:
                  // 顺时针90°，需要顺时针旋转270°
                  angle = (270 * Math.PI) / 180;
                  canvas.width = originHeight;
                  canvas.height = originWidth;
                  context.rotate(angle);
                  context.translate(-canvas.height, 0);
                  break;
                case 3:
                  // 顺时针180°，需要顺时针旋转180°
                  angle = (180 * Math.PI) / 180;
                  canvas.width = originWidth;
                  canvas.height = originHeight;
                  context.rotate(angle);
                  context.translate(-canvas.width, -canvas.height);
                  break;
                default:
              }
              context.drawImage(img, 0, 0, originWidth, originHeight);
              context.setTransform(1, 0, 0, 1, 0, 0);
              canvas.toBlob((blob) => {
                if (blob.size > LIMIT_SIZE) {
                  compressCount += 1;
                  compressImage(blob, cb);
                } else {
                  compressCount = 0;
                  cb(blob);
                }
              }, 'image/jpeg', 0.9 - (compressCount * 0.1));
            } catch (e) {
              finnalCallBack(e);
            }
          };
          img.src = fileReader.result;
        };
        fileReader.onerror = (e) => {
          finnalCallBack(e);
        };
        fileReader.readAsDataURL(file);
      } catch (e) {
        finnalCallBack(e);
      }
    });
  } catch (e) {
    finnalCallBack(e);
  }
};
```

**代码解读**
1. 首先，依赖三方库 [`exif-js`](https://github.com/exif-js/exif-js) 获取到图片的方位信息 `orientation`；
2. 其次，重点关注 `switch case` 部分代码，对图片方位进行校正；
3. 最后，依赖 `canvas` 画布的 `toBlob()` `API` 将绘制的图片导出为 `blob` 数据并返回；

这里几个细节问题需要说明一下：

1. 为啥照片在手机上看到是正的，上传之后就是“歪”着的呢？
答：相机拍照时，图片本身的元信息里是有 `orientation` 信息的，即方位信息，此时，手机上显示时，都是系统默认对图片进行过旋转校正之后的。

2. 图片递归压缩的过程中，会无限调整图片方位么？
答：不会。如果图片方位不是 `1`，则第一次校正之后，图片就已经是正的了。即使后续继续递归压缩图片大小，后续的 `orientation` 信息都是 `1`。

3. 图片方位校正代码看的云里雾里，原理到底是啥呢？
答：图片本身的方位是不会变化的，变化的只是 `canvas` 画布绘制图片时的坐标系。简单来讲就是，根据图片的 `orientation` 方位信息，将 `canvas` 的坐标系旋转调整到可以使图片显示为 “正” 的情况下，再对图片进行绘制。至于 `canvas` 坐标系的相关解释，同学们可以在上一篇 [借助图片旋转理解 canvas 坐标系](http://www.iseeit.cn/index.php/2019/12/12/canvas-coordinate/) 中详细查看。


（完）
