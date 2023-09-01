import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();

app.use(express.json());

app.post('/process-video', (req,res) => {
    // Get the file path of the input from the request body

    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        return res.status(400).send("Bad Request: Missing file path");
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is currently running on port ${port}` )
})