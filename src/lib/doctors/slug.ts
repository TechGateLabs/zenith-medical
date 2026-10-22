/** One URL format shared by doctor cards, profile pages and the public API. */
export function doctorProfileSlug(name: string): string {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function findPublishedDoctorBySlug<T extends { name: string; isDoctor: boolean; published: boolean }>(
  doctors: T[], slug: string
): T | undefined {
  const normalized = doctorProfileSlug(slug)
  if (!normalized) return undefined
  return doctors.find(doctor => doctor.isDoctor && doctor.published && doctorProfileSlug(doctor.name) === normalized)
}
