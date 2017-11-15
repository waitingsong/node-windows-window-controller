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
                const execRet = await nwwc.show(opts);

                H.assert_execret(execRet);
                if (!execRet.hwnds.length) {
                    assert(false, 'processed hWnds should not empty');
                }
                assert(!!user32.IsWindowVisible(hWnd), 'window should visible');
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
                const execRet = await nwwc.show(opts);

                if (!execRet.hwnds.length) {
                    assert(false, 'processed hWnds should not empty');
                }
                assert(!!user32.IsWindowVisible(hWnd), 'window should visible');
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
                const execRet = await nwwc.show(opts);

                H.assert_execret(execRet);
                assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
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
                const execRet = await nwwc.show(opts);

                assert(user32.IsWindowVisible(hWnd), 'window should visible');
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
                const execRet = await nwwc.show(opts);

                if (!execRet.hwnds.length) {
                    assert(false, 'processed hWnds should not empty');
                }
                assert(user32.IsWindowVisible(hWnd), 'window should visible');
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
                const execRet = await nwwc.show(opts);

                H.assert_execret(execRet);
                // some hWnd has not WS_SYSMENU, so comment out
                // if (execRet.hwnds.length) {
                //     assert(false, 'processed hWnds should empty');
                // }
                assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
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
                const execRet = await nwwc.show(opts);

                H.assert_execret(execRet);
                assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
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
                const execRet = await nwwc.show(opts);

                assert(user32.IsWindowVisible(hWnd), 'window should visible');
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
            const execRet = await nwwc.show(opts);

            assert(!!user32.IsWindowVisible(hWnd), 'window should visible');
        });
        it('--hwnd by invalid value', async function() {
            const hwnd = 0;

            opts.matchType = 'hwnd';
            opts.matchValue = hwnd;
            opts.nCmdShow = 2;
            const execRet = await nwwc.show(opts);

            assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
        });

        it('--title', async function() {
            opts.matchType = 'title';
            opts.matchValue = title;
            opts.nCmdShow = 9;
            const execRet = await nwwc.show(opts);

            H.assert_execret(execRet);
            if (!execRet.hwnds.length) {
                assert(false, 'processed hWnds are empty');
            }
            assert(!!user32.IsWindowVisible(hWnd), 'window should visible');
        });

    });

});
