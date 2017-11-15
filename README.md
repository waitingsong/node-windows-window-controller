# windows-window-controller
Wrap user32.ShowWindow() by node via [node-ffi](https://github.com/node-ffi/node-ffi)

[![Version](https://img.shields.io/npm/v/windows-window-controller.svg)](https://www.npmjs.com/package/windows-window-controller)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
![Available platform](https://img.shields.io/badge/platform-win32-blue.svg)
[![Build status](https://ci.appveyor.com/api/projects/status/jh6io0q3wbo9s88r?svg=true)](https://ci.appveyor.com/project/waitingsong/node-windows-window-controller)
[![Coverage Status](https://coveralls.io/repos/github/waitingsong/node-windows-window-controller/badge.svg)](https://coveralls.io/github/waitingsong/node-windows-window-controller)

## What can I do with this?
Hide, show, maximize, minimize a window where you know either the app process PID, or window's hWnd, or keyword title of the window(s).

## Installing
```powershell
# as global cmd-line
npm install --g windows-window-controller

# as module
npm install --save windows-window-controller
```



## Usage
```js
# ------ as global cmd-line ------

# by pid. 0x7632===30258
hide-window --pid=0x7632
hide-window --pid=30258
# by keyword of title case sensitive
hide-window --title=vim

# 3: Activates the window and displays it as a maximized window.
show-window --pid=0x7632 --status=3
show-window --pid=30258 --status=3
show-window --title=vim --status=3

# 1: Activates and displays a window. If the window is minimized or maximized, the system restores it to its original size and position. An application should specify this flag when displaying the window for the first time.
nwwc --hwnd=0x702C6 --status=1


# ------ as module ------
const nwwc = require("windows-window-controller");

nwwc.hide(0x7632).then((execRet) => console.log(execRet));
nwwc.hide(30258).then((execRet) => console.log(execRet));
nwwc.hide('vim').then((execRet) => console.log(execRet));

# 2: Activates the window and displays it as a minimized window.
nwwc.show(0x7632, 2).then((execRet) => console.log(execRet));
nwwc.show(30258, 2).then((execRet) => console.log(execRet));
nwwc.show('vim', 2).then((execRet) => console.log(execRet));

# hide all windows relative to the main process, such as the window of child process
nwwc.hide(0x7632, false).then((execRet) => console.log(execRet));
```

## Dependencies Troubleshooting
- If installation of node-gyp fails:
Check out [node-gyp](https://github.com/nodejs/node-gyp) and [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)

## Relevant
- [Windows Api ShowWindow documentation](https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548%28v=vs.85%29.aspx)


## Known bugs:
- The result of find hWnds by pid is empty when build by VS2017. It works when VS2013 and VS2015.

## License
[MIT](LICENSE)