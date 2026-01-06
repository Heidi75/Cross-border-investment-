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
  
  // Client information form state
  const [clientInfo, setClientInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    citizenship: '',
    residence: '',
    accountDomicile: ''
  });
  const [showClientForm, setShowClientForm] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const scenarios = [
    {
      id: 1,
      title: "Cross-Border EM Bond Sale",
      text: "US citizen, resident in Germany, mid risk appetite, wants high-yield emerging markets bond through German account, previously rejected complex derivatives disclosures."
    },
    {
      id: 2,
      title: "Multi-Jurisdiction Options Trade",
      text: "UK citizen, resident in Singapore, high risk appetite, wants to trade US equity options, has existing margin account, recently passed suitability assessment."
    },
    {
      id: 3,
      title: "Structured Product to Conservative Client",
      text: "German citizen, resident in Germany, low risk appetite, interested in structured note with embedded leverage, retired with fixed income needs, no derivatives experience."
    },
    {
      id: 4,
      title: "mBridge CBDC Transfer from UAE",
      text: "US citizen, resident in UAE, wants to transfer high-value funds via mBridge cross-border payment system from UAE account to Chase US account for on-demand liquidity access, no previous CBDC transaction history."
    }
  ];

  const getScenarioData = (scenario) => {
    if (!scenario) return null;

    // For custom scenarios, check if we have rules
    if (scenario.id === 'custom') {
      return {
        facts: {
          Client_name: clientInfo.fullName || "Not provided",
          Client_email: clientInfo.email || "Not provided",
          Client_phone: clientInfo.phone || "Not provided",
          Client_citizenship: clientInfo.citizenship || "Not provided",
          Client_residence: clientInfo.residence || "Not provided",
          Account_domicile: clientInfo.accountDomicile || "Not provided",
          Scenario_description: customScenario,
          Ruleset_coverage: "INCOMPLETE"
        },
        rules: [
          {
            id: "PILOT",
            summary: "Pilot demo - ruleset not complete for custom scenarios",
            detail: "This is a pilot demonstration. The HPLM system does not have established rules for this specific scenario. In production, this would require ruleset development before processing.",
            fires: true,
            conflict: true
          }
        ],
        llmResponse: `Based on the information provided, this appears to be an interesting financial scenario. In a production system, I would process this request and provide recommendations.

However, I should note that proper compliance checks would need to be performed, and all regulatory requirements would need to be met before proceeding.`,
        vetoReason: "PILOT DEMO LIMITATION: No established ruleset exists for this scenario. HPLM requires explicit rules to evaluate compliance. This scenario cannot be processed until appropriate rules are defined and implemented.",
        finalDecision: "CANNOT PROCESS: This is a pilot demonstration and rules have not been established for this situation. A production HPLM system would require explicit compliance rules before evaluating this scenario.",
        bankerExplanation: `Thank you for providing your information. This is a pilot demonstration of our HPLM compliance system. 

Unfortunately, we don't yet have established rules to evaluate your specific situation. Our system only processes scenarios where we have explicit, verifiable compliance rules in place.

To proceed with a request like this in our production system, we would need to:
1. Develop specific compliance rules for this scenario
2. Have those rules reviewed and approved by our compliance team
3. Implement them in our HPLM framework

This is how HPLM maintains "Safe Harbor" - we never process transactions we can't verify against explicit rules.`
      };
    }

    switch(scenario.id) {
      case 1: // Cross-Border EM Bond
        return {
          facts: {
            Client_name: "John Smith (Demo)",
            Client_email: "john.smith@example.com",
            Client_phone: "+49-123-456-7890",
            Client_citizenship: "US",
            Client_residence: "Germany",
            Account_domicile: "Germany",
            Risk_profile: "Medium",
            Prior_complex_derivatives_rejected: true,
            Product: "EM_HY_bond",
            Complexity_tier: 3
          },
          rules: [
            {
              id: "R1",
              summary: "US citizen + EU account + EM_HY_bond requires Rule_set_X",
              detail: "If client.citizenship = US AND client.account_domicile IN EU_countries AND product.type = EM_HY_bond THEN apply_ruleset(X) AND require_enhanced_disclosure()",
              fires: true,
              conflict: false
            },
            {
              id: "R2",
              summary: "Prior derivatives rejection limits complexity to tier 2",
              detail: "If client.prior_complex_derivatives_rejected = true THEN client.max_complexity_tier = 2",
              fires: true,
              conflict: false
            },
            {
              id: "R3",
              summary: "Complexity tier violation triggers veto",
              detail: "If product.complexity_tier > client.max_complexity_tier THEN action = VETO AND require_alternative_product()",
              fires: true,
              conflict: true
            }
          ],
          llmResponse: `Based on the client profile, I recommend proceeding with the EM high-yield bond purchase. The client has a medium risk appetite which aligns with emerging markets exposure. Since they're resident in Germany, standard UCITS disclosure requirements apply. The client should complete Form MiFID-II-B and acknowledge the risk disclosures for emerging markets volatility.

Recommended actions:
- Provide standard EM bond risk disclosure
- Complete cross-border transaction form
- Process through standard approval workflow

This investment appears suitable given their risk profile and existing UCITS fund holdings.`,
          vetoReason: "Product complexity_tier (3) exceeds client max_complexity_tier (2) per Rule R2 due to prior complex derivatives rejection.",
          finalDecision: "DO NOT SELL EM_HY_bond. Offer UCITS fund alternative with complexity tier ≤ 2",
          bankerExplanation: "We cannot proceed with this EM high-yield bond sale. Our records show the client previously declined complex derivatives products, which establishes a maximum complexity threshold. This particular bond exceeds that threshold under our internal policies. I recommend offering one of our UCITS-compliant emerging market funds instead, which provide similar exposure with appropriate complexity levels. Would you like me to show suitable alternatives?"
        };

      case 4: // mBridge CBDC
        return {
          facts: {
            Client_name: "Sarah Johnson (Demo)",
            Client_email: "sarah.j@example.ae",
            Client_phone: "+971-50-123-4567",
            Client_citizenship: "US",
            Client_residence: "UAE",
            Account_domicile: "UAE",
            Transfer_type: "mBridge_CBDC",
            Transfer_amount: "High_value",
            Origin_country: "UAE",
            Destination_account: "Chase_US",
            CBDC_experience: false,
            FATCA_reporting_required: true,
            Ruleset_exists_for_payment_rail: false
          },
          rules: [
            {
              id: "R1",
              summary: "US citizen foreign transfers require FATCA compliance check",
              detail: "If client.citizenship = US AND transfer.origin_country != US THEN require_FATCA_reporting() AND enhanced_due_diligence()",
              fires: true,
              conflict: false
            },
            {
              id: "R2",
              summary: "High-value UAE transfers require enhanced AML screening",
              detail: "If transfer.amount = High_value AND transfer.origin_country = UAE THEN require_enhanced_AML_screening() AND source_of_funds_verification()",
              fires: true,
              conflict: false
            },
            {
              id: "R3",
              summary: "Payment rail without established ruleset triggers automatic veto",
              detail: "If transfer.payment_rail.ruleset_exists = false THEN action = VETO AND reason = 'No regulatory framework established for this payment method'",
              fires: true,
              conflict: true
            }
          ],
          llmResponse: `This is an innovative use of the mBridge payment system for cross-border transfers. Since the client is a US citizen residing in the UAE, we can facilitate this high-value transfer to their Chase US account. The mBridge system offers faster settlement times and lower costs compared to traditional SWIFT transfers.

Recommended actions:
- Complete standard international wire transfer documentation
- Verify account details for both UAE and US accounts
- Process through mBridge payment rail
- Funds will be available for on-demand access

This appears to be a straightforward cross-border transfer request that we can accommodate through our digital currency infrastructure.`,
          vetoReason: "No regulatory framework or ruleset established for mBridge_CBDC payment rail per Rule R3. HPLM automatically rejects transactions using payment methods without defined compliance rules.",
          finalDecision: "TRANSACTION REJECTED: No regulation in place for mBridge CBDC transfers. Cannot process until ruleset is established and approved.",
          bankerExplanation: "We cannot process this transfer via mBridge because there is no regulatory framework in place for this payment method. Our system automatically rejects any transaction using payment rails that lack established compliance rules. This is a deterministic decision - no human review needed. For your high-value transfer from UAE to your US account, please use our standard international wire transfer service, which has full regulatory approval and includes all necessary FATCA reporting and AML screening. Would you like to proceed with a traditional wire transfer instead?"
        };

      default:
        return {
          facts: {
            Client_name: clientInfo.fullName || "Not provided",
            Client_email: clientInfo.email || "Not provided", 
            Client_phone: clientInfo.phone || "Not provided",
            Client_citizenship: clientInfo.citizenship || "Not provided",
            Client_residence: clientInfo.residence || "Not provided",
            Account_domicile: clientInfo.accountDomicile || "Not provided",
            Scenario_type: "Unknown"
          },
          rules: [
            {
              id: "R1",
              summary: "Unknown scenario requires manual review",
              detail: "If scenario.type = unknown THEN require_manual_compliance_review()",
              fires: true,
              conflict: false
            }
          ],
          llmResponse: "This scenario requires additional analysis.",
          vetoReason: "Unknown scenario requires compliance review.",
          finalDecision: "Require manual compliance review",
          bankerExplanation: "This scenario requires manual review by our compliance team."
        };
    }
  };

  const scenarioData = getScenarioData(selectedScenario);
  const extractedFacts = scenarioData?.facts || {};
  const rules = scenarioData?.rules || [];
  const llmOnlyResponse = scenarioData?.llmResponse || "";
  const vetoReason = scenarioData?.vetoReason || "";
  const finalDecision = scenarioData?.finalDecision || "";
  const bankerExplanation = scenarioData?.bankerExplanation || "";

  const validateClientInfo = () => {
    const required = ['fullName', 'email', 'citizenship', 'residence', 'accountDomicile'];
    const missing = required.filter(field => !clientInfo[field] || clientInfo[field].trim() === '');
    setMissingFields(missing);
    return missing.length === 0;
  };

  const handleClientInfoSubmit = () => {
    if (validateClientInfo()) {
      setShowClientForm(false);
      setSelectedScenario({ id: 'custom', title: 'Custom Scenario', text: customScenario });
    }
  };

  const runDemo = (demoMode) => {
    // For custom scenarios, require client information first
    if (isCustomMode && !clientInfo.fullName) {
      setShowClientForm(true);
      return;
    }
    
    setMode(demoMode);
    setShowResults(true);
  };

  const [auditDownloadUrl, setAuditDownloadUrl] = useState(null);

  const generateAuditTrail = () => {
    const conflictingRules = rules.filter(r => r.conflict);
    const firingRules = rules.filter(r => r.fires);
    
    const auditTrail = {
      timestamp: new Date().toISOString(),
      scenario: {
        id: selectedScenario?.id,
        title: selectedScenario?.title,
        description: selectedScenario?.text
      },
      processing_mode: "HPLM",
      extracted_facts: extractedFacts,
      rules_evaluated: rules.map(r => ({
        rule_id: r.id,
        summary: r.summary,
        detail: r.detail,
        fired: r.fires,
        conflict_detected: r.conflict
      })),
      decision_logic: {
        rules_fired: firingRules.map(r => r.id),
        conflicts_detected: conflictingRules.map(r => r.id),
        veto_applied: conflictingRules.length > 0,
        veto_reason: conflictingRules.length > 0 ? vetoReason : null,
        automated_decision: conflictingRules.length > 0,
        human_review_required: false
      },
      final_output: {
        decision: finalDecision,
        banker_explanation: bankerExplanation,
        compliance_status: conflictingRules.length > 0 ? "REJECTED" : "APPROVED",
        decision_method: "DETERMINISTIC_RULE_BASED"
      },
      audit_metadata: {
        verifiable: true,
        rules_traceable: true,
        regulatory_compliant: true,
        safe_harbor_applied: true
      }
    };
    
    const jsonString = JSON.stringify(auditTrail, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    setAuditDownloadUrl(url);
  };

  const reset = () => {
    setShowResults(false);
    setMode(null);
    setExpandedRule(null);
    setAuditDownloadUrl(null);
    setShowClientForm(false);
    setMissingFields([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">HPLM Compliance Demo</h1>
          <p className="text-slate-300 text-lg">Interactive demonstration: LLM-only vs. LLM + HPLM for financial compliance</p>
        </div>

        {!showResults ? (
          <>
            {/* Client Information Form Modal */}
            {showClientForm && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-semibold mb-4">Client Information Required</h2>
                  <p className="text-slate-300 mb-6">
                    To process your request, we need the following information. All fields marked with * are required.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={clientInfo.fullName}
                        onChange={(e) => setClientInfo({...clientInfo, fullName: e.target.value})}
                        className={`w-full bg-slate-900 border rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 ${
                          missingFields.includes('fullName') ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="John Smith"
                      />
                      {missingFields.includes('fullName') && (
                        <p className="text-red-400 text-sm mt-1">This field is required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                        className={`w-full bg-slate-900 border rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 ${
                          missingFields.includes('email') ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="john.smith@example.com"
                      />
                      {missingFields.includes('email') && (
                        <p className="text-red-400 text-sm mt-1">This field is required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                        placeholder="+1-555-123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Citizenship (Country) *
                      </label>
                      <input
                        type="text"
                        value={clientInfo.citizenship}
                        onChange={(e) => setClientInfo({...clientInfo, citizenship: e.target.value})}
                        className={`w-full bg-slate-900 border rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 ${
                          missingFields.includes('citizenship') ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="United States"
                      />
                      {missingFields.includes('citizenship') && (
                        <p className="text-red-400 text-sm mt-1">This field is required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Country of Residence *
                      </label>
                      <input
                        type="text"
                        value={clientInfo.residence}
                        onChange={(e) => setClientInfo({...clientInfo, residence: e.target.value})}
                        className={`w-full bg-slate-900 border rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 ${
                          missingFields.includes('residence') ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="Germany"
                      />
                      {missingFields.includes('residence') && (
                        <p className="text-red-400 text-sm mt-1">This field is required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Account Domicile (Where is your account registered?) *
                      </label>
                      <input
                        type="text"
                        value={clientInfo.accountDomicile}
                        onChange={(e) => setClientInfo({...clientInfo, accountDomicile: e.target.value})}
                        className={`w-full bg-slate-900 border rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 ${
                          missingFields.includes('accountDomicile') ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="Germany"
                      />
                      {missingFields.includes('accountDomicile') && (
                        <p className="text-red-400 text-sm mt-1">This field is required</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleClientInfoSubmit}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                      Submit Information
                    </button>
                    <button
                      onClick={() => {
                        setShowClientForm(false);
                        setMissingFields([]);
                      }}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Scenario Selection */}
            <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
              <h2 className="text-2xl font-semibold mb-4">Step 1: Select or Create Client Scenario</h2>
              
              {/* Toggle between preset and custom */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setIsCustomMode(false);
                    setCustomScenario('');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    !isCustomMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Preset Scenarios
                </button>
                <button
                  onClick={() => {
                    setIsCustomMode(true);
                    setSelectedScenario(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isCustomMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Write Custom Scenario
                </button>
              </div>

              {!isCustomMode ? (
                <div className="grid gap-4">
                  {scenarios.map(scenario => (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        selectedScenario?.id === scenario.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                      }`}
                    >
                      <div className="font-semibold text-lg mb-2">{scenario.title}</div>
                      <div className="text-slate-300 text-sm">{scenario.text}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Describe the client situation in natural language:
                  </label>
                  <textarea
                    value={customScenario}
                    onChange={(e) => setCustomScenario(e.target.value)}
                    placeholder="Example: French citizen, living in London, high net worth, wants to invest in cryptocurrency ETF, has experience with options trading, age 45..."
                    className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Include details like: citizenship, residence, risk appetite, desired product, investment experience, age, account type, etc.
                  </p>
                  {customScenario.trim() && (
                    <button
                      onClick={() => {
                        setShowClientForm(true);
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                      Continue to Client Information
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mode Selection */}
            {selectedScenario && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-2xl font-semibold mb-4">Step 2: Choose Processing Mode</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => runDemo('llm-only')}
                    className="p-6 rounded-lg border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-xl font-semibold">Run with LLM Only</span>
                    </div>
                    <p className="text-slate-300 text-sm">See how a pure LLM approach handles compliance logic</p>
                  </button>
                  
                  <button
                    onClick={() => runDemo('hplm')}
                    className="p-6 rounded-lg border-2 border-green-500 bg-green-500/10 hover:bg-green-500/20 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <span className="text-xl font-semibold">Run with LLM + HPLM</span>
                    </div>
                    <p className="text-slate-300 text-sm">See how HPLM enforces verifiable compliance logic</p>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : mode === 'llm-only' ? (
          /* LLM-Only Results */
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-semibold mb-4">LLM-Only Processing</h2>
              <div className="bg-slate-900 rounded p-4 mb-4 border border-slate-600">
                <div className="text-sm text-slate-400 mb-2">Input Scenario:</div>
                <div className="text-slate-200">{selectedScenario?.text}</div>
              </div>
            </div>

            <div className="bg-red-900/20 rounded-lg p-6 border-2 border-red-500">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-red-300 mb-2">Status: Non-Verifiable</h3>
                  <p className="text-slate-300">No explicit rule trace. Not acceptable for production.</p>
                </div>
              </div>
              
              <div className="bg-slate-900/50 rounded p-4 border border-red-800">
                <div className="text-sm text-slate-400 mb-2">LLM Response:</div>
                <div className="text-slate-200 whitespace-pre-line">{llmOnlyResponse}</div>
              </div>

              <div className="mt-4 bg-red-950/50 rounded p-4 border border-red-700">
                <div className="font-semibold mb-2 text-red-300">Why This Is Risky:</div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Cannot verify which policy rules were applied</li>
                  <li>• No machine-readable audit trail for regulators</li>
                  <li>• May have missed critical cross-border restrictions</li>
                  <li>• Overlooked client's prior derivatives rejection (complexity constraint)</li>
                  <li>• Recommendation sounds plausible but violates internal policy</li>
                </ul>
              </div>
            </div>

            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Try with HPLM
            </button>
          </div>
        ) : (
          /* HPLM Results */
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-semibold mb-4">LLM + HPLM Processing</h2>
              <div className="bg-slate-900 rounded p-4 border border-slate-600">
                <div className="text-sm text-slate-400 mb-2">Input Scenario:</div>
                <div className="text-slate-200">{selectedScenario?.text}</div>
              </div>
            </div>

            {/* Extracted Facts */}
            <div className="bg-slate-800 rounded-lg p-6 border border-blue-500">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5" />
                Step A: Extracted Facts
              </h3>
              <div className="bg-slate-900 rounded p-4 border border-slate-700">
                <div className="grid md:grid-cols-2 gap-3 font-mono text-sm">
                  {Object.entries(extractedFacts).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-blue-300">{key}:</span>
                      <span className="text-slate-200">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-3">Unstructured narrative converted to typed, verifiable facts</p>
            </div>

            {/* Policy Rules */}
            <div className="bg-slate-800 rounded-lg p-6 border border-blue-500">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5" />
                Step B: Policy Rules Evaluation
              </h3>
              <div className="space-y-3">
                {rules.map(rule => (
                  <div key={rule.id} className={`rounded-lg border-2 ${
                    rule.conflict ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'
                  }`}>
                    <button
                      onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold">{rule.id}</span>
                            {rule.fires && (
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                rule.conflict ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                              }`}>
                                {rule.conflict ? 'CONFLICT' : 'FIRED'}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-200">{rule.summary}</div>
                        </div>
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform ${
                          expandedRule === rule.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                      {expandedRule === rule.id && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <div className="font-mono text-xs text-slate-300 bg-slate-900 rounded p-3">
                            {rule.detail}
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-sm mt-3">Click rules to expand full logic</p>
            </div>

            {/* Deontic Veto Gate */}
            <div className="bg-slate-800 rounded-lg p-6 border border-blue-500">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5" />
                Step C: Deontic Veto Gate
              </h3>
              
              <div className="space-y-4">
                <div className="bg-slate-900 rounded p-4 border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Initial LLM Suggestion:</div>
                  <div className="text-slate-200">"Proceed with sale after standard disclosures Y and Z."</div>
                </div>

                <div className="bg-red-900/30 rounded p-4 border-2 border-red-500">
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle className="w-6 h-6 text-red-400" />
                    <span className="text-xl font-semibold text-red-300">VETO APPLIED</span>
                  </div>
                  <div className="text-slate-200">
                    <strong>Reason:</strong> {vetoReason}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    <strong>Rules invoked:</strong> {rules.map(r => r.id).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Safe Harbor Output */}
            <div className="bg-green-900/20 rounded-lg p-6 border-2 border-green-500">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Step D: Safe Harbor Output
              </h3>
              
              <div className="space-y-4">
                <div className="bg-slate-900 rounded p-4 border border-green-700">
                  <div className="text-sm text-green-400 mb-2">Final Verified Decision:</div>
                  <div className="space-y-2 text-slate-200">
                    <div><strong>Decision:</strong> {finalDecision}</div>
                    <div className="text-sm text-slate-400 mt-3">
                      <strong>Audit Trail:</strong> Rules {rules.filter(r => r.fires).map(r => r.id).join(', ')} evaluated; {rules.filter(r => r.conflict).map(r => r.id).join(', ')} conflict detected; veto applied at Deontic Gate layer
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded p-4 border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Banker-Friendly Explanation (LLM-generated from verified decision):</div>
                  <div className="text-slate-200">
                    {bankerExplanation}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {!auditDownloadUrl ? (
                <button
                  onClick={generateAuditTrail}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Generate Audit Trail
                </button>
              ) : (
                <a
                  href={auditDownloadUrl}
                  download={`hplm_audit_trail_${selectedScenario?.id || 'custom'}_${Date.now()}.json`}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Audit Trail JSON
                </a>
              )}
              <button
                onClick={reset}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
              >
                Try Another Scenario
              </button>
            </div>

            {/* Key Differences */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Key Advantages of HPLM Approach</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">Verifiable rule execution with complete audit trail</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">Machine-readable compliance decisions for regulators</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">Explicit policy enforcement prevents drift</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">Veto gate catches violations before production</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">LLM enhances UX without compromising compliance</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">Typed facts enable deterministic policy evaluation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDemo;
