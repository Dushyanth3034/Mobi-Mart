const { Sale, Product, Store } = require('../models');
const { sequelize } = require('../config/database');

exports.getAnalyticsData = async (req, res) => {
  try {
    // 1. Monthly 12-Month Sales Trend Promise
    const rawMonthlySalesPromise = Sale.findAll({
      attributes: [
        'year',
        'month',
        [sequelize.fn('SUM', sequelize.col('units_sold')), 'units_sold'],
        [sequelize.fn('SUM', sequelize.col('revenue')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('gross_profit')), 'gross_profit'],
        [sequelize.fn('SUM', sequelize.col('lost_revenue')), 'lost_revenue']
      ],
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']],
      raw: true
    });

    // 2. Category Share (Revenue & Profit) Promise
    const rawCategoryPerformancePromise = Sale.findAll({
      attributes: [
        [sequelize.col('product.category'), 'category'],
        [sequelize.fn('SUM', sequelize.col('Sale.units_sold')), 'units_sold'],
        [sequelize.fn('SUM', sequelize.col('Sale.revenue')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('Sale.gross_profit')), 'gross_profit'],
        [sequelize.fn('SUM', sequelize.col('Sale.lost_gross_profit')), 'lost_profit']
      ],
      include: [{ model: Product, as: 'product', attributes: [] }],
      group: ['product.category'],
      order: [[sequelize.fn('SUM', sequelize.col('Sale.revenue')), 'DESC']],
      raw: true
    });

    // 3. Brand Sales Performance (Brand Revenue Distribution) Promise
    const rawBrandPerformancePromise = Sale.findAll({
      attributes: [
        [sequelize.col('product.brand'), 'brand'],
        [sequelize.fn('SUM', sequelize.col('Sale.units_sold')), 'units_sold'],
        [sequelize.fn('SUM', sequelize.col('Sale.revenue')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('Sale.gross_profit')), 'gross_profit']
      ],
      include: [{ model: Product, as: 'product', attributes: [] }],
      group: ['product.brand'],
      order: [[sequelize.fn('SUM', sequelize.col('Sale.revenue')), 'DESC']],
      raw: true
    });

    // 4. Normal Sales Baseline Promise
    const normalSalesPromise = Sale.findAll({
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

    // 5. Festive Sales Promise
    const festiveSalesPromise = Sale.findAll({
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

    // 6. Store Sales Efficiency / City Breakdown Promise
    const rawCityPerformancePromise = Sale.findAll({
      attributes: [
        [sequelize.col('store.city'), 'city'],
        [sequelize.col('store.tier'), 'tier'],
        [sequelize.fn('SUM', sequelize.col('Sale.units_sold')), 'units_sold'],
        [sequelize.fn('SUM', sequelize.col('Sale.revenue')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('Sale.gross_profit')), 'gross_profit']
      ],
      include: [{ model: Store, as: 'store', attributes: [] }],
      group: ['store.city', 'store.tier'],
      order: [[sequelize.fn('SUM', sequelize.col('Sale.revenue')), 'DESC']],
      raw: true
    });

    // Execute all 6 queries concurrently in parallel
    const [
      rawMonthlySales,
      rawCategoryPerformance,
      rawBrandPerformance,
      normalSales,
      festiveSales,
      rawCityPerformance
    ] = await Promise.all([
      rawMonthlySalesPromise,
      rawCategoryPerformancePromise,
      rawBrandPerformancePromise,
      normalSalesPromise,
      festiveSalesPromise,
      rawCityPerformancePromise
    ]);

    const monthlySales = rawMonthlySales.map((m) => ({
      year: parseInt(m.year, 10),
      month: parseInt(m.month, 10),
      units_sold: parseInt(m.units_sold || 0, 10),
      revenue: parseFloat(m.revenue || 0),
      gross_profit: parseFloat(m.gross_profit || 0),
      lost_revenue: parseFloat(m.lost_revenue || 0)
    }));

    const categoryPerformance = rawCategoryPerformance
      .filter((c) => c.category)
      .map((c) => ({
        category: c.category,
        units_sold: parseInt(c.units_sold || 0, 10),
        revenue: parseFloat(c.revenue || 0),
        gross_profit: parseFloat(c.gross_profit || 0),
        lost_profit: parseFloat(c.lost_profit || 0)
      }));

    const brandPerformance = rawBrandPerformance
      .filter((b) => b.brand)
      .map((b) => ({
        brand: b.brand,
        revenue: parseFloat(b.revenue || 0),
        units_sold: parseInt(b.units_sold || 0, 10),
        gross_profit: parseFloat(b.gross_profit || 0)
      }));

    const normalWeeksCount = normalSales.length || 1;
    const totalNormalUnits = normalSales.reduce((sum, w) => sum + parseInt(w.weekly_units || 0, 10), 0);
    const totalNormalRevenue = normalSales.reduce((sum, w) => sum + parseFloat(w.weekly_revenue || 0), 0);
    const totalNormalProfit = normalSales.reduce((sum, w) => sum + parseFloat(w.weekly_profit || 0), 0);

    const avgNormalWeeklyUnits = totalNormalUnits / normalWeeksCount;
    const avgNormalWeeklyRevenue = totalNormalRevenue / normalWeeksCount;
    const avgNormalWeeklyProfit = totalNormalProfit / normalWeeksCount;

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

    const festivalImpact = [
      {
        name: 'Normal',
        fullName: 'Normal Non-Festive Weeks',
        period: `${normalWeeksCount} Non-Festive Weeks`,
        units_sold: totalNormalUnits,
        weekly_units: Math.round(avgNormalWeeklyUnits),
        revenue: totalNormalRevenue,
        gross_profit: totalNormalProfit,
        multiplier: 1.0,
        is_baseline: true
      }
    ];

    const festivalOrder = ['Ugadi & Akshaya Tritiya', 'Mysore Dussehra', 'Diwali Mega Sale', 'New Year Gala'];
    festivalOrder.forEach(fn => {
      const data = festivalGroupMap[fn];
      if (data) {
        const avgWeeklyUnits = data.units_sold / (data.weeksCount || 1);
        const mult = avgNormalWeeklyUnits > 0 ? parseFloat((avgWeeklyUnits / avgNormalWeeklyUnits).toFixed(1)) : 1.0;
        festivalImpact.push({
          name: fn.replace(' & Akshaya Tritiya', '').replace(' Mega Sale', '').replace(' Gala', ''),
          fullName: fn,
          period: `${data.weeksCount} Festive Week${data.weeksCount > 1 ? 's' : ''}`,
          units_sold: data.units_sold,
          weekly_units: Math.round(avgWeeklyUnits),
          revenue: data.revenue,
          gross_profit: data.gross_profit,
          multiplier: mult,
          is_baseline: false
        });
      }
    });

    const cityPerformance = rawCityPerformance
      .filter((cp) => cp.city)
      .map((cp) => ({
        city: cp.city,
        tier: cp.tier,
        units_sold: parseInt(cp.units_sold || 0, 10),
        revenue: parseFloat(cp.revenue || 0),
        gross_profit: parseFloat(cp.gross_profit || 0)
      }));

    res.json({
      success: true,
      data: {
        monthlySales,
        categoryPerformance,
        brandPerformance,
        festivalImpact,
        cityPerformance
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
