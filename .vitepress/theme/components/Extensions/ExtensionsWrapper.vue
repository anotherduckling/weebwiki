<!--
  Copyright (c) The Tachiyomi Open Source Project
  SPDX-License-Identifier: MPL-2.0
-->

<script setup lang="ts">
import groupBy from "lodash.groupby";
import { ElLoading } from "element-plus";

import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { simpleLangName } from "../../utils/languages";
import useExtensionsRepositoryQuery from "../../queries/useExtensionsRepositoryQuery";
import type { Extension } from "../../queries/useExtensionsRepositoryQuery";
import ExtensionFilters from "./ExtensionFilters.vue";
import ExtensionList from "./ExtensionList.vue";
import type { Nsfw, Repo, Sort } from "./ExtensionFilters.vue";

const filters = reactive({
  repo: "Keiyoushi" as Repo,
  search: "",
  lang: [] as string[],
  nsfw: "Show all" as Nsfw,
  sort: "Ascending" as Sort,
});

const {
  data: extensions,
  isLoading,
  refetch,
} = useExtensionsRepositoryQuery(filters.repo, {
  // @ts-expect-error stop crying dipshit
  select: (response) => {
    const values: Extension[][] = Object.values(groupBy(response, "lang"));
    values.sort(languageComparator);

    return values;
  },
});

function languageComparator(a: Extension[], b: Extension[]) {
  const langA = simpleLangName(a[0].lang);
  const langB = simpleLangName(b[0].lang);
  if (langA === "All" && langB === "English") {
    return -1;
  }
  if (langA === "English" && langB === "All") {
    return 1;
  }
  if (langA === "English") {
    return -1;
  }
  if (langB === "English") {
    return 1;
  }
  if (langA < langB) {
    return -1;
  }
  if (langA > langB) {
    return 1;
  }
  return 0;
}

const filteredExtensions = computed(() => {
  const filtered: Extension[][] = [];

  for (const group of extensions.value ?? []) {
    let filteredGroup = filters.lang.length
      ? filters.lang.includes(group[0].lang)
        ? group
        : []
      : group;

    if (filters.search) {
      const lower = filters.search.toLowerCase();

      filteredGroup = filteredGroup.filter(
        (ext) =>
          ext.name.toLowerCase().includes(lower) ||
          ext.sources.some((source) => source.id.includes(filters.search)),
      );
    }
    filteredGroup = filteredGroup.filter((ext) =>
      filters.nsfw === "Show all" ? true : ext.nsfw === (filters.nsfw === "NSFW" ? 1 : 0),
    );

    if (filters.sort && filters.sort === "Descending") {
      filteredGroup = filteredGroup.reverse();
    }
    if (filteredGroup.length) {
      filtered.push(filteredGroup);
    }
  }

  return filtered;
});

const loadingInstance = ref<ReturnType<(typeof ElLoading)["service"]>>();

onMounted(() => {
  loadingInstance.value = ElLoading.service({
    target: ".extensions",
    fullscreen: false,
    background: "transparent",
  });
});

watch(extensions, async () => {
  if (window.location.hash) {
    await nextTick();
    document
      .getElementById(window.location.hash.substring(1))
      ?.scrollIntoView({ behavior: "smooth" });
  }
});

watch([isLoading, loadingInstance], async ([newIsLoading]) => {
  if (!newIsLoading) {
    loadingInstance.value?.close();
  }
});
</script>

<template>
  <ExtensionFilters v-model:search="filters.search" v-model:lang="filters.lang" v-model:nsfw="filters.nsfw"
    v-model:sort="filters.sort" v-model:repo="filters.repo" :extensions="extensions" />
  <div class="extensions">
    <ExtensionList v-if="!isLoading" :extensions="filteredExtensions" :repo="filters.repo" />
  </div>
</template>

<style scoped>
.extensions {
  min-height: 200px;
}
</style>
