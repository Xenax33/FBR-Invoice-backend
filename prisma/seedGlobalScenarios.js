import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scenarios = [
  { scenarioCode: 'SN001', scenarioDescription: 'Goods at standard rate to registered buyers' },
  { scenarioCode: 'SN002', scenarioDescription: 'Goods at standard rate to unregistered buyers' },
  { scenarioCode: 'SN003', scenarioDescription: 'Sale of Steel (Melted and Re-Rolled)' },
  { scenarioCode: 'SN004', scenarioDescription: 'Steel Melting and re-rolling / Ship breaking' },
  { scenarioCode: 'SN005', scenarioDescription: 'Reduced rate sale' },
  { scenarioCode: 'SN006', scenarioDescription: 'Goods at Reduced Rate' },
  { scenarioCode: 'SN007', scenarioDescription: 'Exempt Goods' },
  { scenarioCode: 'SN008', scenarioDescription: 'Goods at zero-rate' },
  { scenarioCode: 'SN009', scenarioDescription: 'Cotton Spinners purchase from Cotton Ginners (Textile Sector)' },
  { scenarioCode: 'SN010', scenarioDescription: 'Telecom services rendered or provided' },
  { scenarioCode: 'SN011', scenarioDescription: 'Telecommunication services' },
  { scenarioCode: 'SN012', scenarioDescription: 'Toll Manufacturing (Steel sector)' },
  { scenarioCode: 'SN013', scenarioDescription: 'Petroleum Products' },
  { scenarioCode: 'SN014', scenarioDescription: 'Electricity Supply to Retailers' },
  { scenarioCode: 'SN015', scenarioDescription: 'Gas to CNG stations' },
  { scenarioCode: 'SN016', scenarioDescription: 'Mobile Phones' },
  { scenarioCode: 'SN017', scenarioDescription: 'Processing / Conversion of Goods' },
  { scenarioCode: 'SN018', scenarioDescription: 'Goods (FED in ST Mode)' },
  { scenarioCode: 'SN019', scenarioDescription: 'Services (FED in ST Mode)' },
  { scenarioCode: 'SN020', scenarioDescription: 'Services' },
  { scenarioCode: 'SN021', scenarioDescription: 'Electric Vehicle' },
  { scenarioCode: 'SN022', scenarioDescription: 'Cement / Concrete Block' },
  { scenarioCode: 'SN023', scenarioDescription: 'Potassium Chlorate' },
  { scenarioCode: 'SN024', scenarioDescription: 'CNG Sales' },
  { scenarioCode: 'SN025', scenarioDescription: 'Goods as per SRO 297(1)/2023' },
  { scenarioCode: 'SN026', scenarioDescription: 'Non-Adjustable Supplies' },
  { scenarioCode: 'SN027', scenarioDescription: 'Sale to End Consumer by retailers (Standard Rate)' },
  { scenarioCode: 'SN028', scenarioDescription: '3rd Schedule Goods / End Consumer (Reduced Rate)' },
];

async function main() {
  console.log('🌱 Seeding global scenarios...');
  for (const sc of scenarios) {
    await prisma.globalScenario.upsert({
      where: { scenarioCode: sc.scenarioCode },
      update: { scenarioDescription: sc.scenarioDescription },
      create: sc,
    });
  }
  console.log('✅ Global scenarios seeded');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding global scenarios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
