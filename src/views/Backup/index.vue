<!-- 工作人员备用扫码打卡 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { initWechatJSSDK, scanQRCode } from '@/utils/wechatScan'
import { scanCheckAPI } from '@/apis/user'
import { Toast } from 'vant'

const pageNum = ref(0)
const isCorrect = ref(false)
const scanning = ref(false)

/**
 * 页面初始化时，只初始化一次微信 JSSDK
 */
onMounted(async () => {
  try {
    await initWechatJSSDK(['scanQRCode']);
    console.log('微信 JSSDK 初始化完成');
  } catch (err) {
    console.error(err);
    Toast('微信初始化失败');
  }
})

async function scanQrCode() {
  if (scanning.value) {
        Toast("调起扫描中..");
        return;
    }
  scanning.value = true;

  try {
    const result = await scanQRCode();
    console.log('扫码结果:', result);

    const res = await scanCheckAPI({ qr_code: result });
    pageNum.value = 1;

    if (res.data.errcode === 0) {
      isCorrect.value = true;
    } else {
      isCorrect.value = false;
      Toast(res.data.errmsg);
    }
  } catch (err) {
    console.log('扫码取消或失败:', err);
  } finally {
    scanning.value = false;
  }
}

function backIndex() {
  isCorrect.value = false;
  pageNum.value = 0;
}
</script>

<template>
  <div class="page-body">
    <div v-show="pageNum === 0" class="land-page">
      <div class="btn-start" @click="scanQrCode"></div>
    </div>

    <div v-show="pageNum === 1" class="check-result">
      <div class="figure-horse"></div>
      <div class="icon-slogan"></div>

      <div class="pop-window">
        <div v-if="isCorrect" class="success"></div>
        <div v-else class="fail"></div>
      </div>

      <div class="btn-sure" @click="backIndex"></div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.page-body {
    // 通用页面
    position: absolute;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
     // 起始页面
    .land-page {
        width: 100%;
        height: 100%;
        background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/index/bg.jpg") top center no-repeat;
        background-size: cover;
       
        // 马上开始按钮
        .btn-start {
        position: absolute;
        bottom: 1.8rem;
        margin-left: 50%;
        transform: translateX(-50%);
        width: 1.5866rem;
        height: .5733rem;
        background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/check/btn-backup.png") top center no-repeat;
        background-size: 100% 100%;
        }
    }

    // 扫码结果页面
    .check-result {
        position: relative;
        width: 100%;
        height: 100%;
        background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/bg.jpg") top center no-repeat;
        background-size: cover;
        .figure-horse {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 2.9533rem;
            height: 2.9333rem;
            background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/figure-horse.png") top center no-repeat;
            background-size: 100% 100%;
        }
        .icon-slogan {
            position: absolute;
            top: .5rem;
            margin-left: 50%;
            transform: translateX(-50%);
            width: 3.1066rem;
            height: 1.1933rem;
            background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/slogan.png") top center no-repeat;
            background-size: 100% 100%;
        }   
        .pop-window {
            position: absolute;
            top: 2.5rem;
            margin-left: 50%;
            transform: translateX(-50%);
            width: 4.0133rem;
            height: 5.8666rem;
            background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/check/bg-pop.png") top center no-repeat;
            background-size: 100% 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            .success {
                width: 2.2933rem;
                height: .58rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/check/backup-success.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .fail {
                width: 2.3133rem;
                height: .58rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/check/backup-fail.png") top center no-repeat;
                background-size: 100% 100%;
            }
        }
        .btn-sure {
            position: absolute;
            top: 9rem;
            margin-left: 50%;
            transform: translateX(-50%);
            width: 1.5866rem;
            height: .5733rem;
            background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/check/btn-sure.png") top center no-repeat;
            background-size: 100% 100%;
        }
    }
}
</style>