'use client';
import {useState, FormEvent} from 'react';
import {Send, CheckCircle, AlertCircle} from 'lucide-react';

// Replace this with your Formspree form ID from https://formspree.io
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Business website',
    budget: "Let's discuss",
    message: '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          projectType: formData.type,
          budget: formData.budget,
          message: formData.message,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({name: '', email: '', type: 'Business website', budget: "Let's discuss", message: ''});
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({...prev, [field]: value}));
  }

  if (status === 'success') {
    return (
      <div className="form-success">
        <CheckCircle size={28} />
        <h3>Message sent!</h3>
        <p>Thanks for reaching out. I&apos;ll get back to you soon.</p>
        <button className="form-reset" onClick={() => setStatus('idle')}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="c-name">Name</label>
          <input
            id="c-name"
            type="text"
            required
            placeholder="Your name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="c-email">Email</label>
          <input
            id="c-email"
            type="email"
            required
            placeholder="you@company.com"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="c-type">Project type</label>
          <select
            id="c-type"
            value={formData.type}
            onChange={e => handleChange('type', e.target.value)}
          >
            <option>Business website</option>
            <option>Web application</option>
            <option>E-commerce</option>
            <option>AI integration</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="c-budget">Budget range</label>
          <select
            id="c-budget"
            value={formData.budget}
            onChange={e => handleChange('budget', e.target.value)}
          >
            <option>Let&apos;s discuss</option>
            <option>Under ₹25,000</option>
            <option>₹25,000–₹75,000</option>
            <option>₹75,000+</option>
          </select>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="c-message">Project description</label>
        <textarea
          id="c-message"
          required
          rows={5}
          placeholder="What would you like to build?"
          value={formData.message}
          onChange={e => handleChange('message', e.target.value)}
        />
      </div>
      <button className="primary" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : <>Send inquiry <Send size={16} /></>}
      </button>
      {status === 'error' && (
        <div className="form-error">
          <AlertCircle size={16} /> Something went wrong. Please try again or email me directly.
        </div>
      )}
    </form>
  );
}
