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
            event_id TEXT,
            file_hash TEXT,
            call_type TEXT DEFAULT 'recorded_upload',
            legal_authority TEXT,
            filename TEXT NOT NULL,
            file_size_bytes INTEGER NOT NULL,
            audio_duration_seconds REAL NOT NULL,
            sample_rate INTEGER NOT NULL,
            channels INTEGER NOT NULL,
            waveform_data TEXT NOT NULL,
            synthetic_speech_score REAL NOT NULL,
            speaker_similarity_score REAL DEFAULT 85.0,
            anti_spoofing_score REAL DEFAULT 0.5,
            authenticity_label TEXT NOT NULL,
            authenticity_confidence REAL NOT NULL,
            uncertainty_pct REAL NOT NULL,
            acoustic_breakdown TEXT NOT NULL,
            transcript_text TEXT NOT NULL,
            transcript_segments TEXT NOT NULL,
            scam_indicators_count INTEGER NOT NULL,
            scam_indicators TEXT NOT NULL,
            location_record TEXT,
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
    
    # Safe schema migration for any missing columns
    migration_cols = [
        ("event_id", "TEXT"),
        ("file_hash", "TEXT"),
        ("call_type", "TEXT DEFAULT 'recorded_upload'"),
        ("legal_authority", "TEXT"),
        ("location_record", "TEXT"),
        ("speaker_similarity_score", "REAL DEFAULT 85.0"),
        ("anti_spoofing_score", "REAL DEFAULT 0.5"),
        ("show_warning", "INTEGER DEFAULT 0"),
        ("warning_message", "TEXT"),
        ("warning_reasons", "TEXT")
    ]
    for col, col_type in migration_cols:
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
            id, event_id, file_hash, call_type, legal_authority, filename, file_size_bytes,
            audio_duration_seconds, sample_rate, channels, waveform_data, synthetic_speech_score,
            speaker_similarity_score, anti_spoofing_score, authenticity_label, authenticity_confidence,
            uncertainty_pct, acoustic_breakdown, transcript_text, transcript_segments,
            scam_indicators_count, scam_indicators, location_record, overall_risk, risk_color,
            risk_explanation, evidence_summary, voice_model_result, transcript_analysis_result,
            contextual_fraud_assessment, identity_verification_status, recommended_actions,
            model_name, model_version, stt_engine, fraud_engine, processing_duration_ms,
            created_at, warnings, show_warning, warning_message, warning_reasons
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["analysis_id"],
        data.get("event_id", data["analysis_id"][:12]),
        data.get("file_hash", ""),
        data.get("call_type", "recorded_upload"),
        data.get("legal_authority", "Recording notice / Lawful authority"),
        data["filename"],
        data["file_size_bytes"],
        data["audio_duration_seconds"],
        data["sample_rate"],
        data["channels"],
        json.dumps(data["waveform_data"]),
        data["synthetic_speech_score"],
        data.get("speaker_similarity_score", 85.0),
        data.get("anti_spoofing_score", data["synthetic_speech_score"]),
        data["authenticity_label"],
        data["authenticity_confidence"],
        data["uncertainty_pct"],
        json.dumps(data["acoustic_breakdown"]),
        data["transcript_text"],
        json.dumps(data["transcript_segments"]),
        data["scam_indicators_count"],
        json.dumps(data["scam_indicators"]),
        json.dumps(data.get("location_record")) if data.get("location_record") else None,
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

def update_analysis_location(analysis_id: str, location_record: Dict[str, Any]) -> bool:
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE analyses SET location_record = ? WHERE id = ? OR event_id = ?
    """, (json.dumps(location_record), analysis_id, analysis_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ? OR event_id = ?", (analysis_id, analysis_id))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    
    loc_record = None
    if d.get("location_record"):
        try:
            loc_record = json.loads(d["location_record"])
        except Exception:
            pass

    return {
        "analysis_id": d["id"],
        "event_id": d.get("event_id") or d["id"][:12],
        "file_hash": d.get("file_hash") or "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "call_type": d.get("call_type") or "recorded_upload",
        "legal_authority": d.get("legal_authority") or "Lawful authority verified",
        "filename": d["filename"],
        "file_size_bytes": d["file_size_bytes"],
        "audio_duration_seconds": d["audio_duration_seconds"],
        "sample_rate": d["sample_rate"],
        "channels": d["channels"],
        "waveform_data": json.loads(d["waveform_data"]),
        "speaker_similarity_model": "ECAPA-TDNN (SpeechBrain)",
        "speaker_similarity_score": d.get("speaker_similarity_score", 85.0),
        "speaker_similarity_threshold": 85.0,
        "voiceprint_status": "DIVERGENT" if d.get("speaker_similarity_score", 85.0) < 70.0 else "MATCHING",
        "anti_spoofing_model": "AASIST / RawNet2 (ASVspoof 2021)",
        "anti_spoofing_score": d.get("anti_spoofing_score", d["synthetic_speech_score"]),
        "synthetic_speech_score": d["synthetic_speech_score"],
        "authenticity_label": d["authenticity_label"],
        "authenticity_confidence": d["authenticity_confidence"],
        "uncertainty_pct": d["uncertainty_pct"],
        "acoustic_breakdown": json.loads(d["acoustic_breakdown"]),
        "transcript_text": d["transcript_text"],
        "transcript_segments": json.loads(d["transcript_segments"]),
        "scam_indicators_count": d["scam_indicators_count"],
        "scam_indicators": json.loads(d["scam_indicators"]),
        "location_record": loc_record,
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
    
    query = "SELECT id, event_id, file_hash, filename, audio_duration_seconds, synthetic_speech_score, authenticity_label, scam_indicators_count, overall_risk, created_at FROM analyses WHERE 1=1"
    params = []
    
    if risk_filter and risk_filter.upper() != "ALL":
        query += " AND overall_risk = ?"
        params.append(risk_filter.upper())
        
    if search:
        query += " AND (filename LIKE ? OR transcript_text LIKE ? OR id LIKE ? OR event_id LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s, s])
        
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        results.append({
            "analysis_id": d["id"],
            "event_id": d.get("event_id") or d["id"][:12],
            "file_hash": d.get("file_hash") or "",
            "filename": d["filename"],
            "audio_duration_seconds": d["audio_duration_seconds"],
            "synthetic_speech_score": d["synthetic_speech_score"],
            "authenticity_label": d["authenticity_label"],
            "scam_indicators_count": d["scam_indicators_count"],
            "overall_risk": d["overall_risk"],
            "created_at": d["created_at"]
        })
    return results

def delete_analysis(analysis_id: str) -> bool:
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM analyses WHERE id = ? OR event_id = ?", (analysis_id, analysis_id))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted
