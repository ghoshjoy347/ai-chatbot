// Application State
let currentUser = null;
let currentChat = null;
let isTyping = false;
let usageChart = null;

// Sample Data
const sampleData = {
  conversations: [
    {
      id: "1",
      title: "Web Development Tips",
      messages: [
        {role: "user", content: "How do I optimize React performance?"},
        {role: "assistant", content: "Here are key React performance optimization techniques:\n\n1. **Use React.memo** for component memoization\n2. **Implement useCallback and useMemo** for expensive calculations\n3. **Code splitting** with React.lazy and Suspense\n4. **Optimize re-renders** by avoiding inline objects/functions\n5. **Use proper key props** in lists"}
      ],
      timestamp: "2025-09-03T10:30:00Z",
      provider: "openai"
    },
    {
      id: "2", 
      title: "AI Ethics Discussion",
      messages: [
        {role: "user", content: "What are the main ethical considerations in AI development?"},
        {role: "assistant", content: "Key ethical considerations in AI development include:\n\n• **Bias and Fairness**: Ensuring AI systems don't perpetuate discrimination\n• **Transparency**: Making AI decisions explainable and auditable\n• **Privacy**: Protecting user data and maintaining consent\n• **Accountability**: Clear responsibility chains for AI decisions\n• **Safety**: Preventing harmful or unintended consequences"}
      ],
      timestamp: "2025-09-02T15:45:00Z", 
      provider: "gemini"
    }
  ],
  userStats: {
    messagesUsed: 847,
    messagesLimit: 5000,
    currentPlan: "Pro",
    renewalDate: "2025-10-03",
    totalConversations: 23,
    averageResponseTime: "1.2s"
  },
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
    plan: "Pro"
  }
};

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  
  // Style the notification
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    background: type === 'success' ? 'rgba(16, 163, 127, 0.9)' : 'rgba(244, 67, 54, 0.9)',
    color: 'white',
    borderRadius: '8px',
    zIndex: '3000',
    fontSize: '14px',
    fontWeight: '500',
    backdropFilter: 'blur(10px)',
    animation: 'slideInRight 0.3s ease-out'
  });
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Navigation Functions
function showPage(pageId) {
  console.log('Navigating to page:', pageId);
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show target page
  const targetPage = document.getElementById(pageId + 'Page');
  if (targetPage) {
    targetPage.classList.add('active');
    
    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink && activeLink.classList.contains('nav-link')) {
      activeLink.classList.add('active');
    }
    
    // Handle page-specific initialization
    switch(pageId) {
      case 'dashboard':
        if (currentUser) {
          initDashboard();
        } else {
          showNotification('Please log in to access dashboard', 'error');
          showPage('login');
        }
        break;
      case 'chat':
        if (currentUser) {
          initChat();
        } else {
          showNotification('Please log in to start chatting', 'error');
          showPage('login');
        }
        break;
      case 'pricing':
        // No special initialization needed
        break;
    }
  } else {
    console.error('Page not found:', pageId + 'Page');
  }
}

// Authentication Functions
function login(email, password) {
  // Simulate authentication
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = sampleData.user;
      updateAuthUI();
      resolve(currentUser);
    }, 1000);
  });
}

function register(name, email, password) {
  // Simulate registration
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = {
        ...sampleData.user,
        name: name,
        email: email,
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
      };
      updateAuthUI();
      resolve(currentUser);
    }, 1000);
  });
}

function logout() {
  currentUser = null;
  currentChat = null;
  updateAuthUI();
  showPage('home');
  showNotification('Logged out successfully');
}

function updateAuthUI() {
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  
  if (currentUser) {
    navAuth.classList.add('hidden');
    navUser.classList.remove('hidden');
    
    // Update user avatar
    const avatarText = navUser.querySelector('.avatar-text');
    if (avatarText) {
      avatarText.textContent = currentUser.avatar;
    }
  } else {
    navAuth.classList.remove('hidden');
    navUser.classList.add('hidden');
  }
}

// Dashboard Functions
function initDashboard() {
  renderConversationsList();
  renderUsageChart();
}

