import { httpInstance, wechatHttp } from "../utils/http"
import type { ResponseType } from "@/types/http"
import type { WechatJsConfig } from "@/types/wechat"
import { AxiosResponse } from "axios";
import type { UserInfo } from "@/types/user";

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
// 提交游戏记录信息
export const challengeInfoAPI = (data: UserInfo): Promise<AxiosResponse<ResponseType<UserInfo>>> => {
    return httpInstance.post<ResponseType<UserInfo>>('challenge_info', data);
}
// 提交抽奖信息
export const luckydrawAPI = (data: UserInfo): Promise<AxiosResponse<ResponseType<UserInfo>>> => {
    return httpInstance.post<ResponseType<UserInfo>>('luckydraw', data);
}


// debug接口
// 清除用户抽奖信息
export const clearDrawInfoAPI = (data: UserInfo): Promise<AxiosResponse<ResponseType<UserInfo>>> => {
    return httpInstance.post<ResponseType<UserInfo>>('clear_draw_info', data);
}
