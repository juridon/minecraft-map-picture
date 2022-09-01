// マイクラ上に並べて地図から色を取得していちいち調べためんどくさかった。
const COLOR_BLOCKS = {
  '#CBCBCB': 'WHITE_CONCRETE',
  '#AC6529': 'ORANGE_CONCRETE',
  '#8D3CAC': 'MAGENTA_CONCRETE',
  '#517AAC': 'LIGHT_BLUE_CONCRETE',
  '#B6B629': 'YELLOW_CONCRETE',
  '#65A313': 'LIME_CONCRETE',
  '#C06583': 'PINK_CONCRETE',
  '#3C3C3C': 'GRAY_CONCRETE',
  '#7A7A7A': 'LIGHT_GRAY_CONCRETE',
  '#3C657A': 'CYAN_CONCRETE',
  '#65328D': 'PURPLE_CONCRETE',
  '#293C8D': 'BLUE_CONCRETE',
  '#513C29': 'BROWN_CONCRETE',
  '#516529': 'GREEN_CONCRETE',
  '#7A2929': 'RED_CONCRETE',
  '#131313': 'BLACK_CONCRETE',
  '#C5BA81': 'SAND',
  '#749645': 'GRASS',
  '#C7BD3D': 'GOLD_BLOCK',
  '#658D2C': 'SLIME_BLOCK',
  '#00AD2E': 'EMERALD_BLOCK',
  '#858585': 'IRON_BLOCK',
  '#595959': 'STONE',
  '#49AEA9': 'DIAMOND_BLOCK',
  '#3A66CB': 'LAPIS_LAZULI_BLOCK',
  '#725E39': 'PLANKS_SPRUCE',
  '#CB0000': 'REDSTONE_BLOCK',
  '#7D808C': 'CLAY',
  '#7B7BC3': 'BLUE_ICE',
  '#752727': 'RED_NETHER_BRICK',
  '#C39048': 'GLOWSTONE',
  '#73533B': 'JUNGLE_FENCE_GATE',
  '#634225': 'SPRUCE_FENCE_GATE',
  '#314613': 'DARK_OAK_LEAVES',
  '#005E00': 'DRIED_KELP_BLOCK',
  '#344423': 'LEAVES_BIRCH',
  '#283F28': 'LEAVES_SPRUCE',
  '#C3C1BB': 'BLOCK_OF_QUARTZ',
};

// ↑のキーの配列
const palette = Object.keys(COLOR_BLOCKS);

// 色を判別するライブラリをありがたく使わせていただきますの行
const colorClassifier = new ColorClassifier(palette);

// RGBの値を16進数のカラーコード#ffffffみたいなやつに変換する関数を定義している行
const rgb2hex = (rgb) => '#' + rgb.map((value) => ('0' + value.toString(16)).slice(-2)).join('');

// ボタンを作っている行
const btnCode = document.getElementById('btnCode');

// ボタンに力を持たせている行（クリックしたら動く関数を定義している）
btnCode.addEventListener('click', ()=>{
  const draw_dots = [];
  // canvas上の画像データ（128x128）をゲット！
  const data = ctx.getImageData(0, 0, 128, 128).data;
  const dots = [];
  let one_dot = [];
  data.forEach((v, idx)=>{
    one_dot.push(v);
    // dataには[R,G,B,Alpha, R,G,B,Alpha, ....]の順に値が入っているので、4つずつにバラす。
    // もっといい方法があるとおもう
    if (idx % 4 === 3) {
      dots.push(one_dot);
      one_dot = [];
    }
  });

  // 色をゲットしてその色のブロック名をゲット！
  const dots_color = [];
  dots.forEach((v)=>{
    // 透明じゃなかったら色を指定する
    if (v[3] > 0) {
      // RGB値→カラーコードにして、カラーコードから色をゲット！
      const color = colorClassifier.classify(rgb2hex([v[0], v[1], v[2]]), 'hex');
      // 描くべきブロックをdots_colorの配列にプッシュ！
      dots_color.push(COLOR_BLOCKS[color]);
    } else {
      // 透明だったらとりあえず'A'ってことにしてるとりあえず。後で使う。
      dots_color.push('A');
    }
  });


  // dots_colorは要素数65536→4で割って16384これを128x128の2次元配列に分割になるようにしてるの
  let tmp_dcolorsZ = [];
  dots_color.forEach((v, idx)=>{
    if (idx % 128 === 0) {
      tmp_dcolorsZ = [];
    } else if (idx % 128 === 127) {
      draw_dots.push(tmp_dcolorsZ);
    }
    tmp_dcolorsZ.push(v);
  });

  const filedata = document.getElementById('file');

  // マイクラのMakeCode用プログラムにしているところ。
  let code = `// ${filedata.files[0].name}
  let list: number[] = []\n
  let position: Position = null\n
  let i = 0\n
  player.onChat("run", function (num1, num2, num3) {\n
    list = []\n
    player.teleport(world(num1, num2, num3))\n
    position = positions.add(player.position(),pos(0, -1, 0))\n`;
  // ブロックを1個ずつ置く命令を書いていく～
  draw_dots.forEach((v, iZ)=>{
    v.forEach((w, iX)=>{
      if (w !== 'A') {
        code += `  blocks.place(${w}, positions.add(position, pos(${iX}, 0, ${iZ})))\n`;
      }
    });
  });

  code += `  player.tell(mobs.target(LOCAL_PLAYER), "画像ができたよ")\n
   '})\n`;

  const txtArea = document.getElementById('txta');
  txtArea.value = code;
});

const file = document.getElementById('file');
const canvas = document.getElementById('canvas');
const canvasWidth = 128;
const canvasHeight = 128;
let uploadImgSrc;

canvas.width = canvasWidth;
canvas.height = canvasHeight;
const ctx = canvas.getContext('2d');

const loadLocalImage = (e) => {
  const fileData = e.target.files[0];
  if (!fileData.type.match('image.*')) {
    alert('画像ファイルにしてね');
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    uploadImgSrc = reader.result;
    canvasDraw();
  };
  reader.readAsDataURL(fileData);
};

file.addEventListener('change', loadLocalImage, false);

const canvasDraw = () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const img = new Image();
  img.src = uploadImgSrc;
  img.onload = function() {
    ctx.drawImage(img, 0, 0, canvasWidth, this.height * (canvasWidth / this.width));
  };
};

