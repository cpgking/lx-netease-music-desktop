import { computed, ref, reactive, nextTick } from '@common/utils/vueTools'
import { useI18n } from '@renderer/plugins/i18n'
import { userLists, defaultList, loveList } from '@renderer/store/list/state'
import musicSdk from '@renderer/utils/musicSdk'
import { addLocalFile } from './actions'

export default ({
  emit,

  handleRename,
  handleDuplicateList,
  handleSortList,
  handleOpenSourceDetailPage,
  handleImportList,
  handleExportList,
  handleUpdateSourceList,
  handleRemove,
}) => {
  const menuControl = reactive({
    rename: true,
    duplicate: true,
    sort: true,
    local_file: true,
    sourceDetail: true,
    import: true,
    export: true,
    sync: false,
    remove: true,
  })
  const t = useI18n()
  const menuLocation = reactive({ x: 0, y: 0 })
  const isShowMenu = ref(false)
  let headerTargetList = null
  let newListHandler = null

  const setNewListHandler = (handler) => {
    newListHandler = handler
  }

  const menus = computed(() => {
    return [
      {
        name: t('lists__rename'),
        action: 'rename',
        disabled: !menuControl.rename,
      },
      {
        name: t('lists__sort_list'),
        action: 'sort',
        disabled: !menuControl.sort,
      },
      {
        name: t('lists__duplicate'),
        action: 'duplicate',
        disabled: !menuControl.duplicate,
      },
      {
        name: t('lists__select_local_file'),
        action: 'local_file',
        disabled: !menuControl.local_file,
      },
      {
        name: t('lists__sync'),
        action: 'sync',
        disabled: !menuControl.sync,
      },
      {
        name: t('lists__source_detail'),
        action: 'sourceDetail',
        disabled: !menuControl.sourceDetail,
      },
      {
        name: t('lists__import'),
        action: 'import',
        disabled: !menuControl.export,
      },
      {
        name: t('lists__export'),
        action: 'export',
        disabled: !menuControl.export,
      },
      {
        name: t('lists__remove'),
        action: 'remove',
        disabled: !menuControl.remove,
      },
    ]
  })

  const assertSupportDetail = (source, index) => {
    if (source) {
      const { sourceListId } = userLists[index]
      if (sourceListId) {
        if (/board__/.test(sourceListId)) {
          // const id = sourceListId.replace(/board__/, '')
          return !!musicSdk[source]?.leaderboard?.getDetailPageUrl
        } else {
          return !!musicSdk[source]?.songList?.getDetailPageUrl
        }
      }
    }
    return false
  }

  // 顶部三点菜单：新建、导入、导出、排序、去重（作用于当前选中的列表）
  const headerMenus = computed(() => {
    return [
      {
        name: t('lists__new_list_btn'),
        action: 'header_new',
      },
      {
        name: t('lists__import'),
        action: 'header_import',
      },
      {
        name: t('lists__export'),
        action: 'header_export',
      },
      {
        name: t('lists__sort_list'),
        action: 'header_sort',
      },
      {
        name: t('lists__duplicate'),
        action: 'header_duplicate',
      },
    ]
  })

  const showHeaderMenu = (event, listInfo) => {
    headerTargetList = listInfo
    menuLocation.x = event.pageX
    menuLocation.y = event.pageY
    if (isShowMenu.value) return
    emit('show-menu')
    nextTick(() => {
      isShowMenu.value = true
    })
  }

  const headerMenuClick = (action) => {
    hideMenu()
    if (!action) return
    const listInfo = headerTargetList
    if (!listInfo) return
    switch (action.action) {
      case 'header_new':
        newListHandler?.()
        break
      case 'header_import':
        handleImportList(listInfo, -10)
        break
      case 'header_export':
        handleExportList(listInfo)
        break
      case 'header_sort':
        handleSortList(listInfo)
        break
      case 'header_duplicate':
        handleDuplicateList(listInfo)
        break
    }
  }

  const showMenu = (event, index) => {
    let source
    switch (index) {
      case -1:
      case -2:
        menuControl.rename = false
        menuControl.remove = false
        menuControl.sync = false
        break
      default:
        menuControl.rename = true
        menuControl.remove = true
        source = userLists[index].source
        menuControl.sync = !!source && !!musicSdk[source]?.songList
        break
    }
    // menuControl.sort = !!getList(this.getTargetListInfo(index)?.id).length
    menuControl.sourceDetail = assertSupportDetail(source, index)

    menuLocation.x = event.pageX
    menuLocation.y = event.pageY

    if (isShowMenu.value) return
    emit('show-menu')
    nextTick(() => {
      isShowMenu.value = true
    })
  }

  const hideMenu = () => {
    isShowMenu.value = false
  }

  const getListInfo = (index) => {
    let list
    switch (index) {
      case -2:
        list = defaultList
        break
      case -1:
        list = loveList
        break
      default:
        list = userLists[index]
        if (!list) return null
        break
    }
    return list
  }

  const menuClick = (action, index) => {
    // console.log(action)
    hideMenu()
    if (!action) return
    const listInfo = getListInfo(index)
    switch (action.action) {
      case 'rename':
        handleRename(index)
        break
      case 'duplicate':
        handleDuplicateList(listInfo)
        break
      case 'sort':
        handleSortList(listInfo)
        break
      case 'local_file':
        addLocalFile(listInfo)
        break
      case 'sourceDetail':
        handleOpenSourceDetailPage(listInfo)
        break
      case 'import':
        handleImportList(listInfo, index)
        break
      case 'export':
        handleExportList(listInfo)
        break
      case 'sync':
        handleUpdateSourceList(listInfo)
        break
      case 'remove':
        handleRemove(listInfo)
        break
    }
  }

  return {
    menus,
    headerMenus,
    menuLocation,
    isShowMenu,
    showMenu,
    menuClick,
    showHeaderMenu,
    headerMenuClick,
    setNewListHandler,
  }
}