function renderConversationsList() {
  const conversationsList = document.getElementById('conversationsList');
  if (!conversationsList) return;
  
  conversationsList.innerHTML = '';
  
  sampleData.conversations.forEach(conversation => {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.onclick = () => openChat(conversation.id);
    
    const preview = conversation.messages[0]?.content || '';
    const truncatedPreview = preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
    
    item.innerHTML = `
      <div class="conversation-title">${conversation.title}</div>
      <div class="conversation-preview">${truncatedPreview}</div>
      <div class="conversation-meta">
        <span class="provider-badge ${conversation.provider}">${conversation.provider.toUpperCase()}</span>
        <span>${formatDate(conversation.timestamp)}</span>
      </div>
    `;
    
    conversationsList.appendChild(item);
  });
}

function renderUsageChart() {
  const ctx = document.getElementById('usageChart');
  if (!ctx) return;
  
  // Destroy existing chart
  if (usageChart) {
    usageChart.destroy();
  }
  
  // Sample usage data for the last 7 days
  const usageData = [45, 67, 89, 123, 98, 134, 156];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  usageChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Messages',
        data: usageData,
        borderColor: 'rgba(102, 126, 234, 1)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      }
    }
  });
}

// Chat Functions
function initChat() {
  renderChatHistory();
  if (!currentChat) {
    showWelcomeMessage();
  } else {
    loadChat(currentChat.id);
  }
}

function renderChatHistory() {
  const chatHistory = document.getElementById('chatHistory');
  if (!chatHistory) return;
  
  chatHistory.innerHTML = '';
  
  sampleData.conversations.forEach(conversation => {
    const item = document.createElement('div');
    item.className = 'chat-history-item';
    if (currentChat && currentChat.id === conversation.id) {
      item.classList.add('active');
    }
    item.onclick = () => loadChat(conversation.id);
    
    item.innerHTML = `
      <div class="conversation-title">${conversation.title}</div>
      <div class="conversation-meta">
        <span class="provider-badge ${conversation.provider}">${conversation.provider.toUpperCase()}</span>
        <span>${formatDate(conversation.timestamp)}</span>
      </div>
    `;
    
    chatHistory.appendChild(item);
  });
}

