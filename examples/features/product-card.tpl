<script>

module.exports = {
    props : {
        fields : Array , 
        title : String,
        price : Number,
        is_active : Boolean,
        internal_ref : String
    },
}

</script>

<template>
    <div class="product-card-modern">
        <div class="card-inner" :class="{ 'is-inactive': !is_active }">
            <div class="card-title">{{ title }}</div>
            <div class="card-price">${{ price }}</div>
            
            {{ fields }}
            <div class="card-fields" v-if="fields && fields.length">
                <div v-for="f in fields" :key="f.name" class="field-row">
                    <span class="f-label">{{ f.name }}:</span>
                    <span class="f-value">{{ f.value || 'N/A' }}</span>
                </div>
            </div>

            <slot></slot>
        </div>
    </div>
</template>

<style>
    .product-card-modern {
        background: #2d3436;
        border-radius: 12px;
        padding: 20px;
        color: white;
        border: 1px solid #444;
        margin-bottom: 15px;
    }
    .is-inactive { opacity: 0.5; filter: grayscale(1); }
    .card-title { font-weight: bold; font-size: 1.2rem; color: #fab1a0; }
    .card-price { font-size: 1.1rem; color: #55efc4; margin-bottom: 10px; }
    .field-row { font-size: 0.85rem; margin-top: 5px; display: flex; gap: 10px; }
    .f-label { color: #b2bec3; }
</style>