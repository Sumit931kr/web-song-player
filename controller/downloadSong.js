const { spawn } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');  // Add this line
const path = require('path');
const os = require('os');

// Recursive function to remove directory contents with retries
const removeDirectoryContents = async (directory, retries = 3) => {
    try {
        const files = await fs.readdir(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                await removeDirectoryContents(filePath);
                await fs.rmdir(filePath);
            } else {
                await fs.unlink(filePath);
            }
        }
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying directory cleanup. Attempts left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            await removeDirectoryContents(directory, retries - 1);
        } else {
            throw error;
        }
    }
};

const downloadSong = async (req, res) => {
    let tempDir = '';
    try {
        const { songUrl } = req.body;
        console.log(`Downloading and streaming: ${songUrl}`);

        // Create a temporary directory
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'spotdl-'));
        console.log(`Temporary directory: ${tempDir}`);

        // Check write permissions
        try {
            await fs.access(tempDir, fs.constants.W_OK);
            console.log('Write permission granted to temp directory');
        } catch (err) {
            console.error('No write permission to temp directory');
            res.status(500).json({ error: 'No write permission to temp directory' });
            return;
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Spawn spotdl process
        const spotdl = spawn('spotdl', [songUrl, '--output', tempDir]);

        let stdoutOutput = '';
        let stderrOutput = '';

        spotdl.stdout.on('data', (data) => {
            stdoutOutput += data.toString();
            console.log(`spotdl stdout: ${data}`);
        });

        spotdl.stderr.on('data', (data) => {
            stderrOutput += data.toString();
            console.error(`spotdl stderr: ${data}`);
        });

        spotdl.on('close', async (code) => {
            console.log(`spotdl process exited with code ${code}`);
            console.log(`Full stdout output:\n${stdoutOutput}`);
            console.log(`Full stderr output:\n${stderrOutput}`);

            if (code !== 0) {
                console.error(`spotdl process failed`);
                res.status(500).json({ error: 'spotdl process failed', stdout: stdoutOutput, stderr: stderrOutput });
                return;
            }

            // Add a delay before checking the file
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                // Check if any mp3 file exists in the directory
                const files = await fs.readdir(tempDir);
                const mp3File = files.find(file => file.endsWith('.mp3'));

                if (!mp3File) {
                    console.error('No audio file found');
                    res.status(404).json({ error: 'No audio file found', stdout: stdoutOutput, stderr: stderrOutput });
                    return;
                }

                const filePath = path.join(tempDir, mp3File);
                const stats = await fs.stat(filePath);
                console.log(`File found: ${filePath}`);
                console.log(`File size: ${stats.size} bytes`);

                if (stats.size === 0) {
                    console.error('Audio file is empty');
                    res.status(404).json({ error: 'Audio file is empty', stdout: stdoutOutput, stderr: stderrOutput });
                    return;
                }

                // Stream the file to the client
                const fileStream = fsSync.createReadStream(filePath);  // Use fsSync here
                fileStream.pipe(res);

                fileStream.on('end', async () => {
                    console.log('Streaming complete');
                    // Add a delay before cleanup
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    // Clean up: delete the temporary file and directory
                    try {
                        await removeDirectoryContents(tempDir);
                        await fs.rmdir(tempDir);
                        console.log('Temporary directory cleaned up successfully');
                    } catch (err) {
                        console.error('Error cleaning up temporary directory:', err);
                    }
                });
            } catch (error) {
                console.error('Error processing file:', error);
                res.status(500).json({ error: 'Error processing file' });
            }
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
        // Attempt to clean up the temporary directory in case of an error
        if (tempDir) {
            try {
                await removeDirectoryContents(tempDir);
                await fs.rmdir(tempDir);
                console.log('Temporary directory cleaned up successfully');
            } catch (err) {
                console.error('Error cleaning up temporary directory:', err);
            }
        }
    }
};

module.exports = {downloadSong};

