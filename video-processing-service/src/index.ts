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

    ffmpeg(inputFilePath)
    .outputOption('-vf', 'scale=trunc(oh*a/2)*2:360')
    .on('end', function() {
        console.log("processing finished successfully");
        res.status(200).send('processing finished successfully');
    })
    .on('error', function(err: any) {
        console.log('An erorr occurred ' + err.message);
        res.status(500).send("An error ocurred " + err.message);
    })

    .save(outputFilePath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is currently running on port ${port}` )
})