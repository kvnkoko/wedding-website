import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Events
  const civilSigning = await prisma.event.upsert({
    where: { slug: 'civil-signing' },
    update: {},
    create: {
      name: 'Civil Signing',
      slug: 'civil-signing',
      dateTime: new Date('2025-01-22T10:00:00Z'),
      venueName: 'The Strand Hotel Yangon',
      city: 'Yangon',
      capacity: 60,
    },
  })

  const mandalayCelebration = await prisma.event.upsert({
    where: { slug: 'mandalay-celebration' },
    update: {},
    create: {
      name: 'Mandalay Celebration',
      slug: 'mandalay-celebration',
      dateTime: new Date('2025-02-12T10:00:00Z'),
      venueName: 'Mingalar Mandalay Hotel',
      city: 'Mandalay',
      capacity: 450,
    },
  })

  const yangonReception = await prisma.event.upsert({
    where: { slug: 'yangon-reception' },
    update: {},
    create: {
      name: 'Yangon Reception',
      slug: 'yangon-reception',
      dateTime: new Date('2025-03-22T10:00:00Z'),
      venueName: 'Lotte Hotel Yangon',
      city: 'Yangon',
      capacity: 400,
    },
  })

  console.log('✅ Created events')

  // Create Invite Link Configs
  const signingOnly = await prisma.inviteLinkConfig.upsert({
    where: { slug: 'signing-only' },
    update: {},
    create: {
      slug: 'signing-only',
      label: 'Civil Signing Only',
      notes: 'Invitation for civil signing ceremony only',
    },
  })

  const mandalayOnly = await prisma.inviteLinkConfig.upsert({
    where: { slug: 'mandalay-only' },
    update: {},
    create: {
      slug: 'mandalay-only',
      label: 'Mandalay Celebration Only',
      notes: 'Invitation for Mandalay celebration only',
    },
  })

  const yangonReceptionOnly = await prisma.inviteLinkConfig.upsert({
    where: { slug: 'yangon-reception-only' },
    update: {},
    create: {
      slug: 'yangon-reception-only',
      label: 'Yangon Reception Only',
      notes: 'Invitation for Yangon reception only',
    },
  })

  const signingAndYangon = await prisma.inviteLinkConfig.upsert({
    where: { slug: 'signing-and-yangon' },
    update: {},
    create: {
      slug: 'signing-and-yangon',
      label: 'Civil Signing + Yangon Reception',
      notes: 'Invitation for civil signing and Yangon reception',
    },
  })

  const mandalayAndYangon = await prisma.inviteLinkConfig.upsert({
    where: { slug: 'mandalay-and-yangon' },
    update: {},
    create: {
      slug: 'mandalay-and-yangon',
      label: 'Mandalay + Yangon Reception',
      notes: 'Invitation for Mandalay celebration and Yangon reception',
    },
  })

  console.log('✅ Created invite link configs')

  // Link Events to Configs
  await prisma.inviteLinkConfigEvent.upsert({
    where: {
      inviteLinkConfigId_eventId: {
        inviteLinkConfigId: signingOnly.id,
        eventId: civilSigning.id,
      },
    },
    update: {},
    create: {
      inviteLinkConfigId: signingOnly.id,
      eventId: civilSigning.id,
    },
  })

  await prisma.inviteLinkConfigEvent.upsert({
    where: {
      inviteLinkConfigId_eventId: {
        inviteLinkConfigId: mandalayOnly.id,
        eventId: mandalayCelebration.id,
      },
    },
    update: {},
    create: {
      inviteLinkConfigId: mandalayOnly.id,
      eventId: mandalayCelebration.id,
    },
  })

  await prisma.inviteLinkConfigEvent.upsert({
    where: {
      inviteLinkConfigId_eventId: {
        inviteLinkConfigId: yangonReceptionOnly.id,
        eventId: yangonReception.id,
      },
    },
    update: {},
    create: {
      inviteLinkConfigId: yangonReceptionOnly.id,
      eventId: yangonReception.id,
    },
  })

  await prisma.inviteLinkConfigEvent.upsert({
    where: {
      inviteLinkConfigId_eventId: {
        inviteLinkConfigId: signingAndYangon.id,
        eventId: civilSigning.id,
      },
    },
    update: {},
    create: {
      inviteLinkConfigId: signingAndYangon.id,
      eventId: civilSigning.id,
    },
  })

  await prisma.inviteLinkConfigEvent.upsert({
    where: {
      inviteLinkConfigId_eventId: {
        inviteLinkConfigId: signingAndYangon.id,
        eventId: yangonReception.id,
      },
    },
    update: {},
    create: {
      inviteLinkConfigId: signingAndYangon.id,
      eventId: yangonReception.id,
    },
  })

  await prisma.inviteLinkConfigEvent.upsert({
    where: {
      inviteLinkConfigId_eventId: {
        inviteLinkConfigId: mandalayAndYangon.id,
        eventId: mandalayCelebration.id,
      },
    },
    update: {},
    create: {
      inviteLinkConfigId: mandalayAndYangon.id,
      eventId: mandalayCelebration.id,
    },
  })

  await prisma.inviteLinkConfigEvent.upsert({
    where: {
      inviteLinkConfigId_eventId: {
        inviteLinkConfigId: mandalayAndYangon.id,
        eventId: yangonReception.id,
      },
    },
    update: {},
    create: {
      inviteLinkConfigId: mandalayAndYangon.id,
      eventId: yangonReception.id,
    },
  })

  console.log('✅ Linked events to configs')

  // Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@wedding.com' },
    update: {},
    create: {
      email: 'admin@wedding.com',
      passwordHash,
    },
  })

  console.log('✅ Created admin user')
  console.log('📧 Admin Email: admin@wedding.com')
  console.log('🔑 Admin Password: admin123')
  console.log('')
  console.log('✨ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

