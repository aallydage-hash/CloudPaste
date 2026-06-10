<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useEventListener } from "@vueuse/core";
import EnvSwitcher from "./components/EnvSwitcher.vue";
import LanguageSwitcher from "./components/LanguageSwitcher.vue";
import PWAInstallPrompt from "./components/PWAInstallPrompt.vue";
import GlobalMusicPlayer from "./components/common/GlobalMusicPlayer.vue";
import { useAuthStore } from "./stores/authStore.js";
import { useSiteConfigStore } from "./stores/siteConfigStore.js";
import FooterMarkdownRenderer from "./modules/admin/components/FooterMarkdownRenderer.vue";
import { useGlobalMessage } from "@/composables/core/useGlobalMessage.js";
import { useThemeMode } from "@/composables/core/useThemeMode.js";
import AnnouncementModal from "@/modules/admin/components/AnnouncementModal.vue";
import { IconBell, IconClose, IconComputerDesktop, IconGithub, IconHamburger, IconMoon, IconSun } from "@/components/icons";
import { Notivue, NotivueSwipe, Notification } from "notivue";
import { cloudPasteLightTheme, cloudPasteDarkTheme } from "@/styles/notivueTheme";
import { createLogger } from "@/utils/logger.js";

const route = useRoute();
const log = createLogger("App");

// 使用认证Store和站点配置Store
const authStore = useAuthStore();
const siteConfigStore = useSiteConfigStore();

// 主题模式: 由全局 composable 统一管理
const { themeMode, isDarkMode, toggleThemeMode } = useThemeMode();

// 全局消息
const { clearMessage, showMessage } = useGlobalMessage();

// 计算当前页面 - 基于路由
const activePage = computed(() => {
  return route.meta?.originalPage || "home";
});

// 前台入口开关（站点设置）
// - store 未初始化前，先按“都显示”处理，避免把用户锁死在空白页面
const canShowHomeEntry = computed(() => false);
const canShowUploadEntry = computed(() => !siteConfigStore.isInitialized || siteConfigStore.siteUploadPageEnabled);
const canShowMountEntry = computed(() => !siteConfigStore.isInitialized || siteConfigStore.siteMountExplorerEnabled);

// 公告入口（全站）：只有“启用 + 有内容”才显示
const announcementModalRef = ref(null);
const canShowAnnouncementEntry = computed(() => {
  if (!siteConfigStore.isInitialized) return false;
  if (!siteConfigStore.siteAnnouncementEnabled) return false;
  const content = siteConfigStore.siteAnnouncementContent || "";
  return !!content.trim();
});

const hasUnseenAnnouncement = computed(() => {
  const exposed = announcementModalRef.value;
  const raw = exposed?.hasUnseenAnnouncement;
  if (typeof raw === "boolean") return raw;
  return !!raw?.value;
});

const openAnnouncement = () => {
  announcementModalRef.value?.open?.();
};

// 过渡状态，用于页面切换动画
const transitioning = ref(false);

// 移动端菜单状态
const isMobileMenuOpen = ref(false);

// 环境切换器显示状态
const showEnvSwitcher = ref(false);

// GitHub 链接
const githubUrl = "https://github.com/ling-drag0n/CloudPaste";

// 检查是否为开发环境
const isDev = import.meta.env.DEV;



  // 切换移动端菜单状态
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };

  const handleGlobalMessageEvent = (event) => {
    const detail = event.detail || {};
    const type = detail.type || "info";
    const content = detail.content || detail.message || "";
    const duration = typeof detail.duration === "number" ? detail.duration : undefined;

    if (!content) return;

    showMessage(type, content, duration);
  };

  const handleGlobalMessageClearEvent = () => {
    clearMessage();
  };

  // 组件挂载时初始化
  onMounted(() => {
    // 在开发环境中始终显示环境切换器
    if (isDev) {
      showEnvSwitcher.value = true;
    } else {
      // 在生产环境中，只有在明确的条件下才显示：
      // 1. 存在管理员token
      // 2. URL中有特定的参数 (showEnvSwitcher) 如："https://域名.com?showEnvSwitcher"
      const hasAdminToken = authStore.isAdmin;
      const urlParams = new URLSearchParams(window.location.search);
      const hasEnvParam = urlParams.has("showEnvSwitcher");

      // 确保在生产环境中默认不显示
      showEnvSwitcher.value = hasAdminToken && hasEnvParam;
    }

    log.debug("应用初始化完成");

    useEventListener(window, "global-message", handleGlobalMessageEvent);
    useEventListener(window, "global-message-clear", handleGlobalMessageClearEvent);
  });


