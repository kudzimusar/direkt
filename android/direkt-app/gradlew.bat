@ECHO OFF
SETLOCAL
SET APP_HOME=%~dp0
SET WRAPPER_JAR=%APP_HOME%gradle\wrapper\gradle-wrapper.jar

IF EXIST "%WRAPPER_JAR%" (
  IF DEFINED JAVA_HOME (
    SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
  ) ELSE (
    SET JAVA_EXE=java.exe
  )
  "%JAVA_EXE%" -classpath "%WRAPPER_JAR%" org.gradle.wrapper.GradleWrapperMain %*
  EXIT /B %ERRORLEVEL%
)

WHERE gradle >NUL 2>NUL
IF %ERRORLEVEL% EQU 0 (
  gradle %*
  EXIT /B %ERRORLEVEL%
)

ECHO DIREKT requires Gradle 9.4.0 for the first bootstrap. 1>&2
ECHO Install Gradle 9.4.0 or run the GitHub Actions workflow. 1>&2
EXIT /B 1
