/// <reference types="node" />
/// <reference types="mocha" />

import {spawn, ChildProcess} from 'child_process';
import {basename, normalize} from 'path';
import * as ref from 'ref';
import * as assert from 'power-assert';
import * as sleep from 'mz-modules/sleep';
import * as nwwc from '../src/index';
import {conf as GCF, types as GT, windef as WD} from 'win32-api';

const filename = basename(__filename);
const Win = nwwc.Win;
const knl32 = Win.Kernel32.load();
const user32 = Win.User32.load();
const title = 'Node-Calculator';
const waitTimeLong = '3s';
const waitTime = '1s';

describe(filename, () => {

    describe('Should hide() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;

        beforeEach(async () => {
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTimeLong);
            hWnd = find_n_check_calc_win();
            assert(!!user32.IsWindowVisible(hWnd), 'beforeEach: window should visible');
            await sleep(waitTime);
        });
        afterEach(async () => {
            await sleep(waitTimeLong);
            child && child.kill();
            await sleep(waitTime);
        });

        it('--pid', async function() {
            try {
                await nwwc.hide(child.pid).then(async (execRet) => {
                    if (execRet.err) {
                        assert(false, execRet.msg);
                        return;
                    }
                    const res = !!user32.IsWindowVisible(hWnd);
                    assert(!res, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('--title', async function() {
            await nwwc.hide(title).then((execRet) => {
                if (execRet.err) {
                    assert(false, execRet.msg);
                    return;
                }
                const res = !!user32.IsWindowVisible(hWnd);
                assert(!res, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
            })
                .catch(err => {
                    assert(false, err);
                });
        });
    });

    describe('Should show() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;

        beforeEach(async () => {
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTimeLong);
            hWnd = find_n_check_calc_win();
            assert(!!user32.IsWindowVisible(hWnd), 'beforeEach: window should visible');
            await nwwc.hide(title);
            await sleep(waitTime);
            assert(!user32.IsWindowVisible(hWnd), 'beforeEach: window should invisible');
        });
        afterEach(async () => {
            child && child.kill();
            await sleep(waitTime);
        });

        it('--pid', async function() {
            try {
                await nwwc.show(child.pid, 9).then(async (execRet) => {
                    if (execRet.err) {
                        assert(false, execRet.msg);
                        return;
                    }
                    if (!execRet.hwnds.length) {
                        assert(false, 'processed hWnds are empty');
                        return;
                    }
                    await sleep(waitTimeLong);
                    assert(!!user32.IsWindowVisible(hWnd), 'window should visible');
                })
                .catch(err => {
                    assert(false, err);
                });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('--title', async function() {
            await nwwc.show(title, 9).then(async (execRet) => {
                if (execRet.err) {
                    assert(false, execRet.msg);
                    return;
                }
                if (!execRet.hwnds.length) {
                    assert(false, 'processed hWnds are empty');
                    return;
                }
                await sleep(waitTimeLong);
                assert(!! user32.IsWindowVisible(hWnd), 'window should visible');
            })
            .catch(err => {
                assert(false, err);
            });
        });
    });

    describe('Should showWindow() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;

        beforeEach(async () => {
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTimeLong);
            hWnd = find_n_check_calc_win();
            assert(!! user32.IsWindowVisible(hWnd), 'beforeEach: window should visible');
            await sleep(waitTime);
        });
        afterEach(async () => {
            child && child.kill();
            await sleep(waitTime);
        });

        it('restore by valid hWndDec', async function() {
            await nwwc.hide(title);
            await sleep(waitTime);
            await nwwc.default(ref.address(hWnd), 9).then(async () => {
                await sleep(waitTime);
                assert(!! user32.IsWindowVisible(hWnd), 'window should visible');
            })
            .catch(err => {
                assert(false, err);
            });
        });

        it('restore by invalid hWndDec', async function() {
            await nwwc.hide(title);
            await sleep(waitTime);
            await nwwc.default(0, 9).then(async () => {
                await sleep(waitTime);
                assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

        it('hide by valid hWndDec', async function() {
            await nwwc.default(ref.address(hWnd), 0).then(async () => {
                await sleep(waitTime);
                assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

        it('hide by invalid hWndDec', async function() {
            await nwwc.default(0, 0).then(() => {
                assert(!! user32.IsWindowVisible(hWnd), 'window should invisible now');
            })
                .catch(err => {
                    assert(false, err);
                });
        });
    });


    describe('Should retrieve_pointer_by_hwnd() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;

        beforeEach(async () => {
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTimeLong);
            hWnd = find_n_check_calc_win();
            assert(!!user32.IsWindowVisible(hWnd), 'beforeEach: window should visible');
            await sleep(waitTime);
        });
        afterEach(async () => {
            child && child.kill();
            await sleep(waitTime);
        });

        it('by valid hWndDec', async function() {
            const hWndDec = ref.address(hWnd);
            const hWnd2 = await nwwc.retrieve_pointer_by_hwnd(hWndDec);

            if (!hWnd2 || ref.isNull(hWnd2)) {
                assert(false, 'retrieved pointer is null');
            }
            else {
                assert(ref.address(hWnd2) === hWndDec);
            }
        });

        it('by invalid hWndDec', async function() {
            const hWnd2 = await nwwc.retrieve_pointer_by_hwnd(0);

            if (!hWnd2 || ref.isNull(hWnd2)) {
                assert(true);
            }
            else {
                assert(false, 'retrieved pointer should be null');
            }
        });
    });

});


function find_n_check_calc_win(): GT.HWND {
    const lpszClass = Buffer.from('CalcFrame\0', 'ucs2');
    const hWnd = user32.FindWindowExW(null, null, lpszClass, null);

    if (hWnd && !ref.isNull(hWnd) && ref.address(hWnd)) {
        assert(true);
        change_title(hWnd, title);
    }
    else {
        assert(false, 'found no calc window, GetLastError: ' + knl32.GetLastError());
    }
    return hWnd;
}


function change_title(hWnd: GT.HWND, title: string): void {
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
