import React, { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';

function daysUntilExpiry(item) {
  const date = String(item.expiry_date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const [year, month, day] = date.split('-').map(Number);
  const expiry = Date.UTC(year, month - 1, day);
  const today = new Date();
  const todayDate = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((expiry - todayDate) / 86400000);
}

function getStatus(days) {
  if (days === null) return 'has no valid expiry date';
  if (days < 0) return `expired ${Math.abs(days)} day${days === -1 ? '' : 's'} ago`;
  if (days === 0) return 'expires today';
  if (days <= 3) return `expires in ${days} day${days === 1 ? '' : 's'}`;
  return `fresh for ${days} more days`;
}

function answerQuestion(question, items, sensor) {
  const text = question.toLowerCase();
  const inventory = items.map((item) => ({ ...item, days: daysUntilExpiry(item) }));

  if (/\b(temperature|humidity|air quality|sensors?|readings?)\b/.test(text)) {
    const readings = [];
    if (sensor?.temperature_c != null) readings.push(`temperature is ${Number(sensor.temperature_c).toFixed(1)} °C`);
    if (sensor?.humidity_pct != null) readings.push(`humidity is ${Number(sensor.humidity_pct).toFixed(1)}%`);
    if (sensor?.air_quality_ppm != null) readings.push(`air quality is approximately ${Number(sensor.air_quality_ppm).toFixed(0)} ppm`);
    return readings.length
      ? `The latest sensor ${readings.join(', ')}. Air-quality values are estimates until the sensor is calibrated.`
      : 'There are no sensor readings available yet. Check the Sensors page after the backend receives a reading.';
  }

  const mentionedItem = inventory.find((item) => {
    const name = String(item.name || '').toLowerCase().trim();
    return name.length > 1 && text.includes(name);
  });
  if (mentionedItem) {
    const location = mentionedItem.storage_location ? ` It is stored in ${mentionedItem.storage_location}.` : '';
    return `${mentionedItem.name}: ${mentionedItem.quantity} ${mentionedItem.unit || 'items'}, and it ${getStatus(mentionedItem.days)} (${String(mentionedItem.expiry_date || '').slice(0, 10) || 'no date recorded'}).${location}`;
  }

  if (/\b(expir\w*|soon|use first|going bad|expired|freshness)\b/.test(text)) {
    const needsAttention = inventory
      .filter((item) => item.days !== null && item.days <= 3)
      .sort((a, b) => a.days - b.days);
    if (!needsAttention.length) return 'Nothing in your inventory is expired or due to expire in the next 3 days.';
    return `Use these first: ${needsAttention.slice(0, 5).map((item) => `${item.name} (${getStatus(item.days)})`).join('; ')}${needsAttention.length > 5 ? `; and ${needsAttention.length - 5} more` : ''}.`;
  }

  if (/\b(how many|count|inventory|food items|what food|what do i have|list)\b/.test(text)) {
    if (!inventory.length) return 'Your inventory is empty right now. Add food items in the Food Items section and I can help track them.';
    return `You have ${inventory.length} food item${inventory.length === 1 ? '' : 's'} recorded: ${inventory.slice(0, 8).map((item) => item.name).join(', ')}${inventory.length > 8 ? `, and ${inventory.length - 8} more` : ''}.`;
  }

  if (/\b(store|storage|keep|refrigerat|freez|pantry)\b/.test(text)) {
    return 'Storage depends on the food and its package label. Keep perishable foods refrigerated promptly, separate raw meat from ready-to-eat foods, and follow the storage instructions on the packaging.';
  }

  return 'I can help with your inventory, expiry dates, storage locations, and latest sensor readings. Try asking “What should I use first?” or “How many food items do I have?”';
}

const suggestions = ['What should I use first?', 'Show my inventory', 'How are my sensors?'];

export default function FoodAssistant({ items = [], sensor = null }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      text: 'Hi! I can help with your FreshKeep inventory, expiry dates, storage, and sensor readings.',
    },
  ]);
  const messageList = useRef(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (open && messageList.current) {
      messageList.current.scrollTop = messageList.current.scrollHeight;
    }
  }, [messages, open]);

  function sendMessage(value = draft) {
    const question = value.trim();
    if (!question) return;

    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: 'user', text: question },
      { id: nextId.current++, role: 'assistant', text: answerQuestion(question, items, sensor) },
    ]);
    setDraft('');
  }

  return (
    <div className="food-assistant">
      {open && (
        <section className="assistant-panel" aria-label="FreshKeep AI assistant">
          <div className="assistant-header">
            <span className="assistant-avatar"><Sparkles size={17} /></span>
            <div>
              <strong>FreshKeep AI</strong>
              <small>Food storage assistant</small>
            </div>
            <button type="button" className="assistant-close" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={18} />
            </button>
          </div>

          <div className="assistant-messages" ref={messageList} aria-live="polite">
            {messages.map((message) => (
              <div className={`assistant-message ${message.role}`} key={message.id}>
                {message.role === 'assistant' && <Bot size={15} aria-hidden="true" />}
                <p>{message.text}</p>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="assistant-suggestions">
                {suggestions.map((suggestion) => (
                  <button type="button" key={suggestion} onClick={() => sendMessage(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="assistant-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              aria-label="Ask FreshKeep AI"
              placeholder="Ask about your food..."
              rows="1"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Send message">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`assistant-toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Close FreshKeep AI assistant' : 'Open FreshKeep AI assistant'}
        aria-expanded={open}
      >
        {open ? <X size={21} /> : <><MessageCircle size={20} /><span>Ask AI</span></>}
      </button>
    </div>
  );
}