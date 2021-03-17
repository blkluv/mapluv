# Rebuild all wasm modules and then place them in ../src/wasm/

rebuild() {
    /bin/mkdir "$1/build.tmp/"
    pushd "$1/build.tmp/"
    emcmake cmake .. -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release
    cmake --build . --target install
    popd
    /bin/rm --force --recursive "$1/build.tmp/"
}

cd $(dirname $0)
/bin/rm --force --recursive "../src/wasm/"
rebuild "b3dtile"
