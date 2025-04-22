
## linux

- 移动至 /usr/local

```sh
mkdir -p /usr/local/alemongo
mv ./alemongo /usr/local/alemongo/alemongo
```

- run

```sh
/usr/local/alemongo/alemongo
```

## GLIBC_2.32

> 推荐更换Centos Steam9 或 ubuntu 

- error

```
./alemongo: /lib64/libc.so.6: version `GLIBC_2.32' not found (required by ./alemongo)
```

- 安装

```sh
wget http://ftp.gnu.org/gnu/libc/glibc-2.34.tar.gz
tar -xvzf glibc-2.34.tar.gz
cd glibc-2.34
mkdir build
cd build
../configure --prefix=/opt/glibc-2.34
make -j$(nproc)
sudo make install
```

- 使用2.24进行运行

```sh
/opt/glibc-2.34/lib/ld-linux-x86-64.so.2 ./alemongo
```