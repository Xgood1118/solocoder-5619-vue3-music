import type { Song } from '@/types/song'

export const MOCK_SONGS: Song[] = [
  { id: 'online-1', title: '星辰大海', artist: '黄霄雲', album: '星辰大海', year: '2020', duration: 256, coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=starfield%20ocean%20album%20cover%20digital%20art&image_size=square_hd', lyricsLrc: '[00:00.00]星辰大海\n[00:10.00]我愿变成一颗恒星\n[00:20.00]守护你的旅行\n[00:30.00]不管多远距离\n[00:40.00]我都会奔向你', source: 'online', filePath: '', fileUrl: '', addedAt: Date.now() },
  { id: 'online-2', title: '起风了', artist: '买辣椒也用券', album: '起风了', year: '2019', duration: 315, coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=windy%20sky%20album%20cover%20anime%20style&image_size=square_hd', lyricsLrc: '[00:00.00]起风了\n[00:12.00]我曾难自拔于世界之大\n[00:22.00]也沉溺于其中梦话\n[00:32.00]不得真假不做挣扎\n[00:42.00]不惧笑话', source: 'online', filePath: '', fileUrl: '', addedAt: Date.now() },
  { id: 'online-3', title: '孤勇者', artist: '陈奕迅', album: '孤勇者', year: '2021', duration: 262, coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lone%20warrior%20album%20cover%20dark%20epic&image_size=square_hd', lyricsLrc: '[00:00.00]孤勇者\n[00:08.00]爱你孤身走暗巷\n[00:16.00]爱你不跪的模样\n[00:24.00]爱你对峙过绝望\n[00:32.00]不肯哭一场', source: 'online', filePath: '', fileUrl: '', addedAt: Date.now() },
  { id: 'online-4', title: '晴天', artist: '周杰伦', album: '叶惠美', year: '2003', duration: 269, coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sunny%20day%20album%20cover%20vintage%20style&image_size=square_hd', lyricsLrc: '[00:00.00]晴天\n[00:15.00]故事的小黄花\n[00:22.00]从出生那年就飘着\n[00:30.00]童年的荡秋千\n[00:38.00]随记忆一直晃到现在', source: 'online', filePath: '', fileUrl: '', addedAt: Date.now() },
  { id: 'online-5', title: '光年之外', artist: '邓紫棋', album: '光年之外', year: '2016', duration: 235, coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outer%20space%20galaxy%20album%20cover&image_size=square_hd', lyricsLrc: '[00:00.00]光年之外\n[00:10.00]感受停在我发端的指尖\n[00:20.00]如何瞬间冻结时间\n[00:30.00]记住望着我坚定的双眼\n[00:40.00]也许已经没有明天', source: 'online', filePath: '', fileUrl: '', addedAt: Date.now() },
  { id: 'online-6', title: '漠河舞厅', artist: '柳爽', album: '漠河舞厅', year: '2020', duration: 293, coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=snowy%20dance%20hall%20album%20cover%20nostalgic&image_size=square_hd', lyricsLrc: '[00:00.00]漠河舞厅\n[00:12.00]如果有时间\n[00:20.00]你会来看一看我吧\n[00:28.00]看大雪如何衰老的\n[00:36.00]我的眼睛如何融化', source: 'online', filePath: '', fileUrl: '', addedAt: Date.now() },
  { id: 'online-7', title: '稻香', artist: '周杰伦', album: '魔杰座', year: '2008', duration: 223, coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rice%20field%20sunset%20album%20cover%20warm&image_size=square_hd', lyricsLrc: '[00:00.00]稻香\n[00:08.00]对这个世界如果你有太多的抱怨\n[00:16.00]跌倒了就不敢继续往前走\n[00:24.00]为什么人要这么的脆弱堕落\n[00:32.00]请你打开电视看看', source: 'online', filePath: '', fileUrl: '', addedAt: Date.now() },
  { id: 'online-8', title: '漂洋过海来看你', artist: '李宗盛', album: '漂洋过海来看你', year: '1991', duration: 278, coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20horizon%20album%20cover%20romantic&image_size=square_hd', lyricsLrc: '[00:00.00]漂洋过海来看你\n[00:14.00]为你我用了半年的积蓄\n[00:22.00]漂洋过海的来看你\n[00:30.00]为了这次相聚\n[00:38.00]我连见面时的呼吸都曾反复练习', source: 'online', filePath: '', fileUrl: '', addedAt: Date.now() },
]

export interface SearchResponse {
  results: Song[]
  total: number
  query: string
}

export interface TranslateResponse {
  original: string
  translated: string
  lang: string
}

export async function mockSearch(keyword: string): Promise<SearchResponse> {
  await delay(300)
  const q = keyword.toLowerCase()
  const results = MOCK_SONGS.filter(song =>
    song.title.toLowerCase().includes(q) ||
    song.artist.toLowerCase().includes(q) ||
    song.album.toLowerCase().includes(q)
  )
  return { results, total: results.length, query: keyword }
}

export async function mockTranslate(text: string): Promise<TranslateResponse> {
  await delay(200)
  const mockTranslations: Record<string, string> = {
    '我愿变成一颗恒星': 'I wish to become a star',
    '守护你的旅行': 'Guarding your journey',
    '不管多远距离': 'No matter the distance',
    '我都会奔向你': 'I will run to you',
    '我曾难自拔于世界之大': 'I was once lost in the vastness of the world',
    '也沉溺于其中梦话': 'And addicted to its dreams',
    '不得真假不做挣扎': 'Unable to tell truth from falsehood',
    '不惧笑话': 'Not fearing ridicule',
  }
  return {
    original: text,
    translated: mockTranslations[text] || `[Translated] ${text}`,
    lang: 'zh→en',
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
