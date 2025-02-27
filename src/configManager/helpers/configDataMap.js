const constConfig = require('../../common/consts').CONFIG;

let configDataMap = {
    [constConfig.GRFANA_URL]: { value: process.env.GRAFANA_URL },
    [constConfig.DELAY_RUNNER_MS]: { value: process.env.DELAY_RUNNER_MS || 0, type: 'int' },
    [constConfig.INTERNAL_ADDRESS]: { value: process.env.INTERNAL_ADDRESS },
    [constConfig.RUNNER_DOCKER_IMAGE]: { value: process.env.RUNNER_DOCKER_IMAGE || 'zooz/predator-runner:latest' },
    [constConfig.JOB_PLATFORM]: { value: process.env.JOB_PLATFORM },
    [constConfig.RUNNER_CPU]: { value: process.env.RUNNER_CPU || 1, type: 'float' },
    [constConfig.RUNNER_MEMORY]: { value: process.env.RUNNER_MEMORY || 256, type: 'int' },
    [constConfig.ALLOW_INSECURE_TLS]: { value: process.env.ALLOW_INSECURE_TLS || false, type: 'boolean' },
    [constConfig.MINIMUM_WAIT_FOR_DELAYED_REPORT_STATUS_UPDATE_IN_MS]: {
        value: process.env.MINIMUM_WAIT_FOR_DELAYED_REPORT_STATUS_UPDATE_IN_MS || 30000,
        type: 'int'
    },
    [constConfig.METRICS_PLUGIN_NAME]: { value: process.env.METRICS_PLUGIN_NAME, type: 'string' },
    [constConfig.PROMETHEUS_METRICS]: { value: process.env.METRICS_EXPORT_CONFIG, type: 'json' },
    [constConfig.INFLUX_METRICS]: { value: process.env.METRICS_EXPORT_CONFIG, type: 'json' },
    [constConfig.SMTP_SERVER]: {
        value: JSON.stringify({
            from: process.env.SMTP_FROM,
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            username: process.env.SMTP_USERNAME,
            password: process.env.SMTP_PASSWORD,
            timeout: process.env.SMTP_TIMEOUT || 200,
            secure: process.env.SMTP_SECURE || false,
            rejectUnauthCerts: process.env.SMTP_REJECT_UNAUTH_CERTS || false
        }),
        type: 'json'
    }
};

module.exports.getConstType = (configValue) => {
    return configDataMap[configValue] ? configDataMap[configValue].type : undefined;
};

module.exports.getConstDefaultValue = (configValue) => {
    return configDataMap[configValue] ? configDataMap[configValue].value : undefined;
};
