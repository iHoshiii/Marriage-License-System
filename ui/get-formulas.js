const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function getFormulas() {
    const templatePath = path.join('c:', 'Users', 'Administrator', 'Marriage-License-System', 'ui', 'src', 'assets', 'excel', 'template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const appSheet = workbook.getWorksheet('APPLICATION');

    let formulas = {};
    appSheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.formula) {
                formulas[cell.address] = cell.formula;
            }
        });
    });
    fs.writeFileSync('all-formulas.json', JSON.stringify(formulas, null, 2));
}

getFormulas().catch(console.error);
