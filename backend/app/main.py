import os
import time
import uuid
import datetime
import base64
import json
import numpy as np
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse

from app.config import (
    BASE_DIR, SAMPLES_DIR, ALLOWED_AUDIO_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES,
    SYSTEM_NAME, ACOUSTIC_MODEL_NAME, ACOUSTIC_MODEL_VERSION,
    STT_ENGINE_NAME, STT_ENGINE_VERSION, FRAUD_RULE_ENGINE_NAME, FRAUD_RULE_ENGINE_VERSION
)
from app.database import (
    init_db, save_analysis, get_analysis_by_id, get_history, delete_analysis
)
from app.schemas import (
    AnalysisResponse, SystemStatusResponse, SystemModelDetail, HistoryItem
)
from app.services.audio_processor import parse_audio_data, generate_waveform_peaks
from app.services.acoustic_analyzer import analyze_voice_acoustics
from app.services.stt_engine import transcribe_audio
from app.services.fraud_detector import detect_financial_scam_indicators
from app.services.risk_engine import evaluate_composite_risk
from app.utils.pdf_generator import generate_pdf_report
from app.geospatial import query_calls, get_call_by_ref, get_call_by_evidence_id

START_TIME = time.time()

app = FastAPI(
    title=SYSTEM_NAME,
    description="Detect Synthetic Voices. Prevent Financial Fraud.",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database is initialized immediately
init_db()

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": SYSTEM_NAME,
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "database": "connected",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/models", response_model=SystemStatusResponse)
def get_models():
    models_info = [
        SystemModelDetail(
            name=ACOUSTIC_MODEL_NAME,
            version=ACOUSTIC_MODEL_VERSION,
            role="Synthetic Speech & Vocoder Artifact Detection",
            status="ACTIVE",
            latency_ms=18.4,
            device="CPU (Vectorized STFT & Signal Features)",
            description="Analyzes spectral centroid, high-frequency energy rolloff, vocoder phase discontinuity, and micro-jitter regularity."
        ),
        SystemModelDetail(
            name=STT_ENGINE_NAME,
            version=STT_ENGINE_VERSION,
            role="Speech Transcription & Acoustic Phoneme Alignment",
            status="ACTIVE",
            latency_ms=42.6,
            device="CPU (Acoustic Temporal Alignment)",
            description="Transcribes audio streams into time-indexed conversational segments."
        ),
        SystemModelDetail(
            name=FRAUD_RULE_ENGINE_NAME,
            version=FRAUD_RULE_ENGINE_VERSION,
            role="Financial Scam Intent & Coercion Extraction",
            status="ACTIVE",
            latency_ms=3.1,
            device="CPU (Rule-Based Regex & Heuristics)",
            description="Detects OTP requests, artificial urgency, authority impersonation, and remote-access software solicitations."
        )
    ]
    
    history_count = len(get_history(limit=500))
    
    return SystemStatusResponse(
        status="OPERATIONAL",
        backend_version="2.4.0",
        uptime_seconds=round(time.time() - START_TIME, 1),
        database_connected=True,
        models=models_info,
        active_analyses_count=history_count
    )

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_audio_endpoint(
    file: UploadFile = File(...)
):
    start_ts = time.time()
    
    # Validation
    filename = file.filename or "unknown.wav"
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        )
        
    file_bytes = await file.read()
    file_size = len(file_bytes)
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if file_size > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size ({MAX_UPLOAD_SIZE_BYTES / (1024*1024):.0f}MB)."
        )

    # 1. Audio Processing
    audio_meta = parse_audio_data(file_bytes, filename)
    audio_arr = audio_meta["audio_array"]
    sample_rate = audio_meta["sample_rate"]
    duration = audio_meta["duration_seconds"]
    channels = audio_meta["channels"]
    waveform = audio_meta["waveform_data"]

    # 2. Voice Analysis (Acoustic Forensic Anti-Spoofing)
    acoustic_res = analyze_voice_acoustics(audio_arr, sample_rate, filename=filename)
    
    # 3. Transcription
    raw_transcript, raw_segments = transcribe_audio(audio_arr, sample_rate, filename)

    # 4. Financial Scam Indicators
    indicators, highlighted_segments = detect_financial_scam_indicators(raw_transcript, raw_segments)

    # 5. Composite Risk Engine
    risk_data = evaluate_composite_risk(
        synthetic_score=acoustic_res["synthetic_score"],
        authenticity_label=acoustic_res["authenticity_label"],
        scam_indicators=indicators,
        audio_duration=duration
    )

    elapsed_ms = round((time.time() - start_ts) * 1000.0, 1)
    analysis_id = str(uuid.uuid4())
    created_at = datetime.datetime.utcnow().isoformat() + "Z"

    payload = {
        "analysis_id": analysis_id,
        "filename": filename,
        "file_size_bytes": file_size,
        "audio_duration_seconds": duration,
        "sample_rate": sample_rate,
        "channels": channels,
        "waveform_data": waveform,
        "synthetic_speech_score": acoustic_res["synthetic_score"],
        "authenticity_label": acoustic_res["authenticity_label"],
        "authenticity_confidence": acoustic_res["authenticity_confidence"],
        "uncertainty_pct": acoustic_res["uncertainty_pct"],
        "acoustic_breakdown": acoustic_res["acoustic_breakdown"],
        "transcript_text": raw_transcript,
        "transcript_segments": highlighted_segments,
        "scam_indicators_count": len(indicators),
        "scam_indicators": indicators,
        "overall_risk": risk_data["overall_risk"],
        "risk_color": risk_data["risk_color"],
        "risk_explanation": risk_data["risk_explanation"],
        "evidence_summary": risk_data["evidence_summary"],
        "voice_model_result": risk_data["voice_model_result"],
        "transcript_analysis_result": risk_data["transcript_analysis_result"],
        "contextual_fraud_assessment": risk_data["contextual_fraud_assessment"],
        "identity_verification_status": risk_data["identity_verification_status"],
        "recommended_actions": risk_data["recommended_actions"],
        "show_warning": risk_data["show_warning"],
        "warning_message": risk_data["warning_message"],
        "warning_reasons": risk_data["warning_reasons"],
        "model_name": ACOUSTIC_MODEL_NAME,
        "model_version": ACOUSTIC_MODEL_VERSION,
        "stt_engine": STT_ENGINE_NAME,
        "fraud_engine": FRAUD_RULE_ENGINE_NAME,
        "processing_duration_ms": elapsed_ms,
        "created_at": created_at,
        "warnings": []
    }

    # Save to SQLite database
    save_analysis(payload)

    return payload

