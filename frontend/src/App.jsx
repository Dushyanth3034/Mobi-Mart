import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { StoresPage } from './pages/StoresPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { WeeklyAllocationPage } from './pages/WeeklyAllocationPage';
import { EolRiskPage } from './pages/EolRiskPage';
import { BaselineComparisonPage } from './pages/BaselineComparisonPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="allocation" element={<WeeklyAllocationPage />} />
          <Route path="eol-risk" element={<EolRiskPage />} />
          <Route path="baseline" element={<BaselineComparisonPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="scenario" element={<ScenarioSimulatorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
