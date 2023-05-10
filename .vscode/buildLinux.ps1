$appName = (Get-Content package.json | ConvertFrom-Json).name
$resDir = "_build/Linux/$appName/resources"

rm -r -ErrorAction Ignore _build/Linux/$appName
cp -Recurse -Force D:/Desarrollo/ElectronBinaries/Linux/ _build/Linux/$appName

mkdir $resDir/app
cp package.json $resDir/app
cp icon64.png $resDir/app
cp -Recurse src/ $resDir/app

cd $resDir
asar p app/ app.asar
rm -r app/

cd ..
mv electron "$appName"
cd ..
bash -c 'tar -czf canal.tar.gz canal/'