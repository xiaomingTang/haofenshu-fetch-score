/* eslint-disable quote-props */

import * as superagent from "superagent"
import {
  Base, Json, questionUntil, forRun,
} from "tang-base-node-utils"
import {
  ExamResponse,
  OverviewResponse,
  RankResponse,
  GeneratedExamObj,
  GeneratedOverviewObj,
  RankInfo,
  ExamInfo,
} from "./interfaces"
import { loginHeaders } from "./login-options"

export function importantLog(str: string) {
  console.log(`
-----------------
${str}
-----------------
`)
}

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * @param {number} defeatRatio 击败了(百分之)多少同学, 0-100之间的整数
 * @param {number} totalNumber 总人数
 * @return {array} [a, b] 排名结果介于 a b 之间
 */
export function calcRankRange(defeatRatio: number, totalNumber: number) {
  const minRatio = Math.max((100 - defeatRatio - 0.4) / 100, 0)
  const maxRatio = Math.min((100 - defeatRatio + 0.5) / 100, 100)
  return [Math.ceil(minRatio * totalNumber), Math.floor(maxRatio * totalNumber)]
}

const __cwd = process.cwd()
export const assetsDir = `${__cwd}/result`.replace(/\\/g, "/")

export function createJson(basename: string) {
  const realPath = `${assetsDir}/${basename}`
  new Base(realPath).createAsFile()
  return new Json(realPath)
}

export async function saveTo(basename: string, data: any) {
  return new Promise((resolve) => {
    createJson(basename).writeSync(data, 2)
    resolve()
  })
}

export function readFrom(basename: string) {
  return createJson(basename).readSync()
}

export const Interfaces = {
  getAllLiankao: {
    stepName: "获取所有联考信息",
    url: (invalidStr: string, invalidStr2: string) => "https://hfs-be.yunxiao.com/v3/exam/list?start=-1",
    decode: (res: ExamResponse) => {
      const result: GeneratedExamObj = {}
      const { list } = res.body.data
      list.forEach((item) => {
        result[item.name] = item
      })
      return result
    },
  },
  getLiankaoOverview: {
    stepName: "获取一次联考信息",
    url: (id: string, invalidStr: string) => `https://hfs-be.yunxiao.com/v3/exam/${id}/overview`,
    decode: (res: OverviewResponse) => {
      const result: GeneratedOverviewObj = {}
      const { papers } = res.body.data
      papers.forEach((item) => {
        result[item.subject] = item
      })
      return result
    },
  },
  getLiankaoRank: {
    stepName: "获取一次联考排名",
    url: (id: string, invalidStr: string) => `https://hfs-be.yunxiao.com/v3/exam/${id}/rank-info`,
    decode: (res: RankResponse) => res.body.data,
  },
  getDankeRank: {
    stepName: "获取单科排名",
    url: (liankaoId: string, dankeId: string) => `https://hfs-be.yunxiao.com/v3/exam/${liankaoId}/papers/${dankeId}/rank-info`,
    decode: (res: RankResponse) => res.body.data,
  },
}

type InterfacesProp = "getAllLiankao" | "getLiankaoOverview" | "getLiankaoRank" | "getDankeRank"

