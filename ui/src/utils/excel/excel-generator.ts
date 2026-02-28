import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { ExcelData } from './types';

export class ExcelGenerator {
    private templatePath: string;

    constructor() {
        this.templatePath = path.join(process.cwd(), "src", "assets", "excel", "template.xlsx");
    }

    private cmToPoints(cm: number): number {
        return (cm / 2.54) * 96;
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

        // --- PREPARE DATA ---
        const gTownProv = `${data.gTown || ''}, ${data.gProv || 'Nueva Vizcaya'}`;
        const bTownProv = `${data.bTown || ''}, ${data.bProv || 'Nueva Vizcaya'}`;
        const gFullAddr = `Brgy. , ${data.gBrgy || ''}, ${gTownProv}`;
        const bFullAddr = `Brgy. , ${data.bBrgy || ''}, ${bTownProv}`;

        // --- SHEET VISIBILITY & DELETION LOGIC ---
        const sheetsToKeep = ["APPLICATION", "Notice"];
        const gAge = data.gAge;
        const bAge = data.bAge;

        let extraSheet: string | null = null;
        if (bAge >= 18 && bAge <= 20 && gAge >= 25) extraSheet = "CONSENT F";
        else if (gAge >= 18 && gAge <= 20 && bAge >= 25) extraSheet = "CONSENT M";
        else if (bAge >= 18 && bAge <= 20 && gAge >= 18 && gAge <= 20) extraSheet = "CONSENT M&F";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 25) extraSheet = "ADVICE F";
        else if (gAge >= 21 && gAge <= 24 && bAge >= 25) extraSheet = "ADVICE M";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 21 && gAge <= 24) extraSheet = "ADVICE M&F";
        else if (gAge >= 21 && gAge <= 24 && bAge >= 18 && bAge <= 20) extraSheet = "ADVICE M-CONSENT F";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 18 && gAge <= 20) extraSheet = "ADVICE F-CONSENT M";

        if (extraSheet) sheetsToKeep.push(extraSheet);
        if (gTownProv !== "Solano, Nueva Vizcaya" || bTownProv !== "Solano, Nueva Vizcaya") {
            sheetsToKeep.push("AddressBACKnotice", "EnvelopeAddress");
        }

        // --- 1. PHYSICAL DELETION LOGIC ---
        // We iterate backwards through the sheets to avoid index shifting issues during deletion
        for (let i = workbook.worksheets.length - 1; i >= 0; i--) {
            const sheet = workbook.worksheets[i];
            if (!sheetsToKeep.includes(sheet.name)) {
                workbook.removeWorksheet(sheet.id);
            }
        }

        const appSheet = workbook.getWorksheet('APPLICATION') || workbook.getWorksheet(1);
        const appSheetIndex = workbook.worksheets.findIndex(s => s.name === 'APPLICATION');

        if (appSheet) {
            // Set the remaining sheets to visible (though they should be by default)
            appSheet.state = 'visible';
            const workbookViews: any[] = [{
                x: 0,
                y: 0,
                width: 29040,
                height: 15720,
                firstSheet: 0,
                activeTab: appSheetIndex >= 0 ? appSheetIndex : 0,
                visibility: 'visible'
            }];
        }

        const safeVal = (val: any): string => (val === null || val === undefined) ? "" : val.toString();

        // --- 2. FILL APPLICATION SHEET ---
        if (appSheet) {
            // Groom
            appSheet.getCell('B8').value = safeVal(data.gFirst).toUpperCase();
            appSheet.getCell('B9').value = safeVal(data.gMiddle).toUpperCase();
            appSheet.getCell('B10').value = safeVal(data.gLast).toUpperCase();
            appSheet.getCell('B11').value = safeVal(data.gBday);
            appSheet.getCell('N11').value = data.gAge || 0;
            appSheet.getCell('B12').value = safeVal(gTownProv);

            const gCountryVal = safeVal(data.gCountry) || 'Philippines';
            appSheet.getCell('L12').value = gCountryVal;

            appSheet.getCell('B13').value = "Male";
            appSheet.getCell('H13').value = safeVal(data.gCitizen) || 'Filipino';
            appSheet.getCell('B15').value = safeVal(gFullAddr);
            appSheet.getCell('M15').value = gCountryVal;
            appSheet.getCell('B16').value = safeVal(data.gReligion);
            appSheet.getCell('B17').value = safeVal(data.gStatus) || 'Single';

            appSheet.getCell('B22').value = safeVal(data.gFathF);
            appSheet.getCell('H22').value = safeVal(data.gFathM);
            appSheet.getCell('L22').value = safeVal(data.gFathL);

            appSheet.getCell('B26').value = safeVal(data.gMothF);
            appSheet.getCell('G26').value = safeVal(data.gMothM);
            appSheet.getCell('K26').value = safeVal(data.gMothL);

            const hasGroomGiver = !!(data.gGiverF || data.gGiverL);
            if (hasGroomGiver || (gAge >= 18 && gAge <= 24)) {
                appSheet.getCell('B30').value = safeVal(data.gGiverF);
                appSheet.getCell('H30').value = safeVal(data.gGiverM);
                appSheet.getCell('L30').value = safeVal(data.gGiverL);
                appSheet.getCell('B31').value = safeVal(data.gGiverRelation);
                appSheet.getCell('B32').value = safeVal(data.gCitizen) || 'Filipino';
            }

            // Bride
            appSheet.getCell('U8').value = safeVal(data.bFirst).toUpperCase();
            appSheet.getCell('U9').value = safeVal(data.bMiddle).toUpperCase();
            appSheet.getCell('U10').value = safeVal(data.bLast).toUpperCase();
            appSheet.getCell('U11').value = safeVal(data.bBday);
            appSheet.getCell('AF11').value = data.bAge || 0;
            appSheet.getCell('U12').value = safeVal(bTownProv);

            const bCountryVal = safeVal(data.bCountry) || 'Philippines';
            appSheet.getCell('AE12').value = bCountryVal;

            appSheet.getCell('U13').value = "Female";
            appSheet.getCell('Z13').value = safeVal(data.bCitizen) || 'Filipino';
            appSheet.getCell('U15').value = safeVal(bFullAddr);
            appSheet.getCell('AF15').value = bCountryVal;
            appSheet.getCell('U16').value = safeVal(data.bReligion);
            appSheet.getCell('U17').value = safeVal(data.bStatus) || 'Single';

            appSheet.getCell('U22').value = safeVal(data.bFathF);
            appSheet.getCell('Y22').value = safeVal(data.bFathM);
            appSheet.getCell('AC22').value = safeVal(data.bFathL);

            appSheet.getCell('U26').value = safeVal(data.bMothF);
            appSheet.getCell('Y26').value = safeVal(data.bMothM);
            appSheet.getCell('AD26').value = safeVal(data.bMothL);

            const hasBrideGiver = !!(data.bGiverF || data.bGiverL);
            if (hasBrideGiver || (bAge >= 18 && bAge <= 24)) {
                appSheet.getCell('U30').value = safeVal(data.bGiverF);
                appSheet.getCell('Y30').value = safeVal(data.bGiverM);
                appSheet.getCell('AD30').value = safeVal(data.bGiverL);
                appSheet.getCell('U31').value = safeVal(data.bGiverRelation);
                appSheet.getCell('U32').value = safeVal(data.bCitizen) || 'Filipino';
            }

            appSheet.getCell('B37').value = safeVal(dayNow);
            appSheet.getCell('U37').value = safeVal(dayNow);
            appSheet.getCell('E37').value = safeVal(monthNow);
            appSheet.getCell('W37').value = safeVal(monthNow);
            appSheet.getCell('L37').value = safeVal(yearNow);
            appSheet.getCell('AD37').value = safeVal(yearNow);
            appSheet.getCell('B38').value = "Solano, Nueva Vizcaya";
            appSheet.getCell('U38').value = "Solano, Nueva Vizcaya";
        }

        // --- 4. HANDLE IMAGE REPLACEMENT ---
        if (data.coupleImagePath && fs.existsSync(data.coupleImagePath)) {
            const noticeSheet = workbook.getWorksheet('Notice');
            if (noticeSheet) {
                try {
                    let ext = (data.imageExtension || 'png').toLowerCase();
                    if (ext === 'jpg') ext = 'jpeg';

                    if (['jpeg', 'png', 'gif'].includes(ext)) {
                        const imageId = workbook.addImage({
                            filename: data.coupleImagePath,
                            extension: ext as any,
                        });

                        // Anchor coordinates for U11: col index 20, row index 10
                        noticeSheet.addImage(imageId, {
                            tl: { col: 20, row: 10 } as any,
                            ext: { cx: 2057400, cy: 1343025 } as any,
                            editAs: 'oneCell'
                        });
                    }
                } catch (error) {
                    console.error("Warning: Photo insertion failed:", error);
                }
            }
        }

        // --- 5. FINALIZE ---
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}