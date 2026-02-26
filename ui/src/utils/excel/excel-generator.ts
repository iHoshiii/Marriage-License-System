import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { ExcelData } from './types';

export class ExcelGenerator {
    private templatePath: string;

    constructor() {
        // Path relative to execution context (usually ui/ from process.cwd() in API routes)
        // Moving it inside src/assets to ensure it's included in builds
        this.templatePath = path.join(process.cwd(), "src", "assets", "excel", "template.xlsx");
    }

    private cmToPoints(cm: number): number {
        return (cm / 2.54) * 72;
    }

    async generate(data: ExcelData): Promise<Buffer> {
        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`Template not found at ${this.templatePath}`);
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(this.templatePath);

        const now = new Date();
        const dayNow = now.getDate().toString();
        const monthNow = now.toLocaleString('default', { month: 'long' });
        const yearNow = now.getFullYear().toString();

        const gTownProv = `${data.gTown || ''}, ${data.gProv || 'Nueva Vizcaya'}`;
        const bTownProv = `${data.bTown || ''}, ${data.bProv || 'Nueva Vizcaya'}`;
        const gFullAddr = `Brgy. , ${data.gBrgy || ''}, ${gTownProv}`;
        const bFullAddr = `Brgy. , ${data.bBrgy || ''}, ${bTownProv}`;

        // Handle Image
        if (data.coupleImagePath && fs.existsSync(data.coupleImagePath)) {
            const noticeSheet = workbook.getWorksheet('Notice');
            if (noticeSheet) {
                try {
                    const imageId = workbook.addImage({
                        filename: data.coupleImagePath,
                        extension: 'png', // Assuming PNG as handled in the route
                    });

                    // Positioning like Python: Cell T11
                    // 3.75cm height, 5.73cm width
                    // exceljs uses pixels or points depending on method. 
                    // Let's use extents (96 dpi based pixels)
                    noticeSheet.addImage(imageId, {
                        tl: { col: 19, row: 10 }, // T is column 20 (0-indexed is 19), 11 is row 11 (0-indexed is 10)
                        ext: {
                            width: (5.73 / 2.54) * 96,
                            height: (3.75 / 2.54) * 96
                        }
                    });
                } catch (error) {
                    console.error("Warning: Image overlay failed:", error);
                }
            }
        }

        // Set Notice as active (if it exists)
        // exceljs doesn't have a direct "active" property like openpyxl that works everywhere,
        // but we can set the view state.
        const noticeSheet = workbook.getWorksheet('Notice');
        if (noticeSheet) {
            noticeSheet.state = 'visible';
            // To make it the first tab shown, you'd usually move it to index 1, 
            // but exceljs doesn't support reordering easily without recreation.
            // We'll trust the template structure.
        }

        const appSheet = workbook.getWorksheet('APPLICATION');
        if (!appSheet) {
            throw new Error("Error: 'APPLICATION' sheet missing in template");
        }

        // --- GROOM MAPPING ---
        appSheet.getCell('B8').value = (data.gFirst || '').toUpperCase();
        appSheet.getCell('B9').value = (data.gMiddle || '').toUpperCase();
        appSheet.getCell('B10').value = (data.gLast || '').toUpperCase();
        appSheet.getCell('B11').value = data.gBday || '';
        appSheet.getCell('N11').value = data.gAge || 0;
        appSheet.getCell('B12').value = gTownProv;
        appSheet.getCell('L12').value = data.gCountry || 'Philippines';
        appSheet.getCell('B13').value = "Male";
        appSheet.getCell('H13').value = data.gCitizen || 'Filipino';
        appSheet.getCell('B15').value = gFullAddr;
        appSheet.getCell('M15').value = data.gCountry || 'Philippines';
        appSheet.getCell('B16').value = data.gReligion || '';
        appSheet.getCell('B17').value = data.gStatus || 'Single';

        // Parents & Givers (Groom)
        appSheet.getCell('B22').value = data.gFathF || '';
        appSheet.getCell('H22').value = data.gFathM || '';
        appSheet.getCell('L22').value = data.gFathL || '';
        appSheet.getCell('B26').value = data.gMothF || '';
        appSheet.getCell('G26').value = data.gMothM || '';
        appSheet.getCell('K26').value = data.gMothL || '';

