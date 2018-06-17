/**
 * kill process by which the matched hWnd(s) (window) created
 * optins:
 * --pid={integer}
 * --title={string}
 * --hwnd={integer}
 */

import * as yargs from 'yargs'

import { kill, parse_cli_opts } from '../lib/index'
import { ExecRet } from '../lib/types'

const opts = parse_cli_opts(yargs.argv)

if (!opts) {
  console.error('argv empty. options: --title or --pid')
  process.exit(1)
}
else {
  kill(opts).then((execRet: ExecRet) => {
    console.info('process ret:', execRet)
    process.exit(execRet.err)
  })
}
