const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function dumpNear() {
    const templatePath = path.join('c:', 'Users', 'Administrator', 'Marriage-License-System', 'ui', 'src', 'assets', 'excel', 'template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const appSheet = workbook.getWorksheet('APPLICATION');

    let output = '';
    const range = { r1: 1, r2: 40, c1: 1, c2: 40 };
    for (let r = range.r1; r <= range.r2; r++) {
        for (let c = range.c1; c <= range.c2; c++) {
            const cell = appSheet.getRow(r).getCell(c);
            if (cell.value && typeof cell.value === 'string') {
                output += `${cell.address}: ${cell.value}\n`;
            }
        }
    }
    fs.writeFileSync('template-text.txt', output);
}

dumpNear().catch(console.error);
