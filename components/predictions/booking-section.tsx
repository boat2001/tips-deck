type Booking = {
  id: string;
  title: string;
  platform: string;
  code: string;
};

export function BookingSection({ bookings, date }: { bookings: Booking[]; date: string }) {
  return (
    <section className="mt-8" aria-labelledby="booking-heading">
      <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_15px_40px_rgba(15,23,42,0.05)]">
        <summary className="flex cursor-pointer list-none items-center justify-center gap-3 bg-[#078a4f] px-6 py-4 text-base font-black text-white transition hover:bg-emerald-700 [&::-webkit-details-marker]:hidden">
          <span id="booking-heading">Booking</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-none stroke-current stroke-2 transition group-open:rotate-180"><path d="m5 7.5 5 5 5-5" /></svg>
        </summary>
        <div className="p-5 sm:p-7">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">Booking codes</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Codes for {new Date(`${date}T12:00:00.000Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</h2>
          </div>
          {bookings.length ? (
            <div className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
              {bookings.map((booking) => (
                <article key={booking.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">{booking.platform}</p>
                  <h3 className="mt-2 text-sm font-bold text-slate-600">{booking.title}</h3>
                  <p className="mt-4 rounded-lg bg-white px-4 py-3 font-mono text-xl font-black tracking-[0.12em] text-slate-950 shadow-sm">{booking.code}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mx-auto mt-6 max-w-xl rounded-xl bg-slate-50 p-5 text-center text-sm leading-6 text-slate-500">No booking codes have been published for this date yet. Check again after the admin updates today&apos;s selections.</p>
          )}
        </div>
      </details>
    </section>
  );
}
