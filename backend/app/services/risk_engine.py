from typing import List, Dict, Any

def evaluate_composite_risk(
    synthetic_score: float,
    authenticity_label: str,
    scam_indicators: List[Dict[str, Any]],
    audio_duration: float,
    similarity_score: float = 85.0
) -> Dict[str, Any]:
    """
    Synthesizes acoustic authenticity (AASIST/RawNet2 anti-spoofing + ECAPA-TDNN speaker similarity)
    and conversational scam indicators into a transparent risk determination strictly
    using the 3 required tiers:
      1. LOW RISK (teal #2ec4b6)
      2. REVIEW REQUIRED (amber #f0a73a)
      3. HIGH RISK (red #e5534b)
    """
    indicator_count = len(scam_indicators)
    has_critical_scam = any(ind.get("severity") == "CRITICAL" for ind in scam_indicators)
    has_high_scam = any(ind.get("severity") == "HIGH" for ind in scam_indicators)
    
    is_synthetic = synthetic_score >= 0.65 or authenticity_label == "LIKELY SYNTHETIC"
    is_genuine = synthetic_score <= 0.35 and authenticity_label == "LIKELY GENUINE"
    is_divergent_speaker = similarity_score < 70.0

    # Compile Warning Reasons
    warning_reasons = []
    
    for ind in scam_indicators:
        name_lower = ind.get("name", "").lower()
        if "otp" in name_lower or "password" in name_lower or "pin" in name_lower:
            warning_reasons.append("An OTP/PIN authorization credential request was detected.")
        elif "urgency" in name_lower:
            warning_reasons.append("The speaker created artificial temporal pressure to coerce instant action.")
        elif "suspension" in name_lower or "blocked" in name_lower or "freeze" in name_lower:
            warning_reasons.append("The speaker threatened immediate account freeze or legal police action.")
        elif "impersonation" in name_lower:
            warning_reasons.append("The caller claims to represent an authority or bank fraud prevention desk.")
        elif "remote" in name_lower or "anydesk" in name_lower:
            warning_reasons.append("The speaker requested installation of remote-access software.")
        else:
            warning_reasons.append(f"Suspicious intent flag: {ind.get('name')}.")

    if is_synthetic:
        warning_reasons.append(f"AASIST anti-spoofing model detected synthetic voice clone ({synthetic_score * 100:.1f}% probability).")
    elif is_divergent_speaker:
        warning_reasons.append(f"ECAPA-TDNN speaker verification flagged significant voiceprint divergence ({similarity_score:.1f}% similarity).")

    # Strict 3-Tier Risk Fusion Decision Logic:
    # 1. HIGH RISK:
    #    - Critical scam coercion (OTP, freeze, remote access) OR >= 2 scam indicators
    #    - OR High synthetic probability (AASIST >= 65%) with suspicious language
    #    - OR Severe voice cloning / divergence with coercive intent
    if has_critical_scam or indicator_count >= 2 or (is_synthetic and indicator_count >= 1):
        overall_risk = "HIGH RISK"
        risk_color = "red"
        show_warning = True
        if is_genuine:
            risk_explanation = "LAYER 2 ACTIVE DEFENSE: Natural human voice, but speech contains critical coercive financial fraud markers (OTP theft & account suspension threats)."
            contextual_fraud = "Human social engineering attack operating across standard cellular telephony."
        elif is_synthetic:
            risk_explanation = "COMPOSITE CRITICAL THREAT: AASIST detected synthetic voice cloning combined with active financial extraction coercion."
            contextual_fraud = "AI voice clone targeted impersonation attack."
        else:
            risk_explanation = "HIGH COMPOSITE RISK: Critical financial coercion detected with elevated acoustic anomalies."
            contextual_fraud = "High probability coercive extortion attempt."

    # 2. REVIEW REQUIRED:
    #    - Synthetic speech detected without coercive fraud script
    #    - OR 1 non-critical scam indicator with genuine voice
    #    - OR Borderline acoustic / vocoder signals
    elif is_synthetic or indicator_count == 1 or authenticity_label == "REVIEW REQUIRED" or is_divergent_speaker:
        overall_risk = "REVIEW REQUIRED"
        risk_color = "amber"
        show_warning = True
        if is_synthetic:
            risk_explanation = "ACOUSTIC REVIEW REQUIRED: Audio exhibits synthetic vocoder artifacts, though explicit financial scam phrases are currently absent."
            contextual_fraud = "Possible synthetic voice experiment, robocall injection, or automated IVR."
        elif indicator_count == 1:
            risk_explanation = "CONVERSATIONAL REVIEW REQUIRED: Natural acoustic voice, but 1 suspicious financial intent flag was detected."
            contextual_fraud = "Unverified financial inquiry requiring secondary channel callback verification."
        else:
            risk_explanation = "FORENSIC REVIEW REQUIRED: Voice acoustics or speaker similarity require manual forensic analyst review."
            contextual_fraud = "Acoustic boundary anomalies requiring secondary biometric confirmation."

    # 3. LOW RISK:
    #    - Genuine natural voice, 0 scam flags, high speaker similarity
    else:
        overall_risk = "LOW RISK"
        risk_color = "teal"
        show_warning = False
        risk_explanation = "LOW RISK: Natural human glottal vocal tract acoustics and zero coercive financial extortion indicators observed."
        contextual_fraud = "Standard non-coercive conversational exchange."

    # Evidence Summary Paragraph
    evidence_parts = []
    if is_synthetic:
        evidence_parts.append(f"AASIST Anti-Spoofing: Synthetic vocoder artifacts detected with {synthetic_score * 100:.1f}% confidence.")
    elif is_genuine:
        evidence_parts.append(f"AASIST Anti-Spoofing: Speech exhibits genuine human vocal tract resonance ({synthetic_score * 100:.1f}% synthetic score).")
    else:
        evidence_parts.append(f"AASIST Anti-Spoofing: Borderline acoustic score ({synthetic_score * 100:.1f}%).")

    evidence_parts.append(f"ECAPA-TDNN Speaker Verification: {similarity_score:.1f}% similarity to reference template.")

    if indicator_count > 0:
        names = [ind.get("name", "") for ind in scam_indicators[:3]]
        evidence_parts.append(f"Conversational Scam NLP: Independently triggered {indicator_count} threat flags ({', '.join(names)}).")
    else:
        evidence_parts.append("Conversational Scam NLP: Transcript contains 0 coercive financial phrases, OTP requests, or artificial urgency.")

    evidence_summary = " ".join(evidence_parts)
    voice_model_result = f"{authenticity_label} ({synthetic_score * 100:.1f}% Synthetic Probability via AASIST; {similarity_score:.1f}% ECAPA-TDNN similarity)."
    transcript_result = f"{indicator_count} indicator(s) identified across conversation transcript."

    if overall_risk == "HIGH RISK":
        recommended_actions = [
            "DO NOT disclose OTPs, banking passwords, PINs, or approval codes.",
            "Terminate the call immediately; do not install remote desktop apps or approve transactions.",
            "Contact your financial institution through verified numbers published in official banking apps.",
            "File an immediate report on the National Cyber Crime portal (cybercrime.gov.in / 1930) or local LE agency."
        ]
    elif overall_risk == "REVIEW REQUIRED":
        recommended_actions = [
            "Withhold sensitive financial credentials until caller identity is independently verified.",
            "Initiate an out-of-band callback to known verified contact numbers for this organization.",
            "Review call recording with a supervisor or fraud specialist before executing any requested action."
        ]
    else:
        recommended_actions = [
            "Standard call safety: Never share banking OTPs or PINs even during trusted calls.",
            "Maintain baseline security awareness for unsolicited transaction requests."
        ]

    identity_status = "Unverified Caller — Note: Voice authenticity does NOT establish legal identity. Physical location cannot be guessed from audio or phone numbers."
    warning_message = "PAUSE. Do not transfer money or share credentials. Verify caller identity via an independent trusted channel."

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
