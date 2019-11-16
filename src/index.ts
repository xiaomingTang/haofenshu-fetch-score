/* eslint-disable quote-props */

import { question } from "tang-base-node-utils"
import { login } from "./login-options"
import {
  getAllLiankao, getLiankaoOverview, questionLiankao, getLiankaoRank, getDankeRankList, importantLog, analyze,
} from "./utils"

async function init(fromLocal = true) {
  if (fromLocal) {
    importantLog("正在分析【本地】联考信息")
  } else {
    importantLog("正在从【网络中】获取联考信息")
    await login()
  }
  const allLiankao = await getAllLiankao(fromLocal)
  const curLiankao = await questionLiankao(allLiankao)
  const liankaoId = `${curLiankao.examId}`
  const liankaoName = curLiankao.name
  importantLog(`您选择的是 【${liankaoName}】`)
  const liankaoOverview = await getLiankaoOverview(fromLocal, liankaoId, liankaoName)
  const liankaoRank = await getLiankaoRank(fromLocal, liankaoId, liankaoName)
  const dankeList = await getDankeRankList(fromLocal, liankaoOverview, liankaoId, liankaoName)

  await analyze(curLiankao, liankaoOverview, liankaoRank, dankeList)
}

async function main() {
  const FROM_LOCAL = true // 表意常量, 必须为true
  let fromLocal = false
  try {
    await getAllLiankao(FROM_LOCAL) // 尝试性地从加载本地所有联考信息
    fromLocal = (await question("本地存在历史联考信息, 输入【 y 】则直接分析【本地】联考信息, 否则从网络中获取联考信息并分析", "y")).toLowerCase() === "y"
  } catch (err) {
    console.log("本地无联考信息, 即将从【网络】中获取联考信息...")
    fromLocal = !FROM_LOCAL
  }
  init(fromLocal)
}

main()
