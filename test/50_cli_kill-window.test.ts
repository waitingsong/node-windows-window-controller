/// <reference types="node" />
/// <reference types="mocha" />

import { spawn, ChildProcess } from 'child_process'
import * as ffi from 'ffi'
// tslint:disable-next-line
import * as sleep from 'mz-modules/sleep'
import { basename, normalize } from 'path'
import * as assert from 'power-assert'
import * as ref from 'ref'
import { DModel as M, U } from 'win32-api'

import * as nwwc from '../src/index'
import * as Config from '../src/lib/types'

import * as H from './helper'

const filename = basename(__filename)
const user32 = U.load()
const title = 'Node-Calculator'
const waitTimeLong = '3s'
const waitTime = '1s'

describe(filename, () => {
  describe('Should CLI kill-window.js works', () => {
    let child: ChildProcess
    let hWnd: M.HWND
    let opts: Config.Opts
    const js = 'kill-window.js'
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
      assert(!!user32.IsWindowVisible(hWnd), 'beforeEach: window should visible')
    })
    afterEach(async () => {
      child && child.kill()
    })

    it('should killed', async () => {
      try {
        const kill = spawn('node', [js, '--title=' + title], defaults)

        kill.stderr.on('data', data => {
          assert(false, data.toString())
        })
        kill.on('exit', code => {
          assert(!code, 'kill process exit without zero')
        })

        await sleep(waitTimeLong)
        opts.matchType = 'title'
        opts.matchValue = title
        const arr = await nwwc.get_hwnds(opts)
        const hWndDec = ref.address(hWnd)

        H.assert_get_hwnds(hWndDec, arr, true) // arr should empty

      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('should failed', async () => {
      try {
        const kill = spawn('node', [js, '--title=fake-' + title], defaults)

        kill.stderr.on('data', data => {
          assert(false, data.toString())
        })
        kill.on('exit', code => {
          assert(!code, 'kill process exit without zero')
        })

        await sleep(waitTimeLong)
        opts.matchType = 'title'
        opts.matchValue = title
        const arr = await nwwc.get_hwnds(opts)
        const hWndDec = ref.address(hWnd)

        H.assert_get_hwnds(hWndDec, arr) // arr should not empty

      }
      catch (ex) {
        assert(false, ex)
      }
    })

  })


})
