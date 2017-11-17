# Nimble
Functional testing tool for web UIs.
 
As web apps get more complicated, functional testing is a must have. 
 
The main problem with UI functional tests is that they need access to a full live DOM, which we do not have in an test environment. 
The primary mechanism to write such tests at the moment is via the Web Driver standard, which lets us communicate with a browser.
 
## Web Driver approach

In this approach the WebDriver serves as an intermediary process and provides interaction with the web browser.

![Image](https://github.com/bsandhu/Nimble/blob/master/WebDriver.png)

The downsides to the approach is that there are a lot of moving parts. This tends to be slow things down, since multiple processes are involved. 
Web Driver implementations can have their own bugs. 

Selenium, the most popular web driver implementation, has its own share of complains and the community has been looking for alternatives. 
Some downsides:
- Selenium tests are slow to write and run, driving the ROI down.
- It tends to be quirky on virtual displays causing us to lose confidence in our builds

Alternates like Phantom JS do not provide the same environment a real user is going to work in. 

## A different look at the problem

One of the problems here, seem to the intermediate layer for talking to the browser. 
The other is that Web UIs are async. by nature, tests written in languages like Java need to mold and adapt to the paradigm.

Nimble attempts to simplify things by staying within the browser/JS ecosystem. 

![Image](https://github.com/bsandhu/Nimble/blob/master/Nimble.png)

Nimble achieves this by being a Chrome extension. Extensions are able to inject scripts into web pages. 
These scripts can access the DOM - but not the JS on the page. This is just the behavior we need for functional testing!

Some downsides:
- Nimble extensions will have to written for different browsers - currently only for Chrome
- Packaging tools like WebPack can enapsulate everything in the global namespace causing some issues