function showWelcomeMessage() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  chatMessages.innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">🤖</div>
      <h3>Hello! I'm your AI assistant</h3>
      <p>Choose your AI provider above and start a conversation. I can help with coding, writing, analysis, and much more!</p>
    </div>
  `;
  
  document.getElementById('chatTitle').textContent = 'New Conversation';
}

function loadChat(chatId) {
  const conversation = sampleData.conversations.find(c => c.id === chatId);
  if (!conversation) return;
  
  currentChat = conversation;
  document.getElementById('chatTitle').textContent = conversation.title;
  
  // Update provider toggle
  const providerInputs = document.querySelectorAll('input[name="provider"]');
  providerInputs.forEach(input => {
    input.checked = input.value === conversation.provider;
  });
  
  renderMessages();
  renderChatHistory(); // Refresh to update active state
}

function renderMessages() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages || !currentChat) return;
  
  chatMessages.innerHTML = '';
  
  currentChat.messages.forEach((message, index) => {
    const messageEl = createMessageElement(message, index);
    chatMessages.appendChild(messageEl);
  });
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageElement(message, index) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${message.role}`;
  
  const avatar = message.role === 'user' 
    ? (currentUser?.avatar || 'U')
    : '🤖';
  
  messageEl.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-bubble">${formatMessageContent(message.content)}</div>
    </div>
  `;
  
  // Add animation delay
  setTimeout(() => {
    messageEl.style.opacity = '1';
    messageEl.style.transform = 'translateY(0)';
  }, index * 100);
  
  return messageEl;
}

function formatMessageContent(content) {
  // Convert markdown-like formatting to HTML
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function newChat() {
  currentChat = null;
  showWelcomeMessage();
  renderChatHistory();
  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.focus();
  }
}

function openChat(chatId) {
  showPage('chat');
  setTimeout(() => loadChat(chatId), 100);
}

async function sendMessage(content) {
  if (!content.trim() || isTyping) return;
  
  const provider = document.querySelector('input[name="provider"]:checked')?.value || 'openai';
  
  // Create new chat if doesn't exist
  if (!currentChat) {
    const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
    currentChat = {
      id: generateId(),
      title: title,
      messages: [],
      timestamp: new Date().toISOString(),
      provider: provider
    };
    
    sampleData.conversations.unshift(currentChat);
    document.getElementById('chatTitle').textContent = currentChat.title;
  }
  
  // Add user message
  const userMessage = { role: 'user', content: content };
  currentChat.messages.push(userMessage);
  
  // Clear input and render messages
  document.getElementById('messageInput').value = '';
  renderMessages();
  renderChatHistory();
  
  // Show typing indicator
  showTypingIndicator();
  
  // Simulate AI response
  setTimeout(() => {
    hideTypingIndicator();
    addAIResponse(content, provider);
  }, 1500 + Math.random() * 2000);
}

function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  const typingEl = document.createElement('div');
  typingEl.className = 'message assistant typing';
  typingEl.id = 'typingIndicator';
  
  typingEl.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  isTyping = true;
}

function hideTypingIndicator() {
  const typingEl = document.getElementById('typingIndicator');
  if (typingEl) {
    typingEl.remove();
  }
  isTyping = false;
}

function addAIResponse(userMessage, provider) {
  // Generate contextual AI response
  const responses = generateAIResponse(userMessage, provider);
  
  // Simulate streaming by adding response character by character
  const assistantMessage = { role: 'assistant', content: '' };
  currentChat.messages.push(assistantMessage);
  
  const messageEl = createMessageElement(assistantMessage, currentChat.messages.length - 1);
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.appendChild(messageEl);
  
  const messageContent = messageEl.querySelector('.message-bubble');
  let charIndex = 0;
  
  function typeCharacter() {
    if (charIndex < responses.length) {
      assistantMessage.content += responses[charIndex];
      messageContent.innerHTML = formatMessageContent(assistantMessage.content);
      charIndex++;
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setTimeout(typeCharacter, 30 + Math.random() * 70);
    }
  }
  
  typeCharacter();
}

function generateAIResponse(userMessage, provider) {
  const responses = {
    openai: [
      "As an AI assistant powered by OpenAI, I'd be happy to help you with that. Let me break this down for you:\n\n1. **First point**: This is an important consideration\n2. **Second point**: Here's another key aspect\n3. **Third point**: Don't forget about this\n\nWould you like me to elaborate on any of these points?",
      "That's a great question! Based on my training data, here are some insights:\n\n• **Key insight 1**: This is particularly relevant\n• **Key insight 2**: Consider this perspective\n• **Key insight 3**: This approach often works well\n\nLet me know if you need more specific information!",
      "I understand what you're asking about. Here's my analysis:\n\n**Overview**: This topic involves several important factors.\n\n**Details**: \n- Factor A: Significant impact\n- Factor B: Moderate influence\n- Factor C: Supporting element\n\n**Recommendation**: Based on this analysis, I'd suggest focusing on Factor A first.\n\nDoes this help address your question?"
    ],
    gemini: [
      "Hello! I'm Gemini, Google's AI assistant. I can help you explore this topic from multiple angles:\n\n🔍 **Analysis**: Let me examine the key components\n🎯 **Insights**: Here are the most relevant points\n💡 **Suggestions**: Consider these approaches\n\nThis is a fascinating area with lots of potential applications. What specific aspect interests you most?",
      "Great question! As Gemini, I can offer you a comprehensive perspective:\n\n**Context**: This relates to several interconnected concepts\n**Applications**: There are many practical uses\n**Considerations**: Keep these factors in mind\n\nI'm designed to be helpful, harmless, and honest in my responses. Would you like me to dive deeper into any particular area?",
      "I appreciate your curiosity about this topic! Let me share some thoughts:\n\n🌟 **Key Point 1**: This is fundamental to understanding\n🌟 **Key Point 2**: This builds on the previous concept\n🌟 **Key Point 3**: This ties everything together\n\nAs Google's Gemini AI, I'm here to provide accurate and helpful information. Is there a specific angle you'd like to explore further?"
    ]
  };
  
  const providerResponses = responses[provider] || responses.openai;
  return providerResponses[Math.floor(Math.random() * providerResponses.length)];
}

function toggleSidebar() {
  const sidebar = document.getElementById('chatSidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

// Modal Functions
function showModal(title, content) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (modal && modalTitle && modalBody) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function upgradePlan(plan) {
  const planNames = {
    pro: 'Pro Plan',
    enterprise: 'Enterprise Plan'
  };
  
  const content = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
      <h3 style="margin-bottom: 1rem;">Upgrade to ${planNames[plan]}</h3>
      <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem;">
        This is a demo application. In a real application, this would redirect to a payment processor like Stripe.
      </p>
      <button class="btn btn--primary" onclick="closeModal(); showNotification('Demo upgrade successful!')">
        Demo Upgrade
      </button>
    </div>
  `;
  
  showModal('Upgrade Plan', content);
}

