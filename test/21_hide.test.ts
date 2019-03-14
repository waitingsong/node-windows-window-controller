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
  describe('Should hide() works', () => {
    let child: ChildProcess
    let hWnd: M.HWND
    let opts: Config.Opts

    beforeEach(async () => {
      opts = <Config.Opts> { ...Config.filterWinRulesDefaults }
      child && child.kill()
      child = spawn('calc.exe')
      await sleep(waitTime)
      hWnd = H.find_n_check_calc_win()
    })
    afterEach(() => {
      child && child.kill()
    })

    it('--pid', async () => {
      try {
        opts.matchType = 'pid'
        opts.matchValue = child.pid
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('--pid with titleExits true', async () => {
      opts.titleExits = true    // win should processed by it
      opts.matchType = 'pid'
      opts.matchValue = child.pid

      try {
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('--pid with titleExists false', async () => {
      opts.titleExits = false   // win should not processed by it
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      try {
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('--pid with includeStyle:WS_SYSMENU', async () => {
      opts.includeStyle = UC.WS_SYSMENU
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      try {
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('--pid with excludeStyle:WS_SYSMENU', async () => {
      opts.excludeStyle = UC.WS_SYSMENU
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      try {
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('--pid with includeStyle:WS_VISIBLE', async () => {
      opts.includeStyle = UC.WS_VISIBLE // win should processed by it
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      try {
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(!visible, 'window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('--pid with excludeStyle:WS_VISIBLE', async () => {
      opts.excludeStyle = UC.WS_VISIBLE // win should not processed by it
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      try {
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(visible, 'window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('--pid with includeExStyle:WS_EX_TOOLWINDOW', async () => {
      opts.includeExStyle = UC.WS_EX_TOOLWINDOW // calculator has no style of WS_EX_TOOLWINDOW
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      try {
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })
    it('--pid with excludeExStyle:WS_EX_TOOLWINDOW', async () => {
      opts.excludeExStyle = UC.WS_EX_TOOLWINDOW // calculator has no style of WS_EX_TOOLWINDOW
      opts.matchType = 'pid'
      opts.matchValue = child.pid
      try {
        const execRet = await nwwc.hide(opts)

        H.assert_execret(execRet)
        const visible = !!user32.IsWindowVisible(hWnd)
        assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
      }
      catch (ex) {
        assert(false, ex)
      }
    })

    it('--title', async () => {
      opts.matchType = 'title'
      opts.matchValue = title
      const execRet = await nwwc.hide(opts)

      H.assert_execret(execRet)
      const visible = !!user32.IsWindowVisible(hWnd)
      assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
    })

    it('--title with titleExists true', async () => {
      opts.titleExits = true
      opts.matchType = 'title'
      opts.matchValue = title
      const execRet = await nwwc.hide(opts)

      H.assert_execret(execRet)
      const visible = !!user32.IsWindowVisible(hWnd)
      assert(!visible, ': window should invisible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
    })
    it('--title with titleExists false', async () => {
      opts.titleExits = false
      opts.matchType = 'title'
      opts.matchValue = title
      const execRet = await nwwc.hide(opts)

      H.assert_execret(execRet)
      const visible = !!user32.IsWindowVisible(hWnd)
      assert(visible, ': window should visible, processed hWnds are "' + execRet.hwnds.join(',') + '"')
    })

    it('--hwnd by valid value', async () => {
      const hwnd = ref.address(hWnd)

      opts.matchType = 'hwnd'
      opts.matchValue = hwnd
      opts.nCmdShow = 0
      await nwwc.hide(opts)

      assert(!user32.IsWindowVisible(hWnd), 'window should invisible')
    })
    it('--hwnd by invalid value', async () => {
      const hwnd = 0

      opts.matchType = 'hwnd'
      opts.matchValue = hwnd
      opts.nCmdShow = 0
      await nwwc.hide(opts)

      assert(!!user32.IsWindowVisible(hWnd), 'window should visible')
    })
  })

})
