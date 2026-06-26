<script>
  module.exports = {
    props: {
      username: { type: String, default: 'unknown' },
      role: { type: String, default: 'User' },
      joined: { type: String, default: '' }
    },
    data: function() {
      return {
        expanded: false
      }
    },
    computed: {
      roleBadgeClass: function() {
        var roles = {
          'Admin': 'badge-admin',
          'Editor': 'badge-editor',
          'User': 'badge-user'
        }
        return roles[this.role] || 'badge-user'
      },
      joinedFormatted: function() {
        if (!this.joined) return 'Unknown'
        var d = new Date(this.joined)
        return d.toLocaleDateString('id-ID', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      }
    }
  }
</script>
<template>
  <div class="user-profile">
    <div class="profile-header" @click="expanded = !expanded">
      <div class="profile-avatar" v-text="username.charAt(0).toUpperCase()"></div>
      <div class="profile-info">
        <div class="profile-name" v-text="username"></div>
        <span :class="'badge ' + roleBadgeClass" v-text="role"></span>
      </div>
      <span class="expand-icon" v-text="expanded ? '▾' : '▸'"></span>
    </div>
    <div v-if="expanded" class="profile-detail">
      <div class="detail-row">
        <span class="detail-label">Joined</span>
        <span class="detail-value" v-text="joinedFormatted"></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Component</span>
        <span class="detail-value">Loaded via SSR Bundle</span>
      </div>
    </div>
  </div>
</template>
<style>
  .user-profile {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background: white;
    transition: box-shadow 0.2s;
  }
  .user-profile:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .profile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    cursor: pointer;
    user-select: none;
  }
  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
  }
  .profile-info { flex: 1; }
  .profile-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 2px;
  }
  .badge {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
  }
  .badge-admin { background: #fee2e2; color: #dc2626; }
  .badge-editor { background: #dbeafe; color: #2563eb; }
  .badge-user { background: #f3f4f6; color: #6b7280; }
  .expand-icon {
    font-size: 12px;
    color: #9ca3af;
    transition: transform 0.2s;
  }
  .profile-detail {
    padding: 0 16px 14px;
    border-top: 1px solid #f3f4f6;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
  }
  .detail-label { color: #9ca3af; }
  .detail-value { color: #374151; font-weight: 500; }
</style>
