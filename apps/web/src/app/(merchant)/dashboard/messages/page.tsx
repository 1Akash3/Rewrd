'use client';
import { Card, StatTile } from '@/components/ui';

const templates = [
  { name: '“1 stamp away”', channel: 'WhatsApp', body: 'Hi {name}! You’re just 1 stamp away from a free coffee at {brand} ☕' },
  { name: 'Reward expiry reminder', channel: 'SMS', body: 'Your reward at {brand} expires in 3 days. Visit us soon!' },
  { name: 'Comeback (dormant)', channel: 'WhatsApp', body: 'We miss you at {brand}! Here’s a bonus stamp on your next visit.' },
  { name: 'Review request', channel: 'Email', body: 'Loved your reward? Leave us a Google review 🙏 {reviewLink}' },
  { name: 'Birthday bonus', channel: 'WhatsApp', body: 'Happy birthday {name}! 🎂 Enjoy a free treat this week at {brand}.' },
];

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Messages</h1>
        <p className="text-sm text-muted">Re-engage customers with personalized WhatsApp, SMS, email and push.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Messaging credits" value="500" sub="WhatsApp add-on" />
        <StatTile label="Opt-in customers" value="—" sub="with marketing consent" />
        <StatTile label="Best send time" value="6–8 PM" sub="AI recommendation" accent />
      </div>
      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-ink">Message templates</h2>
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.name} className="flex items-start justify-between rounded-md bg-canvas p-3">
              <div>
                <p className="text-sm font-medium text-ink">{t.name}</p>
                <p className="mt-1 text-sm text-muted">{t.body}</p>
              </div>
              <span className="chip bg-brand-soft text-brand">{t.channel}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Automated triggers (1-stamp-away, expiry, comeback, review request) send with smart send-time optimization and honor opt-out.</p>
      </Card>
    </div>
  );
}
