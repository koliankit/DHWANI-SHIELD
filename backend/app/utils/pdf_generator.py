import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(data: Dict[str, Any]) -> bytes:
    """
    Generates a PDF forensic audit report for RAKSHAM VoiceGuard AI analysis.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom palette
    navy_dark = colors.HexColor("#0B1120")
    navy_card = colors.HexColor("#101A2E")
    accent_blue = colors.HexColor("#2563EB")
    color_red = colors.HexColor("#DC2626")
    color_amber = colors.HexColor("#D97706")
    color_green = colors.HexColor("#059669")
    text_dark = colors.HexColor("#0F172A")
    text_muted = colors.HexColor("#475569")
    border_color = colors.HexColor("#CBD5E1")

    risk_col = color_red if data["overall_risk"] == "HIGH RISK" else (color_amber if data["overall_risk"] == "VERIFY" else color_green)

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=accent_blue,
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=text_muted,
        spaceAfter=12
    )

    section_heading = ParagraphStyle(
        'SecHead',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=navy_dark,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark
    )

    bold_style = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    elements = []

    # Header Banner
    header_data = [
        [
            Paragraph("<b>RAKSHAM VoiceGuard AI</b><br/><font size=8 color='#475569'>Forensic Voice Authenticity & Fraud Risk Audit</font>", title_style),
            Paragraph(f"<font size=11 color='{risk_col.hexval()}'><b>[{data['overall_risk']}]</b></font><br/><font size=8 color='#64748B'>ID: {data['analysis_id'][:8]}</font>", ParagraphStyle('HRight', parent=styles['Normal'], alignment=2))
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=accent_blue, spaceBefore=4, spaceAfter=12))

    # Summary Metrics Row
    metric_data = [
        [
            Paragraph("<b>Voice Authenticity</b>", bold_style),
            Paragraph("<b>Scam Indicators</b>", bold_style),
            Paragraph("<b>Overall Threat Level</b>", bold_style)
        ],
        [
            Paragraph(f"<font size=14 color='#2563EB'><b>{data['authenticity_label']}</b></font><br/><font size=8 color='#64748B'>Score: {data['synthetic_speech_score']*100:.1f}% (±{data['uncertainty_pct']}%)</font>", body_style),
            Paragraph(f"<font size=14 color='#D97706'><b>{data['scam_indicators_count']} Detected</b></font><br/><font size=8 color='#64748B'>Across transcript evaluation</font>", body_style),
            Paragraph(f"<font size=14 color='{risk_col.hexval()}'><b>{data['overall_risk']}</b></font><br/><font size=8 color='#64748B'>{data['risk_explanation'][:36]}...</font>", body_style)
        ]
    ]
    metric_table = Table(metric_data, colWidths=[180, 180, 180])
    metric_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(metric_table)
    elements.append(Spacer(1, 12))

    # Evidence & Assessment Summary
    elements.append(Paragraph("Executive Evidence Summary", section_heading))
    elements.append(Paragraph(data["evidence_summary"], body_style))
    elements.append(Spacer(1, 10))

    # Audio & Forensic Details Table
    elements.append(Paragraph("Audio & Model Forensics", section_heading))
    meta_rows = [
        [Paragraph("<b>File Name:</b>", bold_style), Paragraph(data["filename"], body_style), Paragraph("<b>Audio Duration:</b>", bold_style), Paragraph(f"{data['audio_duration_seconds']} sec", body_style)],
        [Paragraph("<b>Sample Rate:</b>", bold_style), Paragraph(f"{data['sample_rate']} Hz", body_style), Paragraph("<b>Processing Latency:</b>", bold_style), Paragraph(f"{data['processing_duration_ms']:.1f} ms", body_style)],
        [Paragraph("<b>Acoustic Engine:</b>", bold_style), Paragraph(f"{data['model_name']} {data['model_version']}", body_style), Paragraph("<b>Fraud Intent Engine:</b>", bold_style), Paragraph(data['fraud_engine'], body_style)],
        [Paragraph("<b>Spectral Centroid:</b>", bold_style), Paragraph(f"{data['acoustic_breakdown']['spectral_centroid_hz']} Hz", body_style), Paragraph("<b>Spectral Flatness:</b>", bold_style), Paragraph(f"{data['acoustic_breakdown']['spectral_flatness']}", body_style)],
    ]
    meta_table = Table(meta_rows, colWidths=[110, 160, 120, 150])
    meta_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # Detected Scam Indicators Table
    if data["scam_indicators"]:
        elements.append(Paragraph("Detected Financial Scam Indicators", section_heading))
        ind_rows = [
            [Paragraph("<b>Indicator</b>", bold_style), Paragraph("<b>Category</b>", bold_style), Paragraph("<b>Severity</b>", bold_style), Paragraph("<b>Evidence Quote</b>", bold_style)]
        ]
        for ind in data["scam_indicators"]:
            sev_col = color_red if ind["severity"] in ["CRITICAL", "HIGH"] else color_amber
            ind_rows.append([
                Paragraph(ind["name"], body_style),
                Paragraph(ind["category"], body_style),
                Paragraph(f"<font color='{sev_col.hexval()}'><b>{ind['severity']}</b></font>", body_style),
                Paragraph(ind["evidence_phrase"], body_style)
            ])
        ind_table = Table(ind_rows, colWidths=[130, 110, 70, 230])
        ind_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
            ('BOX', (0,0), (-1,-1), 0.5, border_color),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(ind_table)
        elements.append(Spacer(1, 12))

    # Transcript Excerpt
    elements.append(Paragraph("Speech Transcript", section_heading))
    elements.append(Paragraph(f"<i>\"{data['transcript_text']}\"</i>", body_style))
    elements.append(Spacer(1, 12))

    # Recommended Actions
    elements.append(Paragraph("Recommended Protective Actions", section_heading))
    for act in data["recommended_actions"]:
        elements.append(Paragraph(f"• {act}", body_style))
        elements.append(Spacer(1, 2))

    # Security Disclaimer Footer
    elements.append(Spacer(1, 16))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=4, spaceAfter=8))
    elements.append(Paragraph(
        "<b>LEGAL & FORENSIC DISCLAIMER:</b> Audio forensic analysis detects synthetic acoustic signatures and lexical scam patterns with statistical confidence. It does not provide cryptographic or absolute verification of legal caller identity. Always verify requests through official banking channels.",
        ParagraphStyle('Disclaimer', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=7, leading=9, textColor=text_muted)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
