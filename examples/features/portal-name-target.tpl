<script>

module.exports = {};

</script>


<template>

    <div class="box target-active">
        <h3>Component B (Loaded with Delay)</h3>
        <p>Saya baru saja muncul setelah setTimeout! Berikut isi portalnya:</p>
        <div style="border: 2px solid #6366f1; padding: 15px; border-radius: 4px; background: white;">
            <portal-target name="simple-test"></portal-target>
        </div>
    </div>

</template>