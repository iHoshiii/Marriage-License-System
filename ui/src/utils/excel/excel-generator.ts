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

    // Essential to prevent "Cell Information" errors caused by illegal XML chars
    private sanitize(val: any): string {
        if (val === null || val === undefined) return "";
        return val.toString().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
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

        // LOGIC FOR SHEETS
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

        // --- 1. USE HIDING INSTEAD OF DELETION ---
        // Physical deletion is likely what is breaking your specific template's XML
        workbook.worksheets.forEach(sheet => {
            if (!sheetsToKeep.includes(sheet.name)) {
                sheet.state = 'veryHidden'; // Keeps it away from users without breaking references
            } else {
                sheet.state = 'visible';
            }
        });

        const appSheet = workbook.getWorksheet('APPLICATION') || workbook.getWorksheet(1);

        // --- 2. FILL DATA (USING YOUR ORIGINAL PATHING) ---
        if (appSheet) {
            appSheet.getCell('B8').value = this.sanitize(data.gFirst).toUpperCase();
            appSheet.getCell('B9').value = this.sanitize(data.gMiddle).toUpperCase();
            appSheet.getCell('B10').value = this.sanitize(data.gLast).toUpperCase();
            appSheet.getCell('B11').value = this.sanitize(data.gBday);
            appSheet.getCell('N11').value = data.gAge || 0;
            appSheet.getCell('B12').value = this.sanitize(gTownProv);

            const gCountryVal = this.sanitize(data.gCountry) || 'Philippines';
            appSheet.getCell('L12').value = gCountryVal;
            appSheet.getCell('B13').value = "Male";
            appSheet.getCell('H13').value = this.sanitize(data.gCitizen) || 'Filipino';
            appSheet.getCell('B15').value = this.sanitize(gFullAddr);
            appSheet.getCell('M15').value = gCountryVal;
            appSheet.getCell('B16').value = this.sanitize(data.gReligion);
            appSheet.getCell('B17').value = this.sanitize(data.gStatus) || 'Single';

            appSheet.getCell('B22').value = this.sanitize(data.gFathF);
            appSheet.getCell('H22').value = this.sanitize(data.gFathM);
            appSheet.getCell('L22').value = this.sanitize(data.gFathL);

            appSheet.getCell('B26').value = this.sanitize(data.gMothF);
            appSheet.getCell('G26').value = this.sanitize(data.gMothM);
            appSheet.getCell('K26').value = this.sanitize(data.gMothL);

            const hasGroomGiver = !!(data.gGiverF || data.gGiverL);
            if (hasGroomGiver || (gAge >= 18 && gAge <= 24)) {
                appSheet.getCell('B30').value = this.sanitize(data.gGiverF);
                appSheet.getCell('H30').value = this.sanitize(data.gGiverM);
                appSheet.getCell('L30').value = this.sanitize(data.gGiverL);

                const gRel = data.gGiverRelation === "Other" ? data.gGiverOtherTitle : data.gGiverRelation;
                appSheet.getCell('B31').value = this.sanitize(gRel);
                appSheet.getCell('B32').value = this.sanitize(data.gCitizen) || 'Filipino';
            } else {
                // Clear if not applicable (removes template placeholders)
                appSheet.getCell('B30').value = "";
                appSheet.getCell('H30').value = "";
                appSheet.getCell('L30').value = "";
                appSheet.getCell('B31').value = "";
                appSheet.getCell('B32').value = "";
            }

            // Bride
            appSheet.getCell('U8').value = this.sanitize(data.bFirst).toUpperCase();
            appSheet.getCell('U9').value = this.sanitize(data.bMiddle).toUpperCase();
            appSheet.getCell('U10').value = this.sanitize(data.bLast).toUpperCase();
            appSheet.getCell('U11').value = this.sanitize(data.bBday);
            appSheet.getCell('AF11').value = data.bAge || 0;
            appSheet.getCell('U12').value = this.sanitize(bTownProv);

            const bCountryVal = this.sanitize(data.bCountry) || 'Philippines';
            appSheet.getCell('AE12').value = bCountryVal;
            appSheet.getCell('U13').value = "Female";
            appSheet.getCell('Z13').value = this.sanitize(data.bCitizen) || 'Filipino';
            appSheet.getCell('U15').value = this.sanitize(bFullAddr);
            appSheet.getCell('AF15').value = bCountryVal;
            appSheet.getCell('U16').value = this.sanitize(data.bReligion);
            appSheet.getCell('U17').value = this.sanitize(data.bStatus) || 'Single';

            appSheet.getCell('U22').value = this.sanitize(data.bFathF);
            appSheet.getCell('Y22').value = this.sanitize(data.bFathM);
            appSheet.getCell('AC22').value = this.sanitize(data.bFathL);

            appSheet.getCell('U26').value = this.sanitize(data.bMothF);
            appSheet.getCell('Y26').value = this.sanitize(data.bMothM);
            appSheet.getCell('AD26').value = this.sanitize(data.bMothL);

            const hasBrideGiver = !!(data.bGiverF || data.bGiverL);
            if (hasBrideGiver || (bAge >= 18 && bAge <= 24)) {
                appSheet.getCell('U30').value = this.sanitize(data.bGiverF);
                appSheet.getCell('Y30').value = this.sanitize(data.bGiverM);
                appSheet.getCell('AD30').value = this.sanitize(data.bGiverL);

                const bRel = data.bGiverRelation === "Other" ? data.bGiverOtherTitle : data.bGiverRelation;
                appSheet.getCell('U31').value = this.sanitize(bRel);
                appSheet.getCell('U32').value = this.sanitize(data.bCitizen) || 'Filipino';
            } else {
                // Clear if not applicable (removes template placeholders)
                appSheet.getCell('U30').value = "";
                appSheet.getCell('Y30').value = "";
                appSheet.getCell('AD30').value = "";
                appSheet.getCell('U31').value = "";
                appSheet.getCell('U32').value = "";
            }

            appSheet.getCell('F5').value = this.sanitize(dayNow);
            appSheet.getCell('B37').value = this.sanitize(dayNow);
            appSheet.getCell('U37').value = this.sanitize(dayNow);
            appSheet.getCell('G5').value = this.sanitize(monthNow);
            appSheet.getCell('E37').value = this.sanitize(monthNow);
            appSheet.getCell('W37').value = this.sanitize(monthNow);
            appSheet.getCell('L5').value = this.sanitize(yearNow);
            appSheet.getCell('L37').value = this.sanitize(yearNow);
            appSheet.getCell('AD37').value = this.sanitize(yearNow);
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
                        noticeSheet.addImage(imageId, {
                            tl: { col: 20, row: 10 } as any,
                            ext: { cx: 2057400, cy: 1343025 } as any,
                            editAs: 'oneCell'
                        });
                    }
                } catch (error) {
                    console.error("Photo error:", error);
                }
            }
        }

        // --- 5. CRITICAL WORKBOOK METADATA RESET ---
        // This clears the "broken" view data that often causes the recovery log error
        workbook.views = [
            {
                x: 0, y: 0, width: 10000, height: 20000,
                firstSheet: 0, activeTab: 0, visibility: 'visible'
            }
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}