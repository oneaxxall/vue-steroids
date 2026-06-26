Server Side Rendering Vue 2.7

Todo list :
1. Menambahkan konfigurasi Vue config 
```json 
"serverSide": true, 
"serverSideURL : "http://localhost:8485"
```
2. Membuat server side rendering custom 
Client mengirimkan nama component menggunakan object yang sama

```javascript

// skenario load async component
Vue.loadAsyncComponents({
    name : 'component-name',
    path : '/path/to/component-name' 
})

/**
 * Skenario menggunakan asyncComponents options 
 * akan otomatis mengirimkan isi array dari asyncComponents
 * Lalu server menggabungkan semua isinya 
 * Dari masing-masing component tersebut akan terdefinisi menggunakan Vue.dynamicComponent('component-1' , options) 
 * **/
{
    asyncComponents : [
        '/path/to/component-1' , 
        '/path/to/component-2' ,
        '/path/to/component-3' , 
    ]
}
```

Sebagai contoh :
1. component-1.tpl
```html 
<script>
module.exports = {
    data : () => ({

    }),

    methods : {
        handleLoad() {}
    }, 
}
</script>

<template scope="loading">
    This is when component is loading 
<template>

</template>

</template>
```

Maka secara otomatis akan terdefine sebagai berikut : 
```javascript
Vue.defineDynamicComponent('component-1' , {
    data : () => ({

    }),

    methods : {
        handleLoad() {}
    },
    loadingTemplate : `....` , 
    template : `...` , 
})
```
Apabila menggunakan asyncComponents multiple maka akan jadi 1 package file dengan nama sesuai dengan componentnya misal sebagai contoh yang load adalah dari component 'component-1' maka akan menjadi 'async-component-1.js', yang isinya akan menjadi seperti  ini dan minified : 

```javascript
Vue.defineDynamicComponent('component-1' , {
    data : () => ({

    }),

    methods : {
        handleLoad() {}
    }, 
    loadingTemplate : `....` , 
    template : `...` , 
})

Vue.defineDynamicComponent('component-2' , {
    data : () => ({

    }),

    methods : {
        handleLoad() {}
    }, 
    loadingTemplate : `....` , 
    template : `...` , 
})

Vue.defineDynamicComponent('component-3' , {
    data : () => ({

    }),

    methods : {
        handleLoad() {}
    }, 
    loadingTemplate : `....` , 
    template : `...` , 
})
```
Apakah bisa support cached ? Jika support cached maka component yang sudah di define tidak perlu di masukan lagi kedalam pack file js (penting sekali untuk bisa cached).

Notes : 
Apabila serverSide : true maka wajib asyncComponents option, dan loadAsyncComponent mengambil dari server. Apabila serverSide false maka load dari client saja .