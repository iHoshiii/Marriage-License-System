import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Robustly handles image replacement in Supabase Storage.
 * It searches for files starting with the same code, deletes them,
 * and uploads the new file with its original extension.
 * 
 * @param supabase - Supabase client instance
 * @param file - The File object to upload
 * @param bucketName - Name of the storage bucket
 * @param employeeCode - Unique identifier (e.g., employee code or application code)
 */
export async function handleImageReplace(
    supabase: SupabaseClient,
    file: File,
    bucketName: string,
    employeeCode: string
) {
    console.log(`[Storage] Starting image replace for code: ${employeeCode} in bucket: ${bucketName}`);

    // Extract original extension
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${employeeCode}.${extension}`;

    try {
        // 1. Search for any existing files starting with the employeeCode
        // We use the search parameter which acts as a prefix filter in Supabase Storage
        const { data: existingFiles, error: listError } = await supabase.storage
            .from(bucketName)
            .list('', {
                search: employeeCode,
            });

        if (listError) {
            console.error(`[Storage] List error:`, listError);
            throw new Error(`Failed to list existing files: ${listError.message}`);
        }

        // 2. Identify files that strictly match the code (e.g., "12345.jpg", "12345.png")
        // This avoids deleting "123456.jpg" if we only wanted to delete "12345"
        const filesToDelete = existingFiles
            ?.filter(f => {
                const nameWithoutExt = f.name.substring(0, f.name.lastIndexOf('.'));
                return nameWithoutExt === employeeCode;
            })
            .map(f => f.name) || [];

        // 3. Selective Delete: Ensure deletion completes before upload
        if (filesToDelete.length > 0) {
            console.log(`[Storage] Deleting existing matching files:`, filesToDelete);
            const { error: removeError } = await supabase.storage
                .from(bucketName)
                .remove(filesToDelete);

            if (removeError) {
                console.error(`[Storage] Remove error:`, removeError);
                throw new Error(`Failed to delete existing files: ${removeError.message}`);
            }
            console.log(`[Storage] Successfully deleted old matching files.`);
        } else {
            console.log(`[Storage] No existing files found for code: ${employeeCode}`);
        }

        // 4. Clean Upload: Upload the new file with its original extension
        console.log(`[Storage] Uploading new file: ${fileName}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error(`[Storage] Upload error:`, uploadError);
            throw new Error(`Failed to upload new file: ${uploadError.message}`);
        }

        // 5. Cache Management: Force immediate UI refresh with timestamp
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uploadData.path);

        const bustedUrl = `${publicUrl}?t=${Date.now()}`;
        console.log(`[Storage] Replacement successful. Public URL: ${bustedUrl}`);

        return {
            success: true,
            path: uploadData.path,
            url: bustedUrl,
            fileName: fileName
        };

    } catch (error: any) {
        console.error(`[Storage] handleImageReplace critical failure:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}
