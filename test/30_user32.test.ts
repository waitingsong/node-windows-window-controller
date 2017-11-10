/// <reference types="node" />
/// <reference types="mocha" />

import {spawn, ChildProcess} from 'child_process';
import {basename, normalize} from 'path';
import * as ref from 'ref';
import * as assert from 'power-assert';
import * as sleep from 'mz-modules/sleep';
import * as nwwc from '../src/index';
import * as u32 from '../src/lib/user32';

const filename = basename(__filename);
const Win = nwwc.Win;
const knl32 = Win.Kernel32.load();
const user32 = Win.User32.load();
const waitTime = '2s';

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


});
