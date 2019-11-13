@echo off
echo rebuilding web extension...
call npm run clean-build
echo building web extension...
cd .\dist
call web-ext build --overwrite-dest
move .\web-ext-artifacts ..\
cd ..
echo compressing source..
call git archive -o source.zip HEAD
echo done