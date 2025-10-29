// Lightweight Gemini chat widget injected on every page
// Configure your API key: click the gear icon in the widget or set in localStorage under 'GEMINI_API_KEY'
(function(){
  const MODEL = 'gemini-1.5-flash-latest';
  const LS_KEY = 'GEMINI_API_KEY';

  function getApiKey(){
    return localStorage.getItem(LS_KEY) || 'YOUR_GEMINI_API_KEY_HERE';
  }
  function setApiKey(k){
    localStorage.setItem(LS_KEY, k);
  }

  // Create UI
  const root = document.createElement('div');
  root.id = 'alumnetics-chatbot-root';
  root.style.position = 'fixed';
  root.style.inset = 'auto 16px 16px auto';
  root.style.zIndex = '9999';
  root.innerHTML = `
    <div id="aln-chat-toggle" class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 shadow-lg cursor-pointer flex items-center justify-center text-white">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    </div>
    <div id="aln-chat-panel" class="hidden w-[22rem] sm:w-[24rem] h-[28rem] bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">🤖</div>
          <div class="font-semibold">AI Assistant</div>
        </div>
        <div class="flex items-center gap-2">
          <button id="aln-chat-stt" title="Dictate message" class="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center">🎤</button>
          <button id="aln-chat-tts" title="Speak last AI reply" class="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center">🔊</button>
          <button id="aln-chat-key" title="Set API Key" class="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center">⚙️</button>
          <button id="aln-chat-close" class="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center">✕</button>
        </div>
      </div>
      <div id="aln-chat-body" class="h-[20rem] overflow-y-auto px-3 py-3 space-y-3 bg-gradient-to-b from-white to-indigo-50/40">
        <div class="flex items-start gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">🤖</div>
          <div class="max-w-[75%] bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-800 shadow">I can help with career, college, or AlumNetics website questions. Try jobs, mentorship, courses, events, or using this site.</div>
        </div>
      </div>
      <div class="px-3 py-3 border-t bg-white">
        <div class="flex items-end gap-2">
          <textarea id="aln-chat-input" rows="1" placeholder="Type a message..." class="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" ></textarea>
          <button id="aln-chat-send" class="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-sm">Send</button>
        </div>
  <div id="aln-chat-hint" class="mt-1 text-[11px] text-gray-500">Enter to send • Shift+Enter new line • 🎤 to dictate</div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const toggle = root.querySelector('#aln-chat-toggle');
  const panel = root.querySelector('#aln-chat-panel');
  const closeBtn = root.querySelector('#aln-chat-close');
  const keyBtn = root.querySelector('#aln-chat-key');
  const bodyEl = root.querySelector('#aln-chat-body');
  const inputEl = root.querySelector('#aln-chat-input');
  const sendBtn = root.querySelector('#aln-chat-send');
  const ttsBtn = root.querySelector('#aln-chat-tts');
  const sttBtn = root.querySelector('#aln-chat-stt');

  function openPanel(){ panel.classList.remove('hidden'); toggle.classList.add('hidden'); setTimeout(()=> inputEl.focus(), 50); }
  function closePanel(){ panel.classList.add('hidden'); toggle.classList.remove('hidden'); }
  toggle.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);

  keyBtn.addEventListener('click', ()=>{
    const current = getApiKey();
    const k = prompt('Enter your Gemini API Key (stored locally):', current === 'YOUR_GEMINI_API_KEY_HERE' ? '' : current);
    if (k) { setApiKey(k.trim()); alert('API key saved locally.'); }
  });

  // Chat state (page-local)
  const pageCtx = `Page: ${document.title} | Path: ${location.pathname}`;
  const history = [
    { role: 'user', parts: [{ text: [
      'You are a concise, helpful assistant for the AlumNetics site.',
      'Only answer queries related to: (1) career (jobs, resumes, interviews, mentorship, skills),',
      '(2) college/university (courses, departments, semesters, events, alumni), or (3) this website (navigation, pages, buttons, forms).',
      'If a user asks for anything outside these topics, reply: "I can help with career, college, or AlumNetics website questions only. Please rephrase."',
      'If the content is harmful, hateful, sexual, or violent, reply exactly: "Sorry, I can\'t assist with that."',
      'Keep responses short and practical. Use the current page context when relevant.',
      pageCtx
    ].join('\n') }] },
  ];

  // Simple topic filter (client-side)
  function topicAllowed(text){
    if (!text) return false;
    const t = text.toLowerCase();
    const career = /(career|job|resume|cv|interview|ment(or|ee|ship)|skill|portfolio|intern|hiring|recruit)/;
    const college = /(college|university|campus|course|department|semester|exam|alumni|student|faculty|event|syllabus)/;
    const website = /(website|site|page|button|link|navbar|sidebar|login|sign ?in|register|sign ?up|dashboard|events?|messages?|fundrais|network)/;
    return career.test(t) || college.test(t) || website.test(t);
  }

  function appendMsg(role, text){
    const isUser = role === 'user';
    const row = document.createElement('div');
    row.className = 'flex items-start gap-2 ' + (isUser ? 'justify-end' : '');
    row.dataset.role = role;
    if (isUser){
      row.innerHTML = `
        <div class="aln-msg max-w-[75%] bg-indigo-600 text-white rounded-xl px-3 py-2 text-sm shadow">${escapeHtml(text)}</div>
        <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">🧑</div>
      `;
    } else {
      row.innerHTML = `
        <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">🤖</div>
        <div class="aln-msg max-w-[75%] bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-800 shadow">${escapeHtml(text)}</div>
      `;
    }
    bodyEl.appendChild(row);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function escapeHtml(str){
    return (str||'').replace(/[&<>"]+/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s]));
  }

  async function sendMessage(){
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    appendMsg('user', text);

    // Off-topic early refusal without API call
    if (!topicAllowed(text)){
      appendMsg('model', 'I can help with career, college, or AlumNetics website questions only. Please rephrase.');
      return;
    }

    const key = getApiKey();
    if (!key || key === 'YOUR_GEMINI_API_KEY_HERE'){
      alert('Please set your Gemini API key (click the gear icon).');
      return;
    }

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'flex items-center gap-2 text-gray-600 text-sm';
    typing.innerHTML = `<div class="w-8 h-8 rounded-lg bg-gray-200 animate-pulse"></div><div class="px-3 py-2">Thinking…</div>`;
    bodyEl.appendChild(typing); bodyEl.scrollTop = bodyEl.scrollHeight;

    try{
      // Build contents from prior exchanges + new user message
      const contents = history.concat([{ role: 'user', parts: [{ text }] }]);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 256, temperature: 0.6 } })
      });
      if (!res.ok){ throw new Error(`HTTP ${res.status}`); }
      const data = await res.json();
      const candidate = data.candidates && data.candidates[0];
      const parts = candidate && candidate.content && candidate.content.parts || [];
      const reply = parts.map(p=>p.text||'').join('\n').trim() || 'Sorry, I could not generate a response.';
      // Commit to history
      history.push({ role: 'user', parts: [{ text }] });
      history.push({ role: 'model', parts: [{ text: reply }] });

      typing.remove();
      appendMsg('model', reply);
    } catch (err){
      typing.remove();
      appendMsg('model', `Error: ${err.message}. Check your API key and network.`);
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
  });

  // Speech-to-Text (dictation) using Web Speech Recognition API
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognizer = null;
  let listening = false;

  function ensureRecognizer(){
    if (!SR) return null;
    if (recognizer) return recognizer;
    recognizer = new SR();
    recognizer.lang = (navigator.language || 'en-US');
    recognizer.interimResults = true;
    recognizer.continuous = false; // stop automatically after a pause
    recognizer.maxAlternatives = 1;
    recognizer.onresult = (event)=>{
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++){
        const res = event.results[i];
        if (res.isFinal){ finalText += res[0].transcript; }
        else { interim += res[0].transcript; }
      }
      if (interim){ inputEl.placeholder = 'Listening… ' + interim; }
      if (finalText){
        const spacer = inputEl.value && !/\s$/.test(inputEl.value) ? ' ' : '';
        inputEl.value = (inputEl.value || '') + spacer + finalText.trim();
        inputEl.placeholder = 'Type a message...';
      }
    };
    recognizer.onerror = ()=>{ listening = false; updateSttUi(); inputEl.placeholder = 'Type a message...'; };
    recognizer.onend = ()=>{ listening = false; updateSttUi(); inputEl.placeholder = 'Type a message...'; };
    return recognizer;
  }

  function updateSttUi(){
    if (!sttBtn) return;
    sttBtn.textContent = listening ? '⏹' : '🎤';
    sttBtn.title = listening ? 'Stop listening' : 'Dictate message';
    sttBtn.classList.toggle('animate-pulse', listening);
  }

  if (sttBtn){
    sttBtn.addEventListener('click', ()=>{
      if (!SR){ alert('Speech-to-Text is not supported in this browser. Try Chrome on desktop with microphone permission.'); return; }
      const rec = ensureRecognizer();
      if (!rec) return;
      if (listening){
        try { rec.stop(); } catch {}
        listening = false; updateSttUi();
      } else {
        try { rec.start(); listening = true; updateSttUi(); inputEl.placeholder = 'Listening…'; }
        catch (e){ /* may already be started */ }
      }
    });
  }

  // Text-to-Speech for the last AI reply
  function getLastAiText(){
    const rows = Array.from(bodyEl.children).reverse();
    for (const r of rows){
      if (r.dataset && r.dataset.role === 'model'){
        const msg = r.querySelector('.aln-msg');
        if (msg) return msg.innerText.trim();
      }
    }
    return '';
  }

  function speak(text){
    if (!('speechSynthesis' in window)){
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }
    const synth = window.speechSynthesis;
    if (synth.speaking){ synth.cancel(); return; }
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.lang = 'en-US';
    synth.speak(u);
  }

  ttsBtn.addEventListener('click', ()=>{
    const text = getLastAiText();
    if (!text){ alert('No AI reply to speak yet.'); return; }
    speak(text);
  });
})();
