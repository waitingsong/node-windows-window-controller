#!/usr/bin/env node

/**
 * hide window(s)
 * arguments:
 * --pid={integer}
 * --title={string}
 * --hwnd={integer}
 */

import * as yargs from 'yargs'

import { hide, parse_cli_opts } from '../lib/index'
import { ExecRet } from '../lib/types'

const opts = parse_cli_opts(yargs.argv)

if (!opts) {
  console.error('argv empty. arguments: --pid|title|hwnd')
  console.info('status value See: https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx')
  process.exit(1)
}
else {
  hide(opts).then((execRet: ExecRet) => {
    console.info('process ret:', execRet)
    process.exit(execRet.err)
  })
}
