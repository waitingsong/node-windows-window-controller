#!/usr/bin/env node

/**
 * kill process by which the matched hWnd(s) (window) created
 * optins: 
 * --title={string}
 */

import * as nwwc from '../index';

const [,, ...argv] = process.argv;
let param: string | number = 0;

if ( ! argv || ! argv.length) {
    console.error('argv empty. options: --title');
    process.exit(1);
}

for (let v of argv) {
    if (v.indexOf('--pid=') === 0) {
        let {[1]: id} = v.split('=');

        if (id && Number.isInteger(+id)) {
            param = +id;
            break;
        }
    }
}
if ( ! param) {
    for (let v of argv) {
        if (v.indexOf('--title') === 0) {
            const {[1]: title} = v.split('=');

            if (title) {
                param = title;
                break;
            }
        }
    }
}

if ( ! param) {
    process.exit(1);
}


nwwc.kill(param).then(() => process.exit(0));
