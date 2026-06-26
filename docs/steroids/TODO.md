# Introduction 
Singkat cerita, saya sangat suka menggunakan Vue.js untuk keperluan membangun aplikasi enterprise. Dikarenakan learning curvenya tidak terlalu tinggi dan kecepatan dalam membangun aplikasi, terkhusus kemudahannya dalam instalasi di Vue.js versi 2, tinggal download dan langsung bisa digunakan. Saya tidak suka terlalu banyak node_modules terkhususnya NPM yang kedepannya bisa menyebabkan technical debt. 

# Pain points dan penyelesaiannya
1. Dinamisasi load component, misalnya saya ingin menggunakan component <input-text> maka saya mau secara otomatis include component yang ada didalam folder /components/input/input-text.js 
2. Load dependencies child component yang terdapat didalam component yang baru saja di load pada point 1 
3. Handle load Vue Plugins
4. Handle load Vue Mixin

# 3rd party yang paling penting  
1. Vue Router 2 (https://v3.router.vuejs.org/)
2. Vue Portal 2 (https://v2.portal-vue.linusb.org/)
3. Vue Store Pinia 

glpat-TUIinnoY-7Y9Q5DE-fKlOGM6MQpvOjEKdTo4Ym4wbQ8.01.171y5aara