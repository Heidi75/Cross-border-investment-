import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Download, ChevronRight } from 'lucide-react';

const ComplianceDemo = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');

  const scenarios = [
    {
      id: 1,
      title: "Cross-Border EM Bond Sale",
      text: "US citizen, resident in Germany, wants high-yield emerging markets bond. Previously rejected complex derivatives.",
      facts: { 
        Client_citizenship: "US", 
        Client_residence: "Germany", 
        Product: "EM_HY_bond", 
        Account_domicile: "Germany",
        Complexity_tier: 3,
        Prior_complex_derivatives_rejected: true 
      },
      rules: [
        { id: "R1", summary: "US citizen + EU account requirements", detail: "Apply cross-border tax treaty 402-B.", fires: true, conflict: false },
        { id: "R2", summary: "Prior derivatives rejection limits complexity to tier 2", detail: "Safety limit: client.max_complexity_tier = 2", fires: true, conflict: false },
        { id: "R3", summary: "Complexity tier violation triggers veto", detail: "If product.tier (3) > client.max (2) THEN VETO", fires: true, conflict: true }
      ],
      vetoReason: "Product complexity_tier (3) exceeds client max_complexity_tier (2) established by Rule R2.",
      finalDecision: "DO NOT SELL EM_HY_bond",
      alternative: "Offer UCITS fund alternative with complexity tier ≤ 2",
      llmSuggestion: "Proceed with sale after standard disclosures Y and Z."
    },
    {
      id: 4,
      title: "mBridge CBDC Transfer from UAE",
      text: "US citizen, resident in UAE, wants to transfer high-value funds via mBridge to Chase US account.",
      facts: { 
        Client_citizenship: "US", 
        Client_residence: "UAE", 
        Platform: "mBridge_Pilot", 
        Destination_Bank: "Chase_US",
        Regulatory_Status: "Experimental"
      },
      rules: [
        { id: "MB1", summary: "Identify mBridge status as 'Unregulated Pilot'", detail: "System check: corridor not approved for US Persons.", fires: true, conflict: false },
        { id: "MB2", summary: "Verify US Person Status", detail: "Apply OFAC digital asset guidelines.", fires: true, conflict: false },
        { id: "MB3", summary: "Lack of Regulation triggers Deontic Veto", detail: "If status != 'Regulated' AND client = 'US_Person' THEN VETO.", fires: true, conflict: true }
      ],
      vetoReason: "mBridge is not currently a regulated transfer option for US Citizens.",
      finalDecision: "BLOCK mBridge Transfer",
      alternative: "Route via standard SWIFT network (Regulated Channel)",
      llmSuggestion: "Process transfer via mBridge for instant liquidity."
    }
  ];

  const handleRun = () => {
    if (isCustomMode) {
      const lowerText = customText.toLowerCase();
      if (lowerText.includes('mbridge')) {
        setSelectedScenario(scenarios[1]);
      } else if (lowerText.includes('bond')) {
        setSelectedScenario(scenarios[0]);
      } else {
        setSelectedScenario({ 
          id: 'unknown', 
          title: 'Custom Input Analysis', 
          text: customText,
          facts: { Input_Text: customText, Status: "Unrecognized" },
          rules: [],
          unknown: true 
        });
      }
    }
    setShowResults(true);
  };

  const downloadAuditTrail = () => {
    const active = selectedScenario;
    let auditData;

    if (active.unknown) {
      auditData = {
        timestamp: new Date().toISOString(),
        input_scenario: active.text,
        analysis_status: "INCOMPLETE",
        message: "No existing rules or regulations have been put in this pilot to complete the analysis of the transaction.",
        recommendation: "Refer to manual compliance review."
      };
    } else {
      auditData = {
        timestamp: new Date().toISOString(),
        scenario_title: active.title,
        layer_A_extracted_facts: active.facts,
        layer_B_rules_evaluated: active.rules.map(r => ({ id: r.id, logic: r.detail, result: r.conflict ? "VETO_TRIGGERED" : "PASSED" })),
        layer_C_veto_details: { applied: true, reason: active.vetoReason, overridden_llm_suggestion: active.llmSuggestion },
        layer_D_safe_harbor: { decision: active.finalDecision, action: active.alternative },
        compliance_status: "VERIFIED_BY_HPLM"
      };
    }

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HPLM_Audit_Trail_${active.id}.json`;
    a.click();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">HPLM Compliance Guardrail</h1>
        <p className="text-slate-400 mb-8">Verifiable Audit Trails for High-Stakes Transactions</p>

        {!showResults ? (
          <div className="space-y-6">
            <div className="flex gap-4 p-1 bg-slate-800 rounded-lg w-fit">
              <button onClick={() => setIsCustomMode(false)} className={`px-4 py-2 rounded-md transition-all ${!isCustomMode ? 'bg-blue-600 shadow-lg' : 'text-slate-400'}`}>Standard Scenarios</button>
              <button onClick={() => setIsCustomMode(true)} className={`px-4 py-2 rounded-md transition-all ${isCustomMode ? 'bg-blue-600 shadow-lg' : 'text-slate-400'}`}>Custom Input</button>
            </div>

            {isCustomMode ? (
              <textarea 
                className="w-full h-48 bg-slate-800 border border-slate-700 p-4 rounded-xl focus:border-blue-500 outline-none transition-all"
                placeholder="Paste transaction details here... (e.g. US citizen in Brazil via mBridge)"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            ) : (
              <div className="grid gap-4">
                {scenarios.map(s => (
                  <button key={s.id} onClick={() => setSelectedScenario(s)} className={`p-5 rounded-xl border-2 text-left transition-all ${selectedScenario?.id === s.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}>
                    <div className="font-bold text-lg">{s.title}</div>
                    <div className="text-sm text-slate-400 mt-1">{s.text}</div>
                  </button>
                ))}
              </div>
            )}

            {(selectedScenario || (isCustomMode && customText)) && (
              <button onClick={handleRun} className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 transition-all">Run LLM + HPLM Protection</button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {selectedScenario.unknown ? (
              <div className="p-12 bg-slate-800 border-2 border-dashed border-slate-600 rounded-2xl text-center">
                <AlertCircle className="mx-auto w-16 h-16 text-slate-500 mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-slate-300">Analysis Incomplete</h3>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">No existing rules or regulations have been put in this pilot to complete the analysis of the transaction.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-slate-800 rounded-xl border border-blue-500/30">
                  <h4 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 text-left">Step A: Extracted Facts</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm font-mono text-left">
                    {Object.entries(selectedScenario.facts).map(([k, v]) => (
                      <React.Fragment key={k}>
                        <div className="text-slate-500">{k}:</div>
                        <div className="text-slate-200">{String(v)}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-red-900/30 border-2 border-red-500 rounded-xl text-left">
                  <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-2">Step C: Deontic Veto</h4>
                  <p className="font-bold text-lg leading-snug">{selectedScenario.vetoReason}</p>
                </div>

                <div className="p-6 bg-green-900/20 border-2 border-green-500 rounded-xl text-left">
                  <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-2">Step D: Safe Harbor Decision</h4>
                  <p className="text-xl font-bold">{selectedScenario.finalDecision}</p>
                  <p className="text-slate-300 mt-2 bg-black/20 p-3 rounded italic text-sm">"System Action: {selectedScenario.alternative}"</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-4 pt-6">
              <button onClick={downloadAuditTrail} className="flex-1 py-4 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2"><Download size={20}/> Download Full Audit JSON</button>
              <button onClick={() => {setShowResults(false); setSelectedScenario(null); setCustomText('');}} className="flex-1 py-4 bg-slate-800 rounded-xl font-bold border border-slate-700">Start New Analysis</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDemo;
