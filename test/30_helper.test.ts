/// <reference types="node" />
/// <reference types="mocha" />

import { spawn, ChildProcess } from 'child_process'
// tslint:disable-next-line
import * as sleep from 'mz-modules/sleep'
import { basename } from 'path'
import * as assert from 'power-assert'
import { DModel as M } from 'win32-api'

import * as nwwc from '../src/index'
import * as helper from '../src/lib/helper'
import * as Config from '../src/lib/types'

import * as H from './helper'


const filename = basename(__filename)
const title = 'Node-Calculator'
const waitTime = '1s'

describe(filename, () => {
  describe('Should get_last_err_msg() works', () => {
    let child: ChildProcess
    let hWnd: M.HWND
    let opts: Config.Opts

    beforeEach(async () => {
      opts = <Config.Opts> { ...Config.filterWinRulesDefaults }
      await sleep(waitTime)
      child && child.kill()
      child = spawn('calc.exe')
      await sleep(waitTime)
      hWnd = H.find_n_check_calc_win()
    })
    afterEach(async () => {
      await sleep(waitTime)
      child && child.kill()
      await sleep(waitTime)
    })

    it('should no error', async () => {
      opts.matchType = 'title'
      opts.matchValue = title
      await nwwc.hide(opts)
      const lastErrMsg = helper.get_last_err_msg()

      if (lastErrMsg) {
        assert(false)
      }
    })

  })


})
