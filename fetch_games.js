import fs from 'fs';

async function fetchGames() {
  const games = new Map();
  
  // いくつかのソート・条件で検索して幅広いゲームを収集
  // 1. トップセラー (Top Sellers)
  // 2. ユーザーレビュー評価順 (User Reviews)
  // 3. 話題・人気作 (Popular)
  // 4. 日本語サポート/国内人気
  const sorts = [
    { name: 'Top Sellers', url: 'https://store.steampowered.com/search/results/?query&start={START}&count=100&dynamic_data=&force_infinite=1&category1=998&filter=topsellers&infinite=1' },
    { name: 'Reviews', url: 'https://store.steampowered.com/search/results/?query&start={START}&count=100&dynamic_data=&force_infinite=1&category1=998&sort_by=Reviews_DESC&infinite=1' },
    { name: 'General', url: 'https://store.steampowered.com/search/results/?query&start={START}&count=100&dynamic_data=&force_infinite=1&category1=998&infinite=1' }
  ];

  for (const sort of sorts) {
    console.log(`Fetching ${sort.name}...`);
    for (let start = 0; start < 500; start += 100) {
      try {
        const targetUrl = sort.url.replace('{START}', start);
        const res = await fetch(targetUrl, {
          headers: {
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const data = await res.json();
        const html = data.results_html || '';
        
        // 正規表現でappid, title, price, discount などを抽出
        const itemRegex = /<a href="[^"]*\/app\/(\d+)[^"]*"[^>]*>[\s\S]*?<span class="title">([^<]+)<\/span>[\s\S]*?<\/a>/g;
        let match;
        let count = 0;
        while ((match = itemRegex.exec(html)) !== null) {
          const id = parseInt(match[1], 10);
          const title = match[2].trim().replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
          if (id && title && !games.has(id)) {
            games.set(id, { id, title });
            count++;
          }
        }
        console.log(`  start=${start}: found ${count} games (Total unique: ${games.size})`);
        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        console.error(`Error fetching ${sort.name} at start=${start}:`, err.message);
      }
    }
  }

  const list = Array.from(games.values());
  console.log(`Total collected: ${list.length}`);
  fs.writeFileSync('games.json', JSON.stringify(list, null, 2), 'utf-8');
  console.log('Saved to games.json');
}

fetchGames();
