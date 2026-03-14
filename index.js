const fsExtra = require("fs-extra");
const reader = require("xlsx");
const file = reader.readFile("./french.xlsx");
let data = [];
const useFolders = true;

function convertEnNumberToAr(number) {
  return number.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

function buildHtml(page, body) {
  const header = `
  <meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
  <title>page ${page} - المختصر في تفسير القرآن الكريم</title>
  <script src="../mdk-player.js"></script>
    <style>html {
    font-size: 17px;
    }

    @supports (font: -apple-system-body) {
    html {
        font: -apple-system-body;
    }
    }

    @media only screen and (min-width: 600px) {
    html {
      font-size: 19px;
    }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #FCF4E6;
      margin: 0;
    }

    .rtl {
    direction: rtl;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    .body--wrapper {
    padding: 12px;
    }

    .site-header {
    background: #F5ECDC;
    border-bottom: 1px solid #DED2BF;
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    }

    .site-header--wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 12px;
    }

    .site-header--wrapper a {
    font-weight: bold;
    font-size: 1rem;
    text-decoration: none;
    color: #036901;
    padding: 0.5rem;
    }

    .site-header--wrapper a:hover {
    color: #139110;
    }

    h1 {
      text-align: center;
      font-size: 1rem;
      color: rgb(80, 72, 64);
    }

    h2 {
      font-size: 1.2rem;
      margin: 30px 0 16px 0;
      color: rgb(80, 72, 64);
      padding-right: 12px;
    }

    h3 {
      font-size: 1.1rem;
      color: #9C856E;
      margin-top: 24px;
      margin-bottom: 12px;
      padding-right: 12px;
    }

    p, li {
    line-height: 1.75rem;
    padding: 12px;
    margin: 0;
    color: rgb(80, 72, 64);
    }

    .highlighted p {
      background-color: #F5ECDC;
      border-radius: 0.5rem;
    }

    ul {
    margin: 0;
    padding: 16px 0;
    list-style-position: inside;
    }

    li {
    padding-top: 0;
    padding-bottom: 8px;
    }

    em {
      color: #9B2725;
      font-style: normal;
    }
    .sura_type{
      font-size:20px;
      color:rgb(107 96 86);
    }

    .verse {
      color: #036901;
      font-weight: 500;
      padding: 20px 12px;
      direction: rtl;
    }
    </style>`;

  // استبدل هذا الجزء في نهاية الدالة:

  // استبدل جزء الـ return في نهاية دالة buildHtml بهذا الكود:

  return (
    "<!DOCTYPE html>" +
    "<html><head>" +
    header +
    `</head><body class="ltr">\n<div class="tafsirContent">` +
    `
    <header class="site-header">
      <div class="wrapper site-header--wrapper">
        <div class="site-header--item">
            ${
              page <= 1
                ? ""
                : `<a href="../${page - 1}/"><span>←</span></a>`
            }
        </div>
        <div class="site-header--item"><h1>Page ${page}</h1></div>
        <div class="site-header--item">
        ${page >= 604 ? "" : `<a href="../${page + 1}/"><span>→</span></a>`}

        </div>
      </div>
    </header>
    ` +
    // هنا قمنا بفتح الديف الجديد
    `\n<div class="tafseer-page">\n` +
    `<div class="wrapper body--wrapper">` +
    `\n<div style="text-align: center; margin-bottom: 20px;">` +
    `<mdk-player src="french/${page}.mp3"></mdk-player>` +
    `</div>\n` +
    body +
    `</div>` +
    // هنا قمنا بإغلاق الديف الجديد
    `\n</div>\n` +
    `\n</div>\n</body></html>`
  );
  
}

const sheets = file.SheetNames;
for (let i = 0; i < sheets.length; i++) {
  const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
  temp.forEach((res) => {
    data.push(res);
  });
}

for (let i = 1; i <= 604; i++) {
  const filename = useFolders ? `./${i}/index.html` : `./pages/${i}.html`;
  const pageArr = data
    .filter((res) => res.page === i)
    .sort((a, b) => a.order - b.order);
  const htmlArr = [];

  const fawaed = pageArr.filter((res) => {
    if (res.type === "fawaed") {
      return true;
    }
    return false;
  });

  for (let j = 0; j < pageArr.length; j++) {
    const row = pageArr[j];
    const type = row.type; // "meta", "maqased", "intro", "tafsir", "fawaed", "rabt"
    const metaType = row.meta_type; // "sura_name", "sura_type", "word_maqased", "word_tafsir", "word_fawaed"
    const nass7 = row.translation;

    if (type === "meta" && metaType === "sura_name") {
      htmlArr.push(`<h2>${nass7}</h2>`);
    }
    if (type === "meta" && metaType === "sura_type") {
      htmlArr.push(`
        <div class="highlighted">
          <p>
            ${nass7}
          </p>
        </div>
      `);
    }
    if (type === "meta" && metaType === "word_maqased") {
      htmlArr.push(`<h3>${nass7}</h3>`);
    }
    if (type === "maqased") {
      htmlArr.push(`
        <div class="highlighted">
          <p>
            ${nass7}
          </p>
        </div>
      `);
    }
    if (type === "meta" && metaType === "word_tafsir") {
      htmlArr.push(`<h3>${nass7}</h3>`);
    }
    if (type === "intro") {
      htmlArr.push(`<div class="highlighted">
        <p>
          ${nass7}
        </p>
      </div>
      `);
    }
    if (type === "tafsir") {
      htmlArr.push(`<p class="verse">(${convertEnNumberToAr(
        row.aya
      )}) ${convertEnNumberToAr(row.uthmani)}</p>
        <div class="highlighted">
          <p>
            ${nass7}
          </p>
        </div>`);
    }
    if (type === "meta" && metaType === "word_fawaed") {
      htmlArr.push(`<h3 class="ltr">${nass7}</h3>`);
    }
    if (type === "rabt") {
      htmlArr.push(`
        <div class="highlighted">
          <p>
            ${nass7}
          </p>
        </div>
      `);
    }
  }

  if (fawaed.length > 0) {
    htmlArr.push(`
      <div class="highlighted ltr">
        <p>
          ${fawaed
            .map((fawaed1) => {
              return `${fawaed1.translation}`;
            })
            .join("<br>")}
        </p>
      </div>
    `);
  }

  const html = buildHtml(i, htmlArr.join(" "));
  fsExtra.outputFile(filename, html, function (err) {
    if (err) {
      return console.log(err);
    }
  });
}