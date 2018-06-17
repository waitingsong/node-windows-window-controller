import { DModel as M, FModel as FM, User32 } from 'win32-api'

const UC = User32.constants
export type Tno = number
export type Hwnd = number
export type matchParam = number | string    // pid or keyword
export type matchType = 'pid' | 'title' | 'hwnd' | null  // hwnd is dec/hex value, not hWnd buf

export interface Task {
  readonly tno: Tno
  hwndSet: Set<M.HWND> // result buf[]
  pidSet: Set<FM.PID>   // result dec[]
  matchType: matchType
  matchValue: matchParam
  errMsg: string
}

export type ErrCode = number // 0: no error
export interface ExecRet {
  err: ErrCode
  msg: string
  pids: FM.PID[]    // processed processId
  hwnds: Hwnd[]  // processed hWnd dec, not GT.HWND
}

export interface FilterWinRules {
  titleExits?: boolean | null  // default null means 'ignore'
  includeStyle?: number | null
  excludeStyle?: number | null
  includeExStyle?: number | null
  excludeExStyle?: number | null
}
export const filterWinRulesDefaults = {
  titleExits: null,
  includeStyle: null,
  excludeStyle: null,
  includeExStyle: null,
  excludeExStyle: null,
}
export const showFilterRulesDefaults = {
  titleExits: true,
  includeStyle: UC.WS_SYSMENU,
  excludeStyle: UC.WS_CHILD,
  includeExStyle: null,
  excludeExStyle: UC.WS_EX_TOOLWINDOW,
}

export interface CliOpts {
  title?: string
  pid?: matchParam
  hwnd?: matchParam
  status?: matchParam
  [prop: string]: any
}

export interface Opts extends FilterWinRules {
  matchType: matchType
  matchValue: matchParam
  nCmdShow?: number
}
