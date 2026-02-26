import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { createClient } from "@/utils/supabase/server-utils";
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
                const supabase = await createClient();
                if (!supabase) {
                    console.error("Failed to create Supabase client");
                    throw new Error("Failed to create Supabase client");
                }

                // Construct the image path: marriage-license-files/{application_code}.jpg
                const imagePath = `${body.applicationCode.toUpperCase()}.jpg`;
                console.log("Constructed image path:", imagePath);

                // Download the image from Supabase storage
                const { data, error } = await supabase.storage
                    .from("marriage-license-files")
                    .download(imagePath);

                if (error) {
                    console.error("Error downloading image from Supabase:", error);
                    console.error("Error details:", error.message, error.statusCode);
                    // Continue without image - will use placeholder
                } else {
                    console.log("Successfully downloaded image from Supabase");
                    // Save to temporary file in system temp directory
                    const tempDir = path.join(os.tmpdir(), "solano-mls");
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                    }

                    tempImagePath = path.join(tempDir, `couple_${Date.now()}.png`);
                    const buffer = Buffer.from(await data.arrayBuffer());
                    fs.writeFileSync(tempImagePath, buffer);
                    console.log("Saved image to temporary file:", tempImagePath);

                    // Update the body to use the temporary image path
                    body.coupleImagePath = tempImagePath;
                }
            } catch (imageError) {
                console.error("Error handling image download:", imageError);
                // Continue without image
            }
        } else {
            console.log("No application code provided, skipping image download");
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
                errorData += data.toString();
            });

            pythonProcess.on("close", (code) => {
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
