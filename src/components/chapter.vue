<!-- 盖章区 -->
<template>
  <div class="chapter-page">
    <div @touchstart="handleTouchstart" style="width: 100%; height: 100%">
      <div
        class="stamped_area"
        :style="{
          width: stampedWidth,
          height: stampedHeight,
          backgroundImage: `url(${stampedBg})`,
          // backgroundColor: stampedBgColor,
        }"
      >
        <div class="chapter_style">
          <img :src="flag ? sImg : bImg" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";

const props = withDefaults(
  defineProps<{
    sImg: string; // 未盖章完成的图片
    bImg: string; // 盖章完成的图片
    stampedBg?: string; // 背景图片
    stampedBgColor?: string; // 背景颜色
    stampedWidth?: string; // 宽度
    stampedHeight?: string; // 高度
    arrAy: any; // 点位信息
    numberOfItems?: number; // 通过点位数量
    errorNumber?: number; // 误差范围, 越小误差越小
  }>(),
  {
    sImg: "",
    bImg: "",
    stampedBg: "",
    stampedBgColor: "#fff",
    stampedWidth: "70%",
    stampedHeight: "360px",
    arrAy: () => [],
    numberOfItems: 4,
    errorNumber: 0.1,
  }
);

const emit = defineEmits<{
  (e: "adoptFn"): void;
}>();

let statistics = ref<number>(0);

// 盖章是否完成
const flag = ref<boolean>(false);

// 点位信息
const arrAy = ref<any>([]);

const sealArray = ref<any>(props.arrAy);

// 通过点位数量
const numberOfItems = ref<number>(props.numberOfItems);
// 误差范围, 越小误差越小
const errorNumber = ref<number>(props.errorNumber);

const coordinate = ref<any>([]);

const arr = ref<any>([]);
const form = reactive<any>({
  chapterSetting: null,
});
const handleTouchstart = (e: any) => {
  coordinate.value = [];
  coordinate.value = [...e.touches];

  if (coordinate.value.length >= numberOfItems.value) {
    arr.value = [];
    coordinate.value?.forEach((ele: any) => {
      arr.value.push({
        x: ele.clientX,
        y: ele.clientY,
      });
    });
    form.chapterSetting = [];
    arr.value.forEach((e: any, index: any) => {
      arr.value.forEach((e2: any, index2: any) => {
        if (index2 > index)
          form.chapterSetting.push(
            distance(
              arr.value[index].x,
              arr.value[index2].x,
              arr.value[index].y,
              arr.value[index2].y
            )
          );
      });
    });
    form.chapterSetting.sort((a: any, b: any) => a - b);
    form.chapterSetting = form.chapterSetting.map((e: any) => {
      return e / form.chapterSetting[0];
    });

    chapterCheck(form.chapterSetting);
  }
};

const distance = (x0: any, x1: any, y0: any, y1: any) => {
  return Math.hypot(x1 - x0, y1 - y0);
};

const chapterCheck = (value: any) => {
  if (value) {
    arrAy.value = JSON.parse(JSON.stringify(sealArray.value));

    for (let i = 1; i < value.length; i++) {
      for (let j = 1; j < arrAy.value.length; j++) {
        if (
          value[i] + errorNumber.value > arrAy.value[j] &&
          value[i] - errorNumber.value < arrAy.value[j]
        ) {
          arrAy.value.splice(j, 1);
          statistics.value++;
          break;
        }
      }
    }

    let numberSuc = numberOfItems.value == 5 ? 9 : 5;

    if (
      statistics.value >= numberSuc &&
      coordinate.value.length >= numberOfItems.value
    ) {
      debounce(() => {
        // 这里面是要执行的方法
        adoptFn();
      }, 500);
    }
  }
};

// 函数防抖
const timeout = ref<any>(null);

/**
 *  @func 防抖不成敬意
 *  @params 接收一个函数，以及延迟时间
 *  @author long
 */
const debounce = (func: any, delay: number) => {
  let context = this; // this指向发生变化，需要提出来
  // let args = arguments;
  return (function () {
    const callNow = !timeout.value;
    if (timeout.value) {
      clearTimeout(timeout.value);
    }
    timeout.value = setTimeout(() => {
      timeout.value = null;
    }, delay);
    if (callNow) func.apply(context, arguments);
  })();
};

// 盖章完成的函数
const adoptFn = async () => {
  flag.value = true;
  emit("adoptFn");
};

onMounted(() => {});
</script>

<style lang="scss" scoped>
.chapter-page {
  .stamped_area {
    margin: 0px auto 0;
    background: no-repeat center;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .chapter_style {
      width: 100%;
      text-align: center;
      img {
        width: 50%;
      }
    }
  }
}
</style>