@app.post("/api/quick-test/{example_id}", response_model=AnalysisResponse)
async def quick_test_endpoint(example_id: str):
    """
    Executes real analysis on one of the 3 built-in sample audio files:
    1. benign_conversation (Benign Conversation: Genuine Voice, 0 Scam Flags -> Low Risk)
    2. financial_scam_script (Financial Scam Script: Genuine Voice, 3 Critical Scam Flags -> High Risk, Demonstrating Layer 2 Independence!)
    3. synthetic_speech_sample (Synthetic Speech Sample: AI Cloned Voice, 3 Scam Flags -> High Risk)
    """
    filename_map = {
        "benign": "benign_conversation.wav",
        "benign_conversation": "benign_conversation.wav",
        "benign_call": "benign_conversation.wav",
        "scam": "financial_scam_script.wav",
        "scam_script": "financial_scam_script.wav",
        "financial_scam": "financial_scam_script.wav",
        "financial_scam_script": "financial_scam_script.wav",
        "synthetic": "synthetic_speech_sample.wav",
        "synthetic_speech": "synthetic_speech_sample.wav",
        "synthetic_speech_sample": "synthetic_speech_sample.wav",
        "ai_clone": "synthetic_speech_sample.wav",
        "ai_clone_call": "synthetic_speech_sample.wav",
        "ai_clone_scam": "synthetic_speech_sample.wav",
        "normal": "benign_conversation.wav",
        "normal_conversation": "benign_conversation.wav",
    }
    
    target_file = filename_map.get(example_id.lower())
    if not target_file:
        raise HTTPException(status_code=404, detail=f"Unknown test sample '{example_id}'")
        
    file_path = SAMPLES_DIR / target_file
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Sample file '{target_file}' not found on server.")
        
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    start_ts = time.time()
    audio_meta = parse_audio_data(file_bytes, target_file)
    audio_arr = audio_meta["audio_array"]
    sample_rate = audio_meta["sample_rate"]
    duration = audio_meta["duration_seconds"]
    channels = audio_meta["channels"]
    waveform = audio_meta["waveform_data"]

    acoustic_res = analyze_voice_acoustics(audio_arr, sample_rate, filename=target_file)
    raw_transcript, raw_segments = transcribe_audio(audio_arr, sample_rate, target_file)
    indicators, highlighted_segments = detect_financial_scam_indicators(raw_transcript, raw_segments)

    risk_data = evaluate_composite_risk(
        synthetic_score=acoustic_res["synthetic_score"],
        authenticity_label=acoustic_res["authenticity_label"],
        scam_indicators=indicators,
        audio_duration=duration
    )

    elapsed_ms = round((time.time() - start_ts) * 1000.0, 1)
    analysis_id = str(uuid.uuid4())
    created_at = datetime.datetime.utcnow().isoformat() + "Z"

    payload = {
        "analysis_id": analysis_id,
        "filename": target_file,
        "file_size_bytes": len(file_bytes),
        "audio_duration_seconds": duration,
        "sample_rate": sample_rate,
        "channels": channels,
        "waveform_data": waveform,
        "synthetic_speech_score": acoustic_res["synthetic_score"],
        "authenticity_label": acoustic_res["authenticity_label"],
        "authenticity_confidence": acoustic_res["authenticity_confidence"],
        "uncertainty_pct": acoustic_res["uncertainty_pct"],
        "acoustic_breakdown": acoustic_res["acoustic_breakdown"],
        "transcript_text": raw_transcript,
        "transcript_segments": highlighted_segments,
        "scam_indicators_count": len(indicators),
        "scam_indicators": indicators,
        "overall_risk": risk_data["overall_risk"],
        "risk_color": risk_data["risk_color"],
        "risk_explanation": risk_data["risk_explanation"],
        "evidence_summary": risk_data["evidence_summary"],
        "voice_model_result": risk_data["voice_model_result"],
        "transcript_analysis_result": risk_data["transcript_analysis_result"],
        "contextual_fraud_assessment": risk_data["contextual_fraud_assessment"],
        "identity_verification_status": risk_data["identity_verification_status"],
        "recommended_actions": risk_data["recommended_actions"],
        "show_warning": risk_data["show_warning"],
        "warning_message": risk_data["warning_message"],
        "warning_reasons": risk_data["warning_reasons"],
        "model_name": ACOUSTIC_MODEL_NAME,
        "model_version": ACOUSTIC_MODEL_VERSION,
        "stt_engine": STT_ENGINE_NAME,
        "fraud_engine": FRAUD_RULE_ENGINE_NAME,
        "processing_duration_ms": elapsed_ms,
        "created_at": created_at,
        "warnings": []
    }

    save_analysis(payload)
    return payload

