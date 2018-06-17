/**
 * node-windows-window-controller
 *
 * @author waiting
 * @license MIT
 * @link https://github.com/waitingsong/node-windows-window-controller
 */

export * from './lib/types'
export { validate_cmdshow } from './lib/user32'
export {
  hide,
  show,
  get_hwnds,
  kill,
  parse_cli_opts,
  retrieve_pointer_by_hwnd,
  set_title,
} from './lib/index'
