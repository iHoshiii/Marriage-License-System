import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { createAdminClient } from "@/utils/supabase/server-utils";
import fs from "fs";
import os from "os";

export async function POST(req: NextRequest) {
    let tempImagePath: string | null = null;

    try {
        const body = await req.json();
        const scriptPath = path.join(process.cwd(), "..", "necessary", "convert_to_excel.py");

        // Check if we have an application code to download the couple image
        if (body.applicationCode) {
            console.log("Attempting to download image for application code:", body.applicationCode);
            try {
                // Use Admin client to bypass RLS and ensure we can access storage
                const supabase = createAdminClient();

                // 1. Get the application ID first
                const { data: appData, error: appError } = await supabase
                    .from("marriage_applications")
                    .select("id")
                    .eq("application_code", body.applicationCode.toUpperCase())
                    .single();

                let imagePath = null;

                if (appData?.id) {
                    // 2. Get the actual file path from application_photos table
                    const { data: photoData, error: photoError } = await supabase
                        .from("application_photos")
                        .select("file_path")
                        .eq("application_id", appData.id)
                        .single();

                    if (photoData?.file_path) {
                        imagePath = photoData.file_path;
                        console.log("Found photo record in DB:", imagePath);
                    }
                }

                // 3. If not found in DB, fallback to the default naming convention
                if (!imagePath) {
                    console.log("No photo record found in DB, falling back to default convention (CODE.jpg)");
                    imagePath = `${body.applicationCode.toUpperCase()}.jpg`;
                }

                console.log("Downloading image from storage path:", imagePath);

                // Download the image from Supabase storage
                const { data, error } = await supabase.storage
                    .from("marriage-license-files")
                    .download(imagePath);

                if (error) {
                    console.error("Error downloading image from Supabase:", error);
                    // Try another fallback with .png if we were using fallback or if the DB path failed
                    if (imagePath.endsWith(".jpg") || !imagePath.includes(".")) {
                        const altPath = imagePath.includes(".") ? imagePath.replace(".jpg", ".png") : `${imagePath}.png`;
                        console.log("Retrying with alternative fallback:", altPath);
                        const { data: altData, error: altError } = await supabase.storage
                            .from("marriage-license-files")
                            .download(altPath);

                        if (!altError && altData) {
                            await saveTempImage(altData);
                        } else if (altError) {
                            console.error("Alternative download also failed:", altError);
                        }
                    }
                } else if (data) {
                    await saveTempImage(data);
                }

                async function saveTempImage(data: Blob) {
                    console.log("Successfully downloaded image from Supabase");
                    const tempDir = path.join(os.tmpdir(), "solano-mls");
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                    }

                    // Always save as PNG locally for the Python script to handle easily
                    // we use .png as a generic container for Pillow to load
                    tempImagePath = path.join(tempDir, `couple_${Date.now()}.png`);
                    const buffer = Buffer.from(await data.arrayBuffer());
                    fs.writeFileSync(tempImagePath, buffer);
                    console.log("Saved image to temporary file:", tempImagePath);
                    body.coupleImagePath = tempImagePath;
                }
            } catch (imageError) {
                console.error("Error handling image download:", imageError);
            }
        }

        return new Promise<NextResponse>((resolve) => {
            const pythonProcess = spawn("python3", [scriptPath]);

            let buffers: Buffer[] = [];
            let errorData = "";

            pythonProcess.stdin.write(JSON.stringify(body));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on("data", (data) => {
                buffers.push(data);
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error(`Python Stderr: ${data}`);
                errorData += data.toString();
            });

            pythonProcess.on("close", (code) => {
                console.log(`Python process closed with code ${code}`);
                // Clean up temporary image file
                if (tempImagePath && fs.existsSync(tempImagePath)) {
                    try {
                        fs.unlinkSync(tempImagePath);
                    } catch (cleanupError) {
                        console.error("Error cleaning up temp image:", cleanupError);
                    }
                }

                if (code !== 0) {
                    console.error("Python error:", errorData);
                    const errorMessage = errorData || "Python process exited with non-zero code";
                    resolve(NextResponse.json({
                        error: "Excel Generation Failed",
                        details: errorMessage,
                        code: code
                    }, { status: 500 }));
                } else {
                    const resultBuffer = Buffer.concat(buffers);
                    if (resultBuffer.length === 0) {
                        resolve(NextResponse.json({
                            error: "Excel Generation Failed",
                            details: "Generated file is empty. Check Python stderr for warnings."
                        }, { status: 500 }));
                        return;
                    }
                    resolve(new NextResponse(resultBuffer, {
                        status: 200,
                        headers: {
                            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "Content-Disposition": `attachment; filename="MARRIAGE_APPLICATION_${body.applicationCode || 'DRAFT'}.xlsx"`,
                        },
                    }));
                }
            });
        });
    } catch (error: any) {
        // Clean up temporary image file in case of error
        if (tempImagePath && fs.existsSync(tempImagePath)) {
            try {
                fs.unlinkSync(tempImagePath);
            } catch (cleanupError) {
                console.error("Error cleaning up temp image:", cleanupError);
            }
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
