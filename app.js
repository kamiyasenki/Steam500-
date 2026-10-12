// Steam ランダムゲームルーレット

let games = [];
let currentIndex = -1;
let isAnimating = false;

// DOM要素
const gameCard = document.getElementById('gameCard');
const gameImage = document.getElementById('gameImage');
const gameTitle = document.getElementById('gameTitle');
const storeLink = document.getElementById('storeLink');
const drawButton = document.getElementById('drawButton');

// 初期フォールバック用ゲームリスト (file://プロトコル等でfetchが制限される場合でも動作を保証)
const fallbackGames = [
  { id: 1086940, title: "Baldur's Gate 3" },
  { id: 1245620, title: "ELDEN RING" },
  { id: 1145360, title: "Hades" },
  { id: 883710, title: "Resident Evil 2" },
  { id: 1172470, title: "エーペックスレジェンズ" },
  { id: 413150, title: "Stardew Valley" },
  { id: 252490, title: "Rust" },
  { id: 730, title: "Counter-Strike 2" },
  { id: 1091500, title: "Cyberpunk 2077" },
  { id: 646570, title: "Slay the Spire" },
  { id: 268910, title: "Cuphead" },
  { id: 250900, title: "The Binding of Isaac: Rebirth" },
  { id: 367520, title: "Hollow Knight" },
  { id: 105600, title: "Terraria" },
  { id: 1794680, title: "Vampire Survivors" },
  { id: 2357570, title: "オーバーウォッチ 2" },
  { id: 2054970, title: "Dragon's Dogma 2" },
  { id: 1627720, title: "Lies of P" },
  { id: 553850, title: "HELLDIVERS™ 2" },
  { id: 1623730, title: "Palworld / パルワールド" }
];

// 初期化
async function init() {
  if (typeof STEAM_GAMES !== 'undefined' && Array.isArray(STEAM_GAMES) && STEAM_GAMES.length > 0) {
    games = STEAM_GAMES;
  } else {
    try {
      const res = await fetch('games.json');
      if (res.ok) {
        games = await res.json();
      } else {
        games = fallbackGames;
      }
    } catch (err) {
      console.warn('games.jsonの読み込みに失敗したため、内蔵リストを使用します:', err);
      games = fallbackGames;
    }
  }

  // 初回抽選
  drawRandomGame();
}

// ランダムにゲームを抽選して表示
function drawRandomGame() {
  if (!games || games.length === 0 || isAnimating) return;

  isAnimating = true;
  drawButton.disabled = true;
  drawButton.classList.add('animating');
  gameCard.classList.add('fade-out');

  // 前回と異なるインデックスを選ぶ
  let nextIndex;
  if (games.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * games.length);
    } while (nextIndex === currentIndex);
  } else {
    nextIndex = 0;
  }
  currentIndex = nextIndex;

  const game = games[currentIndex];

  setTimeout(() => {
    // コンテンツ更新
    gameTitle.textContent = game.title;
    storeLink.href = `https://store.steampowered.com/app/${game.id}/`;

    // 画像設定とロード待機
    gameImage.classList.remove('loaded');
    
    // Steam公式CDNのヘッダー画像
    const imageUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.id}/header.jpg`;
    
    // 画像ロードハンドラー
    gameImage.onload = () => {
      gameImage.classList.add('loaded');
      gameCard.classList.remove('fade-out');
      cleanup();
    };

    gameImage.onerror = () => {
      // 万が一ヘッダー画像が存在しない場合はSteamの代替カプセル画像
      gameImage.src = `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/capsule_616x353.jpg`;
      gameImage.classList.add('loaded');
      gameCard.classList.remove('fade-out');
      cleanup();
    };

    gameImage.src = imageUrl;

    // 安全のためのタイムアウト（回線遅延時）
    setTimeout(() => {
      if (isAnimating) {
        gameCard.classList.remove('fade-out');
        cleanup();
      }
    }, 600);

  }, 180);
}

function cleanup() {
  isAnimating = false;
  drawButton.disabled = false;
  drawButton.classList.remove('animating');
}

// イベントリスナー
drawButton.addEventListener('click', drawRandomGame);

// スペースキーでも引けるようにする
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    drawRandomGame();
  }
});

// 開始
init();
