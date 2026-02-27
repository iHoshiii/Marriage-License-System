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

        // --- 1. HANDLE SHEET VISIBILITY ---
        // Ensure APPLICATION is visible and active
        const appSheet = workbook.getWorksheet('APPLICATION') || workbook.getWorksheet(1);
        workbook.eachSheet((sheet) => {
            if (sheetsToKeep.includes(sheet.name)) {
                sheet.state = 'visible';
            } else {
                sheet.state = 'hidden';
            }
        });

        // Set the active sheet to ensure Excel doesn't try to open a hidden sheet first
        if (appSheet) {
            appSheet.state = 'visible';
            workbook.views = [{
                x: 0, y: 0, width: 10000, height: 20000,
                firstSheet: 0, activeTab: appSheet.id - 1, visibility: 'visible'
            }];
        }

        // --- 2. FILL APPLICATION SHEET ---
        if (appSheet) {
            // Groom
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

            // Father: B22, H22, L22
            appSheet.getCell('B22').value = data.gFathF || '';
            appSheet.getCell('H22').value = data.gFathM || '';
            appSheet.getCell('L22').value = data.gFathL || '';

            // Mother: B26, H26, L26
            appSheet.getCell('B26').value = data.gMothF || '';
            appSheet.getCell('H26').value = data.gMothM || '';
            appSheet.getCell('L26').value = data.gMothL || '';

            // Giver display (Advice/Consent)
            // If data exists, show it, otherwise check age
            const hasGroomGiver = !!(data.gGiverF || data.gGiverL);
            if (hasGroomGiver || (gAge >= 18 && gAge <= 24)) {
                appSheet.getCell('B30').value = data.gGiverF || '';
                appSheet.getCell('H30').value = data.gGiverM || '';
                appSheet.getCell('L30').value = data.gGiverL || '';
                appSheet.getCell('B31').value = data.gGiverRelation || '';
                appSheet.getCell('B32').value = data.gCitizen || 'Filipino';
            }

            // Bride
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

            // Father: U22, Y22, AC22
            appSheet.getCell('U22').value = data.bFathF || '';
            appSheet.getCell('Y22').value = data.bFathM || '';
            appSheet.getCell('AC22').value = data.bFathL || '';

            // Mother: U26, Y26, AD26
            appSheet.getCell('U26').value = data.bMothF || '';
            appSheet.getCell('Y26').value = data.bMothM || '';
            appSheet.getCell('AD26').value = data.bMothL || '';

            const hasBrideGiver = !!(data.bGiverF || data.bGiverL);
            if (hasBrideGiver || (bAge >= 18 && bAge <= 24)) {
                appSheet.getCell('U30').value = data.bGiverF || '';
                appSheet.getCell('Y30').value = data.bGiverM || '';
                appSheet.getCell('AD30').value = data.bGiverL || '';
                appSheet.getCell('U31').value = data.bGiverRelation || '';
                appSheet.getCell('U32').value = data.bCitizen || 'Filipino';
            }

            // Footer
            appSheet.getCell('B37').value = dayNow;
            appSheet.getCell('U37').value = dayNow;
            appSheet.getCell('E37').value = monthNow;
            appSheet.getCell('W37').value = monthNow;
            appSheet.getCell('L37').value = yearNow;
            appSheet.getCell('AD37').value = yearNow;
            appSheet.getCell('B38').value = "Solano, Nueva Vizcaya";
            appSheet.getCell('U38').value = "Solano, Nueva Vizcaya";
        }

        // --- 4. HANDLE IMAGE (LAST TO PRESERVE RELATIONSHIPS) ---
        if (data.coupleImagePath && fs.existsSync(data.coupleImagePath)) {
            const noticeSheet = workbook.getWorksheet('Notice');
            if (noticeSheet) {
                try {
                    let ext = (data.imageExtension || 'png').toLowerCase();
                    if (ext === 'jpg') ext = 'jpeg';
                    if (ext === 'jpeg' || ext === 'png' || ext === 'gif') {
                        const imageId = workbook.addImage({
                            filename: data.coupleImagePath,
                            extension: ext as any,
                        });

                        noticeSheet.addImage(imageId, {
                            tl: { col: 19, row: 10 } as any,
                            br: { col: 21, row: 14 } as any,
                            editAs: 'oneCell'
                        });
                    }
                } catch (error) {
                    console.error("Warning: Image overlay failed:", error);
                }
            }
        }

        // --- 5. FINALIZE ---
        // Ensure at least one workbook view exists
        if (!workbook.views || workbook.views.length === 0) {
            workbook.views = [{ x: 0, y: 0, width: 10000, height: 20000, firstSheet: 0, activeTab: 0, visibility: 'visible' }];
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
