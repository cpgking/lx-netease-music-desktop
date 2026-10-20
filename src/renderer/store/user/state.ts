import { ref, shallowReactive } from '@common/utils/vueTools'

export interface WyPlaylistInfo {
  id: string | number
  userId: number
  name: string
  coverImgUrl: string
  trackCount: number
  playCount?: number
  specialType?: number
  description?: string
  creator?: {
    nickname?: string
  }
}

export interface WyArtistInfo {
  id: string | number
  name: string
  alias?: string[] | null
  albumSize?: number
  musicSize?: number
  mvSize?: number
  picUrl?: string
  img1v1Url?: string
}

export interface WyAlbumInfo {
  id: string | number
  name: string
  picUrl: string
  size: number
  publishTime?: number
  artists?: Array<{ id: string | number, name: string }>
  artistName?: string
  artistId?: string | number
}

export const wyUid = ref<string | null>(null)
export const wyVipType = ref(0)
export const wyLikedSongIds = ref<Set<string>>(new Set())
export const wyPlaylists = shallowReactive<WyPlaylistInfo[]>([])
export const wySubscribedPlaylists = shallowReactive<WyPlaylistInfo[]>([])
export const wyFollowedArtists = shallowReactive<WyArtistInfo[]>([])
export const wySubscribedAlbums = shallowReactive<WyAlbumInfo[]>([])
export const wyUserLoading = ref(false)
export const wyUserError = ref('')

// 非网易云歌曲的本地喜欢状态（仅存本地，不涉及任何平台接口）
const LOCAL_LIKED_KEY = 'user__local_liked_song_ids'

const readLocalLikedIds = (): Set<string> => {
  try {
    const raw = window.localStorage.getItem(LOCAL_LIKED_KEY)
    if (!raw) return new Set()
    const list = JSON.parse(raw)
    return new Set(Array.isArray(list) ? list.map(String) : [])
  } catch {
    return new Set()
  }
}

export const localLikedSongIds = ref<Set<string>>(readLocalLikedIds())

export const toggleLocalLike = (musicInfo: LX.Music.MusicInfoOnline) => {
  const id = String(musicInfo.id)
  const next = new Set(localLikedSongIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  localLikedSongIds.value = next
  try {
    window.localStorage.setItem(LOCAL_LIKED_KEY, JSON.stringify([...next]))
  } catch {}
}
