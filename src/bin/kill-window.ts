#!/usr/bin/env node

/**
 * kill process by which the matched hWnd(s) (window) created
 * optins:
 * --pid={integer}
 * --title={string}
 * --hwnd={integer}
 */

import * as yargs from 'yargs'

import * as nwwc from '../index'

const opts = nwwc.parse_cli_opts(yargs.argv)

if (!opts) {
  console.error('argv empty. options: --title or --pid')
  process.exit(1)
}
else {
  nwwc.kill(opts).then((execRet: nwwc.ExecRet) => {
    console.info('process ret:', execRet)
    process.exit(execRet.err)
  })
}
