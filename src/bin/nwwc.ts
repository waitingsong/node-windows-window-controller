#!/usr/bin/env node

/**
 * arguments: 
 * --hwnd={integer} --status={nCmdShow}
 */

import showWindow, {validate_cmdshow} from '../index';

const [,, ...argv] = process.argv;
let hWnd: number = 0;
let status: number = -1;

if ( ! argv || ! argv.length) {
    console.error('argv empty. arguments: --hwnd --status');
    console.log('status value See: https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548()v=vs.85).aspx)');
    process.exit(1);
}

for (let v of argv) {
    if ( ! hWnd && v.indexOf('--hwnd=') === 0) {
        let {[1]: id} = v.split('=');

        if (id && Number.isInteger(+id)) {
            hWnd = +id;
        }
    }
    else if (v.indexOf('--status') === 0) {
        let {[1]: vv} = v.split('=');

        if (vv &&  Number.isInteger(+vv)) {
            status = +vv;
            break;
        }
    }
}

if (hWnd <= 0) {
    process.exit(1);
}
if ( ! validate_cmdshow(status)) {
    process.exit(1);
}

const errcode = showWindow(hWnd, status);

process.exit(errcode);
