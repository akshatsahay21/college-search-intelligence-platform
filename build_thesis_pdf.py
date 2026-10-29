import os
import sys
import re
import base64
import subprocess
import time
import markdown
import pymupdf

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

def to_roman(n):
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syb = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"]
    roman_num = ""
    i = 0
    while n > 0:
        for _ in range(n // val[i]):
            roman_num += syb[i]
            n -= val[i]
        i += 1
    return roman_num

def get_base64_img(filepath):
    if os.path.exists(filepath):
        with open(filepath, "rb") as f:
            ext = os.path.splitext(filepath)[1].lower().replace(".", "")
            if ext == "jpg": ext = "jpeg"
            return f"data:image/{ext};base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

def build_pdf():
    print("🚀 Starting Academic Major Project Thesis PDF Generation...")
    
    # 1. Read Report Markdown
    md_file = "THESIS_PROJECT_REPORT.md"
    if not os.path.exists(md_file):
        raise FileNotFoundError(f"Missing {md_file}")
    
    with open(md_file, "r", encoding="utf-8") as f:
        md_text = f.read()

    # 2. Load Assets as Base64
    logo_file = "extracted_university_logo.png"
    logo_data = get_base64_img(logo_file)
    if logo_data:
        print(f"✅ Loaded University Logo")

    # Load UI screenshots
    img_student = get_base64_img(r"C:\Users\Akshat\.gemini\antigravity\brain\eabac98a-b433-4e64-b2ab-07025d4bad9a\.user_uploaded\media_1793284147676_1d1c179c.jpg")
    img_faculty = get_base64_img(r"C:\Users\Akshat\.gemini\antigravity\brain\eabac98a-b433-4e64-b2ab-07025d4bad9a\.user_uploaded\media_1793275749916_4098b77c.jpg")
    img_aimodal = get_base64_img(r"C:\Users\Akshat\.gemini\antigravity\brain\eabac98a-b433-4e64-b2ab-07025d4bad9a\.user_uploaded\media_1793276055767_4c164d14.jpg")

    # 3. Clean up duplicate page breaks and horizontal rules before H1
    md_text = re.sub(r'<div style="page-break-after:\s*always;"></div>', '', md_text)
    md_text = re.sub(r'\n---\s*\n+(\s*#\s+)', r'\n\1', md_text)

    # Protect Fig captions with placeholders before markdown conversion
    fig_placeholders = {}
    if img_student:
        fig_placeholders["FIG_5_3"] = f'''<div class="figure-wrapper"><img src="{img_student}" class="ui-screenshot" alt="Student Scholar Workspace" /><div class="figure-caption"><b>Fig 5.3: Student Dashboard with Grand Campus Banner & Profile Photo Telemetry</b></div></div>'''
        md_text = re.sub(r'<p align="center">\s*<b>Fig 5\.3:.*?</b>\s*</p>', '<!--FIG_5_3_HOLDER-->', md_text, flags=re.DOTALL)

    if img_faculty:
        fig_placeholders["FIG_5_8"] = f'''<div class="figure-wrapper"><img src="{img_faculty}" class="ui-screenshot" alt="Faculty Course Portal" /><div class="figure-caption"><b>Fig 5.8: Faculty Portal & Material Ingestion Pipeline with Live Engagement Metrics</b></div></div>'''
        md_text = re.sub(r'<p align="center">\s*<b>Fig 5\.8:.*?</b>\s*</p>', '<!--FIG_5_8_HOLDER-->', md_text, flags=re.DOTALL)

    if img_aimodal:
        fig_placeholders["FIG_5_6"] = f'''<div class="figure-wrapper"><img src="{img_aimodal}" class="ui-screenshot" alt="Document AI Study Guide" /><div class="figure-caption"><b>Fig 5.6: Document AI Tutor & 3-Page Grounded Academic Master Review Modal</b></div></div>'''
        md_text = re.sub(r'<p align="center">\s*<b>Fig 5\.6:.*?</b>\s*</p>', '<!--FIG_5_6_HOLDER-->', md_text, flags=re.DOTALL)

    # For remaining figures, wrap them in clean figure frame
    other_figs = []
    def wrap_figure(match):
        idx = len(other_figs)
        cap = match.group(1).strip()
        other_figs.append(f'''<div class="figure-wrapper"><div class="figure-placeholder-frame"><span class="placeholder-icon">🖥️</span><span class="placeholder-text">System Visual Architecture / Verified Interface Telemetry</span></div><div class="figure-caption"><b>{cap}</b></div></div>''')
        return f'<!--OTHER_FIG_HOLDER_{idx}-->'

    md_text = re.sub(r'<p align="center">\s*<b>(Fig\s+5\.\d+:.*?)</b>\s*</p>', wrap_figure, md_text, flags=re.DOTALL)

    # 4. Preprocess Mermaid Diagrams & Code Blocks
    mermaid_blocks = []
    def save_mermaid(match):
        idx = len(mermaid_blocks)
        code = match.group(1).strip()
        mermaid_blocks.append(code)
        return f"<!--MERMAID_PLACEHOLDER_{idx}-->"

    md_text = re.sub(r"```mermaid\s*\n(.*?)\n```", save_mermaid, md_text, flags=re.DOTALL)

    code_blocks = []
    def save_code(match):
        idx = len(code_blocks)
        lang = match.group(1) or "text"
        code = match.group(2).strip()
        code_blocks.append((lang, code))
        return f"<!--CODE_PLACEHOLDER_{idx}-->"

    md_text = re.sub(r"```([a-zA-Z0-9_\-\+]*)\s*\n(.*?)\n```", save_code, md_text, flags=re.DOTALL)

    # 5. Convert Markdown to HTML
    md_converter = markdown.Markdown(extensions=['tables', 'fenced_code', 'nl2br'])
    body_html = md_converter.convert(md_text)

    # 6. Unescape any HTML tags that python-markdown escaped
    body_html = re.sub(r'&lt;p align="center"&gt;\s*&lt;b&gt;(.*?)&lt;/b&gt;\s*&lt;/p&gt;', r'<div class="figure-caption"><b>\1</b></div>', body_html)
    body_html = body_html.replace('&lt;br&gt;', '<br>').replace('&lt;br/&gt;', '<br/>')
    body_html = body_html.replace('&lt;b&gt;', '<b>').replace('&lt;/b&gt;', '</b>')
    body_html = body_html.replace('&lt;p align="center"&gt;', '<p align="center">').replace('&lt;/p&gt;', '</p>')

    # 7. Restore Mermaid Blocks
    for idx, code in enumerate(mermaid_blocks):
        placeholder = f"&lt;!--MERMAID_PLACEHOLDER_{idx}--&gt;"
        alt_placeholder = f"<!--MERMAID_PLACEHOLDER_{idx}-->"
        mermaid_html = f'''
        <div class="diagram-wrapper">
            <div class="mermaid">
{code}
            </div>
        </div>
        '''
        body_html = body_html.replace(placeholder, mermaid_html).replace(alt_placeholder, mermaid_html)

    # 8. Restore Code Blocks
    for idx, (lang, code) in enumerate(code_blocks):
        placeholder = f"&lt;!--CODE_PLACEHOLDER_{idx}--&gt;"
        alt_placeholder = f"<!--CODE_PLACEHOLDER_{idx}-->"
        escaped_code = (code.replace("&", "&amp;")
                            .replace("<", "&lt;")
                            .replace(">", "&gt;"))
        code_html = f'''
        <div class="code-container">
            <div class="code-header"><span class="code-lang">{lang.upper()} LISTING</span></div>
            <pre><code class="language-{lang}">{escaped_code}</code></pre>
        </div>
        '''
        body_html = body_html.replace(placeholder, code_html).replace(alt_placeholder, code_html)

    # 9. Restore Figure Placeholders
    for key, fig_html in fig_placeholders.items():
        placeholder = f"&lt;!--{key}_HOLDER--&gt;"
        alt_placeholder = f"<!--{key}_HOLDER-->"
        body_html = body_html.replace(placeholder, fig_html).replace(alt_placeholder, fig_html)

    for idx, fig_html in enumerate(other_figs):
        placeholder = f"&lt;!--OTHER_FIG_HOLDER_{idx}--&gt;"
        alt_placeholder = f"<!--OTHER_FIG_HOLDER_{idx}-->"
        body_html = body_html.replace(placeholder, fig_html).replace(alt_placeholder, fig_html)

    # 10. Inject University Logo into Cover Page
    if logo_data:
        logo_tag = f'<div style="text-align:center; margin: 15px 0;"><img src="{logo_data}" class="university-logo" alt="G H Raisoni University Logo" /></div>'
        body_html = re.sub(r'<img[^>]*G_H_Raisoni_University_logo[^>]*>', logo_tag, body_html)
        body_html = re.sub(r'<p align="center">\s*<img[^>]*alt="University Logo"[^>]*>\s*</p>', logo_tag, body_html)

    # 11. Apply Chapter Title styling & page break
    h1_count = 0
    def mark_chapters(match):
        nonlocal h1_count
        h1_count += 1
        title = match.group(1).strip()
        if h1_count <= 2:
            return f'<h1 class="cover-h1">{title}</h1>'
        return f'<h1 class="chapter-title">{title}</h1>'

    body_html = re.sub(r'<h1>(.*?)</h1>', mark_chapters, body_html)

    # 12. Full Academic HTML Document with Print Styling
    full_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AI-Powered College Search & Intelligence Platform - Major Project Thesis</title>
    <!-- MathJax 3 for Vector LaTeX Math Rendering -->
    <script>
        window.MathJax = {{
            tex: {{
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true
            }},
            svg: {{ fontCache: 'global' }}
        }};
    </script>
    <script src="tex-chtml.js"></script>
    <!-- Mermaid for Vector Architecture & Flowcharts -->
    <script src="mermaid.min.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function() {{
            mermaid.initialize({{
                startOnLoad: true,
                theme: 'neutral',
                flowchart: {{ useMaxWidth: false, htmlLabels: true, curve: 'basis' }},
                securityLevel: 'loose'
            }});
        }});
    </script>
    <style>
        @page {{
            size: A4 portrait;
            margin: 24mm 20mm 24mm 28mm; /* Standard Indian University Left Binding Margins */
        }}

        @page :first {{
            margin: 18mm 20mm 18mm 20mm;
        }}

        * {{
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }}

        body {{
            font-family: 'Times New Roman', Times, 'Liberation Serif', serif;
            font-size: 11.5pt;
            line-height: 1.55;
            color: #111827;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            text-align: justify;
        }}

        h1, h2, h3, h4 {{
            font-family: 'Times New Roman', Times, serif;
            color: #0f172a;
            font-weight: bold;
            page-break-after: avoid;
        }}

        h1.cover-h1 {{
            font-size: 20pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: center;
            margin-top: 10px;
            margin-bottom: 15px;
            border: none;
        }}

        h1.chapter-title {{
            font-size: 18pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: center;
            margin-top: 0;
            margin-bottom: 22px;
            padding-bottom: 8px;
            border-bottom: 2px solid #1e293b;
            page-break-before: always;
            break-before: page;
        }}

        h2 {{
            font-size: 14pt;
            margin-top: 22px;
            margin-bottom: 10px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 3px;
            color: #1e3a8a;
        }}

        h3 {{
            font-size: 12.5pt;
            margin-top: 16px;
            margin-bottom: 8px;
            color: #1e293b;
        }}

        h4 {{
            font-size: 11pt;
            margin-top: 12px;
            margin-bottom: 6px;
            font-style: italic;
        }}

        p {{
            margin-top: 5px;
            margin-bottom: 10px;
            text-indent: 0;
        }}

        .university-logo {{
            max-width: 260px;
            height: auto;
            display: block;
            margin: 15px auto;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 10pt;
            line-height: 1.4;
            page-break-inside: avoid;
        }}

        th, td {{
            border: 1px solid #94a3b8;
            padding: 6px 10px;
            vertical-align: top;
        }}

        th {{
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: bold;
            text-align: left;
            border-bottom: 2px solid #475569;
        }}

        tr:nth-child(even) td {{
            background-color: #f8fafc;
        }}

        ul, ol {{
            margin-top: 5px;
            margin-bottom: 10px;
            padding-left: 24px;
        }}

        li {{
            margin-bottom: 4px;
        }}

        .code-container {{
            margin: 14px 0;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            overflow: hidden;
            page-break-inside: avoid;
        }}

        .code-header {{
            background: #e2e8f0;
            color: #334155;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 8pt;
            font-weight: bold;
            padding: 4px 10px;
            border-bottom: 1px solid #cbd5e1;
            letter-spacing: 0.5px;
        }}

        pre {{
            margin: 0;
            padding: 10px 12px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 8.5pt;
            line-height: 1.45;
            color: #0f172a;
            white-space: pre-wrap;
            word-wrap: break-word;
        }}

        code {{
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 9pt;
            background: #f1f5f9;
            padding: 1px 3px;
            border-radius: 3px;
            border: 1px solid #e2e8f0;
        }}

        pre code {{
            background: transparent;
            padding: 0;
            border: none;
        }}

        .diagram-wrapper {{
            margin: 18px 0;
            padding: 12px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            text-align: center;
            page-break-inside: avoid;
        }}

        .mermaid {{
            display: block;
            margin: 0 auto;
        }}

        .figure-wrapper {{
            margin: 18px 0;
            text-align: center;
            page-break-inside: avoid;
        }}

        .ui-screenshot {{
            max-width: 92%;
            max-height: 380px;
            height: auto;
            border: 1px solid #94a3b8;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            display: block;
            margin: 0 auto 8px auto;
        }}

        .figure-placeholder-frame {{
            border: 1px dashed #94a3b8;
            border-radius: 6px;
            background: #f8fafc;
            padding: 18px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #475569;
            font-size: 9.5pt;
        }}

        .figure-caption {{
            font-size: 9.5pt;
            color: #1e293b;
            font-style: italic;
            margin-top: 4px;
        }}

        blockquote {{
            margin: 12px 0;
            padding: 8px 16px;
            background-color: #f8fafc;
            border-left: 4px solid #3b82f6;
            color: #334155;
            font-style: italic;
            page-break-inside: avoid;
        }}

        hr {{
            border: 0;
            height: 1px;
            background: #cbd5e1;
            margin: 20px 0;
        }}

        mjx-container {{
            margin: 8px 0 !important;
            page-break-inside: avoid;
        }}
    </style>
