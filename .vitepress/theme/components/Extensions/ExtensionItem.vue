<!--
  Copyright (c) The Tachiyomi Open Source Project
  SPDX-License-Identifier: MPL-2.0
-->

<script setup lang="ts">
import VLazyImage from "v-lazy-image";
import { sources } from "../../../repos";
import type { Extension } from "../../queries/useExtensionsRepositoryQuery";
import type { Repo } from "./ExtensionFilters.vue";

const props = defineProps<{ repo: Repo; item: Extension }>();

const pkgId = props.item.pkg.replace("eu.kanade.tachiyomi.extension.", "");
const pkgName = props.item.name.split(": ")[1];
const iconUrl = `${sources[props.repo]}/icon/${props.item.pkg}.png`;
</script>

<template>
  <div :id="pkgId" class="extension" tabindex="-1">
    <a :href="`#${pkgId}`" class="anchor" aria-hidden="true" @click.stop>#</a>
    <v-lazy-image class="extension-icon" width="42" height="42" :src="iconUrl" />
    <div class="extension-text">
      <div class="upper">
        {{ pkgName }}
      </div>
      <div class="lower">
        {{ pkgId }}
      </div>
    </div>
    <Badge v-if="props.item.nsfw" type="danger" :text="item.version" title="This extension contains NSFW entries." />
    <Badge v-else type="info" :text="item.version" title="This extension is free from NSFW entries." />
  </div>
</template>

<style lang="stylus">
.extension {
  position: relative
  align-items: center
  display: flex
  width: calc(100% + 1em)
  padding: 0.5em
  margin: 0.8em -0.5em
  border-radius: 8px
  gap: 0.675rem
  scroll-margin-top: calc(var(--vp-nav-height) + 24px)

  &:hover {
    background-color: var(--vp-c-bg-soft)
  }

  &:target,
  &:focus {
    background-color: var(--vp-c-brand-soft)
    border-radius: 8px
    transition: 500ms background-color
  }

  &:focus {
    outline: none
  }

  .anchor {
    position: absolute
    left: 0
    margin-left: -1em
    font-size: 1.4em
    opacity: 0
  }

  &:hover .anchor,
  .anchor:focus-visible {
    opacity: 1
  }

  .extension-icon {
    flex-shrink: 0
    margin-left: -4px
  }

  .extension-text {
    flex-grow: 1
    min-width: 0

    .upper {
      color: var(--vp-c-text-1)
      font-weight: 600
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap

      .badge {
        font-weight: 400
      }
    }

    .lower {
      color: var(--vp-c-text-2)
      font-family: var(--vp-font-family-mono)
      font-size: 0.75rem
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap
      line-height: 1rem
    }
  }

  @media (max-width 767px) {
    padding: 0.4em 0
  }
}

@media (max-width 767px) {
  .anchor {
    display: none
  }

  .extension {
    border: 1px solid var(--vp-c-divider)
    border-radius: 8px
    padding: 0.5em
    margin: 0.8em 0
    width: 100%

    .extension-icon {
      margin-left: 0
    }

    .extension-download {
      margin-right: 0
    }
  }
}
</style>
