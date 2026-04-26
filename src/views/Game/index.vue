<!-- 游戏界面 -->
<script setup lang="ts">
// 不校验ts
// @ts-nocheck
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { getTodayPrizeInfoAPI, checkPrizeAPI } from '@/apis/user'
import { Toast } from 'vant'
import { useRoute } from 'vue-router'
import * as Phaser from 'phaser'

// 参数获取
const route = useRoute();
console.log(route.query.city);

// 显示游戏规则弹窗
const isPopRuler = ref(true);
function startGame() {
    // 关闭弹窗
    isPopRuler.value = false;   
    
    // 开启倒计时
    countDown();
}

// 倒计时弹窗
const isPopCountdown = ref(false);
const countdown_num = ref(3);
// 倒计时函数
function countDown() {
    isPopCountdown.value = true;
    countdown_num.value = 3;
    const timer = setInterval(() => {
        countdown_num.value--;
        if (countdown_num.value <=0 ) {
            clearInterval(timer);
            isPopCountdown.value = false;   // 隐藏倒计时
            countdown_num.value = 3;

            // 开启游戏
            sharedState.isRunningGame.value = true;
            // 通知 Phaser 开始游戏
            console.log("游戏开启");
        }
    }, 1000);
}
// 分值计算
const maxScore = 100;   // 满分
const percent = computed(() => {
  return Math.min(score.value / maxScore * 100, 100);
})
// 遮罩高度
const maskHeight = computed(() => {
    return Math.min(percent.value + 23, 100) + '%';
})
// 心的位置（和进度条一样）
const headBottom = computed(() => {
    return Math.min(percent.value + 18, 93) + '%';
});
// 分数的位置（位于心的位置上方）
const scoreBottom = computed(() => {
    return Math.min(percent.value + 30, 105) + '%';
})
// 加分动效
const floatingScores = ref([])
let add_score_id = 0
function addScoreEffect(value) {
    console.log("触发加分特效");
  const item = {
    id: add_score_id++,
    value
  }
  floatingScores.value.push(item)
  // 1秒后删除
  setTimeout(() => {
    floatingScores.value = floatingScores.value.filter(i => i.id !== item.id)
  }, 1000)
}

// 游戏相关
const gameRef = ref(null);
let game: Phaser.Game | null = null;

// vue和Phaser共用变量（通过挂载时，配置config中传入）
const gameTimeLimit = 65;
const score = ref(0);   // 分值（辣度值）
const isRunningGame = ref(false);  // 是否启动游戏
const gameTimeCounter = ref(gameTimeLimit);  // 游戏倒计时
const sharedState = {
    score,
    isRunningGame,
    gameTimeCounter
}

onMounted(() => {
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'game-container',  // 挂载到这个div
        backgroundColor: '#222',
        scene: {
            key: 'main',
            preload,
            create,
            update,
            // data: { // 用于Vue和Phaser共用变量，Phaser使用方式为：this.sys.settings.data.xx
            //     score,
            //     isRunningGame
            // }
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
    this.load.image('player-dizzy', '/projects/samyang2026game/images/game/peppo-dizzy.png');

    // 糖果
    this.load.image('candy-pink', '/projects/samyang2026game/images/game/candy-pink.png');
    this.load.image('candy-purple', '/projects/samyang2026game/images/game/candy-purple.png');
    this.load.image('candy-white', '/projects/samyang2026game/images/game/candy-white.png');
    this.load.image('candy-yellow', '/projects/samyang2026game/images/game/candy-yellow.png');

    // 辣椒
    this.load.image('chilli', '/projects/samyang2026game/images/game/chilli.png');


    // 炸弹
    this.load.image('bomb-1', '/projects/samyang2026game/images/game/bomb-1.png');
    this.load.image('bomb-2', '/projects/samyang2026game/images/game/bomb-2.png');

}

// 注意：width和displayWidth是不同的
function create(this: Phaser.Scene) {
    // 屏幕按比例的宽和高
    const w = this.scale.width;
    const h = this.scale.height;

    this.gameStarted = false;

    // 滑动控制（相对移动）
    // 记录手指上一次的位置
    this.lastPointerX = null;
    // 按下
    this.input.on('pointerdown', (pointer) => {
        this.lastPointerX = pointer.x;
    });
    // 移动
    this.input.on('pointermove', (pointer) => {
        // 限制移动
        if (this.isStunned) return;

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
    
    // 掉落物
    this.items = [];
    this.itemTypes = [
    { key: 'candy-pink', type: 'candy' },
    { key: 'candy-purple', type: 'candy' },
    { key: 'candy-white', type: 'candy' },
    { key: 'candy-yellow', type: 'candy' },
    { key: 'chilli', type: 'chilli' },
    { key: 'bomb-1', type: 'bomb' },
    { key: 'bomb-2', type: 'bomb' },
    ];
    
    // 状态控制
    this.isStunned = false;
}
function update(this: Phaser.Scene) {
    // if (!this.sys.settings.data.isRunningGame.value) return
    // if (!this.items) return

    if (sharedState.isRunningGame.value && !this.gameStarted) {
        this.gameStarted = true;

        this.gameTime = gameTimeLimit;
        sharedState.gameTimeCounter.value = this.gameTime;

        // 定时生成
        this.spawnTimer = this.time.addEvent({
            delay: 800,
            callback: spawnItem,
            callbackScope: this,
            loop: true
        });

        this.timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameTime--;
                sharedState.gameTimeCounter.value = this.gameTime;

                if (this.gameTime <= 0) {
                    sharedState.isRunningGame.value = false;

                    this.spawnTimer.remove();
                    this.timer.remove();

                    console.log('游戏结束');
                }
            },
            loop: true
        });
    }

    const h = this.scale.height

    this.items.forEach((item, index) => {
        item.y += item.speed

        // 碰撞检测
        const dx = this.player.x - item.x
        const dy = this.player.y - item.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 50) {

            if (item.type === 'candy') {
                // 糖果加分
                sharedState.score.value += 1;
                // 触发加分动画
                addScoreEffect(1);
            }
            if (item.type === 'chilli') {
                // 辣椒加分
                sharedState.score.value += 3;
                addScoreEffect(3);
            }

            if (item.type === 'bomb') {
                // 如果连续碰撞，只延长时间，不重新播放动画
                // if (this.isStunned) {
                //     // ❗只延长时间，不重新播放动画
                //     this.stunTimer.reset({
                //         delay: 2000,
                //         callback: this.stunTimer.callback,
                //         callbackScope: this
                //     })
                //     return
                // }

                this.isStunned = true
                // ❗先清掉所有旧动画
                this.tweens.killTweensOf(this.player)
                // 重置状态（非常关键）
                this.player.alpha = 1
                this.player.x = this.player.x
                // 换图
                this.player.setTexture('player-dizzy')
                // 屏幕震动
                this.cameras.main.shake(200, 0.01)
                // 闪烁
                this.tweens.add({
                    targets: this.player,
                    alpha: 0.3,
                    duration: 100,
                    yoyo: true,
                    repeat: 10
                })
                // 抖动（用 fromTo 更安全）
                this.tweens.add({
                    targets: this.player,
                    x: { from: this.player.x - 10, to: this.player.x + 10 },
                    duration: 50,
                    yoyo: true,
                    repeat: 10
                })
                // ❗ 清掉旧的延时（避免叠加）
                if (this.stunTimer) {
                    this.stunTimer.remove()
                }
                // 2秒恢复
                this.stunTimer = this.time.delayedCall(2000, () => {
                    this.isStunned = false
                    this.player.setTexture('player')
                    this.player.alpha = 1
                })
            }

            // 移除
            item.destroy()
            this.items.splice(index, 1)
        }

        // 掉出屏幕
        if (item.y > h) {
            item.destroy()
            this.items.splice(index, 1)
        }
    })
}
// 生成掉落物函数
function spawnItem (this: Phaser.Scene) {
    const w = this.scale.width

    const random = Phaser.Math.Between(0, this.itemTypes.length - 1)
    const config = this.itemTypes[random]

    const item = this.add.image(
        Phaser.Math.Between(50, w - 50),
        0,
        config.key
    )

    item.type = config.type
    item.speed = Phaser.Math.Between(3, 6)

    // 缩放
    item.setScale(0.3)

    this.items.push(item)
}
</script>

