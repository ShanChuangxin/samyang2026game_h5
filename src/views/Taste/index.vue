<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'vant'
import { getUserInfoAPI, stampCheckAPI, stampStatusAPI, withdrawAPI, clearDrawInfoAPI } from '@/apis/user'
import type { UserInfo } from '@/types/user'




const userInfo = ref<UserInfo>()

const isShowAgreement = ref(true);

// 通过url参数获取用户信息
const route = useRoute();
const cityCode = route.query.utmChannel_var as string;
const loadUserInfo = async () => {
    console.log("获取的参数信息为：", route.query);
}
onMounted(() => loadUserInfo());

const router = useRouter();
function navigateToGamePage() {
  router.replace('/game');
}
function closeAgreementPop() {
  isShowAgreement.value = false;
}
function debugToResultPage() {
  router.replace('/result');
}




</script>

<template>
  <div class="page-body">
    <img src="https://www.mbcstyle.cn/projects/static/samyang2026game/taste/bg.jpg" alt="" class="bg">
    <div class="logo-brand" @click="debugToResultPage"></div>
    <div class="logo-noodle"></div>
    <div class="slogan"></div>
    <div class="noodles"></div>

    <div class="btn-taste" @click="navigateToGamePage"></div>

    <div v-show="isShowAgreement" class="agreement-container">
      <div class="agreement">
        <div class="agreement-btn" @click="closeAgreementPop"></div>
      </div>
    </div>
    
  </div>

</template>

<style lang="scss" scoped>
.page-body {
  // 通用设计
  position: absolute;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .bg {
    width: 100%;
    height: auto;
  }
  .logo-brand {
    position: absolute;
    top: .3rem;
    left: .3rem;
    width: 1.2733rem;
    height: .3866rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/index/logo-brand.png") top center no-repeat;
    background-size: 100% 100%;
  }
  .logo-noodle {
    position: absolute;
    top: .3rem;
    right: .3rem;
    width: 1.2rem;
    height: .5666rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/index/logo-noodle.png") top center no-repeat;
    background-size: 100% 100%;
  }
  .slogan {
    position: absolute;
    top: 1.2rem;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 3.5533rem;
    height: 2.56rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/taste/slogan.png") top center no-repeat;
    background-size: 100% 100%;
  }
  .noodles {
    position: absolute;
    top: 4rem;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 4.8866rem;
    height: 3.9333rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/taste/noodles.png") top center no-repeat;
    background-size: 100% 100%;
  }

  .btn-taste {
    position: absolute;
    bottom: .8rem;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 2.58rem;
    height: .66rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/taste/btn-taste.png") top center no-repeat;
    background-size: 100% 100%;
  }
  .agreement-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, .4);
      display: flex;
      justify-content: center;
      align-items: center;
      .agreement {
          position: relative;
          width: 3.8333rem;
          height: 5.5333rem;
          background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/taste/agreement.png") top center no-repeat;
          background-size: 100% 100%;
          .agreement-btn {
              position: absolute;
              bottom: 0;
              margin-left: 50%;
              transform: translateX(-50%);
              width: 2.15rem;
              height: .51rem;
              // background-color: red;
          }

      }
  } 
 
}
</style>