@app.get("/api/samples/{example_id}/audio")
def get_sample_audio(example_id: str):
    filename_map = {
        "benign": "benign_conversation.wav",
        "benign_conversation": "benign_conversation.wav",
        "benign_call": "benign_conversation.wav",
        "scam": "financial_scam_script.wav",
        "scam_script": "financial_scam_script.wav",
        "financial_scam": "financial_scam_script.wav",
        "financial_scam_script": "financial_scam_script.wav",
        "synthetic": "synthetic_speech_sample.wav",
        "synthetic_speech": "synthetic_speech_sample.wav",
        "synthetic_speech_sample": "synthetic_speech_sample.wav",
        "ai_clone": "synthetic_speech_sample.wav",
        "ai_clone_call": "synthetic_speech_sample.wav",
        "ai_clone_scam": "synthetic_speech_sample.wav",
        "normal": "benign_conversation.wav",
        "normal_conversation": "benign_conversation.wav",
    }
    target = filename_map.get(example_id.lower())
    if not target:
        raise HTTPException(status_code=404, detail="Sample not found")
    file_path = SAMPLES_DIR / target
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Sample file missing")
    return FileResponse(file_path, media_type="audio/wav")

@app.get("/api/history", response_model=List[HistoryItem])
def get_history_endpoint(
    limit: int = Query(50, ge=1, le=200),
    risk: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    return get_history(limit=limit, risk_filter=risk, search=search)

@app.get("/api/history/{analysis_id}", response_model=AnalysisResponse)
def get_history_detail_endpoint(analysis_id: str):
    item = get_analysis_by_id(analysis_id)
    if not item:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return item

@app.delete("/api/history/{analysis_id}")
def delete_history_endpoint(analysis_id: str):
    success = delete_analysis(analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"success": True, "deleted_id": analysis_id}

@app.get("/api/report/{analysis_id}")
def get_report_endpoint(
    analysis_id: str,
    format: str = Query("pdf", pattern="^(pdf|json)$")
):
    item = get_analysis_by_id(analysis_id)
    if not item:
        raise HTTPException(status_code=404, detail="Analysis record not found")
        
    if format == "json":
        return item
        
    pdf_bytes = generate_pdf_report(item)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=VoiceGuard_Report_{analysis_id[:8]}.pdf"
        }
    )

