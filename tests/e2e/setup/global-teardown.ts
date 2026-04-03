import { cleanupAll } from '../helpers/seed'

export default async function globalTeardown() {
  await cleanupAll()
}
