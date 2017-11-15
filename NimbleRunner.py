import fileinput
import os
import subprocess
import time
import argparse
import shutil
import zipfile

def runTestSuite():
    reInitChromeUserDataDir()
    clearLogFile()
    chromeProcess = startChromeProcess("chrome://extensions/")
    # Chrome process needs a few seconds to initialize the extension
    time.sleep(5)
    startChromeProcess(masterSuiteLaunchURL)
    
    matchFound = tailLogAndLookFor("**** Nimble [Master Suite Done] ****")
    if (matchFound):
        print '\n******** Terminating Chrome process ********\n'
        chromeProcess.terminate()

def reInitChromeUserDataDir():
    print 'Re-init user data dir: ' + chromeUserDataDir
    if os.path.exists(chromeUserDataDir):
        shutil.rmtree(chromeUserDataDir)
    os.mkdir(chromeUserDataDir)

def clearLogFile():
    print 'Clearing log file: ' + chromeLogFile
    with open(chromeLogFile, 'w+') as log:
        log.truncate(0)
        log.close

def unzipChromeBinary():    
    if not os.path.exists(chromeBinary):
        print 'Extracting Chrome binary...'
        zip = zipfile.ZipFile(chromeZip, 'r')
        zip.extractall('target')
        print 'Done'
        
def startChromeProcess(url=''):
    args = [chromeBinary, 
            "--load-extension=%s" % chromeExtensionDir,
            url,
            "--enable-logging", 
            "--auth-server-whitelist=\"abc.com\"",
            "--no-default-browser-check",
            "--user-data-dir=%s" % chromeUserDataDir]
    print '\n******** Starting Chrome ********\n'
    print 'Args %s' % args
    return subprocess.Popen(args)
    
def tailLogAndLookFor(pattern):
    print 'Monitoring log file for changes... %s' % chromeLogFile
    currentLineNum = 0
    lastLineRead = 0

    while(True):
        with open(chromeLogFile, 'r') as logFile:
            for line in logFile:
                if currentLineNum > lastLineRead:
                    print line
                    lastLineRead = currentLineNum
                    if pattern in line:
                        print ('Found pattern matching "%s"' % pattern)
                        return True
                currentLineNum = currentLineNum + 1
                
        # Sleep for a bit and then check log file for modifications
        time.sleep(2)
        currentLineNum = 0
    return False
    
#### Main ####

# Nimble test runner looks for this URL to kick start the test suite
masterSuiteLaunchURL = "file:///%s" % os.getcwd()
chromeZip = 'chromium_37.0.2046.0.zip'
chromeBinary = 'target\\chrome-win32\\chrome.exe'
chromeExtensionDir = os.getcwd()
chromeUserDataDir = "%s\\target\\userData" % os.getcwd()
chromeLogFile = "%s\\target\\userData\\chrome_debug.log" % os.getcwd()

unzipChromeBinary()
runTestSuite()