import { Subject } from "rxjs";

var spawn = require('child_process').spawn;

//kick off process of listing files
var child = spawn('tail', ['--lines', '0', '-F', '/home/shobhitg/.factorio/factorio-current.log']);

export const readStreamObservable: Subject<string> = new Subject();

//spit stdout to screen
child.stdout.on('data', function (data: any) {   readStreamObservable.next(data.toString());  });

//spit stderr to screen
child.stderr.on('data', function (data: any) {   process.stdout.write(data.toString());  });

child.on('close', function (code:any) { 
    console.log("Finished with code " + code);
});

