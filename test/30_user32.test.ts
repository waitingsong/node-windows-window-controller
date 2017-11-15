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
import * as u32 from '../src/lib/user32';
import * as H from './helper';
import {assert_execret} from './helper';

const filename = basename(__filename);
const Win = nwwc.Win;
const knl32 = Win.Kernel32.load();
const user32 = Win.User32.load();
const title = 'Node-Calculator';
const waitTimeLong = '3s';
const waitTime = '1s';
const UC = Win.User32.constants;


describe(filename, () => {
    describe('Should validate_cmdshow() works', () => {
        it('by positive value', function() {
            assert(u32.validate_cmdshow(0));
        });

        it('by negative value', function() {
            assert( ! u32.validate_cmdshow(-1));
        });
    });

    describe('Should create_task() works', () => {
        it('check task value', function() {
            const task = u32.create_task();

            task || assert(false, 'task value invalid');
            task.tno > 0 || assert(false, 'task.tno should positive value');
            assert(task.matchType === null, 'task.matchType should null');
            assert(task.matchValue === '', 'task.matchValue should empty string');
            assert(task.hwndSet && ! task.hwndSet.size);
            assert(task.pidSet && ! task.pidSet.size);

        });

    });

    describe('Should show_hide_one() hide works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;
        let opts: Config.Opts;

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

        it('by valid hwnd value', async function() {
            await u32.show_hide_one(hWnd, 0).then(async () => {
                await sleep(waitTime);
                assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

        it('by invalid hwnd value', async function() {
            await u32.show_hide_one(ref.alloc(WD.HWND), 0).then(async () => {
                assert(!!user32.IsWindowVisible(hWnd), 'window should still visible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

        it('by invalid nCmdShow value', async function() {
            await u32.show_hide_one(ref.alloc(WD.HWND), -1).then(async () => {
                assert(false, 'should reject');
            })
                .catch(err => {
                    assert(true);
                });
        });
    });

    describe('Should show_hide_one() show works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;
        let opts: Config.Opts;

        beforeEach(async () => {
            opts = <Config.Opts> {...Config.filterWinRulesDefaults};
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTime);
            hWnd = H.find_n_check_calc_win();
            await nwwc.hide({...opts, matchType: 'title', matchValue: title});
            await sleep(waitTime);
            assert(!user32.IsWindowVisible(hWnd), 'beforeEach: window should invisible');
        });
        afterEach(async () => {
            await sleep(waitTime);
            child && child.kill();
            await sleep(waitTime);
        });


        it('by valid hwnd value', async function() {
            await u32.show_hide_one(hWnd, 2).then(async () => {
                await sleep(waitTime);
                assert(!!user32.IsWindowVisible(hWnd), 'window should visible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

        it('by invalid hwnd value', async function() {
            await u32.show_hide_one(ref.alloc(WD.HWND), 2).then(async () => {
                assert(!user32.IsWindowVisible(hWnd), 'window should still invisible');
            })
                .catch(err => {
                    assert(false, err);
                });
        });

    });

    describe('Should task_get_hwnds() works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;
        let opts: Config.Opts;

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
            const task = u32.create_task();
            const hWndDec = ref.address(hWnd);

            task.matchType = 'pid';
            task.matchValue = child.pid;
            const arr = await u32.task_get_hwnds(task);

            H.assert_get_hwnds(hWndDec, arr);
        });

        it('matched by title', async function() {
            const task = u32.create_task();
            const hWndDec = ref.address(hWnd);

            task.matchType = 'title';
            task.matchValue = title;
            const arr = await u32.task_get_hwnds(task);

            H.assert_get_hwnds(hWndDec, arr);
        });

        it('matched by hWndDec', async function() {
            const task = u32.create_task();
            const hWndDec = ref.address(hWnd);

            task.matchType = 'hwnd';
            task.matchValue = hWndDec;
            const arr = await u32.task_get_hwnds(task);

            H.assert_get_hwnds(hWndDec, arr);
        });

    });

});

