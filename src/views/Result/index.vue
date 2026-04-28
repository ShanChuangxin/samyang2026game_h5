<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'vant'
import { getUserInfoAPI, stampCheckAPI, stampStatusAPI, withdrawAPI, clearDrawInfoAPI } from '@/apis/user'
import type { UserInfo } from '@/types/user'




const userInfo = ref<UserInfo>()

// 通过url参数获取用户信息
const route = useRoute();
const cityCode = route.query.utmChannel_var as string;
const loadUserInfo = async () => {
    console.log("获取的参数信息为：", route.query);
  
   
}
onMounted(() => loadUserInfo());

const router = useRouter();
function navigateToGamePage() {
  Toast("敬请期待");
  return;
  router.replace('/game');
}
function debugToGamePage() {
  router.replace('/game');
}
function debugToResultPage() {
  router.replace('/result');
}




</script>

<template>
  <div class="page-body">
    <img src="https://www.mbcstyle.cn/projects/static/samyang2026game/taste/bg.jpg" alt="" class="bg">
    <div class="logo-brand"></div>
    <div class="logo-noodle" @click="debugToGamePage"></div>
    <div class="qrcode-div"></div>
    <div class="qrcode-container">
      <img src="https://www.mbcstyle.cn/projects/static/samyang2026game/result/qrcode.jpg" alt="">
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
  .qrcode-div {
    position: absolute;
    top: 20%;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 2.0466rem;
    height: 2.08rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/qrcode.jpg") top center no-repeat;
    background-size: 100% 100%;
  }
  .qrcode-container {
    position: absolute;
    bottom: 20%;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 2.0466rem;
    height: 2.08rem;
    img {
      width: 100%;
      height: 100%;
    }
  }
 
 
}
</style>