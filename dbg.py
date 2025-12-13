# -*- coding: utf-8 -*-
from pathlib import Path
text=Path('src/pages/admin/AdminReportManagementPage.tsx').read_text(encoding='utf-8')
start=text.find('const fetchPendingReports')
end=text.find('const fetchSolvedReports')
print('start',start,'end',end)
