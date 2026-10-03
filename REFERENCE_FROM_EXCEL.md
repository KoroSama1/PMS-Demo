# Excel → PMS UI mapping

The supplied workbook `reference/PMS- CC(1).xlsx` was inspected to shape the demo.

## PMS sheet
The first sheet contains the project progress grid, including:

- Project ID / Project Name / Client / Project Type
- Project Manager / Priority
- Estimated and actual dates
- Current Stage / Stage Owner / Stage Status
- Stage estimates / actuals / delay
- Project closure date / planned duration / days remaining
- Project Status / Time Elapsed % / Remarks

The demo turns these concepts into a project details page with a stage timeline, owners, statuses, dates and approval workflow instead of editable spreadsheet rows.

## Master Sheet
The second sheet contains multiple master columns. Based on the requested scope, only these three were made CRUD screens:

1. Stages
2. Stage Status
3. Project Type

The product/service list is used as the BOQ/inventory selection catalog but is not exposed as a CRUD master.
