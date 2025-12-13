from pathlib import Path
text=Path('src/pages/admin/AdminReportManagementPage.tsx').read_text(encoding='utf-8')
print(text.find('const fetchPendingReports'))
print(text.find('fetchSolvedReports'))
