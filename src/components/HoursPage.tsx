import { ArrowRight, Calendar, CheckCircle2, Clock, Truck } from 'lucide-react';

interface HoursPageProps {
  onNavigate: (path: string) => void;
}

const WEEKLY_SCHEDULE: {
  day: string;
  diningHours: string;
  lastSeating: string;
  onlineOrdering: string;
  isClosed?: boolean;
}[] = [
  {
    day: 'Monday',
    diningHours: 'Closed for Dry-Aging & Stock Prep',
    lastSeating: '—',
    onlineOrdering: 'Closed',
    isClosed: true,
  },
  {
    day: 'Tuesday',
    diningHours: '5:00 PM – 10:00 PM',
    lastSeating: '9:15 PM',
    onlineOrdering: '5:00 PM – 9:30 PM',
  },
  {
    day: 'Wednesday',
    diningHours: '5:00 PM – 10:00 PM',
    lastSeating: '9:15 PM',
    onlineOrdering: '5:00 PM – 9:30 PM',
  },
  {
    day: 'Thursday',
    diningHours: '5:00 PM – 10:30 PM',
    lastSeating: '9:45 PM',
    onlineOrdering: '5:00 PM – 9:45 PM',
  },
  {
    day: 'Friday',
    diningHours: '5:00 PM – 11:00 PM',
    lastSeating: '10:15 PM',
    onlineOrdering: '5:00 PM – 10:15 PM',
  },
  {
    day: 'Saturday',
    diningHours: '4:30 PM – 11:00 PM',
    lastSeating: '10:15 PM',
    onlineOrdering: '4:30 PM – 10:15 PM',
  },
  {
    day: 'Sunday',
    diningHours: '4:30 PM – 9:30 PM',
    lastSeating: '8:45 PM',
    onlineOrdering: '4:30 PM – 9:00 PM',
  },
];

function getSanFranciscoNow(): { weekday: string; timeLabel: string; isOpenNow: boolean } {
  const now = new Date();
  const sfParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(now);

  const weekday = sfParts.find((p) => p.type === 'weekday')?.value ?? 'Tuesday';
  const hour24 = Number.parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      hour12: false,
    }).format(now),
    10
  );
  const timeLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const isMonday = weekday === 'Monday';
  const isOpenNow = !isMonday && hour24 >= 17 && hour24 < 22;
  return { weekday, timeLabel, isOpenNow };
}

export function HoursPage({ onNavigate }: HoursPageProps) {
  const { weekday, timeLabel, isOpenNow } = getSanFranciscoNow();

  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E3DD] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              418 Jackson Street · Pacific Time (San Francisco)
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#141413] lg:text-5xl">
              Opening &amp; Closing Timings
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 rounded-md border border-[#E5E3DD] bg-white px-4 py-2.5 text-xs font-medium text-[#141413]">
            <CheckCircle2
              className={`h-4 w-4 ${isOpenNow ? 'text-[#1C3B2B]' : 'text-[#737068]'}`}
              aria-hidden="true"
            />
            <span className="tabular-nums">
              SF Time: {weekday} · {timeLabel} —{' '}
              <strong>{isOpenNow ? 'Open for Dinner Service' : 'Scheduled Service Hours'}</strong>
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-lg border border-[#E5E3DD] bg-white p-6 lg:col-span-8 lg:p-8">
            <h2 className="font-display text-2xl font-semibold text-[#141413]">
              Weekly Service Schedule
            </h2>
            <p className="mt-1 text-sm text-[#57554F]">
              Our white-oak hearth is lit daily at 2:00 PM for evening service Tuesday
              through Sunday.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E3DD] text-xs font-semibold text-[#57554F]">
                    <th className="py-3 pr-4">Day</th>
                    <th className="py-3 pr-4">Dining Room Hours</th>
                    <th className="py-3 pr-4">Last Seating</th>
                    <th className="py-3">Online Pickup &amp; Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EEE8]">
                  {WEEKLY_SCHEDULE.map((row) => {
                    const isToday = row.day === weekday;
                    return (
                      <tr
                        key={row.day}
                        className={isToday ? 'bg-[#F5F7F5]' : undefined}
                      >
                        <td className="py-3.5 pr-4 font-semibold text-[#141413]">
                          {row.day}
                          {isToday && (
                            <span className="ml-2 text-xs font-medium text-[#1C3B2B]">
                              (Today)
                            </span>
                          )}
                        </td>
                        <td
                          className={`py-3.5 pr-4 tabular-nums ${
                            row.isClosed ? 'text-[#8E8B82]' : 'text-[#141413]'
                          }`}
                        >
                          {row.diningHours}
                        </td>
                        <td className="py-3.5 pr-4 tabular-nums text-[#57554F]">
                          {row.lastSeating}
                        </td>
                        <td className="py-3.5 tabular-nums text-[#57554F]">
                          {row.onlineOrdering}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1C3B2B]">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>Bar &amp; Cellar Lounge</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold text-[#141413]">
                Aperitif &amp; Late Pour
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
                Walk-in counter and lounge seating opens 30 minutes prior to dinner
                service for oysters, zero-proof botanicals, and cellar flights, remaining
                open 30 minutes past final kitchen seating.
              </p>
            </div>

            <div className="rounded-lg border border-[#E5E3DD] bg-white p-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1C3B2B]">
                <Truck className="h-4 w-4" aria-hidden="true" />
                <span>Online Pickup &amp; Courier Window</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold text-[#141413]">
                Fresh to Order
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#57554F]">
                Online orders placed before service open enter the hearth queue at 5:00 PM.
                Average prep time is 18–26 minutes for pickup and 30–40 minutes for local
                courier delivery.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('/reservations')}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1C3B2B] px-4 py-2.5 text-xs font-medium text-[#FAFAF8] hover:bg-[#142B1F] cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reserve a Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/menu')}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[#D4D1C8] bg-white px-4 py-2.5 text-xs font-medium text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
                >
                  <span>Order Online Now</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
