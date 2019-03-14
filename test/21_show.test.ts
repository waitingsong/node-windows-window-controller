/// <reference types="node" />
/// <reference types="mocha" />

import { spawn, ChildProcess } from 'child_process'
// tslint:disable-next-line
import * as sleep from 'mz-modules/sleep'
import { basename } from 'path'
import * as assert from 'power-assert'
import * as ref from 'ref'
import { DModel as M, U } from 'win32-api'

import * as nwwc from '../src/index'
import * as Config from '../src/lib/types'

import * as H from './helper'

const filename = basename(__filename)
const user32 = U.load()
const title = 'Node-Calculator'
const waitTime = '1s'
const UC = U.constants

describe(filename, () => {
  describe('Should show() works', () => {
    let child: ChildProcess
    let hWnd: M.HWND
    let opts: Config.Opts

    beforeEach(async () => {
      opts = <Config.Opts> { ...Config.filterWinRulesDefaults }
      child && child.kill()
      child = spawn('calc.exe')
      await sleep(waitTime)
      hWnd = H.find_n_check_calc_win()
      await nwwc.hide({ ...opts, matchType: 'title', matchValue: title })
      await sleep(waitTime)
      assert(!user32.IsWindowVisible(hWnd), 'beforeEach: window should invisible')
    })
    afterEach(() => {
      child && child.kill()
    })

    it('--pid', async () => {
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      opts.nCmdShow = 9
      try {
        const execRet = await nwwc.show(opts)

        H.assert_execret(execRet)
        if (!execRet.hwnds.length) {
          assert(false, 'processed hWnds should not empty')
        }
        assert(!!user32.IsWindowVisible(hWnd), 'window should visible')
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('--pid with titleExits true', async () => {
      opts.titleExits = true
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      opts.nCmdShow = 9
      try {
        const execRet = await nwwc.show(opts)

        if (!execRet.hwnds.length) {
          assert(false, 'processed hWnds should not empty')
        }
        assert(!!user32.IsWindowVisible(hWnd), 'window should visible')
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('--pid with titleExits false', async () => {
      opts.titleExits = false
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      opts.nCmdShow = 9

      try {
        const execRet = await nwwc.show(opts)

        H.assert_execret(execRet)
        assert(!user32.IsWindowVisible(hWnd), 'window should invisible')
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('--pid with titleExits null', async () => {
      opts.titleExits = null  // should be overrided to true
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      opts.nCmdShow = 9
      try {
        await nwwc.show(opts)

        assert(user32.IsWindowVisible(hWnd), 'window should visible')
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('--pid with includeStyle:WS_SYSMENU', async () => {
      opts.includeStyle = UC.WS_SYSMENU
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      opts.nCmdShow = 9
      try {
        const execRet = await nwwc.show(opts)

        if (!execRet.hwnds.length) {
          assert(false, 'processed hWnds should not empty')
        }
        assert(user32.IsWindowVisible(hWnd), 'window should visible')
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('--pid with excludeStyle:WS_SYSMENU', async () => {
      opts.excludeStyle = UC.WS_SYSMENU
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      opts.nCmdShow = 9
      try {
        const execRet = await nwwc.show(opts)

        H.assert_execret(execRet)
        // some hWnd has not WS_SYSMENU, so comment out
        // if (execRet.hwnds.length) {
        //     assert(false, 'processed hWnds should empty');
        // }
        assert(!user32.IsWindowVisible(hWnd), 'window should invisible')
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('--pid with includeStyle:WS_VISIBLE', async () => {
      opts.includeStyle = UC.WS_VISIBLE    // not matched now
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      opts.nCmdShow = 9
      try {
        const execRet = await nwwc.show(opts)

        H.assert_execret(execRet)
        assert(!user32.IsWindowVisible(hWnd), 'window should invisible')
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('--pid with excludeStyle:WS_VISIBLE', async () => {
      opts.excludeStyle = UC.WS_VISIBLE    // matched now
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      opts.nCmdShow = 9
      try {
        await nwwc.show(opts)

        assert(user32.IsWindowVisible(hWnd), 'window should visible')
      }
      catch (ex) {
        assert(false, ex)
      }
    })


    it('--hwnd by valid value', async () => {
      const hwnd = ref.address(hWnd)

      opts.matchType = 'hwnd'
      opts.matchValue = hwnd
      opts.nCmdShow = 2
      await nwwc.show(opts)

      assert(!!user32.IsWindowVisible(hWnd), 'window should visible')
    })
    it('--hwnd by invalid value', async () => {
      const hwnd = 0

      opts.matchType = 'hwnd'
      opts.matchValue = hwnd
      opts.nCmdShow = 2
      await nwwc.show(opts)

      assert(!user32.IsWindowVisible(hWnd), 'window should invisible')
    })

    it('--title', async () => {
      opts.matchType = 'title'
      opts.matchValue = title
      opts.nCmdShow = 9
      const execRet = await nwwc.show(opts)

      H.assert_execret(execRet)
      if (!execRet.hwnds.length) {
        assert(false, 'processed hWnds are empty')
      }
      assert(!!user32.IsWindowVisible(hWnd), 'window should visible')
    })

  })

})
