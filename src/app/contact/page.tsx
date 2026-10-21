'use client';

import Layout from '../../components/Layout/Layout';
import {
  useCachedPrimaryPhone,
  useCachedAddressOnly,
  useCachedAdminEmail,
} from '@/lib/hooks/useCachedAddress';
import { useAppointmentUrls } from '@/lib/hooks/useSettings';
import { useClinicLocations, primaryLocation } from '@/lib/hooks/useClinicLocations';
import GoogleMaps from '@/components/UI/GoogleMaps';
import GoogleMapsLink from '@/components/UI/GoogleMapsLink';

export default function Contact() {
  const { primaryPhone, loading: phoneLoading } = useCachedPrimaryPhone();
  const { address: fallbackAddress, loading: addressLoading } = useCachedAddressOnly();
  const { adminEmail, loading: emailLoading } = useCachedAdminEmail();
  const { patientIntakeUrl, appointmentBookingUrl } = useAppointmentUrls();
  const { locations, loading: locationsLoading } = useClinicLocations();

  // Use admin-managed locations when available; otherwise fall back to the
  // single legacy address from settings so the page never goes empty.
  const hasLocations = !locationsLoading && locations.length > 0;
  const displayedLocations = hasLocations
    ? locations
    : !addressLoading && fallbackAddress
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

  const primary = hasLocations ? primaryLocation(locations) : displayedLocations[0];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get in touch with our team. We&apos;re here to help with any questions
              about our services or to schedule your appointment.
            </p>
          </div>

          {/* Top-level: General contact + Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{hasLocations ? primary?.name : 'Get in Touch'}</h2>
              <dl className="space-y-6 text-slate-600">
                {(!hasLocations || primary?.phone) && <div>
                  <dt className="text-lg font-semibold text-slate-800 mb-1">Clinic phone</dt>
                  <dd><a className="text-blue-600 hover:underline" href={`tel:${(hasLocations ? primary?.phone || '' : primaryPhone).replace(/[^+\d]/g, '')}`}>
                    {hasLocations ? primary?.phone : phoneLoading ? 'Loading...' : primaryPhone}
                  </a></dd>
                </div>}
                {primary?.fax && <div><dt className="text-lg font-semibold text-slate-800 mb-1">Fax</dt><dd>{primary.fax}</dd></div>}
                {(!hasLocations || primary?.email) && <div>
                  <dt className="text-lg font-semibold text-slate-800 mb-1">{hasLocations ? 'Clinic email' : 'Email'}</dt>
                  <dd><a className="text-blue-600 hover:underline break-all" href={`mailto:${hasLocations ? primary?.email : adminEmail}`}>
                    {hasLocations ? primary?.email : emailLoading ? 'Loading...' : adminEmail}
                  </a></dd>
                </div>}
              </dl>
              {hasLocations && <a href="#clinic-locations" className="inline-block mt-6 text-blue-600 hover:underline">View contact details for all clinics</a>}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <a
                  href={patientIntakeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Registration Form
                </a>
                <a
                  href={appointmentBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Book Appointment
                </a>
              </div>
            </div>
          </div>

          {/* Our Locations */}
          <div id="clinic-locations" className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                {displayedLocations.length > 1 ? 'Our Locations' : 'Find Us'}
              </h2>
              {displayedLocations.length > 1 && (
                <p className="text-lg text-slate-600">
                  Visit us at any of our {displayedLocations.length} convenient
                  clinic locations.
                </p>
              )}
            </div>

            {locationsLoading && addressLoading ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center text-slate-500">
                Loading clinic locations…
              </div>
            ) : displayedLocations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center text-slate-500">
                Clinic location details are being updated.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {displayedLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
                  >
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {loc.name}
                      </h3>
                      <p className="text-slate-600 mb-2">{loc.address}</p>
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
                    <div className="p-4 bg-slate-50">
                      <GoogleMaps
                        address={loc.mapsQuery || loc.address}
                        className="w-full rounded-lg overflow-hidden"
                        height="280px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
