/// <reference types="node" />
/// <reference types="mocha" />

import {spawn, ChildProcess} from 'child_process';
import {basename, normalize} from 'path';
import * as ref from 'ref';
import * as assert from 'power-assert';
import {fail} from 'assert';
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

});
