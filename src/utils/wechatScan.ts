// 对微信扫一扫的性能优化
import wx from 'weixin-js-sdk'
import { wechatConfigAPI } from '@/apis/user'
import { Toast } from 'vant'

let isConfiged = false
let isReady = false
let readyPromise: Promise<void> | null = null

/**
 * 初始化微信 JSSDK（只允许调用一次）
 */
export function initWechatJSSDK(jsApiList: string[] = []) {
  if (isConfiged && readyPromise) {
    return readyPromise
  }

  isConfiged = true

  readyPromise = new Promise(async (resolve, reject) => {
    try {
      const url = window.location.href.split('#')[0]
      const res = await wechatConfigAPI({ url })

      if (res.data.errcode !== 0) {
        Toast('微信 JSSDK 配置失败')
        return reject(res)
      }

      const cfg = res.data.data

      wx.config({
        debug: false,
        appId: cfg.appId,
        timestamp: cfg.timestamp,
        nonceStr: cfg.nonceStr,
        signature: cfg.signature,
        jsApiList: jsApiList as any
      })

      wx.ready(() => {
        isReady = true
        console.log('[wechat] wx.ready')
        resolve()
      })

      wx.error(err => {
        console.error('[wechat] wx.error', err)
        reject(err)
      })
    } catch (e) {
      reject(e)
    }
  })

  return readyPromise
}

/**
 * 调起微信扫一扫（必须在 initWechatJSSDK 之后）
 */
export function scanQRCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isReady) {
      return reject('微信 JSSDK 尚未 ready')
    }

    wx.scanQRCode({
      needResult: 1,
      scanType: ['qrCode', 'barCode'],
      success(res) {
        resolve(res.resultStr)
      },
      fail(err) {
        reject(err)
      },
      cancel() {
        reject('cancel')
      }
    })
  })
}