// Initialize the application
function initializeApp() {
  console.log('Initializing application...');
  
  // Set up navigation event delegation
  document.addEventListener('click', function(e) {
    const target = e.target;
    
    // Handle data-page navigation
    if (target.hasAttribute('data-page') || target.closest('[data-page]')) {
      e.preventDefault();
      const pageElement = target.hasAttribute('data-page') ? target : target.closest('[data-page]');
      const page = pageElement.getAttribute('data-page');
      console.log('Navigation clicked:', page);
      showPage(page);
      return;
    }
    
    // Handle upgrade buttons
    if (target.onclick && target.onclick.toString().includes('upgradePlan')) {
      // Let the onclick handle it
      return;
    }
  });
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const navMenu = document.getElementById('navMenu');
      if (navMenu) {
        navMenu.classList.toggle('active');
      }
    });
  }
  
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[type="email"]').value;
      const password = loginForm.querySelector('input[type="password"]').value;
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;
      
      try {
        await login(email, password);
        showNotification('Login successful!');
        showPage('dashboard');
      } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = registerForm.querySelector('input[type="text"]').value;
      const email = registerForm.querySelector('input[type="email"]').value;
      const password = registerForm.querySelector('input[type="password"]').value;
      
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;
      
      try {
        await register(name, email, password);
        showNotification('Account created successfully!');
        showPage('dashboard');
      } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Chat form
  const chatForm = document.getElementById('chatForm');
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const messageInput = document.getElementById('messageInput');
      if (!messageInput) return;
      
      const message = messageInput.value.trim();
      
      if (message && currentUser) {
        sendMessage(message);
      } else if (!currentUser) {
        showNotification('Please log in to start chatting', 'error');
        showPage('login');
      }
    });
  }
  
  // Initialize UI
  updateAuthUI();
  showPage('home');
  
  // Add some demo interactivity
  setTimeout(() => {
    // Animate progress bars
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = width;
      }, 1000);
    });
  }, 2000);
  
  // Simulate real-time updates
  setInterval(() => {
    if (currentUser && document.querySelector('.page.active')?.id === 'dashboardPage') {
      // Update some stats randomly
      const statsValue = document.querySelector('.stat-value');
      if (statsValue && Math.random() > 0.95) {
        const currentValue = parseInt(statsValue.textContent);
        statsValue.textContent = (currentValue + 1) + ' ';
        statsValue.innerHTML += '<span class="stat-limit">/ 5,000</span>';
      }
    }
  }, 5000);
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Escape to close modal
  if (e.key === 'Escape') {
    closeModal();
    
    // Close mobile sidebar if open
    const sidebar = document.getElementById('chatSidebar');
    if (sidebar && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
    }
  }
  
  // Ctrl/Cmd + Enter to send message
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const messageInput = document.getElementById('messageInput');
    if (messageInput && document.activeElement === messageInput) {
      const chatForm = document.getElementById('chatForm');
      if (chatForm) {
        chatForm.dispatchEvent(new Event('submit'));
      }
    }
  }
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .nav-menu.active {
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(30, 60, 114, 0.95);
    backdrop-filter: blur(10px);
    flex-direction: column;
    padding: 1rem;
    border-radius: 0 0 16px 16px;
    gap: 0.5rem;
    z-index: 1000;
  }
  
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }
  }
`;
document.head.appendChild(style);

// Export functions for global access
window.logout = logout;
window.newChat = newChat;
window.toggleSidebar = toggleSidebar;
window.closeModal = closeModal;
window.upgradePlan = upgradePlan;