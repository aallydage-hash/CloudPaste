<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-2 py-2">
      <!-- 左侧操作按钮组 -->
      <div class="flex items-center space-x-2">
        <!-- 上传文件按钮 -->
        <button
          v-if="!isVirtual"
          @click="openUploadFileDialog"
          class="inline-flex items-center justify-center p-2 sm:px-4 sm:py-1.5 rounded-md sm:rounded-full transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md active:scale-95"
          :class="darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'"
          :title="t('mount.operations.upload')"
        >
          <IconUpload size="sm" class="sm:mr-1.5" />
          <span class="hidden sm:inline">{{ t("mount.operations.upload") }}</span>
        </button>

        <!-- 新建文件夹按钮 -->
        <button
          v-if="!isVirtual"
          @click="createFolder"
          class="inline-flex items-center justify-center p-2 sm:px-4 sm:py-1.5 rounded-md sm:rounded-full transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md active:scale-95"
          :class="darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'"
          :title="t('mount.operations.createFolder')"
        >
          <IconFolderPlus size="sm" class="sm:mr-1.5" />
          <span class="hidden sm:inline">{{ t("mount.operations.createFolder") }}</span>
        </button>
      </div>

      <!-- 右侧视图操作按钮组 -->
      <div class="flex items-center space-x-2">
        <!-- 存储切换下拉菜单 -->
        <div v-if="mounts && mounts.length >= 1" id="storage-switcher-dropdown" class="relative inline-block text-left mr-2">
          <button
            @click="isDropdownOpen = !isDropdownOpen"
            class="inline-flex items-center justify-between px-3 py-1.5 rounded-md sm:rounded-full transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md active:scale-95 border"
            :class="darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'"
            title="切换存储"
          >
            <IconServerStack size="sm" class="w-4 h-4 mr-1 sm:mr-1.5 text-blue-500" />
            <span class="max-w-[80px] sm:max-w-[120px] truncate mr-1">{{ currentMountName }}</span>
            <IconChevronDown size="sm" class="w-3 h-3 text-gray-400 transition-transform duration-200" :class="isDropdownOpen ? 'rotate-180' : ''" />
          </button>

          <div
            v-if="isDropdownOpen"
            class="absolute right-0 mt-1.5 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden animate-fade-in"
            :class="darkMode ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-200 text-gray-700'"
          >
            <div class="py-1">
              <div class="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                切换存储
              </div>
            </div>
            <div class="py-1 max-h-60 overflow-y-auto">
              <!-- 根目录 -->
              <button
                @click="selectMount({ mount_path: '/' })"
                class="w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors"
                :class="[
                  !currentMountId
                    ? (darkMode ? 'bg-blue-900/30 text-blue-300 font-medium' : 'bg-blue-50 text-blue-700 font-medium')
                    : (darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700')
                ]"
              >
                <span class="truncate">{{ t("breadcrumb.root", "根目录") }}</span>
                <span
                  v-if="!currentMountId"
                  class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 ml-1.5"
                ></span>
              </button>
              
              <!-- 各挂载存储 -->
              <button
                v-for="mount in mounts"
                :key="mount.id"
                @click="selectMount(mount)"
                class="w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors border-t border-gray-100/50 dark:border-gray-700/50"
                :class="[
                  mount.id === currentMountId
                    ? (darkMode ? 'bg-blue-900/30 text-blue-300 font-medium' : 'bg-blue-50 text-blue-700 font-medium')
                    : (darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700')
                ]"
              >
                <span class="truncate">{{ mount.name }}</span>
                <span
                  v-if="mount.id === currentMountId"
                  class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 ml-1.5"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- 文件篮按钮 -->
        <div class="mr-2">
          <FileBasket :dark-mode="darkMode" @task-created="$emit('task-created', $event)" @show-message="$emit('show-message', $event)" />
        </div>

        <!-- 任务管理按钮 -->
        <button
          @click="$emit('openTasksModal')"
          class="inline-flex items-center justify-center p-2 sm:px-4 sm:py-1.5 rounded-md sm:rounded-full transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md active:scale-95 mr-2"
          :class="darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'"
          :title="t('mount.operations.tasks')"
        >
          <IconTaskList size="sm" class="sm:mr-1.5" />
          <span class="hidden sm:inline">{{ t("mount.operations.tasks") }}</span>
        </button>

        <!-- 视图切换按钮组 -->
        <div class="flex rounded-md overflow-hidden border" :class="darkMode ? 'border-gray-700' : 'border-gray-300'">
          <!-- 列表视图按钮 -->
          <button
            @click="changeViewMode('list')"
            class="inline-flex items-center px-2 py-1.5 transition-colors text-sm"
            :class="[viewMode === 'list' ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800') : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500']"
            :title="t('mount.viewModes.list')"
          >
            <IconList size="sm" />
          </button>

          <!-- 网格视图按钮 -->
          <button
            @click="changeViewMode('grid')"
            class="inline-flex items-center px-2 py-1.5 transition-colors text-sm"
            :class="[viewMode === 'grid' ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800') : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500']"
            :title="t('mount.viewModes.grid')"
          >
            <IconGrid size="sm" />
          </button>

          <!-- 图廊视图按钮 -->
          <button
            @click="changeViewMode('gallery')"
            class="inline-flex items-center px-2 py-1.5 transition-colors text-sm"
            :class="[
              viewMode === 'gallery' ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800') : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500',
            ]"
            :title="t('mount.viewModes.gallery')"
          >
            <IconGallery size="sm" />
          </button>
        </div>

        <!-- 刷新按钮 -->
        <button
          @click="$emit('refresh')"
          class="inline-flex items-center px-3 py-1.5 rounded-md transition-colors text-sm font-medium ml-2"
          :class="darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
          :title="t('mount.operations.refresh')"
        >
          <IconRefresh size="sm" />
        </button>  
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import FileBasket from "./FileBasket.vue";
import {
  IconUpload,
  IconFolderPlus,
  IconTaskList,
  IconList,
  IconGrid,
  IconGallery,
  IconRefresh,
  IconServerStack,
  IconChevronDown
} from '@/components/icons';

const { t } = useI18n();

const props = defineProps({
  currentPath: {
    type: String,
    required: true,
    default: "/",
  },
  isVirtual: {
    type: Boolean,
    default: false,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  viewMode: {
    type: String,
    default: "list", // 'list' | 'grid' | 'gallery'
  },
  mounts: {
    type: Array,
    default: () => [],
  },
  currentMountId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["upload", "createFolder", "refresh", "changeViewMode", "openUploadModal", "openTasksModal", "task-created", "show-message", "change-mount"]);

const isDropdownOpen = ref(false);

const currentMountName = computed(() => {
  const activeMount = props.mounts.find((m) => m.id === props.currentMountId);
  return activeMount ? activeMount.name : t("breadcrumb.root", "根目录");
});

const selectMount = (mount) => {
  isDropdownOpen.value = false;
  emit("change-mount", mount.mount_path);
};

// 点击外部关闭下拉框
const handleOutsideClick = (event) => {
  const el = event.target;
  const dropdownEl = document.getElementById("storage-switcher-dropdown");
  if (dropdownEl && !dropdownEl.contains(el)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});

// 视图模式切换
const changeViewMode = (mode) => {
  emit("changeViewMode", mode);
};

// 打开文件上传对话框
const openUploadFileDialog = () => {
  emit("openUploadModal");
};

// 新建文件夹
const createFolder = () => {
  emit("createFolder");
};
</script>

