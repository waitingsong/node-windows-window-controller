import * as ffi from 'ffi';
import * as ref from 'ref';
import {U, conf as GCF, types as GT, windef as W} from 'win32-api';
import * as Config from './types';

const user32 = U.load();

const isWin32: boolean = process.platform === 'win32';
const plateformError = 'Invalid platform: win32 required';


export interface TaskConfig {
    tno: Config.Tno;
    task: Map<Config.Tno, Config.Task>;
}

export const taskConfig: TaskConfig = {
    tno: 0,
    task: new Map(),
};


// stop loop if return false
export const enumWindowsProc = ffi.Callback(
    W.BOOL, [W.HWND, W.LPARAM],
    (hWnd: GT.HWND, lParam: GT.LPARAM): boolean => {
        const task = taskConfig.task.get(<number> lParam);

        if (!task) {
            return true;
        }

        switch (task.matchType) {
            case 'pid': {
                const buf = ref.alloc(W.HINSTANCE);

                user32.GetWindowThreadProcessId(hWnd, buf);
                const pid = buf.readUInt32LE(0);

                if (pid && pid === task.matchValue) {
                    task.hwndSet.add(hWnd);
                }
                break;
            }

            case 'title':
                if (task.matchValue) {
                    const buf = Buffer.alloc(254);
                    const ret = user32.GetWindowTextW(hWnd, buf, 254);
                    const name = buf.toString('ucs2');
                    // const visible = user32.IsWindowVisible(hWnd);

                    if (name.indexOf(<string> task.matchValue) !== -1) {
                        const buf = Buffer.alloc(4);

                        user32.GetWindowThreadProcessId(hWnd, buf);
                        task.pidSet.add(buf.readUIntLE(0, 4));
                        task.hwndSet.add(hWnd);
                    }
                }
                else {  // all
                    task.hwndSet.add(hWnd);
                }
                break;

            case 'hwnd':
                if (+task.matchValue === ref.address(hWnd)) {
                    task.hwndSet.add(hWnd);
                }
                break;

            default:
                return true;
        }

        return true;
    }
);

export function validate_cmdshow(nCmdShow: U.constants.CmdShow): boolean {
    const res = (nCmdShow < 0) ? false : true;

    if (!res) {
        console.error('hWnd value invalid: See: https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx');
    }
    return res;
}


export function show(hWnd: GT.HWND, nCmdShow: U.constants.CmdShow, onlyMainWin: GT.BOOLEAN): Promise<void | GT.HWND> {
    return new Promise((resolve, reject) => {
        if (onlyMainWin && !is_main_window(hWnd)) {
            return resolve();
        }
        nCmdShow = +nCmdShow;

        if (Number.isNaN(nCmdShow) || nCmdShow < 0) {
            return reject('show() params nCmdShow invalid: ' + nCmdShow);
        }

        if (nCmdShow === 0) {
            if (!user32.IsWindowVisible(hWnd)) {   // skip if invisible
                return resolve();
            }
        }

        try {
            user32.ShowWindow(hWnd, nCmdShow);
        }
        catch (ex) {
            return reject(ex);
        }
        resolve(hWnd);
    });
}


export function get_hwnds(p: Config.matchParam, task?: Config.Task): Promise<GT.HWND[] | void> {
    if (!task) {
        task = create_task();
    }
    task.matchValue = p;
    let t: NodeJS.Timer;

    return Promise.race([
        new Promise<void>(resolve => {
            t = setTimeout(() => {
                console.error('timeout failed');
                resolve();
            }, 10000); // @HARDCOD
        }),
        _get_hwnds(task),
    ]).then((res: void | GT.HWND[]) => {
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

function _get_hwnds(task: Config.Task): Promise<GT.HWND[] | void> {
    if (task.matchType === null) {
        if (typeof task.matchValue === 'string') {
            task.matchType = 'title';
        }
        else if (typeof task.matchValue === 'number') { // hwnd must be specified explicitly
            task.matchType = 'pid';
        }
    }
    switch (task.matchType) {
        case 'pid':
            if (!Number.isSafeInteger(<number> task.matchValue)) {
                return Promise.resolve();
            }
            break;
        case 'title':
            // void
            break;
        case 'hwnd':
            // void
            break;
        default:
            throw new Error('task.matchType value invalid');
    }
    return get_task_hwnd(task)
        .then(res => {
            return res;
        })
        .catch(err => {
            console.error(err);
            return;
        });
}


function get_task_hwnd(task: Config.Task): Promise<GT.HWND[]> {
    return new Promise((resolve, reject) => {
        if (!isWin32) {
            reject(plateformError);
            return;
        }

        if (!task) {
            return resolve([]);
        }
        user32.EnumWindows.async(enumWindowsProc, task.tno, (err: any) => {
            resolve(Array.from(task.hwndSet) || []);
        });
    });
}



// get hWnd of main top-level window
export function filter_main_hwnd(arr: GT.HWND[]): GT.HWND[] | void {
    const res = new Set();
    const ids = <Set<GT.HWND>> new Set();
    // console.log('filter_main_hwnd:', arr.length, ref.address(arr[0]));

    for (const hWnd of arr) {
        // const ownerHWnd = user32.GetAncestor(hWnd, 3);

        // if (! ownerHWnd || ref.isNull(ownerHWnd) || ref.address(ownerHWnd) === ref.address(hWnd)) {  // hWnd is top window
        //     ids.add(hWnd);
        // }
        if (is_main_window(hWnd)) {
            ids.add(hWnd);
        }
    }

    if (ids.size === 1) {
        const [hWnd] = ids.keys();

        return [hWnd];
    }
    else if (ids.size > 1) {
        return [...ids.keys()];
    }
}

// check hWnd is own window not child window
export function is_main_window(hWnd: GT.HWND): GT.BOOLEAN {
    const p = user32.GetParent(hWnd);

    return !p || ref.isNull(p) ? true : false;
}

export function create_task(): Config.Task {
    const tno = ++taskConfig.tno;
    const task: Config.Task = {
        tno,
        matchType: null,
        matchValue: '',
        hwndSet: new Set(),
        pidSet: new Set(),
    };

    taskConfig.task.set(tno, task);

    return task;
}
