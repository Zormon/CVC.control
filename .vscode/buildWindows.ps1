# TODO: simplify two versions
# #########################################################
# #################### Windows 64 bits ####################
# #########################################################

$appName = (Get-Content package.json | ConvertFrom-Json).name
$resDir = "_build/Windows64/$appName/resources"

rm -r -ErrorAction Ignore _build/Windows64/$appName
cp -Recurse -Force D:/Desarrollo/ElectronBinaries/Windows64/ _build/Windows64/$appName

cp tile.xml $resDir/../$appName.visualelementsmanifest.xml
cp tile.png $resDir/..

mkdir $resDir/app
cp package.json $resDir/app
cp icon64.png $resDir/app
cp -Recurse src/ $resDir/app

asar p $resDir/app/ $resDir/app.asar
rm -r $resDir/app/

mv $resDir/../electron.exe $resDir/../"$appName.exe"



# #########################################################
# #################### Windows 32 bits ####################
# #########################################################

$appName = (Get-Content package.json | ConvertFrom-Json).name
$resDir = "_build/Windows32/$appName/resources"

rm -r -ErrorAction Ignore _build/Windows32/$appName
cp -Recurse -Force D:/Desarrollo/ElectronBinaries/Windows32/ _build/Windows32/$appName

cp tile.xml $resDir/../$appName.visualelementsmanifest.xml
cp tile.png $resDir/..

mkdir $resDir/app
cp package.json $resDir/app
cp icon64.png $resDir/app
cp -Recurse src/ $resDir/app

asar p $resDir/app/ $resDir/app.asar
rm -r $resDir/app/

mv $resDir/../electron.exe $resDir/../"$appName.exe"