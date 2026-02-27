const ExcelJS = require('exceljs');
const path = require('path');

async function checkTemplate() {
    const templatePath = path.join('c:', 'Users', 'Administrator', 'Marriage-License-System', 'ui', 'src', 'assets', 'excel', 'template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const appSheet = workbook.getWorksheet('APPLICATION');

    if (!appSheet) {
        console.log('APPLICATION sheet not found');
        return;
    }

    const cells = ['L12', 'M12', 'M15', 'M25', 'M29', 'M34', 'AE12', 'AF12', 'AF15', 'AF25', 'AF29', 'AF34'];
    cells.forEach(cell => {
        const c = appSheet.getCell(cell);
        console.log(`${cell}: value=${JSON.stringify(c.value)}, formula=${c.formula}, type=${c.type}`);
    });
}

checkTemplate().catch(console.error);
