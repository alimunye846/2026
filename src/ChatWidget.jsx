import { useEffect, useRef, useState } from 'react';

const starterMessages = [
  {
    role: 'assistant',
    content:
      "Hi — I’m the Aaliyah’s Grace assistant. I can help with products, sensitive-skin routines, shipping, and order questions.",
  },
];

const quickReplies = [
  'Best products for sensitive skin',
  'Build me a simple routine',
  'Which product helps dryness?',
  'Shipping information',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  async function sendMessage(text) {
    const messageText = text.trim();
    if (!messageText || isSending) return;
    const nextMessages = [...messages, { role: 'user', content: messageText }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsSending(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to start the chat right now.');
      setMessages((current) => [...current, { role: 'assistant', content: data.reply || 'I’m sorry, I could not generate a reply.' }]);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="chat-widget-root">
      {isOpen ? (
        <section className="chat-panel" aria-label="Aaliyah's Grace webchat assistant">
          <div className="chat-header">
            <div>
              <p className="chat-eyebrow">Aaliyah&apos;s Grace</p>
              <h2>Beauty Assistant</h2>
            </div>
            <button type="button" className="chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="chat-body" ref={listRef}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                {message.content}
              </div>
            ))}
            {isSending ? <div className="chat-bubble chat-bubble-assistant">Typing…</div> : null}
          </div>
          <div className="chat-quick-replies">
            {quickReplies.map((reply) => (
              <button key={reply} type="button" className="chat-chip" onClick={() => sendMessage(reply)} disabled={isSending}>{reply}</button>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about skincare, products, or orders" aria-label="Type your message" />
            <button type="submit" disabled={isSending || !input.trim()}>Send</button>
          </form>
          {error ? <p className="chat-error">{error}</p> : null}
        </section>
      ) : null}
      <button type="button" className="chat-launcher" onClick={() => setIsOpen((current) => !current)}>
        {isOpen ? 'Close chat' : 'Chat with us'}
      </button>
    </div>
  );
}
