/// <reference types="node" />
/// <reference types="mocha" />

import { promisify } from 'util';
import { spawn, exec, ChildProcess } from 'child_process';
import { basename, normalize } from 'path';
import * as ffi from 'ffi';
import * as ref from 'ref';
import * as Struct from 'ref-struct';
import * as assert from 'power-assert';
import { fail } from 'assert';
import * as sleep from 'mz-modules/sleep';
import * as nwwc from '../src/index';
import * as Config from '../src/lib/types';
import * as H from './helper';
import * as helper from '../src/lib/helper';
import { DS, conf as GCF, types as GT, windef as WD } from 'win32-api';

const filename = basename(__filename);
const Win = nwwc.Win;
const knl32 = Win.Kernel32.load();
const user32 = Win.User32.load();
const title = 'Node-Calculator';
const waitTimeLong = '3s';
const waitTime = '1s';
const UC = Win.User32.constants;

describe(filename, () => {
    describe('Should CLI show-window.js hide works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;
        let opts: Config.Opts;
        const js = 'show-window.js';
        const defaults = {
            cwd: normalize(`${__dirname}/../dist/bin/`),
            env: process.env,
        };

        beforeEach(async () => {
            opts = <Config.Opts> { ...Config.filterWinRulesDefaults };
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

        it('should hidden', function(done) {
            try {
                const hide = spawn('node', [js, `--title=${title}`, `--status=0`], defaults);

                hide.stderr.on('data', data => {
                    assert(false, data.toString());
                });
                // hide.stdout.on('data', data => {
                //     console.log(data.toString());
                // });
                hide.on('exit', code => {
                    assert( ! code, 'process exit without zero');
                    assert(!user32.IsWindowVisible(hWnd), 'window should invisible');
                    done();
                });

            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('should hide failed', function(done) {
            try {
                const hide = spawn('node', [js, `--title=fake-${title}`, `--status=0`], defaults);

                hide.stderr.on('data', data => {
                    assert(false, data.toString());
                });
                hide.on('exit', code => {
                    assert( ! code, 'process exit without zero');
                    assert(!!user32.IsWindowVisible(hWnd), 'window should still visible');
                    done();
                });
            }
            catch (ex) {
                assert(false, ex);
            }
        });

    });

    describe('Should CLI show-window.js restore works', () => {
        let child: ChildProcess;
        let hWnd: GT.HWND;
        let opts: Config.Opts;
        const js = 'show-window.js';
        const defaults = {
            cwd: normalize(`${__dirname}/../dist/bin/`),
            env: process.env,
        };

        beforeEach(async () => {
            opts = <Config.Opts> { ...Config.filterWinRulesDefaults };
            await sleep(waitTime);
            child && child.kill();
            child = spawn('calc.exe');
            await sleep(waitTime);
            hWnd = H.find_n_check_calc_win();
            await nwwc.hide({...opts, matchType: 'title', matchValue: title});
            await sleep(waitTime);
        });
        afterEach(async () => {
            await sleep(waitTime);
            child && child.kill();
            await sleep(waitTime);
        });

        it('should shown', function(done) {
            try {
                const hide = spawn('node', [js, `--title=${title}`, `--status=2`], defaults);

                hide.stderr.on('data', data => {
                    assert(false, data.toString());
                });
                // hide.stdout.on('data', data => {
                //     console.log(data.toString());
                // });
                hide.on('exit', code => {
                    assert( ! code, 'process exit without zero');
                    assert(!!user32.IsWindowVisible(hWnd), 'window should visible');
                    done();
                });

            }
            catch (ex) {
                assert(false, ex);
            }
        });
        it('should show failed', function(done) {
            try {
                const hide = spawn('node', [js, `--title=fake-${title}`, `--status=2`], defaults);

                hide.stderr.on('data', data => {
                    assert(false, data.toString());
                });
                hide.on('exit', code => {
                    assert( ! code, 'process exit without zero');
                    assert(!user32.IsWindowVisible(hWnd), 'window should still invisible');
                    done();
                });
            }
            catch (ex) {
                assert(false, ex);
            }
        });
    });


});
