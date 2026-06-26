# XML-Style Props Implementation (Odoo Pattern)

Fitur ini memungkinkan pengiriman properties (props) ke komponen Vue menggunakan sintaks XML bersarang, menyerupai pola arsitektur **Odoo XML Views**. Fitur ini sangat berguna untuk memisahkan definisi metadata yang kompleks dari atribut HTML utama.

## 1. Mekanisme Dasar

Sistem akan memantau struktur Virtual DOM pada saat komponen dibuat (`createComponent`). Jika ditemukan node khusus bernama `<props>`, sistem akan:
1. Mengekstrak data di dalamnya.
2. Mengonversi data tersebut menjadi objek JSON.
3. Menyuntikkan objek tersebut ke dalam `propsData` komponen target.
4. Menghapus node `<props>` dari slot default agar tidak mengganggu layout UI.

## 2. Sintaks dan Aturan Transformasi

### A. Tag Sederhana
Tag apa pun di dalam `<props>` (kecuali `<field>`) akan dianggap sebagai key tunggal.

**Input:**
```xml
<props>
    <title>Dashboard Penjualan</title>
    <version>2.0.1</version>
</props>
```
**JSON Result:**
```json
{
  "title": "Dashboard Penjualan",
  "version": "2.0.1"
}
```

### B. Tag `<field>` (Koleksi Array)
Tag bernama `<field>` memiliki perlakuan khusus. Semua tag `<field>` akan dikumpulkan ke dalam satu properti bernama `fields` dalam bentuk **Array of Objects**.

**Input:**
```xml
<props>
    <field name="partner_id" type="many2one" string="Pelanggan" />
    <field name="amount_total" type="monetary" string="Total" />
</props>
```
**JSON Result:**
```json
{
  "fields": [
    { "name": "partner_id", "type": "many2one", "string": "Pelanggan" },
    { "name": "amount_total", "type": "monetary", "string": "Total" }
  ]
}
```

## 3. Contoh Implementasi Lengkap

### Penggunaan di Template:
```vue
<custom-table>
    <props>
        <title>Daftar Pesanan</title>
        <limit>10</limit>
        <field name="name" string="Nomor" />
        <field name="date" string="Tanggal" />
        <field name="state" string="Status" />
    </props>
    
    <!-- Slot Default -->
    <template #default>
        <p>Tabel ini dikonfigurasi menggunakan XML Props.</p>
    </template>
</custom-table>
```

### Definisi Komponen (Vue):
```javascript
Vue.component('custom-table', {
    props: {
        title: String,
        limit: [String, Number],
        fields: Array
    },
    template: `
        <div class="table-container">
            <h3>{{ title }}</h3>
            <table>
                <thead>
                    <tr v-for="f in fields" :key="f.name">
                        <th>{{ f.string }}</th>
                    </tr>
                </thead>
            </table>
            <slot></slot>
        </div>
    `
});
```

## 4. Lokasi Source Code (Kernel)

Implementasi ini tersebar di beberapa file core berikut:
1. `src/core/vdom/create-component.ts`: Titik masuk intersepsi VNode.
2. `src/core/vdom/helpers/xml-props.ts`: Logika utama parser XML ke JSON.
3. `src/core/vdom/helpers/index.ts`: Registrasi export helper.

## 5. Keuntungan
- **Modularitas**: Metadata komponen terpisah secara visual dari atribut elemen.
- **Kebersihan Template**: Mengurangi penggunaan `v-bind` yang terlalu panjang dan sulit dibaca.
- **Odoo Compatibility**: Mempermudah migrasi logika dari Odoo XML View ke aplikasi berbasis Vue.
