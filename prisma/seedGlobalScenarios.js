import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scenarios = [
  { scenarioCode: 'SN001', scenarioDescription: 'Goods at standard rate to registered buyers', salesType: 'Goods at Standard Rate (default)' },
  { scenarioCode: 'SN002', scenarioDescription: 'Goods at standard rate to unregistered buyers ', salesType: 'Goods at Standard Rate (default)' },
  { scenarioCode: 'SN003', scenarioDescription: 'Sale of Steel (Melted and Re-Rolled)', salesType: 'Steel Melting and re-rolling' },
  { scenarioCode: 'SN004', scenarioDescription: 'Sale by Ship Breakers', salesType: 'Ship breaking' },
  { scenarioCode: 'SN005', scenarioDescription: 'Reduced rate sale', salesType: 'Goods at Reduced Rate' },
  { scenarioCode: 'SN006', scenarioDescription: 'Exempt goods sale', salesType: 'Exempt Goods' },
  { scenarioCode: 'SN007', scenarioDescription: 'Zero rated sale', salesType: 'Goods at zero-rate' },
  { scenarioCode: 'SN008', scenarioDescription: 'Sale of 3rd schedule goods', salesType: '3rd Schedule Goods' },
  { scenarioCode: 'SN009', scenarioDescription: 'Cotton Spinners purchase from Cotton Ginners (Textile Sector)', salesType: 'Cotton Ginners' },
  { scenarioCode: 'SN010', scenarioDescription: 'Telecom services rendered or provided', salesType: 'Telecommunication services' },
  { scenarioCode: 'SN011', scenarioDescription: 'Toll Manufacturing sale by Steel sector', salesType: 'Toll Manufacturing' },
  { scenarioCode: 'SN012', scenarioDescription: 'Sale of Petroleum products', salesType: 'Petroleum Products' },
  { scenarioCode: 'SN013', scenarioDescription: 'Electricity Supply to Retailers', salesType: 'Electricity Supply to Retailers' },
  { scenarioCode: 'SN014', scenarioDescription: 'Sale of Gas to CNG stations', salesType: 'Gas to CNG stations' },
  { scenarioCode: 'SN015', scenarioDescription: 'Sale of mobile phones', salesType: 'Mobile Phones' },
  { scenarioCode: 'SN016', scenarioDescription: 'Processing / Conversion of Goods', salesType: 'Processing/ Conversion of Goods' },
  { scenarioCode: 'SN017', scenarioDescription: 'Sale of Goods where FED is charged in ST mode', salesType: 'Goods (FED in ST Mode)' },
  { scenarioCode: 'SN018', scenarioDescription: 'Services rendered or provided where FED is charged in ST mode', salesType: 'Services (FED in ST Mode)' },
  { scenarioCode: 'SN019', scenarioDescription: 'Services rendered or provided', salesType: 'Services' },
  { scenarioCode: 'SN020', scenarioDescription: 'Sale of Electric Vehicles', salesType: 'Electric Vehicle' },
  { scenarioCode: 'SN021', scenarioDescription: 'Sale of Cement /Concrete Block', salesType: 'Cement /Concrete Block' },
  { scenarioCode: 'SN022', scenarioDescription: 'Sale of Potassium Chlorate', salesType: 'Potassium Chlorate' },
  { scenarioCode: 'SN023', scenarioDescription: 'Sale of CNG', salesType: 'CNG Sales' },
  { scenarioCode: 'SN024', scenarioDescription: 'Goods sold that are listed in SRO 297(1)/2023', salesType: 'Goods as per SRO.297(|)/2023' },
  { scenarioCode: 'SN025', scenarioDescription: 'Drugs sold at fixed ST rate under serial 81 of Eighth Schedule Table 1', salesType: 'Non-Adjustable Supplies' },
  { scenarioCode: 'SN026', scenarioDescription: 'Sale to End Consumer by retailers', salesType: 'Goods at Standard Rate (default)' },
  { scenarioCode: 'SN027', scenarioDescription: 'Sale to End Consumer by retailers', salesType: '3rd Schedule Goods' },
  { scenarioCode: 'SN028', scenarioDescription: 'Sale to End Consumer by retailers', salesType: 'Goods at Reduced Rate' },
];

async function main() {
  console.log('🌱 Seeding global scenarios...');
  for (const sc of scenarios) {
    await prisma.globalScenario.upsert({
      where: { scenarioCode: sc.scenarioCode },
      update: { 
        scenarioDescription: sc.scenarioDescription,
        salesType: sc.salesType 
      },
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
