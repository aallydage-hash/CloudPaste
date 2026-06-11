<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" @click="handleBackdropClick">
        <div
          class="relative w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style="max-height: 80vh;"
          :class="darkMode ? 'bg-gray-800 text-white border border-gray-700/80' : 'bg-white text-gray-900 border border-gray-200'"
          @click.stop
        >
          <!-- Header -->
          <div class="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-3">
            <div class="flex items-center gap-2">
              <IconLink size="sm" :class="darkMode ? 'text-blue-400' : 'text-blue-500'" />
              <span class="font-semibold text-lg">{{ t('mount.copyLinkDialog.title', '获取文件链接') }}</span>
              <span
                v-if="items.length > 1"
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="darkMode ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-50 text-blue-600'"
              >{{ items.length }}</span>
            </div>
            <button
              @click="handleClose"
              class="p-1.5 rounded-lg transition-colors"
              :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'"
            >
              <IconClose size="sm" />
            </button>
          </div>

          <!-- Format Tabs -->
          <div
            class="flex-shrink-0 flex border-b px-4 gap-0.5"
            :class="darkMode ? 'border-gray-700' : 'border-gray-200'"
          >
            <button
              v-for="fmt in formatOptions"
              :key="fmt.id"
              @click="activeFormat = fmt.id"
              class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px rounded-t-md"
              :class="activeFormat === fmt.id
                ? (darkMode ? 'border-blue-400 text-blue-400 bg-blue-900/20' : 'border-blue-500 text-blue-600 bg-blue-50/50')
                : (darkMode ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50')"
            >
              {{ fmt.name }}
            </button>
          </div>

          <!-- Items List -->
          <div class="flex-1 overflow-y-auto px-6 py-4 min-h-0 space-y-4">
            <!-- Global loading (all items loading at once) -->
            <div v-if="allInitiallyLoading" class="py-12 flex flex-col items-center justify-center gap-3">
              <IconRefresh
                size="lg"
                class="animate-spin text-gray-400 dark:text-gray-500"
              />
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('common.loading', '加载中...') }}</span>
            </div>

            <div v-else class="space-y-4">
              <div v-for="item in itemsWithStatus" :key="item.path" class="space-y-1.5">
                <!-- Filename label for multi-select -->
                <div
                  v-if="items.length > 1"
                  class="flex items-center gap-1.5 text-xs font-medium truncate"
                  :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
                >
                  <span class="truncate">{{ item.name }}</span>
                  <span
                    v-if="!item.loading && !item.error"
                    class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500"
                  />
                  <span
                    v-else-if="item.loading"
                    class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"
                  />
                  <span
                    v-else-if="item.error"
                    class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500"
                  />
                </div>

                <!-- Link row -->
                <div class="flex gap-2 items-center">
                  <!-- Loading state -->
                  <div
                    v-if="item.loading"
                    class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                    :class="darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-400'"
                  >
                    <IconRefresh size="sm" class="animate-spin flex-shrink-0" />
                    <span>获取中...</span>
                  </div>

                  <!-- Error state -->
                  <div
                    v-else-if="item.error"
                    class="flex-1 px-3 py-2 rounded-lg border text-sm text-red-500"
                    :class="darkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'"
                  >
                    获取链接失败
                  </div>

                  <!-- Link input -->
                  <input
                    v-else
                    type="text"
                    readonly
                    :value="getFormattedLink(item, activeFormat)"
                    @click="selectText"
                    class="flex-1 px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-text"
                    :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'"
                  />

                  <!-- Copy button -->
                  <button
                    v-if="!item.loading && !item.error"
                    @click="copyItemLink(item)"
                    class="flex-shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 border flex items-center gap-1.5"
                    :class="copiedPath === item.path
                      ? (darkMode ? 'bg-green-900/50 border-green-700 text-green-400' : 'bg-green-50 border-green-300 text-green-600')
                      : (darkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-605' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')"
                  >
                    <IconCheck v-if="copiedPath === item.path" size="sm" />
                    <IconCopy v-else size="sm" />
                    <span>{{ copiedPath === item.path ? t('mount.copyLinkDialog.copied', '已复制') : t('common.dialogs.confirm', '复制') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex-shrink-0 px-6 py-4 border-t flex gap-3"
            :class="darkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-200 bg-gray-50/40'"
          >
            <!-- Copy All (multi-select) -->
            <button
              v-if="items.length > 1 && !allInitiallyLoading"
              @click="copyAll"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              :class="allCopied
                ? 'bg-green-500 text-white'
                : (darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')"
            >
              <IconCheck v-if="allCopied" size="sm" />
              <IconLink v-else size="sm" />
              {{ allCopied ? `✓ 已复制 ${readyItems.length} 个链接` : `复制全部 ${readyItems.length} 个链接` }}
            </button>

            <!-- Close button -->
            <button
              @click="handleClose"
              class="rounded-xl text-sm font-medium transition-colors border px-5 py-2.5"
              :class="[
                items.length > 1 ? 'w-auto' : 'w-full',
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              ]"
            >
              {{ t('common.close', '关闭') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onKeyStroke } from "@vueuse/core";
import { IconClose, IconCopy, IconLink, IconRefresh, IconCheck } from "@/components/icons";
import { copyToClipboard } from "@/utils/clipboard.js";

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  // Array of { name, path } objects
  items: {
    type: Array,
    default: () => [],
  },
  // (path: string) => Promise<string> - fetches a direct URL for a file path
  loadUrl: {
    type: Function,
    required: true,
  },
  allowBackdropClose: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close"]);

const activeFormat = ref("url");
const copiedPath = ref("");
const allCopied = ref(false);
const itemsWithStatus = ref([]);

const formatOptions = computed(() => [
  { id: "url", name: t("mount.copyLinkDialog.formats.url", "直链") },
  { id: "markdown", name: "Markdown" },
  { id: "html", name: "HTML" },
  { id: "bbcode", name: "BBCode" },
]);

// True only while ALL items are still in initial loading state
const allInitiallyLoading = computed(() =>
  itemsWithStatus.value.length > 0 && itemsWithStatus.value.every((i) => i.loading)
);

const readyItems = computed(() =>
  itemsWithStatus.value.filter((i) => !i.loading && !i.error)
);

function isImg(name) {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|heic|tiff|tif)$/i.test(name);
}

function getFormattedLink(item, format) {
  const url = item.url || "";
  const name = item.name;
  switch (format) {
    case "markdown":
      return isImg(name) ? `![${name}](${url})` : `[${name}](${url})`;
    case "html":
      return isImg(name)
        ? `<img src="${url}" alt="${name}" />`
        : `<a href="${url}" target="_blank">${name}</a>`;
    case "bbcode":
      return isImg(name) ? `[img]${url}[/img]` : `[url=${url}]${name}[/url]`;
    default:
      return url;
  }
}

async function loadAllUrls() {
  // Initialize all items in loading state
  itemsWithStatus.value = props.items.map((item) => ({
    ...item,
    url: "",
    loading: true,
    error: false,
  }));

  // Fetch all URLs concurrently
  await Promise.allSettled(
    props.items.map(async (item, index) => {
      try {
        const url = await props.loadUrl(item.path);
        // Reactively update the specific item
        itemsWithStatus.value = itemsWithStatus.value.map((s, i) =>
          i === index ? { ...s, url, loading: false } : s
        );
      } catch {
        itemsWithStatus.value = itemsWithStatus.value.map((s, i) =>
          i === index ? { ...s, loading: false, error: true } : s
        );
      }
    })
  );
}

async function copyItemLink(item) {
  const value = getFormattedLink(item, activeFormat.value);
  await copyToClipboard(value);
  copiedPath.value = item.path;
  setTimeout(() => {
    if (copiedPath.value === item.path) copiedPath.value = "";
  }, 2000);
}

async function copyAll() {
  const links = readyItems.value
    .map((item) => getFormattedLink(item, activeFormat.value))
    .join("\n");
  await copyToClipboard(links);
  allCopied.value = true;
  setTimeout(() => {
    allCopied.value = false;
  }, 2500);
}

function selectText(event) {
  if (event?.target) event.target.select();
}

function handleClose() {
  emit("close");
}

function handleBackdropClick() {
  if (props.allowBackdropClose) {
    handleClose();
  }
}

// Load URLs when dialog opens or items change
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      copiedPath.value = "";
      allCopied.value = false;
      activeFormat.value = "url";
      loadAllUrls();
    }
  }
);

watch(
  () => props.items,
  () => {
    if (props.isOpen) loadAllUrls();
  },
  { deep: true }
);

onKeyStroke("Escape", () => {
  if (props.isOpen) handleClose();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-active .relative,
.fade-leave-active .relative {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-from .relative {
  transform: scale(0.95);
}
.fade-leave-to .relative {
  transform: scale(0.95);
}
</style>
