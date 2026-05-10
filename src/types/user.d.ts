


// 用户信息
export type UserInfo = {
    user_id?: string;
    create_time?: number;
    game_start_time: number;
    game_end_time?: number;
    game_time?: number;
    score?: number;
    prize_code?: 'prize_1' | 'prize_2' | 'prize_3' | 'prize_4' | 'prize_5';
    qrcode_url?: string;
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