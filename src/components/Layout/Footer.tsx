'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, Printer, Clock } from 'lucide-react'
import { useCachedPrimaryPhone, useCachedAddressOnly, useCachedBusinessHours } from '@/lib/hooks/useCachedAddress'
import { useAppointmentUrls } from '@/lib/hooks/useSettings'
import { useClinicLocations } from '@/lib/hooks/useClinicLocations'
import GoogleMapsLink from '@/components/UI/GoogleMapsLink'

export default function Footer() {
  const { primaryPhone, loading: phoneLoading } = useCachedPrimaryPhone()
  const { address, loading: addressLoading } = useCachedAddressOnly()
  const { businessHours, loading: hoursLoading } = useCachedBusinessHours()
  const { patientIntakeUrl } = useAppointmentUrls()
  const { locations, loading } = useClinicLocations()
  // Preserve the existing contact details until the first clinic is published.
  // Published clinics never inherit another clinic's optional contact fields.
  const clinics = locations.length ? locations : !loading && !addressLoading && address ? [{
    id: 'legacy', name: 'Zenith Medical Centre', address,
    phone: phoneLoading ? null : primaryPhone, email: null, fax: null,
    hours: hoursLoading ? null : businessHours, mapsQuery: null,
  }] : []
  const links = [
    { name: 'Home', href: '/' },
    { name: 'About us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'Registration form', href: patientIntakeUrl },
    { name: 'FAQs', href: '/faq' },
  ]

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Image src="/images/zenith-medical-logo new 1.png" alt="" width={56} height={56} className="object-contain brightness-0 invert" />
          <div>
            <p className="text-lg font-medium text-white">Zenith Medical Centre</p>
            <p className="text-sm text-gray-300 mt-1">Expert Care, Patient Centered</p>
          </div>
        </div>
        <h2 className="text-2xl font-sans font-semibold text-white mt-0 mb-3">Our clinics</h2>
        <p className="text-gray-300 mb-8">Contact your clinic directly for appointments, opening hours and general enquiries.</p>
        {loading && clinics.length === 0 && <p className="text-gray-300" role="status">Loading clinic contacts…</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {clinics.map(clinic => (
            <section key={clinic.id} className="min-w-0" aria-label={`${clinic.name} clinic contact details`}>
              <h3 className="text-lg font-sans font-semibold text-white mt-0 mb-4 break-words">{clinic.name}</h3>
              <p className="text-gray-300 whitespace-pre-line break-words mb-5">{clinic.address}</p>
              <dl className="space-y-4">
                {clinic.phone && <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0"><dt className="text-sm text-gray-300 mb-1">Clinic phone</dt><dd><a href={`tel:${clinic.phone.replace(/[^+\d]/g, '')}`} className="text-blue-400 hover:text-blue-300 hover:underline break-words">{clinic.phone}</a></dd></div>
                </div>}
                {clinic.email && <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0"><dt className="text-sm text-gray-300 mb-1">Clinic email</dt><dd><a href={`mailto:${clinic.email}`} className="text-blue-400 hover:text-blue-300 hover:underline break-all">{clinic.email}</a></dd></div>
                </div>}
                {clinic.fax && <div className="flex items-start gap-3">
                  <Printer className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0"><dt className="text-sm text-gray-300 mb-1">Fax</dt><dd className="break-words">{clinic.fax}</dd></div>
                </div>}
                {clinic.hours && <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0"><dt className="text-sm text-gray-300 mb-1">Opening hours</dt><dd className="whitespace-pre-line break-words">{clinic.hours}</dd></div>
                </div>}
              </dl>
              <GoogleMapsLink address={clinic.mapsQuery || clinic.address} className="inline-flex items-center text-blue-400 hover:text-blue-300 hover:underline text-sm mt-6">Get directions</GoogleMapsLink>
            </section>
          ))}
        </div>
        <div className="border-t border-gray-700 mt-12 pt-6">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-300">
            {links.map(link => <Link key={link.name} href={link.href} className="text-gray-300 hover:text-white hover:underline">{link.name}</Link>)}
          </nav>
          <p className="text-gray-300 text-sm mt-6">For life-threatening emergencies, call 911 immediately.</p>
          <p className="text-gray-400 text-sm mt-3">© {new Date().getFullYear()} Zenith Medical Centre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
