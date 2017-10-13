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
import * as Config from './lib/types';
import * as u32 from './lib/user32';

export {ExecRet} from './lib/types';
export {validate_cmdshow} from './lib/user32';


const isWin32: boolean = process.platform === 'win32';
const plateformError = 'Invalid platform: win32 required';

// expose original user32.ShowWindow() as default
export default function showWindow(hWnd: Config.Hwnd, nCmdShow: u32.CmdShow): Config.ErrCode {
    let errcode = 1;

    if ( ! Number.isSafeInteger(hWnd)) {
        console.error('hWnd must integer');
        return errcode;
    }
    if ( ! u32.validate_cmdshow(nCmdShow)) {
        return errcode;
    }

    try {
        if (u32.api.ShowWindow(hWnd, nCmdShow)) {
            errcode = 0;
        }
    }
    catch (ex) {
        console.error(ex);
    }

    return errcode;
}

export function hide(p: Config.matchParam, onlyMainWin: boolean = true): Promise<Config.ExecRet> {
    return proxy(p, u32.CmdShow.SW_HIDE, onlyMainWin);
}

export function show(p: Config.matchParam, nCmdShow: u32.CmdShow, onlyMainWin: boolean = true): Promise<Config.ExecRet> {
    return proxy(p, nCmdShow, onlyMainWin);
}

// https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx
function proxy(p: Config.matchParam, nCmdShow: u32.CmdShow, onlyMainWin: boolean): Promise<Config.ExecRet> {
    const execRet = init_execret();

    if ( ! u32.validate_cmdshow(nCmdShow)) {
        execRet.err = 1;
        execRet.msg = 'value of nCmdShow invalid';
        return Promise.resolve(execRet);
    }

    return new Promise(resolve => {
        if (onlyMainWin) {
            get_main_hwnd(p).then(hWnd => {
                if (hWnd && typeof hWnd === 'number') {
                    u32.show(hWnd, nCmdShow, onlyMainWin)
                        .then((hWnd) => {
                            hWnd && execRet.hwnds.push(hWnd);
                        })
                        .catch(err => {
                            execRet.err = 1;
                            execRet.msg += '\n ' + err;
                        })
                        .then(() => {
                            resolve();
                        });
                }
                else {
                    resolve();
                }
            });
        }
        else {
            get_hwnds(p).then(arr => {
                if (arr && arr.length) {
                    Promise.all(arr.map(hWnd => {
                        return u32.show(hWnd, nCmdShow, onlyMainWin)
                            .then((hWnd) => hWnd && execRet.hwnds.push(hWnd))
                            .catch(err => {
                                execRet.err = 1;
                                execRet.msg += '\n ' + err;
                            });
                    }))
                        .then(resolve);
                }
                else {
                    resolve();
                }
            });
        }
    }).then(() => execRet);
}


export function get_main_hwnd(p: Config.matchParam): Promise<number | void> {
    return get_hwnds(p).then(arr => {
        if (arr && Array.isArray(arr) && arr.length) {
            return u32.filter_main_hwnd(arr);
        }
    });
}


export function get_hwnds(p: Config.matchParam): Promise<number[] | void> {
    return u32.get_hwnds(p);
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

function _kill(pid: Config.Pid): boolean {
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
