/**
 * arguments: 
 * --pid={integer} --status={nCmdShow}
 * --title={string} --status={nCmdShow}
 */

import * as nwwc from '../index';

const [,, ...argv] = process.argv;
let param: string | number = 0;
let status: number = -1;

if ( ! argv || ! argv.length) {
    console.error('argv empty');
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

for (let v of argv) {
    if (v.indexOf('--status') === 0) {
        let {[1]: vv} = v.split('=');

        if (vv &&  Number.isInteger(+vv)) {
            status = +vv;
            break;
        }
    }
}

if ( ! param) {
    process.exit(1);
}
if ( ! nwwc.validate_cmdshow(status)) {
    process.exit(1);
}

nwwc.show(param, status).then(() => process.exit(0));
