import * as ffi from 'ffi';
import * as Config from './types';

const isWin32: boolean = process.platform === 'win32';
const plateformError = 'Invalid platform: win32 required';

// https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx
export enum CmdShow {
    // Hides the window and activates another window.
    SW_HIDE = 0,

    // Activates and displays a window. If the window is minimized or maximized, the system restores it to its original size and position. An application should specify this flag when displaying the window for the first time.
    SW_SHOWNORMAL = 1,

    // Activates the window and displays it as a minimized window.
    SW_SHOWMINIMIZED = 2,

    // Activates the window and displays it as a maximized window.
    SW_SHOWMAXIMIZED = 3,

    // Maximizes the specified window.
    SW_MAXIMIZE = 3,

    // Displays a window in its most recent size and position. This value is similar to SW_SHOWNORMAL, except that the window is not activated.
    SW_SHOWNOACTIVATE = 4,

    // Activates the window and displays it in its current size and position.
    SW_SHOW = 5,

    // Minimizes the specified window and activates the next top-level window in the Z order.
    SW_MINIMIZE = 6,

    // Displays the window as a minimized window. This value is similar to SW_SHOWMINIMIZED, except the window is not activated.
    SW_SHOWMINNOACTIVE = 7,

    // Displays the window in its current size and position. This value is similar to SW_SHOW, except that the window is not activated.
    SW_SHOWNA = 8,

    // Activates and displays the window. If the window is minimized or maximized, the system restores it to its original size and position.
    SW_RESTORE = 9,

    // Sets the show state based on the SW_ value specified in the STARTUPINFO structure passed to the CreateProcess function by the program that started the application.
    SW_SHOWDEFAULT = 10,

    // Minimizes a window, even if the thread that owns the window is not responding. This flag should only be used when minimizing windows from a different thread.
    SW_FORCEMINIMIZE = 11,
}


export interface User32 {
    EnumWindows: EnumWindows;
    GetWindowThreadProcessId(hWnd: number, lpdwProcessId: Buffer): number;
    GetWindowTextW(hWnd: number, lpString: Buffer, nMaxCount: number): number;
    IsWindowVisible(hWnd: number): boolean;
    ShowWindow(hWnd: number, nCmdShow: number): boolean;
    GetParent(hWnd: number): number | null;
    GetAncestor(hwnd: number, gaFlags: number): number;
}
export interface EnumWindows {
    (lpEnumFunc: Buffer, lParam: Config.Tno): boolean;
    async(lpEnumFunc: Buffer, lParam: Config.Tno, cb: (err: Error) => void): boolean;
}

export const api: User32 = ffi.Library('user32.dll', {
    EnumWindows: ['bool', ['pointer', 'int32'] ],
    GetWindowThreadProcessId: ['uint32', ['uint', 'pointer']],
    GetWindowTextW: ['long', ['long', 'CString', 'long']],
    IsWindowVisible: ['bool', ['int32']],
    ShowWindow: ['bool', ['uint32', 'int']],
    GetParent: ['uint32', ['uint32']],
    GetAncestor: ['uint', ['uint32', 'uint']],
});


export interface TaskConfig {
    tno: Config.Tno;
    task: Map<Config.Tno, Config.Task>;
}

export const taskConfig: TaskConfig = {
    tno: 0,
    task: new Map(),
};

export type ErrCode = number; // 0: no error
export interface ExecRet {
    err: ErrCode;
    msg: string;
    pids: Config.Pid[];    // processed processId
    hwnds: Config.Hwnd[];  // processed hWnd
}


// stop loop if return false
export const enumWindowsProc = ffi.Callback('bool', ['uint32', 'int'], (hWnd: number, lParam: Config.Tno): boolean => {
    const task = taskConfig.task.get(lParam);

    if ( ! task) {
        return true;
    }

    if (task.pid > 0) {
        const buf = Buffer.alloc(8);

        api.GetWindowThreadProcessId(hWnd, buf);
        const pid = buf.readUIntLE(0, 8);

        if (pid && pid === task.pid) {
            task.hwndSet.add(hWnd);
        }
    }
    else {
        if (task.title) {
            const buf = Buffer.alloc(254);
            const ret = api.GetWindowTextW(hWnd, buf, 254);
            const name = buf.toString('ucs2');
            // const visible = api.IsWindowVisible(hWnd);

            if (name.indexOf(task.title) !== -1) {
                const buf = Buffer.alloc(8);

                api.GetWindowThreadProcessId(hWnd, buf);
                task.pidSet.add(buf.readUIntLE(0, 8));
                task.hwndSet.add(hWnd);
                // console.log(`${hWnd}: ${name}`);
            }
        }
        else {  // all
            task.hwndSet.add(hWnd);
        }
    }
    return true;
});

