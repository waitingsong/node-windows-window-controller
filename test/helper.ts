/// <reference types="node" />
/// <reference types="mocha" />

import {spawn, ChildProcess} from 'child_process';
import {basename, normalize} from 'path';
import * as ref from 'ref';
import * as assert from 'power-assert';
import * as nwwc from '../src/index';
import {conf as GCF, types as GT} from 'win32-api';
import * as Config from '../src/lib/types';
import {reverse} from 'dns';

const Win = nwwc.Win;
const knl32 = Win.Kernel32.load();
const user32 = Win.User32.load();
const title = 'Node-Calculator';
const waitTimeLong = '3s';
const waitTime = '1s';
const UC = Win.User32.constants;


export function find_n_check_calc_win(): GT.HWND {
    const lpszClass = Buffer.from('CalcFrame\0', 'ucs2');
    const hWnd = user32.FindWindowExW(null, null, lpszClass, null);

    if (hWnd && !ref.isNull(hWnd) && ref.address(hWnd)) {
        assert(true);
        change_title(hWnd, title);
        assert(!!user32.IsWindowVisible(hWnd), 'find_n_check_calc_win: window should visible');
    }
    else {
        assert(false, 'found no calc window, GetLastError: ' + knl32.GetLastError());
    }
    return hWnd;
}


export function change_title(hWnd: GT.HWND, title: string): void {
    if (hWnd && !ref.isNull(hWnd) && ref.address(hWnd)) {
        const res = user32.SetWindowTextW(hWnd, Buffer.from(title + '\0', 'ucs2'));

        if (!res) {
            // See: [System Error Codes] below
            const errcode = knl32.GetLastError();
            const len = 255;
            const buf = Buffer.alloc(len);
            const p = 0x00001000 | 0x00000200;  // FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS
            const langid = 0x0409;              // 0x0409: US, 0x0000: Neutral locale language
            const msglen = knl32.FormatMessageW(p, null, errcode, langid, buf, len, null);

            if (msglen) {
                const errmsg = ref.reinterpretUntilZeros(buf, 2).toString('ucs2');
                assert(false, `window found but change the title failed. errcode: ${errcode}, errmsg: "${errmsg}"`);
            }
        }
        else {
            const len = title.length;
            const buf = Buffer.alloc(len * 3);
            let str: string;

            user32.GetWindowTextW(hWnd, buf, len + 2);
            str = buf.toString('ucs2').slice(0, len);
            assert(str === title.trim(), `title should be changed to ${title} in length:${title.length}, bug got ${str} in length:${str.length}`);
        }
    }
    else {
        assert(false, 'found no calc window, GetLastError: ' + knl32.GetLastError());
    }

}

export function assert_execret(execRet: Config.ExecRet, revert?: boolean): void {
    revert = !! revert;
    if (execRet.err) {
        assert(revert, execRet.msg);
    }
    else {
        assert( ! revert, execRet.msg);
    }
}

export function assert_get_hwnds(hWndDec: number, arr: void | GT.HWND[], revert?: boolean): void {
    revert = !! revert;

    if (arr && arr.length) {
        for (const h of arr) {
            if (ref.address(h) === hWndDec) {   // compare with decimal, not Buffer!
                assert(! revert);
                return;
            }
        }
        assert(revert, 'return array of hWnd not matched the hWnd');
    }
    else {
        assert(revert, 'found none hWnd');
    }
}
