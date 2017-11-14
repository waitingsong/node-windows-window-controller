/// <reference types="node" />
/// <reference types="mocha" />

import {spawn, ChildProcess} from 'child_process';
import {basename, normalize} from 'path';
import * as ref from 'ref';
import * as assert from 'power-assert';
import * as sleep from 'mz-modules/sleep';
import * as nwwc from '../src/index';
import {conf as GCF, types as GT, windef as WD, conf} from 'win32-api';
import * as Config from '../src/lib/types';

const filename = basename(__filename);
const Win = nwwc.Win;
const knl32 = Win.Kernel32.load();
const user32 = Win.User32.load();
const title = 'Node-Calculator';
const waitTimeLong = '3s';
const waitTime = '1s';
const UC = Win.User32.constants;

describe(filename, () => {
    describe('Should hide() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;
        let opts: Config.Opts;

        child = spawn('calc.exe');

        beforeEach(async () => {
            opts = <Config.Opts> {...Config.filterWinRulesDefaults};
            await sleep(waitTime);
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTime);
            hWnd = find_n_check_calc_win();
            assert(!!user32.IsWindowVisible(hWnd), 'beforeEach: window should visible');
            await sleep(waitTime);
        });
        afterEach(async () => {
            await sleep(waitTime);
            child && child.kill();
        });

        it('--pid', async function() {
            try {
                opts.matchType = 'pid';
                opts.matchValue = child.pid;

                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('--pid with titleExits true', async function() {
            opts.titleExits = true;    // win should processed by it
            opts.matchType = 'pid';
            opts.matchValue = child.pid;

            try {
                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('--pid with titleExists false', async function() {
            opts.titleExits = false;   // win should not processed by it
            opts.matchType = 'pid';
            opts.matchValue = child.pid;

            try {
                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('--pid with includeStyle:WS_SYSMENU', async function() {
            opts.includeStyle = UC.WS_SYSMENU;
            opts.matchType = 'pid';
            opts.matchValue = child.pid;

            try {
                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('--pid with excludeStyle:WS_SYSMENU', async function() {
            opts.excludeStyle = UC.WS_SYSMENU;
            opts.matchType = 'pid';
            opts.matchValue = child.pid;

            try {
                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('--pid with includeStyle:WS_VISIBLE', async function() {
            opts.includeStyle = UC.WS_VISIBLE; // win should processed by it
            opts.matchType = 'pid';
            opts.matchValue = child.pid;

            try {
                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert( ! visible, 'window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('--pid with excludeStyle:WS_VISIBLE', async function() {
            opts.excludeStyle = UC.WS_VISIBLE; // win should not processed by it
            opts.matchType = 'pid';
            opts.matchValue = child.pid;

            try {
                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert(visible, 'window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('--pid with includeExStyle:WS_EX_TOOLWINDOW', async function() {
            opts.includeExStyle = UC.WS_EX_TOOLWINDOW; // calculator has no style of WS_EX_TOOLWINDOW
            opts.matchType = 'pid';
            opts.matchValue = child.pid;

            try {
                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
                })
                    .catch(err => {
                        assert(false, err);
                    });
            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('--pid with excludeExStyle:WS_EX_TOOLWINDOW', async function() {
            opts.excludeExStyle = UC.WS_EX_TOOLWINDOW; // calculator has no style of WS_EX_TOOLWINDOW
            opts.matchType = 'pid';
            opts.matchValue = child.pid;

            try {
                await nwwc.hide(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    const visible = !!user32.IsWindowVisible(hWnd);
                    assert(! visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
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
            opts.matchType = 'title';
            opts.matchValue = title;

            await nwwc.hide(opts).then((execRet) => {
                assert_execret(execRet);
                const visible = !!user32.IsWindowVisible(hWnd);
                assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

        it('--title with titleExists true', async function() {
            opts.titleExits = true;
            opts.matchType = 'title';
            opts.matchValue = title;

            await nwwc.hide(opts).then((execRet) => {
                assert_execret(execRet);
                const visible = !!user32.IsWindowVisible(hWnd);
                assert( ! visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
            })
                .catch(err => {
                    assert(false, err);
                });
        });
        it('--title with titleExists false', async function() {
            opts.titleExits = false;
            opts.matchType = 'title';
            opts.matchValue = title;

            await nwwc.hide(opts).then((execRet) => {
                assert_execret(execRet);
                const visible = !!user32.IsWindowVisible(hWnd);
                assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
            })
                .catch(err => {
                    assert(false, err);
                });
        });
    });


    describe('Should show() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;
        let opts: Config.Opts;

        beforeEach(async () => {
            opts = <Config.Opts> {...Config.filterWinRulesDefaults};
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTime);
            hWnd = find_n_check_calc_win();
            assert(!!user32.IsWindowVisible(hWnd), 'beforeEach: window should visible');
            await nwwc.hide({...opts, matchType: 'title', matchValue: title});
            await sleep(waitTime);
            assert(!user32.IsWindowVisible(hWnd), 'beforeEach: window should invisible');
        });
        afterEach(async () => {
            child && child.kill();
            await sleep(waitTime);
        });

        it('--pid', async function() {
            opts.matchType = 'pid';
            opts.matchValue = child.pid;
            opts.nCmdShow = 9;

            try {
                await nwwc.show(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    if (!execRet.hwnds.length) {
                        assert(false, 'processed hWnds should not empty');
                    }
                    await sleep(waitTime);
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

        it('--pid with titleExits true', async function() {
            opts.titleExits = true;
            opts.matchType = 'pid';
            opts.matchValue = child.pid;
            opts.nCmdShow = 9;
            try {
                await nwwc.show(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    if (!execRet.hwnds.length) {
                        assert(false, 'processed hWnds should not empty');
                    }
                    await sleep(waitTime);
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
        it('--pid with titleExits false', async function() {
            opts.titleExits = false;
            opts.matchType = 'pid';
            opts.matchValue = child.pid;
            opts.nCmdShow = 9;

            try {
                await nwwc.show(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    await sleep(waitTime);
                    assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
                })
                .catch(err => {
                    assert(false, err);
                });
            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('--pid with titleExits null', async function() {
            opts.titleExits = null;  // should be overrided to true
            opts.matchType = 'pid';
            opts.matchValue = child.pid;
            opts.nCmdShow = 9;

            try {
                await nwwc.show(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    await sleep(waitTime);
                    assert(user32.IsWindowVisible(hWnd), 'window should visible');
                })
                .catch(err => {
                    assert(false, err);
                });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('--pid with includeStyle:WS_SYSMENU', async function() {
            opts.includeStyle = UC.WS_SYSMENU;
            opts.matchType = 'pid';
            opts.matchValue = child.pid;
            opts.nCmdShow = 9;

            try {
                await nwwc.show(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    if (!execRet.hwnds.length) {
                        assert(false, 'processed hWnds should not empty');
                    }
                    await sleep(waitTime);
                    assert(user32.IsWindowVisible(hWnd), 'window should visible');
                })
                .catch(err => {
                    assert(false, err);
                });
            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('--pid with excludeStyle:WS_SYSMENU', async function() {
            opts.excludeStyle = UC.WS_SYSMENU;
            opts.matchType = 'pid';
            opts.matchValue = child.pid;
            opts.nCmdShow = 9;

            try {
                await nwwc.show(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    // some hWnd has not WS_SYSMENU, so comment out
                    // if (execRet.hwnds.length) {
                    //     assert(false, 'processed hWnds should empty');
                    // }
                    await sleep(waitTime);
                    assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
                })
                .catch(err => {
                    assert(false, err);
                });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('--pid with includeStyle:WS_VISIBLE', async function() {
            opts.includeStyle = UC.WS_VISIBLE;    // not matched now
            opts.matchType = 'pid';
            opts.matchValue = child.pid;
            opts.nCmdShow = 9;

            try {
                await nwwc.show(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    await sleep(waitTime);
                    assert( ! user32.IsWindowVisible(hWnd), 'window should invisible');
                })
                .catch(err => {
                    assert(false, err);
                });
            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('--pid with excludeStyle:WS_VISIBLE', async function() {
            opts.excludeStyle = UC.WS_VISIBLE;    // matched now
            opts.matchType = 'pid';
            opts.matchValue = child.pid;
            opts.nCmdShow = 9;

            try {
                await nwwc.show(opts).then(async (execRet) => {
                    assert_execret(execRet);
                    await sleep(waitTime);
                    assert(user32.IsWindowVisible(hWnd), 'window should visible');
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
            opts.matchType = 'title';
            opts.matchValue = title;
            opts.nCmdShow = 9;

            await nwwc.show(opts).then(async (execRet) => {
                assert_execret(execRet);
                if (!execRet.hwnds.length) {
                    assert(false, 'processed hWnds are empty');
                }
                await sleep(waitTime);
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
        let opts: Config.Opts;

        beforeEach(async () => {
            opts = <Config.Opts> {...Config.filterWinRulesDefaults};
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTime);
            hWnd = find_n_check_calc_win();
            assert(!! user32.IsWindowVisible(hWnd), 'beforeEach: window should visible');
            await sleep(waitTime);
        });
        afterEach(async () => {
            child && child.kill();
            await sleep(waitTime);
        });

        it('restore by valid hWndDec', async function() {
            await nwwc.hide({...opts, matchType: 'title', matchValue: title});
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
            opts.matchType = 'title';
            opts.matchValue = title;
            await nwwc.hide(opts);
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
            await sleep(waitTime);
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

function assert_execret(execRet: Config.ExecRet): void {
    if (execRet.err) {
        assert(false, execRet.msg);
    }
}
