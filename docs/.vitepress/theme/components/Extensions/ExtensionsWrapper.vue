<!--
  Copyright (c) The Tachiyomi Open Source Project
  SPDX-License-Identifier: MPL-2.0
-->

<script setup lang="ts">
import groupBy from 'lodash.groupby'
import { ElLoading } from 'element-plus'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { simpleLangName } from '../../utils/languages'
import ExtensionFilters from './ExtensionFilters.vue'
import ExtensionList from './ExtensionList.vue'
import type { Nsfw, Sort } from './ExtensionFilters.vue'
import type { ExtensionSource } from '../../types/ExtensionSources'
import type { Extension } from '../../composables/useExtensionsQuery'
import useExtensionsRepositoryQuery from '../../composables/useExtensionsQuery'

const extensionSources: ExtensionSource[] = [
  {
    name: 'Claudemirovsky',
    url: 'https://raw.githubusercontent.com/Claudemirovsky/cursedyomi-extensions/repo/index.min.json'
  },
  {
    name: 'Dark25',
    url: 'https://raw.githubusercontent.com/Dark25/aniyomi-extensions/repo/index.min.json'
  },
  {
    name: 'hollow',
    url: 'https://codeberg.org/hollow/aniyomi-extensions-fr/media/branch/repo/index.min.json'
  },
  {
    name: 'Kavita',
    url: 'https://raw.githubusercontent.com/Kareadita/tach-extension/repo/index.min.json'
  },
  {
    name: 'Keiyoushi',
    url: 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json'
  },
  {
    name: 'Kohi-den',
    url: 'https://raw.githubusercontent.com/Kohi-den/extensions/main/index.min.json'
  },
  {
    name: 'Komikku',
    url: 'https://raw.githubusercontent.com/komikku-app/extensions/repo/index.min.json'
  },
  {
    name: 'ni3x',
    url: 'https://raw.githubusercontent.com/ni3x/aniyomi-extensions/repo/index.min.json'
  },
  {
    name: 'Secozzi',
    url: 'https://raw.githubusercontent.com/Secozzi/aniyomi-extensions/refs/heads/repo/index.min.json'
  },
  {
    name: 'Suwayomi',
    url: 'https://raw.githubusercontent.com/Suwayomi/tachiyomi-extension/repo/index.min.json'
  }
]

const filters = reactive({
  search: '',
  lang: [] as string[],
  nsfw: 'Show all' as Nsfw,
  sort: 'Ascending' as Sort,
  selectedSources: []
})

// Compute active sources based on selection
const activeSources = computed(() =>
  extensionSources.filter((source) =>
    filters.selectedSources.includes(source.name)
  )
)

const { data: extensions, isLoading } = useExtensionsRepositoryQuery({
  sources: activeSources.value,
  select: (response) => {
    const values: Extension[][] = Object.values(groupBy(response, 'lang'))
    values.sort(languageComparator)
    return values
  }
})

function languageComparator(a: Extension[], b: Extension[]) {
  const langA = simpleLangName(a[0].lang)
  const langB = simpleLangName(b[0].lang)
  if (langA === 'All' && langB === 'English') {
    return -1
  }
  if (langA === 'English' && langB === 'All') {
    return 1
  }
  if (langA === 'English') {
    return -1
  }
  if (langB === 'English') {
    return 1
  }
  if (langA < langB) {
    return -1
  }
  if (langA > langB) {
    return 1
  }
  return 0
}

const filteredExtensions = computed(() => {
  // Return empty array if no sources are selected
  if (filters.selectedSources.length === 0) {
    return []
  }

  const filtered: Extension[][] = []

  for (const group of extensions.value ?? []) {
    let filteredGroup = filters.lang.length
      ? filters.lang.includes(group[0].lang)
        ? group
        : []
      : group

    if (filters.search) {
      const lower = filters.search.toLowerCase()

      filteredGroup = filteredGroup.filter(
        (ext) =>
          ext.name.toLowerCase().includes(lower) ||
          ext.sources.some((source) => source.id.includes(filters.search))
      )
    }

    filteredGroup = filteredGroup.filter((ext) =>
      filters.nsfw === 'Show all'
        ? true
        : ext.nsfw === (filters.nsfw === 'NSFW' ? 1 : 0)
    )

    if (filters.sort === 'Descending') {
      filteredGroup = filteredGroup.reverse()
    }

    if (filteredGroup.length) {
      filtered.push(filteredGroup)
    }
  }

  return filtered
})

const loadingInstance = ref<ReturnType<(typeof ElLoading)['service']>>()

onMounted(() => {
  loadingInstance.value = ElLoading.service({
    target: '.extensions',
    fullscreen: false,
    background: 'transparent'
  })
})

watch(extensions, async () => {
  if (window.location.hash) {
    await nextTick()
    document
      .getElementById(window.location.hash.substring(1))
      ?.scrollIntoView({ behavior: 'smooth' })
  }
})

// biome-ignore lint/suspicious/useAwait: <explanation>
watch([isLoading, loadingInstance], async ([newIsLoading]) => {
  if (!newIsLoading) {
    loadingInstance.value?.close()
  }
})
</script>

<template>
  <ExtensionFilters v-model:search="filters.search" v-model:lang="filters.lang" v-model:nsfw="filters.nsfw"
    v-model:sort="filters.sort" v-model:selected-sources="filters.selectedSources" :extensions="extensions ?? []"
    :sources="extensionSources" />
  <div class="extensions">
    <div v-if="!isLoading && filters.selectedSources.length === 0" class="text-center p-8 text-$vp-c-text-2">
      Please select at least one source to view extensions.
      <span class="font-mono tracking-tight ml-2">( • ᴖ • ｡)</span>
    </div>
    <ExtensionList v-else-if="!isLoading" :extensions="filteredExtensions" />
  </div>
</template>

<style scoped>
.extensions {
  min-height: 200px;
}
</style>
