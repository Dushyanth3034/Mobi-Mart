const { sequelize } = require('./config/database');
const { EolRisk, Store, Product } = require('./models');
const { executeEolAction } = require('./services/eolRiskEngine');

async function testEolActions() {
  await sequelize.authenticate();
  console.log('--- Testing EOL Action Execution ---');

  const risks = await EolRisk.findAll({
    include: [
      { model: Product, as: 'product' },
      { model: Store, as: 'store' },
      { model: Store, as: 'suggestedStore' }
    ]
  });

  console.log(`Found ${risks.length} active EOL risks.`);
  if (risks.length === 0) {
    console.log('No EOL risks to test.');
    return;
  }

  // 1. Test HOLD Action
  const holdRisk = risks.find(r => r.recommended_action === 'HOLD') || risks[0];
  console.log(`Testing HOLD on Risk #${holdRisk.id} (${holdRisk.product?.model_name})...`);
  try {
    const holdRes = await executeEolAction(holdRisk.id, 'HOLD');
    console.log('HOLD Result:', holdRes);
  } catch (err) {
    console.error('HOLD Error:', err);
  }

  // 2. Test TRANSFER Action
  const transferRisk = risks.find(r => r.recommended_action === 'TRANSFER') || risks[1];
  console.log(`Testing TRANSFER on Risk #${transferRisk.id} (${transferRisk.product?.model_name})...`);
  try {
    const transferRes = await executeEolAction(transferRisk.id, 'TRANSFER');
    console.log('TRANSFER Result:', transferRes);
  } catch (err) {
    console.error('TRANSFER Error:', err);
  }

  // 3. Test MARKDOWN Action
  const markdownRisk = risks.find(r => r.recommended_action === 'MARKDOWN') || risks[2];
  console.log(`Testing MARKDOWN on Risk #${markdownRisk.id} (${markdownRisk.product?.model_name})...`);
  try {
    const markdownRes = await executeEolAction(markdownRisk.id, 'MARKDOWN');
    console.log('MARKDOWN Result:', markdownRes);
  } catch (err) {
    console.error('MARKDOWN Error:', err);
  }
}

testEolActions().then(() => process.exit(0)).catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
