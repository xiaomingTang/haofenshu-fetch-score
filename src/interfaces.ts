import { Response } from "superagent"

/**
 * 测验信息/单场考试信息
 */
export interface ExamInfo {
  examId: number;
  time: number;
  name: string;
  className: string;
  score: number;
  manfen: number;
}

/**
 * 单科试卷信息
 */
export interface PaperInfo {
  fujiati: any;
  manfen: number;
  name: string;
  paperId: string;
  score: number;
  subject: string;
}

/**
 * 排名信息(单科和总分排名信息都是这样)
 */
export interface RankInfo {
  "highest": {
    "class": number;
    "grade": number;
    "liankao": number;
    "gradingGroupClass": number;
    "gradingGroupGrade": number;
    "gradingGroupLiankao": number;
  };
  "avg": {
    "class": number;
    "grade": number;
    "liankao": number;
    "gradingGroupClass": number;
    "gradingGroupGrade": number;
    "gradingGroupLiankao": number;
  };
  "rank": {
    "class": number;
    "grade": number;
    "liankao": number;
    "gradingGroupClass": number;
    "gradingGroupGrade": number;
    "gradingGroupLiankao": number;
  };
  "number": {
    "class": number;
    "grade": number;
    "liankao": number;
    "gradingGroupClass": number;
    "gradingGroupGrade": number;
    "gradingGroupLiankao": number;
  };
  "defeatRatio": {
    "class": number;
    "grade": number;
    "liankao": number;
    "gradingGroupClass": number;
    "gradingGroupGrade": number;
    "gradingGroupLiankao": number;
  };
  "classRankType": number;
  "gradeRankType": number;
}

/**
 * 测验的接口返回格式
 */
export interface ExamResponse extends Response {
  body: {
    data: {
      list: ExamInfo[];
    };
  };
}

/**
 * 各科试卷成绩信息接口返回格式
 */
export interface OverviewResponse extends Response {
  body: {
    data: {
      papers: PaperInfo[];
    };
  };
}

/**
 * 排名接口返回格式
 */
export interface RankResponse extends Response {
  body: {
    data: RankInfo;
  };
}

/**
 * 自定义的更易读的测验信息对象
 */
export interface GeneratedExamObj {
  [key: string]: ExamInfo;
}

/**
 * 自定义的更易读的各科试卷成绩信息
 */
export interface GeneratedOverviewObj {
  [key: string]: PaperInfo;
}
