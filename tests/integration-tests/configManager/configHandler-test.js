'use strict';

const configRequestCreator = require('./helpers/requestCreator');
const should = require('should');
const validationError = 'Input validation error';
const configValues = require('../../../src/common/consts').CONFIG;

const defaultBody = {
    allow_insecure_tls: false,
    internal_address: 'http://localhost:80',
    runner_docker_image: 'zooz/predator-runner:latest',
    job_platform: process.env.JOB_PLATFORM || 'DOCKER',
    runner_cpu: 1,
    runner_memory: 256,
    delay_runner_ms: 0,
    minimum_wait_for_delayed_report_status_update_in_ms: 30000
};
const updateBodyWithTypes = {
    influx_metrics: {
        host: 'string_value',
        username: 'string_value',
        password: 'string_value',
        database: 'string_value'
    },
    prometheus_metrics: {
        push_gateway_url: 'string_value',
        buckets_sizes: 'string_value'
    },
    smtp_server: {
        from: 'test@mail.com',
        host: 'string_value',
        port: 2,
        username: 'string_value',
        password: 'string_value',
        timeout: 2
    },
    runner_memory: 256
};

const requestBody =
    {
        allow_insecure_tls: false,
        grafana_url: 'string_value_grafana_url',
        internal_address: 'string_value_internal_address',
        runner_docker_image: 'string_value_docker_name',
        job_platform: 'string_value_job_platform',
        delay_runner_ms: 0,
        runner_cpu: 0,
        runner_memory: 256,
        metrics_plugin_name: 'prometheus',
        default_email_address: 'string_value_default_email_address',
        default_webhook_url: 'string_value_default_webhook_url',
        influx_metrics: {
            host: 'string_value_influx_metrics',
            username: 'string_value_username',
            password: 'string_value_password',
            database: 'string_value_database'
        },
        prometheus_metrics: {
            push_gateway_url: 'string_value_push_gateway_url',
            buckets_sizes: 'string_value_buckets_sizes'
        },
        smtp_server: {
            from: 'test@mail.com',
            host: 'string_value_smtp_server',
            port: 2,
            username: 'string_value_username',
            password: 'string_value',
            timeout: 2
        },
        minimum_wait_for_delayed_report_status_update_in_ms: 30000
    };
const requestBodyNotValidEnum = { metrics_plugin_name: 'not enum' };
const requestBodyNotValidType = { runner_cpu: 'not_int' };
const requestBodyNotValidRequire = {
    influx_metrics: {
        host: 'string_value',
        username: 'string_value'
    }
};

describe('update and get config', () => {
    before(async () => {
        await configRequestCreator.init();
    });

    after(async () => {
        await cleanData();
    });

    describe('get config ', () => {
        it('get default config', async () => {
            let response = await configRequestCreator.getConfig();
            should(response.statusCode).eql(200);
            delete response.body['smtp_server'];
            should(response.body).eql(defaultBody);
        });
    });

    describe('delete config ', () => {
        it('delete config when value in db', async () => {
            await configRequestCreator.updateConfig({ grafana_url: 'delete_value' });
            const deleteResponse = await configRequestCreator.deleteConfig('grafana_url');
            const getResponse = await configRequestCreator.getConfig();
            should(deleteResponse.statusCode).eql(204);
            should(getResponse.body['grafana_url']).eql(undefined);
        });
        it('delete config when value not in db', async () => {
            const deleteResponse = await configRequestCreator.deleteConfig('not_real_key');
            should(deleteResponse.statusCode).eql(204);
        });
    });

    describe('Update config with special types ', () => {
        it('get all config with special types', async () => {
            let response = await configRequestCreator.updateConfig(updateBodyWithTypes);
            should(response.statusCode).eql(200);
            should(response.body['influx_metrics'] instanceof Object);
            should(response.body['prometheus_metrics'] instanceof Object);
            should(response.body['smtp_server'] instanceof Object);
            should(response.body['smtp_server'] instanceof Number);
        });
    });
    describe('Update config and get config ', () => {
        it('update config success and get all values', async () => {
            const responseUpdate = await configRequestCreator.updateConfig(requestBody);
            const getResponse = await configRequestCreator.getConfig();
            should(responseUpdate.statusCode).eql(200);
            should(responseUpdate.body).eql(requestBody);
            should(getResponse.statusCode).eql(200);
            should(getResponse.body).eql(requestBody);
        });
    });

    describe('Update config validation', () => {
        it('update config fail with validation require fields', async () => {
            let response = await configRequestCreator.updateConfig(requestBodyNotValidRequire);
            should(response.statusCode).eql(400);
            should(response.body.message).eql(validationError);
        });
    });
    describe('Update config validation', () => {
        it('update config fail with validation enum', async () => {
            let response = await configRequestCreator.updateConfig(requestBodyNotValidEnum);
            should(response.statusCode).eql(400);
            should(response.body.message).eql(validationError);
        });
    });
    describe('Update config validation', () => {
        it('update config fail with validation type', async () => {
            let response = await configRequestCreator.updateConfig(requestBodyNotValidType);
            should(response.statusCode).eql(400);
            should(response.body.message).eql(validationError);
        });
    });

    describe('Update config with values below minimum', () => {
        it('params below minimum', async () => {
            let response = await configRequestCreator.updateConfig({
                runner_memory: 100,
                runner_cpu: -1,
                minimum_wait_for_delayed_report_status_update_in_ms: -1,
                delay_runner_ms: -1
            });
            should(response.statusCode).eql(400);
            should(response.body.message).eql(validationError);
            should(response.body.validation_errors).eql([
                'body/runner_cpu should be >= 0',
                'body/runner_memory should be >= 128',
                'body/minimum_wait_for_delayed_report_status_update_in_ms should be >= 0',
                'body/delay_runner_ms should be >= 0'
            ]);
        });
    });
});

async function cleanData() {
    const valuesToDelete = Object.values(configValues);
    for (let i = 0; i < valuesToDelete.length; i++) {
        await configRequestCreator.deleteConfig(valuesToDelete[i]);
    }
}
