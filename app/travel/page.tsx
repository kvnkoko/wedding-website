export default function TravelPage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-cream">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-6xl text-charcoal text-center mb-16">Travel Information</h1>
        
        <div className="space-y-12">
          <section className="bg-white p-10 rounded-sm shadow-sm">
            <h2 className="font-serif text-3xl text-charcoal mb-6">Getting to Myanmar</h2>
            <div className="space-y-4 font-sans text-base text-charcoal/70 leading-relaxed">
              <p>
                Myanmar is accessible via several international airports. The main entry points are:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Yangon International Airport (RGN)</strong> - Main international gateway</li>
                <li><strong>Mandalay International Airport (MDL)</strong> - Regional hub for northern Myanmar</li>
              </ul>
              <p>
                Most international flights connect through Bangkok, Singapore, or Kuala Lumpur.
              </p>
            </div>
          </section>

          <section className="bg-white p-10 rounded-sm shadow-sm">
            <h2 className="font-serif text-3xl text-charcoal mb-6">Accommodations</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl text-charcoal mb-3">Yangon</h3>
                <ul className="font-sans text-base text-charcoal/70 space-y-2">
                  <li>• The Strand Hotel (venue for Civil Signing)</li>
                  <li>• Lotte Hotel Yangon (venue for Yangon Reception)</li>
                  <li>• Sule Shangri-La</li>
                  <li>• Parkroyal Yangon</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-xl text-charcoal mb-3">Mandalay</h3>
                <ul className="font-sans text-base text-charcoal/70 space-y-2">
                  <li>• Mingalar Mandalay Hotel (venue for Mandalay Celebration)</li>
                  <li>• Rupar Mandalar Resort</li>
                  <li>• Mercure Mandalay Hill Resort</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-sm shadow-sm">
            <h2 className="font-serif text-3xl text-charcoal mb-6">Transportation Between Cities</h2>
            <div className="space-y-4 font-sans text-base text-charcoal/70 leading-relaxed">
              <p>
                <strong>By Air:</strong> Domestic flights between Yangon and Mandalay are frequent and take approximately 1.5 hours.
              </p>
              <p>
                <strong>By Bus:</strong> Express buses connect Yangon and Mandalay, taking approximately 8-10 hours.
              </p>
              <p>
                <strong>By Train:</strong> Overnight trains are available but take longer (12-15 hours).
              </p>
            </div>
          </section>

          <section className="bg-white p-10 rounded-sm shadow-sm">
            <h2 className="font-serif text-3xl text-charcoal mb-6">Local Transportation</h2>
            <div className="space-y-4 font-sans text-base text-charcoal/70 leading-relaxed">
              <p>
                Taxis and ride-sharing services (Grab) are widely available in both Yangon and Mandalay. 
                Most hotels can also arrange transportation for you.
              </p>
            </div>
          </section>

          <section className="bg-white p-10 rounded-sm shadow-sm">
            <h2 className="font-serif text-3xl text-charcoal mb-6">Visa Requirements</h2>
            <div className="space-y-4 font-sans text-base text-charcoal/70 leading-relaxed">
              <p>
                Most visitors to Myanmar require a visa. Please check the current visa requirements for your 
                nationality and apply well in advance. E-visas are available for many countries through the 
                official Myanmar e-Visa website.
              </p>
              <p>
                <strong>Important:</strong> Visa requirements can change, so please verify current regulations 
                before traveling.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

