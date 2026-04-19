<!-- 工作人员核销奖品 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { wechatScan } from '@/utils/wechatLibrary';
import { initWechatJSSDK, scanQRCode } from '@/utils/wechatScan'
import { getTodayPrizeInfoAPI, checkPrizeAPI } from '@/apis/user'
import { Toast } from 'vant'
import { useRoute } from 'vue-router'
import { PrizeKey, PrizeItem } from '@/types/user';
// 定义页面
const pageNum = ref(0)
// 城市信息
const cityList = <string[]>["beijing", "shanghai", "zhengzhou", "chongqing", "guangzhou"];
const currentCity = ref("");
// 通过url参数获取当前城市
const route = useRoute();

// 定义需要显示数据的响应式变量
const prizeInfo = ref<Record<PrizeKey, PrizeItem>>({
  prize_1: { check_count: 0, issued_count: 0 },
  prize_2: { check_count: 0, issued_count: 0 },
  prize_3: { check_count: 0, issued_count: 0 },
  prize_4: { check_count: 0, issued_count: 0 },
  prize_5: { check_count: 0, issued_count: 0 }
});
const PRIZE_KEYS: PrizeKey[] = [
  'prize_1',
  'prize_2',
  'prize_3',
  'prize_4',
  'prize_5'
]
// 获取该城市今天奖品信息
const getTodayPrizeInfo = async () => {
    // 1. 获取城市参数
    if (route.query.city) {
        console.log(route.query.city);
        const city = route.query.city as string;
        if (cityList.includes(city)) {
            currentCity.value = city;   // 更新城市参数
            // 2. 拉取城市核销信息
            const res = await getTodayPrizeInfoAPI({city: currentCity.value});
            console.log("拉取到的今日的奖品信息为：", res);
            if (res.data.errcode == 0){
                PRIZE_KEYS.forEach(key => {
                    prizeInfo.value[key].check_count = res.data.data.today_info[key]?.check_count ?? 0; 
                    prizeInfo.value[key].issued_count = res.data.data.today_info[key]?.issued_count ?? 0;
                })
            } else {
                console.log("拉取今日奖品信息失败：", res.data.errmsg);
            }
        } else {
            Toast("城市参数错误");
            return;
        }
    } else {
        Toast("缺少城市参数");
        return;
    }
}
onMounted(() => getTodayPrizeInfo())


const refreshData = () => {
    Toast("刷新数据统计中..");
    getTodayPrizeInfo();
}


// 扫描结果控制
// const checkPrizeData = async (data) => {
//     const res = await checkPrizeAPI(data)
//     console.log("获取到校验二维码的数据: ", res)
//     if (0 == res.data.errcode) {
//         console.log("prizeNum: ", res.data.data.check_num);
//         prizeNum.value = res.data.data.check_num;
//         pageNum.value = 1;
//     } else {
//         prizeNum.value = 0;
//         pageNum.value = 1;
//         Toast(res.data.errmsg);
//     }
// }

// 扫描功能相关
const prizeNum = ref(0);
const scanning = ref(false)
/**
 * 页面初始化时，只初始化一次微信 JSSDK
 */
