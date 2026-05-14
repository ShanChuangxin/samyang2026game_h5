<!-- 游戏界面 -->
<script setup lang="ts">
// 不校验ts
// @ts-nocheck
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { challengeInfoAPI, luckydrawAPI } from '@/apis/user'
import { Toast } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import * as Phaser from 'phaser'

// 通过url参数获取用户信息
const route = useRoute();
const user_id = route.query.user_id as string;
const create_time = route.query.create_time as string;
const router = useRouter();
const loadUserInfo = async () => {
  if (!user_id || !create_time){
    console.log("参数不全，返回首页");
    router.replace('/index');
  }
}
// onMounted(() => loadUserInfo()); // 与游戏场景加载放在一起，防止跳转来回出现场景残留问题

/////////////////////////////////////////
//               游戏页面               //
/////////////////////////////////////////
// 游戏结束相关
// 控制游戏结束
const isPopGameOver = ref(false);
// 重新开始游戏
function restartGame () {
    console.log("重新开始游戏");
    // 0. 隐藏结果页面 
    isShowResultPage.value = false; // 隐藏结果页面
    // 1. 关闭游戏结束提醒
    isPopGameOver.value = false;
    // 2. 重置游戏
    isPopRuler.value = true;    // 游戏规则弹窗
    isPopCountdown.value = false;   // 关闭游戏倒计时弹窗
    score.value = 0;    // 重置分数
    gameTimeCounter.value = gameTimeLimit;  // 重置倒计时
    // 3. 关键：重置 Phaser 场景状态
    const scene = game.scene.getScene('main')
    scene.gameStarted = false
    // 清理残留 timer（很重要）
    if (scene.spawnTimer) {
        scene.spawnTimer.remove()
    }
    if (scene.timer) {
        scene.timer.remove()
    }
    // 清掉场上所有物体
    if (scene.items) {
        scene.items.forEach(item => item.destroy())
        scene.items = []
    }
}
// 显示游戏规则弹窗
const isPopRuler = ref(true);
async function startGame() {
    // 关闭弹窗
    isPopRuler.value = false;   
    // 开启倒计时
    countDown();
}
// 倒计时弹窗
const isPopCountdown = ref(false);
const countdown_num = ref(3);
let game_start_time = 0;    // 游戏开始时间
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
            // ===== 重置角色状态 =====
            sharedState.isStunned.value = false;
            // 开启游戏
            sharedState.isRunningGame.value = true;
            // 记录游戏开始时间
            game_start_time = Math.floor(Date.now() / 1000);
            // 通知 Phaser 开始游戏
            console.log("游戏开启");
        }
    }, 1000);
}
// 分值计算
const maxScore = 60;   // 满分
const percent = computed(() => {
  return Math.min(score.value / maxScore * 100, 100);
})
// 遮罩高度
const maskHeight = computed(() => {
    // return Math.min(percent.value + 23, 100) + '%';
    return (23 + percent.value * 0.77) + '%'
})
// 心的位置（和进度条一样）
const headBottom = computed(() => {
    // return Math.min(percent.value + 18, 93) + '%';
    return (18 + percent.value * 0.75) + '%'
});
// 分数的位置（位于心的位置上方）
const scoreBottom = computed(() => {
    // return Math.min(percent.value + 30, 105) + '%';
    return (30 + percent.value * 0.75) + '%'
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
const gameTimeLimit = 30;   // 游戏时长
const score = ref(0);   // 分值（辣度值）
const isRunningGame = ref(false);  // 是否启动游戏
const gameTimeCounter = ref(gameTimeLimit);  // 游戏倒计时
const isStunned = ref(false);   // 是否碰撞到炸弹
// 提交游戏信息
let game_end_time = 0;
async function submitGameResult() {
    game_end_time = Math.floor(Date.now() / 1000);
    const game_info = {
        user_id,
        create_time,
        game_start_time,
        game_end_time,
        game_time: game_end_time - game_start_time, 
        score: sharedState.score.value
    }
    console.log("游戏挑战信息：", game_info);
    try {
        const res = await challengeInfoAPI(game_info);
        console.log("服务器返回结果：", res);
        if (res.data.errcode === 0) {
            console.log("游戏信息同步服务器成功");
        } else {
            console.log("游戏信息同步失败:", res.data.errmsg);
        }
    } catch (err) {
        console.log("请求失败:", err);
    }
}
// Vue与Phaser共用变量
const sharedState = {
    score,
    isRunningGame,
    gameTimeCounter,
    isPopGameOver,
    isStunned   // 是否被炸弹炸
}
onMounted(async () => {
    await loadUserInfo();
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
    // 加载图片资源
    this.load.image('bg', "/projects/samyang2026game/images/game/bg.jpg");
    this.load.image('player', '/projects/samyang2026game/images/game/peppo-normal.png');
    this.load.image('player-dizzy', '/projects/samyang2026game/images/game/peppo-dizzy.png');
    this.load.image('candy-pink', '/projects/samyang2026game/images/game/candy-pink.png');
    this.load.image('candy-purple', '/projects/samyang2026game/images/game/candy-purple.png');
    this.load.image('candy-white', '/projects/samyang2026game/images/game/candy-white.png');
    this.load.image('candy-yellow', '/projects/samyang2026game/images/game/candy-yellow.png');
    this.load.image('chilli', '/projects/samyang2026game/images/game/chilli.png');
    this.load.image('bomb-1', '/projects/samyang2026game/images/game/bomb-1.png');
    this.load.image('bomb-2', '/projects/samyang2026game/images/game/bomb-2.png');
    // 加载音乐
    this.load.audio('audio-candy', '/projects/samyang2026game/audio/audio-candy.mp3');
    this.load.audio('audio-chilli', '/projects/samyang2026game/audio/audio-candy.mp3'); // 暂时和糖果是相同声音
    this.load.audio('audio-bomb', '/projects/samyang2026game/audio/audio-bomb.mp3');
}
// 注意：width和displayWidth是不同的
function create(this: Phaser.Scene) {
    // 全局音量
    this.sound.volume = 0.1;

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
        // 未在游戏状态，限制移动
        if (!sharedState.isRunningGame.value) return;
        // 被炸弹炸限制移动
        if (sharedState.isStunned.value) return;

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

    // 初始化音乐
    this.candySound = this.sound.add('audio-candy');
    this.chilliSound = this.sound.add('audio-chilli');
    this.bombSound = this.sound.add('audio-bomb');
    
    // 状态控制
    this.isStunned = false;
}
function update(this: Phaser.Scene) {
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
            callback: async () => {
                this.gameTime--;
                sharedState.gameTimeCounter.value = this.gameTime;

                if (sharedState.isRunningGame.value && this.gameTime <= 0) {
                    sharedState.isRunningGame.value = false;
                    this.spawnTimer.remove();
                    this.timer.remove();
                    sharedState.isStunned.value = false; // 防止游戏结束后又接了个炸弹，导致下轮游戏无法移动
                    //sharedState.isPopGameOver.value = true; // 开启游戏结束弹窗
                    console.log('游戏结束');
                    // 判断积分，如果大于60，则弹成功界面，如果小 于60则弹失败界面
                    // isSuccess.value = score.value >= 60 ? true : false;
                    isSuccess.value = false;    // 倒时j结束一律认为挑战失败
                    prizeGrade.value = 5;   // 设置一个无关紧要的奖
                    isPopDrawResult.value = false;  // 隐藏中奖结果弹窗
                    isShowResultPage.value = true;  // 显示结果弹窗
                    // 同步游戏结果
                   submitGameResult();
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
                // 如果是在眩晕状态，不进行计分
                if (sharedState.isStunned.value) return;
                // 糖果加分
                sharedState.score.value = Math.min(sharedState.score.value + 3, maxScore);
                // 触发加分动画
                addScoreEffect(3);
                // 播放声音
                this.sound.play('audio-candy', { volume: 0.5 });
            }
            if (item.type === 'chilli') {
                // 如果是在眩晕状态，不进行计分
                if (sharedState.isStunned.value) return;
                // 辣椒加分
                sharedState.score.value = Math.min(sharedState.score.value + 5, maxScore);
                addScoreEffect(5);
                this.sound.play('audio-chilli', { volume: 0.5 });
            }
            if (item.type === 'bomb') {
                sharedState.isStunned.value = true;
                this.sound.play('audio-bomb', { volume: 0.5 });
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
                    this.stunTimer.remove();
                }
                // 2秒恢复
                this.stunTimer = this.time.delayedCall(2000, () => {
                    sharedState.isStunned.value = false;
                    this.player.setTexture('player');
                    this.player.alpha = 1;
                })
            }
            // 移除
            item.destroy()
            this.items.splice(index, 1)
            // 如果在时间内积分满了，则直接跳转到成功结果页面
            if (score.value >= maxScore) {
                // 防止重复进入
                if (!sharedState.isRunningGame.value) return;
                // 1. 先让游戏停止
                sharedState.isRunningGame.value = false;
                this.spawnTimer.remove();
                this.timer.remove();
                sharedState.isStunned.value = false; // 防止最后又接了个炸弹，导致下轮游戏无法移动
                // 2. 成功页面
                isSuccess.value = true;
                prizeGrade.value = 5;   // 设置一个无关紧要的奖
                isPopDrawResult.value = false;  // 隐藏中奖结果弹窗
                isShowResultPage.value = true;  // 显示结果弹窗
                // 3. 同步游戏结果
                submitGameResult();
            }
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
    // item.speed = Phaser.Math.Between(3, 6)
    // 游戏进度（0~1）
    const progress = 1 - (this.gameTime / gameTimeLimit)
    // 基础速度：前期3，后期10
    const baseSpeed = Phaser.Math.Linear(3, 10, progress)
    // 再加一点随机浮动
    item.speed = Phaser.Math.FloatBetween(
        baseSpeed - 1,
        baseSpeed + 1
    )
    // 根据类型设置大小
    // if (item.type === 'candy') {
    //     item.setScale(0.3)
    // }
    // if (item.type === 'chilli') {
    //     item.setScale(0.35) // 稍大一点更显眼
    // }
    // if (item.type === 'bomb') {
    //     item.setScale(0.4) // 危险物更大
    // }
    // 缩放
    item.setScale(0.5)
    this.items.push(item)
}

/////////////////////////////////////////
//              游戏结果页面             //
/////////////////////////////////////////
const isShowResultPage = ref(false); // 是否显示结果页面
const isSuccess = ref(false);    // 是否挑战成功
const isPopDrawResult = ref(false);  // 是否中奖结果窗体
const prizeGrade = ref(5);  // 1为花束礼盒2折券，2为五连包2折券，3单品5元券，4为40-8，5为100-10
const qrcode_url = ref(''); // 奖券二维码地址
// 抽奖
async function luckydraw() {
    const game_info = {
        user_id,
        create_time,
        game_start_time,
        game_end_time,
        game_time: game_end_time - game_start_time, 
        score: sharedState.score.value
    }
    console.log("游戏抽奖信息：", game_info);
    try {
        const res = await luckydrawAPI(game_info);
        console.log("服务器返回结果：", res);
        if (res.data.errcode === 0) {
            console.log("抽奖成功");
            prizeGrade.value = res.data.data?.prize_code;
            qrcode_url.value = res.data.data?.qrcode_url;
            isPopDrawResult.value = true;
        } else {
            console.log("抽奖失败:", res.data.errmsg);
        }
    } catch (err) {
        console.log("请求失败:", err);
    }

    // isPopDrawResult.value = true;
    // prizeGrade.value = 1;
}

// 切换奖品
function deubugChangePrize() {
    return;
    if (prizeGrade.value == 5) {
        prizeGrade.value = 1;
    } else 
    {
        prizeGrade.value += 1;
    }
}
</script>

<template>
    <div class="page-body">
        <!-- 游戏页面 -->
        <div class="game-page">
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

            <!-- 游戏结束提醒 -->
            <div v-show="isPopGameOver" class="game-over-container">
                <div class="restart-btn" @click="restartGame"></div>
            </div>
        </div>

        <!-- 游戏结果页面 -->
        <div v-show="isShowResultPage" class="result-page">
            <img src="https://www.mbcstyle.cn/projects/static/samyang2026game/result/bg.jpg" alt="" class="bg" @click="navigateToTastePage">
            <div v-if="isSuccess" class="success-page">
                <div class="success-tips"></div>
                <div class="success-noodles"></div>
                <div class="success-decoration"></div>
                <div class="btn-luckydraw" @click="luckydraw"></div>
                <!-- 中奖结果弹窗 -->
                <div v-show="isPopDrawResult" class="draw-result-container">
                    <div class="btn-back" @click="restartGame"></div>
                    <!-- <div class="btn-share"></div> -->
                    <!-- 弹窗容器 -->
                    <div class="pop-container">
                        <div class="pop-bg"></div>
                        <div class="ticket-container">
                            <img v-show="prizeGrade=='1'" src="https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-pic-flower.png" alt="">
                            <img v-show="prizeGrade=='2'" src="https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-pic-5pocket.png" alt="">
                            <img v-show="prizeGrade=='3'" src="https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-pic-5yuan.png" alt="">
                            <img v-show="prizeGrade=='4'" src="https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-pic-40-8.png" alt="">
                            <img v-show="prizeGrade=='5'" src="https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-pic-100-10.png" alt="">
                        </div>
                        <div class="peppo-pic" @click="deubugChangePrize"></div>
                        <div v-show="prizeGrade=='1'" class="ticket-title-flower"></div>
                        <div v-show="prizeGrade=='2'" class="ticket-title-5pocket"></div>
                        <div v-show="prizeGrade=='3'" class="ticket-title-5yuan"></div>
                        <div v-show="prizeGrade=='4'" class="ticket-title-40-8"></div>
                        <div v-show="prizeGrade=='5'" class="ticket-title-100-10"></div>
                        <!-- <div class="btn-close"></div> -->
                    </div>
                    <!-- 扫码容器 -->
                    <div class="qrcode-container">
                        <div class="qrcode">
                            <!-- <img src="https://www.mbcstyle.cn/projects/static/samyang2026game/qrcode/mockup_code.jpg" alt=""> -->
                            <img :src="qrcode_url" alt="">
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="fail-page">
                <div class="fail-tips"></div>
                <div class="fail-noodles"></div>
                <div class="fail-restart" @click="restartGame"></div>
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

    // 游戏页面
    .game-page {
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

        // 倒计时弹窗
        .game-over-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, .4);
            .restart-btn {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: 2rem;
                width: 2.1333rem;
                height: .5133rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/fail-restart.png") top center no-repeat;
                background-size: 100% 100%;
                
            }
        } 
    }
    // 游戏结果页面
    .result-page {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        .bg {
            width: 100%;
            height: auto;
        }
        .success-page {
            .success-tips {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: 1rem;
                width: 3.9866rem;
                height: 1.8333rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/success-tips.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .success-noodles {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: 3rem;
                width: 4.8266rem;
                height: 4.54rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/success-noodles.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .success-decoration {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: 0rem;
                width: 5rem;
                height: 5.0933rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/success-decoration.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .btn-luckydraw {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: .6rem;
                width: 2.1333rem;
                height: .5133rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/success-btn-luckydraw.png") top center no-repeat;
                background-size: 100% 100%;
            }
            // 中奖结果弹窗
            .draw-result-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(0, 0, 0, .7);
                .btn-back {
                    position: absolute;
                    left: .3rem;
                    top: .3rem;
                    width: .4733rem;
                    height: .3933rem;
                    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/btn-return.png") top center no-repeat;
                    background-size: 100% 100%;
                }
                .btn-share {
                    position: absolute;
                    right: .3rem;
                    top: .3rem;
                    width: .4rem;
                    height: .3933rem;
                    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/btn-share.png") top center no-repeat;
                    background-size: 100% 100%;
                }
                .pop-container {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    top: .7rem;
                    width: 4.2rem;
                    height: 6rem;
                    // background-color: pink;
                    .pop-bg {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        top: 1rem;
                        width: 3.8133rem;
                        height: 4.2866rem;
                        background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/pop-bg.png") top center no-repeat;
                        background-size: 100% 100%;
                    }
                    .ticket-title-flower {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-51%);
                        top: .05rem;
                        width: 3.8533rem;
                        height: 1.62rem;
                        background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-title-flower.png") top center no-repeat;
                        background-size: 100% 100%;
                    }
                    .ticket-title-5pocket {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-52%);
                        top: .05rem;
                        width: 4.0133rem;
                        height: 1.7666rem;
                        background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-title-5pocket.png") top center no-repeat;
                        background-size: 100% 100%;
                    }
                    .ticket-title-5yuan {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-52%);
                        top: .05rem;
                        width: 4.0133rem;
                        height: 1.7666rem;
                        background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-title-5yuan.png") top center no-repeat;
                        background-size: 100% 100%;
                    }
                    .ticket-title-40-8 {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-49%);
                        top: .05rem;
                        width: 4.2933rem;
                        height: 1.54rem;
                        background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-title-40-8.png") top center no-repeat;
                        background-size: 100% 100%;
                    }
                    .ticket-title-100-10 {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-49%);
                        top: .05rem;
                        width: 4.2933rem;
                        height: 1.54rem;
                        background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/ticket-title-100-10.png") top center no-repeat;
                        background-size: 100% 100%;
                    }
                    .ticket-container {
                        position: absolute;
                        left: .7rem;
                        top: 1.6rem;
                        width: 1.8rem;
                        height: 2.8rem;
                        img {
                            width: 100%;
                            height: 100%;
                        }
                    }
                    .peppo-pic {
                        position: absolute;
                        right: .5rem;
                        top: 2.3rem;
                        width: 1.58rem;
                        height: 2.2733rem;
                        background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/peppo.png") top center no-repeat;
                        background-size: 100% 100%;

                    }
                    .btn-close {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        bottom: 0rem;
                        width: .4733rem;
                        height: .4733rem;
                        background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/btn-close.png") top center no-repeat;
                        background-size: 100% 100%;
                    }
                }
                .qrcode-container {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    bottom: 1.8rem;
                    width: 3.76rem;
                    height: 1.6533rem;
                    background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/tips.png") top center no-repeat;
                    background-size: 100% 100%;
                    // background-color: skyblue;
                    .qrcode {
                        position: absolute;
                        top: .15rem;
                        right: .14rem;
                        width: 1.36rem;
                        height: 1.36rem;
                        // background-color: pink;
                        img {
                            width: 100%;
                            height: 100%;
                        }
                    }
                }

            }
        }
        .fail-page {
            .fail-tips {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: 1rem;
                width: 3.92rem;
                height: 1.7rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/fail-tips.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .fail-noodles {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: 3rem;
                width: 4rem;
                height: 5.4933rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/fail-noodles.png") top center no-repeat;
                background-size: 100% 100%;
            }
            .fail-restart {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: .6rem;
                width: 2.1333rem;
                height: .5133rem;
                background: url("https://www.mbcstyle.cn/projects/static/samyang2026game/result/fail-restart.png") top center no-repeat;
                background-size: 100% 100%;
            }
        }
        
    }

    
}
</style>