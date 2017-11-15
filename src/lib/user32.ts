import * as ffi from 'ffi';
import * as ref from 'ref';
import {U, conf as GCF, types as GT, windef as W} from 'win32-api';
import * as Config from './types';
import * as H from './helper';

const user32 = U.load();


export interface TaskConfig {
    tno: Config.Tno;
    task: Map<Config.Tno, Config.Task>;
}

export const taskConfig: TaskConfig = {
    tno: 0,
    task: new Map(),
};


export const enumWindowsProc = ffi.Callback(
    W.BOOL, [W.HWND, W.LPARAM],
    (hWnd: GT.HWND, lParam: GT.LPARAM): boolean => { // stop loop if return false
        const task = taskConfig.task.get(<number> lParam);

        /* istanbul ignore if  */
        if (!task) {
            console.error('enumWindowsProc() task not exists');
            return true;
        }

        switch (task.matchType) {
            case 'pid': {
                const buf = ref.alloc(W.HINSTANCE);
                const tid = user32.GetWindowThreadProcessId(hWnd, buf);

                /* istanbul ignore else */ 
                if (tid) {
                    const pid = buf.readUInt32LE(0);

                    if (pid && pid === task.matchValue) {
                        // console.log('got by pid:', pid, 'hWnd:' + ref.address(hWnd), ref.address(hWnd).toString(16));
                        task.hwndSet.add(hWnd);
                    }
                }
                else {
                    const lastErrMsg = H.get_last_err_msg();

                    if (lastErrMsg) {
                        task.errMsg += ',' + lastErrMsg;
                    }
                }
                break;
            }

            case 'title':
                /* istanbul ignore else */ 
                if (task.matchValue) {
                    const buf = Buffer.alloc(254);
                    const len = user32.GetWindowTextW(hWnd, buf, 254);

                    if (len) {
                        const name = buf.toString('ucs2');
                        // const visible = user32.IsWindowVisible(hWnd);

                        if (name.indexOf(<string> task.matchValue) !== -1) {
                            const buf = Buffer.alloc(4);

                            user32.GetWindowThreadProcessId(hWnd, buf);
                            task.pidSet.add(buf.readUIntLE(0, 4));
                            task.hwndSet.add(hWnd);
                        }
                    }
                    else {
                        const lastErrMsg = H.get_last_err_msg();

                        if (lastErrMsg) {
                            task.errMsg += ',' + lastErrMsg;
                        }
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
            /* istanbul ignore next */
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


export function show_hide_one(hWnd: GT.HWND, nCmdShow: U.constants.CmdShow): Promise<void | GT.HWND> {
    return new Promise((resolve, reject) => {
        nCmdShow = +nCmdShow;
        // console.log('show_hide_one: ' + ref.address(hWnd) + ', cmd:' + nCmdShow);

        if (Number.isNaN(nCmdShow) || nCmdShow < 0) {
            return reject('show_hide_one() params nCmdShow invalid: ' + nCmdShow);
        }

        if (nCmdShow === 0) {
            if (!user32.IsWindowVisible(hWnd)) {   // skip if invisible
                return resolve();
            }
        }
        user32.ShowWindow(hWnd, nCmdShow);
        resolve(hWnd);
    });
}


export function task_get_hwnds(task: Config.Task): Promise<GT.HWND[] | void> {
    let t: NodeJS.Timer;

    return Promise.race([
        new Promise<void>(resolve => {
            t = setTimeout(() => {
                console.info('task_get_hwnds timeout failed');
                resolve();
            }, 30000); // @HARDCOD
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
        /* istanbul ignore next */
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
        if (!task) {
            resolve([]);
            return;
        }
        user32.EnumWindows.async(enumWindowsProc, task.tno, (err: any) => {
            // console.log('get_task_hwnd size:', task.hwndSet.size);
            if (task.errMsg) {
                console.error(task.errMsg);
            }
            resolve(Array.from(task.hwndSet) || []);
        });
    });
}


// get hWnd of main top-level window
export function filter_hwnd(arr: GT.HWND[], opts?: Config.Opts): GT.HWND[]{
    if (typeof opts === 'undefined') {
        return [...(new Set(arr).keys())];
    }
    else {
        opts = Object.assign({}, Config.filterWinRulesDefaults, opts);
        const ids = <Set<GT.HWND>> new Set();
        // console.log('filter_main_hwnd:', arr.length, ref.address(arr[0]));

        for (const hWnd of arr) {
            if (ids.has(hWnd)) {
                continue;
            }
            if (_filter_hwnd(hWnd, opts)) {
                ids.add(hWnd);
            }
        }
        // console.log('filter_main_hwnd return size', ids.size);
        return [...ids.keys()];
    }
}

/**
 * filter none top-level window
 * NOTE: not accurate, IME, MESSAGE windows not be filtered out
 */
function _filter_hwnd(hWnd: GT.HWND, opts: Config.Opts): GT.BOOLEAN {
    let p = user32.GetParent(hWnd);
    // const addr = ref.address(hWnd);
    //console.log('addr: ', addr + ':' + addr.toString(16));

    if ( ! ref.isNull(p)) {
        return false;
    }
    p = user32.GetWindow(hWnd, 4);  // GW_OWNER==4
    if ( ! ref.isNull(p)) {
        return false;
    }

    if ( ! validate_rule_title(hWnd, opts)) {
        return false;
    }
    if ( ! validate_rule_style(hWnd, opts)) {
        return false;
    }
    if ( ! validate_rule_exstyle(hWnd, opts)) {
        return false;
    }

    return true;
}

function validate_rule_title(hWnd: GT.HWND, opts: Config.Opts): GT.BOOLEAN {
    const buf = Buffer.alloc(100);
    user32.GetWindowTextW(hWnd, buf, 50);

    let title = ref.reinterpretUntilZeros(buf, 2).toString('ucs2');

    title && (title = title.trim());
    if (opts.titleExits === true) {
        return title ? true : false;
    }
    else if (opts.titleExits === false) {
        return title ? false : true;
    }

    return true;    // 'ignore'
}

function validate_rule_style(hWnd: GT.HWND, opts: Config.Opts): GT.BOOLEAN {
    const GWL_STYLE = -16;
    const dwStyle = GCF._WIN64
        ? user32.GetWindowLongPtrW(hWnd, GWL_STYLE)
        : user32.GetWindowLongW(hWnd, GWL_STYLE);
    //console.log('style:', dwStyle);

    // if (dwStyle <= 0) {
    //     return false;
    // }
    if (opts.includeStyle && Number.isSafeInteger(opts.includeStyle)) {
        if ((dwStyle | opts.includeStyle) !== dwStyle) {
            return false;
        }
    }
    if (opts.excludeStyle && Number.isSafeInteger(opts.excludeStyle)) {
        if ((dwStyle | opts.excludeStyle) === dwStyle) {
            return false;
        }
    }

    return true;
}

function validate_rule_exstyle(hWnd: GT.HWND, opts: Config.Opts): GT.BOOLEAN {
    const GWL_EXSTYLE = -20;
    const dwExStyle = GCF._WIN64
        ? user32.GetWindowLongPtrW(hWnd, GWL_EXSTYLE)
        : user32.GetWindowLongW(hWnd, GWL_EXSTYLE);
    // console.log('dwExstyle:' + dwExStyle);

    // if (dwExStyle <= 0) {
    //     return false;
    // }
    // if (dwExStyle && ((dwExStyle | WS_EX_TOOLWINDOW) === dwExStyle)) {
    //     return false;
    // }
    if (opts.includeExStyle && Number.isSafeInteger(opts.includeExStyle)) {
        if ((dwExStyle | opts.includeExStyle) !== dwExStyle) {
            return false;
        }
    }
    if (opts.excludeExStyle && Number.isSafeInteger(opts.excludeExStyle)) {
        if ((dwExStyle | opts.excludeExStyle) === dwExStyle) {
            return false;
        }
    }

    return true;
}

export function create_task(): Config.Task {
    const tno = ++taskConfig.tno;
    const task: Config.Task = {
        tno,
        matchType: null,
        matchValue: '',
        hwndSet: new Set(),
        pidSet: new Set(),
        errMsg: '',
    };

    taskConfig.task.set(tno, task);

    return task;
}
