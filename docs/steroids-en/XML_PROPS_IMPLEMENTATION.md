# XML-Style Props Implementation (Odoo Pattern)

This feature allows sending properties (props) to Vue components using nested XML syntax, resembling the **Odoo XML Views** architecture pattern. This feature is very useful for separating complex metadata definitions from main HTML attributes.

## 1. Basic Mechanism

The system will monitor the Virtual DOM structure when a component is created (`createComponent`). If a special node named `<props>` is found, the system will:
1. Extract the data inside it.
2. Convert that data into a JSON object.
3. Inject that object into the target component's `propsData`.
4. Remove the `<props>` node from the default slot so it does not interfere with the UI layout.

## 2. Syntax and Transformation Rules

### A. Simple Tags
Any tag inside `<props>` (except `<field>`) will be treated as a single key.

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

### B. `<field>` Tag (Array Collection)
Tags named `<field>` have special treatment. All `<field>` tags will be collected into a single property named `fields` as an **Array of Objects**.

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

## 3. Complete Implementation Example

### Usage in Template:
```vue
<custom-table>
    <props>
        <title>Daftar Pesanan</title>
        <limit>10</limit>
        <field name="name" string="Nomor" />
        <field name="date" string="Tanggal" />
        <field name="state" string="Status" />
    </props>
    
    <!-- Default Slot -->
    <template #default>
        <p>Tabel ini dikonfigurasi menggunakan XML Props.</p>
    </template>
</custom-table>
```

### Component Definition (Vue):
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

## 4. Source Code Location (Kernel)

This implementation is spread across several core files:
1. `src/core/vdom/create-component.ts`: VNode interception entry point.
2. `src/core/vdom/helpers/xml-props.ts`: Main XML to JSON parser logic.
3. `src/core/vdom/helpers/index.ts`: Helper export registration.

## 5. Benefits
- **Modularity**: Component metadata is visually separated from element attributes.
- **Template Cleanliness**: Reduces the use of overly long and hard-to-read `v-bind` statements.
- **Odoo Compatibility**: Simplifies migration of logic from Odoo XML Views to Vue-based applications.
