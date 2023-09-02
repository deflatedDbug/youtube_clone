import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { setUpDirectories, uploadProcessedVideo } from './storage';
import { downloadRawVideo } from './storage';

setUpDirectories();
const app = express();

app.use(express.json());

app.post('/process-video', async (req, res) => {
    // Get bucket and filename from the Cloud Pub/Sub message
 
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);
    
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is currently running on port ${port}`)
})