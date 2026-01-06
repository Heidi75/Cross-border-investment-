import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Download, ChevronRight, FileText } from 'lucide-react';

const ComplianceDemo = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [mode, setMode] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedRule, setExpandedRule] = useState(null);

  const [customScenario, setCustomScenario] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [auditDownloadUrl, setAuditDownloadUrl] = useState(null);

  const scenarios = [
    {
      id: 1,
      title: "Cross-Border EM Bond Sale",
      text: "US citizen, resident in Germany, mid risk appetite, wants high-yield emerging markets bond through German account, previously rejected complex disclosures."
    },
    {
      id: 2,
      title: "Multi-Jurisdiction Options Trade",
      text: "UK citizen, resident in Singapore, high risk appetite, wants to trade US equity options, has existing margin account."
    },
    {
      id: 4,
      title: "mBridge CBDC Transfer from UAE",
      text: "US citizen, resident in UAE, wants to transfer high-value funds via mBridge cross-border payment system from UAE account to Chase US account."
    }
  ];

  const getScenarioData = (scenario) => {
    if (!scenario) return null;

    switch(scenario.id) {
      case 1: 
        return {
          facts: { Client_citizenship: "US", Client_residence: "Germany", Risk_profile: "Medium", Product: "EM_HY_bond", Account_domicile: "Germany", Complexity_tier: 3 },
          rules: [
            { id: "R1", summary: "US citizen + EU account requires Rule_set_X", detail: "If client.citizenship = US AND client.account_domicile IN EU THEN apply_ruleset(X)", fires: true, conflict: false },
            { id: "R3", summary: "Complexity tier violation triggers veto", detail: "If product.complexity_tier > client.max_complexity_tier (2) THEN action = VETO", fires: true, conflict: true }
          ],
          llmResponse: "Based on the client profile, I recommend proceeding with the EM high-yield bond purchase. The risk aligns with their profile.",
          vetoReason: "Product complexity (3) exceeds client threshold (2) due to prior rejections.",
          finalDecision: "DO NOT SELL EM_HY_bond. Offer UCITS alternative tier ≤ 2",
          bankerExplanation: "We cannot proceed with this specific bond. Internal policy limits product complexity for this profile. I suggest a UCITS-compliant EM fund instead."
        };

      case 4:
        return {
          facts: { Client_citizenship: "US", Transfer_type: "mBridge_CBDC", Origin: "UAE", Ruleset_exists: false },
          rules: [
            { id: "R1", summary: "US citizen foreign transfers require FATCA check", detail: "If citizenship = US AND origin != US THEN require_FATCA()", fires: true, conflict: false },
            { id: "R3", summary: "Unregulated rail triggers automatic veto", detail: "If payment_rail.ruleset_exists = false THEN action = VETO", fires: true, conflict: true }
          ],
          llmResponse: "This is a great use of mBridge. We can facilitate this high-value transfer to Chase US for better liquidity.",
          vetoReason: "No regulatory framework established for mBridge_CBDC payment rail per Rule R3.",
          finalDecision: "TRANSACTION REJECTED: Unregulated payment rail.",
          bankerExplanation: "We cannot process this via mBridge as there is no regulatory framework for it yet. Please use a standard international wire transfer."
        };

      default: // The "Safety Gate" for Custom Scenarios
        return {
          facts: { Scenario_Type: "Unstructured_Input", Analysis_Status: "Out_of_Scope" },
          rules: [
            { id: "GLOBAL_01", summary: "Rule Engine Scope Validation", detail: "If scenario_id NOT IN [verified_knowledge_base] THEN action = BLOCK", fires: true, conflict: true }
          ],
          llmResponse: "I can assist with this request. I will check regional restrictions and our current inventory for this custom inquiry...",
          vetoReason: "The HPLM engine has flagged this request as 'Out of Scope' for the current Pilot Demo.",
          finalDecision: "INQUIRY BLOCKED: Knowledge Base Boundary Reached.",
          bankerExplanation: "I cannot provide a compliance-verified decision for this specific scenario yet. Our HPLM Pilot is currently only configured for EM Bonds and mBridge transfers. To ensure 100% regulatory safety, we do not allow the LLM to process inquiries outside these pre-validated structures. Try one of our preset demos!"
        };
    }
  };

  const scenarioData = getScenarioData(selectedScenario);
  
  const runDemo = (demoMode) => {
    setMode(demoMode);
    setShowResults(true);
  };

  const generateAuditTrail = () => {
    const auditTrail = {
      timestamp: new Date().toISOString(),
      scenario: selectedScenario?.title,
      mode: "HPLM_DETERMINISTIC",
      decision: scenarioData?.finalDecision,
      evidence_trace: scenarioData?.rules.filter(r => r.fires).map(r => r.id)
    };
    const blob = new Blob([JSON.stringify(auditTrail, null, 2)], { type: 'application/json' });
    setAuditDownloadUrl(URL.createObjectURL(blob));
  };

  const reset = () => {
    setShowResults(false);
    setMode(null);
    setExpandedRule(null);
    setAuditDownloadUrl(null);
    setSelectedScenario(null);
    setIsCustomMode(false);
    setCustomScenario('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-blue-400">HPLM Compliance Engine</h1>
          <p className="text-slate-400">Deterministic Logic Layer for Generative AI</p>
        </header>

        {!showResults ? (
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex gap-4 mb-6">
                <button onClick={() => setIsCustomMode(false)} className={`px-4 py-2 rounded-lg ${!isCustomMode ? 'bg-blue-600' : 'bg-slate-700'}`}>Presets</button>
                <button onClick={() => { setIsCustomMode(true); setSelectedScenario(null); }} className={`px-4 py-2 rounded-lg ${isCustomMode ? 'bg-blue-600' : 'bg-slate-700'}`}>Custom</button>
              </div>

              {!isCustomMode ? (
                <div className="grid gap-3">
                  {scenarios.map(s => (
                    <button key={s.id} onClick={() => setSelectedScenario(s)} className={`p-4 text-left rounded-lg border-2 transition-all ${selectedScenario?.id === s.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                      <div className="font-bold">{s.title}</div>
                      <div className="text-sm text-slate-400">{s.text}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea 
                  value={customScenario} 
                  onChange={(e) => setCustomScenario(e.target.value)}
                  placeholder="Describe a client scenario..."
                  className="w-full h-32 bg-slate-900 p-4 rounded-lg border border-slate-700 mb-4"
                />
              )}
              
              { (selectedScenario || customScenario) && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button onClick={() => runDemo('llm-only')} className="p-4 rounded-lg border border-red-500 text-red-400 hover:bg-red-500/10">Run LLM Only</button>
                  <button onClick={() => runDemo('hplm')} className="p-4 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold">Run HPLM Protected</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results UI */}
            <div className={`p-6 rounded-xl border-2 ${mode === 'hplm' ? 'border-green-500 bg-green-500/5' : 'border-red-500 bg-red-500/5'}`}>
              <h2 className="text-xl font-bold mb-4">{mode === 'hplm' ? 'HPLM Verified Output' : 'Unprotected LLM Output'}</h2>
              
              <div className="bg-slate-950 p-4 rounded mb-4 font-mono text-sm">
                <div className="text-blue-400 mb-2">// Decision</div>
                {mode === 'hplm' ? scenarioData.finalDecision : 'Proceed with transaction (Potential Hallucination)'}
              </div>

              {mode === 'hplm' && (
                <div className="bg-red-500/20 p-4 rounded border border-red-500 mb-4">
                  <div className="font-bold text-red-400 flex items-center gap-2"><XCircle size={18}/> Deontic Veto Applied</div>
                  <div className="text-sm mt-1">{scenarioData.vetoReason}</div>
                </div>
              )}

              <div className="text-slate-300 italic p-4 bg-slate-800 rounded">
                "{mode === 'hplm' ? scenarioData.bankerExplanation : scenarioData.llmResponse}"
              </div>

              <div className="mt-6 flex gap-4">
                <button onClick={reset} className="px-4 py-2 bg-slate-700 rounded-lg">Try Again</button>
                {mode === 'hplm' && (
                  !auditDownloadUrl ? (
                    <button onClick={generateAuditTrail} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg"><FileText size={18}/> Generate Audit</button>
                  ) : (
                    <a href={auditDownloadUrl} download="audit-trail.json" className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg"><Download size={18}/> Download JSON</a>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDemo;
