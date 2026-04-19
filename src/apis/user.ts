import { httpInstance, wechatHttp } from "../utils/http"
import type { ResponseType } from "@/types/http"
import type { WechatJsConfig } from "@/types/wechat"
import { AxiosResponse } from "axios";
import type { UserInfo, CheckInfo, StampStatus, RequestDraw, ResposeDraw, ScanCheck, TodayPrizeInfo, CheckResult } from "@/types/user";

// 获取用户信息
// export const getUserInfoAPI = (data: UserInfo) => {
//     return httpInstance<ResponseType<UserInfo>>({
//         url: 'get_user_info',
//         method: 'POST',
//         data
//     })
// }

// // 抽奖接口
// export const withdrawAPI = (data: RequestDraw) => {
//     return httpInstance<ResponseType<ResposeDraw>>
// }

// // 核销奖品
// export const checkPrizeAPI = (data: string) => {
//     return httpInstance<ResponseType<CheckResult>>({
//         url: 'check_prize',
//         method: 'POST',
//         data
//     })
// }

// 用户H5接口
// 获取用户信息
export const getUserInfoAPI = (data: UserInfo): Promise<AxiosResponse<ResponseType<UserInfo>>> => {
    return httpInstance.post<ResponseType<UserInfo>>('get_user_info', data);
}
// 电子印章打卡
export const stampCheckAPI = (data: CheckInfo): Promise<AxiosResponse<ResponseType<UserInfo>>> => {
    return httpInstance.post<ResponseType<CheckInfo>>('stamp_check', data);
}
// 打卡状态查询，主要是备用方案扫描打卡后，查询同步打卡状态
export const stampStatusAPI = (data: CheckInfo): Promise<AxiosResponse<ResponseType<StampStatus>>> => {
    return httpInstance.post<ResponseType<StampStatus>>('stamp_status', data);
}
// 抽奖接口
export const withdrawAPI = (data: UserInfo): Promise<AxiosResponse<ResponseType<ResposeDraw>>> => {
    return httpInstance.post<ResponseType<ResposeDraw>>('withdraw', data); // 添加 URL
}

// 工作人员H5接口
// 微信jssdk配置接口
export const wechatConfigAPI = (data: { url: string }): Promise<AxiosResponse<ResponseType<WechatJsConfig>>> => {
    return wechatHttp.post<ResponseType<WechatJsConfig>>('h5_share', data); // 添加 URL
}
// 备用方案扫码打卡
export const scanCheckAPI = (data: ScanCheck): Promise<AxiosResponse<ResponseType<UserInfo>>> => {
    return httpInstance.post<ResponseType<ScanCheck>>('scan_check', data)
}
// 获取今日礼品情况
export const getTodayPrizeInfoAPI = (data: { city: string }): Promise<AxiosResponse<ResponseType<TodayPrizeInfo>>> => {
    return httpInstance.post<ResponseType<TodayPrizeInfo>>('today_prize_info', data)
}
// 核销奖品
export const checkPrizeAPI = (data: { qr_code: string, city: string }): Promise<AxiosResponse<ResponseType<CheckResult>>> => {
    return httpInstance.post<ResponseType<CheckResult>>('check_prize', data);
}

// debug接口
// 清除用户抽奖信息
export const clearDrawInfoAPI = (data: UserInfo): Promise<AxiosResponse<ResponseType<UserInfo>>> => {
    return httpInstance.post<ResponseType<UserInfo>>('clear_draw_info', data);
}
