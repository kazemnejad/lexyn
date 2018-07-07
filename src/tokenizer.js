const execFile = require('child_process').execFile;

function tokenize(src, dst) {
    const child = execFile('python3', ['src/python_lexer.py', src, dst], (error, stdout, stderr) => {
        if (error) {
            console.error('stderr', stderr);
            process.exit(0)
        }
        if (stdout.lenght > 0)
            console.log(stdout)
        
        console.log(`tokens are saved into ${dst}`)
    });
}

module.exports = {
    tokenize: tokenize
}