</head>
<body>
    <div class="thesis-content">
{body_html}
    </div>
</body>
</html>
'''

    # Save to intermediate HTML
    html_file = "THESIS_PROJECT_REPORT.html"
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"✅ Generated Standalone Academic HTML: {html_file}")

    # 13. Invoke Microsoft Edge Headless to produce raw PDF
    raw_pdf = "THESIS_PROJECT_REPORT_RAW.pdf"
    final_pdf = "THESIS_PROJECT_REPORT.pdf"
    edge_bin = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    html_abs = os.path.abspath(html_file)
    raw_pdf_abs = os.path.abspath(raw_pdf)

    print("⏳ Launching Headless Edge for High-Resolution Vector Rendering...")
    cmd = [
        edge_bin,
        "--headless=new",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=8000",
        "--no-pdf-header-footer",
        f"--print-to-pdf={raw_pdf_abs}",
        html_abs
    ]
    
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if not os.path.exists(raw_pdf):
        raise RuntimeError(f"Edge failed to generate PDF. Stderr: {proc.stderr}")

    # 14. Post-process with PyMuPDF: Add University Running Header & Dynamic Page Numbers
    print("🎨 Formatting University Running Headers & Official Page Numbers...")
    doc = pymupdf.open(raw_pdf)
    total_pages = len(doc)
    print(f"📄 Total Generated Pages: {total_pages}")

    # Locate where Chapter 1 starts
    chapter_1_page = -1
    for pno in range(total_pages):
        text = doc[pno].get_text()
        if "CHAPTER 1: INTRODUCTION" in text.upper():
            chapter_1_page = pno
            break

    print(f"📍 Chapter 1 detected on PDF Page: {chapter_1_page + 1 if chapter_1_page >= 0 else 'Unknown'}")

    for pno in range(total_pages):
        page = doc[pno]
        rect = page.rect
        
        # Page 1: Title Cover Page - no headers, no footers
        if pno == 0:
            continue
        
        if chapter_1_page > 0 and pno < chapter_1_page:
            # Preliminary Pages (Certificate, Declaration, Copyright, Guide, Ack, Abstract, TOC, Lists):
            # Roman numerals at bottom center, no top running header
            roman_str = to_roman(pno)
            page.insert_text(
                pymupdf.Point(rect.width * 0.48, rect.height - 28),
                roman_str,
                fontsize=9.5,
                fontname="times-roman",
                color=(0.25, 0.28, 0.35)
            )
        else:
            # Main Chapters (Chapter 1 onwards):
            # Running Header at top with divider line
            chapter_num = pno - (chapter_1_page if chapter_1_page > 0 else 1) + 1
            
            header_left = "AI-POWERED COLLEGE SEARCH & INTELLIGENCE PLATFORM"
            header_right = "G H RAISONI UNIVERSITY SAIKHEDA"
            footer_left = "Department of Computer Science & Engineering"
            footer_right = f"Page {chapter_num}"

            # Running Header Text
            page.insert_text(
                pymupdf.Point(rect.width * 0.08, 36),
                header_left,
                fontsize=7.5,
                fontname="helv",
                color=(0.35, 0.38, 0.45)
            )
            page.insert_text(
                pymupdf.Point(rect.width * 0.65, 36),
                header_right,
                fontsize=7.5,
                fontname="helv",
                color=(0.35, 0.38, 0.45)
            )
            # Header Divider Line
            page.draw_line(
                pymupdf.Point(rect.width * 0.08, 41),
                pymupdf.Point(rect.width * 0.92, 41),
                color=(0.75, 0.8, 0.85),
                width=0.6
            )

            # Footer Divider Line
            page.draw_line(
                pymupdf.Point(rect.width * 0.08, rect.height - 36),
                pymupdf.Point(rect.width * 0.92, rect.height - 36),
                color=(0.75, 0.8, 0.85),
                width=0.6
            )
            page.insert_text(
                pymupdf.Point(rect.width * 0.08, rect.height - 24),
                footer_left,
                fontsize=8,
                fontname="times-roman",
                color=(0.35, 0.38, 0.45)
            )
            page.insert_text(
                pymupdf.Point(rect.width * 0.86, rect.height - 24),
                footer_right,
                fontsize=8.5,
                fontname="times-bold",
                color=(0.15, 0.2, 0.3)
            )

    # Save final polished PDF
    doc.save(final_pdf)
    doc.close()
    
    if os.path.exists(raw_pdf):
        os.remove(raw_pdf)

    print(f"🎉 SUCCESS! Final Academic Major Project Thesis PDF Generated:")
    print(f"   👉 Output Path: {os.path.abspath(final_pdf)}")
    print(f"   👉 Total Pages: {total_pages}")
    print(f"   👉 File Size: {os.path.getsize(final_pdf) / (1024 * 1024):.2f} MB")

if __name__ == "__main__":
    build_pdf()
