# SESASI CUTi APPS

code ini berisikan code backend untuk membuat aplikasi cuti sesasi yang mana merupakan syarat / sebagai tes masuk kerja. dalam pembuatan aplikasi ini saya yakin terdapat banyak kekurangan karena ada beberapa test case yang belum tercover, namun secara requirement dari tes yang dideskripsikan saya kira sudah cukup

https://sesasi.notion.site/Sesasi-Backend-App-5c36d9112a3d44f49434c8a1320502d4

aplikasi ini menggunakan bahasa pemrograman javascript dengan runtime node.js, menggunakan beberapa module seperti express js dan graphql. sedangkan untuk database sendiri menggunakan mongodb (NoSql)

aplikasi cuti ini menggunakan case dalam sebuah perusahaan dengan regulasi cuti di indonesia yang mana memiliki 12 hari kuota cuti pertahunnya, memiliki beberapa jenis cuti: annually leave (paid), sick leave, etc

dalam aplikasi ini terdapat 3 role user ,
1) user admin memiliki hirarki paling tinggi 
2) verifikator memiliki hirarki tengah
3) ordinary memiliki hirarki paling bawah

instalation requirement : 
 - node v18.17.1
 - mongodb server

untuk menginstal: 
1) clone repository ini
2) jalankan npm install
3) buat file .env

note: 
- user admin perlu insert dari db


sekian TERIMAKASIH