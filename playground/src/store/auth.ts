import type { Recordable } from '@vben/types';

import type { get_auth_profile_response } from '#/api/auto-api/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { get_auth_profile, post_auth_login } from '#/api/auto-api/auth';
import { logoutApi } from '#/api/core/auth';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  function toBasicUserInfo(authUser: get_auth_profile_response['data']): {
    avatar: string;
    realName: string;
    roles?: string[];
    userId: string;
    username: string;
  } {
    return {
      avatar: authUser.avatar ?? '',
      realName: authUser.name ?? '',
      roles: (authUser.userRoles ?? [])
        .map((ur) => ur.role?.name)
        .filter(Boolean) as string[],
      userId: authUser.id,
      username: authUser.username,
    };
  }

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   * @param onSuccess 成功之后的回调函数
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo;
    try {
      loginLoading.value = true;
      const loginResp = await post_auth_login({
        body: {
          username: params?.username,
          password: params?.password,
        },
      });
      const accessToken = loginResp?.access_token;
      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setAccessToken(accessToken);
        // 获取用户信息并存储到 accessStore 中
        // const [fetchUserInfoResult,accessCodes ] = await Promise.all([
        //   fetchUserInfo(),
        //   getAccessCodesApi(),
        // ]);
        // accessStore.setAccessCodes(accessCodes);

        const fetchUserInfoResult = await fetchUserInfo();
        userInfo = fetchUserInfoResult;

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(preferences.app.defaultHomePath);
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }

    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: get_auth_profile_response['data'] | null = null;
    const resp = await get_auth_profile();
    userInfo = resp ?? null;
    if (userInfo) {
      userStore.setUserInfo(toBasicUserInfo(userInfo));
    }
    return userStore.userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
