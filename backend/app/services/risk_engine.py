from typing import List, Dict, Any

def evaluate_composite_risk(
    synthetic_score: float,
    authenticity_label: str,
    scam_indicators: List[Dict[str, Any]],
    audio_duration: float
) -> Dict[str, Any]:
    """
    Transparently synthesizes acoustic authenticity and semantic scam indicators
    into an independent two-layer risk determination with actionable recommendations
    and real-time pause warning alerts.
    """
    indicator_count = len(scam_indicators)
    has_critical_scam = any(ind["severity"] == "CRITICAL" for ind in scam_indicators)
    has_high_scam = any(ind["severity"] == "HIGH" for ind in scam_indicators)
    
    is_synthetic = synthetic_score >= 0.65 or authenticity_label == "LIKELY SYNTHETIC"
    is_genuine = synthetic_score <= 0.35 or authenticity_label == "LIKELY GENUINE"
    is_inconclusive = not is_synthetic and not is_genuine

    # Warning Reasons compilation
    warning_reasons = []
    
    for ind in scam_indicators:
        if "otp" in ind["name"].lower() or "password" in ind["name"].lower():
            warning_reasons.append("An OTP/PIN authorization credential request was detected.")
        elif "urgency" in ind["name"].lower():
            warning_reasons.append("The speaker created artificial temporal pressure to coerce action.")
        elif "suspension" in ind["name"].lower() or "blocked" in ind["name"].lower():
            warning_reasons.append("The speaker threatened immediate account freeze or legal consequences.")
        elif "impersonation" in ind["name"].lower():
            warning_reasons.append("The caller claims to represent a financial institution or law enforcement.")
        elif "remote" in ind["name"].lower():
            warning_reasons.append("The speaker requested installation of remote-access software.")
        else:
            warning_reasons.append(f"Suspicious intent flag: {ind['name']}.")

    if is_synthetic:
        warning_reasons.append(f"Voice authenticity analysis detected AI synthetic voice cloning ({synthetic_score * 100:.1f}% confidence).")

    # Risk Fusion Decision Logic:
    # 1. Likely synthetic voice + strong financial scam indicators = HIGH RISK.
    # 2. Inconclusive voice result + strong scam indicators = HIGH RISK.
    # 3. Likely genuine voice + strong scam indicators = HIGH RISK (Layer 2 independence!).
    # 4. Likely synthetic voice without clear scam indicators = VERIFY (Voice authenticity warning).
    # 5. Likely genuine voice without identified scam indicators = LOW RISK.
    # 6. Inconclusive voice without identified scam indicators = INCONCLUSIVE or VERIFY.
    
    if (is_synthetic or is_inconclusive or is_genuine) and (has_critical_scam or indicator_count >= 2):
        overall_risk = "HIGH RISK"
        risk_color = "red"
        show_warning = True
        if is_genuine:
            risk_explanation = "LAYER 2 ACTIVE DEFENSE: Genuine human voice detected, but conversational speech contains severe financial scam markers (OTP theft & account freeze threats)."
            contextual_fraud = "High probability of social engineering call by human fraud operator bypassing acoustic detectors."
        elif is_synthetic:
            risk_explanation = "CRITICAL TWO-LAYER COMPOSITE THREAT: Synthetic deepfake voice clone combined with active financial fraud extraction."
            contextual_fraud = "High correlation with targeted AI voice clone impersonation attack."
        else:
            risk_explanation = "ELEVATED FRAUD RISK: Severe financial coercion detected with inconclusive acoustic signal."
            contextual_fraud = "Financial harvesting attempt on unverified acoustic channel."
            
    elif is_synthetic and indicator_count == 0:
        overall_risk = "VERIFY"
        risk_color = "amber"
        show_warning = True
        risk_explanation = "SYNTHETIC SPEECH WARNING: Audio exhibits synthetic vocoder artifacts, but no explicit financial scam language was detected."
        contextual_fraud = "Possible synthetic voice injection or automated robocall testing."
        
    elif is_genuine and indicator_count > 0:
        overall_risk = "VERIFY"
        risk_color = "amber"
        show_warning = True
        risk_explanation = "SUSPICIOUS CONVERSATION: Natural voice detected with moderate conversational financial pressure."
        contextual_fraud = "Unverified financial inquiry requiring secondary channel callback."
        
    elif is_inconclusive and indicator_count == 0:
        overall_risk = "INCONCLUSIVE"
        risk_color = "amber"
        show_warning = False
        risk_explanation = "INCONCLUSIVE PROFILE: Audio duration or signal quality insufficient for definitive acoustic voice authentication."
        contextual_fraud = "Insufficient acoustic evidence; maintain standard vigilance."
        
    else: # is_genuine and indicator_count == 0
        overall_risk = "LOW RISK"
        risk_color = "green"
        show_warning = False
        risk_explanation = "LOW THREAT PROFILE: Natural acoustic voice dynamics and zero coercive financial indicators observed."
        contextual_fraud = "Standard non-coercive conversation; no anomalous fraud indicators present."

    # Evidence Summary Paragraph
    evidence_parts = []
    if is_synthetic:
        evidence_parts.append(f"Layer 1 (Voice Authenticity): Flagged synthetic speech with {synthetic_score * 100:.1f}% probability.")
    elif is_genuine:
        evidence_parts.append(f"Layer 1 (Voice Authenticity): Speech displays natural human vocal tract acoustics ({synthetic_score * 100:.1f}% synthetic probability).")
    else:
        evidence_parts.append(f"Layer 1 (Voice Authenticity): Acoustic signature is inconclusive ({synthetic_score * 100:.1f}% score).")

    if indicator_count > 0:
        names = [ind["name"] for ind in scam_indicators[:3]]
        evidence_parts.append(f"Layer 2 (Conversation Scam Analysis): Independently identified {indicator_count} threat triggers: {', '.join(names)}.")
    else:
        evidence_parts.append("Layer 2 (Conversation Scam Analysis): Transcript contains no predatory financial keywords, OTP requests, or urgency manipulation.")

    evidence_summary = " ".join(evidence_parts)

    # Detailed results
    voice_model_result = f"{authenticity_label} ({synthetic_score * 100:.1f}% Synthetic Probability). Evaluated spectral flatness, vocoder resonance, and pitch micro-jitter."
    
    if indicator_count > 0:
        transcript_result = f"{indicator_count} indicator(s) triggered across {len(set(i['category'] for i in scam_indicators))} threat categories independently of voice profile."
    else:
        transcript_result = "0 scam indicators triggered. No coercive financial phrases found."

    # Recommended Actions
    if overall_risk == "HIGH RISK":
        recommended_actions = [
            "DO NOT share OTPs, UPI PINs, net banking passwords, or card details under any circumstances.",
            "Terminate the call immediately and do not approve any payment prompts or install remote apps.",
            "Independently contact your financial institution using verified phone numbers from official mobile banking apps.",
            "Report this fraudulent incident to the National Cyber Crime portal (cybercrime.gov.in) or call 1930."
        ]
    elif overall_risk == "VERIFY":
        recommended_actions = [
            "Do not disclose authentication codes or authorization tokens on this unverified line.",
            "Verify the caller's identity through an independent official contact channel or in-person callback.",
            "Cross-check any claimed emergency or transaction request with friends or family directly.",
            "Monitor your bank account for unauthorized login alerts."
        ]
    else:
        recommended_actions = [
            "Standard call safety: Never share banking OTPs or PINs even on familiar calls.",
            "Maintain general vigilance for unsolicited transaction requests.",
            "Ensure multi-factor authentication (MFA) remains enabled across your banking accounts."
        ]

    identity_status = "Unverified Caller — Note: Voice authenticity does NOT verify legal caller identity. Genuine voices can still perpetrate fraud, and synthetic voices may be benign simulations."

    warning_message = "PAUSE. Do not transfer money or share your OTP. Verify the caller using an independent, trusted channel."

    return {
        "overall_risk": overall_risk,
        "risk_color": risk_color,
        "risk_explanation": risk_explanation,
        "evidence_summary": evidence_summary,
        "voice_model_result": voice_model_result,
        "transcript_analysis_result": transcript_result,
        "contextual_fraud_assessment": contextual_fraud,
        "identity_verification_status": identity_status,
        "recommended_actions": recommended_actions,
        "show_warning": show_warning,
        "warning_message": warning_message,
        "warning_reasons": warning_reasons
    }
