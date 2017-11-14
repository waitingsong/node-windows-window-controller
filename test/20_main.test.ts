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
import * as H from './helper';

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
        H.find_n_check_calc_win();

        beforeEach(async () => {
            opts = <Config.Opts> {...Config.filterWinRulesDefaults};
            await sleep(waitTime);
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTime);
            hWnd = H.find_n_check_calc_win();
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                H.assert_execret(execRet);
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
                H.assert_execret(execRet);
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
                H.assert_execret(execRet);
                const visible = !!user32.IsWindowVisible(hWnd);
                assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

        it('--hwnd by valid value', async function() {
            const hwnd = ref.address(hWnd);

            opts.matchType = 'hwnd';
            opts.matchValue = hwnd;
            opts.nCmdShow = 0;
            await nwwc.hide(opts).then(async () => {
                await sleep(waitTime);
                assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });
        it('--hwnd by invalid value', async function() {
            const hwnd = 0;

            opts.matchType = 'hwnd';
            opts.matchValue = hwnd;
            opts.nCmdShow = 0;
            await nwwc.hide(opts).then(() => {
                assert(!! user32.IsWindowVisible(hWnd), 'window should visible');
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
            hWnd = H.find_n_check_calc_win();
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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
                    H.assert_execret(execRet);
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


        it('--hwnd by valid value', async function() {
            const hwnd = ref.address(hWnd);

            opts.matchType = 'hwnd';
            opts.matchValue = hwnd;
            opts.nCmdShow = 2;
            await nwwc.show(opts).then(async () => {
                await sleep(waitTime);
                assert( !! user32.IsWindowVisible(hWnd), 'window should visible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });
        it('--hwnd by invalid value', async function() {
            const hwnd = 0;

            opts.matchType = 'hwnd';
            opts.matchValue = hwnd;
            opts.nCmdShow = 2;
            await nwwc.show(opts).then(() => {
                assert( ! user32.IsWindowVisible(hWnd), 'window should invisible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

        it('--title', async function() {
            opts.matchType = 'title';
            opts.matchValue = title;
            opts.nCmdShow = 9;

            await nwwc.show(opts).then(async (execRet) => {
                H.assert_execret(execRet);
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

    describe('Should retrieve_pointer_by_hwnd() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;

        beforeEach(async () => {
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTime);
            hWnd = H.find_n_check_calc_win();
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
