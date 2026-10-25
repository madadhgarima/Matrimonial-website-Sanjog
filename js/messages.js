/**
 * =============================================================================
 * Sanjog Matrimonial - Messaging Module (js/messages.js)
 * =============================================================================
 * Responsibility:
 * Powers the interactive matrimonial chat interface on messages.html / message.html.
 * Handles contact conversation threads, message history rendering, new message
 * submission, simulated family auto-replies, and call requests.
 * =============================================================================
 */

(function () {
  'use strict';

  /**
   * Initializes messaging page: handles chat threads, message sending, and simulated responses
   */
  function initMessagingPage() {
    const chatContainer = document.querySelector('.chat-container');
    if (!chatContainer) return;

    const conversationItems = chatContainer.querySelectorAll('.conversation-item');
    const chatMessages = chatContainer.querySelector('.chat-messages');
    const chatForm = chatContainer.querySelector('.chat-input-bar');
    const chatHeader = chatContainer.querySelector('.chat-header');
    const headerTitle = chatHeader?.querySelector('h4');
    const headerImg = chatHeader?.querySelector('img');
    const biodataLink = chatHeader?.querySelector('a.btn-outline');
    const requestCallBtn = chatHeader?.querySelector('a.btn-secondary, button.btn-secondary');

    // Contact threads storage
    const threads = {
      'Dr. Priya Sharma': [
        { type: 'received', text: 'Namaste! I reviewed your profile on Sanjog. Our family values, education, and career aspirations seem very compatible. 😊', time: '10:35 AM' },
        { type: 'sent', text: 'Namaste Priya! Thank you so much for reaching out. I also shared your biodata with my parents and they were very pleased with the horoscope match.', time: '10:38 AM' },
        { type: 'received', text: 'That is wonderful! My family is based in South Delhi. Would you be comfortable with an introductory phone call or video meeting this Sunday?', time: '10:42 AM' }
      ],
      'Ananya Joshi': [
        { type: 'received', text: 'Hello! Liked your profile and educational background. Shared your details with my parents.', time: 'Yesterday' },
        { type: 'sent', text: 'Hi Ananya! Pleasure connecting. Your UI/UX work in Mumbai looks truly impressive.', time: 'Yesterday' }
      ],
      'Rohan Mehta': [
        { type: 'received', text: 'Namaste! Are you currently based in Delhi NCR? Let\'s plan a family meeting this weekend.', time: 'Sep 11' }
      ]
    };

    let activeContact = 'Dr. Priya Sharma';

    function renderThread(contactName) {
      if (!chatMessages) return;
      chatMessages.innerHTML = '';
      const msgs = threads[contactName] || [];

      let contactImg = 'images/profile1.jpg';
      if (contactName.includes('Ananya')) contactImg = 'images/profile3.jpg';
      if (contactName.includes('Rohan')) contactImg = 'images/profile2.jpg';

      msgs.forEach(m => {
        const row = document.createElement('div');
        row.className = `chat-bubble-row ${m.type}`;
        row.style.cssText = `display: flex; gap: 10px; align-items: flex-end; ${m.type === 'sent' ? 'justify-content: flex-end;' : ''}`;

        if (m.type === 'received') {
          row.innerHTML = `
            <img src="${contactImg}" alt="${contactName}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <div class="bubble received" style="max-width: 75%; padding: 12px 18px; font-size: 13.5px; line-height: 1.5; background: #ffffff; color: var(--text-dark); border: 1px solid var(--border-light); border-radius: 18px 18px 18px 4px; box-shadow: 0 1px 4px rgba(59,41,44,0.04);">
              ${m.text}
              <div style="font-size: 10.5px; color: var(--text-muted); text-align: right; margin-top: 4px;">${m.time}</div>
            </div>
          `;
        } else {
          row.innerHTML = `
            <div class="bubble sent" style="max-width: 75%; padding: 12px 18px; font-size: 13.5px; line-height: 1.5; background: var(--primary); color: #ffffff; border-radius: 18px 18px 4px 18px; box-shadow: 0 1px 4px rgba(59,41,44,0.08);">
              ${m.text}
              <div style="font-size: 10.5px; color: rgba(255,255,255,0.8); text-align: right; margin-top: 4px;">${m.time} ✔✔</div>
            </div>
            <img src="images/profile2.jpg" alt="User" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          `;
        }
        chatMessages.appendChild(row);
      });

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Switch conversations on click
    conversationItems.forEach(item => {
      item.addEventListener('click', () => {
        conversationItems.forEach(i => {
          i.classList.remove('active');
          i.style.background = '';
        });
        item.classList.add('active');
        item.style.background = 'rgba(141,63,80,0.07)';

        const nameEl = item.querySelector('strong');
        if (nameEl) {
          activeContact = nameEl.textContent.trim();
          if (headerTitle) headerTitle.textContent = activeContact;

          let imgUrl = 'images/profile1.jpg';
          let profileId = '1';
          if (activeContact.includes('Ananya')) { imgUrl = 'images/profile3.jpg'; profileId = '3'; }
          if (activeContact.includes('Rohan')) { imgUrl = 'images/profile2.jpg'; profileId = '2'; }

          if (headerImg) headerImg.src = imgUrl;
          if (biodataLink) biodataLink.href = `profile.html?id=${profileId}`;
          renderThread(activeContact);
        }
      });
    });

    // Send Message Form
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = chatForm.querySelector('input[type="text"]');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (!threads[activeContact]) threads[activeContact] = [];
        threads[activeContact].push({ type: 'sent', text, time: timeStr });
        renderThread(activeContact);

        // Simulated auto-reply after 1.2 seconds
        setTimeout(() => {
          const replies = [
            'Thank you for your message! Looking forward to speaking with our families.',
            'That sounds wonderful! I will discuss with my parents and confirm our meeting time.',
            'Namaste! Appreciate your response. Sanjog has indeed made finding genuine connections easier.'
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          threads[activeContact].push({ type: 'received', text: randomReply, time: replyTime });
          renderThread(activeContact);
          if (typeof window.showToast === 'function') {
            window.showToast(`New message received from ${activeContact}! 💬`, 'info');
          }
        }, 1200);
      });
    }

    // Request call button
    if (requestCallBtn) {
      requestCallBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.showToast === 'function') {
          window.showToast(`Introductory call request sent to ${activeContact}! 📞`, 'success');
        }
      });
    }
  }

  // Export to window
  window.initMessagingPage = initMessagingPage;

})();
