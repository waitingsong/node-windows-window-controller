/**
 * show or hide window(s)
 * arguments:
 * --pid={integer}
 * --title={string}
 * --hwnd={integer}
 * --status={nCmdShow}
 */

import * as yargs from 'yargs'

import { parse_cli_opts, show } from '../lib/index'
import { ExecRet } from '../lib/types'

const opts = parse_cli_opts(yargs.argv)

if (! opts) {
  console.error('argv empty. options: --pid|title|hwnd --status')
  console.info('status value See: https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548(v=vs.85).aspx')
  process.exit(1)
}
else {
  show(opts).then((execRet: ExecRet) => {
    console.info('process ret:', execRet)
    process.exit(execRet.err)
  })
}
