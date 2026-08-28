const { sequelize } = require('./config/database');
const { Sale } = require('./models');

async function testFestivalMultipliers() {
  await sequelize.authenticate();

  // 1. Non-festive baseline
  const normalSales = await Sale.findAll({
    attributes: [
      'week_number',
      [sequelize.fn('SUM', sequelize.col('units_sold')), 'weekly_units'],
      [sequelize.fn('SUM', sequelize.col('revenue')), 'weekly_revenue'],
      [sequelize.fn('SUM', sequelize.col('gross_profit')), 'weekly_profit']
    ],
    where: { is_festive_week: false },
    group: ['week_number'],
    raw: true
  });

  const normalWeeksCount = normalSales.length || 1;
  const totalNormalUnits = normalSales.reduce((sum, w) => sum + parseInt(w.weekly_units || 0, 10), 0);
  const totalNormalRevenue = normalSales.reduce((sum, w) => sum + parseFloat(w.weekly_revenue || 0), 0);
  const totalNormalProfit = normalSales.reduce((sum, w) => sum + parseFloat(w.weekly_profit || 0), 0);

  const avgNormalWeeklyUnits = totalNormalUnits / normalWeeksCount;
  const avgNormalWeeklyRevenue = totalNormalRevenue / normalWeeksCount;
  const avgNormalWeeklyProfit = totalNormalProfit / normalWeeksCount;

  // 2. Festive periods
  const festiveSales = await Sale.findAll({
    attributes: [
      'festival_name',
      'week_number',
      [sequelize.fn('SUM', sequelize.col('units_sold')), 'weekly_units'],
      [sequelize.fn('SUM', sequelize.col('revenue')), 'weekly_revenue'],
      [sequelize.fn('SUM', sequelize.col('gross_profit')), 'weekly_profit']
    ],
    where: { is_festive_week: true },
    group: ['festival_name', 'week_number'],
    raw: true
  });

  const festivalGroupMap = {};
  festiveSales.forEach(f => {
    const name = f.festival_name || 'Festive';
    if (!festivalGroupMap[name]) {
      festivalGroupMap[name] = {
        name,
        weeksCount: 0,
        units_sold: 0,
        revenue: 0,
        gross_profit: 0
      };
    }
    festivalGroupMap[name].weeksCount += 1;
    festivalGroupMap[name].units_sold += parseInt(f.weekly_units || 0, 10);
    festivalGroupMap[name].revenue += parseFloat(f.weekly_revenue || 0);
    festivalGroupMap[name].gross_profit += parseFloat(f.weekly_profit || 0);
  });

  const result = [
    {
      name: 'Normal (Baseline)',
      period: `${normalWeeksCount} Non-Festive Weeks`,
      units_sold: totalNormalUnits,
      weekly_units: Math.round(avgNormalWeeklyUnits),
      revenue: totalNormalRevenue,
      gross_profit: totalNormalProfit,
      multiplier: 1.0,
      is_baseline: true
    }
  ];

  const festivalOrder = ['Ugadi & Akshaya Tritiya', 'Mysore Dussehra', 'Diwali Mega Sale', 'Year-End Gala'];
  festivalOrder.forEach(fn => {
    const data = festivalGroupMap[fn];
    if (data) {
      const avgWeeklyUnits = data.units_sold / (data.weeksCount || 1);
      const mult = avgNormalWeeklyUnits > 0 ? parseFloat((avgWeeklyUnits / avgNormalWeeklyUnits).toFixed(1)) : 1.0;
      result.push({
        name: fn.replace(' & Akshaya Tritiya', '').replace(' Mega Sale', '').replace(' Gala', ''),
        fullName: fn,
        period: `${data.weeksCount} Week${data.weeksCount > 1 ? 's' : ''}`,
        units_sold: data.units_sold,
        weekly_units: Math.round(avgWeeklyUnits),
        revenue: data.revenue,
        gross_profit: data.gross_profit,
        multiplier: mult,
        is_baseline: false
      });
    }
  });

  console.log('--- FESTIVAL MULTIPLIER RESULTS ---');
  console.log(JSON.stringify(result, null, 2));
}

testFestivalMultipliers().then(() => process.exit(0));
