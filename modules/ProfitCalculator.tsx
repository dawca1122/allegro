import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

const ProfitCalculator: React.FC = () => {
  const [values, setValues] = useState({
    salesPrice: 100,
    costPrice: 50,
    shippingCost: 15,
    commissionRate: 10, // Percent
    taxRate: 23, // Percent
  });

  const [results, setResults] = useState({
    commissionAmount: 0,
    taxAmount: 0,
    totalCosts: 0,
    netProfit: 0,
    margin: 0,
    roi: 0
  });

  useEffect(() => {
    const commission = (values.salesPrice * values.commissionRate) / 100;
    const netPrice = values.salesPrice / (1 + values.taxRate / 100);
    const tax = values.salesPrice - netPrice;
    
    // Simplified Calculation
    // Total Costs = Cost of Goods + Shipping + Commission
    // Note: Tax calculation depends on specific accounting method (VAT on margin vs full). 
    // Assuming simple VAT scenario here: Sales Price (Gross) - VAT = Net Sales. 
    // Net Sales - Cost - Shipping - Commission = Profit (Pre-Income Tax).
    
    // Let's do a strict cash flow calc:
    // Money In: Sales Price
    // Money Out: Cost Goods + Shipping + Commission + Tax (VAT)
    
    const totalOut = values.costPrice + values.shippingCost + commission + tax;
    const profit = values.salesPrice - totalOut;
    const margin = (profit / values.salesPrice) * 100;
    const roi = (profit / (values.costPrice + values.shippingCost)) * 100;

    setResults({
      commissionAmount: commission,
      taxAmount: tax,
      totalCosts: totalOut,
      netProfit: profit,
      margin,
      roi
    });
  }, [values]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="w-6 h-6 text-primary" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white">Profit Margin Calculator</h2>
               <p className="text-sm text-slate-500">Real-time simulation for Allegro offers</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Inputs */}
          <div className="p-8 space-y-6 border-r border-border bg-slate-950/50">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sales Price (Gross)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">PLN</span>
                  <input name="salesPrice" type="number" value={values.salesPrice} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cost of Goods (Net)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">PLN</span>
                  <input name="costPrice" type="number" value={values.costPrice} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Shipping</label>
                  <input name="shippingCost" type="number" value={values.shippingCost} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:outline-none" />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Allegro Comm. (%)</label>
                  <input name="commissionRate" type="number" value={values.commissionRate} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:outline-none" />
                </div>
              </div>

               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">VAT Rate (%)</label>
                  <select name="taxRate" value={values.taxRate} onChange={(e) => setValues({...values, taxRate: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:outline-none appearance-none">
                    <option value="23">23%</option>
                    <option value="8">8%</option>
                    <option value="5">5%</option>
                    <option value="0">0%</option>
                  </select>
               </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-8 bg-slate-900 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Commission (Allegro)</span>
                <span className="text-white font-mono">{results.commissionAmount.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">VAT Amount</span>
                <span className="text-white font-mono">{results.taxAmount.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between text-sm pb-4 border-b border-slate-800">
                <span className="text-slate-400">Total Costs</span>
                <span className="text-rose-400 font-mono">-{results.totalCosts.toFixed(2)} PLN</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Estimated Net Profit</span>
              <div className={`text-5xl font-bold mt-2 ${results.netProfit > 0 ? 'text-accent' : 'text-danger'}`}>
                {results.netProfit.toFixed(2)} <span className="text-2xl text-slate-600">PLN</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 rounded-lg p-4 text-center border border-slate-800">
                 <span className="text-xs text-slate-500 block">Margin</span>
                 <span className={`text-xl font-bold ${results.margin > 15 ? 'text-accent' : results.margin > 0 ? 'text-warning' : 'text-danger'}`}>
                   {results.margin.toFixed(1)}%
                 </span>
              </div>
              <div className="bg-slate-950 rounded-lg p-4 text-center border border-slate-800">
                 <span className="text-xs text-slate-500 block">ROI</span>
                 <span className={`text-xl font-bold ${results.roi > 0 ? 'text-primary' : 'text-danger'}`}>
                   {results.roi.toFixed(1)}%
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;