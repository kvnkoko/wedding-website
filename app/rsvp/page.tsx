export default function RSVPPage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-cream dark:bg-dark-bg flex items-center justify-center transition-colors duration-600 ease-in-out">
      <div className="max-w-2xl mx-auto text-center bg-white dark:bg-dark-card p-12 rounded-2xl shadow-xl dark:shadow-2xl border border-taupe/20 dark:border-dark-border transition-all duration-600 ease-in-out">
        <h1 className="font-title text-5xl text-charcoal dark:text-dark-text mb-6 transition-colors duration-600">RSVP</h1>
        <p className="font-body text-lg text-charcoal/70 dark:text-dark-text-secondary mb-8 leading-relaxed transition-colors duration-600" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          Please use the unique RSVP link that was sent to you via email or invitation.
        </p>
        <p className="font-body text-base text-charcoal/60 dark:text-dark-text-secondary transition-colors duration-600" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          If you have not received your link or need assistance, please contact us directly.
        </p>
      </div>
    </div>
  )
}

