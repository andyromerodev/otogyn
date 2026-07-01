import { describe, expect, it } from 'vitest'
import {
  seedTestOrganization,
  seedTestPatient,
} from '../database/test/fixtures'
import { withTestTransaction } from '../database/test/test-db'
import { DrizzlePatientRepository } from './drizzle-patient-repository'

describe('DrizzlePatientRepository.findByExactPhoneAndEmail (integration)', () => {
  it('matches on phone alone when no email is provided', async () => {
    await withTestTransaction(async (db) => {
      const org = await seedTestOrganization(db)
      const patient = await seedTestPatient(db, org.id, { phone: '987654321', email: null })

      const repository = new DrizzlePatientRepository(db)
      const match = await repository.findByExactPhoneAndEmail(org.id, '987654321', null)

      expect(match?.id).toBe(patient.id)
    })
  })

  it('requires both phone and email to match when email is provided', async () => {
    await withTestTransaction(async (db) => {
      const org = await seedTestOrganization(db)
      await seedTestPatient(db, org.id, { phone: '987654321', email: 'maria@example.com' })

      const repository = new DrizzlePatientRepository(db)
      const noMatch = await repository.findByExactPhoneAndEmail(org.id, '987654321', 'otra@example.com')

      expect(noMatch).toBeNull()
    })
  })

  it('returns null when no patient matches', async () => {
    await withTestTransaction(async (db) => {
      const org = await seedTestOrganization(db)

      const repository = new DrizzlePatientRepository(db)
      const match = await repository.findByExactPhoneAndEmail(org.id, '000000000', null)

      expect(match).toBeNull()
    })
  })

  it('does not match soft-deleted patients', async () => {
    await withTestTransaction(async (db) => {
      const org = await seedTestOrganization(db)
      await seedTestPatient(db, org.id, {
        phone: '987654321',
        email: null,
        deletedAt: new Date(),
      })

      const repository = new DrizzlePatientRepository(db)
      const match = await repository.findByExactPhoneAndEmail(org.id, '987654321', null)

      expect(match).toBeNull()
    })
  })
})
