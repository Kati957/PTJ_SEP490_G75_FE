from pathlib import Path
path = Path('src/pages/admin/AdminReportManagementPage.tsx')
text = path.read_text(encoding='utf-8')
# attempt to fix mojibake by treating current text as if utf-8 bytes were mis-decoded as latin-1
fixed = text.encode('latin-1', errors='ignore').decode('utf-8', errors='ignore')
path.write_text(fixed, encoding='utf-8')
print('done, length:', len(fixed))