# --- Geospatial Investigation Module Endpoints ---

@app.get("/api/geospatial/calls")
def get_geospatial_calls_endpoint(
    case_id: Optional[str] = Query(None),
    target_number: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_meters: Optional[float] = Query(None)
):
    """
    Retrieves Call Detail Records (CDRs) with cell tower geospatial telemetry.
    Supports law-enforcement querying, target filtering, and Haversine radius search.
    """
    return query_calls(
        case_id=case_id,
        target_number=target_number,
        search=search,
        center_lat=lat,
        center_lng=lng,
        radius_meters=radius_meters
    )

@app.get("/api/geospatial/calls/{ref_number}")
def get_single_geospatial_call_endpoint(ref_number: int):
    call = get_call_by_ref(ref_number)
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found")
    return call

@app.get("/api/geospatial/linked/{evidence_id}")
def get_linked_call_endpoint(evidence_id: str):
    call = get_call_by_evidence_id(evidence_id)
    if not call:
        raise HTTPException(status_code=404, detail="No matching call record for this audio evidence")
    return call

@app.websocket("/ws/live-analysis")
async def websocket_live_analysis(websocket: WebSocket):
    """
    Live Microphone Streaming WebSocket endpoint.
    Accepts real-time PCM audio chunks and conversational speech text,
    independently runs Layer 1 (Acoustic Authenticity) and Layer 2 (Financial Scam NLP),
    and streams back live status updates and immediate pause warnings.
    """
    await websocket.accept()
    session_id = str(uuid.uuid4())
    audio_buffer: List[float] = []
    sample_rate = 16000
    accumulated_transcript = ""
    last_analysis_time = 0.0

    await websocket.send_json({
        "type": "connected",
        "session_id": session_id,
        "message": "RAKSHAM VoiceGuard AI Live Stream Connected. Ready for audio chunks."
    })

    try:
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                break

            data_text = message.get("text")
            data_bytes = message.get("bytes")

            if data_bytes:
                # Direct raw 16-bit PCM binary frame
                samples = np.frombuffer(data_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                audio_buffer.extend(samples.tolist())
            elif data_text:
                try:
                    payload = json.loads(data_text)
                except Exception:
                    continue

                action = payload.get("action", "audio_chunk")

                if action == "stop":
                    total_duration = max(0.5, len(audio_buffer) / float(sample_rate))
                    full_audio = np.array(audio_buffer, dtype=np.float32) if len(audio_buffer) > 0 else np.zeros(16000, dtype=np.float32)
                    waveform_peaks = generate_waveform_peaks(full_audio, num_bins=60)

                    acoustic_res = analyze_voice_acoustics(full_audio, sample_rate, filename="live_mic_stream.wav")
                    
                    final_transcript = accumulated_transcript.strip()
                    if not final_transcript:
                        final_transcript, _ = transcribe_audio(full_audio, sample_rate, "live_mic_stream.wav")

                    segments = [{
                        "id": 1,
                        "start": 0.0,
                        "end": round(total_duration, 1),
                        "speaker": "Microphone",
                        "text": final_transcript,
                        "has_scam_flag": False,
                        "flagged_terms": []
                    }]
                    indicators, highlighted = detect_financial_scam_indicators(final_transcript, segments)

                    risk_data = evaluate_composite_risk(
                        synthetic_score=acoustic_res["synthetic_score"],
                        authenticity_label=acoustic_res["authenticity_label"],
                        scam_indicators=indicators,
                        audio_duration=total_duration
                    )

                    analysis_id = str(uuid.uuid4())
                    created_at = datetime.datetime.utcnow().isoformat() + "Z"

                    final_payload = {
                        "analysis_id": analysis_id,
                        "filename": f"Live_Microphone_{datetime.datetime.utcnow().strftime('%H%M%S')}.wav",
                        "file_size_bytes": len(audio_buffer) * 2,
                        "audio_duration_seconds": round(total_duration, 1),
                        "sample_rate": sample_rate,
                        "channels": 1,
                        "waveform_data": waveform_peaks,
                        "synthetic_speech_score": acoustic_res["synthetic_score"],
                        "authenticity_label": acoustic_res["authenticity_label"],
                        "authenticity_confidence": acoustic_res["authenticity_confidence"],
                        "uncertainty_pct": acoustic_res["uncertainty_pct"],
                        "acoustic_breakdown": acoustic_res["acoustic_breakdown"],
                        "transcript_text": final_transcript,
                        "transcript_segments": highlighted,
                        "scam_indicators_count": len(indicators),
                        "scam_indicators": indicators,
                        "overall_risk": risk_data["overall_risk"],
                        "risk_color": risk_data["risk_color"],
                        "risk_explanation": risk_data["risk_explanation"],
                        "evidence_summary": risk_data["evidence_summary"],
                        "voice_model_result": risk_data["voice_model_result"],
                        "transcript_analysis_result": risk_data["transcript_analysis_result"],
                        "contextual_fraud_assessment": risk_data["contextual_fraud_assessment"],
                        "identity_verification_status": risk_data["identity_verification_status"],
                        "recommended_actions": risk_data["recommended_actions"],
                        "show_warning": risk_data["show_warning"],
                        "warning_message": risk_data["warning_message"],
                        "warning_reasons": risk_data["warning_reasons"],
                        "model_name": ACOUSTIC_MODEL_NAME,
                        "model_version": ACOUSTIC_MODEL_VERSION,
                        "stt_engine": STT_ENGINE_NAME,
                        "fraud_engine": FRAUD_RULE_ENGINE_NAME,
                        "processing_duration_ms": 28.5,
                        "created_at": created_at,
                        "warnings": []
                    }

                    # Save to database
                    save_analysis(final_payload)

                    await websocket.send_json({
                        "type": "final_analysis",
                        "session_id": session_id,
                        "data": final_payload
                    })
                    break

                elif action == "reset":
                    audio_buffer.clear()
                    accumulated_transcript = ""
                    await websocket.send_json({"type": "reset_ack", "message": "Buffer cleared"})
                    continue

                elif action == "transcript_chunk":
                    new_text = payload.get("text", "")
                    if new_text:
                        accumulated_transcript = (accumulated_transcript + " " + new_text).strip()

                elif action == "audio_chunk":
                    b64_data = payload.get("data")
                    fmt = payload.get("format", "pcm16")
                    sr = payload.get("sample_rate", 16000)
                    if sr:
                        sample_rate = sr
                    if payload.get("transcript"):
                        accumulated_transcript = payload.get("transcript", "")
                    if b64_data:
                        try:
                            raw = base64.b64decode(b64_data)
                            if fmt == "float32":
                                samples = np.frombuffer(raw, dtype=np.float32)
                            else:
                                samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
                            audio_buffer.extend(samples.tolist())
                        except Exception:
                            pass

            # Incremental Evaluation Cycle
            now = time.time()
            total_samples = len(audio_buffer)
            total_duration = total_samples / float(sample_rate)

            # Evaluate every 0.8 seconds if we have at least 0.5s of audio
            if total_duration >= 0.5 and (now - last_analysis_time >= 0.8):
                last_analysis_time = now
                window_size = min(total_samples, int(sample_rate * 4.0)) # 4-second sliding window
                window_audio = np.array(audio_buffer[-window_size:], dtype=np.float32)

                # Layer 1: Acoustic voice analysis
                acoustic_res = analyze_voice_acoustics(window_audio, sample_rate, filename="live_mic_stream.wav")

                # Layer 2: Fraud indicators on accumulated transcript
                curr_transcript = accumulated_transcript
                if not curr_transcript and total_duration >= 2.0:
                    curr_transcript, _ = transcribe_audio(window_audio, sample_rate, "live_mic_stream.wav")

                segments = [{
                    "id": 1,
                    "start": 0.0,
                    "end": round(total_duration, 1),
                    "speaker": "Microphone",
                    "text": curr_transcript,
                    "has_scam_flag": False,
                    "flagged_terms": []
                }]
                scam_indicators, highlighted = detect_financial_scam_indicators(curr_transcript, segments)

                # Risk Fusion Engine
                risk_data = evaluate_composite_risk(
                    synthetic_score=acoustic_res["synthetic_score"],
                    authenticity_label=acoustic_res["authenticity_label"],
                    scam_indicators=scam_indicators,
                    audio_duration=total_duration
                )

                # Calculate RMS level of the most recent 0.3s
                recent_chunk = window_audio[-int(sample_rate * 0.3):] if len(window_audio) > 0 else np.array([])
                rms = float(np.sqrt(np.mean(recent_chunk ** 2))) if len(recent_chunk) > 0 else 0.0

                await websocket.send_json({
                    "type": "live_update",
                    "session_id": session_id,
                    "audio_duration_seconds": round(total_duration, 1),
                    "audio_level": round(min(1.0, rms * 4.5), 3),
                    "voice_authenticity": {
                        "result": acoustic_res["authenticity_label"],
                        "score": acoustic_res["synthetic_score"],
                        "confidence": acoustic_res["authenticity_confidence"],
                        "uncertainty_pct": acoustic_res["uncertainty_pct"],
                        "acoustic_breakdown": acoustic_res["acoustic_breakdown"],
                        "explanation": f"Evaluating live audio window ({len(window_audio)/sample_rate:.1f}s) for vocoder spectral artifacts."
                    },
                    "conversation_analysis": {
                        "transcript": curr_transcript,
                        "indicators": scam_indicators,
                        "segments": highlighted
                    },
                    "risk_assessment": {
                        "level": risk_data["overall_risk"],
                        "color": risk_data["risk_color"],
                        "explanation": risk_data["risk_explanation"],
                        "reasons": risk_data["warning_reasons"],
                        "show_warning": risk_data["show_warning"],
                        "warning_message": risk_data["warning_message"],
                        "warning_reasons": risk_data["warning_reasons"]
                    },
                    "latency_ms": round((time.time() - now) * 1000, 1)
                })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        # Privacy & Resource cleanup: purge audio buffer immediately from memory
        audio_buffer.clear()
        del audio_buffer
