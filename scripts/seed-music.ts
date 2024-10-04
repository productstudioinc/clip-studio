import { exit } from 'process'
import { db } from '@/db'
import { music } from '@/db/schema'

const musicData = [
  {
    id: 1,
    name: 'Cornfield Chase Interstellar Cover',
    description:
      "Epic orchestral cover of Hans Zimmer's Cornfield Chase from Interstellar",
    audioUrl:
      'https://assets.clip.studio/music/Cornfield%20Chase%20Interstellar%20Cover.mp3'
  },
  {
    id: 2,
    name: 'JVKE Golden Hour',
    description: 'Upbeat pop track with catchy melodies',
    audioUrl: 'https://assets.clip.studio/music/JVKE%20Golden%20Hour.mp3'
  },
  {
    id: 3,
    name: 'Vengeance',
    description: 'Intense and dramatic orchestral piece',
    audioUrl: 'https://assets.clip.studio/music/Vengeance.mp3'
  },
  {
    id: 4,
    name: 'VØJ, Narvent - Memory Reboot',
    description: 'Electronic dance track with energetic beats',
    audioUrl:
      'https://assets.clip.studio/music/V%C3%98J%2C%20Narvent%20-%20Memory%20Reboot.mp3'
  },
  {
    id: 5,
    name: 'freaks x in my head',
    description: 'Remix combining two popular tracks for a unique sound',
    audioUrl: 'https://assets.clip.studio/music/freaks%20x%20in%20my%20head.mp3'
  },
  {
    id: 6,
    name: 'øneheart x reidenshi - snowfall',
    description: 'Chill lofi beats with a winter atmosphere',
    audioUrl:
      'https://assets.clip.studio/music/%C3%B8neheart%20x%20reidenshi%20-%20snowfall.mp3'
  }
]

const seedMusic = async () => {
  try {
    for (const song of musicData) {
      await db.insert(music).values(song)
    }
    console.log('Music seeding completed successfully')
  } catch (error) {
    console.error('Error seeding music:', error)
  } finally {
    exit(0)
  }
}

seedMusic()