        if (data.gAge >= 18 && data.gAge <= 24) {
            appSheet.getCell('B30').value = data.gGiverF || '';
            appSheet.getCell('H30').value = data.gGiverM || '';
            appSheet.getCell('L30').value = data.gGiverL || '';
            appSheet.getCell('B31').value = data.gGiverRelation || '';
            appSheet.getCell('B32').value = data.gCitizen || 'Filipino';
        }

        // --- BRIDE MAPPING ---
        appSheet.getCell('U8').value = (data.bFirst || '').toUpperCase();
        appSheet.getCell('U9').value = (data.bMiddle || '').toUpperCase();
        appSheet.getCell('U10').value = (data.bLast || '').toUpperCase();
        appSheet.getCell('U11').value = data.bBday || '';
        appSheet.getCell('AF11').value = data.bAge || 0;
        appSheet.getCell('U12').value = bTownProv;
        appSheet.getCell('AE12').value = data.bCountry || 'Philippines';
        appSheet.getCell('U13').value = "Female";
        appSheet.getCell('Z13').value = data.bCitizen || 'Filipino';
        appSheet.getCell('U15').value = bFullAddr;
        appSheet.getCell('AF15').value = data.bCountry || 'Philippines';
        appSheet.getCell('U16').value = data.bReligion || '';
        appSheet.getCell('U17').value = data.bStatus || 'Single';

        // Parents & Givers (Bride)
        appSheet.getCell('U22').value = data.bFathF || '';
        appSheet.getCell('Y22').value = data.bFathM || '';
        appSheet.getCell('AC22').value = data.bFathL || '';
        appSheet.getCell('U26').value = data.bMothF || '';
        appSheet.getCell('Y26').value = data.bMothM || '';
        appSheet.getCell('AD26').value = data.bMothL || '';

        if (data.bAge >= 18 && data.bAge <= 24) {
            appSheet.getCell('U30').value = data.bGiverF || '';
            appSheet.getCell('Y30').value = data.bGiverM || '';
            appSheet.getCell('AD30').value = data.bGiverL || '';
            appSheet.getCell('U31').value = data.bGiverRelation || '';
            appSheet.getCell('U32').value = data.bCitizen || 'Filipino';
        }

        // Common Footer
        appSheet.getCell('B37').value = dayNow;
        appSheet.getCell('U37').value = dayNow;
        appSheet.getCell('E37').value = monthNow;
        appSheet.getCell('W37').value = monthNow;
        appSheet.getCell('L37').value = yearNow;
        appSheet.getCell('AD37').value = yearNow;
        appSheet.getCell('B38').value = "Solano, Nueva Vizcaya";
        appSheet.getCell('U38').value = "Solano, Nueva Vizcaya";

        // --- SHEET VISIBILITY & DELETION LOGIC ---
        const isGroomExt = gTownProv !== "Solano, Nueva Vizcaya";
        const isBrideExt = bTownProv !== "Solano, Nueva Vizcaya";

        const sheetsToKeep = ["APPLICATION", "Notice"];

        let extraSheet: string | null = null;
        const gAge = data.gAge;
        const bAge = data.bAge;

        if (bAge >= 18 && bAge <= 20 && gAge >= 25) extraSheet = "CONSENT F";
        else if (gAge >= 18 && gAge <= 20 && bAge >= 25) extraSheet = "CONSENT M";
        else if (bAge >= 18 && bAge <= 20 && gAge >= 18 && gAge <= 20) extraSheet = "CONSENT M&F";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 25) extraSheet = "ADVICE F";
        else if (gAge >= 21 && gAge <= 24 && bAge >= 25) extraSheet = "ADVICE M";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 21 && gAge <= 24) extraSheet = "ADVICE M&F";
        else if (gAge >= 21 && gAge <= 24 && bAge >= 18 && bAge <= 20) extraSheet = "ADVICE M-CONSENT F";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 18 && gAge <= 20) extraSheet = "ADVICE F-CONSENT M";

        if (extraSheet) sheetsToKeep.push(extraSheet);
        if (isGroomExt || isBrideExt) {
            sheetsToKeep.push("AddressBACKnotice", "EnvelopeAddress");
        }

        // Delete unwanted sheets
        const sheetsToRemove: number[] = [];
        workbook.eachSheet((sheet) => {
            if (!sheetsToKeep.includes(sheet.name)) {
                sheetsToRemove.push(sheet.id);
            }
        });

        sheetsToRemove.forEach(id => {
            workbook.removeWorksheet(id);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
