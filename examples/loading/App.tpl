<script>
module.exports = {
    asyncComponents: [
        { name: 'slow-box', path: '/examples/loading/SlowBox' }
    ],
    data() {
        return {
            status: 'Ready'
        }
    }
}
</script>

<template scope="loading">
    <div style="padding: 50px; text-align: center; background: #f8f9fa; border-radius: 12px; border: 2px dashed #dee2e6;">
        <div class="loader"></div>
        <h2 style="color: #6c757d; margin-top: 20px;">Menyiapkan Dashboard...</h2>
        <p style="color: #adb5bd;">Sedang memuat komponen asinkron ke dalam memori.</p>
    </div>
</template>

<template>
    <div style="padding: 30px; background: white; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #212529; margin-top: 0;">Dashboard Utama</h1>
        <p>Status: <span style="color: #28a745; font-weight: bold;">{{ status }}</span></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
        <slow-box />
        
        <div style="margin-top: 20px;">
            <button @click="status = 'Updated!'" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Update Status
            </button>
        </div>
    </div>
</template>

<style>
.loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    display: inline-block;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
