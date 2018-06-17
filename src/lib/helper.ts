import * as ref from 'ref'
import { K } from 'win32-api'

const knl32 = K.load()

export function get_last_err_msg(): string {
  // https://msdn.microsoft.com/en-us/library/windows/desktop/ms681382(v=vs.85).aspx
  const errcode = knl32.GetLastError()
  let errMsg = ''

  /* istanbul ignore if  */
  if (errcode) {
    const len = 255
    const buf = Buffer.alloc(len)
    // tslint:disable-next-line:no-bitwise
    const p = 0x00001000 | 0x00000200  // FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS
    const langid = 0x0409              // 0x0409: US, 0x0000: Neutral locale language
    const msglen = knl32.FormatMessageW(p, null, errcode, langid, buf, len, null)

    errMsg = msglen
      ? errcode + ': ' + ref.reinterpretUntilZeros(buf, 2).toString('ucs2')
      : `${errcode}: unknown error meeage`
  }

  return errMsg
}
