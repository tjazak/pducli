const apcPdu = require('./lib/apc-pdu-snmp');
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')
const optionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean, description: 'Display this usage guide.' },
    { name: 'ip', alias: 'i', type: String, multiple: false, defaultOption: true, description: 'pdu ip address' },
    { name: 'outlet', alias: 'o', type: Number, multiple: false, description: 'outlet number' },
    { name: 'cycle', alias: 'c', type: Boolean, description: 'cycle power off and on for outlet' },
    { name: 'power', alias: 'p', type: Number, description: '0|1 turns power off and on for outlet' },
];
const options = commandLineArgs(optionDefinitions)


if (options.help) {
    const usage = commandLineUsage([
        {
            header: 'Typical Example',
            content: ['powercycle -o 1 -c 192.168.1.110',
            'powercycle -o 1 -p 1 192.168.1.110']
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        },
        {
            content: 'Project home: {underline https://github.com/tjazak/pducli}'
        }
    ])
    console.log(usage);
    return;
}

var pdu;

if (options.ip) {
    pdu = new apcPdu({
        host: options.ip, // IP Address/Hostname
        community: 'private' // Optional community
    });
} else {
    console.log('IP is required see --help');
    return;
}

if (options.cycle && options.outlet) {
    pdu.getOutletPowerState(options.outlet, function (err, state) {
        if (err) {
            console.log(err.toString());
            return;
        }
        console.log('Outlet 1 is currently:', state == '1' ? 'On' : 'Off');

        if (state == '1') {
            pdu.setPowerState(options.outlet, false, function (err) {
                if (err) {
                    console.log(err.toString());
                    return;
                }
        
                console.log('Successfully turned off', options.outlet);
                console.log('Waiting 10 seconds');
        
                setTimeout(() => {
                    pdu.setPowerState(options.outlet, true, function (err) {
                        if (err) {
                            console.log(err.toString());
                            return;
                        }
                        console.log('Successfully turned on', options.outlet);
                    });
                }, 10000);
        
            });
        } else {
            pdu.setPowerState(options.outlet, true, function (err) {
                if (err) {
                    console.log(err.toString());
                    return;
                }
                console.log('Successfully turned on', options.outlet);
            });
        }
    });
    return;
} else if (typeof options.power !== 'undefined' && options.outlet) {
    var value = options.power === 1 ? true : false

    pdu.setPowerState(options.outlet, value, function (err) {
        if (err) {
            console.log(err.toString());
            return;
        }

        console.log('Outlet ' + options.outlet + ' successfully turned ' + (value ? 'On' : 'Off'));
    });
    return;
} else {
    console.log('No options provided to act on see --help');
}