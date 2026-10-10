import sqlite3
import json
from typing import List, Optional, Dict, Any
from app.config import DATABASE_PATH

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            file_size_bytes INTEGER NOT NULL,
            audio_duration_seconds REAL NOT NULL,
            sample_rate INTEGER NOT NULL,
            channels INTEGER NOT NULL,
            waveform_data TEXT NOT NULL,
            synthetic_speech_score REAL NOT NULL,
            authenticity_label TEXT NOT NULL,
            authenticity_confidence REAL NOT NULL,
            uncertainty_pct REAL NOT NULL,
            acoustic_breakdown TEXT NOT NULL,
            transcript_text TEXT NOT NULL,
            transcript_segments TEXT NOT NULL,
            scam_indicators_count INTEGER NOT NULL,
            scam_indicators TEXT NOT NULL,
            overall_risk TEXT NOT NULL,
            risk_color TEXT NOT NULL,
            risk_explanation TEXT NOT NULL,
            evidence_summary TEXT NOT NULL,
            voice_model_result TEXT NOT NULL,
            transcript_analysis_result TEXT NOT NULL,
            contextual_fraud_assessment TEXT NOT NULL,
            identity_verification_status TEXT NOT NULL,
            recommended_actions TEXT NOT NULL,
            model_name TEXT NOT NULL,
            model_version TEXT NOT NULL,
            stt_engine TEXT NOT NULL,
            fraud_engine TEXT NOT NULL,
            processing_duration_ms REAL NOT NULL,
            created_at TEXT NOT NULL,
            warnings TEXT NOT NULL,
            show_warning INTEGER DEFAULT 0,
            warning_message TEXT,
            warning_reasons TEXT
        )
    """)
    # Add columns if migrating existing db
    for col, col_type in [("show_warning", "INTEGER DEFAULT 0"), ("warning_message", "TEXT"), ("warning_reasons", "TEXT")]:
        try:
            cursor.execute(f"ALTER TABLE analyses ADD COLUMN {col} {col_type}")
        except Exception:
            pass
    conn.commit()
    conn.close()

def save_analysis(data: Dict[str, Any]):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO analyses (
            id, filename, file_size_bytes, audio_duration_seconds, sample_rate, channels,
            waveform_data, synthetic_speech_score, authenticity_label, authenticity_confidence,
            uncertainty_pct, acoustic_breakdown, transcript_text, transcript_segments,
            scam_indicators_count, scam_indicators, overall_risk, risk_color, risk_explanation,
            evidence_summary, voice_model_result, transcript_analysis_result,
            contextual_fraud_assessment, identity_verification_status, recommended_actions,
            model_name, model_version, stt_engine, fraud_engine, processing_duration_ms,
            created_at, warnings, show_warning, warning_message, warning_reasons
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["analysis_id"],
        data["filename"],
        data["file_size_bytes"],
        data["audio_duration_seconds"],
        data["sample_rate"],
        data["channels"],
        json.dumps(data["waveform_data"]),
        data["synthetic_speech_score"],
        data["authenticity_label"],
        data["authenticity_confidence"],
        data["uncertainty_pct"],
        json.dumps(data["acoustic_breakdown"]),
        data["transcript_text"],
        json.dumps(data["transcript_segments"]),
        data["scam_indicators_count"],
        json.dumps(data["scam_indicators"]),
        data["overall_risk"],
        data["risk_color"],
        data["risk_explanation"],
        data["evidence_summary"],
        data["voice_model_result"],
        data["transcript_analysis_result"],
        data["contextual_fraud_assessment"],
        data["identity_verification_status"],
        json.dumps(data["recommended_actions"]),
        data["model_name"],
        data["model_version"],
        data["stt_engine"],
        data["fraud_engine"],
        data["processing_duration_ms"],
        data["created_at"],
        json.dumps(data["warnings"]),
        1 if data.get("show_warning") else 0,
        data.get("warning_message", ""),
        json.dumps(data.get("warning_reasons", []))
    ))
    conn.commit()
    conn.close()

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    return {
        "analysis_id": d["id"],
        "filename": d["filename"],
        "file_size_bytes": d["file_size_bytes"],
        "audio_duration_seconds": d["audio_duration_seconds"],
        "sample_rate": d["sample_rate"],
        "channels": d["channels"],
        "waveform_data": json.loads(d["waveform_data"]),
        "synthetic_speech_score": d["synthetic_speech_score"],
        "authenticity_label": d["authenticity_label"],
        "authenticity_confidence": d["authenticity_confidence"],
        "uncertainty_pct": d["uncertainty_pct"],
        "acoustic_breakdown": json.loads(d["acoustic_breakdown"]),
        "transcript_text": d["transcript_text"],
        "transcript_segments": json.loads(d["transcript_segments"]),
        "scam_indicators_count": d["scam_indicators_count"],
        "scam_indicators": json.loads(d["scam_indicators"]),
        "overall_risk": d["overall_risk"],
        "risk_color": d["risk_color"],
        "risk_explanation": d["risk_explanation"],
        "evidence_summary": d["evidence_summary"],
        "voice_model_result": d["voice_model_result"],
        "transcript_analysis_result": d["transcript_analysis_result"],
        "contextual_fraud_assessment": d["contextual_fraud_assessment"],
        "identity_verification_status": d["identity_verification_status"],
        "recommended_actions": json.loads(d["recommended_actions"]),
        "model_name": d["model_name"],
        "model_version": d["model_version"],
        "stt_engine": d["stt_engine"],
        "fraud_engine": d["fraud_engine"],
        "processing_duration_ms": d["processing_duration_ms"],
        "created_at": d["created_at"],
        "warnings": json.loads(d["warnings"]),
        "show_warning": bool(d.get("show_warning", 0)),
        "warning_message": d.get("warning_message", ""),
        "warning_reasons": json.loads(d.get("warning_reasons", "[]")) if d.get("warning_reasons") else []
    }

def get_history(limit: int = 50, risk_filter: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = "SELECT id, filename, audio_duration_seconds, synthetic_speech_score, authenticity_label, scam_indicators_count, overall_risk, created_at FROM analyses WHERE 1=1"
    params = []
    
    if risk_filter and risk_filter.upper() != "ALL":
        query += " AND overall_risk = ?"
        params.append(risk_filter.upper())
        
    if search:
        query += " AND (filename LIKE ? OR transcript_text LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term])
        
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "analysis_id": r["id"],
            "filename": r["filename"],
            "audio_duration_seconds": r["audio_duration_seconds"],
            "synthetic_speech_score": r["synthetic_speech_score"],
            "authenticity_label": r["authenticity_label"],
            "scam_indicators_count": r["scam_indicators_count"],
            "overall_risk": r["overall_risk"],
            "created_at": r["created_at"]
        }
        for r in rows
    ]

def delete_analysis(analysis_id: str) -> bool:
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected
