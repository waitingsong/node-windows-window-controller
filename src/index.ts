/**
 * node-windows-window-controller
 *
 * @author waiting
 * @license MIT
 * @link https://github.com/waitingsong/node-windows-window-controller
 */

/// <reference types="node" />

import * as ffi from 'ffi';
// import * as ref from 'ref';

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

export type matchParam = number | string;    // pid or keyword

export interface Api {
    EnumWindows: EnumWindows;
	GetWindowThreadProcessId(hWnd: number, lpdwProcessId: Buffer): number;
    GetWindowTextW(hWnd: number, lpString: Buffer, nMaxCount: number): number;
    IsWindowVisible(hWnd: number): boolean;
    ShowWindow(hWnd: number, nCmdShow: number): boolean;
    GetParent(hWnd: number): number | null;
    GetAncestor(hwnd: number, gaFlags: number): number;
}
export interface EnumWindows {
    (lpEnumFunc: Buffer, lParam: number): boolean;
    async(lpEnumFunc: Buffer, lParam: number, cb: (err: Error) => void): boolean;
}

const api: Api = ffi.Library('user32.dll', {
    EnumWindows: ['bool', ['pointer', 'int32'] ],
	GetWindowThreadProcessId: ['uint32', ['uint', 'pointer'] ],
    GetWindowTextW: ['long', ['long', 'CString', 'long'] ],
    IsWindowVisible: ['bool', ['int32'] ],
    ShowWindow: ['bool', ['uint32', 'int'] ],
    GetParent: ['uint32', ['uint32']],
    GetAncestor: ['uint', ['uint32', 'uint']],
});

const HWNDSet: Set<number> = new Set(); // dec[]
let decProcId: number = 0;
let matchTitle: string = '';
let processing = false;

const killProcIdSet: Set<number> = new Set(); // dec[]

export type ErrCode = number; // 0: no error

// expose original user32.ShowWindow() as default
export default function showWindow(hWnd: number, nCmdShow: CmdShow): ErrCode {
    let errcode = 1;

    if ( ! Number.isSafeInteger(hWnd)) {
        console.error('hWnd must integer')
        return errcode;
    }
    if ( ! validate_cmdshow(nCmdShow)) {
        return errcode;
    }

    try {
        if (api.ShowWindow(hWnd, nCmdShow)) {
            errcode = 0;
        }
    }
    catch(ex) {
        console.error(ex);
    }

    return errcode;
}

export function validate_cmdshow(nCmdShow: CmdShow): boolean {
    const res = (nCmdShow < 0 || typeof CmdShow[nCmdShow] === 'undefined') ? false : true;

    if ( ! res) {
        console.error('hWnd value invalid: See: https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx');
    }
    return res;
}

export function hide(p: matchParam, onlyMainWin: boolean = true): Promise<void> {
    return proxy(p, CmdShow.SW_HIDE, onlyMainWin);
}

export function show(p: matchParam, nCmdShow: CmdShow, onlyMainWin: boolean = true): Promise<void> {
    return proxy(p, nCmdShow, onlyMainWin);
}

// https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx
function proxy(p: matchParam, nCmdShow: CmdShow, onlyMainWin: boolean): Promise<void> {
    if ( ! validate_cmdshow(nCmdShow)) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        if (onlyMainWin) {
            get_main_hwnd(p).then(hWnd => {
                if (hWnd && typeof hWnd === 'number') {
                    _show(hWnd, nCmdShow, onlyMainWin).then(() => {
                        resolve();
                    });
                }
                resolve();
            });
        }
        else {
            get_hwnds(p).then(arr => {
                if (arr && arr.length) {
                    Promise.all(arr.map(hWnd => _show(hWnd, nCmdShow, onlyMainWin))).then(() => {
                        resolve();
                    });
                }
                resolve();
            });
        }
    });
}

function _show(hWnd: number, nCmdShow: CmdShow, onlyMainWin: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        const id = +hWnd;

        if (onlyMainWin &&  ! is_main_window(hWnd)) {
            return resolve();
        }
        nCmdShow = +nCmdShow;

        if ( ! id || Number.isNaN(id)) {
            console.error('_show() params hWnd invalid', hWnd);
            return resolve();
        }
        if (Number.isNaN(nCmdShow) || nCmdShow < 0) {
            console.error('_show() params nCmdShow invalid', nCmdShow);
            return resolve();
        }

        if (nCmdShow === 0) {
            if ( ! api.IsWindowVisible(id)) {   // skip if invisible
                return resolve();
            }
        }

        try {
            api.ShowWindow(id, nCmdShow);
        }
        catch(ex) {
            return reject(ex);
        }
        resolve();
    })
    .then(() => {
        console.log(`hWnd: ${hWnd} done`);
        return;
    })
    .catch(err => {
        err && console.error(err);
    });
}


