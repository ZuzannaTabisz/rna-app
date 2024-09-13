const express = require('express');
const Docker = require('dockerode');
const path = require('path');
const app = express();
const port = 3000;
const docker = new Docker();

app.use(express.json());

// Endpoint to start a container and run a script
app.post('/run-script', async (req, res) => {
    const { scriptName, args } = req.body;
    console.log('Received request to run script:', scriptName, 'with args:', args);

    try {
        // Create a Docker container
        const container = await docker.createContainer({
            Image: 'my-rna-app', // Replace with your Docker image name
            Cmd: scriptName === 'run-all' 
                ? ['bash', '-c', '01-RNApdist && 02-RNAfold && 03-RNAdistance && 04-RNAplot'] 
                : [scriptName, ...(args || [])],
            Tty: false, // Disable Tty for non-interactive commands
            HostConfig: {
                Binds: [
                    `${path.join(__dirname, 'files')}:/usr/local/bin/files` // Map local directory to container directory
                ]
            }
        });

        console.log('Container created:', container.id);

        // Start the container
        await container.start();
        console.log('Container started');

        // Wait for the container to finish executing
        const containerWait = await container.wait();
        console.log('Container wait result:', containerWait);

        // Get logs from the container
        const logs = await container.logs({stdout: true, stderr: true});
        
        let logData = '';
        logs.on('data', (data) => {
            logData += data.toString();
            console.log('Log data:', data.toString());
        });

        logs.on('end', async () => {
            console.log('Logs finished:', logData);

            await container.stop();
            console.log('Container stopped');

            await container.remove();
            console.log('Container removed');

            // Define the result files path
            const resultFiles = [
                'RNApdist-result.txt',
                'wt-dotbracket.txt',
                'mut-dotbracket.txt',
                'RNAdistance-result.txt',
                'RNAdistance-backtrack.txt',
                'mut-dotbracket.svg',
                'wt-dotbracket.svg'
            ];

            // Generate file paths
            const fileLinks = resultFiles.map(file => `http://localhost:3000/files/${file}`);

            res.status(200).json({
                message: 'Script executed',
                logs: logData,
                files: fileLinks
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error running script');
    }
});

// Serve result files
app.use('/files', express.static(path.join(__dirname, 'files')));

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
