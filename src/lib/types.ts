
export type matchParam = number | string;    // pid or keyword
export type Tno = number;
export type Pid = number;
export type Hwnd = number;
export interface Task {
    readonly tno: Tno;
    pid: Pid;       // match pid
    title: string;  // match title
    hwndSet: Set<Hwnd>; // result dec[]
    pidSet: Set<Pid>;   // result dec[]
}

export type ErrCode = number; // 0: no error
export interface ExecRet {
    err: ErrCode;
    msg: string;
    pids: Pid[];    // processed processId
    hwnds: Hwnd[];  // processed hWnd
}
