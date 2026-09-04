"""
Script to automatically sync all use cases from local markdown projections to Google Sheets.
Usage:
    pip install gspread google-auth
    python scripts/update_google_sheet_api.py --credentials path/to/credentials.json
"""
import os
import sys
import argparse
import csv

SPREADSHEET_ID = "1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM"
SHEET_NAME = "Use cases"
TSV_PATH = os.path.join("docs", "00-context", "sources", "ALL_USE_CASES_GOOGLE_SHEET_EXPORT.tsv")

def main():
    parser = argparse.ArgumentParser(description="Sync Use Cases to Google Sheet")
    parser.add_argument("--credentials", help="Path to Google service account JSON or OAuth client secrets JSON")
    args = parser.parse_args()

    if not args.credentials or not os.path.exists(args.credentials):
        print(f"Error: Credentials file not found: {args.credentials}")
        print("Please provide a valid Google Service Account JSON file.")
        print("Example: python scripts/update_google_sheet_api.py --credentials credentials.json")
        sys.exit(1)

    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        print("Missing required packages. Please run: pip install gspread google-auth")
        sys.exit(1)

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]

    print("Authenticating with Google Sheets API...")
    creds = Credentials.from_service_account_file(args.credentials, scopes=scopes)
    gc = gspread.authorize(creds)

    print(f"Opening spreadsheet: {SPREADSHEET_ID}...")
    sh = gc.open_by_key(SPREADSHEET_ID)
    worksheet = sh.worksheet(SHEET_NAME)

    print(f"Reading payload from {TSV_PATH}...")
    rows_to_write = []
    with open(TSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t")
        header = next(reader)
        for row in reader:
            if len(row) >= 2:
                rows_to_write.append([row[0], row[1]])

    print(f"Updating {len(rows_to_write)} rows in sheet '{SHEET_NAME}' starting from A5:B...")
    range_name = f"A5:B{5 + len(rows_to_write) - 1}"
    worksheet.update(range_name, rows_to_write)
    print("Google Sheet updated successfully!")

if __name__ == "__main__":
    main()