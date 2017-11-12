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
export {ExecRet} from './lib/types';
export {validate_cmdshow} from './lib/user32';

const isWin32: boolean = process.platform === 'win32';
const plateformError = 'Invalid platform: win32 required';
const user32 = U.load();


// expose original user32.ShowWindow() as default
export default function showWindow(hwnd: Config.Hwnd, nCmdShow: U.constants.CmdShow): Promise<Config.ErrCode> {
    let errcode = 1;
    hwnd = +hwnd;

    if (typeof hwnd !== 'number' || ! Number.isSafeInteger(hwnd)) {
        console.error('hwnd must integer');
        return Promise.resolve(errcode);
    }
    if (hwnd <= 0) {
        return Promise.resolve(errcode);
    }
    if ( ! u32.validate_cmdshow(nCmdShow)) {
        return Promise.resolve(errcode);
    }

    return retrieve_pointer_by_hwnd(hwnd)
        .then(hWnd => {
            if (hWnd && ! ref.isNull(hWnd)) {
                if (user32.ShowWindow(hWnd, nCmdShow)) {
                    errcode = 0;
                }
            }
            return errcode;
        })
        .catch((err: Error) => {
            return errcode;
        });
}

export function hide(p: Config.matchParam, filterWinRules?: Config.FilterWinRules): Promise<Config.ExecRet> {
    const rules = Object.assign({}, Config.filterWinRulesDefaults, filterWinRules);
    return proxy(p, U.constants.CmdShow.SW_HIDE, rules);
}

export function show(p: Config.matchParam, nCmdShow: U.constants.CmdShow, filterWinRules?: Config.FilterWinRules): Promise<Config.ExecRet> {
    const rules = Object.assign({}, Config.showFilterRulesDefaults, filterWinRules);
    return proxy(p, nCmdShow, rules);
}

// https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx
function proxy(p: Config.matchParam, nCmdShow: U.constants.CmdShow, rules: Config.FilterWinRules): Promise<Config.ExecRet> {
    const execRet = init_execret();

    if ( ! u32.validate_cmdshow(nCmdShow)) {
        execRet.err = 1;
        execRet.msg = 'value of nCmdShow invalid';
        return Promise.resolve(execRet);
    }

    return get_hwnds(p, rules).then(hWnds => {
            if (hWnds && hWnds.length) {
                for (const hWnd of hWnds) {
                    if (hWnd && !ref.isNull(hWnd)) {
                        // console.log('hWnd addr:', ref.address(hWnd));
                        u32.show_hide_one(hWnd, nCmdShow)
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
export function get_hwnds(p: Config.matchParam, rules?: Config.FilterWinRules): Promise<GT.HWND[] | void> {
    if ( ! rules) {
        return u32.get_hwnds(p);
    }
    else {
        return u32.get_hwnds(p)
            .then((arr: GT.HWND[] | void) => {
                if (arr && Array.isArray(arr) && arr.length) {
                    return u32.filter_hwnd(arr, rules);
                }
            });
    }
}


// kill process by which the matched hWnd(s) (window) created
export function kill(p: Config.matchParam): Promise<Config.ExecRet> {
    const execRet = init_execret();

    if (typeof p === 'number') {
        _kill(p);
        execRet.pids.push(p);
        return Promise.resolve(execRet);
    }
    else if (typeof p === 'string') {
        return new Promise(resolve => {
            const task = u32.create_task();

            return u32.get_hwnds(p, task).then(() => {
                if (task.pidSet.size) {
                    for (let pid of task.pidSet) {
                        if (_kill(pid)) {
                            execRet.pids.push(pid);
                        }
                    }
                }
                else {
                    execRet.msg = 'the pid list to be killed empty';
                }
                resolve(execRet);
            });
        });
    }
    else {
        execRet.err = 1;
        execRet.msg = 'kill() param must be either number or string';
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
    return u32.get_hwnds(hwnd, task)
        .then(arr => {
            if (arr && arr.length) {
                return arr[0];
            }
        });
}
