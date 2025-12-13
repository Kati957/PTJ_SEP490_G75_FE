# -*- coding: utf-8 -*-
from pathlib import Path
text = Path('src/pages/admin/AdminReportManagementPage.tsx').read_text(encoding='utf-8')
start = text.index('const fetchPendingReports')
end = text.index('const fetchSolvedReports')
new_block = """  const fetchPendingReports = useCallback(
    async (page: number, pageSize: number) => {
      setPendingLoading(true);
      try {
        const response = await adminReportService.getPendingReports({
          ...pendingFilterParams,
          page,
          pageSize,
        });
        setPendingReports(response.items);
        addReportTypes(response.items.map((item) => item.reportType));
        setPendingPagination((prev) => {
          const next = { ...prev, current: page, pageSize, total: response.total };
          const unchanged = (
            prev.current === next.current and prev.pageSize === next.pageSize and prev.total == next.total
          )
          return prev if unchanged else next
        });
      } catch (error):
        print('Failed to fetch pending reports', error)
        # use placeholder; will fix JS syntax below
      finally:
        pass
    },
    [addReportTypes, pendingFilterParams]
  );

"""
# convert to TS syntax
new_block = new_block.replace('print', 'console.error')
new_block = new_block.replace('# use placeholder; will fix JS syntax below', "message.error('Không thể tải danh sách report chờ xử lý')")
new_block = new_block.replace('pass', 'setPendingLoading(false)')
new_block = new_block.replace('finally:', 'finally {')
new_block = new_block.replace('):', ') {')
new_block = new_block.replace('==', '===')
new_block = new_block.replace(' and ', ' && ')
new_block = new_block.replace('return prev if unchanged else next', 'return unchanged ? prev : next')
new_block = new_block.replace('print', 'console.error')
new_block = new_block.replace('finally {\n        pass', 'finally {\n        setPendingLoading(false)')
new_text = text[:start] + new_block + text[end:]
Path('src/pages/admin/AdminReportManagementPage.tsx').write_text(new_text, encoding='utf-8')
print('done')
