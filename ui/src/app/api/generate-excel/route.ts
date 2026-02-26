import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createAdminClient } from "@/utils/supabase/server-utils";
import fs from "fs";
import os from "os";
import { ExcelGenerator } from "@/utils/excel/excel-generator";

export async function POST(req: NextRequest) {
    let tempImagePath: string | null = null;

    try {
        const body = await req.json();

        // 1. Handle Image Download (keep existing logic)
        if (body.applicationCode) {
            console.log("Attempting to download image for application code:", body.applicationCode);
            try {
                const supabase = createAdminClient();

                const { data: appData } = await supabase
                    .from("marriage_applications")
                    .select("id")
                    .eq("application_code", body.applicationCode.toUpperCase())
                    .single();

                let imagePath = null;

                if (appData?.id) {
                    const { data: photoData } = await supabase
                        .from("application_photos")
                        .select("file_path")
                        .eq("application_id", appData.id)
                        .single();

                    if (photoData?.file_path) {
                        imagePath = photoData.file_path;
                    }
                }

                if (!imagePath) {
                    imagePath = `${body.applicationCode.toUpperCase()}.jpg`;
                }

                const { data, error } = await supabase.storage
                    .from("marriage-license-files")
                    .download(imagePath);

                if (error) {
                    console.error("Error downloading image:", error);
                    // Try PNG fallback
                    const altPath = imagePath.replace(".jpg", ".png");
                    const { data: altData } = await supabase.storage
                        .from("marriage-license-files")
                        .download(altPath);
                    if (altData) await saveTempImage(altData);
                } else if (data) {
                    await saveTempImage(data);
                }

                async function saveTempImage(data: Blob) {
                    const tempDir = path.join(os.tmpdir(), "solano-mls");
                    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

                    tempImagePath = path.join(tempDir, `couple_${Date.now()}.png`);
                    const buffer = Buffer.from(await data.arrayBuffer());
                    fs.writeFileSync(tempImagePath, buffer);
                    body.coupleImagePath = tempImagePath;
                }
            } catch (imageError) {
                console.error("Error handling image download:", imageError);
            }
        }

        // 2. Generate Excel using the new Node.js generator
        const generator = new ExcelGenerator();
        const buffer = await generator.generate(body);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="MARRIAGE_APPLICATION_${body.applicationCode || 'DRAFT'}.xlsx"`,
            },
        });

    } catch (error: any) {
        console.error("Excel Generation Error:", error);
        return NextResponse.json({
            error: "Excel Generation Failed",
            details: error.message
        }, { status: 500 });
    } finally {
        // Cleanup temp image
        if (tempImagePath && fs.existsSync(tempImagePath)) {
            try {
                fs.unlinkSync(tempImagePath);
            } catch (cleanupError) {
                console.error("Error cleaning up temp image:", cleanupError);
            }
        }
    }
}
