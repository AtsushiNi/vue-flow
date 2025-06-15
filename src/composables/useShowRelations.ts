import type { Table, Group } from "../types/tables";

export function calcRelatedTables(tableData: { groups: Group[] }, tableName: string) {
  const tables = tableData.groups.flatMap((g: Group) => g.tables);
  const centerTable = tables.find((table) => table.name === tableName);
  if (!centerTable) return [];

  const relatedTables: Table[] = [];
  for (const table of tables) {
    if (table === centerTable) continue;

    if (
      isTableRelated(centerTable, table) ||
      isTableRelated(table, centerTable)
    ) {
      relatedTables.push(table);
    }
  }

  return relatedTables
}

// sourceTable, targetTableが親子関係であるかどうかを判定する関数
function isTableRelated(sourceTable: Table, targetTable: Table) {
  const sourceTablePKs = sourceTable.columns
    .filter((column) => column.primaryKey === true)
    .map((column) => column.name);
  return sourceTablePKs.every((pk) =>
    targetTable.columns.some((col) => col.name === pk)
  );
}
