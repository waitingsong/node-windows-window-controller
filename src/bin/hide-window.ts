#!/usr/bin/env node

/**
 * hide window(s)
 * arguments:
 * --pid={integer}
 * --title={string}
 * --hwnd={integer}
 */

import * as yargs from 'yargs'

import * as nwwc from '../index'

const opts = nwwc.parse_cli_opts(yargs.argv)

if (!opts) {
  console.error('argv empty. arguments: --pid|title|hwnd')
  console.info('status value See: https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx')
  process.exit(1)
}
else {
  nwwc.hide(opts).then((execRet: nwwc.ExecRet) => {
    console.info('process ret:', execRet)
    process.exit(execRet.err)
  })
}