export function validate_cmdshow(nCmdShow: CmdShow): boolean {
    const res = (nCmdShow < 0 || typeof CmdShow[nCmdShow] === 'undefined') ? false : true;

    if ( ! res) {
        console.error('hWnd value invalid: See: https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx');
    }
    return res;
}


export function show(hWnd: number, nCmdShow: CmdShow, onlyMainWin: boolean): Promise<void | Config.Hwnd> {
    return new Promise((resolve, reject) => {
        const id = +hWnd;

        if (onlyMainWin &&  ! is_main_window(hWnd)) {
            return resolve();
        }
        nCmdShow = +nCmdShow;

        if ( ! id || Number.isNaN(id)) {
            return reject('show() params hWnd invalid: ' + hWnd);
        }
        if (Number.isNaN(nCmdShow) || nCmdShow < 0) {
            return reject('show() params nCmdShow invalid: ' + nCmdShow);
        }

        if (nCmdShow === 0) {
            if ( ! api.IsWindowVisible(id)) {   // skip if invisible
                return resolve();
            }
        }

        try {
            api.ShowWindow(id, nCmdShow);
        }
        catch (ex) {
            return reject(ex);
        }
        resolve(id);
    });
}


export function get_hwnds(p: Config.matchParam, task?: Config.Task): Promise<number[] | void> {
    if ( ! task) {
        task = create_task();
    }
    let t: NodeJS.Timer;

    return Promise.race([
        new Promise(resolve => {
            t = setTimeout(() => {
                console.error('timeout failed');
                resolve();
            }, 30000); // @HARDCOD
        }),
        get_hwnd(p, task),
    ]).then(res => {
        clearTimeout(t);
        task && taskConfig.task.delete(task.tno);
        if (res && Array.isArray(res) && res.length) {
            return res;
        }
    }).catch(err => {
        clearTimeout(t);
        task && taskConfig.task.delete(task.tno);
        console.error(err);
    });
}

export function get_hwnd(p: Config.matchParam, task: Config.Task): Promise<number[] | void> {
    if (typeof p === 'number') {
        if ( ! Number.isSafeInteger(p)) {
            return Promise.resolve();
        }

        task.pid = p;
        task.title = '';
        return get_task_hwnd(task)
            .then(res => {
                return res;
            })
            .catch(err => {
                console.error(err);
                return;
            });
    }
    else if (typeof p === 'string') {
        task.pid = 0;
        task.title = p;
        return get_task_hwnd(task)
            .then(res => {
                return res;
            })
            .catch(err => {
                console.error(err);
                return;
            });
    }
    else {
        console.error('param p invalid', p);
        return Promise.resolve();
    }
}


function get_task_hwnd(task: Config.Task): Promise<number[]> {
    return new Promise((resolve, reject) => {
        if (!isWin32) {
            reject(plateformError);
            return;
        }

        if ( ! task) {
            return resolve([]);
        }
        api.EnumWindows.async(enumWindowsProc, task.tno, err => {
            resolve(Array.from(task.hwndSet) || []);
        });
    });
}



// get hWnd of main top-level window
export function filter_main_hwnd(arr: number[]): number | void {
    const res = new Set();
    const map = new Map();

    for (let hWnd of arr) {
        const ownerHWnd = api.GetAncestor(hWnd, 3);
        let count = map.get(ownerHWnd);

        count = ! count ? 1 : count + 1;
        map.set(ownerHWnd, count);
    }

    if (map.size === 1) {
        const [hWnd] = map.keys();

        return hWnd;
    }
    else if (map.size > 1) {
        let max = 0;
        let hWnd = 0;

        for (let [k, v] of map) {
            if (v > max) {
                max = v;
                hWnd = k;
            }
        }

        return hWnd;
    }
}

// check hWnd is top-level window
export function is_main_window(hWnd: number): boolean {
    const res = api.GetParent(hWnd);

    return res === null || res === 0 ? true : false;
}

export function create_task(): Config.Task {
    const tno = ++taskConfig.tno;
    const task: Config.Task = {
        tno,
        pid: 0,
        title: '',
        hwndSet: new Set(),
        pidSet: new Set(),
    };

    taskConfig.task.set(tno, task);

    return task;
}
