/// <reference types="node" />
/// <reference types="mocha" />

import { spawn, ChildProcess } from 'child_process'
// tslint:disable-next-line
import * as sleep from 'mz-modules/sleep'
import { basename, normalize } from 'path'
import * as assert from 'power-assert'
import { DModel as M, U } from 'win32-api'

import { hide } from '../src/index'
import * as Config from '../src/lib/types'

import * as H from './helper'

const filename = basename(__filename)
const user32 = U.load()
const title = 'Node-Calculator'
const waitTime = '1s'

describe(filename, () => {
  describe('Should CLI show-window.js hide works', () => {
    let child: ChildProcess
    let hWnd: M.HWND
    let opts: Config.Opts
    const js = 'show-window.js'
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
      await sleep(waitTime)
    })
    afterEach(() => {
      child && child.kill()
    })

    it('should hidden', done => {
      try {
        const hideProc = spawn('node', [js, `--title=${title}`, '--status=0'], defaults)

        if (hideProc.stderr) {
          hideProc.stderr.on('data', data => {
            assert(false, data.toString())
          })
          // hide.stdout.on('data', data => {
          //     console.log(data.toString());
          // });
          hideProc.on('exit', code => {
            assert(!code, 'process exit without zero')
            assert(!user32.IsWindowVisible(hWnd), 'window should invisible')
            done()
          })
        }
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('should hide failed', done => {
      try {
        const hideProc = spawn('node', [js, `--title=fake-${title}`, '--status=0'], defaults)

        if (hideProc.stderr) {
          hideProc.stderr.on('data', data => {
            assert(false, data.toString())
          })
          hideProc.on('exit', code => {
            assert(!code, 'process exit without zero')
            assert(!!user32.IsWindowVisible(hWnd), 'window should still visible')
            done()
          })
        }
      }
      catch (ex) {
        assert(false, ex)
      }
    })

  })

  describe('Should CLI show-window.js restore works', () => {
    let child: ChildProcess
    let hWnd: M.HWND
    let opts: Config.Opts
    const js = 'show-window.js'
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
      await hide({ ...opts, matchType: 'title', matchValue: title })
      await sleep(waitTime)
    })
    afterEach(async () => {
      await sleep(waitTime)
      child && child.kill()
      await sleep(waitTime)
    })

    it('should shown', done => {
      try {
        const hideProc = spawn('node', [js, `--title=${title}`, '--status=2'], defaults)

        if (hideProc.stderr) {
          hideProc.stderr.on('data', data => {
            assert(false, data.toString())
          })
          // hide.stdout.on('data', data => {
          //     console.log(data.toString());
          // });
          hideProc.on('exit', code => {
            assert(!code, 'process exit without zero')
            assert(!!user32.IsWindowVisible(hWnd), 'window should visible')
            done()
          })
        }

      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('should show failed', done => {
      try {
        const hideProc = spawn('node', [js, `--title=fake-${title}`, '--status=2'], defaults)

        if (hideProc.stderr) {
          hideProc.stderr.on('data', data => {
            assert(false, data.toString())
          })
          hideProc.on('exit', code => {
            assert(!code, 'process exit without zero')
            assert(!user32.IsWindowVisible(hWnd), 'window should still invisible')
            done()
          })
        }
      }
      catch (ex) {
        assert(false, ex)
      }
    })
  })


})