</script>

<template>
  <div :class="['app-container min-h-[100dvh] transition-colors duration-200', isDarkMode ? 'bg-custom-bg-900 text-custom-text-dark' : 'bg-custom-bg-50 text-custom-text']">
    <header :class="['sticky top-0 z-50 backdrop-blur border-b transition-colors duration-200', isDarkMode ? 'bg-custom-surface-dark/80 border-white/5' : 'bg-white/80 border-gray-100/80']">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <nav class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/"
                v-if="canShowHomeEntry"
                :class="[
                  activePage === 'home' ? 'border-gray-500 text-current' : 'border-transparent hover:border-gray-300',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200',
                  activePage !== 'home' && isDarkMode ? 'text-gray-300 hover:text-gray-100' : activePage !== 'home' ? 'text-gray-500 hover:text-gray-700' : '',
                ]"
              >
                {{ $t("nav.home") }}
              </router-link>
              <router-link
                to="/upload"
                v-if="canShowUploadEntry"
                :class="[
                  activePage === 'upload' ? 'border-gray-500 text-current' : 'border-transparent hover:border-gray-300',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200',
                  activePage !== 'upload' && isDarkMode ? 'text-gray-300 hover:text-gray-100' : activePage !== 'upload' ? 'text-gray-500 hover:text-gray-700' : '',
                ]"
              >
                {{ $t("nav.upload") }}
              </router-link>
              <router-link
                to="/mount-explorer"
                v-if="canShowMountEntry"
                :class="[
                  activePage === 'mount-explorer' ? 'border-gray-500 text-current' : 'border-transparent hover:border-gray-300',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200',
                  activePage !== 'mount-explorer' && isDarkMode ? 'text-gray-300 hover:text-gray-100' : activePage !== 'mount-explorer' ? 'text-gray-500 hover:text-gray-700' : '',
                ]"
              >
                {{ $t("nav.mountExplorer") }}
              </router-link>
              <router-link
                to="/admin"
                :class="[
                  activePage === 'admin' ? 'border-gray-500 text-current' : 'border-transparent hover:border-gray-300',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200',
                  activePage !== 'admin' && isDarkMode ? 'text-gray-300 hover:text-gray-100' : activePage !== 'admin' ? 'text-gray-500 hover:text-gray-700' : '',
                ]"
              >
                {{ $t("nav.admin") }}
              </router-link>
            </nav>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            <button
              v-if="canShowAnnouncementEntry"
              type="button"
              @click="openAnnouncement"
              :class="[
                'relative p-2 rounded-full focus:outline-none transition-colors',
                isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
              ]"
              :aria-label="$t('announcement.title')"
              :title="$t('announcement.title')"
            >
              <IconBell size="md" aria-hidden="true" />
              <span
                v-if="hasUnseenAnnouncement"
                class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2"
                :class="isDarkMode ? 'ring-gray-800' : 'ring-white'"
                aria-hidden="true"
              ></span>
            </button>
          </div>

          <!-- 移动端菜单按钮 -->
          <div class="flex items-center sm:hidden">
            <button
              v-if="canShowAnnouncementEntry"
              type="button"
              @click="openAnnouncement"
              :class="[
                'relative p-2 rounded-full focus:outline-none transition-colors mr-2',
                isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
              ]"
              :aria-label="$t('announcement.title')"
              :title="$t('announcement.title')"
            >
              <IconBell size="md" aria-hidden="true" />
              <span
                v-if="hasUnseenAnnouncement"
                class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2"
                :class="isDarkMode ? 'ring-gray-800' : 'ring-white'"
                aria-hidden="true"
              ></span>
            </button>
            <button
              type="button"
              @click="toggleMobileMenu"
              :class="[
                'inline-flex items-center justify-center p-2 rounded-full focus:outline-none transition-all duration-200',
                isMobileMenuOpen
                  ? isDarkMode
                    ? 'bg-white/10 text-white'
                    : 'bg-gray-200 text-gray-900'
                  : isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-white/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
              ]"
              :aria-expanded="isMobileMenuOpen"
              :aria-label="$t('nav.menu')"
            >
              <!-- 菜单图标 -->
              <!-- 关闭图标 -->
              <IconHamburger v-if="!isMobileMenuOpen" size="lg" aria-hidden="true" />
              <IconClose v-else size="lg" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <!-- 移动端菜单面板 -->
      <div class="sm:hidden overflow-hidden transition-all duration-300 ease-in-out" :class="[isMobileMenuOpen ? 'max-h-80' : 'max-h-0']">
        <div :class="['py-3 border-t transition-colors', isDarkMode ? 'bg-[#0f1011] border-white/5' : 'bg-white border-gray-200']">
          <router-link
            to="/"
            @click="isMobileMenuOpen = false"
            v-if="canShowHomeEntry"
            :class="[
              'flex items-center px-4 py-3 transition-colors duration-200',
              activePage === 'home'
                ? isDarkMode
                  ? 'bg-white/10 text-white'
                  : 'bg-gray-100 text-gray-900'
                : isDarkMode
                ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ]"
          >
            <span class="ml-2">{{ $t("nav.home") }}</span>
          </router-link>
          <router-link
            to="/upload"
            @click="isMobileMenuOpen = false"
            v-if="canShowUploadEntry"
            :class="[
              'flex items-center px-4 py-3 transition-colors duration-200',
              activePage === 'upload'
                ? isDarkMode
                  ? 'bg-white/10 text-white'
                  : 'bg-gray-100 text-gray-900'
                : isDarkMode
                ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ]"
          >
            <span class="ml-2">{{ $t("nav.upload") }}</span>
          </router-link>
          <router-link
            to="/mount-explorer"
            @click="isMobileMenuOpen = false"
            v-if="canShowMountEntry"
            :class="[
              'flex items-center px-4 py-3 transition-colors duration-200',
              activePage === 'mount-explorer'
                ? isDarkMode
                  ? 'bg-white/10 text-white'
                  : 'bg-gray-100 text-gray-900'
                : isDarkMode
                ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ]"
          >
            <span class="ml-2">{{ $t("nav.mountExplorer") }}</span>
          </router-link>
          <router-link
            to="/admin"
            @click="isMobileMenuOpen = false"
            :class="[
              'flex items-center px-4 py-3 transition-colors duration-200',
              activePage === 'admin'
                ? isDarkMode
                  ? 'bg-white/10 text-white'
                  : 'bg-gray-100 text-gray-900'
                : isDarkMode
                ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ]"
          >
            <span class="ml-2">{{ $t("nav.admin") }}</span>
          </router-link>
        </div>
      </div>
    </header>

    <main class="flex-1 flex flex-col" :class="activePage !== 'admin' ? 'pb-8' : ''">
      <router-view :dark-mode="isDarkMode" class="transition-opacity duration-300 flex-1 flex flex-col" :class="{ 'opacity-0': transitioning }" />
    </main>


    <!-- 添加环境切换器组件 (在开发环境或管理员登录状态下显示) -->
    <!-- <EnvSwitcher v-if="showEnvSwitcher" /> -->

    <!-- PWA 安装提示组件 -->
    <PWAInstallPrompt :dark-mode="isDarkMode" />

    <!-- 公告：全站右上角入口打开 -->
    <AnnouncementModal
      ref="announcementModalRef"
      :content="siteConfigStore.siteAnnouncementContent"
      :enabled="siteConfigStore.siteAnnouncementEnabled"
      :dark-mode="isDarkMode"
      :auto-open="false"
    />

    <!-- 全局音乐播放器 -->
    <GlobalMusicPlayer />

    <!-- 全局消息提示（Notivue） -->
    <Notivue v-slot="item">
      <NotivueSwipe :item="item">
        <Notification
          :item="item"
          :theme="isDarkMode ? cloudPasteDarkTheme : cloudPasteLightTheme"
        />
      </NotivueSwipe>
    </Notivue>
  </div>
</template>

<style>
/* 全局样式 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 移动端菜单过渡动画 */
.sm\:hidden {
  transition: all 0.3s ease-in-out;
}

/* 按钮触摸反馈 */
@media (max-width: 640px) {
  button,
  a {
    -webkit-tap-highlight-color: transparent;
  }
}

/* 禁用移动端点击时的蓝色高亮 */
* {
  -webkit-tap-highlight-color: transparent;
}
</style>
