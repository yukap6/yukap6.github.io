// 执行 node ./index.js 将 markdown 文件转换为 html 文件并自动生成 index.html 结构
const fs = require('fs');
const path = require('path');
const showdown  = require('showdown');
const converter = new showdown.Converter();
converter.setOption('tables', true);
const rimraf = require('rimraf');

const DIST_DIR_NAME = 'dist';
const SRC_DIR_NAME = 'src';
const src = path.join(__dirname, SRC_DIR_NAME);
const dist = path.join(__dirname, DIST_DIR_NAME);
const articleHeader = fs.readFileSync('./template/article-header.html', 'utf8');
const articleFooter = fs.readFileSync('./template/article-footer.html', 'utf8');
const indexHeader = fs.readFileSync('./template/index-header.html', 'utf8');
const indexFooter = fs.readFileSync('./template/index-footer.html', 'utf8');
const articles = []; // 存放文章数组

// 删除输出根目录并重新生成
if (fs.existsSync(dist)) {
  rimraf.sync(dist);
}
fs.mkdirSync(dist);

// html 文件生成
readAndWriteDirSync(src, dist);

// 更新 index.html 内容
let indexContent = '';
articles.sort();
articles.forEach((item, index) => {
  if (item && item.length) {
    indexContent += `\n
    <li class="year">\n
      <h2>${item.year}</h2>\n
      <ul class="article-list-of-year">\n`;
    item.sort((one, next) => {
      return -(Number(String(one.articleDate.replace(/-/g, ''))) - Number(String(next.articleDate).replace(/-/g, '')));
    });
    item.forEach((innerItem) => {
      indexContent += `\
        <li class="article-line">\n
          <a class="article-title-alink" href="${innerItem.fileName}">${innerItem.articleTitle}</a>\n
          <span class="article-date">${innerItem.articleDate}</span>\n
        </li>\n`;
    });
    indexContent += `\
      </ul>\n
    </li>\n
    `;
  }
});
fs.writeFileSync('index.html', indexHeader + indexContent + indexFooter);


// 递归遍历 markdown 目录/文件并生成对应的 html
function readAndWriteDirSync(srcPath, distPath) {
  const paths = fs.readdirSync(srcPath);
  paths.forEach((ele, index) => {
    const localPath = srcPath + path.sep + ele;
    const distLocalPath = distPath + path.sep +  ele;
    const info = fs.statSync(localPath);

    // mac 下 特殊的 .DS_Store 进行删除并忽略
    if (ele === '.DS_Store') {
      fs.unlinkSync(localPath);
      return;
    }

    if (info.isDirectory()) {
      if (!fs.existsSync(distLocalPath)) {
        // 目标目录不存在则创建
        fs.mkdirSync(distLocalPath);
      }
      articles[ele] = [];
      articles[ele].year = ele;
      readAndWriteDirSync(localPath, distLocalPath);
    } else {
      // 文件直接生成
      let fileContent = fs.readFileSync(localPath, 'utf8');
      const distHtml = distLocalPath.replace(/.md$/, '.html');
      const parentDir = path.dirname(distHtml);
      const parentDirName = parentDir.replace(path.dirname(parentDir) + path.sep, '');
      const articleTitle = fileContent.split('\n')[0].replace(/^#[ ]/, '');
      fileContent = converter.makeHtml(fileContent);
      fileContent = articleHeader + fileContent + articleFooter;
      articles[parentDirName].push({
        fileName: DIST_DIR_NAME + path.sep + parentDirName + path.sep + ele.replace(/.md$/, '.html'),
        articleDate: ele.substr(0, 10),
        articleTitle: articleTitle,
      });
      fs.writeFileSync(distHtml, fileContent);
    }
  });
}

console.log('Done');