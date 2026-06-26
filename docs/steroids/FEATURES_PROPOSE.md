## Reactive Built-in ✅

Support penggunaan : 


```javascript 

reactive( name , value , options );

// parameter pertama: nama state 
// parameter kedua: value 
// parameter ketiga: options (optional)

const state = reactive( "state" , {
    counter : 1,
    user : {
        name : 'Ahmad' 
    }, 
    data : [
        {
            id : 1,
            name : 'User 1',
            role : 'admin' // role bisa berubah-ubah
        },
        {
            id : 2,
            name : 'User 2',
            role : 'user' // role bisa berubah-ubah
        },
        {
            id : 3,
            name : 'User 3',
            role : 'user' // role bisa berubah-ubah
        }
    ]
});

// initial state 

state.watch('user.name' , function (newValue , oldValue) {
    console.log('User name has changed!');
});

state.watch('counter', function(newValue , oldValue) {
    console.log('Counter has changed!' , newValue, oldValue);
});

// setelah initial 
state.counter++; // maka watch akan jalan
state.user.name = 'Wahyu'; // maka watch akan jalan karena string 
state.user = {
    name : 'Test' // maka watch tidak akan jalan karena property di dalam object itu sendiri berbeda
};

const watchData = state.watch('data', function(newValue , oldValue) {
    console.log('Data has changed!' , newValue, oldValue);
}, true); // true = deep watch

watchData(); // detroy listener

state.data.push({
    id : 4,
    name : 'User 4',
    role : 'admin'
}); // maka watch akan jalan

```
Otomatis teregister pada Vue prototype sebagai this.$reactive.${namareactive}, jika tidak ditemukan nama reactivenya makan jangan langsung di trhow error, akan tetapi return balikannya object {} :  

```javascript 
Vue.component({
    watch : {
        '$reactive.state.counter' : function (newValue , oldValue) {
            console.log('Counter has changed!' , newValue, oldValue);
        }
    }
});

```

## Route Built-in

Cara akses didalam component : 

```javascript 
Vue.component({
    
    watch : {
        '$route.hash' : function (newValue , oldValue) {
            console.log('Route hash has changed!' , newValue, oldValue);
        },
        '$route.path1' : function (newValue , oldValue) {
            console.log('Route path has changed!' , newValue, oldValue);
        },
        '$route.path2' : function (newValue , oldValue) {
            console.log('Route path has changed!' , newValue, oldValue);
        },
        '$route.path3' : function (newValue , oldValue) {
            console.log('Route path has changed!' , newValue, oldValue);
        },
        '$route.path4' : function (newValue , oldValue) {
            console.log('Route path has changed!' , newValue, oldValue);
        },
        '$route.path5' : function (newValue , oldValue) {
            console.log('Route path has changed!' , newValue, oldValue);
        },
        '$route.current' : function (newValue , oldValue) {
            console.log('Route path has changed!' , newValue, oldValue);
        },
        '$route.query' : function (newValue , oldValue) {
            console.log('Route query has changed!' , newValue, oldValue);
        },
        '$route.params' : function (newValue , oldValue) {
            console.log('Route params has changed!' , newValue, oldValue);
        },
        '$route.path' : function (newValue , oldValue) {
            console.log('Route path has changed!' , newValue, oldValue);
        },
        '$route.meta' : function (newValue , oldValue) {
            console.log('Route meta has changed!' , newValue, oldValue);
        },
        '$route.fullPath' : function (newValue , oldValue) {
            console.log('Route fullPath has changed!' , newValue, oldValue);
        },
        '$route.name' : function (newValue , oldValue) {
            console.log('Route name has changed!' , newValue, oldValue);
        },
        '$route.matched' : function (newValue , oldValue) {
            console.log('Route matched has changed!' , newValue, oldValue);
        },
        '$route.redirectedFrom' : function (newValue , oldValue) {
            console.log('Route redirectedFrom has changed!' , newValue, oldValue);
        }
    },

    mounted : function () {
        
    }, 

    template : `
        <div>
            <a click="$route.push('/')">Home</a>
            <a click="$route.push('/about')">About</a>
            <a click="$route.push('/contact')">Contact</a>

            <a click="$route.back()">Back</a>
            <a click="$route.forward()">Forward</a>
            <a click="$route.replace({ name : 'contact' })">Replace</a>

        </div>
    `
});

```

## Portal 
Bisakah kamu tambahkan portal built-in seperti yang di miliki oleh vue portal 2 disini https://v2.portal-vue.linusb.org/, yang sangat berguna untuk modal dan yang lainnya

Cara penggunaannya seperti berikut :

```html
<portal to="place">
    <div @click="alert(1);">Click alert</div>
</portal>
<portal-target name="place"></portal-target>
```
## Dynamic Component Loading State ✅

Support penggunaan <template scope="loading"> untuk merender placeholder UI selama asyncComponents sedang dimuat.

Cara penggunaannya:

```html
<script>
module.exports = {
    asyncComponents : [
        'component1',
        'component2',
        { name: 'component3', path: '/custom/path' }
    ], 
};
</script>

<!-- Template ini dirender selama asyncComponents sedang dimuat -->
<template scope="loading">
    <div class="loading-state">
        <p>Sedang memuat dependensi...</p>
    </div>
</template>

<!-- Template ini dirender setelah semua selesai -->
<template>
    <div class="main-content">
        <component1 />
        <component2 />
        <component3 />
    </div>
</template>
```

Sistem akan otomatis mengelola properti $loading reaktif dan menukar render function secara on-the-fly.
