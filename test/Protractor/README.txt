Installing test setup
=======================

npm install -g protractor

webdriver-manager update

curl -o %APPDATA%\npm\node_modules\protractor\node_modules\webdriver-manager\selenium\IEDriverServer_x64_2.53.1.zip http://selenium-release.storage.googleapis.com/2.53/IEDriverServer_x64_2.53.1.zip

"%ProgramFiles%\7-Zip\7z" e %APPDATA%\npm\node_modules\protractor\node_modules\webdriver-manager\selenium\IEDriverServer_x64_2.53.1.zip -o%APPDATA%\npm\node_modules\protractor\node_modules\webdriver-manager\selenium

#make sure protected is same for all zones Tools -> Internet Options -> Security
#http://stackoverflow.com/questions/14952348/not-able-to-launch-ie-browser-using-selenium2-webdriver-with-java