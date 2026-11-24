import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import type { ContactInquiry } from '../types/restaurant.ts';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

const TOPICS: ContactInquiry['topic'][] = [
  'General Inquiry',
  'Private Dining & Events',
  'Dietary & Allergies',
  'Press & Careers',
];

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<ContactInquiry['topic']>('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ContactInquiry | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not send inquiry.');
      }
      setConfirmation(data.inquiry);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E3DD] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              Host Desk · Private Events · Guest Relations
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413] lg:text-5xl">
              Contact Us
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#57554F]">
            Reach our Jackson Square hospitality desk for private buyouts, allergen
            planning, lost-and-found, or general dining questions.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
              <h2 className="font-display text-2xl font-semibold text-[#141413]">
                Direct Channels
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1C3B2B]" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-[#141413]">Address</dt>
                    <dd className="text-[#57554F]">
                      418 Jackson Street, San Francisco, CA 94111
                    </dd>
                    <dd className="mt-1 text-xs text-[#737068]">
                      Between Montgomery &amp; Sansome St · Embarcadero BART (8 min walk)
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#1C3B2B]" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-[#141413]">Host Desk</dt>
                    <dd className="tabular-nums text-[#57554F]">(415) 555-0140</dd>
                    <dd className="mt-0.5 text-xs text-[#737068]">
                      Answered Tue–Sun starting at 1:30 PM
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#1C3B2B]" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-[#141413]">Email</dt>
                    <dd className="text-[#57554F]">hospitality@ardenandhearth.com</dd>
                    <dd className="mt-0.5 text-xs text-[#737068]">
                      Private dining &amp; groups of 9+: events@ardenandhearth.com
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
              <h3 className="text-sm font-semibold text-[#141413]">
                Parking &amp; Arrival Notes
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
                Evening valet operates Thursday–Sunday from 5:00 PM at 418 Jackson St.
                Public garage parking is also available half a block south at 444
                Montgomery Street.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/hours')}
                  className="text-xs font-medium text-[#1C3B2B] underline underline-offset-4 cursor-pointer"
                >
                  View Service Hours
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/reservations')}
                  className="text-xs font-medium text-[#1C3B2B] underline underline-offset-4 cursor-pointer"
                >
                  Book a Table
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E3DD] bg-white p-6 lg:col-span-7 lg:p-8">
            <h2 className="font-display text-2xl font-semibold text-[#141413]">
              Send an Inquiry
            </h2>
            <p className="mt-1 text-sm text-[#57554F]">
              Our hospitality manager responds to all messages within one business day.
            </p>

            {confirmation ? (
              <div className="mt-6 rounded-lg border border-[#D4DFD7] bg-[#F5F7F5] p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1C3B2B]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <span>Inquiry Received · Reference {confirmation.id}</span>
                </div>
                <p className="mt-2 text-sm text-[#57554F]">
                  Thank you, {confirmation.name}. Your message regarding{' '}
                  <strong>{confirmation.topic}</strong> has been logged for our team and a
                  confirmation copy sent to {confirmation.email}.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className="mt-4 rounded-md border border-[#1C3B2B] px-4 py-2 text-xs font-medium text-[#1C3B2B] hover:bg-[#1C3B2B] hover:text-[#FAFAF8] cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-[#141413]"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Morgan Ellis"
                      className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2.5 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-[#141413]"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="morgan@example.com"
                      className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2.5 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-topic"
                    className="block text-xs font-semibold text-[#141413]"
                  >
                    Inquiry Topic
                  </label>
                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as ContactInquiry['topic'])}
                    className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2.5 text-sm text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-[#141413]"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    minLength={10}
                    maxLength={1200}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share preferred event dates, party size, or questions for our culinary team..."
                    className="mt-1.5 w-full rounded-md border border-[#D4D1C8] bg-white px-3 py-2.5 text-sm text-[#141413] placeholder:text-[#8E8B82] focus:border-[#1C3B2B] focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md bg-[#1C3B2B] px-6 py-3 text-sm font-medium text-[#FAFAF8] transition-colors hover:bg-[#142B1F] disabled:opacity-60 cursor-pointer"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
