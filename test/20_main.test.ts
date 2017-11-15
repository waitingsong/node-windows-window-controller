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
    // for run calc.exe first
    // describe('Should hide() works', () => {
    //     let child: ChildProcess;
    //     let hWnd: GT.HWND;
    //     let opts: Config.Opts;

    //     beforeEach(async () => {
    //         opts = <Config.Opts> {...Config.filterWinRulesDefaults};
    //         await sleep(waitTime);
    //         child && child.kill();
    //         child = spawn('calc.exe');
    //         await sleep(waitTimeLong);      // for first long time loading
    //         hWnd = H.find_n_check_calc_win();
    //         await sleep(waitTime);
    //     });
    //     afterEach(async () => {
    //         await sleep(waitTime);
    //         child && child.kill();
    //         await sleep(waitTime);
    //     });

    //     it('--title', async function() {
    //         opts.matchType = 'title';
    //         opts.matchValue = title;
    //         const execRet = await nwwc.hide(opts);

    //         H.assert_execret(execRet);
    //         const visible = !!user32.IsWindowVisible(hWnd);
    //         assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"');
    //     });

    // });

    // describe('Should retrieve_pointer_by_hwnd() works', () => {
    //     let child: ChildProcess;
    //     let hWnd: GT.HWND;

    //     beforeEach(async () => {
    //         child && child.kill();
    //         child = spawn('calc.exe');
    //         await sleep(waitTime);
    //         hWnd = H.find_n_check_calc_win();
    //         await sleep(waitTime);
    //     });
    //     afterEach(async () => {
    //         await sleep(waitTime);
    //         child && child.kill();
    //         await sleep(waitTime);
    //     });

    //     it('by valid hWndDec', async function() {
    //         const hWndDec = ref.address(hWnd);
    //         const hWnd2 = await nwwc.retrieve_pointer_by_hwnd(hWndDec);

    //         if (!hWnd2 || ref.isNull(hWnd2)) {
    //             assert(false, 'retrieved pointer is null');
    //         }
    //         else {
    //             assert(ref.address(hWnd2) === hWndDec);
    //         }
    //     });

    //     it('by invalid hWndDec', async function() {
    //         const hWnd2 = await nwwc.retrieve_pointer_by_hwnd(0);

    //         if (!hWnd2 || ref.isNull(hWnd2)) {
    //             assert(true);
    //         }
    //         else {
    //             assert(false, 'retrieved pointer should be null');
    //         }
    //     });
    // });

    // describe('Should get_hwnds() works', () => {
    //     let child: ChildProcess;
    //     let hWnd: GT.HWND;
    //     let opts: Config.Opts;

    //     beforeEach(async () => {
    //         opts = <Config.Opts> {...Config.filterWinRulesDefaults};
    //         await sleep(waitTime);
    //         child && child.kill();
    //         child = spawn('calc.exe');
    //         await sleep(waitTime);
    //         hWnd = H.find_n_check_calc_win();
    //         await sleep(waitTime);
    //     });
    //     afterEach(async () => {
    //         await sleep(waitTime);
    //         child && child.kill();
    //         await sleep(waitTime);
    //     });

    //     it('should find hWnd', async function() {
    //         try {
    //             opts.matchType = 'title';
    //             opts.matchValue = title;
    //             const arr = await nwwc.get_hwnds(opts);
    //             const hWndDec = ref.address(hWnd);

    //             H.assert_get_hwnds(hWndDec, arr);
    //         }
    //         catch (ex) {
    //             assert(false, ex);
    //         }
    //     });

    //     it('should find empty hWnd', async function() {
    //         try {
    //             opts.matchType = 'title';
    //             opts.matchValue = 'title-not-exists';
    //             const arr = await nwwc.get_hwnds(opts);
    //             const hWndDec = ref.address(hWnd);

    //             H.assert_get_hwnds(hWndDec, arr, true);
    //         }
    //         catch (ex) {
    //             assert(false, ex);
    //         }
    //     });
    // });

    // describe('Should kill() works', () => {
    //     let child: ChildProcess;
    //     let hWnd: GT.HWND;
    //     let opts: Config.Opts;

    //     beforeEach(async () => {
    //         opts = <Config.Opts> {...Config.filterWinRulesDefaults};
    //         await sleep(waitTime);
    //         child && child.kill();
    //         child = spawn('calc.exe');
    //         await sleep(waitTime);
    //         hWnd = H.find_n_check_calc_win();
    //         await sleep(waitTime);
    //     });
    //     afterEach(async () => {
    //         await sleep(waitTime);
    //         child && child.kill();
    //         await sleep(waitTime);
    //     });

    //     it('by valid pid', async function() {
    //         opts.matchType = 'pid';
    //         opts.matchValue = child.pid;

    //         try {
    //             const execRet = await nwwc.kill(opts);

    //             H.assert_execret(execRet);
    //             if ( ! execRet.pids || ! execRet.pids.length) {
    //                 assert(false, 'should window pid matched');
    //             }
    //         }
    //         catch (ex) {
    //             assert(false, ex);
    //         }
    //     });
    //     it('by invalid pid', async function() {
    //         opts.matchType = 'pid';
    //         opts.matchValue = 0;

    //         try {
    //             const execRet = await nwwc.kill(opts);

    //             H.assert_execret(execRet, true);
    //             if (execRet.hwnds && execRet.hwnds.length) {
    //                 assert(false, 'should none window title matched');
    //             }
    //         }
    //         catch (ex) {
    //             assert(false, ex);
    //         }
    //     });

    //     it('by valid title', async function() {
    //         opts.matchType = 'title';
    //         opts.matchValue = title;

    //         try {
    //             const execRet = await nwwc.kill(opts);

    //             H.assert_execret(execRet);
    //             if ( ! execRet.pids || ! execRet.pids.length) {
    //                 assert(false, 'should window title matched');
    //             }
    //         }
    //         catch (ex) {
    //             assert(false, ex);
    //         }
    //     });
    //     it('by fake title', async function() {
    //         opts.matchType = 'title';
    //         opts.matchValue = 'title-not-exists';

    //         try {
    //             const execRet = await nwwc.kill(opts);

    //             H.assert_execret(execRet);    // no err
    //             if (execRet.pids && execRet.pids.length) {
    //                 assert(false, 'should none window title matched');
    //             }
    //         }
    //         catch (ex) {
    //             assert(false, ex);
    //         }
    //     });

    //     it('by hwnd not support', async function() {
    //         opts.matchType = 'hwnd';
    //         opts.matchValue = ref.address(hWnd);

    //         try {
    //             H.assert_execret(await nwwc.kill(opts), true);
    //         }
    //         catch (ex) {
    //             assert(false, ex);
    //         }
    //     });

    // });

    describe('Should set_title() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;
        let opts: Config.Opts;
        const newTitle = 'new-node-calculator';

        beforeEach(async () => {
            opts = <Config.Opts> {...Config.filterWinRulesDefaults};
            await sleep(waitTime);
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTime);
            hWnd = H.find_n_check_calc_win();
            await sleep(waitTime);
        });
        afterEach(async () => {
            await sleep(waitTime);
            child && child.kill();
            await sleep(waitTime);
        });

        it('matched by pid', async function() {
            try {
                opts.matchType = 'pid';
                opts.matchValue = child.pid;

                await nwwc.set_title(newTitle, opts);
                const arr = await nwwc.get_hwnds({matchType: 'title', matchValue: newTitle });
                const hWndDec = ref.address(hWnd);

                H.assert_get_hwnds(hWndDec, arr);
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('matched by title', async function() {
            try {
                opts.matchType = 'title';
                opts.matchValue = title;

                await nwwc.set_title(newTitle, opts);
                const arr = await nwwc.get_hwnds({...opts, matchValue: newTitle });
                const hWndDec = ref.address(hWnd);

                H.assert_get_hwnds(hWndDec, arr);
            }
            catch (ex) {
                assert(false, ex);
            }
        });

        it('matched by hwnd', async function() {
            try {
                opts.matchType = 'hwnd';
                opts.matchValue = ref.address(hWnd);

                await nwwc.set_title(newTitle, opts);
                const arr = await nwwc.get_hwnds({matchType: 'title', matchValue: newTitle });
                const hWndDec = ref.address(hWnd);

                H.assert_get_hwnds(hWndDec, arr);
            }
            catch (ex) {
                assert(false, ex);
            }
        });
    });

});
