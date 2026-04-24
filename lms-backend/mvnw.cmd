@REM Maven Wrapper startup batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir

@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
set WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties"

@REM Read the properties file to get distribution URL
for /f "usebackq tokens=1,* delims==" %%a in (%WRAPPER_PROPERTIES%) do (
    if "%%a"=="distributionUrl" set DIST_URL=%%b
)

set MAVEN_HOME=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\dists\apache-maven-3.9.6
set MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd

if exist "%MAVEN_CMD%" goto runMaven

@REM Download Maven if not already present
echo Downloading Maven...
mkdir "%MAVEN_HOME%" 2>nul

@REM Use PowerShell to download
powershell -Command "& { $ProgressPreference='SilentlyContinue'; Invoke-WebRequest '%DIST_URL%' -OutFile '%TEMP%\maven.zip' -UseBasicParsing; Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%MAVEN_PROJECTBASEDIR%.mvn\wrapper\dists' -Force; Remove-Item '%TEMP%\maven.zip' }"

@REM The zip extracts to a folder - find the mvn command
for /d %%i in ("%MAVEN_PROJECTBASEDIR%.mvn\wrapper\dists\apache-maven-*") do set MAVEN_HOME=%%i
set MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd

:runMaven
"%MAVEN_CMD%" %*
