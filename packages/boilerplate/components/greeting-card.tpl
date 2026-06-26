<script>
  module.exports = {
    props: {
      name: { type: String, default: 'Guest' },
      avatar: { type: String, default: '' }
    },
    data: function() {
      return {
        liked: false,
        likeCount: 0
      }
    },
    computed: {
      initial: function() {
        return this.name ? this.name.charAt(0).toUpperCase() : '?'
      }
    },
    methods: {
      toggleLike: function() {
        this.liked = !this.liked
        this.likeCount += this.liked ? 1 : -1
      }
    }
  }
</script>
<template> 
  <div class="greeting-card">
    <div class="card-avatar">
      <span v-text="initial"></span>
    </div>
    <div class="card-body">
      <h3 class="card-name" v-text="name"></h3>
      <p class="card-desc">Hello, <strong v-text="name"></strong>! Selamat datang di Vue Steroids SSR.</p>
      <div class="card-actions">
        <button @click="toggleLike" :class="liked ? 'liked' : ''">
          <span v-text="liked ? '❤️' : '🤍'"></span>
          <span v-text="likeCount"></span>
        </button>
      </div>
    </div>
  </div>
</template>
<style>
  .greeting-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    border: 1px solid #bbf7d0;
    border-radius: 16px;
    transition: box-shadow 0.2s;
  }
  .greeting-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  .card-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 20px;
    flex-shrink: 0;
  }
  .card-body { flex: 1; }
  .card-name {
    font-size: 16px;
    font-weight: 600;
    color: #065f46;
    margin: 0 0 4px;
  }
  .card-desc {
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 10px;
  }
  .card-actions button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border: 1px solid #d1d5db;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  .card-actions button.liked {
    border-color: #fecaca;
    background: #fef2f2;
  }
</style>
