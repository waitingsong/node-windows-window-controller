/**
 * node-windows-window-controller
 *
 * @author waiting
 * @license MIT
 * @link https://github.com/waitingsong/node-windows-window-controller
 */

/// <reference types="node" />

import * as ffi from 'ffi';
import * as ref from 'ref';
import * as Win from 'win32-api';
import {K, U, types as GT} from 'win32-api';
import * as Config from './lib/types';
import * as u32 from './lib/user32';

export {Win};
export {Config};
export {ExecRet} from './lib/types';
export {validate_cmdshow} from './lib/user32';

const isWin32: boolean = process.platform === 'win32';
const plateformError = 'Invalid platform: win32 required';
const user32 = U.load();

// hide the window(s)
export function hide(options: Config.Opts): Promise<Config.ExecRet> {
    const opts: Config.Opts = Object.assign({}, Config.filterWinRulesDefaults, options);
    opts.nCmdShow = U.constants.CmdShow.SW_HIDE;
    return proxy(opts);
}

// show or hide the window(s)
export function show(options: Config.Opts): Promise<Config.ExecRet> {
    const opts: Config.Opts = Object.assign({}, Config.showFilterRulesDefaults, options);

    if ( ! opts || (opts.titleExits === null || typeof opts.titleExits !== 'boolean')) {
        opts.titleExits = true;
    }
    return proxy(opts);
}

// https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx
function proxy(opts: Config.Opts): Promise<Config.ExecRet> {
    const execRet = init_execret();

    if ( ! u32.validate_cmdshow(opts.nCmdShow)) {
        execRet.err = 1;
        execRet.msg = 'value of nCmdShow invalid';
        return Promise.resolve(execRet);
    }

    return get_hwnds(opts).then(hWnds => {
            if (hWnds && hWnds.length) {
                for (const hWnd of hWnds) {
                    if (hWnd && !ref.isNull(hWnd)) {
                        // console.log('hWnd addr:', ref.address(hWnd));
                        u32.show_hide_one(hWnd, opts.nCmdShow)
                            .then((hWnd) => hWnd && !ref.isNull(hWnd) && execRet.hwnds.push(ref.address(hWnd)))
                            .catch((err: Error) => {
                                execRet.err = 1;
                                execRet.msg += '\n ' + err;
                            });
                    }
                }
            }
        })
        .catch(err => {
            execRet.err = 1;
            execRet.msg += err.toString();
        })
        .then(() => execRet);
}


/**
 * retrieve hWnds by matchValue matched by pid|title
 */
export function get_hwnds(opts: Config.Opts): Promise<GT.HWND[] | void> {
    // console.log('opts:', opts);
    const task = u32.create_task();

    task.matchType = opts.matchType;
    task.matchValue = opts.matchValue;

    return u32.task_get_hwnds(task)
        .then((arr: GT.HWND[] | void) => {
            if (arr && Array.isArray(arr) && arr.length) {
                return u32.filter_hwnd(arr, opts);
            }
        });
}


// kill process matched by pid|title, ExecRet.pids contains processed pid
export function kill(opts: Config.Opts): Promise<Config.ExecRet> {
    const execRet = init_execret();

    if (opts.matchType === 'pid') {
        const pid = +opts.matchValue;

        if (pid <= 0) {
            execRet.err = 1;
            execRet.msg = 'pid value invalid';
            return Promise.resolve(execRet);
        }

        _kill(pid);
        execRet.pids.push(pid);
        return Promise.resolve(execRet);
    }
    else if (opts.matchType === 'title') {
        return new Promise(resolve => {
            const task = u32.create_task();

            task.matchType = opts.matchType;
            task.matchValue = opts.matchValue;

            return u32.task_get_hwnds(task).then(() => {
                if (task.pidSet.size) {
                    for (let pid of task.pidSet) {
                        if (_kill(pid)) {
                            execRet.pids.push(pid);
                        }
                    }
                }
                else {
                    execRet.msg = 'the pid list to be killed empty, none title matched';
                }
                resolve(execRet);
            });
        });
    }
    else {
        execRet.err = 1;
        execRet.msg = 'kill() matchType invalid';
        return Promise.resolve(execRet);
    }
}

function _kill(pid: GT.PID): boolean {
    try {
        process.kill(pid, 0) && process.kill(pid);
        return true;
    }
    catch (ex) {
        console.error(ex);
    }
    return false;
}

function init_execret(): Config.ExecRet {
    return {
        err: 0,
        msg: '',
        pids: [],
        hwnds: [],
    };
}

// retrive hWnd buffer from decimal/hex value of hWnd
export function retrieve_pointer_by_hwnd(hwnd: Config.Hwnd): Promise<void | GT.HWND> {
    const task = u32.create_task();

    task.matchType = 'hwnd';
    task.matchValue = hwnd;

    return u32.task_get_hwnds(task)
        .then(arr => {
            if (arr && arr.length) {
                return arr[0];
            }
        });
}

export function parse_cli_opts(argv: Config.CliOpts): void | Config.Opts {
    const opts = <Config.Opts> Object.assign({}, Config.showFilterRulesDefaults);

    if (argv.pid) {
        opts.matchType = 'pid';
        opts.matchValue = +argv.pid;
    }
    else if (argv.title) {
        opts.matchType = 'title';
        opts.matchValue = argv.title;
    }
    else if (argv.hwnd) {
        opts.matchType = 'hwnd';
        opts.matchValue = argv.hwnd;
    }
    else {
        return;
    }

    if (typeof argv.status !== 'undefined') {
        opts.nCmdShow = +argv.status;
        console.assert(typeof opts.nCmdShow === 'number', 'nCmdShow must typeof number');
    }

    return opts;
}

// user32.SetWindowTextW()
export function set_title(title: string, opts: Config.Opts): Promise<Config.ExecRet> {
    const execRet = init_execret();

    return get_hwnds(opts).then(hWnds => {
        const buf = Buffer.from(title.trim() + '\0', 'ucs2');

        if (hWnds && hWnds.length) {
            for (const hWnd of hWnds) {
                if (hWnd && !ref.isNull(hWnd)) {
                    user32.SetWindowTextW(hWnd, buf);
                    execRet.hwnds.push(ref.address(hWnd));
                }
            }
        }
    })
        .catch(err => {
            execRet.err = 1;
            execRet.msg += err.toString();
        })
        .then(() => execRet);

}

export default show;