# windows-window-controller
Wrap user32.ShowWindow() by node via [node-ffi](https://github.com/node-ffi/node-ffi)

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

# ------  original user32.ShowWindow ------
# 0: Hides the window and activates another window. 
nwwc --hwnd=0x702C6 --status=0
nwwc --hwnd=459462 --status=0

# 1: Activates and displays a window. If the window is minimized or maximized, the system restores it to its original size and position. An application should specify this flag when displaying the window for the first time. 
nwwc --hwnd=0x702C6 --status=1


# ------ as module ------
const api = require("windows-window-controller");

api.hide(0x7632).then(() => console.log('done'));
api.hide(30258).then(() => console.log('done'));
api.hide('vim').then(() => console.log('done'));

# 2: Activates the window and displays it as a minimized window.
api.show(0x7632, 2).then(() => console.log('done'));
api.show(30258, 2).then(() => console.log('done'));
api.show('vim', 2).then(() => console.log('done'));

# hide all windows relative to the main process, such as the window of child process
api.hide(0x7632, false).then(() => console.log('done'));
```

## Dependencies Troubleshooting
- If installation of node-gyp fails:
Check out [node-gyp](https://github.com/nodejs/node-gyp) and [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)

## Relevant
- [Windows Api ShowWindow documentation](https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548%28v=vs.85%29.aspx)



### License
The MIT License (MIT)

Copyright (c) 2015 DophinL

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
