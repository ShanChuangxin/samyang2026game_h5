<!-- 游戏界面 -->
<script setup lang="ts">
// 不校验ts
// @ts-nocheck
import { ref, onMounted, onBeforeUnmount } from 'vue'
// import { wechatScan } from '@/utils/wechatLibrary';
import { initWechatJSSDK, scanQRCode } from '@/utils/wechatScan'
import { getTodayPrizeInfoAPI, checkPrizeAPI } from '@/apis/user'
import { Toast } from 'vant'
import { useRoute } from 'vue-router'
import * as Phaser from 'phaser'

// 通过url参数获取当前城市
const route = useRoute();
console.log(route.query.city);


/**
 * 页面初始化时，只初始化一次微信 JSSDK
 */
// onMounted(async () => {
//   try {
//     await initWechatJSSDK(['scanQRCode'])
//     console.log('微信 JSSDK 初始化完成')
//   } catch (err) {
//     console.error(err)
//     Toast('微信初始化失败')
//   }
// })

// 显示游戏规则弹窗
const isPopRuler = ref(false);
function startGame() {
    // 关闭弹窗
    isPopRuler.value = false;   
    
    // 开启倒计时
}

// 倒计时弹窗
const isPopCountdown = ref(false);
const countdown_num = ref(3);
// 倒计时函数
function countDown() {
    countdown_num.value = 3;
    const timer = setInterval(() => {
        countdown_num.value--;
        if (countdown_num.value <=0 ) {
            clearInterval(timer);
            isPopCountdown.value = false;   // 隐藏倒计时
            countdown_num.value = 3;
        }
    })
}


// 游戏相关
const gameRef = ref(null);
let game: Phaser.Game | null = null;

// vue和Phaser共用变量（通过挂载时，配置config中传入）
const score = ref(0);   // 分值（辣度值）
const isRunningGame = ref(false)  // 是否启动游戏

onMounted(() => {
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'game-container',  // 挂载到这个div
        backgroundColor: '#222',
        scene: {
            preload,
            create,
            update,
            data: { // 用于Vue和Phaser共用变量，Phaser使用方式为：this.sys.settings.data.xx
                score,
                isRunningGame
            }
        }
    };
    game = new Phaser.Game(config);
});
onBeforeUnmount(() => {
    if (game) {
        game.destroy(true);
    }
});
//  ===== Phaser 生命周期 =====
function preload(this: Phaser.Scene) {
    // this.load.image('bg', "https://www.mbcstyle.cn/projects/static/samyang2026game/game/bg.jpg");
    // this.load.image('player', 'https://www.mbcstyle.cn/projects/static/samyang2026game/game/peppo-normal.png');
    this.load.image('bg', "/projects/samyang2026game/images/game/bg.jpg");
    this.load.image('player', '/projects/samyang2026game/images/game/peppo-normal.png');

}

// 注意：width和displayWidth是不同的
function create(this: Phaser.Scene) {
    // 屏幕按比例的宽和高
    const w = this.scale.width;
    const h = this.scale.height;

    // 滑动控制（相对移动）
    // 记录手指上一次的位置
    this.lastPointerX = null;
    // 按下
    this.input.on('pointerdown', (pointer) => {
        this.lastPointerX = pointer.x;
    });
    // 移动
    this.input.on('pointermove', (pointer) => {
        if (pointer.isDown && this.lastPointerX !== null) {
            const dx = pointer.x - this.lastPointerX;
            this.player.x += dx;
            // 限制边界
            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                this.player.displayWidth / 2,
                w - this.player.displayWidth / 2
            );
            this.lastPointerX = pointer.x;
        }
    });
    // 抬起
    this.input.on("pointerup", () => {
        this.lastPointerX = null;
    });

    // 背景图(铺满屏幕)
    this.bg = this.add.image(0, 0, 'bg')
        .setOrigin(0)   // 左上角对齐
        .setDisplaySize(w, h);
    // 玩家（放在背景上边, 底部居中）
    this.player = this.add.image(100, h - 150, 'player')    
        // .setOrigin(0.5, 0.5);
        // .setOrigin(0.5, 1); // 底部接物
    // 人物宽度占屏幕25%
    const targetWidth = w * 0.25;   
    const scale = targetWidth / this.player.width;
    this.player.setScale(scale);    // 按屏幕比例缩放

    // 手指/鼠标控制滑动
    // this.input.on('pointermove', (pointer) => {
    //     this.player.x = pointer.x;
    // })
    // 掉落物
    this.item = this.add.circle(200, 0, 20, 0xff0000);
    console.log("create执行了");
}
function update(this: Phaser.Scene) {
    // 掉落
    this.item.y += 3;
    // 简单碰撞检测
    const dx = this.player.x - this.item.x;
    const dy = this.player.y - this.item.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 50) {
        console.log('接到了');
        // 重置位置
        this.item.y = 0;
        this.item.x = Math.random() * window.innerWidth;
    }
    // 掉到底重置
    if (this.item.y > window.innerHeight) {
        this.item.y = 0;
        this.item.x = Math.random() * window.innerWidth;
    }
}
</script>

<template>
    <div class="page-body">
        <!-- 游戏窗口 -->
        <div id="game-container" ref="gameRef"></div>


        <!-- 倒计时弹窗 -->
        <div v-show="isPopCountdown" class="countdown-container">
            <img :src="`https://www.mbcstyle.cn/projects/static/samyang2026game/game/count-down-${countdown_num}.png`" alt="">
        </div>

        <!-- 游戏规则弹窗 -->
        <div v-show="isPopRuler" class="ruler-container">
            <div class="ruler">
                <div class="ruler-btn" @click="startGame"></div>
            </div>
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

    // 倒计时弹窗
    .countdown-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .4);
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            width: 2.14rem;
            height: 2.1333rem;
        } 
    } 

    // 游戏规则弹窗
    .ruler-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .4);
        display: flex;
        justify-content: center;
        align-items: center;
        .ruler {
            position: relative;
            width: 3.82rem;
            height: 4.0933rem;
            background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/game/ruler.png") top center no-repeat;
            background-size: 100% 100%;
            .ruler-btn {
                position: absolute;
                bottom: 0;
                margin-left: 50%;
                transform: translateX(-50%);
                width: 2.2rem;
                height: .51rem;
                // background-color: red;
            }

        }
    } 
}
</style>