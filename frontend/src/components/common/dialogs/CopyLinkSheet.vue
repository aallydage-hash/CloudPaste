<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="cp-backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-[69] bg-black/60" @click="handleClose" />
    </Transition>

    <!-- Bottom Sheet -->
    <Transition name="cp-sheet">
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-[70] flex flex-col rounded-t-2xl shadow-2xl"
        style="max-height: 75vh"
        :class="darkMode ? 'bg-gray-900 text-white border-t border-gray-700/80' : 'bg-white text-gray-900 border-t border-gray-200'"
      >
        <!-- Drag handle -->
        <div class="flex-shrink-0 flex justify-center pt-3 pb-1 cursor-pointer select-none" @click="handleClose">
          <div class="w-10 h-1 rounded-full" :class="darkMode ? 'bg-gray-600' : 'bg-gray-300'" />
        </div>

        <!-- Header -->
        <div class="flex-shrink-0 flex items-center justify-between px-4 py-2">
          <div class="flex items-center gap-2">
            <IconLink size="sm" :class="darkMode ? 'text-blue-400' : 'text-blue-500'" />
            <span class="font-semibold text-base">{{ t('mount.copyLinkDialog.title', '获取文件链接') }}</span>
            <span
              v-if="items.length > 1"
              class="text-xs px-1.5 py-0.5 rounded-full font-medium"
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
          class="flex-shrink-0 flex border-b px-2 gap-0.5"
          :class="darkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <button
            v-for="fmt in formatOptions"
            :key="fmt.id"
            @click="activeFormat = fmt.id"
            class="px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px rounded-t-md"
            :class="activeFormat === fmt.id
              ? (darkMode ? 'border-blue-400 text-blue-400 bg-blue-900/20' : 'border-blue-500 text-blue-600 bg-blue-50/50')
              : (darkMode ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50')"
          >
            {{ fmt.name }}
          </button>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          <!-- Global loading (all items loading at once) -->
          <div v-if="allInitiallyLoading" class="py-10 flex flex-col items-center gap-2.5">
            <IconRefresh
              size="lg"
              class="animate-spin"
              :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
            />
            <span class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ t('common.loading', '加载中...') }}</span>
          </div>

          <div v-else class="space-y-3">
            <div v-for="item in itemsWithStatus" :key="item.path">
              <!-- Filename label for multi-select -->
              <div
                v-if="items.length > 1"
                class="flex items-center gap-1.5 mb-1.5 text-xs font-medium truncate"
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
                  :class="darkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-400'"
                >
                  <IconRefresh size="sm" class="animate-spin flex-shrink-0" />
                  <span>获取中...</span>
                </div>

                <!-- Error state -->
                <div
                  v-else-if="item.error"
                  class="flex-1 px-3 py-2 rounded-lg border text-sm text-red-500"
                  :class="darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'"
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
                  :class="darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'"
                />

                <!-- Copy button -->
                <button
                  v-if="!item.loading && !item.error"
                  @click="copyItemLink(item)"
                  class="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border flex items-center gap-1.5"
                  :class="copiedPath === item.path
                    ? (darkMode ? 'bg-green-900/50 border-green-700 text-green-400' : 'bg-green-50 border-green-300 text-green-600')
                    : (darkMode ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')"
                >
                  <IconCheck v-if="copiedPath === item.path" size="sm" />
                  <IconCopy v-else size="sm" />
                  <span class="hidden sm:inline">{{ copiedPath === item.path ? t('mount.copyLinkDialog.copied', '已复制') : t('common.dialogs.confirm', '复制') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: Copy All (multi-select) -->
        <div
          v-if="items.length > 1 && !allInitiallyLoading"
          class="flex-shrink-0 px-4 py-3 border-t"
          :class="darkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <button
            @click="copyAll"
            class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            :class="allCopied
              ? 'bg-green-500 text-white'
              : (darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')"
          >
            <IconCheck v-if="allCopied" size="sm" />
            <IconLink v-else size="sm" />
            {{ allCopied ? `✓ 已复制 ${readyItems.length} 个链接` : `复制全部 ${readyItems.length} 个链接` }}
          </button>
        </div>

        <!-- Single-file footer with close -->
        <div
          v-else-if="items.length === 1 && !allInitiallyLoading"
          class="flex-shrink-0 px-4 py-3 border-t"
          :class="darkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <button
            @click="handleClose"
            class="w-full py-2 rounded-xl text-sm font-medium transition-colors border"
            :class="darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            {{ t('common.close', '关闭') }}
          </button>
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

// Load URLs when sheet opens or items change
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
.cp-backdrop-enter-active,
.cp-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.cp-backdrop-enter-from,
.cp-backdrop-leave-to {
  opacity: 0;
}

.cp-sheet-enter-active,
.cp-sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.cp-sheet-enter-from,
.cp-sheet-leave-to {
  transform: translateY(100%);
}
</style>
