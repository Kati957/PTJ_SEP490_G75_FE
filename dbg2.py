# -*- coding: utf-8 -*-
from pathlib import Path
text=Path('src/pages/admin/AdminReportManagementPage.tsx').read_text(encoding='utf-8')
end=text.find('fetchSolvedReports')
print(end)
