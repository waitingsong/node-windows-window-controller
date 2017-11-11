import {types as GT} from 'win32-api';

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
