/* eslint-disable quote-props */

import * as superagent from "superagent"

const loginParams = {
  "loginName": "", // 需要手动填写该参数
  "password": "", // 需要手动填写该参数
  "rememberMe": 2,
  "roleType": 2,
}

const loginUrl = "https://hfs-be.yunxiao.com/v2/users/sessions"

/**
 * 在utils中获取一系列成绩信息都需要用到该headers
 * Cookie留空, 会在下面的login方法中填充这个Cookie
 * 所以项目必须首先执行login方法
 */
export const loginHeaders = {
  "Accept": "application/json",
  "Origin": "https://hfs.yunxiao.com",
  "Sec-Fetch-Mode": "cors",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
  "Cookie": "",
}

export async function login() {
  const response = await superagent
    .post(loginUrl)
    .set(loginHeaders)
    .send(loginParams)
    .redirects(0)

  const { body, header } = response
  const { code } = body
  if (code !== 0) { // 0为登录成功, 其他估计应该是登录失败吧
    throw new Error(body)
  }
  loginHeaders.Cookie = header["set-cookie"]
  /**
   * 我想了想, 要不要确认用户信息
   * 后来一想, 如果你的用户名和密码都对的
   * 那怎么还能搜到其他人呢, 那你肯定知道这是谁咯
   * 所以不用确认用户信息
   */
}
