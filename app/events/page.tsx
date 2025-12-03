import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { dateTime: 'asc' },
  })

  return (
    <div className="min-h-screen py-20 px-4 bg-cream">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-6xl text-charcoal text-center mb-16">Our Events</h1>
        
        <div className="space-y-16">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-10 rounded-sm shadow-sm">
              <h2 className="font-serif text-4xl text-charcoal mb-6">{event.name}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <span className="font-sans text-sm text-charcoal/60 w-24">Date & Time</span>
                  <span className="font-sans text-base text-charcoal">{formatDateTime(event.dateTime)}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-sans text-sm text-charcoal/60 w-24">Venue</span>
                  <span className="font-sans text-base text-charcoal">{event.venueName}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-sans text-sm text-charcoal/60 w-24">Location</span>
                  <span className="font-sans text-base text-charcoal">{event.city}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-sans text-sm text-charcoal/60 w-24">Capacity</span>
                  <span className="font-sans text-base text-charcoal">{event.capacity} guests</span>
                </div>
              </div>

              {event.slug === 'civil-signing' && (
                <div className="pt-6 border-t border-taupe/30">
                  <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                    Join us for an intimate civil ceremony as we officially begin our journey together. 
                    This intimate gathering will be followed by a light reception.
                  </p>
                </div>
              )}

              {event.slug === 'mandalay-celebration' && (
                <div className="pt-6 border-t border-taupe/30">
                  <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                    Celebrate with us in the historic city of Mandalay. This grand celebration will 
                    feature traditional ceremonies, music, and dancing as we honor our union with 
                    family and friends.
                  </p>
                </div>
              )}

              {event.slug === 'yangon-reception' && (
                <div className="pt-6 border-t border-taupe/30">
                  <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                    Our final celebration in Yangon brings together loved ones for an elegant reception. 
                    Join us for dinner, dancing, and toasts as we celebrate this special milestone.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