<template>
    <div class="page-body">
        <!-- 游戏窗口 -->
        <div id="game-container" ref="gameRef"></div>

        <!-- 游戏倒计时 -->
        <div class="game-timer-counter">{{ gameTimeCounter }}</div>

        <!-- 甜辣值进度条 -->
        <div class="bar-wrapper">
            <!-- 分值进度条 -->
            <div class="bar-mask" :style="{ height: maskHeight }">
                <div class="bar-fill"></div>
            </div>
            <div class="bar-head" :style="{ bottom: headBottom }"></div>
            <!-- 所加分值 -->
            <div class="add-score" :style="{ bottom: headBottom }">
                <div 
                    v-for="item in floatingScores"
                    :key="item.id"
                    class="score-item" 
                >
                    +{{ item.value }}
                </div>
            </div>
            <!-- 当前分值 -->
            <div class="score-record" :style="{ bottom: scoreBottom }">{{ score }}</div>
        </div>


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

    // 游戏倒计时
    .game-timer-counter {
        position: absolute;
        top: 0;
        margin-left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: .5rem;
        font-weight: 900;
    }

    // 进度条
    .bar-wrapper {
        position: absolute;
        // background-color: skyblue;
        top: 2rem;
        left: .1rem;
        width: 1rem;
        height: 3.4333rem;
        .bar-mask {
            position: absolute;
            bottom: 0;
            width: 100%;
            // height: 3.4333rem;
            height: 0%;
            // background-color: pink;
            overflow: hidden;   // 裁减
            .bar-fill {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: 0;
                width: .6466rem;
                height: 3.4333rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/game/count-down-bar.png") no-repeat bottom;
                background-size: 100% 100%;
                transition: height 0.2s ease;
            }
        }
        .bar-head {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 0rem;
            width: .5733rem;
            height: .5066rem;
            background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/game/count-down-heart.png") top center no-repeat;
            background-size: 100% 100%;
            transition: bottom 0.2s ease;
            // z-index: 2;
            // background: red;
        }
        // 分值记录
        .score-record {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 0rem;
            transition: bottom 0.2s ease;

            color: white;
            font-size: .45rem;
            font-weight: 900;
        }
        // 加分记录
        .add-score {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 0rem;
            margin-left: 0rem;

            .score-item {
                position: absolute;
                left: 0rem;
                bottom: 0;
                color: #ff4d4f;
                font-size: .35rem;
                font-weight: 800;
                animation: floatUp 1s ease-out forwards;
            }
            /* 动画 */
            @keyframes floatUp {
                0% {
                    transform: translate(0, 0);
                    opacity: 1;
                }
                100% {
                    transform: translate(0.5rem, -1rem);
                    opacity: 0;
                }
            }
        }
    }

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