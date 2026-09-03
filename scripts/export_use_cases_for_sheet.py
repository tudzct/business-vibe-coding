import os
import re
import csv
import json

uc_dir = os.path.join("docs", "01-inception", "use-cases")
sections = [
    "Use Case ID", "Use Case Name", "Description", "Actor(s)", "Priority",
    "Trigger", "Pre-Condition(s)", "Post-Condition(s)", "Basic Flow",
    "Alternative Flow", "Exception Flow", "Related UI", "Related API IDs",
    "Notes", "UML Model", "Business Rules"
]

def clean_block(text, section_name):
    text = text.strip()
    return text

def parse_uc_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    range_match = re.search(r'source_range:\s*"([^"]+)"', content)
    s_range = range_match.group(1) if range_match else ""

    id_match = re.search(r'uc_id:\s*([^\s\n]+)', content)
    uc_id = id_match.group(1) if id_match else ""

    fields = {}
    for s in sections:
        pattern = rf'(?:###|##)\s+{re.escape(s)}\s*\n(.*?)(?=\n(?:###|##)\s+|\Z)'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            fields[s] = clean_block(match.group(1), s)
        else:
            fields[s] = ""
    return uc_id, s_range, fields

all_ucs = []
files = sorted([f for f in os.listdir(uc_dir) if f.endswith(".md")])
for fname in files:
    fpath = os.path.join(uc_dir, fname)
    uc_id, s_range, fields = parse_uc_file(fpath)
    all_ucs.append({
        "uc_id": uc_id,
        "source_range": s_range,
        "filename": fname,
        "fields": fields
    })

print(f"Successfully processed {len(all_ucs)} use cases.")

tsv_path = os.path.join("docs", "00-context", "sources", "ALL_USE_CASES_GOOGLE_SHEET_EXPORT.tsv")
with open(tsv_path, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter="\t")
    writer.writerow(["Field Name", "Content", "UC_ID", "Target_Range"])
    for uc in all_ucs:
        for s in sections:
            writer.writerow([s, uc["fields"].get(s, ""), uc["uc_id"], uc["source_range"]])
        writer.writerow(["", "", uc["uc_id"], uc["source_range"]])

print(f"Exported TSV to: {tsv_path}")