import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "sl-yt-raw-videos";
const processedVideoBucketName = "sl-yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/** 
 * Creates the local directories for raw and processed videos.
 */

export function setUpDirectories() {
     ensureDirectoryExistences(localRawVideoPath);
     ensureDirectoryExistences(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */


export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject)  => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOption('-vf', 'scale=trunc(oh*a/2)*2:360')
        .on('end', function() {
            console.log("Processing finished successfully");
            resolve();
        })
        .on('error', function(err: any) {
            console.log('An erorr occurred ' + err.message);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

/**
 * @param fileName - The name of the file to download from the
 * {@link rawVideoBucketName} - bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded. 
 */

export async function downloadRawVideo(fileName: string) {
   await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({destination: `${localRawVideoPath}/${fileName}`});

    console.log(
        `gs://${rawVideoBucketName}/${fileName} download to ${localRawVideoPath}/${fileName}.`
    )
}


/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */

export async function uploadProcessedVideo(fileName: string) { 
    const bucket = storage.bucket(processedVideoBucketName);

   await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    );

    await bucket.file(fileName).makePublic();


    /** 
     * @param fileName - the file name of the file to delete from the 
     * {@link localRawVideoPath} folder
     * @returns A promise that resolves when the file has been deleted.
     */

        export function deleteRawVideo(fileName: string) {
        return deleteFile(`${localRawVideoPath}/${fileName}`);
    }

    /**
     * @param fileName - the file name of the file to delete from the 
     * {@link localProcessedVideoPath} folder 
     * @returns A promise that resolves when the file has been deleted. 
     */

    export function deleteProcessedVideo(fileName: string) {
        return deleteFile(`${localProcessedVideoPath}/${fileName}`)
    }


    /**
     * @param filePath - The path of the file to delete.
     * @returns A promise that resolves when the file has been deleted.
     */

    function deleteFile(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(`Failed to delete file at ${filePath}`, err);
                        reject(err);
                    } else {
                        console.log(`Filed deleted at ${filePath}`);
                        resolve();
                    }
                });
            } else {
                console.log(`File was not found at ${filePath}, skipping delete.`);
                resolve();
            }
        })
    }
}

function ensureDirectoryExistences(dirPath: string) {
    if(!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true});
        console.log(`Directory created at ${dirPath}`);
    }
}