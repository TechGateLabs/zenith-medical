import { expect, test } from 'bun:test'
import { doctorProfileSlug, findPublishedDoctorBySlug } from '../src/lib/doctors/slug'

test('punctuation, accents and spacing use one stable doctor URL', () => {
  expect(doctorProfileSlug('Dr. Gabriel Oyelakin')).toBe('dr-gabriel-oyelakin')
  expect(doctorProfileSlug(" Dr. Élodie O’Neil ")).toBe('dr-elodie-o-neil')
  expect(doctorProfileSlug('Dr. Anne-Marie Smith')).toBe('dr-anne-marie-smith')
})

test('canonical and older punctuation URLs resolve the published doctor', () => {
  const doctor = {name:'Dr. Gabriel Oyelakin',isDoctor:true,published:true}
  expect(findPublishedDoctorBySlug([doctor], 'dr-gabriel-oyelakin')).toBe(doctor)
  expect(findPublishedDoctorBySlug([doctor], 'dr.-gabriel-oyelakin')).toBe(doctor)
})

test('profile lookup never returns drafts, non-doctors, partial or empty matches', () => {
  const doctor = {name:'Dr. Gabriel Oyelakin',isDoctor:true,published:true}
  expect(findPublishedDoctorBySlug([{...doctor,published:false}], 'dr-gabriel-oyelakin')).toBeUndefined()
  expect(findPublishedDoctorBySlug([{...doctor,isDoctor:false}], 'dr-gabriel-oyelakin')).toBeUndefined()
  expect(findPublishedDoctorBySlug([doctor], 'gabriel')).toBeUndefined()
  expect(findPublishedDoctorBySlug([doctor], '')).toBeUndefined()
})
