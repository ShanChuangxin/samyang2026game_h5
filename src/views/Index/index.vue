<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'vant'

// 通过url参数获取用户信息
const route = useRoute();
function getRandom(length = 10, type = 0) {
    const digits = '0123456789';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let seed = '';
    if (type === 0) {
        // 纯数字
        seed = digits;
    } else if (type === 1) {
        // 纯字母
        seed = letters;
    } else if (type === 2) {
        // 数字 + 字母
        seed = digits + letters;
    } else {
        seed = digits;
    }
    let result = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * seed.length);
        result += seed[index];
    }
    return result;
}
let user_id = ''; // 用户id
let create_time = 0;  // 创建时间
const loadUserInfo = async () => {
  // console.log("获取的参数信息为：", route.query);
  user_id = Date.now().toString(36) + getRandom(4, 2);
  create_time = Math.floor(Date.now() / 1000);
  console.log("user_id: ", user_id);
   
}
onMounted(() => loadUserInfo());

const router = useRouter();
function navigateToTastePage() {
  router.replace({
    path: '/taste',
    query: {
      user_id,
      create_time
    }
  });
}

</script>

<template>
  <div class="page-body">
    <img src="https://www.mbcstyle.cn/projects/static/samyang2026game/index/bg.jpg" alt="" class="bg" @click="navigateToTastePage">
    <div class="logo-brand"></div>
    <div class="logo-noodle"></div>
    <div class="introduce"></div>
    <div class="name"></div>
    <div class="tap-tips"></div>

    <div class="gif-container">
      <img src="https://www.mbcstyle.cn/projects/static/samyang2026game/index/giphy.gif" alt="" class="bg" @click="navigateToTastePage">
    </div>

    <div class="tips"></div>
    
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
  .introduce {
    position: absolute;
    top: 1rem;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 3.3833rem;
    height: 1.86rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/index/introduce.png") top center no-repeat;
    background-size: 100% 100%;
  }
  .name {
    position: absolute;
    top: 6.6rem;
    left: .5rem;
    width: .5266rem;
    height: .14rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/index/peppo.png") top center no-repeat;
    background-size: 100% 100%;
  }
  .tap-tips {
    position: absolute;
    top: 6.6rem;
    right: .5rem;
    width: 1.0266rem;
    height: .4066rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/index/tap-tips.png") top center no-repeat;
    background-size: 100% 100%;

  }

  .gif-container {
    position: absolute;
    top: 4.1rem;
    margin-left: 50%;
    transform: translateX(-50%);
    img {
      // 原尺寸3.2rem
      width: 4rem;
      height: 4rem;
    }
  }

  .tips {
    position: absolute;
    bottom: .6rem;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 3.566rem;
    height: 1.1066rem;
    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/index/tips.png") top center no-repeat;
    background-size: 100% 100%;
  }
 
}
</style>