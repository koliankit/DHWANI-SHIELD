import re
from typing import List, Dict, Any, Tuple

# Patterns and definitions for scam indicators
INDICATOR_RULES = [
    {
        "id": "SCAM-OTP-01",
        "name": "One-Time Password (OTP) Solicitation",
        "category": "Credential Harvesting",
        "severity": "CRITICAL",
        "keywords": [
            r"\b(?:otp|one[- ]time password|6[- ]digit code|verification code|pin number|upi pin)\b",
            r"\bshare (?:the|your) (?:otp|code|pin)\b",
            r"\bread (?:the|out) (?:the )?(?:otp|code|digits)\b"
        ],
        "explanation": "Legitimate banking institutions never ask customers to disclose OTPs or UPI PINs over the telephone."
    },
    {
        "id": "SCAM-URGENCY-02",
        "name": "Artificial Urgency & Temporal Coercion",
        "category": "Psychological Manipulation",
        "severity": "HIGH",
        "keywords": [
            r"\b(?:urgent|immediately|right now|hurry up|within 10 minutes|emergency|before they cancel|fast|instant)\b",
            r"\bdo it right away\b"
        ],
        "explanation": "Scammers manufacture extreme urgency to trigger anxiety and bypass victims' critical thinking."
    },
    {
        "id": "SCAM-TRANSFER-03",
        "name": "Unsolicited Money Transfer Demand",
        "category": "Financial Extraction",
        "severity": "HIGH",
        "keywords": [
            r"\b(?:transfer|send|pay) (?:fifty thousand|money|cash|funds|amount|rupees|\d+)\b",
            r"\b(?:upi id|upi handle|qr code|wallet transfer|advance payment)\b",
            r"\bapprove the prompt\b"
        ],
        "explanation": "Demanding direct peer-to-peer or UPI transfers under personal emergency pretexts is a hallmark of imposter fraud."
    },
    {
        "id": "SCAM-IMPERSONATE-04",
        "name": "Authority & Institution Impersonation",
        "category": "Identity Deception",
        "severity": "HIGH",
        "keywords": [
            r"\b(?:police|cyber cell|cbi|reserve bank|rbi|customs|court|trai|income tax department)\b",
            r"\b(?:sbi|hdfc|icici|axis bank) (?:fraud|security|department|headquarters)\b"
        ],
        "explanation": "Impersonating law enforcement, central banks, or financial fraud units to intimidate victims into compliance."
    },
    {
        "id": "SCAM-REMOTE-05",
        "name": "Remote-Access Application Solicitation",
        "category": "Device Compromise",
        "severity": "CRITICAL",
        "keywords": [
            r"\b(?:anydesk|teamviewer|quicksupport|ultraviewer|rustdesk|screen share|remote desktop)\b",
            r"\binstall (?:this|the) app\b",
            r"\bdownload (?:anydesk|teamviewer|support apk)\b"
        ],
        "explanation": "Instructing victims to download remote desktop utilities allows attackers to control the device and harvest banking credentials."
    },
    {
        "id": "SCAM-SUSPEND-06",
        "name": "Threat of Account Suspension or Legal Action",
        "category": "Coercive Intimidation",
        "severity": "HIGH",
        "keywords": [
            r"\b(?:account (?:will be )?blocked|card (?:is )?suspended|arrest warrant|legal action|electricity (?:will be )?cut|sim deactivated)\b",
            r"\bfailure to verify\b"
        ],
        "explanation": "Threatening immediate account deactivation or arrest to coerce the listener into complying without verification."
    }
]

def detect_financial_scam_indicators(transcript_text: str, segments: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Scans the transcript against heuristic patterns to detect financial fraud indicators.
    Returns:
      - scam_indicators list
      - updated segments with highlighted scam tokens
    """
    detected_indicators = []
    seen_ids = set()
    
    # Process each segment
    for seg in segments:
        seg_text = seg.get("text", "")
        seg_flagged_terms = []
        
        for rule in INDICATOR_RULES:
            matched = False
            evidence_phrase = ""
            
            for pat in rule["keywords"]:
                match = re.search(pat, seg_text, re.IGNORECASE)
                if match:
                    matched = True
                    evidence_phrase = match.group(0)
                    seg_flagged_terms.append(evidence_phrase)
                    break
                    
            if matched and rule["id"] not in seen_ids:
                seen_ids.add(rule["id"])
                detected_indicators.append({
                    "id": rule["id"],
                    "name": rule["name"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "evidence_phrase": f'"{evidence_phrase}"',
                    "explanation": rule["explanation"],
                    "timestamp_offset": seg.get("start", 0.0)
                })
                
        if seg_flagged_terms:
            seg["has_scam_flag"] = True
            seg["flagged_terms"] = list(set(seg_flagged_terms))
            
    # Also check full text in case across segment boundary
    for rule in INDICATOR_RULES:
        if rule["id"] not in seen_ids:
            for pat in rule["keywords"]:
                match = re.search(pat, transcript_text, re.IGNORECASE)
                if match:
                    seen_ids.add(rule["id"])
                    detected_indicators.append({
                        "id": rule["id"],
                        "name": rule["name"],
                        "category": rule["category"],
                        "severity": rule["severity"],
                        "evidence_phrase": f'"{match.group(0)}"',
                        "explanation": rule["explanation"],
                        "timestamp_offset": 0.0
                    })
                    break

    return detected_indicators, segments
