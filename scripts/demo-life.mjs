// 音乐库 + 相册演示数据（幂等，可重复执行）
// 运行：node scripts/demo-life.mjs
// 说明：音乐按「标题+艺术家」去重，照片按标题去重；
//       照片尺寸自动从 public/ 下的图片文件读取（供瀑布流计算比例）。
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import path from 'path'

const prisma = new PrismaClient()

const listen = (q) => `https://music.163.com/#/search/m/?s=${encodeURIComponent(q)}`

const MUSIC = [
  {
    title: '飞行器的执行周期',
    artist: '郭顶',
    genre: 'R&B',
    rating: 4,
    cover: '/images/music/orbit.jpg',
    review: '《水星记》是宇宙级的浪漫。复古合成器与太空意象交织，华语 R&B 的惊喜之作。',
    daysAgo: 2,
  },
  {
    title: 'async',
    artist: '坂本龙一',
    genre: '新古典',
    rating: 5,
    cover: '/images/music/async.jpg',
    review: '深夜写代码时的背景音。雨声、钢琴与留白，像给思绪蒙上一层柔光。',
    daysAgo: 5,
  },
  {
    title: 'folklore',
    artist: 'Taylor Swift',
    genre: '独立民谣',
    rating: 4,
    cover: '/images/music/folklore.jpg',
    review: '褪去流行光泽后的叙事诗。cardigan、august、betty 的三角叙事，适合雨天循环。',
    daysAgo: 9,
  },
  {
    title: '冀西南林路行',
    artist: '万能青年旅店',
    genre: '摇滚',
    rating: 5,
    cover: '/images/music/mountain-road.jpg',
    review: '山雾、公路与管乐交织的史诗。整张专辑一气呵成，像一部公路电影。',
    daysAgo: 14,
  },
  {
    title: 'some kind of peace',
    artist: 'Ólafur Arnalds',
    genre: '新古典',
    rating: 4,
    cover: '/images/music/peace.jpg',
    review: '冰岛式的克制与温柔。钢琴与弦乐像晨光里的尘埃，安静却有力量。',
    daysAgo: 21,
  },
  {
    title: 'In Rainbows',
    artist: 'Radiohead',
    genre: '另类摇滚',
    rating: 5,
    cover: '/images/music/in-rainbows.jpg',
    review: '从 15 Step 的碎拍到 Videotape 的钢琴收尾，温柔与不安并存，越听越深。',
    daysAgo: 30,
  },
  {
    title: '华丽的冒险',
    artist: '陈绮贞',
    genre: '独立民谣',
    rating: 4,
    cover: '/images/music/adventure.jpg',
    review: '一把吉他走天下的勇气。《旅行的意义》响起时，总想立刻出发。',
    daysAgo: 45,
  },
  {
    title: '范特西',
    artist: '周杰伦',
    genre: '流行',
    rating: 5,
    cover: '/images/music/fantasy.jpg',
    review: '华语流行的一座高峰。《双截棍》《爱在西元前》《简单爱》，每一首都是青春的注脚。',
    daysAgo: 60,
  },
]

const PHOTOS = [
  {
    title: '沙漠流星雨',
    image: '/images/gallery/desert-meteors.jpg',
    location: '中国·敦煌',
    takenAt: '2025-08-13',
    description: '英仙座流星雨极大夜，沙丘安静得能听见流星划过的声音。',
  },
  {
    title: '银河拱桥',
    image: '/images/gallery/milkyway-coast.jpg',
    location: '苏格兰·斯凯岛',
    takenAt: '2025-08-12',
    description: '等了三个晴夜，终于等到银河拱桥横跨海面。灯塔的光每七秒扫过一次。',
  },
  {
    title: '城市天台',
    image: '/images/gallery/city-rooftop.jpg',
    location: '中国·重庆',
    takenAt: '2025-06-21',
    description: '霓虹与星光在同一片天空下，城市的夜晚也有自己的银河。',
  },
  {
    title: '蓝冰洞',
    image: '/images/gallery/ice-cave.jpg',
    location: '冰岛·瓦特纳冰川',
    takenAt: '2025-03-18',
    description: '冰川内部是另一个星球。这抹蓝色来自千年挤压后排尽气泡的冰。',
  },
  {
    title: '雪原上的暖光',
    image: '/images/gallery/cabin-stars.jpg',
    location: '挪威·特罗姆瑟',
    takenAt: '2025-02-03',
    description: '零下二十度的雪原，小屋的窗光是唯一的人间烟火。',
  },
  {
    title: '极光之镜',
    image: '/images/aurora-lake.jpg',
    location: '挪威·罗弗敦',
    takenAt: '2025-01-20',
    description: '无风的夜晚，湖面把极光原样复制了一份。',
  },
  {
    title: '极光下的小屋',
    image: '/images/aurora-cabin.jpg',
    location: '芬兰·伊纳里',
    takenAt: '2024-12-28',
    description: '木屋、篝火与舞动的绿光，北境最温柔的一幕。',
  },
  {
    title: '晨雾森林',
    image: '/images/gallery/misty-forest.jpg',
    location: '加拿大·班夫',
    takenAt: '2024-10-05',
    description: '日出前十分钟，雾把森林分成五层，光从最上面一层漏下来。',
  },
  {
    title: '极光初现',
    image: '/images/aurora-bg.jpg',
    location: '冰岛·雷克雅未克',
    takenAt: '2024-11-15',
    description: '第一次亲眼见到极光，激动得连相机参数都忘了调。',
  },
]

async function imageSize(url) {
  try {
    const meta = await sharp(path.join(process.cwd(), 'public', url)).metadata()
    return { width: meta.width ?? 0, height: meta.height ?? 0 }
  } catch {
    return { width: 0, height: 0 }
  }
}

async function main() {
  let musicCreated = 0
  for (const m of MUSIC) {
    const audioUrl = m.cover.replace('/images/music/', '/audio/').replace('.jpg', '.wav')
    const exists = await prisma.musicItem.findFirst({ where: { title: m.title, artist: m.artist } })
    if (exists) {
      if (exists.audioUrl !== audioUrl) {
        await prisma.musicItem.update({ where: { id: exists.id }, data: { audioUrl } })
      }
      continue
    }
    await prisma.musicItem.create({
      data: {
        title: m.title,
        artist: m.artist,
        genre: m.genre,
        rating: m.rating,
        coverUrl: m.cover,
        audioUrl,
        review: m.review,
        listenUrl: listen(`${m.title} ${m.artist}`),
        createdAt: new Date(Date.now() - m.daysAgo * 86400_000),
      },
    })
    musicCreated++
  }

  let photoCreated = 0
  for (const p of PHOTOS) {
    const exists = await prisma.photo.findFirst({ where: { title: p.title } })
    if (exists) continue
    const { width, height } = await imageSize(p.image)
    await prisma.photo.create({
      data: {
        title: p.title,
        imageUrl: p.image,
        location: p.location,
        description: p.description,
        takenAt: new Date(p.takenAt),
        width,
        height,
      },
    })
    photoCreated++
  }

  const [musicTotal, photoTotal] = await Promise.all([prisma.musicItem.count(), prisma.photo.count()])
  console.log(`音乐库：新增 ${musicCreated} 张，共 ${musicTotal} 张`)
  console.log(`相册：新增 ${photoCreated} 张，共 ${photoTotal} 张`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())