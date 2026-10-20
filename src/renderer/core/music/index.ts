// if (targetSong.key) { // 如果是已下载的歌曲
//   const filePath = path.join(appSetting['download.savePath'], targetSong.metadata.fileName)
//   // console.log(filePath)

import {
  getMusicUrl as getOnlineMusicUrl,
  getPicUrl as getOnlinePicUrl,
  getLyricInfo as getOnlineLyricInfo,
} from './online'
import { downloadList } from '@renderer/store/download/state'
import { buildSavePath } from '@renderer/store/download/utils'
import { appSetting } from '@renderer/store/setting'
import { getDownloadFilePath } from '@renderer/utils/music'
import { getPlayQuality } from './utils'
import {
  getMusicUrl as getDownloadMusicUrl,
  getPicUrl as getDownloadPicUrl,
  getLyricInfo as getDownloadLyricInfo,
} from './download'
import {
  getMusicUrl as getLocalMusicUrl,
  getPicUrl as getLocalPicUrl,
  getLyricInfo as getLocalLyricInfo,
} from './local'


const QUALITY_ORDER: LX.Quality[] = ['flac24bit', 'flac', 'wav', 'ape', '320k', '192k', '128k']

const findPlayableDownload = async(musicInfo: LX.Music.MusicInfoOnline, minQuality?: LX.Quality): Promise<string> => {
  const candidates = downloadList.filter(item => {
    if (!item.isComplate) return false
    const info = item.metadata.musicInfo
    return info.source == musicInfo.source && info.id == musicInfo.id
  })
  if (!candidates.length) return ''
  const minIndex = minQuality ? QUALITY_ORDER.indexOf(minQuality) : -1
  const playable = candidates
    .filter(item => minIndex < 0 || QUALITY_ORDER.indexOf(item.metadata.quality) <= minIndex)
    .sort((a, b) => QUALITY_ORDER.indexOf(a.metadata.quality) - QUALITY_ORDER.indexOf(b.metadata.quality))
  for (const item of playable) {
    const path = await getDownloadFilePath(item, buildSavePath(item))
    if (path) return path
  }
  return ''
}

/**
 * 已下载优先：在线歌曲若已有同源同 id 且音质不低于当前设置的下载文件，直接播放本地文件
 */
const getDownloadedMusicFile = async(musicInfo: LX.Music.MusicInfoOnline): Promise<string> => {
  if (!appSetting['download.preferDownloaded']) return ''
  const targetQuality = getPlayQuality(appSetting['player.playQuality'], musicInfo)
  return findPlayableDownload(musicInfo, targetQuality)
}

export const getMusicUrl = async({
  musicInfo,
  quality,
  isRefresh = false,
  onToggleSource,
  allowToggleSource,
}: {
  musicInfo: LX.Music.MusicInfo | LX.Download.ListItem
  isRefresh?: boolean
  quality?: LX.Quality
  onToggleSource?: (musicInfo?: LX.Music.MusicInfoOnline) => void
  allowToggleSource?: boolean
}): Promise<string> => {
  if ('progress' in musicInfo) {
    return getDownloadMusicUrl({ musicInfo, isRefresh, onToggleSource, allowToggleSource })
  } else if (musicInfo.source == 'local') {
    return getLocalMusicUrl({ musicInfo, isRefresh, onToggleSource, allowToggleSource })
  } else {
    if (!isRefresh) {
      const downloaded = await getDownloadedMusicFile(musicInfo)
      if (downloaded) return downloaded
    }
    return getOnlineMusicUrl({ musicInfo, isRefresh, quality, onToggleSource, allowToggleSource })
  }
}

export const getPicPath = async({
  musicInfo,
  isRefresh = false,
  listId,
  onToggleSource,
}: {
  musicInfo: LX.Music.MusicInfo | LX.Download.ListItem
  listId?: string | null
  isRefresh?: boolean
  onToggleSource?: (musicInfo?: LX.Music.MusicInfoOnline) => void
}): Promise<string> => {
  if ('progress' in musicInfo) {
    return getDownloadPicUrl({ musicInfo, isRefresh, listId, onToggleSource })
  } else if (musicInfo.source == 'local') {
    return getLocalPicUrl({ musicInfo, isRefresh, listId, onToggleSource })
  } else {
    return getOnlinePicUrl({ musicInfo, isRefresh, listId, onToggleSource })
  }
}

export const getLyricInfo = async({
  musicInfo,
  isRefresh = false,
  onToggleSource,
}: {
  musicInfo: LX.Music.MusicInfo | LX.Download.ListItem
  isRefresh?: boolean
  onToggleSource?: (musicInfo?: LX.Music.MusicInfoOnline) => void
}): Promise<LX.Player.LyricInfo> => {
  if ('progress' in musicInfo) {
    return getDownloadLyricInfo({ musicInfo, isRefresh, onToggleSource })
  } else if (musicInfo.source == 'local') {
    return getLocalLyricInfo({ musicInfo, isRefresh, onToggleSource })
  } else {
    return getOnlineLyricInfo({ musicInfo, isRefresh, onToggleSource })
  }
}
