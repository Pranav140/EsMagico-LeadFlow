import { PrismaClient, LeadStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Helper: date offset from today
const daysFromNow = (days: number): Date => {
  const d = new Date()
  d.setHours(12, 0, 0, 0) // noon to avoid timezone edge cases
  d.setDate(d.getDate() + days)
  return d
}

const TODAY    = daysFromNow(0)   // follow-up due today
const OVERDUE  = daysFromNow(-1)  // follow-up was yesterday → overdue

async function main() {
  console.log('🌱 Seeding LeadFlow database...')

  // Clean slate
  await prisma.discussion.deleteMany()
  await prisma.lead.deleteMany()

  // ──────────────────────────────────────────────
  // 1. Sarah Connor — Acme Corp — QUALIFIED
  //    Has a follow-up scheduled for TODAY
  // ──────────────────────────────────────────────
  const sarah = await prisma.lead.create({
    data: {
      name:    'Sarah Connor',
      company: 'Acme Corp',
      phone:   '+1 (555) 101-2030',
      status:  LeadStatus.QUALIFIED,
      discussions: {
        create: [
          {
            note:      'Initial discovery call. They need a CRM for 50 reps across 3 regional offices. Pain point is their current spreadsheet chaos.',
            createdAt: new Date('2024-03-01T09:00:00Z'),
          },
          {
            note:      'Deep-dive demo completed. Sarah loved the pipeline view. Requested a custom pricing proposal by EOW.',
            createdAt: new Date('2024-03-08T14:30:00Z'),
          },
          {
            note:      "Sent tailored pricing deck with enterprise tier. She said she'd loop in the CFO next week.",
            followUpAt: TODAY,
            createdAt: new Date('2024-03-12T11:00:00Z'),
          },
        ],
      },
    },
  })

  // ──────────────────────────────────────────────
  // 2. Hank Scorpio — Globex — PROPOSAL_SENT
  //    Has an OVERDUE follow-up (yesterday)
  // ──────────────────────────────────────────────
  const hank = await prisma.lead.create({
    data: {
      name:    'Hank Scorpio',
      company: 'Globex',
      phone:   '+1 (555) 202-3040',
      status:  LeadStatus.PROPOSAL_SENT,
      discussions: {
        create: [
          {
            note:      'Cold outreach via LinkedIn. Hank replied within the hour — very enthusiastic. Scheduled a call.',
            createdAt: new Date('2024-02-20T08:00:00Z'),
          },
          {
            note:      'Discovery call. Globex is expanding globally and needs multi-currency pipeline tracking. Big opportunity.',
            createdAt: new Date('2024-02-27T10:00:00Z'),
          },
          {
            note:      "Sent full proposal with global plan pricing. Hank said he'd review over the weekend.",
            createdAt: new Date('2024-03-05T16:00:00Z'),
          },
          {
            note:      'Left a voicemail with his assistant. No response yet — proposal may be stuck in committee approval.',
            followUpAt: OVERDUE,
            createdAt: new Date('2024-03-10T09:30:00Z'),
          },
        ],
      },
    },
  })

  // ──────────────────────────────────────────────
  // 3. Bill Lumbergh — Initech — CONTACTED
  // ──────────────────────────────────────────────
  const bill = await prisma.lead.create({
    data: {
      name:    'Bill Lumbergh',
      company: 'Initech',
      phone:   '+1 (555) 303-4050',
      status:  LeadStatus.CONTACTED,
      discussions: {
        create: [
          {
            note:      'Inbound lead from website contact form. Bill manages a team of 12 inside sales reps.',
            createdAt: new Date('2024-03-14T13:00:00Z'),
          },
          {
            note:      "Intro call scheduled for next Tuesday. He mentioned they're also evaluating two competitors — will need to differentiate on reporting.",
            followUpAt: daysFromNow(5),
            createdAt: new Date('2024-03-15T09:00:00Z'),
          },
        ],
      },
    },
  })

  // ──────────────────────────────────────────────
  // 4. Bruce Wayne — Wayne Enterprises — WON 🎉
  // ──────────────────────────────────────────────
  const bruce = await prisma.lead.create({
    data: {
      name:    'Bruce Wayne',
      company: 'Wayne Enterprises',
      phone:   '+1 (555) 404-5060',
      status:  LeadStatus.WON,
      discussions: {
        create: [
          {
            note:      'Referred by an existing customer. Bruce was direct — they need enterprise CRM with SSO and audit logs. Our wheelhouse.',
            createdAt: new Date('2024-01-10T10:00:00Z'),
          },
          {
            note:      'Sent pricing tier PDF (Enterprise). Bruce said he would review with his CFO Lucius Fox.',
            createdAt: new Date('2024-01-15T14:00:00Z'),
          },
          {
            note:      'Legal reviewed MSA. Minor redlines on data retention clause — accepted our counter.',
            createdAt: new Date('2024-01-22T11:00:00Z'),
          },
          {
            note:      'Contract signed! Sending welcome package and scheduling onboarding kickoff for 200 seats.',
            createdAt: new Date('2024-01-29T15:00:00Z'),
          },
        ],
      },
    },
  })

  // ──────────────────────────────────────────────
  // 5. Donna Paulsen — Pearson Specter — NEW
  // ──────────────────────────────────────────────
  const donna = await prisma.lead.create({
    data: {
      name:    'Donna Paulsen',
      company: 'Pearson Specter',
      phone:   '+1 (555) 505-6070',
      status:  LeadStatus.NEW,
      discussions: {
        create: [
          {
            note:      'Met Donna at the SaaS Connect conference. She manages operations for a 30-person legal sales team. Exchanged cards.',
            createdAt: new Date('2024-03-18T17:00:00Z'),
          },
          {
            note:      'Follow-up email sent with one-pager. She opened it twice — scheduling a discovery call.',
            followUpAt: daysFromNow(2),
            createdAt: new Date('2024-03-19T10:00:00Z'),
          },
        ],
      },
    },
  })

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  const leads = [sarah, hank, bill, bruce, donna]

  console.log(`\n✅ Seeded ${leads.length} leads:`)
  for (const l of leads) {
    console.log(`   • ${l.name.padEnd(20)} [${l.status}]`)
  }

  console.log('\n📅 Follow-up schedule:')
  console.log(`   • Sarah Connor  → follow-up TODAY (${TODAY.toDateString()})`)
  console.log(`   • Hank Scorpio  → OVERDUE since ${OVERDUE.toDateString()}`)
  console.log(`   • Bill Lumbergh → follow-up in 5 days`)
  console.log(`   • Donna Paulsen → follow-up in 2 days`)

  console.log('\n🎉 Database seeded successfully!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
