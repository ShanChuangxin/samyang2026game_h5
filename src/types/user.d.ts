


// 用户信息
export type UserInfo = {
    user_id?: string;
    auth_code?: stirng;
    city?: string;
    qr_code?: string;
    position_time_1?: number;
    position_time_2?: number;
    position_time_3?: number;
    position_time_4?: number;
    prize_code?: number;  // 所中的奖品，0为未中奖，1-5为中奖奖品
    draw_time?: number;
    verify_status?: boolean;
    flow_status?: string;
    // 用户资料
    nick_name?: string;
    avatar?: string;
    join_time?: string;

}

// 打卡信息
export type CheckInfo = {
    user_id?: string;
    position_num?: number;

}

// 打卡状态
export type StampStatus = {
    position_time_1?: boolean | string;
    position_time_2?: boolean | string;
    position_time_3?: boolean | string;
    position_time_4?: boolean | string;
}

// 请求抽奖
export type RequestDraw = {
    user_id: string;
    // withdraw_type?: '1' | '2';
}

// 抽奖结果
export type ResposeDraw = {
    prize_code?: number;
}

// 备用方案扫码打卡
export type ScanCheck = {
    city?: string;
    qr_code?: string;    // 客人H5隐藏按钮的信息，格式为：用户id_打卡点编号
}

// 今日礼品发放数量
type PrizeKey = 'prize_1' | 'prize_2' | 'prize_3' | 'prize_4' | 'prize_5';
type PrizeItem = {
    check_count: number;
    issued_count: number;
}
export type TodayPrizeInfo = {
    city?: string;
    today_info: Partial<Record<PrizeKey, PrizeItem>>;   // 允许prize缺失，但类型受控
}

// 核销结果
export type CheckResult = {
    check_status?: boolean;
    check_status_msg?: string;
    check_num?: number;
}