onMounted(async () => {
  try {
    await initWechatJSSDK(['scanQRCode'])
    console.log('微信 JSSDK 初始化完成')
  } catch (err) {
    console.error(err)
    Toast('微信初始化失败')
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

        const res = await checkPrizeAPI({ qr_code: result, city: currentCity.value });
        pageNum.value = 1;

        if (res.data.errcode === 0) {
            console.log("prizeNum: ", res.data.data.check_num);
            prizeNum.value = res.data.data.check_num;
        } else {
            prizeNum.value = 0;
            pageNum.value = 1;
            Toast(res.data.errmsg);
        }
    } catch (err) {
        console.log('扫码取消或失败:', err);
    } finally {
        scanning.value = false;
    }



    // console.log("调起扫描");
    // const res = await wechatScan(checkPrizeData);
    // if (0 == res.errcode) {
    //     pageNum.value = 1
    //     console.log(res.result)
    // } else {
    //     console.log(res.errmsg)
    // }
    // console.log("扫描动作完成");
}

// 回到主页
function backIndex() {
    prizeNum.value = 0;
    pageNum.value = 0;
}

</script>

<template>
    <div class="page-body">
        <!-- 起始页面 -->
        <div v-show="pageNum==0" class="land-page">
            <!-- 活动时间和地点 -->
            <div v-show="currentCity=='beijing'" class="beijing-time-location"></div>
            <div v-show="currentCity=='shanghai'" class="shanghai-time-location"></div>
            <div v-show="currentCity=='guangzhou'" class="guangzhou-time-location"></div>
            <div v-show="currentCity=='chongqing'" class="chongqing-time-location"></div>
            <div v-show="currentCity=='zhengzhou'" class="zhengzhou-time-location"></div>
            <!-- 按钮-马上核销 -->
            <div class="btn-start" @click="scanQrCode()"></div>
            <!-- 今日奖品发放数据展示 -->
            <div class="prize-container" @click="refreshData">
                <div class="prize-info" v-for="i in 5" :key="i">
                    <p>
                        {{ i }}等奖：
                        {{ prizeInfo[`prize_${i}`].check_count}}
                         / 
                         {{ prizeInfo[`prize_${i}`].issued_count }}
                    </p>
                </div>
            </div>
        </div>

        <!-- 扫描结果页面 -->
        <div v-show="pageNum==1" class="check-result">
            <!-- 马花纹装饰 -->
            <div class="figure-horse"></div>
            <!-- icon和slogan -->
            <div class="icon-slogan"></div>
            <!-- 弹窗 -->
            <div class="pop-window">
                <!-- 核销失败，所有城市通用 -->
                <div v-show="prizeNum==0" class="check-error"></div>
                <!-- 北京中奖信息 -->
                <div v-show="currentCity=='beijing' && prizeNum == 1" class="beijing-prize-1"></div>
                <div v-show="currentCity=='beijing' && prizeNum == 2" class="beijing-prize-2"></div>
                <div v-show="currentCity=='beijing' && prizeNum == 3" class="beijing-prize-3"></div>
                <div v-show="currentCity=='beijing' && prizeNum == 4" class="beijing-prize-4"></div>
                <div v-show="currentCity=='beijing' && prizeNum == 5" class="beijing-prize-5"></div>
                <!-- 上海中奖信息 -->
                <div v-show="currentCity=='shanghai' && prizeNum == 1" class="shanghai-prize-1"></div>
                <div v-show="currentCity=='shanghai' && prizeNum == 2" class="shanghai-prize-2"></div>
                <div v-show="currentCity=='shanghai' && prizeNum == 3" class="shanghai-prize-3"></div>
                <div v-show="currentCity=='shanghai' && prizeNum == 4" class="shanghai-prize-4"></div>
                <div v-show="currentCity=='shanghai' && prizeNum == 5" class="shanghai-prize-5"></div>
                <!-- 郑州中奖信息 -->
                <div v-show="currentCity=='zhengzhou' && prizeNum == 1" class="zhengzhou-prize-1"></div>
                <div v-show="currentCity=='zhengzhou' && prizeNum == 2" class="zhengzhou-prize-2"></div>
                <div v-show="currentCity=='zhengzhou' && prizeNum == 3" class="zhengzhou-prize-3"></div>
                <div v-show="currentCity=='zhengzhou' && prizeNum == 4" class="zhengzhou-prize-4"></div>
                <div v-show="currentCity=='zhengzhou' && prizeNum == 5" class="zhengzhou-prize-5"></div>
                <!-- 重庆中奖信息 -->
                <div v-show="currentCity=='chongqing' && prizeNum == 1" class="chongqing-prize-1"></div>
                <div v-show="currentCity=='chongqing' && prizeNum == 2" class="chongqing-prize-2"></div>
                <div v-show="currentCity=='chongqing' && prizeNum == 3" class="chongqing-prize-3"></div>
                <div v-show="currentCity=='chongqing' && prizeNum == 4" class="chongqing-prize-4"></div>
                <div v-show="currentCity=='chongqing' && prizeNum == 5" class="chongqing-prize-5"></div>
                <div v-show="currentCity=='chongqing' && prizeNum == 6" class="chongqing-prize-6"></div>
                <!-- 广州中奖信息 -->
                <div v-show="currentCity=='guangzhou' && prizeNum == 1" class="guangzhou-prize-1"></div>
                <div v-show="currentCity=='guangzhou' && prizeNum == 2" class="guangzhou-prize-2"></div>
                <div v-show="currentCity=='guangzhou' && prizeNum == 3" class="guangzhou-prize-3"></div>
                <div v-show="currentCity=='guangzhou' && prizeNum == 4" class="guangzhou-prize-4"></div>
                <div v-show="currentCity=='guangzhou' && prizeNum == 5" class="guangzhou-prize-5"></div>
                <div v-show="currentCity=='guangzhou' && prizeNum == 6" class="guangzhou-prize-6"></div>
            </div>
            <!-- 确定按钮 -->
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
        // 活动时间和地点
        .beijing-time-location {
        position: absolute;
        margin-top: .65rem;
        margin-left: 50%;
        transform: translateX(-50%);
        width: 1.3533rem;
        height: .3066rem;
        background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/index/beijing-time-location.png") top center no-repeat;
        background-size: 100% 100%;
        }
        .shanghai-time-location {
        position: absolute;
        margin-top: .65rem;
        margin-left: 50%;
        transform: translateX(-50%);
        width: 1.38rem;
        height: .3266rem;
        background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/index/shanghai-time-location.png") top center no-repeat;
        background-size: 100% 100%;
        }
        .guangzhou-time-location {
        position: absolute;
        margin-top: .65rem;
        margin-left: 50%;
        transform: translateX(-50%);
        width: 1.38rem;
        height: .3066rem;
        background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/index/guangzhou-time-location.png") top center no-repeat;
        background-size: 100% 100%;
        }
        .chongqing-time-location {
        position: absolute;
        margin-top: .65rem;
        margin-left: 50%;
        transform: translateX(-50%);
        width: 1.62rem;
        height: .3066rem;
        background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/index/chongqing-time-location.png") top center no-repeat;
        background-size: 100% 100%;
        }
        .zhengzhou-time-location {
        position: absolute;
        margin-top: .65rem;
        margin-left: 50%;
        transform: translateX(-50%);
        width: 1.2466rem;
        height: .3066rem;
        background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/index/zhengzhou-time-location.png") top center no-repeat;
        background-size: 100% 100%;
        }
        // 马上开始按钮
        .btn-start {
            position: absolute;
            bottom: 2rem;
            margin-left: 50%;
            transform: translateX(-50%);
            width: 1.5866rem;
            height: .5733rem;
            background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/check/btn-check.png") top center no-repeat;
            background-size: 100% 100%;
        }
        // 今日奖品发放数据展示
        .prize-container {
            position: absolute;
            left: .2rem;
            bottom: .2rem;
            display: flex;
            flex-direction: column;
            // gap: .1rem; // 每一行的间距
            .prize-info {
                width: 2rem;
                // background-color: pink;
                color: white;
            }
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
            .check-error {
                width: 1.68rem;
                height: .46rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/check/text-check-error.png") top center no-repeat;
                background-size: 100% 100%;
            }
            // 北京中奖信息
            .beijing-prize-1 {
                width: 1.9533rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/bj-prize-1.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .beijing-prize-2 {
                width: 1.5733rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/bj-prize-2.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .beijing-prize-3 {
                width: 1.72rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/bj-prize-3.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .beijing-prize-4 {
                width: 1.5066rem;
                height: .9533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/bj-prize-4.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .beijing-prize-5 {
                width: 2.9266rem;
                height: 1.0533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/bj-prize-5.png") top center no-repeat;
                background-size: 100% 100%;
            }
            // 上海中奖信息
            .shanghai-prize-1 {
                width: 1.9533rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/sh-prize-1.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .shanghai-prize-2 {
                width: 1.5733rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/sh-prize-2.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .shanghai-prize-3 {
                width: 1.72rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/sh-prize-3.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .shanghai-prize-4 {
                width: 1.5066rem;
                height: .9533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/sh-prize-4.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .shanghai-prize-5 {
                width: 2.9466rem;
                height: 1.0533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/sh-prize-5.png") top center no-repeat;
                background-size: 100% 100%;
            }
            // 郑州中奖信息
            .zhengzhou-prize-1 {
                width: 2.8133rem;
                height: 1.1533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/zz-prize-1.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .zhengzhou-prize-2 {
                width: 2.7333rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/zz-prize-2.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .zhengzhou-prize-3 {
                width: 1.72rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/zz-prize-3.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .zhengzhou-prize-4 {
                width: 1.5066rem;
                height: .9533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/zz-prize-4.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .zhengzhou-prize-5 {
                width: 1.62rem;
                height: 1.0533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/zz-prize-5.png") top center no-repeat;
                background-size: 100% 100%;
            }
            // 重庆中奖信息
            .chongqing-prize-1 {
                width: 1.9533rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/cq-prize-1.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .chongqing-prize-2 {
                width: 1.5733rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/cq-prize-2.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .chongqing-prize-3 {
                width: 1.72rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/cq-prize-3.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .chongqing-prize-4 {
                width: 1.5066rem;
                height: .9533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/cq-prize-4.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .chongqing-prize-5 {
                width: 2.4666rem;
                height: .9466rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/cq-prize-5.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .chongqing-prize-6 {
                width: 2.9066rem;
                height: 2.2733rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/cq-prize-6.png") top center no-repeat;
                background-size: 100% 100%; 
            }
            // 广州中奖信息
            .guangzhou-prize-1 {
                width: 3.72rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/gz-prize-1.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .guangzhou-prize-2 {
                width: 2.7466rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/gz-prize-2.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .guangzhou-prize-3 {
                width: 1.72rem;
                height: 1.1266rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/gz-prize-3.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .guangzhou-prize-4 {
                width: 1.5066rem;
                height: .9533rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/gz-prize-4.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .guangzhou-prize-5 {
                width: 2.4266rem;
                height: .96rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/gz-prize-5.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .guangzhou-prize-6 {
                width: 2.9066rem;
                height: 2.2733rem;
                background: url("https://www.mbcstyle.cn/projects/lego2026cny/images/draw/gz-prize-6.png") top center no-repeat;
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