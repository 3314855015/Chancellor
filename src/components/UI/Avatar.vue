<template>
  <div class="avatar">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#87CEEB"/>
      <circle cx="20" cy="15" r="5" fill="#2c3e50"/>
      <path d="M10 30C10 25 15 22 20 22C25 22 30 25 30 30" stroke="#2c3e50" stroke-width="2" fill="none"/>
    </svg>
  </div>
</template>

<style scoped>
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(135, 206, 235, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(135, 206, 235, 0.4);
}
</style>