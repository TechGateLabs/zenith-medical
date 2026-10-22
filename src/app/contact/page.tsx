'use client';

import Layout from '../../components/Layout/Layout';
import {
  useCachedPrimaryPhone,
  useCachedAddressOnly,
} from '@/lib/hooks/useCachedAddress';
import { useClinicLocations } from '@/lib/hooks/useClinicLocations';
import GoogleMaps from '@/components/UI/GoogleMaps';
import GoogleMapsLink from '@/components/UI/GoogleMapsLink';

export default function Contact() {
  const { primaryPhone, loading: phoneLoading } = useCachedPrimaryPhone();
  const { address: fallbackAddress, loading: addressLoading } = useCachedAddressOnly();
  const { locations, loading: locationsLoading } = useClinicLocations();

  // Use admin-managed locations when available; otherwise fall back to the
  // single legacy address from settings so the page never goes empty.
  const hasLocations = !locationsLoading && locations.length > 0;
  const displayedLocations = hasLocations
    ? locations
    : !locationsLoading && !addressLoading && fallbackAddress
    ? [
        {
          id: 'fallback',
          name: 'Zenith Medical Centre',
          address: fallbackAddress,
          phone: phoneLoading ? null : primaryPhone,
          email: null as string | null,
          fax: null as string | null,
          hours: null as string | null,
          mapsQuery: null as string | null,
        },
      ]
    : [];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our Locations
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose your clinic below for its address, phone number, email and
              opening hours. Please contact the location you visit directly.
            </p>
          </div>

          {/* Our Locations */}
          <div id="clinic-locations" className="mb-12">
            {displayedLocations.length > 1 && (
              <p className="text-center text-lg text-slate-600 mb-8">
                Find contact details for each of our {displayedLocations.length} clinic locations.
              </p>
            )}

            {locationsLoading || (locations.length === 0 && addressLoading) ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center text-slate-500">
                Loading clinic locations…
              </div>
            ) : displayedLocations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center text-slate-500">
                Clinic location details are being updated.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {displayedLocations.map((loc) => (
                  <section
                    key={loc.id}
                    aria-label={`${loc.name} contact details`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
                  >
                    <div className="p-6 border-b border-slate-100 min-w-0">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 break-words">
                        {loc.name}
                      </h3>
                      <p className="text-slate-600 mb-2 whitespace-pre-line break-words">{loc.address}</p>
                      <GoogleMapsLink
                        address={loc.mapsQuery || loc.address}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm hover:underline"
                      >
                        View on Google Maps
                      </GoogleMapsLink>
                      <div className="mt-4 space-y-1 text-sm text-slate-700">
                        {loc.phone && (
                          <div>
                            <span className="font-medium">Phone:</span>{' '}
                            <a
                              href={`tel:${loc.phone.replace(/\s/g, '')}`}
                              className="text-blue-600 hover:underline"
                            >
                              {loc.phone}
                            </a>
                          </div>
                        )}
                        {loc.email && <div><span className="font-medium">Email:</span> <a className="text-blue-600 hover:underline break-all" href={`mailto:${loc.email}`}>{loc.email}</a></div>}
                        {loc.fax && (
                          <div>
                            <span className="font-medium">Fax:</span> {loc.fax}
                          </div>
                        )}
                        {loc.hours && (
                          <div>
                            <span className="font-medium">Hours:</span> {loc.hours}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 mt-auto">
                      <GoogleMaps
                        address={loc.mapsQuery || loc.address}
                        className="w-full rounded-lg overflow-hidden"
                        height="280px"
                      />
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