export function getData(prop: "getAllLiankao", id1: string, id2: string): Promise<GeneratedExamObj>;
export function getData(prop: "getLiankaoOverview", id1: string, id2: string): Promise<GeneratedOverviewObj>;
export function getData(prop: "getLiankaoRank", id1: string, id2: string): Promise<RankInfo>;
export function getData(prop: "getDankeRank", id1: string, id2: string): Promise<RankInfo>;
export async function getData(prop: InterfacesProp, id1: string, id2: string) {
  return new Promise((resolve, reject) => {
    const url = Interfaces[prop].url(id1, id2)
    const decodeFunc = Interfaces[prop].decode

    console.log(`正在执行 ${Interfaces[prop].stepName}: ${url}`)

    superagent
      .get(url)
      .set(loginHeaders)
      .retry() // 默认重试3次
      .then(async (res) => {
        await sleep(Math.random() * 200 + 400)
        const data = decodeFunc(res)
        resolve(data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export async function getAllLiankao(fromLocal = true) {
  const allLiankaoRelPath = "1-getAllLiankao.json"
  if (fromLocal) {
    return readFrom(allLiankaoRelPath) as GeneratedExamObj
  }
  const allLiankao = await getData("getAllLiankao", "", "")
  await saveTo(allLiankaoRelPath, allLiankao)
  return allLiankao
}

export async function getLiankaoOverview(fromLocal = true, liankaoId: string, liankaoName: string) {
  const overviewRelPath = `${liankaoName}/2-getLiankaoOverview.json`
  if (fromLocal) {
    return readFrom(overviewRelPath) as GeneratedOverviewObj
  }
  const liankaoOverview = await getData("getLiankaoOverview", liankaoId, "")
  await saveTo(overviewRelPath, liankaoOverview)
  return liankaoOverview
}

/**
 * 没有联考信息时作出提示
 * 仅有一次联考时直接返回第一次联考
 * 如有多次联考，询问用户选择哪次联考
 */
export async function questionLiankao(allLiankao: GeneratedExamObj) {
  const allLiankaoKeys = Object.keys(allLiankao)
  const allLiankaoLen = allLiankaoKeys.length
  if (allLiankaoLen === 0) {
    throw new Error("没有联考信息")
  }
  let curLiankaoIdx = 0
  if (allLiankaoLen !== 1) {
    curLiankaoIdx = +await questionUntil(`--------------
历次联考信息如下:

${allLiankaoKeys.map((key, i) => `${i + 1}: ${key}`).join("\n")}

请选择您要获取的联考信息
--------------`, (input) => {
      const resultNum = +input
      return resultNum === Math.floor(resultNum) && resultNum > 0 && resultNum <= allLiankaoLen
    }) - 1 // 从1开始数, 所以要减一
  }
  const curLiankao = allLiankao[allLiankaoKeys[curLiankaoIdx]]
  return curLiankao
}

export async function getLiankaoRank(fromLocal = true, liankaoId: string, liankaoName: string) {
  const liankaoRankRelPath = `${liankaoName}/3-getLiankaoRank.json`
  if (fromLocal) {
    return readFrom(liankaoRankRelPath) as RankInfo
  }
  const liankaoRank = await getData("getLiankaoRank", liankaoId, "")
  await saveTo(liankaoRankRelPath, liankaoRank)
  return liankaoRank
}

interface DankeList {
  [key: string]: RankInfo;
}

export async function getDankeRankList(
  fromLocal = true,
  liankaoOverview: GeneratedOverviewObj,
  liankaoId: string,
  liankaoName: string,
) {
  const dankeListRelPath = `${liankaoName}/4-dankeList.json`
  if (fromLocal) {
    return readFrom(dankeListRelPath) as DankeList
  }
  const dankeList = {} as DankeList
  await forRun(Object.entries(liankaoOverview), async ([key, paper]) => {
    const { paperId, subject } = paper
    if (!paperId) {
      throw new Error(`不存在该考试: ${paperId} ${subject}`)
    }
    const dankeRank = await getData("getDankeRank", liankaoId, paperId)
    dankeList[subject] = dankeRank
    await sleep(100)
  })
  await saveTo(dankeListRelPath, dankeList)
  return dankeList
}

export async function analyze(curLiankao: ExamInfo, liankaoOverview: GeneratedOverviewObj, liankaoRank: RankInfo, dankeList: DankeList) {
  const liankaoRankTupple = calcRankRange(liankaoRank.defeatRatio.liankao, liankaoRank.number.liankao)
  const result: any = {
    "联考名称": curLiankao.name,
    "班级总人数": liankaoRank.number.class,
    "全联考总人数": liankaoRank.number.liankao,
    "总分": {
      "满分": curLiankao.manfen,
      "我的成绩": curLiankao.score,
      "班级最高分": liankaoRank.highest.class,
      "全联考最高分": liankaoRank.highest.liankao,
      "全联考排名": `${liankaoRankTupple[0]} ~ ${liankaoRankTupple[1]}`,
    },
    "与班级最高分比": {
      "总分": curLiankao.score - liankaoRank.highest.class,
    },
    "与全联考最高分比": {
      "总分": curLiankao.score - liankaoRank.highest.liankao,
    },
  }
  Object.entries(dankeList).forEach(([key, item]) => {
    result["与班级最高分比"][key] = liankaoOverview[key].score - item.highest.class
    result["与全联考最高分比"][key] = liankaoOverview[key].score - item.highest.liankao

    const dankeRankTupple = calcRankRange(item.defeatRatio.liankao, liankaoRank.number.liankao)
    result[key] = {
      "满分": liankaoOverview[key].manfen,
      "我的成绩": liankaoOverview[key].score,
      "班级最高分": item.highest.class,
      "全联考最高分": item.highest.liankao,
      "全联考排名": `${dankeRankTupple[0]} ~ ${dankeRankTupple[1]}`,
    }
  })

  const liankaoName = curLiankao.name
  const analyzedRelPath = `${liankaoName}/5-汇总.json`
  await saveTo(analyzedRelPath, result)
  importantLog(`联考信息保存在【${assetsDir}】目录中\n且您可以查看该目录下的【${analyzedRelPath}】文件以查看汇总分析结果`)
}
