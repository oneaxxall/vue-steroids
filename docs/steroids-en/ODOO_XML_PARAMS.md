## Propose XML Support 

Now we both know how to apply Vue 2.7 props/properties, right:

```javascript
Vue.component( 'default-component' , {
    props : {
        name : {
            default : 'Budi' , 
            type : String
        }, 

        fields : {
            default : {} , 
            type : Array
        }
    } ,
});
```

So this is how you apply it, right?

<default-component 
    v-bind:name="'User 1'" 
    v-bind:fields="[
        {'name' : 'Product', 'field': 'product_id'},
        {'name' : 'Quantity', 'field': 'quantity'},
    ]">
</default-component>

Now, in this proposal, we are adding a feature like the following:

```vue

<default-component>
    <props> // do not put this in the default slot
        <name>ini adalah name</name> // this is for name 
        <field name="name" type="string" />
        <field name="fields" type="array" /> // this 
        is for fields
    </props>
</default-component>

```
The xml script above becomes json like this:
{
    "name" : "ini adalah name",
    "fields" : [
        {"name" : "name", "type" : "string"},
        {"name" : "fields", "type" : "array"}
    ]
}

Is it possible for us to create an Odoo module that can accept input like the one above and directly convert it into props for a Vue component?

If possible, please create a Proof of Concept for me. So I can immediately apply it to the Odoo-like project I am developing.


## Proof of Concept

I have compiled a technical document explaining the mechanism, data flow, and transformation examples below.

````markdown
# Proof of Concept: XML-Style Props Support for Vue 2.7

## 1. Background
In a modular architecture like Odoo, parameters are often passed through nested XML structures rather than long HTML attributes. The goal is to make templates cleaner and support complex data structures (such as arrays of objects) directly without writing JSON manually in the template.

## 2. Working Mechanism
We will perform interception at the **Virtual DOM (VDOM)** level, specifically in the `createComponent` function in Vue core.

### Process Flow:
1. **Detection**: When a component is rendered, the system will check if there is a `<props>` tag among its children.
2. **Extraction**: If found, the system will parse the content inside `<props>` into a JSON object.
3. **Injection**: The resulting JSON object will be injected into the component's `propsData`.
4. **Cleanup**: The `<props>` tag will be removed from the children list so it does not enter the `default slot` and does not interfere with UI rendering.

## 3. Transformation Example

### Input (XML Syntax):
```xml
<default-component>
    <props>
        <name>Ahmad Wahyudin</name>
        <field name="product_id" type="many2one" relation="product.product" />
        <field name="qty" type="float" />
    </props>
</default-component>
```

### Output (JSON Props Received by Component):
```json
{
  "name": "Ahmad Wahyudin",
  "fields": [
    { "type": "many2one", "relation": "product.product" },
    { "type": "float" }
  ]
}
```

## 4. Implementation Plan in Kernel
We will add a new helper `extractXmlProps` in `src/core/vdom/helpers/xml-props.ts` with the following logic:

1. **Simple Tags**: `<title>Hello</title>` becomes `props.title = "Hello"`.
2. **Repeated/Array Tags**: If there is a `<field>` tag, it will automatically be collected into the `props.fields` array (similar to Odoo logic).
3. **Attributes**: Attributes on the tag (such as `type="string"`) will be parsed into object properties within that array.

## 5. Benefits
- **Modularity**: Odoo developers will feel familiar because the syntax is identical to Odoo XML Views.
- **Readability**: Avoids "Attribute Hell" where a single component tag has 20 `v-bind` attributes.
- **Type Safety**: We can perform data type validation during XML parsing before data enters the component.

````

### Does This Concept Meet Your Needs?
If this concept is suitable, I can proceed to officially implement it into the core framework. This method is very stable because it works at the VNode level, thus supporting both static templates and templates loaded dynamically via AJAX.
