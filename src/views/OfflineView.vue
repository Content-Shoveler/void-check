<template>
  <div class="offline-view">
    <div class="offline-container">
      <div class="offline-icon">
        <div class="planet"></div>
        <div class="orbit">
          <div class="satellite"></div>
        </div>
      </div>
      
      <h1>You're Offline</h1>
      <p class="offline-message">
        It looks like you've lost your connection to the mothership.
        Don't worry, VoidCheck works completely offline!
      </p>
      
      <div class="offline-actions">
        <v-button 
          variant="primary" 
          @click="goHome"
        >
          Return to Home
        </v-button>
        
        <v-button 
          variant="tertiary" 
          @click="retryConnection"
        >
          Retry Connection
        </v-button>
      </div>
      
      <div class="offline-info">
        <h2>While you're offline:</h2>
        <ul>
          <li>You can view and manage your existing tasks</li>
          <li>Create new tasks and they'll sync when you're back online</li>
          <li>Your data is safely stored on your device</li>
        </ul>
      </div>
      
      <div v-if="redirectUrl" class="redirect-message">
        <p>
          You were trying to access:
          <span class="redirect-url">{{ redirectUrl }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VButton from '@/components/ui/base/VButton.vue';

export default defineComponent({
  name: 'OfflineView',
  
  components: {
    VButton
  },
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // Get the redirect URL if available
    const redirectUrl = computed(() => route.query.redirect as string || null);
    
    // Retry connection status
    const isRetrying = ref(false);
    
    // Navigation
    const goHome = () => {
      router.push('/');
    };
    
    // Retry connection
    const retryConnection = () => {
      isRetrying.value = true;
      
      setTimeout(() => {
        // Check if we're back online
        if (navigator.onLine) {
          // If there was a redirect URL, go there
          if (redirectUrl.value) {
            router.push(redirectUrl.value);
          } else {
            // Otherwise, go home
            goHome();
          }
        } else {
          // Still offline
          isRetrying.value = false;
        }
      }, 1500);
    };
    
    return {
      redirectUrl,
      isRetrying,
      goHome,
      retryConnection
    };
  }
});
</script>

<style lang="scss">
.offline-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  
  .offline-container {
    max-width: 600px;
    padding: 2rem;
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    text-align: center;
    animation: fadeIn 0.5s ease-in-out;
    
    .offline-icon {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto 2rem;
      
      .planet {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
        border-radius: 50%;
        box-shadow: 0 0 20px rgba(156, 39, 176, 0.5);
      }
      
      .orbit {
        position: absolute;
        top: 0;
        left: 0;
        width: 100px;
        height: 100px;
        border: 1px dashed rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        animation: rotate 8s linear infinite;
        
        .satellite {
          position: absolute;
          top: -4px;
          left: 50%;
          width: 8px;
          height: 8px;
          background-color: var(--color-accent);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--color-accent);
        }
      }
    }
    
    h1 {
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
      font-size: 2rem;
    }
    
    .offline-message {
      margin-bottom: 2rem;
      color: var(--color-text-secondary);
      font-size: 1.1rem;
    }
    
    .offline-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .offline-info {
      text-align: left;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: var(--radius-md);
      
      h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
      
      ul {
        padding-left: 1.5rem;
        
        li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
      }
    }
    
    .redirect-message {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      
      .redirect-url {
        display: block;
        font-family: 'JetBrains Mono', monospace;
        padding: 0.5rem;
        margin-top: 0.5rem;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: var(--radius-sm);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .offline-view {
    .offline-container {
      margin: 0 1rem;
      padding: 1.5rem;
      
      .offline-actions {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  }
}
</style>
