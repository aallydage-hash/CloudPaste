<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[70] overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4" @click="handleBackdropClick">
      <div class="relative w-full max-w-lg p-6 rounded-lg shadow-xl" :class="darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'" @click.stop>
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <IconLink size="md" />
            <span>{{ t("mount.copyLinkDialog.title", "获取文件链接") }}</span>
          </h3>
          <button
            @click="handleClose"
            class="p-1 rounded-md transition-colors"
            :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'"
          >
            <IconClose size="md" aria-hidden="true" />
          </button>
        </div>

        <!-- File info -->
        <div class="mb-4 text-sm font-medium truncate" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
          {{ t("mount.copyLinkDialog.fileName", "文件名") }}: <span class="font-normal">{{ filename }}</span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="py-12 flex flex-col items-center justify-center gap-3">
          <IconRefresh size="lg" class="animate-spin text-gray-500 dark:text-gray-400" />
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ t("common.loading", "加载中...") }}</span>
        </div>

        <!-- Tabs / Format list -->
        <div v-else class="space-y-4">
          <div v-for="format in linkFormats" :key="format.id" class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
              <span class="font-medium">{{ format.name }}</span>
              <span v-if="copiedId === format.id" class="text-green-500 font-semibold">{{ t("mount.copyLinkDialog.copied", "已复制!") }}</span>
            </div>
            <div class="flex gap-2">
              <input
                type="text"
                readonly
                :value="format.value"
                @click="selectText"
                class="flex-1 px-3 py-2 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-500"
                :class="darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-gray-600' : 'bg-gray-50 border-gray-300 text-gray-800'"
              />
              <button
                @click="copyFormat(format)"
                class="px-3.5 py-2 rounded-md transition-colors font-medium text-sm flex items-center justify-center gap-1 border flex-shrink-0"
                :class="darkMode ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
              >
                <IconCopy size="sm" />
                <span>{{ t("common.dialogs.confirm", "复制") }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end mt-6">
          <button
            @click="handleClose"
            class="px-4 py-2 rounded-md border transition-colors text-sm font-medium"
            :class="darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            {{ t("common.close", "关闭") }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onKeyStroke } from "@vueuse/core";
import { IconClose, IconCopy, IconLink, IconRefresh } from "@/components/icons";
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
  loading: {
    type: Boolean,
    default: false,
  },
  filename: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    default: "",
  },
  allowBackdropClose: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close"]);

const copiedId = ref("");

const isImg = computed(() => {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(props.filename);
});

const linkFormats = computed(() => {
  if (!props.url) return [];
  
  const rawUrl = props.url;
  const name = props.filename;
  
  return [
    {
      id: "url",
      name: t("mount.copyLinkDialog.formats.url", "直链"),
      value: rawUrl,
    },
    {
      id: "markdown",
      name: t("mount.copyLinkDialog.formats.markdown", "Markdown"),
      value: isImg.value ? `![${name}](${rawUrl})` : `[${name}](${rawUrl})`,
    },
    {
      id: "html",
      name: t("mount.copyLinkDialog.formats.html", "HTML"),
      value: isImg.value ? `<img src="${rawUrl}" alt="${name}" />` : `<a href="${rawUrl}" target="_blank">${name}</a>`,
    },
    {
      id: "bbcode",
      name: t("mount.copyLinkDialog.formats.bbcode", "BBCode"),
      value: isImg.value ? `[img]${rawUrl}[/img]` : `[url=${rawUrl}]${name}[/url]`,
    },
  ];
});

const handleClose = () => {
  emit("close");
};

const handleBackdropClick = () => {
  if (props.allowBackdropClose) {
    handleClose();
  }
};

const selectText = (event) => {
  if (event?.target) {
    event.target.select();
  }
};

const copyFormat = async (format) => {
  try {
    const success = await copyToClipboard(format.value);
    if (success) {
      copiedId.value = format.id;
      setTimeout(() => {
        if (copiedId.value === format.id) {
          copiedId.value = "";
        }
      }, 2000);
    }
  } catch (err) {
    console.error("Failed to copy link:", err);
  }
};

// Listen to Escape key to close the dialog
onKeyStroke("Escape", () => {
  if (props.isOpen) {
    handleClose();
  }
});

// Reset copied state when dialog is closed/opened
watch(() => props.isOpen, (val) => {
  if (!val) {
    copiedId.value = "";
  }
});
</script>
