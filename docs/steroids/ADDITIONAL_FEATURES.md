# Vue JS 2 X Steroids Feature Default  

## Request dynamic component via AJAX (Done) ✅
1. Request file 
2. Jika file tidak ada maka akan menampilkan fallback default component 

Contoh : 

```javascript 

// penambahan vue config global
// config ini berfungsi sebagai default request path pada component 
Vue.config.componentPath = '/components';
Vue.config.componentExtension = '.tpl'; // sebagai penentu file extension, contoh akan menjadi /components/input/input-text.tpl

// fungsi default global vue yang bisa di akses 
this.fetchDynamicComponent({
    name : 'input-text' , 
    path : '/input/input-text' , 
    fallbackComponent : 'component-notfound'
});

// contoh penggunaan : 
this.fetchDynamicComponent( 'input-text' , '/input/input-text');

// hasil response dari file input text di parsing
// yang isinya sebagai berikut 
/**
 * <script>
 * module.exports = {
 *    data : {
 *       name : 'Ahmad Wahyudin' , 
 *       address : 'Jl Swadaya 1 No 2'
 *    },
 * 
 *    methods : {
 *      getName : {}
 *    },
 * 
 *    beforeCreated : function () {} , 
 *    mounted : function () {}
 * }
 * </script>
 * 
 * 
 * <template>
 *     <div class='flex gap-2'>
 *        Nama : {{name}}
 *        Alamat : {{address}} 
 *     </div>
 * </template>
 */
// Langsung otomatis defineDynamicComponent   
Vue.defineDynamicComponent('input-text' , {
    template : '' , // terisi hasil dari parsing tag <template></template> 
    data : {}, // terisi hasil dari parsing module.exports yang ada didalam tag <script></script>  
    ...
});

```

## Feature Auto Resolve apabila component tidak di temukan (Done) ✅

```javascript 

// auto fetch components
Vue.config.autoFetchComponents = false;

```

Menyambung pada point sebelumnya.
Apabila didalam component ada component yang belum teregistrasi maka akan otomatis include via AJAX dan otomatis teregistrasi sebagai dynamic component, jika tidak di temukan maka akan render default notfound. 

Berikut contoh struktur penamaan pada file component : 
<input-text>
Di split pada bagian '-', index pertama sebagai nama folder dan yang kedua adalah nama componentnya. 
Maka file tersebut maka ada di path, /components/input/input-text.(Vue.config.componentExtension)

Berikut sebagai contoh : 

```html
<template>
    <input-text></input-text> 
    <!-- input text tidak di temukan maka akan otomatis include input-text pada path /components/input/input-text -->
</template>
```

## Feature Default Axios (Done) ✅

Pada penambahan feature default ini diharapkan adanya kemudahan pada saat proses development. Karena bisa mengurangi dependencies library.

Berikut planningnya : 
```javascript 

// Penambahan default config pada Vue js global 
Vue.config.axiosBaseURL = 'http://localhost:8181/';
Vue.config.axiosToken   = ''; // default token 
```

Lalu untuk aksesnya bisa didalam Vue instance-nya langsung, sebagai contoh : 

```javascript

this.post('/url' , {
    ...axiosOptions
});

this.get('/url' , {
    ...axiosOptions
});

this.delete('/url' , {
    ...axiosOptions
});

this.head('/url' , {
    ...axiosOptions
});

this.options('/url' , {
    ...axiosOptions
});

this.put('/url' , {
    ...axiosOptions
});

this.patch('/url' , {
    ...axiosOptions
});

this.postForm('/url' , {
    ...axiosOptions
});

this.putForm('/url' , {
    ...axiosOptions
});

this.patchForm('/url' , {
    ...axiosOptions
});

```

## Feature Default Vue Portal (on working) 
## Feature Default Router (on working)

Sebetulnya saya memiliki ekspektasi built-in router juga seperti Next.js 

Dengan struktur folder sebagai berikut : 
.
├── app/
│   ├── pages/
│   │   ├── login/
│   │   │   ├── components/
│   │   │   │   └── login-hero.tpl
│   │   │   ├── login-otp.tpl
│   │   │   └── login-page.tpl
│   │   ├── singin/
│   │   │   ├── components/
│   │   │   │   └── signin-hero.tpl
│   │   │   └── singin-otp.tpl
│   │   └── articles/
│   │       ├── components/
│   │       │   └── articles-hero.tpl
│   │       ├── articles-list.tpl
│   │       └── articles-[id].tpl
│   └── layout/
│       ├── default/
│       │   └── default-layout.tpl
│       ├── signin/
│       │   └── signin-layout.tpl
│       └── otp/
│           └── otp-layout.tpl 
├── components/
│   └── input/
│       └── input-text.tpl
├── public/
│   ├── images
│   ├── svg
│   └── logo
└── libraries/
    ├── js
    └── css

Tapi bagaimana caranya ya? apakah kamu memiliki gambaran?


