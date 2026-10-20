<template>
  <button v-show="isCurrentList" :class="$style.btn" :aria-label="$t('player__locate')" @click="handleToMusicLocation">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" width="60%" viewBox="0 0 24 24" space="preserve">
      <use xlink:href="#icon-crosshairs-gps" />
    </svg>
  </button>
</template>

<script>
import { computed } from '@common/utils/vueTools'
import { LIST_IDS } from '@common/constants'
import { playInfo, playMusicInfo, tempPlayList } from '@renderer/store/player/state'
import { tempListMeta } from '@renderer/store/list/state'
import useToMusicLocation from '@renderer/components/layout/PlayBar/useToMusicLocation'

export default {
  name: 'LocatePlayingBtn',
  props: {
    listId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { handleToMusicLocation } = useToMusicLocation()

    // 只有当前正在播放的列表与当前页面一致时才显示定位按钮
    const isCurrentList = computed(() => {
      if (!playMusicInfo.musicInfo || playInfo.playIndex < 0) return false
      if (!props.listId) return false
      const playingListId = playMusicInfo.listId == LIST_IDS.TEMP ? tempListMeta.id : playMusicInfo.listId
      return playingListId == props.listId
    })

    return {
      isCurrentList,
      handleToMusicLocation,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.btn {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 10;
  width: 42px;
  height: 42px;
  padding: 0;
  border: none;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  color: var(--color-button-font);
  background: var(--color-primary-background);
  box-shadow: 0 2px 8px rgba(0, 0, 0, .25);
  opacity: .85;
  transition: opacity @transition-normal;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
  }
}
</style>