export function get_hwnds(p: matchParam): Promise<number[] | void> {
    let t;

    return Promise.race([
        new Promise((resolve) => {
            t = setTimeout(() => {
                console.error('timeout failed');
                resolve();
            }, 30000); // @HARDCODED
        }),
        _get_hwnd(p),
    ]).then(res => {
        clearTimeout(t);
        if (res && Array.isArray(res) && res.length) {
            return res;
        }
    }).catch(err => {
        clearTimeout(t);
        processing = false;
        console.error(err);
    });
}

export function get_main_hwnd(p: matchParam): Promise<number | void> {
    return get_hwnds(p).then(arr => {
        if (arr && Array.isArray(arr) && arr.length) {
            return filter_main_hwnd(arr);
        }
    });
}

function _get_hwnd(p: matchParam): Promise<number[] | void> {

    if (processing) {
        return new Promise((resolve) => {
            setTimeout((p) => {
                // console.log('delay');
                resolve(_get_hwnd(p));
            }, 30, p);
        });
    }
    else {
        processing = true;
    }
    if (typeof p === 'number') {
        if ( ! Number.isSafeInteger(p)) {
            return Promise.resolve();
        }

        decProcId = p;
        matchTitle = '';
        return get_hwnd_by_pid(p)
            .then(res => {
                processing = false;
                return res;
            })
            .catch(err => {
                processing = false;
                console.error(err);
                return;
            });
    }
    else if (typeof p === 'string') {
        decProcId = 0;
        matchTitle = p;
        return get_hwnd_by_keyword()
            .then(res => {
                processing = false;
                return res;
            })
            .catch(err => {
                processing = false;
                console.error(err);
                return;
            });
    }
    else {
        console.error('param p invalid', p);
        return Promise.resolve();
    }
}

function get_hwnd_by_pid(pid: number): Promise<number[]> {
	return new Promise((resolve, reject) => {
		if ( ! isWin32) {
			reject(plateformError);
			return;
		}

        api.EnumWindows.async(enumWindowsProc, pid, (err) => {
            const res = Array.from(HWNDSet);

            HWNDSet.clear();
            resolve(res);
        });
	});
}

function get_hwnd_by_keyword(): Promise<number[]> {
	return new Promise((resolve, reject) => {
		if ( ! isWin32) {
			reject(plateformError);
			return;
		}

        api.EnumWindows.async(enumWindowsProc, 0, (err) => {
            const res = Array.from(HWNDSet);

            HWNDSet.clear();
            resolve(res);
        });
	});
}

// get hWnd of main top-level window
function filter_main_hwnd(arr: number[]): number | void {
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
function is_main_window(hWnd: number): boolean {
    const res = api.GetParent(hWnd);

    return res === null || res === 0 ? true : false;
}


const enumWindowsProc = ffi.Callback('bool', ['uint32', 'int'], (hWnd: number, lParam: number): boolean => {
    let pid = 0;

    if (decProcId > 0) {
        const buf = Buffer.alloc(8);

        api.GetWindowThreadProcessId(hWnd, buf);
        const hex = buf.readUIntLE(0, 8);

        if (hex && hex === decProcId) {
            HWNDSet.add(hWnd);
        }
    }
    else {
        if (matchTitle) {
            let buf, name, ret, visible;

            buf = Buffer.alloc(254);
            ret = api.GetWindowTextW(hWnd, buf, 254);
            name = buf.toString('ucs2');
            // visible = api.IsWindowVisible(hWnd);
            if (name.indexOf(matchTitle) !== -1) {
                const buf = Buffer.alloc(8);

                api.GetWindowThreadProcessId(hWnd, buf);
                killProcIdSet.add(buf.readUIntLE(0, 8));
                HWNDSet.add(hWnd);
                // console.log(`${hWnd}: ${name}`);
            }
        }
        else {  // all
            HWNDSet.add(hWnd);
        }
    }
    return true;
});

export function kill(p: matchParam): Promise<void> {
    return new Promise((resolve) => {
        get_main_hwnd(p).then(hWnd => {
            if (killProcIdSet.size) {
                try {
                    for (let pid of killProcIdSet) {
                        process.kill(pid, 0) && process.kill(pid);
                        console.log(`killed pid: ${pid}`);
                    }
                }
                catch(ex) {
                    console.error(ex);
                }
                resolve();
            }
        });
    });
}
