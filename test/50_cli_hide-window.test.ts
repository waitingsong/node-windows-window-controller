/// <reference types="node" />
/// <reference types="mocha" />

import { spawn, ChildProcess } from 'child_process'
// tslint:disable-next-line
import * as sleep from 'mz-modules/sleep'
import { basename, normalize } from 'path'
import * as assert from 'power-assert'
import { DModel as M, U } from 'win32-api'

import * as Config from '../src/lib/types'

import * as H from './helper'

const filename = basename(__filename)
const user32 = U.load()
const title = 'Node-Calculator'
const waitTimeLong = '3s'
const waitTime = '1s'

describe(filename, () => {
  describe('Should CLI hide-window.js works', () => {
    let child: ChildProcess
    let hWnd: M.HWND
    let opts: Config.Opts
    const js = 'hide-window.js'
    const defaults = {
      cwd: normalize(`${__dirname}/../dist/bin/`),
      env: process.env,
    }

    beforeEach(async () => {
      opts = <Config.Opts> { ...Config.filterWinRulesDefaults }
      await sleep(waitTime)
      child && child.kill()
      child = spawn('calc.exe')
      await sleep(waitTime)
      hWnd = H.find_n_check_calc_win()
    })
    afterEach(() => {
      child && child.kill()
    })

    it('should hidden', async () => {
      try {
        const hide = spawn('node', [js, '--title=' + title], defaults)

        if (hide.stderr) {
          hide.stderr.on('data', data => {
            assert(false, data ? data.toString() : 'unknown error')
          })
          hide.on('exit', code => {
            assert(!code, 'process exit without zero')
          })

          await sleep(waitTimeLong)
          assert(!user32.IsWindowVisible(hWnd), 'window should invisible')
        }
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('should failed', async () => {
      try {
        const hide = spawn('node', [js, '--title=fake-' + title], defaults)

        if (hide.stderr) {
          hide.stderr.on('data', data => {
            assert(false, data ? data.toString() : 'unknown error')
          })
          hide.on('exit', code => {
            assert(!code, 'process exit without zero')
          })

          await sleep(waitTimeLong)
          assert(!!user32.IsWindowVisible(hWnd), 'window should still visible')
        }
      }
      catch (ex) {
        assert(false, ex)
      }
    })

  })

})
