/// <reference types="node" />
/// <reference types="mocha" />

import {spawn, ChildProcess} from 'child_process';
import {basename, normalize} from 'path';
import * as ffi from 'ffi';
import * as ref from 'ref';
import * as Struct from 'ref-struct';
import * as assert from 'power-assert';
import {fail} from 'assert';
import * as sleep from 'mz-modules/sleep';
import * as nwwc from '../src/index';
import * as Config from '../src/lib/types';
import * as H from './helper';
import * as helper from '../src/lib/helper';
import {DS, conf as GCF, types as GT, windef as WD} from 'win32-api';


const filename = basename(__filename);
const Win = nwwc.Win;
const knl32 = Win.Kernel32.load();
const user32 = Win.User32.load();
const title = 'Node-Calculator';
const waitTimeLong = '3s';
const waitTime = '1s';
const UC = Win.User32.constants;

describe(filename, () => {
    describe('Should get_last_err_msg() works', () => {
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
            assert(!!user32.IsWindowVisible(hWnd), 'beforeEach: window should visible');
        });
        afterEach(async () => {
            await sleep(waitTime);
            child && child.kill();
        });

        it('should no error', async function() {
            opts.matchType = 'title';
            opts.matchValue = title;
            const execRet = await nwwc.hide(opts);
            const lastErrMsg = helper.get_last_err_msg();

            if (lastErrMsg) {
                assert(false);
            }
        });

    });


});
