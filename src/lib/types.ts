import {types as GT, User32} from 'win32-api';

const UC = User32.constants;
export type matchParam = number | string;    // pid or keyword
export type Tno = number;
export type Hwnd = number;
export interface Task {
    readonly tno: Tno;
    hwndSet: Set<GT.HWND>; // result buf[]
    pidSet: Set<GT.PID>;   // result dec[]
    matchType: 'pid' | 'title' | 'hwnd' | null;    // hwnd is dec/hex value, not hWnd buf
    matchValue: string | number;
    errMsg: string;
}

export type ErrCode = number; // 0: no error
export interface ExecRet {
    err: ErrCode;
    msg: string;
    pids: GT.PID[];    // processed processId
    hwnds: Hwnd[];  // processed hWnd dec, not GT.HWND
}

export interface FilterWinRules {
    titleExits: boolean;  // default true
    includeStyle?: number | null;
    excludeStyle?: number | null;
    includeExStyle?: number | null;
    excludeExStyle?: number | null;
}
export const filterWinRulesDefaults = {
    titleExits: false,
    includeStyle: null,
    excludeStyle: null,
    includeExStyle: null,
    excludeExStyle: null,
};
export const showFilterRulesDefaults = {
    titleExits: true,
    includeStyle: UC.WS_SYSMENU,
    excludeStyle: UC.WS_CHILD,
    includeExStyle: null,
    excludeExStyle: UC.WS_EX_TOOLWINDOW,
};
